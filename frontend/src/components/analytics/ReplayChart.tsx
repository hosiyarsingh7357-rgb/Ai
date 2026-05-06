'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';

interface Bar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ReplayChartProps {
  data: Bar[];
  trade?: any;
}

const ReplayChart: React.FC<ReplayChartProps> = ({ data, trade }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.1)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        borderColor: 'rgba(148, 163, 184, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width } = entries[0].contentRect;
      chartRef.current.applyOptions({ width });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data as any);
      
      // Auto-fit if it's the first data load or significant update
      if (data.length < 50) {
          chartRef.current?.timeScale().fitContent();
      }
    }
  }, [data]);

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#0B0F1A]/50 backdrop-blur-xl overflow-hidden p-4">
      <div ref={chartContainerRef} className="w-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
        <h3 className="text-lg font-bold text-white tracking-tight">
          {trade?.symbol || 'SIMULATED'} <span className="text-white/40 font-normal">Replay</span>
        </h3>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-emerald-400">ENTRY: {trade?.entryPrice}</span>
          <span className="text-rose-400">EXIT: {trade?.exitPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default ReplayChart;
