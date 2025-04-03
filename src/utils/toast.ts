// Central toast utility that uses our custom Toast component
import { ToastType } from '../components/common/Toast';

// Toast utility functions
const toastUtil = {
  // This function is a helper that can be used if you don't want to use the hook
  // You still have to provide the showToast function from context
  success: (message: string, showToast: (message: string, type: ToastType, duration?: number) => void, duration?: number) => {
    showToast(message, 'success', duration);
  },
  
  error: (message: string, showToast: (message: string, type: ToastType, duration?: number) => void, duration?: number) => {
    showToast(message || 'An unexpected error occurred', 'error', duration || 7000);
  },
  
  info: (message: string, showToast: (message: string, type: ToastType, duration?: number) => void, duration?: number) => {
    showToast(message, 'info', duration);
  },
  
  warning: (message: string, showToast: (message: string, type: ToastType, duration?: number) => void, duration?: number) => {
    showToast(message, 'warning', duration);
  },
  
  favorite: (message: string, showToast: (message: string, type: ToastType, duration?: number) => void, duration?: number) => {
    showToast(message, 'favorite', duration);
  },
  
  // Method to handle API errors
  apiError: (error: any, showToast: (message: string, type: ToastType, duration?: number) => void, fallbackMessage = 'Operation failed') => {
    const errorMessage = error?.response?.data?.message || 
                         error?.message || 
                         fallbackMessage;
    showToast(errorMessage, 'error', 7000);
  }
};

export default toastUtil; 