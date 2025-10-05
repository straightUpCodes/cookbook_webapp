# Cookbook Webapp

A full-stack recipe management application that allows users to create, view, and update recipes in a simple, modern interface. Built with React (Vite + TypeScript) on the frontend and Node.js + MongoDB on the backend.

# Features

• Add, edit, and view recipes with details like ingredients, steps, and cook time.

• Interactive and responsive UI built with modular React components.

• MongoDB backend for persistent data storage.

• RESTful API with organized route handling and environment configuration.

• Real-time updates using React state management and controlled forms.

# Tech stack

Frontend | React (Vite + TypeScript), CSS Modules
Backend | Node.js, Express
Database | MongoDB
Tools | Git, npm, dotenv

# Setup Steps

1. npm install
2. cd backend npm install
3. In /backend/.env.development, define:
   MONGO_URI=your-mongodb-connection-string
   PORT=5001
   HOST=localhost
4. node server.js
5. npm run dev
