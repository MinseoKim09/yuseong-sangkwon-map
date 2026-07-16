import { InputHTMLAttributes, ButtonHTMLAttributes } from 'react'

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
}

export function AuthInput({ label, type, value, onChange, error, ...rest }: AuthInputProps) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none focus:border-transparent focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

export function AuthButton({ isLoading, disabled, children, ...rest }: AuthButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className="h-11 w-full rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      {...rest}
    >
      {isLoading ? '처리 중...' : children}
    </button>
  )
}
