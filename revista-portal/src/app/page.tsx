import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Users, Book, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { publishersApi, titlesApi, issuesApi } from '@/lib/api'
import type { PublishersResponse, TitlesResponse, IssuesResponse } from '@/types'

export default function HomePage() {
  const { data: publishers, isLoading: loadingPublishers } = useQuery<PublishersResponse>({
    queryKey: ['publishers', 'home'],
    queryFn: async () => (await publishersApi.getAll()).data,
    staleTime: 60_000,
  })

  const { data: titles, isLoading: loadingTitles } = useQuery<TitlesResponse>({
    queryKey: ['titles', 'home'],
    queryFn: async () => (await titlesApi.getAll()).data,
    staleTime: 60_000,
  })

  const { data: issues, isLoading: loadingIssues, isError: issuesError } = useQuery<IssuesResponse>({
    queryKey: ['issues', 'home', { limit: 12, page: 1 }],
    queryFn: async () => (await issuesApi.getAll({ limit: 12, page: 1 })).data,
    staleTime: 60_000,
    retry: 0,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Explorar</h1>
          <p className="text-gray-600">Edições recentes, editoras e títulos</p>
        </div>
        <div className="hidden md:flex gap-2">
          <Link to="/issues"><Button size="sm"><BookOpen className="h-4 w-4 mr-2"/>Edições</Button></Link>
          <Link to="/publishers"><Button size="sm" variant="outline"><Users className="h-4 w-4 mr-2"/>Editoras</Button></Link>
          <Link to="/titles"><Button size="sm" variant="outline"><Book className="h-4 w-4 mr-2"/>Títulos</Button></Link>
        </div>
      </div>

      {/* Edições recentes */}
      {!issuesError && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Edições recentes</h2>
            <Link to="/issues" className="text-primary hover:underline">Ver todas</Link>
          </div>
          {loadingIssues ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] w-full animate-pulse rounded-md bg-gray-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {issues?.data?.slice(0, 12).map((issue) => (
                <Link key={issue.id} to={`/issues/${issue.id}`} className="group">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-md border bg-white">
                    {issue.cover_image_url ? (
                      <img src={issue.cover_image_url} alt={`${issue.title_name} #${issue.issue_number}`} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400"><ImageIcon className="h-8 w-8"/></div>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="font-medium text-gray-900 line-clamp-1">{issue.title_name} #{issue.issue_number}</p>
                    <p className="text-gray-500 line-clamp-1">{issue.publisher_name} • {issue.publication_year}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Editoras */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Editoras</h2>
          <Link to="/publishers" className="text-primary hover:underline">Ver todas</Link>
        </div>
        {loadingPublishers ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-md bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {publishers?.publishers?.slice(0, 12).map((pub) => (
              <Link key={pub.id} to={`/publishers/${pub.id}`} className="group">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{pub.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{pub.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Títulos */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Títulos</h2>
          <Link to="/titles" className="text-primary hover:underline">Ver todos</Link>
        </div>
        {loadingTitles ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 w-full animate-pulse rounded-md bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {titles?.titles?.slice(0, 12).map((t) => (
              <Link key={t.id} to={`/issues?title_id=${t.id}`} className="group">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{t.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{t.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
