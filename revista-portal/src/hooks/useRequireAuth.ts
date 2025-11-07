import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function useRequireAuth(requiredRole?: 'admin' | 'editor') {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole) {
      // Admin pode acessar tudo
      if (user?.role === 'admin') {
        return;
      }

      // Editor pode acessar apenas páginas de editor
      if (requiredRole === 'editor' && user?.role === 'editor') {
        return;
      }

      // Se não tem permissão, redireciona
      router.push('/');
    }
  }, [isAuthenticated, user, requiredRole, router]);

  return { isAuthenticated, user };
}
