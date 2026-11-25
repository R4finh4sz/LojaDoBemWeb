const onlyDigits = (value: string, limit: number) => value.replace(/\D/g, "").slice(0, limit);

export const decimalValueMask = (value: string) => {
  const cleaned = value.replace(/[^0-9,.]/g, "").replace(".", ",");
  const separator = cleaned.indexOf(",");
  if (separator === -1) return cleaned.slice(0, 10);
  const integer = cleaned.slice(0, separator).replace(/,/g, "").slice(0, 10);
  const fraction = cleaned.slice(separator + 1).replace(/[^0-9]/g, "").slice(0, 2);
  return `${integer},${fraction}`;
};

export const normalizeCnpj = (value: string) => value.replace(/[^a-z0-9]/gi, "").toUpperCase();

export const inputMasks = {
  cpf: (value: string) => onlyDigits(value, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  cnpj: (value: string) => {
    const cnpj = normalizeCnpj(value).slice(0, 14);
    const root = [cnpj.slice(0, 2), cnpj.slice(2, 5), cnpj.slice(5, 8)].filter(Boolean).join(".");
    const branch = cnpj.slice(8, 12);
    const check = cnpj.slice(12);
    return root + (branch ? "/" + branch : "") + (check ? "-" + check : "");
  },
  birthDate: (value: string) => onlyDigits(value, 8).replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2"),
  cep: (value: string) => onlyDigits(value, 8).replace(/(\d{5})(\d)/, "$1-$2"),
  phone: (value: string) => onlyDigits(value, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2"),
};
