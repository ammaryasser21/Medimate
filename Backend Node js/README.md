# MediMate Backend

A Node.js/Express backend for user authentication, profile management, and medical history tracking (prescriptions and medical tests).

## Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Models](#models)
- [Error Handling](#error-handling)
- [File Uploads](#file-uploads)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User registration and login with JWT authentication
- User profile management (update info, change password, upload profile image)
- Admin user management (delete users)
- Save and retrieve prescription and medical test history
- Secure password hashing and validation
- File upload for profile images
- Role-based access control

---

## Folder Structure

```
backend/
  controllers/      # Route handler logic
  ErrorWrapper/     # Async error handling utilities
  middleware/       # Authentication and other middleware
  models/           # Mongoose schemas
  routes/           # Express route definitions
  uploads/          # Uploaded profile images
  utilitis/         # Utility functions and error classes
  index.js          # Entry point
  package.json      # Dependencies and scripts
  API_DOCUMENTATION.md # Full API reference
```

---

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file in the root directory with the following:
   ```
   MONGO_URL=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   PORT=3000
   ```

---

## Running the Server

- **Development mode (with nodemon):**
  ```bash
  npm run run:dev
  ```
- The server will start on `http://localhost:3000` by default.

---

## API Overview

See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for full details and example requests/responses.

### Main Endpoints

- **Auth:** `/api/register`, `/api/login`
- **Users:** `/api/users`, `/api/users/:id`, `/api/users/changepassword/:id`
- **History:** `/api/history`, `/api/history/prescription`, `/api/history/medical-test`

All protected endpoints require a JWT token in the `Authorization` header.

---

## Authentication

- Uses JWT (HS256, 1 day expiry).
- Token payload includes `userId`, `email`, and `Role`.
- Add `Authorization: Bearer <token>` to protected requests.

---

## Models

### User

- `username` (min 3 chars)
- `email` (unique, valid)
- `gender` ("Male" or "Female")
- `password` (min 8 chars, 1 uppercase, 1 number)
- `profileImage` (default based on gender)
- `Role` ("User" or "Admin")

### History

- `userId` (ref: User)
- `type` ("prescription" or "medical-test")
- `fileName`
- `uploadedAt`
- `results` (medicines/tests details)

---

## Error Handling

- All errors return JSON:
  ```json
  {
    "Status": "Failed",
    "message": "Error description"
  }
  ```

---

## File Uploads

- Profile images are uploaded via `/users/:id` (PUT, multipart/form-data).
- Stored in the `uploads/` directory.
- Access via `/uploads/{filename}`.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the ISC License. 