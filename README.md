
# Agenda360

Sistema multi-tenant de agendamento online para diversos nichos (barbearia, clínica, consultório, veterinária, etc).

---

Este é um projeto [Next.js](https://nextjs.org) bootstrapped com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## API - CRUD Profissional (Acesso restrito ao superadmin)

### Criar profissional
```bash
curl -X POST http://localhost:3000/api/barbers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer novo_admin@email.com" \
  -d '{"name":"João Profissional","email":"joao@barbearia.com","phone":"11999999999","cpf":"12345678901"}'
```

### Listar profissionais
```bash
curl http://localhost:3000/api/barbers
```

### Buscar profissional por ID
```bash
curl http://localhost:3000/api/barbers/{id}
```

### Atualizar profissional
```bash
curl -X PUT http://localhost:3000/api/barbers/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer novo_admin@email.com" \
  -d '{"name":"João Atualizado"}'
```

### Deletar profissional
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

---

## API - CRUD Tipo de Serviço (Acesso restrito ao superadmin)

### Criar tipo de serviço
```bash
curl -X POST http://localhost:3000/api/service-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer novo_admin@email.com" \
  -d '{
    "name": "Corte Masculino",
    "durationMinutes": 30,
    "priceCents": 4000,
    "paymentAllowed": ["CASH", "PIX", "CREDIT", "DEBIT"],
    "countsAsHaircut": true
  }'
```

Campos:
- `name`: Nome do serviço (ex: Corte Masculino)
- `durationMinutes`: Duração em minutos (ex: 30)
- `priceCents`: Preço em centavos (ex: 4000 para R$ 40,00)
- `paymentAllowed`: Array de métodos permitidos (`CASH`, `PIX`, `CREDIT`, `DEBIT`)
- `countsAsHaircut`: (opcional) Se conta como corte de cabelo (boolean)

### Listar tipos de serviço
```bash
curl http://localhost:3000/api/service-types
```

### Buscar tipo de serviço por ID
```bash
curl http://localhost:3000/api/service-types/{id}
```

### Atualizar tipo de serviço
```bash
curl -X PUT http://localhost:3000/api/service-types/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer novo_admin@email.com" \
  -d '{
    "name": "Corte Atualizado",
    "durationMinutes": 40,
    "priceCents": 5000,
    "paymentAllowed": ["CASH", "PIX"],
    "countsAsHaircut": false
  }'
```

### Deletar tipo de serviço
```bash
curl -X DELETE http://localhost:3000/api/service-types/{id} \
  -H "Authorization: Bearer novo_admin@email.com"
```

---

## API - CRUD Agendamento (Appointment)

### Criar agendamento
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer novo_admin@email.com" \
  -d '{
    "barberId": "<barber_id>",
    "clientId": "<client_id>",
    "startAt": "2025-09-07T10:00:00.000Z",
    "endAt": "2025-09-07T10:30:00.000Z",
    "items": [
      {
        "serviceTypeId": "<service_type_id>",
        "priceCentsSnapshot": 40.00,
        "durationMinutesSnapshot": 30
      }
    ]
  }'
```
## TODOs (Melhorias Futuras)

- [ ] Adicionar paginação e filtros na listagem de agendamentos
- [ ] Adicionar filtros e paginação nos clientes
- [ ] Adicionar filtros e paginação nos profissionais
- [ ] Retornar horários disponíveis para agendamento
- [ ] Adicionar notificações (e-mail/push)
- [ ] Implementar logs de auditoria detalhados
- [ ] Criar testes automatizados para endpoints de agendamento
### Listar agendamentos
```bash
curl http://localhost:3000/api/appointments
```

### Buscar agendamento por ID
```bash
curl http://localhost:3000/api/appointments/{id}
```

### Atualizar agendamento
```bash
curl -X PUT http://localhost:3000/api/appointments/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer novo_admin@email.com" \
  -d '{
    "status": "CANCELED"
  }'
```

### Deletar agendamento
```bash
curl -X DELETE http://localhost:3000/api/appointments/{id} \
  -H "Authorization: Bearer novo_admin@email.com"
```

---

## API - CRUD Pagamento (Payment)

### Criar pagamento
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "<appointment_id>",
    "method": "PIX",
    "amountCents": 4000,
    "paidAt": "2025-09-07T12:00:00.000Z"
  }'
```

