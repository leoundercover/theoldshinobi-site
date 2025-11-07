'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { publishersApi, titlesApi, issuesApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { LayoutDashboard, Building2, Book, BookOpen, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useRequireAuth('editor');

  const { data: publishersData } = useQuery({
    queryKey: ['publishers'],
    queryFn: async () => {
      const response = await publishersApi.getAll();
      return response.data;
    },
  });

  const { data: titlesData } = useQuery({
    queryKey: ['titles'],
    queryFn: async () => {
      const response = await titlesApi.getAll();
      return response.data;
    },
  });

  const { data: issuesData } = useQuery({
    queryKey: ['issues', 1],
    queryFn: async () => {
      const response = await issuesApi.getAll({ page: 1, limit: 1 });
      return response.data;
    },
  });

  if (!user) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <LayoutDashboard className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editoras</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishersData?.publishers.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Títulos</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{titlesData?.titles.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edições</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issuesData?.meta.total || 0}</div>
            <p className="text-xs text-muted-foreground">Total cadastradas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Editoras</CardTitle>
              <CardDescription>Gerenciar editoras do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/publishers/new">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Editora
                </Button>
              </Link>
              <Link href="/publishers">
                <Button variant="outline" className="w-full">
                  Ver Todas
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Títulos</CardTitle>
            <CardDescription>Gerenciar títulos de revistas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/titles/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Novo Título
              </Button>
            </Link>
            <Link href="/titles">
              <Button variant="outline" className="w-full">
                Ver Todos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edições</CardTitle>
            <CardDescription>Gerenciar edições publicadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/issues/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nova Edição
              </Button>
            </Link>
            <Link href="/issues">
              <Button variant="outline" className="w-full">
                Ver Todas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
