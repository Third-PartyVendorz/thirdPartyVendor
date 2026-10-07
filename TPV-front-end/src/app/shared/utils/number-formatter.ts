/**
 * Removes all commas from a string.
 * @param str - The string to remove commas from
 * @returns The string without commas
 */
export function removeCommas(str: string): string {
  return str.replace(/,/g, '');
}

/**
 * Adds comma separators to the whole number part of a string.
 * @param numStr - The number string to format (e.g., "1000" or "1000.5")
 * @returns The string with commas added (e.g., "1,000" or "1,000.5")
 */
export function addCommasToNumber(numStr: string): string {
  const parts = numStr.split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Strips trailing zeros and converts a number to a formatted string.
 * @param num - The number to format
 * @param maxDecimals - Maximum decimal places (default: no limit)
 * @returns The string with trailing zeros removed (e.g., 2.5000 -> "2.5")
 */
export function stripTrailingZeros(num: number, maxDecimals?: number): string {
  let formatted = num.toString();
  if (maxDecimals !== undefined) {
    formatted = num.toFixed(maxDecimals);
  }

  return Number(formatted).toString();
}

/**
 * Formats a number with commas and optional decimal restrictions.
 * @param num - The number to format (can be string with commas already)
 * @param maxDecimals - Maximum decimal places (default: no limit)
 * @returns The formatted string with commas (e.g., "1,000.5")
 */
export function formatNumberWithCommas(num: number | string, maxDecimals?: number): string {
  if (typeof num === 'number') {
    let formatted = stripTrailingZeros(num, maxDecimals);
    return addCommasToNumber(formatted);
  }
  
  let str = removeCommas(num);
  
  if (maxDecimals !== undefined) {
    const parts = str.split('.');
    if (parts.length > 1) {
      parts[1] = parts[1].substring(0, maxDecimals);
    }
    str = parts.join('.');
  }
  
  return addCommasToNumber(str);
}

/**
 * Parses a formatted string back to a number, removing commas and validating.
 * @param str - The formatted string (e.g., "1,000.5")
 * @returns The parsed number, or 0 if invalid
 */
export function parseFormattedNumber(str: string | null | undefined): number {
  if (!str) return 0;
  const cleaned = removeCommas(str.toString());
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Validates and formats decimal input with comma separators and decimal place restrictions.
 * Designed for real-time input validation (e.g., in form input handlers).
 * @param value - The input value to validate
 * @param maxDecimals - Maximum number of decimal places allowed (default: 4)
 * @returns The validated and formatted string (e.g., "1,000.5")
 */
export function validateAndFormatDecimalInput(value: string, maxDecimals: number = 4): string {
  let result = value;

  result = result.replace(/[^0-9.]/g, '');

  const decimalIndex = result.indexOf('.');
  if (decimalIndex !== -1 && result.indexOf('.', decimalIndex + 1) !== -1) {
    result = result.substring(0, result.lastIndexOf('.'));
  }

  const parts = result.split('.');
  if (parts.length > 1) {
    parts[1] = parts[1].substring(0, maxDecimals);
  }

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  result = parts.join('.');

  return result;
}
