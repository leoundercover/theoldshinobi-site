// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'reader';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Publisher Types
export interface Publisher {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PublishersResponse {
  publishers: Publisher[];
}

// Title Types
export interface Title {
  id: number;
  publisher_id: number;
  publisher_name?: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  genre?: string;
  created_at: string;
  updated_at: string;
}

export interface TitlesResponse {
  titles: Title[];
}

// Issue Types
export interface Issue {
  id: number;
  title_id: number;
  title_name?: string;
  publisher_name?: string;
  issue_number: number;
  publication_year: number;
  cover_image_url?: string;
  pdf_url?: string;
  description?: string;
  average_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IssuesResponse {
  data: Issue[];
  meta: PaginationMeta;
}

export interface SearchIssuesResponse {
  results: Issue[];
}

// Rating Types
export interface Rating {
  id: number;
  user_id: number;
  user_name?: string;
  issue_id: number;
  value: number;
  created_at: string;
}

export interface RatingsResponse {
  ratings: Rating[];
}

// Comment Types
export interface Comment {
  id: number;
  user_id: number;
  user_name?: string;
  issue_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentsResponse {
  comments: Comment[];
}

// Favorite Types
export interface Favorite {
  id: number;
  user_id: number;
  issue_id: number;
  created_at: string;
  // Issue details included
  issue_number?: number;
  publication_year?: number;
  title_name?: string;
  publisher_name?: string;
  cover_image_url?: string;
  average_rating?: number;
}

export interface FavoritesResponse {
  favorites: Favorite[];
}

export interface CheckFavoriteResponse {
  is_favorite: boolean;
}

// API Error Types
export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  path?: string;
  method?: string;
}
