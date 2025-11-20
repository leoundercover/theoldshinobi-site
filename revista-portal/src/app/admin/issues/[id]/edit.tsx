import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { titlesApi, issuesApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';

export default function AdminIssueEditPage() {
  const { user } = useRequireAuth('editor');
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: titlesResp } = useQuery({
    queryKey: ['titles', 'all-for-select'],
    queryFn: async () => (await titlesApi.getAll()).data,
  });
  const titles: any[] = (titlesResp as any)?.titles || (titlesResp as any)?.data?.titles || [];

  const { data, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: async () => (await issuesApi.getById(id)).data,
    enabled: !!id,
  });

  const [titleId, setTitleId] = useState<number | ''>('');
  const [issueNumber, setIssueNumber] = useState<number | ''>('');
  const [publicationYear, setPublicationYear] = useState<number | ''>('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [pdfFileUrl, setPdfFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [pageCount, setPageCount] = useState<number | ''>('');
  const [author, setAuthor] = useState('');
  const [artist, setArtist] = useState('');

  useEffect(() => {
    const issue = (data as any)?.data?.issue || (data as any)?.issue;
    if (issue) {
      const rawIssueNumber = issue.issue_number ?? issue.issueNumber;
      const parsedNum = typeof rawIssueNumber === 'string' ? Number(rawIssueNumber.replace(/[^0-9]/g, '')) : Number(rawIssueNumber);
      setTitleId(issue.title_id ?? issue.titleId ?? issue.title?.id ?? '');
      setIssueNumber(!isNaN(parsedNum) ? parsedNum : '');
      setPublicationYear(issue.publication_year ?? issue.publicationYear ?? '');
      setCoverImageUrl(issue.cover_image_url || issue.coverImageUrl || '');
      setPdfFileUrl(issue.pdf_file_url || issue.pdfFileUrl || '');
      setDescription(issue.description || '');
      setPageCount(issue.page_count ?? issue.pageCount ?? '');
      setAuthor(issue.author || '');
      setArtist(issue.artist || '');
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => issuesApi.update(id, {
      title_id: titleId ? Number(titleId) : undefined,
      issue_number: issueNumber === '' ? undefined : Number(issueNumber),
      publication_year: publicationYear === '' ? undefined : Number(publicationYear),
      cover_image_url: coverImageUrl,
      pdf_file_url: pdfFileUrl,
      description,
      page_count: pageCount === '' ? undefined : Number(pageCount),
      author: author || undefined,
      artist: artist || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      navigate('/issues');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => issuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      navigate('/issues');
    },
  });


  if (!user || isLoading) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Editar Edição</h1>
        <Link to="/issues"><Button variant="outline">Cancelar</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Edição</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Título</label>
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
              <label className="block text-sm mb-1">Número</label>
              <Input type="number" value={issueNumber as any} onChange={(e) => setIssueNumber(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <div>
              <label className="block text-sm mb-1">Ano de publicação</label>
              <Input type="number" value={publicationYear as any} onChange={(e) => setPublicationYear(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <div>
              <label className="block text-sm mb-1">Páginas</label>
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
            <label className="block text-sm mb-1">Descrição</label>
            <textarea
              className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 w-full min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              Salvar
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta edição?')) {
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

