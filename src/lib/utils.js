import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function getCookie(name) {
  return document.cookie.split('; ').reduce((r, cookieString) => {
    const [key, ...v] = cookieString.split('=');
    return key === name ? decodeURIComponent(v.join('=')) : r;
  }, '');
}

export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function generateTicketNumber(serialCount = 0) {
  const serialNumber = (serialCount + 1).toString().padStart(4, '0');
  return `OMP-${serialNumber}`;
}
