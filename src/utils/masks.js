
export const onlyDigits = (v = '') => (v || '').replace(/\D/g, '');


export const maskCPF = (v = '') => {
  const d = onlyDigits(v).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);

  let out = '';
  if (p1) out += p1;
  if (p2) out += '.' + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '-' + p4;

  return out;
};


export const maskCEP = (v = '') => {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
};


export const maskPhoneBR = (v = '') => {
  const d = onlyDigits(v).slice(0, 11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
    : d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
};
