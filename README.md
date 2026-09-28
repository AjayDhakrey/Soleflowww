# SoleFlow

SoleFlow is a Vite and React frontend with a separate Node.js API service.

## Project structure

- `frontend/` contains the React app, pages, shared components, styles, assets, and Vite configuration.
- `backend/` contains the Node API server.
- `scripts/` contains local development and cleanup helpers.

## Run locally

Install dependencies from the repository root:

```sh
npm install
```

Start the frontend and API together:

```sh
npm run dev
```

The frontend is available at `http://localhost:3000`. The API listens on port `4000`; its health endpoint is available through the Vite proxy at `http://localhost:3000/api/health`.

To run either service by itself, use `npm run dev:frontend` or `npm run dev:backend`.

## Build and type-check

```sh
npm run build
npm run lint
```

The frontend build is written to `frontend/dist/`.
