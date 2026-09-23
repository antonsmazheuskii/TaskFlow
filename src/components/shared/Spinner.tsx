type SpinnerProps = {
  label?: string
}

export function Spinner({ label = 'Загрузка…' }: SpinnerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600 dark:border-slate-700 dark:border-t-teal-400"
        aria-hidden="true"
      />
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  )
}
