# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend

- Install dependencies: `cd backend && pnpm install`
- Run server: `cd backend && node server.js`
- Tests: No tests currently defined.

### Frontend

- Install dependencies: `cd frontend && pnpm install`
- Run development server: `cd frontend && pnpm dev`
- Build project: `cd frontend && pnpm build`
- Lint code: `cd frontend && pnpm lint`
- Preview production build: `cd frontend && pnpm preview`

## Architecture

### Backend (`/backend`)

The backend is a Node.js application using Express and MongoDB (via Mongoose). It follows a modular structure:

- `server.js`: Main entry point.
- `routes/`: Defines API endpoints and maps them to controllers.
- `controllers/`: Contains the request handling logic and orchestrates services.
- `models/`: Defines Mongoose schemas for MongoDB data structures.
- `middlewares/`: Contains custom middleware for tasks like authentication and validation.
- `services/`: Houses reusable business logic and external integrations.
- `utils/`: Shared helper functions.
- `config/`: Project configuration.

### Frontend (`/frontend`)

The frontend is a React application built with Vite and TypeScript.

- **Styling**: Uses Tailwind CSS.
- **Core Logic**: The application is housed in the `src/` directory.
- **Facial Recognition**: Utilizes `face-api.js` for biometric facial recognition and scanning.
- **Routing**: Uses `react-router-dom` for navigation.
