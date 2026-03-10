import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultsCount: number;
  filters?: {
    area?: string;
    type?: string;
    language?: string;
  };
}

export interface CalcHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface HistoryContextType {
  searchHistory: SearchHistoryItem[];
  calcHistory: CalcHistoryItem[];
  addSearchHistory: (item: Omit<SearchHistoryItem, "id" | "timestamp">) => void;
  addCalcHistory: (item: Omit<CalcHistoryItem, "id" | "timestamp">) => void;
  clearSearchHistory: () => void;
  clearCalcHistory: () => void;
  clearAll: () => void;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

const SEARCH_HISTORY_KEY = "@academico_search_history";
const CALC_HISTORY_KEY = "@academico_calc_history";
const MAX_HISTORY = 50;

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [calcHistory, setCalcHistory] = useState<CalcHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const [searchData, calcData] = await Promise.all([
        AsyncStorage.getItem(SEARCH_HISTORY_KEY),
        AsyncStorage.getItem(CALC_HISTORY_KEY),
      ]);
      if (searchData) setSearchHistory(JSON.parse(searchData));
      if (calcData) setCalcHistory(JSON.parse(calcData));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const addSearchHistory = useCallback(async (item: Omit<SearchHistoryItem, "id" | "timestamp">) => {
    const newItem: SearchHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h.query !== item.query);
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCalcHistory = useCallback(async (item: Omit<CalcHistoryItem, "id" | "timestamp">) => {
    const newItem: CalcHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setCalcHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearchHistory = useCallback(async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  const clearCalcHistory = useCallback(async () => {
    setCalcHistory([]);
    await AsyncStorage.removeItem(CALC_HISTORY_KEY);
  }, []);

  const clearAll = useCallback(async () => {
    setSearchHistory([]);
    setCalcHistory([]);
    await Promise.all([
      AsyncStorage.removeItem(SEARCH_HISTORY_KEY),
      AsyncStorage.removeItem(CALC_HISTORY_KEY),
    ]);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        searchHistory,
        calcHistory,
        addSearchHistory,
        addCalcHistory,
        clearSearchHistory,
        clearCalcHistory,
        clearAll,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
