export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function luhnValid(pan: string): boolean {
  const d = digitsOnly(pan);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i]!, 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function inferBrand(pan: string): string | null {
  const d = digitsOnly(pan);
  if (d.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  if (/^6(?:011|5)/.test(d)) return "discover";
  return null;
}

export function parseExpiryMmYy(value: string): { month: number; year: number } | null {
  const m = value.trim().match(/^(\d{1,2})\s*[/\-]\s*(\d{2}|\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]);
  let year = Number(m[2]);
  if (month < 1 || month > 12) return null;
  if (year < 100) year += 2000;
  if (year < 2020 || year > 2100) return null;
  return { month, year };
}
