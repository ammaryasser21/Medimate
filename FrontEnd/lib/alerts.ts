import { toast } from '@/hooks/use-toast';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactElement;
}

// Alert service class for managing notifications
export class AlertService {
  // Success alerts
  static success(message: string, options?: Omit<AlertOptions, 'description'> & { description?: string }) {
    return toast({
      variant: 'success',
      title: options?.title || 'Success',
      description: options?.description || message,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  // Error alerts
  static error(message: string, options?: Omit<AlertOptions, 'description'> & { description?: string }) {
    return toast({
      variant: 'destructive',
      title: options?.title || 'Error',
      description: options?.description || message,
      duration: options?.duration || 6000,
      action: options?.action,
    });
  }

  // Warning alerts
  static warning(message: string, options?: Omit<AlertOptions, 'description'> & { description?: string }) {
    return toast({
      variant: 'warning',
      title: options?.title || 'Warning',
      description: options?.description || message,
      duration: options?.duration || 5000,
      action: options?.action,
    });
  }

  // Info alerts
  static info(message: string, options?: Omit<AlertOptions, 'description'> & { description?: string }) {
    return toast({
      variant: 'info',
      title: options?.title || 'Information',
      description: options?.description || message,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  // Generic alert method
  static show(type: AlertType, message: string, options?: AlertOptions) {
    switch (type) {
      case 'success':
        return this.success(message, options);
      case 'error':
        return this.error(message, options);
      case 'warning':
        return this.warning(message, options);
      case 'info':
        return this.info(message, options);
      default:
        return this.info(message, options);
    }
  }
}

// Utility functions for common scenarios
export const alerts = {
  // Authentication related
  auth: {
    loginSuccess: () => AlertService.success('Welcome back! You have been successfully logged in.'),
    loginError: (message?: string) => AlertService.error(message || 'Login failed. Please check your credentials and try again.'),
    registerSuccess: () => AlertService.success('Account created successfully! Welcome to our platform.'),
    registerError: (message?: string) => AlertService.error(message || 'Registration failed. Please try again.'),
    logoutSuccess: () => AlertService.success('You have been successfully logged out.'),
    sessionExpired: () => AlertService.warning('Your session has expired. Please log in again.'),
    passwordChanged: () => AlertService.success('Your password has been successfully updated.'),
    verificationSent: () => AlertService.info('Verification email sent. Please check your inbox.'),
  },

  // Form related
  form: {
    saveSuccess: () => AlertService.success('Changes saved successfully.'),
    saveError: (message?: string) => AlertService.error(message || 'Failed to save changes. Please try again.'),
    validationError: (message?: string) => AlertService.error(message || 'Please correct the errors in the form.'),
    requiredFields: () => AlertService.warning('Please fill in all required fields.'),
  },

  // API related
  api: {
    networkError: () => AlertService.error('Network error. Please check your connection and try again.'),
    serverError: () => AlertService.error('Server error. Please try again later.'),
    unauthorized: () => AlertService.error('You are not authorized to perform this action.'),
    forbidden: () => AlertService.error('Access denied. You do not have permission to access this resource.'),
    notFound: () => AlertService.error('The requested resource was not found.'),
  },

  // Generic actions
  action: {
    deleteSuccess: (item?: string) => AlertService.success(`${item || 'Item'} deleted successfully.`),
    deleteError: (item?: string) => AlertService.error(`Failed to delete ${item || 'item'}. Please try again.`),
    updateSuccess: (item?: string) => AlertService.success(`${item || 'Item'} updated successfully.`),
    updateError: (item?: string) => AlertService.error(`Failed to update ${item || 'item'}. Please try again.`),
    createSuccess: (item?: string) => AlertService.success(`${item || 'Item'} created successfully.`),
    createError: (item?: string) => AlertService.error(`Failed to create ${item || 'item'}. Please try again.`),
  },

  // Medical app specific
  medical: {
    appointmentBooked: () => AlertService.success('Appointment booked successfully. You will receive a confirmation email.'),
    appointmentCancelled: () => AlertService.info('Appointment has been cancelled.'),
    prescriptionSaved: () => AlertService.success('Prescription saved successfully.'),
    testResultsReady: () => AlertService.info('Your test results are ready for review.'),
    medicationReminder: (medication: string) => AlertService.info(`Reminder: Time to take your ${medication}.`),
    emergencyAlert: (message: string) => AlertService.error(message, { title: 'Emergency Alert', duration: 10000 }),
  },
};

// Hook for easy access to alert functions
export const useAlerts = () => alerts; 