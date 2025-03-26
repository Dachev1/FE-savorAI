import { useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseApiReturn<T, P> extends ApiState<T> {
  execute: (params?: P) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any, P = any>(
  url: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  config?: AxiosRequestConfig
): UseApiReturn<T, P> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (params?: P): Promise<T | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        let response: AxiosResponse<T>;

        switch (method) {
          case 'get':
            response = await api.get<T>(url, { ...config, params });
            break;
          case 'post':
            response = await api.post<T>(url, params, config);
            break;
          case 'put':
            response = await api.put<T>(url, params, config);
            break;
          case 'delete':
            response = await api.delete<T>(url, { ...config, params });
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = 
          axiosError.response?.data && typeof axiosError.response.data === 'object' && 'message' in axiosError.response.data
            ? (axiosError.response.data as { message: string }).message
            : axiosError.message || 
              'An unknown error occurred';
          
        setState({
          data: null,
          isLoading: false,
          error: new Error(errorMessage),
        });
        
        return null;
      }
    },
    [url, method, config]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
} 