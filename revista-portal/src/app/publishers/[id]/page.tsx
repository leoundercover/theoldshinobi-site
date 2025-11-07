'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { publishersApi, titlesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, Edit, Building2, Book } from 'lucide-react';

export default function PublisherDetailsPage() {
  const params = useParams();
  const publisherId = Number(params.id);
  const { user } = useAuthStore();

  const { data: publisherData, isLoading: isLoadingPublisher, error: publisherError } = useQuery({
    queryKey: ['publisher', publisherId],
    queryFn: async () => {
      const response = await publishersApi.getById(publisherId);
      return response.data;
    },
  });

  const { data: titlesData, isLoading: isLoadingTitles } = useQuery({
    queryKey: ['titles', publisherId],
    queryFn: async () => {
      const response = await titlesApi.getAll(publisherId);
      return response.data;
    },
  });

  if (isLoadingPublisher) return <LoadingPage />;

  if (publisherError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          Editora não encontrada ou erro ao carregar.
        </Alert>
        <Link href="/publishers">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const publisher = publisherData?.publisher;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/publishers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Editoras
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <CardTitle className="text-3xl">{publisher?.name}</CardTitle>
                </div>
                {user?.role === 'admin' && (
                  <Link href={`/admin/publishers/${publisherId}/edit`}>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                )}
              </div>
              {publisher?.description && (
                <CardDescription className="text-base mt-4">
                  {publisher.description}
                </CardDescription>
              )}
            </CardHeader>
            {publisher?.logo_url && (
              <CardContent>
                <img
                  src={publisher.logo_url}
                  alt={publisher.name}
                  className="w-full max-w-md mx-auto h-48 object-contain"
                />
              </CardContent>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Títulos:</span>
                  <span className="font-semibold">{titlesData?.titles.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Book className="h-6 w-6 mr-2 text-primary" />
            Títulos desta Editora
          </h2>
        </div>

        {isLoadingTitles ? (
          <LoadingPage />
        ) : titlesData?.titles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              Nenhum título cadastrado para esta editora ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {titlesData?.titles.map((title) => (
              <Link key={title.id} href={`/titles/${title.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>{title.name}</CardTitle>
                    {title.genre && (
                      <CardDescription>Gênero: {title.genre}</CardDescription>
                    )}
                  </CardHeader>
                  {title.cover_image_url && (
                    <CardContent>
                      <img
                        src={title.cover_image_url}
                        alt={title.name}
                        className="w-full h-48 object-cover rounded"
                      />
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
