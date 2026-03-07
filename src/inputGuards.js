const TOKEN_PATTERN = /^[A-Za-z0-9._:/-]+$/;

export function assertToken(name, value, maxLen = 128) {
  if (typeof value !== "string") {
    throw new Error(`${name} must be a string`);
  }
  const v = value.trim();
  if (!v) throw new Error(`${name} is required`);
  if (v.length > maxLen) {
    throw new Error(`${name} length must be <= ${maxLen}`);
  }
  if (!TOKEN_PATTERN.test(v)) {
    throw new Error(`${name} contains invalid characters`);
  }
  return v;
}

export function assertBoundedText(name, value, maxLen = 512) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new Error(`${name} must be a string`);
  }
  const v = value.trim();
  if (v.length > maxLen) {
    throw new Error(`${name} length must be <= ${maxLen}`);
  }
  if (/[\u0000-\u001F]/.test(v)) {
    throw new Error(`${name} contains control characters`);
  }
  return v;
}

export function assertFiniteNumber(name, value, { min = undefined, max = undefined } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`${name} must be a finite number`);
  }
  if (min !== undefined && n < min) {
    throw new Error(`${name} must be >= ${min}`);
  }
  if (max !== undefined && n > max) {
    throw new Error(`${name} must be <= ${max}`);
  }
  return n;
}
