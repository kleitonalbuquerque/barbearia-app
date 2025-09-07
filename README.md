This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!


## Autenticação Superadmin

O superadmin faz login via:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"novo_admin@email.com","password":"sua_senha"}'
```

Se autenticado, retorna os dados do usuário. Use o email do superadmin como token simples no header Authorization para as rotas protegidas.

---

## API - CRUD Barbeiro (Acesso restrito ao superadmin)

### Criar barbeiro
```bash
curl -X POST http://localhost:3000/api/barbers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer novo_admin@email.com" \
  -d '{"name":"João Barbeiro","email":"joao@barbearia.com","phone":"11999999999","cpf":"12345678901"}'
```

### Listar barbeiros
```bash
curl http://localhost:3000/api/barbers
```

### Buscar barbeiro por ID
```bash
curl http://localhost:3000/api/barbers/{id}
```

### Atualizar barbeiro
```bash
curl -X PUT http://localhost:3000/api/barbers/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer novo_admin@email.com" \
  -d '{"name":"João Atualizado"}'
```

### Deletar barbeiro
```bash
curl -X DELETE http://localhost:3000/api/barbers/{id} \
  -H "Authorization: Bearer superadmin@email.com"
```

---

## API - CRUD Cliente

### Criar cliente
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Cliente","email":"maria@cliente.com","phone":"11988887777","cpf":"98765432100"}'
```

### Listar clientes
```bash
curl http://localhost:3000/api/clients
```

### Buscar cliente por ID
```bash
curl http://localhost:3000/api/clients/{id}
```

### Atualizar cliente
```bash
curl -X PUT http://localhost:3000/api/clients/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Atualizada"}'
```

### Deletar cliente
```bash
curl -X DELETE http://localhost:3000/api/clients/{id}
```
