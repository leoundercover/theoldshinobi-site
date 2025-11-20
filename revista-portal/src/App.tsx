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
import AdminUsersPage from '@/app/admin/users/page'
import AdminUserNewPage from '@/app/admin/users/new'
import AdminUserEditPage from '@/app/admin/users/[id]/edit'
import IssueReadPage from '@/app/issues/[id]/read/page'
import AdminPublisherNewPage from '@/app/admin/publishers/new'
import AdminPublisherEditPage from '@/app/admin/publishers/[id]/edit'
import AdminTitleNewPage from '@/app/admin/titles/new'
import AdminTitleEditPage from '@/app/admin/titles/[id]/edit'
import AdminIssueNewPage from '@/app/admin/issues/new'
import AdminIssueEditPage from '@/app/admin/issues/[id]/edit'


function App() {
  return (
    <Providers>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
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
              <Route path="/issues/:id/read" element={<IssueReadPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/new" element={<AdminUserNewPage />} />
              <Route path="/admin/users/:id/edit" element={<AdminUserEditPage />} />
              <Route path="/admin/publishers/new" element={<AdminPublisherNewPage />} />
              <Route path="/admin/publishers/:id/edit" element={<AdminPublisherEditPage />} />
              <Route path="/admin/titles/new" element={<AdminTitleNewPage />} />
              <Route path="/admin/titles/:id/edit" element={<AdminTitleEditPage />} />
              <Route path="/admin/issues/new" element={<AdminIssueNewPage />} />
              <Route path="/admin/issues/:id/edit" element={<AdminIssueEditPage />} />
            </Routes>
          </main>
          <footer className="bg-zinc-900 border-t border-zinc-800 py-8 mt-16">
            <div className="container mx-auto px-4 text-center text-zinc-400">
              <p>&copy; 2025 The Old Shinobi. Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </Providers>
  )
}

export default App

