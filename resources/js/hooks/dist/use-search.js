"use strict";
exports.__esModule = true;
exports.useSearch = void 0;
var react_1 = require("react");
var axios_1 = require("axios");
function useSearch(_a) {
    var endpoint = _a.endpoint, queryParam = _a.queryParam, _b = _a.minQueryLength, minQueryLength = _b === void 0 ? 2 : _b, _c = _a.debounceDelay, debounceDelay = _c === void 0 ? 300 : _c, _d = _a.limit, limit = _d === void 0 ? 10 : _d;
    var _e = react_1.useState([]), results = _e[0], setResults = _e[1];
    var _f = react_1.useState(false), isLoading = _f[0], setIsLoading = _f[1];
    var _g = react_1.useState(null), error = _g[0], setError = _g[1];
    var _h = react_1.useState(""), debouncedQuery = _h[0], setDebouncedQuery = _h[1];
    var abortControllerRef = react_1.useRef(null);
    // Debounce the query
    react_1.useEffect(function () {
        var timer = setTimeout(function () {
            setDebouncedQuery(debouncedQuery);
        }, debounceDelay);
        return function () { return clearTimeout(timer); };
    }, [debouncedQuery, debounceDelay]);
    // Perform search when debounced query changes
    react_1.useEffect(function () {
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
        var params = new URLSearchParams();
        params.append(queryParam, debouncedQuery);
        if (limit) {
            params.append("limit", limit.toString());
        }
        axios_1["default"]
            .get(endpoint + "?" + params.toString(), {
            signal: abortControllerRef.current.signal
        })
            .then(function (response) {
            setResults(response.data);
        })["catch"](function (err) {
            var _a, _b;
            if (err.name !== "AbortError") {
                setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                    "An error occurred during search");
                console.error("Search error:", err);
            }
        })["finally"](function () {
            setIsLoading(false);
        });
        return function () {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [debouncedQuery, endpoint, queryParam, minQueryLength, limit]);
    var search = react_1.useCallback(function (query) {
        setDebouncedQuery(query);
    }, []);
    var clearResults = react_1.useCallback(function () {
        setResults([]);
        setError(null);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);
    return {
        results: results,
        isLoading: isLoading,
        error: error,
        search: search,
        clearResults: clearResults
    };
}
exports.useSearch = useSearch;
