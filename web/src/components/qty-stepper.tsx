"use client";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-white">
      <button
        type="button"
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-9 w-9 items-center justify-center text-lg text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-[2.25rem] select-none text-center text-sm font-medium tabular-nums text-zinc-900">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled}
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="flex h-9 w-9 items-center justify-center text-lg text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
