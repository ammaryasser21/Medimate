# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication Endpoints

### 1. Register User
**POST** `/register`

Creates a new user account.

**Request Body:**
```json
{
  "username": "string (min 3 characters)",
  "email": "string (valid email format)",
  "gender": "Male" | "Female",
  "password": "string (min 8 characters, must contain uppercase letter and number)"
}
```

**Example Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "gender": "Male",
  "password": "Password123"
}
```

**Response (201 Created):**
```json
{
  "Status": "Success",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "gender": "Male",
      "profileImage": "Male.jpeg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "Role": "User"
    }
  }
}
```

**Validation Rules:**
- Username: Minimum 3 characters
- Email: Must be valid email format and unique
- Gender: Must be "Male" or "Female"
- Password: Minimum 8 characters, must contain at least one uppercase letter and one number

**Error Responses:**
- `400`: Email already exists, invalid gender, or password requirements not met
- `400`: Password should be at least 8 characters

---

### 2. Login User
**POST** `/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Example Request:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "Status": "Success",
  "Data": {
    "id": "user_id",
    "token": "jwt_token_here",
    "expirationDate": "2024-01-02T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Email or password fields missing
- `404`: Email or password incorrect

---

## User Management Endpoints

*Note: All user endpoints require authentication via JWT token in the Authorization header:*
```
Authorization: Bearer <jwt_token>
```

### 3. Get All Users
**GET** `/users`

Retrieves all users (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "Status": "Success",
  "Data": [
    {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "gender": "Male",
      "profileImage": "Male.jpeg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "Role": "User"
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)

---

### 4. Get User by ID
**GET** `/users/:id`

Retrieves a specific user by their ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "Status": "Success",
  "Data": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "gender": "Male",
    "profileImage": "Male.jpeg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "Role": "User"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found

---

### 5. Update User Profile
**PATCH** `/users/:id`

Updates user profile information (username, email, bio).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "bio": "string (optional)"
}
```

**Example Request:**
```json
{
  "username": "john_updated",
  "email": "john.updated@example.com",
  "bio": "This is my bio"
}
```

**Response (200 OK):**
```json
{
  "Status": "Success",
  "Data": {
    "_id": "user_id",
    "username": "john_updated",
    "email": "john.updated@example.com",
    "gender": "Male",
    "profileImage": "Male.jpeg",
    "bio": "This is my bio",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "Role": "User"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `403`: You can't update this profile (not the profile owner)
- `404`: User not found

---

### 6. Update Profile Image
**PUT** `/users/:id`

Updates user's profile image.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
Form Data:
- profileImage: image file (jpeg, png, gif, etc.)
```

**Response (200 OK):**
```json
{
  "Status": "Success",
  "Data": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "gender": "Male",
    "profileImage": "user-1739385891077.jpeg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "Role": "User"
  }
}
```

**Error Responses:**
- `400`: Please upload image
- `401`: Unauthorized (missing or invalid token)
- `403`: You can't update this profile (not the profile owner)
- `404`: User not found

---

### 7. Change Password
**PUT** `/users/changepassword/:id`

Changes user's password.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "CurrentPassword": "string",
  "NewPassword": "string (min 8 characters, must contain uppercase letter and number)",
  "ConfirmPassword": "string"
}
```

**Example Request:**
```json
{
  "CurrentPassword": "Password123",
  "NewPassword": "NewPassword456",
  "ConfirmPassword": "NewPassword456"
}
```

**Response (200 OK):**
```json
{
  "Status": "Success",
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400`: Please fill all fields
- `400`: Current password is incorrect
- `400`: New password and Confirm password don't match
- `401`: Unauthorized (missing or invalid token)
- `403`: You can't update this profile (not the profile owner)
- `404`: User not found

---

### 8. Delete User
**DELETE** `/users/:id`

Deletes a user account (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "Status": "Success",
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (not an admin)
- `404`: User not found

---

## History Management Endpoints

*Note: All history endpoints require authentication via JWT token in the Authorization header:*
```
Authorization: Bearer <jwt_token>
```

### 9. Save Prescription to History
**POST** `/history/prescription`

Saves a prescription analysis result to the user's history.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "fileName": "prescription_2024_01_15.jpg",
  "results": {
    "medicines": [
      {
        "id": 1,
        "name": "Amoxicillin",
        "confidence": 0.95,
        "possibleMatches": ["Amoxicillin", "Amoxil"],
        "dosage": "500mg",
        "frequency": "3 times daily",
        "duration": "7 days",
        "instructions": [
          "Take with food to reduce stomach upset",
          "Complete the full course even if you feel better"
        ],
        "warnings": [
          "May cause diarrhea",
          "Avoid alcohol consumption"
        ],
        "category": "Antibiotic",
        "timeOfDay": "multiple",
        "withFood": true,
        "withWater": true
      }
    ]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "prescription",
    "fileName": "prescription_2024_01_15.jpg",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "results": {
      "medicines": [...]
    }
  },
  "message": "Prescription saved successfully"
}
```

**Error Responses:**
- `400`: fileName and results are required
- `401`: Unauthorized (missing or invalid token)

---

### 10. Save Medical Test to History
**POST** `/history/medical-test`

Saves a medical test analysis result to the user's history.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "fileName": "blood_test_2024_01_15.pdf",
  "results": {
    "tests": [
      {
        "name": "Hemoglobin",
        "value": 14.5,
        "unit": "g/dL",
        "normalRange": {
          "min": 12,
          "max": 15
        },
        "critical": false,
        "trend": "stable",
        "percentile": 75,
        "lastUpdated": "2024-01-15T10:30:00.000Z",
        "category": "Blood Count",
        "interpretation": "Normal hemoglobin levels indicating good oxygen-carrying capacity"
      }
    ]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "type": "medical-test",
    "fileName": "blood_test_2024_01_15.pdf",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "results": {
      "tests": [...]
    }
  },
  "message": "Medical test saved successfully"
}
```

**Error Responses:**
- `400`: fileName and results are required
- `401`: Unauthorized (missing or invalid token)

---

### 11. Get All History
**GET** `/history`

Retrieves all history items for the authenticated user with pagination and filtering.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `type` (optional): Filter by type (`prescription` or `medical-test`)
- `limit` (optional): Number of items to return (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

**Example Request:**
```
GET /history?type=prescription&limit=10&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "prescription",
      "fileName": "prescription_2024_01_15.jpg",
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "results": {
        "medicines": [...]
      }
    }
  ],
  "message": "History retrieved successfully",
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)

---

### 12. Get Prescription History
**GET** `/history/prescription`

Retrieves only prescription history items for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "prescription",
      "fileName": "prescription_2024_01_15.jpg",
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "results": {
        "medicines": [...]
      }
    }
  ],
  "message": "Prescription history retrieved successfully",
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)

---

### 13. Get Medical Test History
**GET** `/history/medical-test`

Retrieves only medical test history items for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "type": "medical-test",
      "fileName": "blood_test_2024_01_15.pdf",
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "results": {
        "tests": [...]
      }
    }
  ],
  "message": "Medical test history retrieved successfully",
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)

---

### 14. Delete History Item
**DELETE** `/history/:id`

Deletes a specific history item by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: The ID of the history item to delete

**Example Request:**
```
DELETE /history/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "History item deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `403`: You can only delete your own history items
- `404`: History item not found

---

## Error Response Format

All error responses follow this format:
```json
{
  "Status": "Failed",
  "message": "Error description"
}
```

## Authentication

### JWT Token
- **Algorithm**: HS256
- **Expiration**: 1 day
- **Payload**: Contains `userId`, `email`, and `Role`

### Token Usage
Include the JWT token in the Authorization header for protected endpoints:
```
Authorization: Bearer <your_jwt_token>
```

## File Upload

### Profile Images
- **Supported formats**: JPEG, PNG, GIF, and other image formats
- **Storage**: Files are stored in the `uploads/` directory
- **Naming**: Files are renamed to `user-{timestamp}.{extension}`
- **Access**: Images can be accessed via `/uploads/{filename}`

## User Roles

- **User**: Default role for registered users
- **Admin**: Administrative role with additional permissions (e.g., delete users)

## Data Models

### User Schema
```javascript
{
  username: String (required, min 3 chars),
  email: String (required, unique, valid email),
  gender: String (required, "Male" | "Female"),
  password: String (required, min 8 chars, uppercase + number),
  profileImage: String (default: gender-based default image),
  createdAt: Date (auto-generated),
  Role: String (enum: "User" | "Admin", default: "User")
}
```

### History Schema
```javascript
{
  userId: ObjectId (ref: 'User', required),
  type: String (enum: 'prescription' | 'medical-test', required),
  fileName: String (required),
  uploadedAt: Date (auto-generated),
  results: {
    medicines: [MedicineSchema],
    tests: [TestSchema]
  }
}
```

### Medicine Schema
```javascript
{
  id: Number (required),
  name: String (required),
  confidence: Number (required, 0-1),
  possibleMatches: [String],
  dosage: String,
  frequency: String,
  duration: String,
  instructions: [String],
  warnings: [String],
  category: String,
  timeOfDay: String (enum: "morning" | "afternoon" | "evening" | "night" | "multiple"),
  withFood: Boolean,
  withWater: Boolean
}
```

### Test Schema
```javascript
{
  name: String (required),
  value: Number (required),
  unit: String (required),
  normalRange: {
    min: Number,
    max: Number
  },
  critical: Boolean (default: false),
  trend: String,
  percentile: Number,
  lastUpdated: Date,
  category: String,
  interpretation: String
}
```

## Environment Variables

Required environment variables:
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (default: 3000) 