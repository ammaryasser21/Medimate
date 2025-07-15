import { 
  DrugInteractionRequest, 
  DrugInteractionResult, 
  isDrugInteractionError 
} from '@/lib/types/drug-interaction';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class DrugInteractionAPI {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async checkDrugInteractions(
    request: DrugInteractionRequest
  ): Promise<DrugInteractionResult> {
    try {
      console.log('Making API request to:', `${API_BASE_URL}/drug-interactions`);
      console.log('Request payload:', request);
      
      // For testing purposes, if the API is not available, return a mock response
      if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
        console.log('Using mock response for development');
        return this.getMockResponse(request);
      }
      
      const response = await this.makeRequest<DrugInteractionResult>(
        '/drug-interactions',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      console.log('API response:', response);
      return response;
    } catch (error) {
      console.error('Drug interaction API error:', error);
      
      // If in development and API fails, return mock response
      if (process.env.NODE_ENV === 'development') {
        console.log('API failed, using mock response');
        return this.getMockResponse(request);
      }
      
      // Return a structured error response
      return {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        interactions: [],
      };
    }
  }

  // Mock response for testing
  private static getMockResponse(request: DrugInteractionRequest): DrugInteractionResult {
    const mockInteractions = request.related_drugs.map(drug => {
      if (drug.toLowerCase().includes('clarithromycin')) {
        return {
          drug,
          interactions: [
            `Concomitant use of ${request.primary_drug} with ${drug} may increase the risk of myopathy.`,
            `${drug} is a strong CYP3A4 inhibitor that may increase ${request.primary_drug} exposure.`
          ],
          has_interactions: true
        };
      } else if (drug.toLowerCase().includes('aspirin')) {
        return {
          drug,
          interactions: [
            `Concomitant use of ${request.primary_drug} with ${drug} may increase the risk of bleeding.`
          ],
          has_interactions: true
        };
      } else {
        return {
          drug,
          interactions: [],
          has_interactions: false,
          message: `No interactions found between ${request.primary_drug} and ${drug}`
        };
      }
    });

    return {
      primary_drug: request.primary_drug,
      interactions: mockInteractions,
      summary: {
        total_drugs_checked: request.related_drugs.length,
        drugs_with_interactions: mockInteractions.filter(i => i.has_interactions).length
      }
    };
  }

  // Helper method to validate request data
  static validateRequest(request: DrugInteractionRequest): string[] {
    const errors: string[] = [];

    if (!request.primary_drug?.trim()) {
      errors.push('Primary drug is required');
    }

    if (!request.related_drugs || request.related_drugs.length === 0) {
      errors.push('At least one related drug is required');
    } else {
      const invalidDrugs = request.related_drugs.filter(drug => !drug?.trim());
      if (invalidDrugs.length > 0) {
        errors.push('All related drugs must have valid names');
      }
    }

    return errors;
  }
} 