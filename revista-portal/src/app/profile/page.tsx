'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { LoadingPage } from '@/components/ui/loading';
import { User } from 'lucide-react';
import { AxiosError } from 'axios';
import { ApiError } from '@/types';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { isAuthenticated } = useRequireAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => authApi.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data.user);
      setSuccessMessage('Perfil atualizado com sucesso!');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err: AxiosError<ApiError>) => {
      setErrorMessage(err.response?.data?.error || 'Erro ao atualizar perfil');
      setSuccessMessage('');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: Omit<PasswordFormData, 'confirm_password'>) => authApi.changePassword(data),
    onSuccess: () => {
      setSuccessMessage('Senha alterada com sucesso!');
      setErrorMessage('');
      resetPassword();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err: AxiosError<ApiError>) => {
      setErrorMessage(err.response?.data?.error || 'Erro ao alterar senha');
      setSuccessMessage('');
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    const { confirm_password, ...passwordData } = data;
    passwordMutation.mutate(passwordData);
  };

  if (!isAuthenticated || !user) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
      </div>

      {successMessage && (
        <Alert variant="success" className="mb-6">
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          {errorMessage}
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Visualize as informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>
            <div>
              <Label>Função</Label>
              <Input
                value={user.role === 'admin' ? 'Administrador' : user.role === 'editor' ? 'Editor' : 'Leitor'}
                disabled
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Atualizar Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Atualizar Perfil</CardTitle>
            <CardDescription>
              Altere seu nome de exibição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  {...registerProfile('name')}
                />
                {profileErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>
                )}
              </div>

              <Button type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Troque sua senha por uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div>
                <Label htmlFor="current_password">Senha Atual</Label>
                <Input
                  id="current_password"
                  type="password"
                  {...registerPassword('current_password')}
                />
                {passwordErrors.current_password && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.current_password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="new_password">Nova Senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  {...registerPassword('new_password')}
                />
                {passwordErrors.new_password && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...registerPassword('confirm_password')}
                />
                {passwordErrors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.confirm_password.message}</p>
                )}
              </div>

              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
