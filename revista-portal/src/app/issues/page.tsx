
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';
import { Plus, BookOpen, Search } from 'lucide-react';
import { IssuesResponse } from "@/types";


export default function IssuesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => issuesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),
  });

  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery<IssuesResponse>({
    queryKey: ['issues', page],
    queryFn: async () => {
      const response = await issuesApi.getAll({ page, limit: 12 });
      return response.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/issues/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          Erro ao carregar edições. Tente novamente.
        </Alert>
      </div>
    );
  }

  // Support both old (snake_case + meta) and new DTO (camelCase + pagination)
  const pagination: any = (data as any)?.pagination || (data as any)?.meta;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Edições</h1>
        </div>
        <div className="flex space-x-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex flex-1 md:flex-initial space-x-2">
            <Input
              type="text"
              placeholder="Buscar edições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-64"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
            <Link to="/admin/issues/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Edição
              </Button>
            </Link>
          )}
        </div>
      </div>

      {data?.data.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Nenhuma edição cadastrada ainda.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.data.map((issue) => (
              <div key={issue.id} className="flex flex-col">
                <Link to={`/issues/${issue.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {(issue.coverImageUrl || issue.cover_image_url) && (
                      <CardContent className="pt-6">
                        <img
                          src={issue.coverImageUrl || issue.cover_image_url}
                          alt={`${issue.title?.name || issue.title_name} #${issue.issueNumber || issue.issue_number}`}
                          className="w-full h-64 object-cover rounded"
                        />
                      </CardContent>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {(issue.title?.name || issue.title_name)} #{issue.issueNumber || issue.issue_number}
                      </CardTitle>
                      <CardDescription>
                        {(issue.publisher?.name || issue.publisher_name)} • {(issue.publicationYear || issue.publication_year)}
                        {((issue.rating?.average ?? issue.average_rating) > 0) && (
                          <span className="ml-2">⭐ {Number(issue.rating?.average ?? issue.average_rating).toFixed(1)}</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <div className="mt-2 flex gap-2">
                  {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
                    <Link to={`/admin/issues/${issue.id}/edit`}>
                      <Button variant="outline" size="sm">Editar</Button>
                    </Link>
                  )}
                  {isAuthenticated && user?.role === 'admin' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta edição?')) {
                          deleteMutation.mutate(issue.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Excluir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
