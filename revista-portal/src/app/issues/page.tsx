'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { issuesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';
import { Plus, BookOpen, Search } from 'lucide-react';

export default function IssuesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
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
            <Link href="/admin/issues/new">
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
              <Link key={issue.id} href={`/issues/${issue.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {issue.cover_image_url && (
                    <CardContent className="pt-6">
                      <img
                        src={issue.cover_image_url}
                        alt={`${issue.title_name} #${issue.issue_number}`}
                        className="w-full h-64 object-cover rounded"
                      />
                    </CardContent>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {issue.title_name} #{issue.issue_number}
                    </CardTitle>
                    <CardDescription>
                      {issue.publisher_name} • {issue.publication_year}
                      {issue.average_rating && issue.average_rating > 0 && (
                        <span className="ml-2">⭐ {Number(issue.average_rating).toFixed(1)}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {data && data.meta.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                disabled={!data.meta.hasPrevPage}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {data.meta.page} de {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!data.meta.hasNextPage}
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
