import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem } from '../components/HistoryPresetsDrawer';

export function useConversionHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('mc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mc_history', JSON.stringify(history.slice(0, 20)));
    } catch {
      // Handle quota errors gracefully
    }
  }, [history]);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    history,
    setHistory,
    addHistoryItem,
    clearHistory,
    deleteHistoryItem,
  };
}
