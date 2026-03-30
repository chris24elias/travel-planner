import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-widest text-text-muted">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3.5 py-2.5 rounded-[8px] text-sm font-body
          bg-card-bg border border-border-medium
          text-text-body placeholder:text-text-placeholder
          focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent
          transition-all
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

export function TextArea({ label, className = '', ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-widest text-text-muted">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-3.5 py-2.5 rounded-[8px] text-sm font-body
          bg-card-bg border border-border-medium
          text-text-body placeholder:text-text-placeholder
          focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent
          transition-all resize-none
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-widest text-text-muted">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3.5 py-2.5 rounded-[8px] text-sm font-body
          bg-card-bg border border-border-medium
          text-text-body
          focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent
          transition-all cursor-pointer
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
