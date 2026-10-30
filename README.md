# Careflow Appointment Tracker

A responsive healthcare appointment dashboard built with React, TypeScript, Vite, and Tailwind CSS. Add, edit, cancel, delete, view, search, and filter appointments; records are saved in the browser's local storage.

The dashboard includes responsive navigation and overview cards for total, upcoming, completed, and cancelled appointments, with distinct status badges and search/status filters. The sidebar account menu opens profile details and notification preferences; appointment reminder preferences are saved in local storage.

## Requirements

- Node.js 18 or newer
- npm

## Setup

```bash
npm ci
```

## Run locally

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Appointment changes are saved in this browser's local storage under `careflow-appointments`, so they remain available after a refresh in the same browser.

## Production build

Create and serve a local production build:

```bash
npm run build
npm run preview
```

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check the app and create a production build |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Run the Vitest suite once |
| `npm run test:coverage` | Run tests and generate text and HTML coverage reports in `coverage/` |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run ESLint |

## Project structure

```text
src/
  components/       Reusable dashboard, appointment list, details, and form components
  test/             Shared Vitest setup
  types/            Appointment domain types
  utils/            Local-storage and appointment helpers
  App.tsx           Dashboard state and page composition
  index.css         Tailwind directives and shared styles
  main.tsx          React entry point
```

The first visit starts with a small set of sample appointments. Changes are stored under `careflow-appointments` in local storage and remain in this browser. New appointments require patient and doctor names, a specialization, a future or current date, a valid time, and a reason. Existing records from the previous appointment field format are migrated when loaded.

## Verify the application

The build command includes the TypeScript project check. Tests use Vitest, jsdom, and React Testing Library; they cover appointment validation, creation, editing, cancellation, deletion, search, filtering, local-storage persistence, and the dashboard UI. Run the tests once with:

```bash
npm run test
```

Generate a text summary and HTML coverage report with:

```bash
npm run test:coverage
```
