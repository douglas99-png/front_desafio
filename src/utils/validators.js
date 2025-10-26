import { onlyDigits } from './masks';

export const isValidName = (n = '') => {
  const v = (n || '').trim();
  return v.length >= 3 && /^[A-Za-zÀ-ÿ0-9 ]+$/.test(v);
};

export const isValidEmail = (e = '') => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};

export const isValidCPF = (c = '') => {
  const s = onlyDigits(c);
  if (s.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(s)) return false;
  return true;
};

export const isValidCEP = (c = '') => {
  return onlyDigits(c).length === 8;
};

export const isValidUF = (u = '') => {
  return /^[A-Z]{2}$/.test(u || '');
};

export const isValidPhone = (p = '') => {
  const d = onlyDigits(p);
  return d.length >= 10 && d.length <= 11;
};
