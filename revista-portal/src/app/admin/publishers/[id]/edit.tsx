import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishersApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';

export default function AdminPublisherEditPage() {
  const { user } = useRequireAuth('admin');
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['publisher', id],
    queryFn: async () => (await publishersApi.getById(id)).data,
    enabled: !!id,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const p = (data as any)?.publisher || (data as any)?.data?.publisher;
    if (p) {
      setName(p.name || '');
      setDescription(p.description || '');
      setLogoUrl(p.logo_url || p.logoUrl || '');
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => publishersApi.update(id, { name, description, logo_url: logoUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      navigate('/publishers');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => publishersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      navigate('/publishers');
    },
  });


  if (!user || isLoading) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Editar Editora</h1>
        <Link to="/publishers"><Button variant="outline">Cancelar</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Editora</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Descrição</label>
            <textarea
              className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 w-full min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Logo URL</label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              Salvar
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta editora?')) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                Excluir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

