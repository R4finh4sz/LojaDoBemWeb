# Loja do Bem Web

## Desenvolvimento local

1. Inicie o LojaDoBemBackend com `PORT=3001` e configure o envio de e-mails para o login com 2FA.
2. Copie `.env.example` para `.env.local`. Ajuste `NEXT_PUBLIC_API_URL` se o backend estiver em outro endereço.
3. Rode `yarn install` e `yarn dev`. O frontend abre em `http://localhost:3000`.

O perfil retornado no JWT define o painel acessado após o 2FA.

| Perfil | Painel |
| --- | --- |
| `MASTER` | `/main/Master` |
| `PrefeituraVendedor` | `/main/Prefeitura` |
| `COOPERATIVA` | `/main/Cooperativa` |

O crédito de ecocoins usa o CPF do munícipe e é feito no painel da cooperativa. Após a confirmação, o painel exibe o protocolo e o saldo retornados pelo backend.

## Demonstração local

Defina `NEXT_PUBLIC_DEMO_MODE=true` em `.env.local` e reinicie `yarn dev`. Em `/Auth/Login`, selecione um perfil, clique em **Entrar** e use o código `123456`.

Use o CPF `529.982.247-25` para testar o crédito de ecocoins e o carrinho. Para testar uma retirada, use `ABCD1234EF56`. Os dados de demonstração voltam aos valores iniciais ao recarregar a página. Recuperação de senha e exportação de arquivos dependem da API real.
