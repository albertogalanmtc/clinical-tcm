/**
 * useAsync Hook
 * 
 * Generic hook for handling async operations with loading, error, and success states.
 * Use this hook for all API calls to maintain consistent loading/error handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AsyncState, LoadingState, ApiResponse } from '@/types';

interface UseAsyncOptions<T> {
  immediate?: boolean; // Execute immediately on mount
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for handling async operations
 * 
 * @example
 * const { data, loading, error, execute } = useAsync(getAllHerbs, { immediate: true });
 * 
 * @example
 * const { data, loading, error, execute } = useAsync(
 *   (id: string) => getHerbById(id),
 *   { immediate: false }
 * );
 * // Later: execute('herb_123');
 */
export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<ApiResponse<T>>,
  options: UseAsyncOptions<T> = {}
) {
  const { immediate = false, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
    status: immediate ? 'loading' : 'idle',
  });

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const executingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args) => {
      // Prevent concurrent executions
      if (executingRef.current) {
        return;
      }

      executingRef.current = true;

      setState({
        data: null,
        loading: true,
        error: null,
        status: 'loading',
      });

      try {
        const response = await asyncFunction(...args);

        if (!isMountedRef.current) {
          executingRef.current = false;
          return;
        }

        if (response.success && response.data !== undefined) {
          setState({
            data: response.data,
            loading: false,
            error: null,
            status: 'success',
          });

          onSuccess?.(response.data);
        } else {
          const error = new Error(
            response.error?.message || 'An unknown error occurred'
          );
          (error as any).code = response.error?.code;

          setState({
            data: null,
            loading: false,
            error,
            status: 'error',
          });

          onError?.(error);
        }
      } catch (err: any) {
        if (!isMountedRef.current) {
          executingRef.current = false;
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));

        setState({
          data: null,
          loading: false,
          error,
          status: 'error',
        });

        onError?.(error);
      } finally {
        executingRef.current = false;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      status: 'idle',
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
}

/**
 * Hook for handling mutations (create, update, delete)
 * Similar to useAsync but designed for mutations that don't need immediate execution
 * 
 * @example
 * const { mutate, loading, error } = useMutation(createHerb, {
 *   onSuccess: (newHerb) => {
 *     toast.success('Herb created!');
 *     navigate(`/herbs/${newHerb.herb_id}`);
 *   }
 * });
 * 
 * // Later: mutate(herbData);
 */
export function useMutation<T, Args extends any[] = []>(
  mutationFunction: (...args: Args) => Promise<ApiResponse<T>>,
  options: UseAsyncOptions<T> = {}
) {
  return useAsync(mutationFunction, { ...options, immediate: false });
}

/**
 * Hook for handling queries with automatic refetch
 * 
 * @example
 * const { data, loading, error, refetch } = useQuery(
 *   () => getAllHerbs({ category: selectedCategory }),
 *   { dependencies: [selectedCategory] }
 * );
 */
export function useQuery<T>(
  queryFunction: () => Promise<ApiResponse<T>>,
  options: {
    dependencies?: any[];
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    enabled?: boolean; // Only execute if enabled is true
  } = {}
) {
  const { dependencies = [], enabled = true, ...asyncOptions } = options;

  const { execute, ...result } = useAsync(queryFunction, {
    ...asyncOptions,
    immediate: false,
  });

  useEffect(() => {
    if (enabled) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, enabled]);

  return {
    ...result,
    refetch: execute,
  };
}
