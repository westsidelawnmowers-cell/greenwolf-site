# Jobber Direct API Setup

## What this does

- Replaces the embedded Jobber iframe on `lawn.html` with your own quote form.
- Sends the selected Alpha, Beta, or Delta plan to `/api/lawn-quote`.
- Connects your Jobber app through OAuth at `/api/jobber/connect` and `/api/jobber/callback`.
- Stores tokens in `.jobber-tokens.json` so refresh token rotation keeps working.
- Sends the lead into Jobber through GraphQL.

## 1. Create Jobber API credentials

Create a custom integration in Jobber's Developer Center and get:

- `JOBBER_CLIENT_ID`
- `JOBBER_CLIENT_SECRET`

Official docs:

- https://developer.getjobber.com/docs/getting_started/
- https://developer.getjobber.com/docs/building_your_app/app_authorization/
- https://developer.getjobber.com/docs/building_your_app/refresh_token_rotation/
- https://developer.getjobber.com/docs/custom_integrations/

## 2. Add your environment file

Copy `.env.example` to `.env` and fill in:

- `JOBBER_CLIENT_ID`
- `JOBBER_CLIENT_SECRET`
- `JOBBER_REDIRECT_URI`

`JOBBER_REDIRECT_URI` must exactly match the callback URL saved in Jobber Developer Center.
Example:

```bash
JOBBER_REDIRECT_URI=https://your-domain.com/api/jobber/callback
```

## 3. Start the site with Node

```bash
node server.mjs
```

## 4. Connect the Jobber app

Open:

```text
https://your-domain.com/api/jobber/connect
```

That page generates the correct Jobber OAuth authorization link. After you approve access in Jobber, Jobber sends you back to:

```text
https://your-domain.com/api/jobber/callback
```

The server exchanges the authorization code and saves tokens into `.jobber-tokens.json`.

## 5. Test the form

Open:

```text
https://your-domain.com/lawn.html
```

Pick Alpha, Beta, or Delta and submit a test request.

## 6. Verify the Jobber mutation against your account

The default GraphQL mutation is stored in `jobber/request-create.graphql`.
If Jobber returns a schema or field error, adjust that file to match the exact request creation mutation available in your Jobber account.

## Important

Keep the Jobber secret and tokens on the server only. Do not put them in client-side JavaScript.
