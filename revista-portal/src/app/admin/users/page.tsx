import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';

export default function AdminUsersPage() {
  const { user } = useRequireAuth('admin');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const res = await usersApi.getAll({ page, limit: 10 });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (!user) return <LoadingPage />;
  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">Erro ao carregar usuários.</Alert>
      </div>
    );
  }

  const pagination: any = (data as any)?.pagination || (data as any)?.meta;
  const users = (data as any)?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
        <Link to="/admin/users/new">
          <Button>Novo Usuário</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {users.map((u: any) => (
          <Card key={u.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{u.name} <span className="text-zinc-400 text-sm">({u.email})</span></CardTitle>
              <span className="px-2 py-1 rounded bg-zinc-800 text-xs uppercase">{u.role}</span>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link to={`/admin/users/${u.id}/edit`}>
                <Button size="sm">Editar</Button>
              </Link>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm('Tem certeza que deseja deletar este usuário?')) {
                    deleteMutation.mutate(u.id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                Excluir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button variant="outline" disabled={!pagination.hasPrevPage} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-zinc-400">Página {pagination.page} de {pagination.totalPages}</span>
          <Button variant="outline" disabled={!pagination.hasNextPage} onClick={() => setPage(page + 1)}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

