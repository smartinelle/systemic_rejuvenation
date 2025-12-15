# Change: Add Interactive Web Frontend

## Why
Researchers and longevity enthusiasts need an accessible way to explore the aging model without running Python code locally. A web interface enables parameter exploration, visualization, and model discovery for a technical audience, serving as both a demo and educational tool.

## What Changes
- Add Next.js web application with React UI
- Integrate Python simulation engine via Pyodide (WebAssembly)
- Create interactive parameter controls for all intervention types
- Implement real-time visualization of trajectories and metrics
- Add explanatory content for model assumptions and equations
- Enable local development with Vercel deployment support

## Impact
- Affected specs: `web-interface` (new capability)
- Affected code:
  - New: `web/` directory with Next.js application
  - New: `web/public/py/` containing Python package files for Pyodide
  - Existing: Python package remains unchanged (used as-is by Pyodide)
- Dependencies: Node.js, Next.js, React, Pyodide, Plotly.js
- Deployment: Vercel-ready static export
