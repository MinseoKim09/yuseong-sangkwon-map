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
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:ring-blue-200'
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
      className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      {...rest}
    >
      {isLoading ? '처리 중...' : children}
    </button>
  )
}
