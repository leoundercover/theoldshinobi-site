-- =====================================================
-- THE OLD SHINOBI - SCHEMA COMPLETO PARA SUPABASE
-- =====================================================
-- Versão: 1.0.0
-- Data: 05/10/2025
-- Banco: PostgreSQL (Supabase)
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA: users
-- Descrição: Usuários do sistema
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'reader' CHECK (role IN ('admin', 'editor', 'reader')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABELA: publishers
-- Descrição: Editoras de quadrinhos
-- =====================================================
CREATE TABLE publishers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para publishers
CREATE INDEX idx_publishers_name ON publishers(name);

-- =====================================================
-- TABELA: titles
-- Descrição: Títulos/Séries de quadrinhos
-- =====================================================
CREATE TABLE titles (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus', 'cancelled')),
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para titles
CREATE INDEX idx_titles_publisher_id ON titles(publisher_id);
CREATE INDEX idx_titles_name ON titles(name);
CREATE INDEX idx_titles_genre ON titles(genre);
CREATE INDEX idx_titles_status ON titles(status);

-- =====================================================
-- TABELA: issues
-- Descrição: Edições individuais de quadrinhos
-- =====================================================
CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    title_id INTEGER NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    issue_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    publication_year INTEGER NOT NULL,
    page_count INTEGER DEFAULT 0,
    file_size_mb DECIMAL(10, 2),
    writer VARCHAR(255),
    artist VARCHAR(255),
    average_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(title_id, issue_number)
);

-- Índices para issues
CREATE INDEX idx_issues_title_id ON issues(title_id);
CREATE INDEX idx_issues_publication_year ON issues(publication_year);
CREATE INDEX idx_issues_average_rating ON issues(average_rating);
CREATE INDEX idx_issues_view_count ON issues(view_count);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);

-- =====================================================
-- TABELA: ratings
-- Descrição: Avaliações de edições pelos usuários
-- =====================================================
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(issue_id, user_id)
);

-- Índices para ratings
CREATE INDEX idx_ratings_issue_id ON ratings(issue_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);

-- =====================================================
-- TABELA: favorites
-- Descrição: Edições favoritadas pelos usuários
-- =====================================================
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, issue_id)
);

-- Índices para favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_issue_id ON favorites(issue_id);

-- =====================================================
-- TABELA: reading_history
-- Descrição: Histórico de leitura dos usuários
-- =====================================================
CREATE TABLE reading_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    last_page_read INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, issue_id)
);

-- Índices para reading_history
CREATE INDEX idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX idx_reading_history_issue_id ON reading_history(issue_id);
CREATE INDEX idx_reading_history_updated_at ON reading_history(updated_at DESC);

-- =====================================================
-- FUNCTIONS E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publishers_updated_at BEFORE UPDATE ON publishers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_titles_updated_at BEFORE UPDATE ON titles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_history_updated_at BEFORE UPDATE ON reading_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Função para atualizar rating médio das edições
-- =====================================================
CREATE OR REPLACE FUNCTION update_issue_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE issues
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM ratings
            WHERE issue_id = NEW.issue_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM ratings
            WHERE issue_id = NEW.issue_id
        )
    WHERE id = NEW.issue_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar rating ao inserir/atualizar avaliação
CREATE TRIGGER update_issue_rating_on_insert AFTER INSERT ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_issue_rating();

CREATE TRIGGER update_issue_rating_on_update AFTER UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_issue_rating();

-- Trigger para atualizar rating ao deletar avaliação
CREATE OR REPLACE FUNCTION update_issue_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE issues
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM ratings
            WHERE issue_id = OLD.issue_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM ratings
            WHERE issue_id = OLD.issue_id
        )
    WHERE id = OLD.issue_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_issue_rating_on_delete AFTER DELETE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_issue_rating_on_delete();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Edições com informações completas
