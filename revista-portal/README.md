# Revista Portal - Frontend Next.js

Portal frontend completo para gerenciamento de revistas em quadrinhos.

## 🚀 Status Atual

### ✅ Implementado

#### Estrutura Base
- ✅ Next.js 15 + TypeScript configurado
- ✅ Tailwind CSS configurado
- ✅ Estrutura de diretórios criada
- ✅ ESLint e TypeScript configurados

#### Bibliotecas Instaladas
- ✅ React Query (@tanstack/react-query) - Data fetching
- ✅ Axios - HTTP client
- ✅ Zustand - State management
- ✅ React Hook Form + Zod - Forms e validação
- ✅ class-variance-authority - Component variants
- ✅ Lucide React - Icons

#### Componentes UI Base
- ✅ Button
- ✅ Input
- ✅ Card (com Header, Content, Footer, etc)

#### Layout
- ✅ Layout principal com Navbar e Footer
- ✅ Navbar com navegação e autenticação
- ✅ React Query Provider configurado

#### API Client
- ✅ Axios configurado com interceptors
- ✅ API completa para todos os endpoints:
  - Auth (register, login, me, updateProfile, changePassword)
  - Publishers (CRUD completo)
  - Titles (CRUD completo)
  - Issues (CRUD completo + search)
  - Ratings & Comments (CRUD completo)
  - Favorites (add, remove, check, list)

#### State Management
- ✅ AuthStore com Zustand + persist
- ✅ Gerenciamento de token JWT

#### Types
- ✅ Interfaces TypeScript completas para:
  - User, AuthResponse
  - Publisher, Title, Issue
  - Rating, Comment, Favorite
  - Pagination, ApiError

#### Páginas Implementadas
- ✅ Homepage (/)
- ✅ Login (/login)
- ⏳ Register (/register) - Falta implementar
- ⏳ Restante das páginas - Falta implementar

---

## 📋 Páginas Faltando

### Autenticação
- [ ] `/register` - Página de registro
- [ ] `/profile` - Perfil do usuário

### Publishers
- [ ] `/publishers` - Lista de editoras
- [ ] `/publishers/[id]` - Detalhes da editora

### Titles
- [ ] `/titles` - Lista de títulos
- [ ] `/titles/[id]` - Detalhes do título
- [ ] `/publishers/[id]/titles` - Títulos por editora

### Issues
- [ ] `/issues` - Lista de edições (com paginação)
- [ ] `/issues/[id]` - Detalhes da edição
- [ ] `/issues/search` - Busca de edições

### User Features
- [ ] `/favorites` - Edições favoritas do usuário

### Admin (Admin/Editor apenas)
- [ ] `/admin` - Dashboard administrativo
- [ ] `/admin/publishers/new` - Criar editora
- [ ] `/admin/publishers/[id]/edit` - Editar editora
- [ ] `/admin/titles/new` - Criar título
- [ ] `/admin/titles/[id]/edit` - Editar título
- [ ] `/admin/issues/new` - Criar edição
- [ ] `/admin/issues/[id]/edit` - Editar edição

---

## 🛠️ Como Desenvolver

### Instalar Dependências
```bash
cd revista-portal
npm install
```

### Configurar Variáveis de Ambiente
Edite `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Rodar em Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3001

### Build para Produção
```bash
npm run build
npm start
```

---

## 📦 Componentes UI Adicionais Necessários

Para completar o projeto, você precisará criar:

### Componentes de Formulário
- `Label` - Label para inputs
- `Textarea` - Input de texto multi-linha
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `Radio` - Radio button input

### Componentes de Feedback
- `Alert` - Mensagens de alerta
- `Toast` - Notificações temporárias
- `Dialog` - Modal dialog
- `Loading` - Spinner de carregamento

### Componentes de Navegação
- `Tabs` - Componente de abas
- `Pagination` - Paginação
- `Breadcrumb` - Navegação em migalhas

### Componentes de Display
- `Badge` - Badge/Tag
- `Avatar` - Imagem de perfil
- `Table` - Tabela de dados
- `Skeleton` - Loading placeholder

---

## 📝 Padrão para Criar Novas Páginas

### Exemplo: Página de Lista de Editoras

```typescript
// src/app/publishers/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { publishersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PublishersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['publishers'],
    queryFn: async () => {
      const response = await publishersApi.getAll();
      return response.data;
    },
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar editoras</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Editoras</h1>
        <Link href="/admin/publishers/new">
          <Button>Nova Editora</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.publishers.map((publisher) => (
          <Link key={publisher.id} href={`/publishers/${publisher.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{publisher.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{publisher.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Exemplo: Página de Formulário Admin

```typescript
// src/app/admin/publishers/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { publishersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function NewPublisherPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => publishersApi.create(data),
    onSuccess: () => {
      router.push('/publishers');
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Nova Editora</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <Input {...register('name')} placeholder="Nome da editora" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Input {...register('description')} placeholder="Descrição" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <Input {...register('logo_url')} placeholder="https://..." />
              {errors.logo_url && <p className="text-red-500 text-sm mt-1">{errors.logo_url.message}</p>}
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar Editora'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🎨 Design System

### Cores Principais
- **Primary:** #3B82F6 (Blue)
- **Secondary:** #10B981 (Green)
- **Destructive:** #EF4444 (Red)
- **Accent:** #8B5CF6 (Purple)

### Espaçamento
- Container: `container mx-auto px-4`
- Seções: `py-8` ou `py-12`
- Cards: `gap-6` no grid

### Tipografia
- Títulos H1: `text-3xl font-bold`
- Títulos H2: `text-2xl font-semibold`
- Texto normal: `text-base`
- Texto pequeno: `text-sm text-gray-600`

---

## 🔐 Proteção de Rotas

Para proteger rotas admin, crie um hook:

```typescript
// src/hooks/useRequireAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function useRequireAuth(requiredRole?: 'admin' | 'editor') {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.role !== 'admin' && user?.role !== requiredRole) {
      router.push('/');
    }
  }, [isAuthenticated, user, requiredRole, router]);

  return { isAuthenticated, user };
}
```

Uso:
```typescript
export default function AdminPage() {
  const { user } = useRequireAuth('admin');

  if (!user) return null;

  return <div>Admin content</div>;
}
```

---

## 📚 Recursos Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

## ⚡ Próximos Passos

1. Completar página de registro (`/register`)
2. Criar páginas de listagem (publishers, titles, issues)
3. Criar páginas de detalhes com ações (favorite, rate, comment)
4. Criar formulários admin (CRUD completo)
5. Adicionar toast notifications
6. Adicionar loading states
7. Adicionar error boundaries
8. Adicionar testes (Jest + React Testing Library)
9. Otimizar imagens com Next.js Image
10. Implementar SEO (metadata, sitemap)

---

## 📄 Licença

ISC
