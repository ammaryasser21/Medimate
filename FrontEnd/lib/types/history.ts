export interface PrescriptionHistory {
  id: string;
  type: 'prescription';
  fileName: string;
  uploadedAt: string;
  results: {
    medicines: Array<{
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
    }>;
  };
}

export interface MedicalTestHistory {
  id: string;
  type: 'medical-test';
  fileName: string;
  uploadedAt: string;
  results: {
    tests: Array<{
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
    }>;
  };
}

export type HistoryItem = PrescriptionHistory | MedicalTestHistory;

export interface SavePrescriptionRequest {
  fileName: string;
  results: PrescriptionHistory['results'];
  userId: string;
}

export interface SaveMedicalTestRequest {
  fileName: string;
  results: MedicalTestHistory['results'];
  userId: string;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryItem[];
  message?: string;
}

export interface SaveResponse {
  success: boolean;
  data: HistoryItem;
  message?: string;
} 