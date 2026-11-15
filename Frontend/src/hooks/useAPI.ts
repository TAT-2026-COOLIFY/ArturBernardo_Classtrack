import { useState, useCallback } from 'react';
import type { AxiosResponse, AxiosError } from 'axios';

interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  request: (...args: P) => Promise<T | null>;
  clearError: () => void;
}

export function useApi<T, P extends any[]>(
  apiFunc: (...args: P) => Promise<AxiosResponse<T>>
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const request = useCallback(async (...args: P): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunc(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Erro ao processar requisição';
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, request, clearError };
}