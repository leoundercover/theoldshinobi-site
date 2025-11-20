import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';

export default function AdminUserEditPage() {
  const { user } = useRequireAuth('admin');
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => (await usersApi.getById(id)).data,
    enabled: !!id,
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'reader'>('reader');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name);
      setEmail(data.data.email);
      setRole(data.data.role);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => usersApi.update(id, { name, email, role, password: password || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users');
    },
  });

  if (!user || isLoading) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Editar Usuário</h1>
        <Link to="/admin/users"><Button variant="outline">Cancelar</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="reader">Reader</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Senha (deixe em branco para não alterar)</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

