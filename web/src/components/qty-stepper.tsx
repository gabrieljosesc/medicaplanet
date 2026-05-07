"use client";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  disabled,
  size = "default",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  disabled?: boolean;
  size?: "default" | "sm";
}) {
  const buttonClass =
    size === "sm"
      ? "h-8 w-8 text-base"
      : "h-9 w-9 text-lg";
  const valueClass = size === "sm" ? "min-w-8 text-sm" : "min-w-[2.25rem] text-sm";

  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-white">
      <button
        type="button"
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`flex items-center justify-center text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 ${buttonClass}`}
      >
        −
      </button>
      <span className={`select-none text-center font-medium tabular-nums text-zinc-900 ${valueClass}`}>
        {value}
      </span>
      <button
        type="button"
        disabled={disabled}
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className={`flex items-center justify-center text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 ${buttonClass}`}
      >
        +
      </button>
    </div>
  );
}
