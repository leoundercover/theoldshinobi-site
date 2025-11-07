# Templates de Páginas Administrativas

As páginas administrativas CRUD seguem o mesmo padrão. Use este documento como referência para criar as páginas faltantes.

## Páginas Faltantes

- `/admin/publishers/new` - Criar editora
- `/admin/publishers/[id]/edit` - Editar editora
- `/admin/titles/new` - Criar título
- `/admin/titles/[id]/edit` - Editar título
- `/admin/issues/new` - Criar edição
- `/admin/issues/[id]/edit` - Editar edição
- `/titles/[id]` - Detalhes do título
- `/issues/search` - Busca de edições

## Template: Criar Publisher

```typescript
// src/app/admin/publishers/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { publishersApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { LoadingPage } from '@/components/ui/loading';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function NewPublisherPage() {
  const router = useRouter();
  const { user } = useRequireAuth('admin');

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

  if (!user) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Nova Editora</CardTitle>
        </CardHeader>
        <CardContent>
          {mutation.error && (
            <Alert variant="destructive" className="mb-4">
              Erro ao criar editora
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" {...register('description')} />
            </div>

            <div>
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input id="logo_url" {...register('logo_url')} placeholder="https://..." />
              {errors.logo_url && <p className="text-red-500 text-sm mt-1">{errors.logo_url.message}</p>}
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Criando...' : 'Criar Editora'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Template: Editar Publisher

```typescript
// src/app/admin/publishers/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishersApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { LoadingPage } from '@/components/ui/loading';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function EditPublisherPage() {
  const params = useParams();
  const publisherId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useRequireAuth('admin');

  const { data, isLoading } = useQuery({
    queryKey: ['publisher', publisherId],
    queryFn: async () => {
      const response = await publishersApi.getById(publisherId);
      return response.data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.publisher.name || '',
      description: data?.publisher.description || '',
      logo_url: data?.publisher.logo_url || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => publishersApi.update(publisherId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publisher', publisherId] });
      router.push(`/publishers/${publisherId}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => publishersApi.delete(publisherId),
    onSuccess: () => {
      router.push('/publishers');
    },
  });

  if (isLoading || !user) return <LoadingPage />;

  const onSubmit = (formData: FormData) => {
    mutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Editar Editora</CardTitle>
        </CardHeader>
        <CardContent>
          {mutation.error && (
            <Alert variant="destructive" className="mb-4">
              Erro ao atualizar editora
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" {...register('description')} />
            </div>

            <div>
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input id="logo_url" {...register('logo_url')} />
              {errors.logo_url && <p className="text-red-500 text-sm mt-1">{errors.logo_url.message}</p>}
            </div>

            <div className="flex justify-between">
              <div className="flex space-x-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (confirm('Tem certeza que deseja deletar esta editora?')) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                Deletar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Template: Criar Título

Segue o mesmo padrão de Publisher, mas com os campos:

```typescript
const schema = z.object({
  publisher_id: z.number().min(1, 'Editora é obrigatória'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  cover_image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  genre: z.string().optional(),
});
```

E precisa de um Select para escolher a editora:

```typescript
// Buscar editoras
const { data: publishersData } = useQuery({
  queryKey: ['publishers'],
  queryFn: async () => {
    const response = await publishersApi.getAll();
    return response.data;
  },
});

// No form:
<div>
  <Label htmlFor="publisher_id">Editora *</Label>
  <select
    id="publisher_id"
    {...register('publisher_id', { valueAsNumber: true })}
    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2"
  >
    <option value="">Selecione uma editora</option>
    {publishersData?.publishers.map((pub) => (
      <option key={pub.id} value={pub.id}>{pub.name}</option>
    ))}
  </select>
</div>
```

## Template: Criar Edição

Similar, mas com os campos:

```typescript
const schema = z.object({
  title_id: z.number().min(1, 'Título é obrigatório'),
  issue_number: z.number().min(1, 'Número da edição é obrigatório'),
  publication_year: z.number().min(1900).max(2100),
  cover_image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  pdf_url: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
});
```

## Template: Título Details

Similar a Publisher Details, mas mostrando as edições (issues) em vez de títulos.

## Template: Busca de Edições

```typescript
// src/app/issues/search/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { issuesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Search } from 'lucide-react';

export default function IssuesSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['issues-search', query],
    queryFn: async () => {
      const response = await issuesApi.search(query);
      return response.data;
    },
    enabled: !!query,
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Search className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">
          Resultados para: "{query}"
        </h1>
      </div>

      {data?.results.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Nenhuma edição encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.results.map((issue) => (
            <Link key={issue.id} href={`/issues/${issue.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                {/* Similar ao issues page */}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Instruções

1. Copie o template apropriado
2. Ajuste os campos do schema conforme necessário
3. Atualize as chamadas da API
4. Teste a página

Todas as páginas CRUD seguem esse padrão consistente!
