'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#94A3B8]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3 rounded-lg text-sm text-white bg-[#151821] border transition-all duration-200',
            'placeholder:text-[#4B5563] outline-none',
            'border-white/8 focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87]/30',
            error && 'border-[#FF4757] focus:border-[#FF4757] focus:ring-[#FF4757]/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#FF4757]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#4B5563]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