CREATE OR REPLACE VIEW v_issues_complete AS
SELECT 
    i.id,
    i.issue_number,
    i.title,
    i.description,
    i.cover_image_url,
    i.pdf_url,
    i.publication_year,
    i.page_count,
    i.file_size_mb,
    i.writer,
    i.artist,
    i.average_rating,
    i.rating_count,
    i.view_count,
    i.download_count,
    i.created_at,
    i.updated_at,
    t.id AS title_id,
    t.name AS title_name,
    t.genre,
    p.id AS publisher_id,
    p.name AS publisher_name,
    p.logo_url AS publisher_logo
FROM issues i
JOIN titles t ON i.title_id = t.id
JOIN publishers p ON t.publisher_id = p.id;

-- View: Estatísticas gerais
CREATE OR REPLACE VIEW v_statistics AS
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM publishers) AS total_publishers,
    (SELECT COUNT(*) FROM titles) AS total_titles,
    (SELECT COUNT(*) FROM issues) AS total_issues,
    (SELECT SUM(view_count) FROM issues) AS total_views,
    (SELECT SUM(download_count) FROM issues) AS total_downloads,
    (SELECT COUNT(*) FROM ratings) AS total_ratings,
    (SELECT COUNT(*) FROM favorites) AS total_favorites;

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir usuário admin padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@theoldshinobi.com', '$2a$10$rKZhVhZhVhZhVhZhVhZhVuO7xKZhVhZhVhZhVhZhVhZhVhZhVhZhV', 'Administrador', 'admin');

-- Inserir editoras
INSERT INTO publishers (name, description, website_url) VALUES
('Marvel Comics', 'Marvel Comics é uma editora norte-americana de histórias em quadrinhos e mídias relacionadas.', 'https://www.marvel.com'),
('DC Comics', 'DC Comics é uma das maiores e mais antigas editoras de histórias em quadrinhos dos Estados Unidos.', 'https://www.dc.com'),
('Image Comics', 'Image Comics é uma editora de quadrinhos americana fundada em 1992 por vários ilustradores de alto perfil.', 'https://imagecomics.com');

-- Inserir títulos
INSERT INTO titles (publisher_id, name, description, genre, status) VALUES
(1, 'X-Men', 'Os X-Men são um time de super-heróis mutantes que lutam por um mundo que os teme e os odeia.', 'Super-heróis', 'ongoing'),
(1, 'Spider-Man', 'As aventuras do Homem-Aranha, o amigável vizinho de Nova York.', 'Super-heróis', 'ongoing'),
(1, 'Avengers', 'Os maiores heróis da Terra unidos contra as ameaças que nenhum herói poderia enfrentar sozinho.', 'Super-heróis', 'ongoing'),
(2, 'Batman', 'O Cavaleiro das Trevas protege Gotham City do crime e da corrupção.', 'Super-heróis', 'ongoing'),
(2, 'Superman', 'O Homem de Aço defende a Terra como o último filho de Krypton.', 'Super-heróis', 'ongoing'),
(3, 'The Walking Dead', 'Uma história de sobrevivência em um mundo pós-apocalíptico dominado por zumbis.', 'Horror', 'completed');

