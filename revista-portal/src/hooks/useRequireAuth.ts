import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function useRequireAuth(requiredRole?: 'admin' | 'editor') {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
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
      navigate('/');
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

  return { isAuthenticated, user };
}
