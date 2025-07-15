export interface DrugInteractionRequest {
  primary_drug: string;
  related_drugs: string[];
}

export interface DrugInteraction {
  drug: string;
  interactions: string[];
  has_interactions: boolean;
  message?: string;
}

export interface DrugInteractionSummary {
  total_drugs_checked: number;
  drugs_with_interactions: number;
}

export interface DrugInteractionResponse {
  primary_drug: string;
  interactions: DrugInteraction[];
  summary: DrugInteractionSummary;
}

export interface DrugInteractionError {
  error: string;
  interactions: DrugInteraction[];
}

export type DrugInteractionResult = DrugInteractionResponse | DrugInteractionError;

// Helper type to check if response is an error
export function isDrugInteractionError(
  response: DrugInteractionResult
): response is DrugInteractionError {
  return 'error' in response;
} 