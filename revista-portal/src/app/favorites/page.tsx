'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';
import { Heart, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const { isAuthenticated } = useRequireAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await favoritesApi.getAll();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (issueId: number) => favoritesApi.remove(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          Erro ao carregar favoritos. Tente novamente.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Heart className="h-8 w-8 text-primary fill-primary" />
        <h1 className="text-3xl font-bold">Meus Favoritos</h1>
      </div>

      {data?.favorites.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <p className="mb-4">Você ainda não adicionou nenhuma edição aos favoritos.</p>
            <Link href="/issues">
              <Button>Explorar Edições</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.favorites.map((favorite) => (
            <Card key={favorite.issue_id} className="hover:shadow-lg transition-shadow">
              <Link href={`/issues/${favorite.issue_id}`}>
                {favorite.cover_image_url && (
                  <CardContent className="pt-6">
                    <img
                      src={favorite.cover_image_url}
                      alt={favorite.title_name || ''}
                      className="w-full h-64 object-cover rounded cursor-pointer"
                    />
                  </CardContent>
                )}
              </Link>
              <CardHeader>
                <Link href={`/issues/${favorite.issue_id}`}>
                  <CardTitle className="line-clamp-2 cursor-pointer hover:text-primary">
                    {favorite.title_name} #{favorite.issue_number}
                  </CardTitle>
                </Link>
                <CardDescription>
                  {favorite.publisher_name} • {favorite.publication_year}
                  {favorite.average_rating && favorite.average_rating > 0 && (
                    <span className="ml-2">⭐ {Number(favorite.average_rating).toFixed(1)}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => removeMutation.mutate(favorite.issue_id)}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover dos Favoritos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
