import { createServer } from 'node:http';
import { constants as fsConstants, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));
const ENV_PATH = join(ROOT_DIR, '.env');
const TOKEN_STORE_PATH = join(ROOT_DIR, '.jobber-tokens.json');
const REQUEST_MUTATION_PATH = join(ROOT_DIR, 'jobber', 'request-create.graphql');
const GRAPHQL_ENDPOINT = 'https://api.getjobber.com/api/graphql';
const TOKEN_ENDPOINT = 'https://api.getjobber.com/api/oauth/token';
const MAX_BODY_SIZE = 32 * 1024;
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.manifest': 'application/manifest+json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};
const PLAN_LABELS = Object.freeze({
  alpha: 'Alpha Turf Program',
  beta: 'Beta Turf Program',
  delta: 'Delta Turf Program'
});
const DEFAULT_REQUEST_MUTATION = `
mutation WebsiteRequestCreate($input: RequestCreateInput!) {
  requestCreate(input: $input) {
    request {
      id
      title
      createdAt
    }
    userErrors {
      message
      path
    }
  }
}
`.trim();

loadEnvFile(ENV_PATH);

const PORT = Number(process.env.PORT || 3000);

function loadEnvFile(pathToEnv) {
  if (!existsSync(pathToEnv)) {
    return;
  }

  const raw = readFileSync(pathToEnv, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

function loadTokenStore() {
  if (!existsSync(TOKEN_STORE_PATH)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(TOKEN_STORE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveTokenStore(nextState) {
  writeFileSync(TOKEN_STORE_PATH, JSON.stringify(nextState, null, 2));
}

function htmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sendHtml(response, statusCode, markup) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(markup);
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      throw new Error('Request body is too large.');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(payload));
}

function buildLeadDescription(payload) {
  const lines = [
    'Website lawn quote request',
    `Plan: ${payload.planLabel}`,
    `Name: ${payload.firstName} ${payload.lastName}`.trim(),
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Address: ${payload.street1}${payload.street2 ? `, ${payload.street2}` : ''}, ${payload.city}, ${payload.province} ${payload.postalCode}`,
    `Page: ${payload.page}`
  ];

  if (payload.details) {
    lines.push('', 'Property details:', payload.details);
  }

  return lines.join('\n');
}

function validatePayload(payload) {
  const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'planCode', 'street1', 'city', 'province', 'postalCode'];
  const missing = requiredFields.filter((field) => !String(payload[field] || '').trim());
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const normalizedPlan = String(payload.planCode).toLowerCase();
  if (!PLAN_LABELS[normalizedPlan]) {
    throw new Error('Selected plan is invalid.');
  }

  return {
    ...payload,
    planCode: normalizedPlan,
    planLabel: PLAN_LABELS[normalizedPlan]
  };
}

async function getRequestMutation() {
  try {
    await access(REQUEST_MUTATION_PATH, fsConstants.F_OK);
    const text = await readFile(REQUEST_MUTATION_PATH, 'utf8');
    return text.trim() || DEFAULT_REQUEST_MUTATION;
  } catch {
    return DEFAULT_REQUEST_MUTATION;
  }
}

function getStoredRefreshToken() {
  return loadTokenStore().refreshToken || process.env.JOBBER_REFRESH_TOKEN || '';
}

function getStoredAccessToken() {
  return loadTokenStore().accessToken || process.env.JOBBER_ACCESS_TOKEN || '';
}

async function refreshJobberTokens(refreshTokenOverride = '') {
  const clientId = process.env.JOBBER_CLIENT_ID;
  const clientSecret = process.env.JOBBER_CLIENT_SECRET;
  const refreshToken = refreshTokenOverride || getStoredRefreshToken();

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Jobber credentials. Set JOBBER_CLIENT_ID, JOBBER_CLIENT_SECRET, and JOBBER_REFRESH_TOKEN or connect through /api/jobber/callback.');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    throw new Error(tokenPayload.error_description || tokenPayload.error || 'Jobber token refresh failed.');
  }

  const nextState = {
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token || refreshToken,
    updatedAt: new Date().toISOString()
  };
  saveTokenStore(nextState);
  return nextState;
}

async function exchangeAuthorizationCode(code) {
  const clientId = process.env.JOBBER_CLIENT_ID;
  const clientSecret = process.env.JOBBER_CLIENT_SECRET;
  const redirectUri = process.env.JOBBER_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Jobber auth config. Set JOBBER_CLIENT_ID, JOBBER_CLIENT_SECRET, and JOBBER_REDIRECT_URI.');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri
  });

  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenPayload.access_token || !tokenPayload.refresh_token) {
    throw new Error(tokenPayload.error_description || tokenPayload.error || 'Jobber authorization code exchange failed.');
  }

  const nextState = {
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token,
    updatedAt: new Date().toISOString()
  };
  saveTokenStore(nextState);
  return nextState;
}

async function getJobberAccessToken() {
  const storedAccessToken = getStoredAccessToken();
  if (storedAccessToken) {
    return storedAccessToken;
  }

  const refreshed = await refreshJobberTokens();
  return refreshed.accessToken;
}

async function submitLeadToJobber(payload) {
  const mutation = await getRequestMutation();
  const accessToken = await getJobberAccessToken();
  const variables = {
    input: {
      title: `Website lawn quote - ${payload.planLabel}`,
      description: buildLeadDescription(payload),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      address: {
        street1: payload.street1,
        street2: payload.street2 || '',
        city: payload.city,
        province: payload.province,
        postalCode: payload.postalCode,
        country: payload.country || 'CA'
      }
    }
  };

  const apiVersion = process.env.JOBBER_GRAPHQL_VERSION || '2025-01-20';
  const graphqlResponse = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-JOBBER-GRAPHQL-VERSION': apiVersion
    },
    body: JSON.stringify({ query: mutation, variables })
  });

  const graphqlPayload = await graphqlResponse.json().catch(() => ({}));
  if (graphqlResponse.status === 401) {
    const refreshed = await refreshJobberTokens();
    const retryResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshed.accessToken}`,
        'Content-Type': 'application/json',
        'X-JOBBER-GRAPHQL-VERSION': apiVersion
      },
      body: JSON.stringify({ query: mutation, variables })
    });

    const retryPayload = await retryResponse.json().catch(() => ({}));
    if (!retryResponse.ok) {
      throw new Error(retryPayload.error || 'Jobber request submission failed after token refresh.');
    }
    if (Array.isArray(retryPayload.errors) && retryPayload.errors.length > 0) {
      throw new Error(retryPayload.errors.map((item) => item.message).join(' | '));
    }
    const retryResult = retryPayload.data?.requestCreate;
    const retryUserErrors = retryResult?.userErrors || [];
    if (retryUserErrors.length > 0) {
      throw new Error(retryUserErrors.map((item) => item.message).join(' | '));
    }
    return retryResult?.request || null;
  }

  if (!graphqlResponse.ok) {
    throw new Error(graphqlPayload.error || 'Jobber request submission failed.');
  }

  if (Array.isArray(graphqlPayload.errors) && graphqlPayload.errors.length > 0) {
    throw new Error(graphqlPayload.errors.map((item) => item.message).join(' | '));
  }

  const mutationResult = graphqlPayload.data?.requestCreate;
  const userErrors = mutationResult?.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((item) => item.message).join(' | '));
  }

  return mutationResult?.request || null;
}

