# Task Manager API

Live API:
https://task-manager-api-k63u.onrender.com

## Demo Account

Email: demo@test.com  
Password: password123

## Features
- JWT Authentication
- Protected routes
- MongoDB Atlas integration
- Fully tested with Jest
- Deployed on Render


## API Usage

### Register
POST /auth/register

### Login
POST /auth/login

### Get Tasks (Protected)
GET /tasks
Authorization: Bearer <token>
