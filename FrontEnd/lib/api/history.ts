import { 
  SavePrescriptionRequest, 
  SaveMedicalTestRequest, 
  HistoryResponse, 
  SaveResponse,
  HistoryItem 
} from '@/lib/types/history';
import { api } from '@/lib/axios';

export class HistoryAPI {
  // Save prescription to history
  static async savePrescription(request: SavePrescriptionRequest): Promise<SaveResponse> {
    try {
      const response = await api.post('/history/prescription', request);
      return response.data;
    } catch (error: any) {
      console.error('Save prescription error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save prescription');
    }
  }

  // Save medical test to history
  static async saveMedicalTest(request: SaveMedicalTestRequest): Promise<SaveResponse> {
    try {
      const response = await api.post('/history/medical-test', request);
      return response.data;
    } catch (error: any) {
      console.error('Save medical test error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save medical test');
    }
  }

  // Get all history items
  static async getHistory(): Promise<HistoryItem[]> {
    try {
      const response = await api.get('/history');
      console.log('History response:', response.data);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get history error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch history');
    }
  }

  // Get prescription history only
  static async getPrescriptionHistory(): Promise<HistoryItem[]> {
    try {
      const response = await api.get('/history/prescription');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get prescription history error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch prescription history');
    }
  }

  // Get medical test history only
  static async getMedicalTestHistory(): Promise<HistoryItem[]> {
    try {
      const response = await api.get('/history/medical-test');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get medical test history error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch medical test history');
    }
  }

  // Delete a history item
  static async deleteHistoryItem(id: string): Promise<void> {
    try {
      await api.delete(`/history/${id}`);
    } catch (error: any) {
      console.error('Delete history item error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete history item');
    }
  }
} 