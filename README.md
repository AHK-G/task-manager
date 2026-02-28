# Task Manager (Full-Stack)

A full-stack task management application built with **React, Node.js, and MongoDB**.

It includes authentication, drag-and-drop reordering, smart due-date prioritization, backend test coverage, CI pipeline, and production deployment.

---

## Live Demo

- **Frontend:**  
  https://task-manager-nu-snowy.vercel.app/

- **Backend API:**  
  https://task-manager-api-k63u.onrender.com/

---

##  Demo Account

Email: `demo@demo.com`  
Password: `demo123`

---

# Features

## Authentication
- Register & Login with JWT
- Protected routes
- Secure password hashing (bcrypt)
- Persistent login via localStorage

---

## Task Management
- Create, edit, delete tasks
- Mark tasks as completed
- Drag & drop reordering (persisted in database)
- Optional priority (Low / Medium / High)
- Optional due date
- Inline title editing

---

## Smart Logic
- Tasks due within 3 days automatically appear under **Urgent**
- Completed tasks separated
- Backend validation prevents invalid priority injection
- Order persistence via `/tasks/reorder` endpoint

---

## UX Enhancements
- Fully responsive (mobile + desktop)
- Loading states for all async actions
- Toast notifications for user feedback
- Clean glassmorphism UI design

---

# Tech Stack

## Frontend
- React (Vite)
- TypeScript
- TailwindCSS
- Axios
- DnD Kit (drag & drop)
- React Hot Toast

---

## Backend
- Node.js
- Express
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Bcrypt

---

## Testing
- Jest
- Supertest
- MongoDB Memory Server
- ~88% backend test coverage

---

## CI
- GitHub Actions (automated test pipeline)

---

## Deployment
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

# Running Locally

##  Clone Repository

```bash
git clone https://github.com/AHK-G/task-manager.git
cd task-manager
```

---

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Running Backend Tests

```bash
npm test
```

Includes:
- Auth route tests
- Task CRUD tests
- Validation tests
- Unauthorized access tests
- Integration tests using MongoDB Memory Server

---

## Screenshots

### Dashboard (Drag & Drop + Sections)

<p align="center">
  <img src="https://github.com/user-attachments/assets/9597d017-317c-45a9-8203-d726c18a688a" width="950" />
</p>

---

### Authentication

<p align="center">
  <img src="https://github.com/user-attachments/assets/52c3695f-0d93-4705-a1ab-23b38ca65b37" width="950" />
</p>

---

### Mobile View

<p align="center">
  <img src="https://github.com/user-attachments/assets/92c0d120-d6f8-42b3-a9bd-a24fc7e9d730" width="400" />
</p>

