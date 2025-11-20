import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { titlesApi, issuesApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';

export default function AdminIssueNewPage() {
  const { user } = useRequireAuth('editor');
  const navigate = useNavigate();

  const { data: titlesResp, isLoading } = useQuery({
    queryKey: ['titles', 'all-for-select'],
    queryFn: async () => (await titlesApi.getAll()).data,
  });

  const titles: any[] = (titlesResp as any)?.titles || (titlesResp as any)?.data?.titles || [];

  const [titleId, setTitleId] = useState<number | ''>('');
  const [issueNumber, setIssueNumber] = useState<number | ''>('');
  const [publicationYear, setPublicationYear] = useState<number | ''>('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [pdfFileUrl, setPdfFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [pageCount, setPageCount] = useState<number | ''>('');
  const [author, setAuthor] = useState('');
  const [artist, setArtist] = useState('');

  const createMutation = useMutation({
    mutationFn: () => issuesApi.create({
      title_id: Number(titleId),
      issue_number: Number(issueNumber),
      publication_year: Number(publicationYear),
      cover_image_url: coverImageUrl,
      pdf_file_url: pdfFileUrl,
      description,
      page_count: pageCount === '' ? undefined : Number(pageCount),
      author: author || undefined,
      artist: artist || undefined,
    }),
    onSuccess: () => navigate('/issues'),
  });

  if (!user || isLoading) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nova Edição</h1>
        <Link to="/admin"><Button variant="outline">Cancelar</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Edição</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">{'T\u00edtulo'}</label>
            <select
              className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 w-full"
              value={titleId}
              onChange={(e) => setTitleId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Selecione...</option>
              {titles.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">{'N\u00famero'}</label>
              <Input type="number" value={issueNumber as any} onChange={(e) => setIssueNumber(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <div>
              <label className="block text-sm mb-1">{'Ano de publica\u00e7\u00e3o'}</label>
              <Input type="number" value={publicationYear as any} onChange={(e) => setPublicationYear(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <div>
              <label className="block text-sm mb-1">{'P\u00e1ginas'}</label>
              <Input type="number" value={pageCount as any} onChange={(e) => setPageCount(e.target.value ? Number(e.target.value) : '')} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Capa (URL)</label>
            <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">PDF (URL)</label>
            <Input value={pdfFileUrl} onChange={(e) => setPdfFileUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Autor</label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Artista</label>
              <Input value={artist} onChange={(e) => setArtist(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">{'Descri\u00e7\u00e3o'}</label>
            <textarea
              className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 w-full min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!titleId || !issueNumber || !publicationYear || createMutation.isPending}
            >
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

