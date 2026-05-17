import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchState {
    query: string;
    results: any[];
    isSearching: boolean;
    showDropdown: boolean;
}

export const useSearch = (endpoint: string, queryKey: string, minLength: number = 2) => {
    const [state, setState] = useState<SearchState>({
        query: "",
        results: [],
        isSearching: false,
        showDropdown: false,
    });

    const debouncedQuery = useDebounce(state.query, 300);

    useEffect(() => {
        if (debouncedQuery.length < minLength) {
            setState(prev => ({ ...prev, results: [], showDropdown: false }));
            return;
        }

        setState(prev => ({ ...prev, isSearching: true }));
        axios.get(`${endpoint}?${queryKey}=${debouncedQuery}`)
            .then((response) => {
                setState(prev => ({
                    ...prev,
                    results: response.data,
                    showDropdown: true,
                    isSearching: false,
                }));
            })
            .catch(() => {
                setState(prev => ({ ...prev, isSearching: false }));
            });
    }, [debouncedQuery, endpoint, queryKey, minLength]);

    const updateQuery = useCallback((query: string) => {
        setState(prev => ({ ...prev, query }));
    }, []);

    const closeDropdown = useCallback(() => {
        setState(prev => ({ ...prev, showDropdown: false }));
    }, []);

    const openDropdown = useCallback(() => {
        if (state.results.length > 0) {
            setState(prev => ({ ...prev, showDropdown: true }));
        }
    }, [state.results.length]);

    return {
        ...state,
        updateQuery,
        closeDropdown,
        openDropdown,
    };
};
