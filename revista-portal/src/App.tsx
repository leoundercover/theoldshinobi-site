import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Providers } from '@/lib/providers'
import { Navbar } from '@/components/layout/navbar'

// Pages
import HomePage from '@/app/page'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import ProfilePage from '@/app/profile/page'
import PublishersPage from '@/app/publishers/page'
import PublisherDetailPage from '@/app/publishers/[id]/page'
import TitlesPage from '@/app/titles/page'
import IssuesPage from '@/app/issues/page'
import IssueDetailPage from '@/app/issues/[id]/page'
import FavoritesPage from '@/app/favorites/page'
import AdminPage from '@/app/admin/page'

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/publishers" element={<PublishersPage />} />
              <Route path="/publishers/:id" element={<PublisherDetailPage />} />
              <Route path="/titles" element={<TitlesPage />} />
              <Route path="/issues" element={<IssuesPage />} />
              <Route path="/issues/:id" element={<IssueDetailPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-8 mt-16">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>&copy; 2025 Revista Portal. Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </Providers>
  )
}

export default App

