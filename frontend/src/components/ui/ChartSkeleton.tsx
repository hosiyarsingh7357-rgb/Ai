import { Skeleton } from './Skeleton'

interface ChartSkeletonProps {
  height?: number | string
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div 
      className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-center overflow-hidden relative"
      style={{ height }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent" />
      <Skeleton className="w-[80%] h-[60%] opacity-20" />
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-8 h-4 opacity-10" />
        ))}
      </div>
    </div>
  )
}