### Listar pagamentos
```bash
curl http://localhost:3000/api/payments
```

### Buscar pagamento por ID
```bash
curl http://localhost:3000/api/payments/{id}
```

### Atualizar pagamento
```bash
curl -X PUT http://localhost:3000/api/payments/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "method": "CREDIT",
    "amountCents": 4500
  }'
```

### Deletar pagamento
```bash
curl -X DELETE http://localhost:3000/api/payments/{id}
```

---

## TODOs (Pagamentos)
- [ ] Adicionar filtros e paginação nos pagamentos

---

### Filtros e Paginação - Listar Agendamentos

O endpoint GET `/api/appointments` suporta os seguintes filtros e parâmetros de paginação/ordenação:

| Parâmetro         | Tipo     | Descrição                                                                                 | Exemplo de uso                                                                 |
|-------------------|----------|-----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| `professionalId`        | string   | Filtra por ID do profissional                                                               | `?professionalId=13b9bcb6-...`                                                      |
| `clientId`        | string   | Filtra por ID do cliente                                                                | `?clientId=97c4ed2a-...`                                                      |
| `status`          | string   | Filtra por status único ou múltiplos separados por vírgula                              | `?status=SCHEDULED` ou `?status=SCHEDULED,COMPLETED`                          |
| `serviceTypeId`   | string   | Filtra por tipo de serviço (serviceTypeId)                                              | `?serviceTypeId=9b75c49f-...`                                                 |
| `startAt`         | string   | Filtra agendamentos a partir desta data/hora (UTC, ISO 8601)                            | `?startAt=2025-09-01T00:00:00.000Z`                                           |
| `endAt`           | string   | Filtra agendamentos até esta data/hora (UTC, ISO 8601)                                  | `?endAt=2025-09-30T23:59:59.999Z`                                             |
| `page`            | number   | Número da página (padrão: 1)                                                            | `?page=2`                                                                     |
| `pageSize`        | number   | Quantidade de registros por página (padrão: 10)                                         | `?pageSize=20`                                                                |
| `orderBy`         | string   | Campo para ordenação (ex: startAt, status, clientId, barberId)                          | `?orderBy=startAt`                                                            |
| `order`           | string   | Direção da ordenação: `asc` (crescente) ou `desc` (decrescente, padrão)                 | `?order=asc`                                                                  |
| `clientName`      | string   | Busca textual (contém, sem case sensitive) no nome do cliente                        | `?clientName=joao`                                                             |
| `professionalName`      | string   | Busca textual (contém, sem case sensitive) no nome do profissional                       | `?professionalName=pedro`                                                            |

#### Exemplos de uso

- Listar agendamentos do profissional por múltiplos status, ordenando do mais antigo para o mais recente:
  ```bash
  curl "http://localhost:3000/api/appointments?barberId=13b9bcb6-14b0-4e6b-82f2-fd353917781d&status=SCHEDULED,COMPLETED&orderBy=startAt&order=asc&page=1&pageSize=10"
  ```
- Listar agendamentos de um cliente em setembro de 2025:
  ```bash
  curl "http://localhost:3000/api/appointments?clientId=97c4ed2a-1b25-4f37-bd92-20b6f7e61ccf&startAt=2025-09-01T00:00:00.000Z&endAt=2025-09-30T23:59:59.999Z&page=1&pageSize=10"
  ```
- Filtrar por tipo de serviço:
  ```bash
  curl "http://localhost:3000/api/appointments?serviceTypeId=9b75c49f-5633-44bf-94b2-7dc369df5d7d&page=1&pageSize=10"
  ```
- Ordenar por status:
  ```bash
  curl "http://localhost:3000/api/appointments?orderBy=status&order=asc&page=1&pageSize=10"
  ```
- Buscar agendamentos de clientes cujo nome contém "Kleiton":
  ```bash
  curl "http://localhost:3000/api/appointments?clientName=Kleiton&page=1&pageSize=10"
  ```
- Buscar agendamentos de profissionais cujo nome contém "Lucas":
  ```bash
  curl "http://localhost:3000/api/appointments?barberName=Lucas&page=1&pageSize=10"
  ```

A resposta inclui:
- `appointments`: lista paginada dos agendamentos
- `total`: total de registros encontrados
- `page`, `pageSize`: informações da paginação
