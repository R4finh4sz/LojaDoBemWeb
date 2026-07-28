export type ViaCepAddress = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export const viaCepService = {
  findAddress: async (cep: string, signal?: AbortSignal) => {
    const normalizedCep = cep.replace(/\D/g, "");
    if (!/^\d{8}$/.test(normalizedCep)) throw new Error("CEP inválido.");

    const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`, { signal });
    if (!response.ok) throw new Error("Não foi possível consultar o CEP.");

    const address = (await response.json()) as ViaCepAddress;
    if (address.erro) throw new Error("CEP não encontrado.");
    return address;
  },
};
