-- Script de inicialização do banco de dados
-- Execute este script no PostgreSQL para criar as tabelas

-- Criar tipo ENUM para roles de usuário
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'reader');

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'reader',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de editoras
CREATE TABLE publishers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de títulos
CREATE TABLE titles (
    id SERIAL PRIMARY KEY,
    publisher_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(255),
    genre VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (publisher_id) REFERENCES publishers(id) ON DELETE CASCADE
);

-- Tabela de edições
CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    title_id INT NOT NULL,
    issue_number VARCHAR(50) NOT NULL,
    publication_year INT,
    description TEXT,
    cover_image_url VARCHAR(255) NOT NULL,
    pdf_file_url VARCHAR(255) NOT NULL,
    page_count INT,
    author VARCHAR(255),
    artist VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE,
    UNIQUE (title_id, issue_number)
);

-- Tabela de comentários
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    issue_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Tabela de avaliações
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    issue_id INT NOT NULL,
    value INT NOT NULL CHECK (value >= 1 AND value <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    UNIQUE (user_id, issue_id)
);

-- Tabela de favoritos
CREATE TABLE user_favorites (
    user_id INT NOT NULL,
    issue_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, issue_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Criar índices para melhorar performance
CREATE INDEX idx_titles_publisher_id ON titles(publisher_id);
CREATE INDEX idx_issues_title_id ON issues(title_id);
CREATE INDEX idx_issues_publication_year ON issues(publication_year);
CREATE INDEX idx_comments_issue_id ON comments(issue_id);
CREATE INDEX idx_ratings_issue_id ON ratings(issue_id);

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

-- IMPORTANTE: O usuário admin deve ser criado manualmente via script separado
-- ou via endpoint administrativo após a primeira instalação
-- Nunca commite credenciais reais no repositório

-- Para criar o primeiro admin, execute o script create-admin.js após iniciar o servidor
-- ou use: POST /api/auth/register seguido de UPDATE manual no banco para mudar role para 'admin'

-- Editoras de exemplo
INSERT INTO publishers (name, description) VALUES
('Marvel Comics', 'Uma das maiores editoras de quadrinhos do mundo'),
('DC Comics', 'Casa dos maiores super-heróis como Batman e Superman');

-- Títulos de exemplo
INSERT INTO titles (publisher_id, name, description, genre) VALUES
(1, 'X-Men', 'Os mutantes mais poderosos da Marvel', 'Super-herói'),
(2, 'Batman', 'O Cavaleiro das Trevas de Gotham City', 'Super-herói');
