'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface PnlBySetupChartProps {
  data: any[]
}

export function PnlBySetupChart({ data }: PnlBySetupChartProps) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-zinc-500">No data available</div>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.slice(0, 5)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
        <XAxis dataKey="name" stroke="#ffffff33" fontSize={11} />
        <YAxis stroke="#ffffff33" fontSize={11} tickFormatter={(val) => `$${val}`} />
        <Tooltip 
          cursor={{fill: 'rgba(255,255,255,0.03)'}}
          contentStyle={{ backgroundColor: '#161B26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
        />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {data.slice(0, 5).map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#00FF87' : '#FF4D4D'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
