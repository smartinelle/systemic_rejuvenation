# Web App (Pyodide)

This Next.js app runs the `aging_network` simulation **in the browser** using Pyodide (no backend).

## Running Locally

- From the repo root: `npm -C web run dev`
- If you’re already in `web/`: `npm run dev` (don’t use `-C web` or it will look for `web/web/package.json`)

## Model Source of Truth

The canonical model lives in `src/aging_network/`.

The web app executes a generated bundle under `web/public/py/aging_network/`, produced from `src/aging_network/` by:
- `npm run model:sync`
- `npm run model:check`

`npm run dev` and `npm run build` automatically run the sync step via `predev` / `prebuild`.
