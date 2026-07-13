# Green Wolf Site

## Structure

- This is a dependency-free static site. Public routes use directory pages such as `snow/index.html`; root-level `.html` files with the same names are redirect or compatibility pages, so make content changes in the directory page unless the root file also needs redirect metadata updated.
- Shared presentation lives in `style.css` and `theme-overrides.css`; homepage-only overrides live in `homepage-overrides.css`. Shared navigation, analytics, UI behavior, and form submission logic live in `script.js`.
- Keep root-relative asset and route URLs (for example `/script.js` and `/thank-you`) because pages are served from nested directories.

## Forms and verification

- Service forms are coupled to `script.js` through their IDs and `data-*` attributes. Preserve the form key, endpoint, contact requirements, hidden spam field, status element, and named iframe when changing a form.
- `snow/google-apps-script-handler.gs` is the server-side reference for accepted lead fields, spreadsheet rows, email delivery, and iframe responses. Coordinate field or response-contract changes with both the page and handler.
- There is no repository build, test, or lint command. Manually check the edited route at desktop and mobile widths, navigation and root-relative assets, CTA analytics hooks, required/contact validation, package or add-on selection where present, successful form status, and the `/thank-you` redirect.
