'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, LogOut, User, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">
              Revista Portal
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/publishers"
              className={`hover:text-primary transition-colors ${
                isActive('/publishers') ? 'text-primary font-medium' : 'text-gray-600'
              }`}
            >
              Editoras
            </Link>
            <Link
              href="/titles"
              className={`hover:text-primary transition-colors ${
                isActive('/titles') ? 'text-primary font-medium' : 'text-gray-600'
              }`}
            >
              Títulos
            </Link>
            <Link
              href="/issues"
              className={`hover:text-primary transition-colors ${
                isActive('/issues') ? 'text-primary font-medium' : 'text-gray-600'
              }`}
            >
              Edições
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/favorites"
                  className={`hover:text-primary transition-colors flex items-center space-x-1 ${
                    isActive('/favorites') ? 'text-primary font-medium' : 'text-gray-600'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>Favoritos</span>
                </Link>

                {(user?.role === 'admin' || user?.role === 'editor') && (
                  <Link
                    href="/admin"
                    className={`hover:text-primary transition-colors flex items-center space-x-1 ${
                      pathname.startsWith('/admin') ? 'text-primary font-medium' : 'text-gray-600'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.name}</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Registrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
