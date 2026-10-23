# Isal.in Multi-Converter

A private, client-side React and TypeScript web app for converting files, data, units, and common calculations in the browser.

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
```

Conversions run locally whenever browser capabilities allow it; files are not uploaded by the application.

## Google AdSense

AdSense approval is required before ads can generate revenue. After approval, create a responsive display ad unit and configure these environment variables in your hosting provider (never commit them to Git):

```text
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT=XXXXXXXXXX
```

Add the same values to a local `.env.local` file when testing. The AdSense script is loaded globally, while ad slots render only when both values are present. Use the exact publisher and slot IDs from AdSense; do not use guessed or test IDs in production.
