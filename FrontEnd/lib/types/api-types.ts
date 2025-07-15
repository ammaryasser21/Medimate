// API Request and Response Types for History Endpoints

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface SavePrescriptionRequest {
  fileName: string;
  results: {
    medicines: Medicine[];
  };
}

export interface SaveMedicalTestRequest {
  fileName: string;
  results: {
    tests: Test[];
  };
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SaveResponse extends ApiResponse<HistoryItem> {}

export interface HistoryResponse extends ApiResponse<HistoryItem[]> {
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface DeleteResponse extends ApiResponse {}

// ============================================================================
// DATA TYPES
// ============================================================================

export interface Medicine {
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

export interface Test {
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

export interface HistoryItem {
  id: string;
  type: "prescription" | "medical-test";
  fileName: string;
  uploadedAt: string;
  results: {
    medicines?: Medicine[];
    tests?: Test[];
  };
}

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

export interface HistoryQueryParams {
  type?: "prescription" | "medical-test";
  limit?: number;
  offset?: number;
}

export interface PrescriptionHistoryQueryParams {
  limit?: number;
  offset?: number;
}

export interface MedicalTestHistoryQueryParams {
  limit?: number;
  offset?: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export interface ValidationError extends ApiError {
  field?: string;
  value?: any;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface AuthHeaders {
  Authorization: string; // "Bearer <jwt_token>"
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// Example API calls:

// Save Prescription
const savePrescription = async (data: SavePrescriptionRequest): Promise<SaveResponse> => {
  const response = await fetch('/history/prescription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Get History
const getHistory = async (params?: HistoryQueryParams): Promise<HistoryResponse> => {
  const queryString = params ? new URLSearchParams(params as any).toString() : '';
  const response = await fetch(`/history?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Delete History Item
const deleteHistoryItem = async (id: string): Promise<DeleteResponse> => {
  const response = await fetch(`/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
*/ 