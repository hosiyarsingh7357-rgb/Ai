'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface WinRateBySymbolChartProps {
  data: any[]
}

export function WinRateBySymbolChart({ data }: WinRateBySymbolChartProps) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-zinc-500">No data available</div>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.slice(0, 8)} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
        <XAxis type="number" stroke="#ffffff33" fontSize={11} tickFormatter={(val) => `${val}%`} />
        <YAxis dataKey="name" type="category" stroke="#ffffff33" fontSize={11} width={80} />
        <Tooltip 
          cursor={{fill: 'rgba(255,255,255,0.03)'}}
          contentStyle={{ backgroundColor: '#161B26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
        />
        <Bar dataKey="winRate" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
