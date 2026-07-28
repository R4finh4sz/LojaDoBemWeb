const onlyDigits = (value: string, limit: number) => value.replace(/\D/g, "").slice(0, limit);

export const inputMasks = {
  cpf: (value: string) => onlyDigits(value, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  cnpj: (value: string) => onlyDigits(value, 14).replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2"),
  birthDate: (value: string) => onlyDigits(value, 8).replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2"),
  cep: (value: string) => onlyDigits(value, 8).replace(/(\d{5})(\d)/, "$1-$2"),
  phone: (value: string) => onlyDigits(value, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2"),
};