async function handleLawnQuote(request, response) {
  try {
    const body = await readRequestBody(request);
    const parsed = JSON.parse(body || '{}');
    const payload = validatePayload(parsed);
    const result = await submitLeadToJobber(payload);

    sendJson(response, 200, {
      ok: true,
      message: 'Quote request sent. Green Wolf will follow up shortly.',
      jobberRequestId: result?.id || null
    });
  } catch (error) {
    sendJson(response, 400, {
      ok: false,
      error: error.message || 'Quote request failed.'
    });
  }
}

async function handleJobberCallback(url, response) {
  try {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      throw new Error(errorDescription || error);
    }

    if (!code) {
      throw new Error('Missing authorization code in callback URL.');
    }

    const tokens = await exchangeAuthorizationCode(code);
    sendHtml(
      response,
      200,
      `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Jobber Connected</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: Arial, sans-serif; background: #f5f7f2; color: #17321f; margin: 0; }
    main { max-width: 760px; margin: 4rem auto; padding: 2rem; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
    code { background: #f1f4ed; padding: 0.2rem 0.4rem; border-radius: 6px; }
  </style>
</head>
<body>
  <main>
    <h1>Jobber connected</h1>
    <p>Your access token and refresh token were saved to <code>.jobber-tokens.json</code>.</p>
    <p>Next step: open <code>/lawn.html</code> and submit a test quote.</p>
    <p>Token saved at: <strong>${htmlEscape(tokens.updatedAt)}</strong></p>
  </main>
</body>
</html>`
    );
  } catch (error) {
    sendHtml(
      response,
      400,
      `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Jobber Connection Error</title></head>
<body style="font-family:Arial,sans-serif;padding:2rem;color:#17321f;">
  <h1>Jobber connection failed</h1>
  <p>${htmlEscape(error.message || 'Unknown error')}</p>
</body>
</html>`
    );
  }
}

function serveConnectInstructions(response) {
  const clientId = process.env.JOBBER_CLIENT_ID || 'your_client_id';
  const redirectUri = process.env.JOBBER_REDIRECT_URI || 'https://your-domain.com/api/jobber/callback';
  const connectUrl = `https://api.getjobber.com/api/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=greenwolf-jobber`;
  sendHtml(
    response,
    200,
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Connect Jobber</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: Arial, sans-serif; background: #f5f7f2; color: #17321f; margin: 0; }
    main { max-width: 760px; margin: 4rem auto; padding: 2rem; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
    a { color: #0e5a2f; font-weight: 700; }
    code { word-break: break-all; background: #f1f4ed; padding: 0.2rem 0.4rem; border-radius: 6px; }
  </style>
</head>
<body>
  <main>
    <h1>Connect Jobber</h1>
    <p>Use the link below after you set <code>JOBBER_CLIENT_ID</code> and <code>JOBBER_REDIRECT_URI</code> in your <code>.env</code>.</p>
    <p><a href="${htmlEscape(connectUrl)}">Connect Jobber app</a></p>
    <p><code>${htmlEscape(connectUrl)}</code></p>
  </main>
</body>
</html>`
  );
}

async function serveStaticAsset(requestPath, response) {
  const safePath = requestPath === '/' ? '/index.html' : requestPath;
  const normalizedPath = normalize(safePath).replace(/^([.][.][\\/])+/, '');
  const absolutePath = resolve(ROOT_DIR, `.${normalizedPath}`);

  if (!absolutePath.startsWith(ROOT_DIR)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  try {
    const file = await readFile(absolutePath);
    const extension = extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(file);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'POST' && url.pathname === '/api/lawn-quote') {
    await handleLawnQuote(request, response);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/jobber/callback') {
    await handleJobberCallback(url, response);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/jobber/connect') {
    serveConnectInstructions(response);
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Method not allowed');
    return;
  }

  await serveStaticAsset(url.pathname, response);
});

server.listen(PORT, () => {
  console.log(`Green Wolf site running on http://localhost:${PORT}`);
});
