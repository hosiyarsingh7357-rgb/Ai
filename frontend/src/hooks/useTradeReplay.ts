import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

interface Bar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ReplayInsight {
  timestamp: string;
  type: 'setup' | 'execution' | 'management' | 'exit';
  message: string;
}

interface ReplayData {
  trade: any;
  bars: Bar[];
  insights: ReplayInsight[];
}

export function useTradeReplay(tradeId: string) {
  const [data, setData] = useState<ReplayData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per tick
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReplay = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/ai/trades/${tradeId}/replay`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setCurrentIndex(0);
    } catch (err: any) {
      console.error('Failed to fetch replay data', err);
      setError(err.response?.data?.message || 'Failed to load replay data');
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    if (tradeId) fetchReplay();
  }, [tradeId, fetchReplay]);

  const tick = useCallback(() => {
    setCurrentIndex((prev) => {
      if (!data) return prev;
      if (prev >= data.bars.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [data]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(tick, playbackSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, tick, playbackSpeed]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const seek = (index: number) => {
    if (!data) return;
    const safeIndex = Math.max(0, Math.min(index, data.bars.length - 1));
    setCurrentIndex(safeIndex);
  };

  const currentBars = data ? data.bars.slice(0, currentIndex + 1) : [];
  const activeInsights = data ? data.insights.filter(i => {
    const currentBar = data.bars[currentIndex];
    if (!currentBar) return false;
    return new Date(i.timestamp).getTime() <= new Date(currentBar.time).getTime();
  }) : [];

  return {
    trade: data?.trade,
    currentBars,
    activeInsights,
    isPlaying,
    currentIndex,
    totalBars: data?.bars.length || 0,
    loading,
    error,
    togglePlay,
    seek,
    setPlaybackSpeed,
    playbackSpeed,
    refresh: fetchReplay
  };
}
