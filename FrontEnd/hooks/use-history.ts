import { useState, useCallback, useEffect } from 'react';
import { 
  HistoryItem, 
  SavePrescriptionRequest, 
  SaveMedicalTestRequest 
} from '@/lib/types/history';
import { HistoryAPI } from '@/lib/api/history';
import { AlertService } from '@/lib/alerts';
import { useAuth } from '@/lib/auth';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, getUserId } = useAuth();

  // Load history on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && getUserId()) {
      loadHistory();
    }
  }, [isAuthenticated, getUserId]);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const userId = getUserId();
    if (!userId) {
      AlertService.error('User ID not found. Please log in again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await HistoryAPI.getHistory();
      console.log('History data:', data);
      setHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);
      AlertService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getUserId]);

  const savePrescription = useCallback(async (request: Omit<SavePrescriptionRequest, 'userId'>) => {
    if (!isAuthenticated) {
      AlertService.error('Please log in to save prescriptions to your history');
      return false;
    }

    const userId = getUserId();
    if (!userId) {
      AlertService.error('User ID not found. Please log in again to use save features');
      return false;
    }

    if (!user?.email) {
      AlertService.error('User profile not found. Please log in again to use save features');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullRequest: SavePrescriptionRequest = { ...request, userId };
      const response = await HistoryAPI.savePrescription(fullRequest);
      setHistory(prev => [response.data, ...prev]);
      AlertService.success('Prescription saved to history');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prescription';
      setError(errorMessage);
      AlertService.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getUserId, user?.email]);

  const saveMedicalTest = useCallback(async (request: Omit<SaveMedicalTestRequest, 'userId'>) => {
    if (!isAuthenticated) {
      AlertService.error('Please log in to save medical tests to your history');
      return false;
    }

    const userId = getUserId();
    if (!userId) {
      AlertService.error('User ID not found. Please log in again to use save features');
      return false;
    }

    if (!user?.email) {
      AlertService.error('User profile not found. Please log in again to use save features');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fullRequest: SaveMedicalTestRequest = { ...request, userId };
      const response = await HistoryAPI.saveMedicalTest(fullRequest);
      setHistory(prev => [response.data, ...prev]);
      AlertService.success('Medical test saved to history');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save medical test';
      setError(errorMessage);
      AlertService.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getUserId, user?.email]);

  const deleteHistoryItem = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      AlertService.error('Please log in to manage your history');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      AlertService.error('User ID not found. Please log in again to manage your history');
      return;
    }

    if (!user?.email) {
      AlertService.error('User profile not found. Please log in again to manage your history');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await HistoryAPI.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      AlertService.success('Item removed from history');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      AlertService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getUserId, user?.email]);

  const getPrescriptionHistory = useCallback(() => {
    return history.filter(item => item.type === 'prescription');
  }, [history]);

  const getMedicalTestHistory = useCallback(() => {
    return history.filter(item => item.type === 'medical-test');
  }, [history]);

  return {
    history,
    isLoading,
    error,
    savePrescription,
    saveMedicalTest,
    deleteHistoryItem,
    loadHistory,
    getPrescriptionHistory,
    getMedicalTestHistory,
  };
} 