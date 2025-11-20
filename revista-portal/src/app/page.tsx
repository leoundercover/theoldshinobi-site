import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Users, Book, Image as ImageIcon, Star } from 'lucide-react'
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

  const { data: popular, isLoading: loadingPopular } = useQuery<any>({
    queryKey: ['issues', 'popular', { limit: 50, page: 1 }],
    queryFn: async () => (await issuesApi.getAll({ limit: 50, page: 1 })).data,
    staleTime: 60_000,
    select: (res: any) => {
      const arr = res?.data ?? []
      return arr
        .slice()
        .sort((a: any, b: any) => {
          const aAvg = a?.rating?.average ?? 0
          const bAvg = b?.rating?.average ?? 0
          const aCnt = a?.rating?.count ?? 0
          const bCnt = b?.rating?.count ?? 0
          if (bAvg !== aAvg) return bAvg - aAvg
          return bCnt - aCnt
        })
        .slice(0, 6)
    },
  })


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">Explorar</h1>
          <p className="text-zinc-400">Edições recentes, editoras e títulos</p>
        </div>
        <div className="hidden md:flex gap-2">
          <Link to="/issues"><Button size="sm"><BookOpen className="h-4 w-4 mr-2"/>Edições</Button></Link>
          <Link to="/publishers"><Button size="sm" variant="outline"><Users className="h-4 w-4 mr-2"/>Editoras</Button></Link>
          <Link to="/titles"><Button size="sm" variant="outline"><Book className="h-4 w-4 mr-2"/>Títulos</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main */}
        <div className="lg:col-span-3 space-y-10">
          {/* Últimas atualizações */}
          {!issuesError && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Últimas atualizações</h2>
                <Link to="/issues" className="text-primary hover:underline">Ver todas</Link>
              </div>
              {loadingIssues ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] w-full animate-pulse rounded-md bg-zinc-800" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {issues?.data?.slice(0, 12).map((issue: any) => (
                    <Link key={issue.id} to={`/issues/${issue.id}`} className="group">
                      <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
                        {issue.coverImageUrl ? (
                          <img
                            src={issue.coverImageUrl}
                            alt={`${issue.title?.name ?? 'Edição'} #${issue.issueNumber}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400"><ImageIcon className="h-8 w-8"/></div>
                        )}
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="font-medium text-zinc-100 line-clamp-1">{issue.title?.name} #{issue.issueNumber}</p>
                        <p className="text-zinc-400 line-clamp-1">{issue.publisher?.name} • {issue.publicationYear}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Editoras */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Editoras</h2>
              <Link to="/publishers" className="text-primary hover:underline">Ver todas</Link>
            </div>
            {loadingPublishers ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 w-full animate-pulse rounded-md bg-zinc-800" />
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
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Títulos</h2>
              <Link to="/titles" className="text-primary hover:underline">Ver todos</Link>
            </div>
            {loadingTitles ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-36 w-full animate-pulse rounded-md bg-zinc-800" />
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

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Mais populares</h2>
            {loadingPopular ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 w-full animate-pulse rounded-md bg-zinc-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {popular?.map((it: any) => (
                  <Link key={it.id} to={`/issues/${it.id}`} className="flex items-center gap-3 rounded-md p-2 hover:bg-zinc-900">
                    <div className="h-14 w-10 overflow-hidden rounded-sm bg-zinc-800 flex-shrink-0">
                      {it.coverImageUrl ? (
                        <img src={it.coverImageUrl} alt="capa" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400"><ImageIcon className="h-4 w-4"/></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-100 line-clamp-1">{it.title?.name} #{it.issueNumber}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{(it.rating?.average ?? 0).toFixed(1)}</span>
                        <span>• {it.publisher?.name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
