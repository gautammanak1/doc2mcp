import { useCallback, useEffect, useState } from "react";

interface UseSSEOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

export function useSSE(
  url: string,
  enabled = true,
  options: UseSSEOptions = {}
) {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retries, setRetries] = useState(0);

  const {
    onOpen,
    onClose,
    onError: onErrorCallback,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setIsLoading(false);
        setRetries(0);
        onOpen?.();
      };

      eventSource.onmessage = (event) => {
        setData(event.data);
      };

      eventSource.onerror = (event) => {
        const errorMsg =
          (event as unknown as Record<string, unknown>).message ||
          "SSE connection error";
        const err = new Error(String(errorMsg));

        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
          setIsLoading(false);
          setError(err);
          onErrorCallback?.(err);

          // Attempt retry
          if (retries < retryCount) {
            setTimeout(
              () => {
                setRetries((prev) => prev + 1);
                connect();
              },
              retryDelay * 2 ** retries
            );
          }
        }
      };

      return () => {
        eventSource.close();
        onClose?.();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      onErrorCallback?.(error);
    }
  }, [
    url,
    enabled,
    retries,
    retryCount,
    retryDelay,
    onOpen,
    onClose,
    onErrorCallback,
  ]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return { data, error, isLoading };
}
