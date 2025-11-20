import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publishersApi, titlesApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';

export default function AdminTitleNewPage() {
  const { user } = useRequireAuth('editor');
  const navigate = useNavigate();

  const { data: pubs, isLoading } = useQuery({
    queryKey: ['publishers'],
    queryFn: async () => (await publishersApi.getAll()).data,
  });

  const publishers: any[] = (pubs as any)?.publishers || (pubs as any)?.data?.publishers || [];

  const [publisherId, setPublisherId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [genre, setGenre] = useState('');

  const createMutation = useMutation({
    mutationFn: () => titlesApi.create({
      publisher_id: Number(publisherId),
      name,
      description,
      cover_image_url: coverImageUrl,
      genre,
    }),
    onSuccess: () => navigate('/titles'),
  });

  if (!user || isLoading) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Novo Título</h1>
        <Link to="/admin"><Button variant="outline">Cancelar</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Título</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Editora</label>
            <select
              className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 w-full"
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Selecione...</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
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
            <label className="block text-sm mb-1">Capa (URL)</label>
            <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Gênero</label>
            <Input value={genre} onChange={(e) => setGenre(e.target.value)} />
          </div>
          <div>
            <Button onClick={() => createMutation.mutate()} disabled={!publisherId || !name || createMutation.isPending}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

