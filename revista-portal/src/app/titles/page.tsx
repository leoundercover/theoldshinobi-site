
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { titlesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';
import { Plus, Book } from 'lucide-react';
import { TitlesResponse } from "@/types";


export default function TitlesPage() {
  const { user, isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery<TitlesResponse>({
    queryKey: ['titles'],
    queryFn: async () => {
      const response = await titlesApi.getAll();
      return response.data;
    },
  });

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          Erro ao carregar títulos. Tente novamente.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Book className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Títulos</h1>
        </div>
        {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
          <Link to="/admin/titles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Título
            </Button>
          </Link>
        )}
      </div>

      {data?.titles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Nenhum título cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.titles.map((title) => (
            <Link key={title.id} to={`/titles/${title.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                {title.cover_image_url && (
                  <CardContent className="pt-6">
                    <img
                      src={title.cover_image_url}
                      alt={title.name}
                      className="w-full h-48 object-cover rounded"
                    />
                  </CardContent>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{title.name}</CardTitle>
                  <CardDescription>
                    {title.publisher_name}
                    {title.genre && ` • ${title.genre}`}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
