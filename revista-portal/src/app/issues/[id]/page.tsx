
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi, ratingsApi, favoritesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, Edit, Heart, Star, Send } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

import { Issue, RatingsResponse, CommentsResponse, CheckFavoriteResponse } from "@/types";

export default function IssueDetailsPage() {
  const params = useParams();
  const issueId = Number(params.id);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: issueData, isLoading } = useQuery<{ issue: Issue }>({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const response = await issuesApi.getById(issueId);
      return response.data;
    },
  });

  const { data: ratingsData } = useQuery<RatingsResponse>({
    queryKey: ['ratings', issueId],
    queryFn: async () => {
      const response = await ratingsApi.getRatings(issueId);
      return response.data;
    },
  });

  const { data: commentsData } = useQuery<CommentsResponse>({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      const response = await ratingsApi.getComments(issueId);
      return response.data;
    },
  });

  const { data: favoriteData } = useQuery<CheckFavoriteResponse>({
    queryKey: ['favorite', issueId],
    queryFn: async () => {
      const response = await favoritesApi.check(issueId);
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const rateMutation = useMutation({
    mutationFn: (value: number) => ratingsApi.rate(issueId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      setRating(0);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => ratingsApi.addComment(issueId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      setComment('');
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () =>
      favoriteData?.is_favorite
        ? favoritesApi.remove(issueId)
        : favoritesApi.add(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', issueId] });
    },
  });

  if (isLoading) return <LoadingPage />;

  const issue = issueData?.issue;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/issues">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Edições
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl">
                    {issue?.title_name} #{issue?.issue_number}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {issue?.publisher_name} • {issue?.publication_year}
                  </CardDescription>
                </div>
                {user && (user.role === 'admin' || user.role === 'editor') && (
                  <Link to={`/admin/issues/${issueId}/edit`}>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            {issue?.cover_image_url && (
              <CardContent>
                <img
                  src={issue.cover_image_url}
                  alt={`${issue.title_name} #${issue.issue_number}`}
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
              </CardContent>
            )}
            {issue?.description && (
              <CardContent>
                <p className="text-gray-700">{issue.description}</p>
              </CardContent>
            )}
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comentários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthenticated && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Escreva um comentário..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button
                    onClick={() => comment.trim() && commentMutation.mutate(comment)}
                    disabled={commentMutation.isPending || !comment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              )}
              <div className="space-y-3">
                {commentsData?.comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{comment.user_name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
                {commentsData?.comments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum comentário ainda. Seja o primeiro!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {issue?.average_rating && issue.average_rating > 0 && (
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {Number(issue.average_rating).toFixed(1)}
                  </div>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(issue.average_rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {ratingsData?.ratings.length || 0} avaliações
                  </p>
                </div>
              )}
              {isAuthenticated && (
                <div>
                  <p className="text-sm font-medium mb-2">Sua avaliação:</p>
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setRating(value);
                          rateMutation.mutate(value);
                        }}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            value <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle>Favoritar</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={favoriteData?.is_favorite ? 'destructive' : 'default'}
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      favoriteData?.is_favorite ? 'fill-current' : ''
                    }`}
                  />
                  {favoriteData?.is_favorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
