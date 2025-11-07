'use client';

import Link from 'next/link';
import { BookOpen, Users, Book, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          Bem-vindo ao Revista Portal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sua plataforma completa para gerenciamento e descoberta de revistas em quadrinhos
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/issues">
            <Button size="lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Explorar Edições
            </Button>
          </Link>
          <Link href="/publishers">
            <Button size="lg" variant="outline">
              Ver Editoras
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card>
          <CardHeader>
            <BookOpen className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Milhares de Edições</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Acesse um vasto catálogo de revistas em quadrinhos de diversas editoras
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Editoras Renomadas</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Encontre títulos das principais editoras do mercado
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Book className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Coleções Completas</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Organize e acompanhe suas coleções favoritas
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Star className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Avalie e comente sobre suas edições favoritas
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Pronto para começar?
        </h2>
        <p className="text-lg mb-6 text-primary-foreground/90">
          Cadastre-se gratuitamente e comece a explorar o mundo dos quadrinhos
        </p>
        <Link href="/register">
          <Button size="lg" variant="secondary">
            Criar Conta Grátis
          </Button>
        </Link>
      </section>
    </div>
  );
}
