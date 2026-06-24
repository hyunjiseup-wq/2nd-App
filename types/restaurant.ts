export interface Restaurant {
  id: string;
  name: string;
  area?: string;
  category?: string;
  address?: string;
  naver_map_url?: string;
  tags?: string[];
  memo?: string;
  visited: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type VisitedFilter = 'all' | 'visited' | 'unvisited';

export interface FilterState {
  searchQuery: string;
  areaFilter: string | null;
  categoryFilter: string | null;
  visitedFilter: VisitedFilter;
}
