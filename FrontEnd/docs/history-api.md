# History API Documentation

This document describes the History API endpoints for managing user's prescription and medical test history.

## Base URL
```
http://localhost:5000
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Save Prescription to History

**Endpoint:** `POST /history/prescription`

**Description:** Saves a prescription analysis result to the user's history.

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

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "prescription",
    "fileName": "prescription_2024_01_15.jpg",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
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
  },
  "message": "Prescription saved successfully"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Unauthorized - Please log in to save prescriptions",
  "message": "Authentication required"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Invalid request data",
  "message": "fileName and results are required"
}
```

---

### 2. Save Medical Test to History

**Endpoint:** `POST /history/medical-test`

**Description:** Saves a medical test analysis result to the user's history.

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
      },
      {
        "name": "White Blood Cells",
        "value": 7500,
        "unit": "cells/mcL",
        "normalRange": {
          "min": 4000,
          "max": 11000
        },
        "critical": false,
        "trend": "up",
        "percentile": 60,
        "lastUpdated": "2024-01-15T10:30:00.000Z",
        "category": "Blood Count",
        "interpretation": "Slightly elevated WBC count, may indicate mild infection"
      }
    ]
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "type": "medical-test",
    "fileName": "blood_test_2024_01_15.pdf",
    "uploadedAt": "2024-01-15T10:30:00.000Z",
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
  },
  "message": "Medical test saved successfully"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Unauthorized - Please log in to save medical tests",
  "message": "Authentication required"
}
```

---

### 3. Get All History

**Endpoint:** `GET /history`

**Description:** Retrieves all history items for the authenticated user.

**Query Parameters:**
- `type` (optional): Filter by type (`prescription` or `medical-test`)
- `limit` (optional): Number of items to return (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

**Example Request:**
```
GET /history?type=prescription&limit=10&offset=0
```

**Response (Success - 200):**
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
    },
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
  "message": "History retrieved successfully",
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

---

### 4. Get Prescription History

**Endpoint:** `GET /history/prescription`

**Description:** Retrieves only prescription history items for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

**Response (Success - 200):**
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
        "medicines": [
          {
            "id": 1,
            "name": "Amoxicillin",
            "confidence": 0.95,
            "possibleMatches": ["Amoxicillin", "Amoxil"],
            "dosage": "500mg",
            "frequency": "3 times daily",
            "duration": "7 days",
            "instructions": [...],
            "warnings": [...],
            "category": "Antibiotic",
            "timeOfDay": "multiple",
            "withFood": true,
            "withWater": true
          }
        ]
      }
    }
  ],
  "message": "Prescription history retrieved successfully"
}
```

---

### 5. Get Medical Test History

**Endpoint:** `GET /history/medical-test`

**Description:** Retrieves only medical test history items for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

**Response (Success - 200):**
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
  ],
  "message": "Medical test history retrieved successfully"
}
```

---

### 6. Delete History Item

**Endpoint:** `DELETE /history/:id`

**Description:** Deletes a specific history item by ID.

**URL Parameters:**
- `id`: The ID of the history item to delete

**Example Request:**
```
DELETE /history/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "History item deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "History item not found",
  "message": "The specified history item does not exist"
}
```

**Response (Error - 403):**
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You can only delete your own history items"
}
```

---

## Data Types

### Prescription Medicine Object
```typescript
interface Medicine {
  id: number;
  name: string;
  confidence: number;
  possibleMatches: string[];
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string[];
  warnings?: string[];
  category?: string;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night" | "multiple";
  withFood?: boolean;
  withWater?: boolean;
}
```

### Medical Test Object
```typescript
interface Test {
  name: string;
  value: number;
  unit: string;
  normalRange: {
    min: number;
    max: number;
  };
  critical: boolean;
  trend?: string;
  percentile?: number;
  lastUpdated?: string;
  category?: string;
  interpretation?: string;
}
```

### History Item Object
```typescript
interface HistoryItem {
  id: string;
  type: "prescription" | "medical-test";
  fileName: string;
  uploadedAt: string;
  results: {
    medicines?: Medicine[];
    tests?: Test[];
  };
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Rate Limiting

- **Save operations**: 10 requests per minute per user
- **Get operations**: 100 requests per minute per user
- **Delete operations**: 20 requests per minute per user

## Notes

1. **Authentication**: All endpoints require a valid JWT token in the Authorization header
2. **User Isolation**: Users can only access and modify their own history items
3. **Data Validation**: All input data is validated on the server side
4. **File Names**: File names are preserved as provided by the client
5. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
6. **No Image Storage**: Image URLs are not stored in history - only analysis results are saved 