import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, User, LogOut } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);
  const activeFilter = new URLSearchParams(location.search).get('filter');

  return (
    <nav className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 text-zinc-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-zinc-100 hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6 text-red-500" />
            <span className="text-lg font-bold tracking-wider">
              The Old Shinobi
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                location.pathname === '/'
                  ? 'text-red-400 bg-zinc-800'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Início
            </Link>
            <Link
              to="/publishers?filter=marvel"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                activeFilter === 'marvel'
                  ? 'text-red-400 bg-zinc-800'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Marvel Comics
            </Link>
            <Link
              to="/publishers?filter=dc"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                activeFilter === 'dc'
                  ? 'text-red-400 bg-zinc-800'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              DC Comics
            </Link>
            <Link
              to="/publishers?filter=image"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                activeFilter === 'image'
                  ? 'text-red-400 bg-zinc-800'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Image Comics
            </Link>
            <Link
              to="/issues"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors flex items-center space-x-1 ${
                isActive('/issues')
                  ? 'text-red-400 bg-zinc-800'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {user?.name}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className="font-bold uppercase tracking-wide"
                >
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
