# Synapse AI Task Manager

A full-stack task management application with AI-powered features.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Zustand, TanStack Query
- **Backend:** Node.js, Express, TypeScript, Firebase Admin
- **Database:** MongoDB
- **Authentication:** Firebase

## Prerequisites

- Node.js (v18+)
- MongoDB instance
- Firebase Service Account Key

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/realSalman/Synapse-AI-Task-Manager.git
cd Synapse-AI-Task-Manager
```

### 2. Backend Configuration
Navigate to the `server` directory and create a `.env` file:
```bash
cd server
npm install
```
Add the following to `.env`:
- `PORT=5000`
- `MONGO_URI=<your-mongodb-uri>`
- `FIREBASE_SERVICE_ACCOUNT_PATH=<path-to-serviceAccountKey.json>`
- `OPENROUTER_API_KEY=<your-openrouter-key>`

### 3. Frontend Configuration
Navigate to the `client` directory and create a `.env.local` file:
```bash
cd ../client
npm install
```
Add the following to `.env.local`:
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_FIREBASE_API_KEY=`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=`
- `NEXT_PUBLIC_FIREBASE_APP_ID=`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=`

## Running the Application

### Start Backend
```bash
cd server
npm run dev
```

### Start Frontend
```bash
cd client
npm run dev
```

## Project Structure

### Frontend (`/client`)
- `app/`: Next.js App Router (pages and layouts)
- `components/`: Reusable UI components
- `store/`: Zustand state management
- `hooks/`: Custom React hooks
- `lib/`: API client (Axios) and utility functions
- `context/`: React context providers
- `modals/`: Global modal components

### Backend (`/server`)
- `src/routes/`: API endpoint definitions
- `src/controllers/`: Request handler logic
- `src/models/`: MongoDB/Mongoose schemas
- `src/middleware/`: Authentication and error handling
- `src/services/`: Business logic and external integrations (AI)
- `src/config/`: Database and Firebase Admin configuration
