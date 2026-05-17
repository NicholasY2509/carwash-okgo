import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

interface UseSearchOptions {
    endpoint: string;
    queryParam: string;
    minQueryLength?: number;
    debounceDelay?: number;
    limit?: number;
}

interface UseSearchReturn<T> {
    results: T[];
    isLoading: boolean;
    error: string | null;
    search: (query: string) => void;
    clearResults: () => void;
}

export function useSearch<T>({
    endpoint,
    queryParam,
    minQueryLength = 2,
    debounceDelay = 300,
    limit = 10,
}: UseSearchOptions): UseSearchReturn<T> {
    const [results, setResults] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce the query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(debouncedQuery);
        }, debounceDelay);

        return () => clearTimeout(timer);
    }, [debouncedQuery, debounceDelay]);

    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length < minQueryLength) {
            setResults([]);
            setError(null);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append(queryParam, debouncedQuery);
        if (limit) {
            params.append("limit", limit.toString());
        }

        axios
            .get(`${endpoint}?${params.toString()}`, {
                signal: abortControllerRef.current.signal,
            })
            .then((response) => {
                setResults(response.data);
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(
                        err.response?.data?.message ||
                            "An error occurred during search",
                    );
                    console.error("Search error:", err);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [debouncedQuery, endpoint, queryParam, minQueryLength, limit]);

    const search = useCallback((query: string) => {
        setDebouncedQuery(query);
    }, []);

    const clearResults = useCallback(() => {
        setResults([]);
        setError(null);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    return {
        results,
        isLoading,
        error,
        search,
        clearResults,
    };
}
