# Shalon Grill - Next.js

## Pré-requisitos
- Node.js 18+
- Conta no [Neon](https://neon.tech) (banco de dados PostgreSQL gratuito)
- Conta no [Vercel](https://vercel.com)

## Configuração Local

1. Instale as dependências:
```bash
npm install
```

2. Crie o arquivo `.env.local` com as variáveis de ambiente:
```env
DATABASE_URL="postgresql://..."  # Cole a URL do Neon aqui
JWT_SECRET="sua-chave-secreta-muito-segura-aqui"
NEXT_PUBLIC_WHATSAPP="5534997284575"
```

3. Execute as migrações do banco:
```bash
npm run db:push
```

4. Popule o banco com dados iniciais:
```bash
npm run db:seed
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
shalon-grill-nextjs/
├── app/
│   ├── (public)/          # Rotas públicas (cardápio, home)
│   ├── admin/             # Painel administrativo
│   └── api/               # API Routes (Next.js)
│       ├── auth/
│       ├── products/
│       ├── categories/
│       └── orders/
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários (prisma, auth, etc.)
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── public/                # Arquivos estáticos
```

## Deploy no Vercel

1. Faça push do projeto para o GitHub
2. Conecte o repositório no Vercel
3. Adicione as variáveis de ambiente no painel do Vercel
4. Deploy automático!
