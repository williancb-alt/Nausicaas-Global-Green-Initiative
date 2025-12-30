# Nausicaa's Global Green Initiative - Frontend

Frontend application for the grant management system. Built with React, TypeScript, and Vite.

## Tech Stack

- React 19
- React Router DOM
- Bootstrap
- Tailwind CSS
- TypeScript
- Vite
- Testing libraries (Vitest, Testing Library)
- Code quality tools (ESLint, Prettier)

## Running locally

### Option 1 - Using Docker Compose

From root directory within project

Ensure that Docker is running on the local machine, then run the below command

```
docker compose up --build
```

### Option 2 - Running manually

#### Pre-requisites

Ensure you have the following installed:

- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js)

#### Starting locally
Navigate to the frontend directory

```
cd frontend
```

Install dependencies

```
npm install
```

Start the Vite server

```
npm run dev
```

## Available Scripts

- **`npm run dev`** - Start the development server
- **`npm run build`** - Build the application for production (outputs to `dist/`)
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check for code quality issues
- **`npm run test`** - Run tests using Vitest
- **`npm run type-check`** - Run TypeScript type checking without emitting files
- **`npm run format`** - Format code using Prettier
