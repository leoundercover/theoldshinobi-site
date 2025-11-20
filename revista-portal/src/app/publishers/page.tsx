
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';
import { Plus, Building2 } from 'lucide-react';
import { PublishersResponse } from '@/types';

export default function PublishersPage() {
  const { user, isAuthenticated } = useAuthStore();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => publishersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['publishers'] }),
  });

  const { data, isLoading, error } = useQuery<PublishersResponse>({
    queryKey: ['publishers'],
    queryFn: async () => {
      const response = await publishersApi.getAll();
      return response.data;
    },
  });

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          Erro ao carregar editoras. Tente novamente.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Editoras</h1>
        </div>
        {isAuthenticated && user?.role === 'admin' && (
          <Link to="/admin/publishers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Editora
            </Button>
          </Link>
        )}
      </div>

      {data?.publishers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Nenhuma editora cadastrada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.publishers.map((publisher) => (
            <div key={publisher.id} className="flex flex-col">
              <Link to={`/publishers/${publisher.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>{publisher.name}</CardTitle>
                    {publisher.description && (
                      <CardDescription className="line-clamp-3">
                        {publisher.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {publisher.logo_url && (
                    <CardContent>
                      <img
                        src={publisher.logo_url}
                        alt={publisher.name}
                        className="w-full h-32 object-contain"
                      />
                    </CardContent>
                  )}
                </Card>
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <div className="mt-2 flex gap-2">
                  <Link to={`/admin/publishers/${publisher.id}/edit`}>
                    <Button variant="outline" size="sm">Editar</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir esta editora?')) {
                        deleteMutation.mutate(publisher.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    Excluir
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
