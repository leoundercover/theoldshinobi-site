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
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-gray-900 hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-wider">
              Revista Portal
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                location.pathname === '/'
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Início
            </Link>
            <Link
              to="/publishers?filter=marvel"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                activeFilter === 'marvel'
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Marvel Comics
            </Link>
            <Link
              to="/publishers?filter=dc"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                activeFilter === 'dc'
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              DC Comics
            </Link>
            <Link
              to="/publishers?filter=image"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                activeFilter === 'image'
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Image Comics
            </Link>
            <Link
              to="/issues"
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wide rounded-md transition-colors flex items-center space-x-1 ${
                isActive('/issues')
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
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
                    className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {user?.name}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
