export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  area?: string;
  category?: string;
  address?: string;
  naver_map_url?: string;
  image_url?: string;
  tags?: string[];
  memo?: string;
  visited: boolean;
  wishlist: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type VisitedFilter = 'all' | 'visited' | 'wishlist';

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  display_name: string;
  rating: number;
  content?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
  count?: number; // 보유 맛집 수 (클라이언트에서 계산)
}

export interface Feedback {
  id: string;
  user_id?: string;
  display_name?: string;
  type: string;
  content: string;
  created_at: string;
}

export interface FilterState {
  searchQuery: string;
  areaFilter: string | null;
  categoryFilter: string | null;
  visitedFilter: VisitedFilter;
}
