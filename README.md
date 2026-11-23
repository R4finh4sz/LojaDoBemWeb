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
