import { useState, useCallback } from 'react';
import { 
  DrugInteractionRequest, 
  DrugInteractionResult, 
  DrugInteractionResponse,
  isDrugInteractionError 
} from '@/lib/types/drug-interaction';
import { DrugInteractionAPI } from '@/lib/api/drug-interaction';
import { AlertService } from '@/lib/alerts';

interface UseDrugInteractionsReturn {
  // State
  isLoading: boolean;
  result: DrugInteractionResponse | null;
  error: string | null;
  relatedDrugs: string[];
  
  // Actions
  checkInteractions: (request: DrugInteractionRequest) => Promise<void>;
  clearResults: () => void;
  addRelatedDrug: (drug: string) => void;
  removeRelatedDrug: (index: number) => void;
  updatePrimaryDrug: (drug: string) => void;
  
  // Computed values
  hasInteractions: boolean;
  totalDrugsChecked: number;
  drugsWithInteractions: number;
}

export function useDrugInteractions(): UseDrugInteractionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DrugInteractionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [primaryDrug, setPrimaryDrug] = useState('');
  const [relatedDrugs, setRelatedDrugs] = useState<string[]>([]);

  const checkInteractions = useCallback(async (request: DrugInteractionRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate request
      const validationErrors = DrugInteractionAPI.validateRequest(request);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const response = await DrugInteractionAPI.checkDrugInteractions(request);

      if (isDrugInteractionError(response)) {
        setError(response.error);
        AlertService.error(response.error);
      } else {
        setResult(response);
        
        // Show success message with summary
        const { summary } = response;
        if (summary.drugs_with_interactions > 0) {
          AlertService.warning(
            `Found ${summary.drugs_with_interactions} drug interaction(s) out of ${summary.total_drugs_checked} drugs checked.`,
            { title: 'Drug Interactions Found' }
          );
        } else {
          AlertService.success(
            `No drug interactions found among ${summary.total_drugs_checked} drugs checked.`,
            { title: 'No Interactions Found' }
          );
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      AlertService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setPrimaryDrug('');
    setRelatedDrugs([]);
  }, []);

  const addRelatedDrug = useCallback((drug: string) => {
    if (drug.trim() && !relatedDrugs.includes(drug.trim())) {
      setRelatedDrugs(prev => [...prev, drug.trim()]);
    }
  }, [relatedDrugs]);

  const removeRelatedDrug = useCallback((index: number) => {
    setRelatedDrugs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updatePrimaryDrug = useCallback((drug: string) => {
    setPrimaryDrug(drug);
  }, []);
  // Computed values
  const hasInteractions = (result?.summary.drugs_with_interactions ?? 0) > 0;
  const totalDrugsChecked = result?.summary.total_drugs_checked ?? 0;
  const drugsWithInteractions = result?.summary.drugs_with_interactions ?? 0;

  return {
    isLoading,
    result,
    error,
    relatedDrugs,
    checkInteractions,
    clearResults,
    addRelatedDrug,
    removeRelatedDrug,
    updatePrimaryDrug,
    hasInteractions,
    totalDrugsChecked,
    drugsWithInteractions,
  };
} 