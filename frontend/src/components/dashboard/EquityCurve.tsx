'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { EquityPoint } from '@/hooks/useAnalytics'

interface EquityCurveProps {
  data: EquityPoint[]
  showXAxis?: boolean
}

export function EquityCurve({ data, showXAxis = false }: EquityCurveProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[#94A3B8] text-sm">
        No trade data available for chart.
      </div>
    )
  }

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF87" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1E293B"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            hide={!showXAxis}
            stroke="#64748B"
            fontSize={10}
            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
          />
          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#1E293B',
              borderRadius: '12px',
              color: '#F8FAFC',
            }}
            itemStyle={{ color: '#00FF87' }}
            labelClassName={showXAxis ? "text-xs text-slate-400 mb-1" : "hidden"}
            formatter={(value: any) => [`$${value}`, 'PnL']}
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="#00FF87"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPnl)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