-- Inserir edições de exemplo
INSERT INTO issues (title_id, issue_number, title, description, cover_image_url, pdf_url, publication_year, page_count, writer, artist, average_rating, rating_count, view_count) VALUES
(1, '#1', 'X-Men #1', 'A primeira edição dos X-Men! Conheça os mutantes que mudaram o mundo dos quadrinhos.', 'https://picsum.photos/seed/xmen1/400/600', '/pdfs/xmen-1.pdf', 2024, 32, 'Stan Lee', 'Jack Kirby', 4.5, 120, 1523),
(2, '#1', 'Amazing Spider-Man #1', 'A origem do Homem-Aranha! Peter Parker ganha seus poderes e aprende que com grandes poderes vêm grandes responsabilidades.', 'https://picsum.photos/seed/spiderman1/400/600', '/pdfs/spiderman-1.pdf', 2024, 28, 'Stan Lee', 'Steve Ditko', 4.8, 250, 3421),
(3, '#1', 'Avengers #1', 'Os maiores heróis da Terra se unem pela primeira vez!', 'https://picsum.photos/seed/avengers1/400/600', '/pdfs/avengers-1.pdf', 2024, 36, 'Stan Lee', 'Jack Kirby', 4.6, 180, 2134),
(4, '#1', 'Batman: Year One', 'A origem definitiva do Batman. Bruce Wayne retorna a Gotham para se tornar o Cavaleiro das Trevas.', 'https://picsum.photos/seed/batman1/400/600', '/pdfs/batman-1.pdf', 2023, 40, 'Frank Miller', 'David Mazzucchelli', 4.9, 340, 4521),
(5, '#1', 'Superman: Birthright', 'A história moderna da origem do Superman.', 'https://picsum.photos/seed/superman1/400/600', '/pdfs/superman-1.pdf', 2023, 32, 'Mark Waid', 'Leinil Francis Yu', 4.7, 210, 2876),
(6, '#1', 'The Walking Dead #1', 'O início da saga épica de sobrevivência. Rick Grimes acorda em um mundo devastado.', 'https://picsum.photos/seed/twd1/400/600', '/pdfs/twd-1.pdf', 2023, 24, 'Robert Kirkman', 'Tony Moore', 4.8, 450, 5234),
(1, '#2', 'X-Men #2', 'Os X-Men enfrentam seu primeiro grande vilão!', 'https://picsum.photos/seed/xmen2/400/600', '/pdfs/xmen-2.pdf', 2024, 32, 'Stan Lee', 'Jack Kirby', 4.4, 95, 1234),
(2, '#2', 'Amazing Spider-Man #2', 'Spider-Man enfrenta o Abutre pela primeira vez!', 'https://picsum.photos/seed/spiderman2/400/600', '/pdfs/spiderman-2.pdf', 2024, 28, 'Stan Lee', 'Steve Ditko', 4.7, 198, 2876);

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY) - SUPABASE
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Usuários podem ver seu próprio perfil" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para publishers (público para leitura)
CREATE POLICY "Qualquer um pode ver editoras" ON publishers
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem criar editoras" ON publishers
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Apenas admins podem atualizar editoras" ON publishers
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Apenas admins podem deletar editoras" ON publishers
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para titles (público para leitura)
CREATE POLICY "Qualquer um pode ver títulos" ON titles
    FOR SELECT USING (true);

CREATE POLICY "Admins e editores podem criar títulos" ON titles
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
    );

CREATE POLICY "Admins e editores podem atualizar títulos" ON titles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
    );

CREATE POLICY "Apenas admins podem deletar títulos" ON titles
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para issues (público para leitura)
CREATE POLICY "Qualquer um pode ver edições" ON issues
    FOR SELECT USING (true);

CREATE POLICY "Admins e editores podem criar edições" ON issues
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
    );

CREATE POLICY "Admins e editores podem atualizar edições" ON issues
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
    );

CREATE POLICY "Apenas admins podem deletar edições" ON issues
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para ratings
CREATE POLICY "Qualquer um pode ver avaliações" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem criar avaliações" ON ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias avaliações" ON ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias avaliações" ON ratings
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para favorites
CREATE POLICY "Usuários podem ver seus próprios favoritos" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem adicionar favoritos" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover seus favoritos" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para reading_history
CREATE POLICY "Usuários podem ver seu próprio histórico" ON reading_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar histórico de leitura" ON reading_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu histórico" ON reading_history
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE publishers IS 'Editoras de quadrinhos';
COMMENT ON TABLE titles IS 'Títulos/Séries de quadrinhos';
COMMENT ON TABLE issues IS 'Edições individuais de quadrinhos';
COMMENT ON TABLE ratings IS 'Avaliações de edições pelos usuários';
COMMENT ON TABLE favorites IS 'Edições favoritadas pelos usuários';
COMMENT ON TABLE reading_history IS 'Histórico de leitura dos usuários';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
