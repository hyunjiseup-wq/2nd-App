import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { inferAreaFromAddress } from '@/constants/filters';
import { supabase } from '@/lib/supabase';
import { Restaurant, VisitedFilter } from '@/types/restaurant';
import rawSeedData from '@/seoul_restaurant_app_starter/restaurants_from_json.json';

// ── 타입 ─────────────────────────────────────────────────────────────────────

interface RestaurantContextType {
  restaurants: Restaurant[];
  filteredRestaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  areaFilter: string | null;
  categoryFilter: string | null;
  visitedFilter: VisitedFilter;
  setSearchQuery: (q: string) => void;
  setAreaFilter: (a: string | null) => void;
  setCategoryFilter: (c: string | null) => void;
  setVisitedFilter: (v: VisitedFilter) => void;
  getRestaurant: (id: string) => Restaurant | undefined;
  addRestaurant: (data: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateRestaurant: (id: string, data: Partial<Omit<Restaurant, 'id' | 'created_at'>>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  toggleVisited: (id: string) => Promise<void>;
}

// ── Supabase 행 → Restaurant 변환 ────────────────────────────────────────────

type SupabaseRow = {
  id: string;
  name: string;
  area: string | null;
  category: string | null;
  address: string | null;
  naver_map_url: string | null;
  tags: string[] | null;
  memo: string | null;
  visited: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
};

function fromRow(row: SupabaseRow): Restaurant {
  return {
    id: row.id,
    name: row.name,
    area: row.area ?? undefined,
    category: row.category ?? undefined,
    address: row.address ?? undefined,
    naver_map_url: row.naver_map_url ?? undefined,
    tags: row.tags ?? undefined,
    memo: row.memo ?? undefined,
    visited: row.visited,
    priority: row.priority,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ── 초기 시드 ─────────────────────────────────────────────────────────────────

const SEEDED_KEY = '@supabase_seeded';

interface RawItem {
  id: number | string;
  name: string;
  area?: string;
  category?: string;
  address?: string;
  naver_map_url?: string;
  tags?: string | string[];
  memo?: string;
  visited?: boolean;
  priority?: number;
}

function makeUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function seedIfEmpty() {
  const already = await AsyncStorage.getItem(SEEDED_KEY);
  if (already) return;

  const { count, error: countError } = await supabase
    .from('seoul_restaurants')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.warn('[Seed] Supabase error:', countError.message);
    return;
  }

  if (count && count > 0) {
    await AsyncStorage.setItem(SEEDED_KEY, 'true');
    return;
  }

  const rows = (rawSeedData as RawItem[]).map((r) => {
    const tags = Array.isArray(r.tags)
      ? r.tags.filter(Boolean)
      : typeof r.tags === 'string' && r.tags.trim()
      ? r.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : null;
    const area = r.area || inferAreaFromAddress(r.address) || null;
    return {
      id: makeUUID(),           // 클라이언트에서 UUID 직접 생성
      name: r.name,
      area,
      category: r.category || null,
      address: r.address || null,
      naver_map_url: r.naver_map_url || null,
      tags: tags && tags.length > 0 ? tags : null,
      memo: r.memo || null,
      visited: r.visited ?? false,
      priority: r.priority ?? 3,
    };
  });

  let allOk = true;
  for (let i = 0; i < rows.length; i += 50) {
    const { error } = await supabase.from('seoul_restaurants').insert(rows.slice(i, i + 50));
    if (error) {
      console.warn('[Seed] Insert error:', error.message);
      allOk = false;
      break;
    }
  }

  if (allOk) {
    await AsyncStorage.setItem(SEEDED_KEY, 'true');
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [visitedFilter, setVisitedFilter] = useState<VisitedFilter>('all');

  const fetchAll = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('seoul_restaurants')
      .select('*')
      .order('priority', { ascending: false })
      .order('name', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setRestaurants((data as SupabaseRow[]).map(fromRow));
      setError(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await seedIfEmpty();
      await fetchAll();
      setLoading(false);
    })();
  }, [fetchAll]);

  // ── 필터링 (인메모리) ─────────────────────────────────────────────────────

  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (q) {
        const hay = `${r.name} ${r.area ?? ''} ${r.memo ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (areaFilter && r.area !== areaFilter) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (visitedFilter === 'visited' && !r.visited) return false;
      if (visitedFilter === 'unvisited' && r.visited) return false;
      return true;
    });
  }, [restaurants, searchQuery, areaFilter, categoryFilter, visitedFilter]);

  const getRestaurant = useCallback(
    (id: string) => restaurants.find((r) => r.id === id),
    [restaurants],
  );

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const addRestaurant = useCallback(
    async (data: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: row, error: err } = await supabase
        .from('seoul_restaurants')
        .insert({
          id: makeUUID(),
          name: data.name,
          area: data.area ?? null,
          category: data.category ?? null,
          address: data.address ?? null,
          naver_map_url: data.naver_map_url ?? null,
          tags: data.tags ?? null,
          memo: data.memo ?? null,
          visited: data.visited,
          priority: data.priority,
        })
        .select()
        .single();

      if (err) throw new Error(err.message);
      const newItem = fromRow(row as SupabaseRow);
      setRestaurants((prev) => [newItem, ...prev]);
      return newItem.id;
    },
    [],
  );

  const updateRestaurant = useCallback(
    async (id: string, data: Partial<Omit<Restaurant, 'id' | 'created_at'>>) => {
      const { error: err } = await supabase
        .from('seoul_restaurants')
        .update({
          ...(data.name !== undefined && { name: data.name }),
          ...(data.area !== undefined && { area: data.area ?? null }),
          ...(data.category !== undefined && { category: data.category ?? null }),
          ...(data.address !== undefined && { address: data.address ?? null }),
          ...(data.naver_map_url !== undefined && { naver_map_url: data.naver_map_url ?? null }),
          ...(data.tags !== undefined && { tags: data.tags ?? null }),
          ...(data.memo !== undefined && { memo: data.memo ?? null }),
          ...(data.visited !== undefined && { visited: data.visited }),
          ...(data.priority !== undefined && { priority: data.priority }),
        })
        .eq('id', id);

      if (err) throw new Error(err.message);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data, updated_at: new Date().toISOString() } : r)),
      );
    },
    [],
  );

  const deleteRestaurant = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('seoul_restaurants').delete().eq('id', id);
    if (err) throw new Error(err.message);
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleVisited = useCallback(
    async (id: string) => {
      const target = restaurants.find((r) => r.id === id);
      if (!target) return;
      const newVisited = !target.visited;
      const { error: err } = await supabase
        .from('seoul_restaurants')
        .update({ visited: newVisited })
        .eq('id', id);
      if (err) throw new Error(err.message);
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, visited: newVisited, updated_at: new Date().toISOString() } : r,
        ),
      );
    },
    [restaurants],
  );

  // ── Value ─────────────────────────────────────────────────────────────────

  const value = useMemo<RestaurantContextType>(
    () => ({
      restaurants,
      filteredRestaurants,
      loading,
      error,
      searchQuery,
      areaFilter,
      categoryFilter,
      visitedFilter,
      setSearchQuery,
      setAreaFilter,
      setCategoryFilter,
      setVisitedFilter,
      getRestaurant,
      addRestaurant,
      updateRestaurant,
      deleteRestaurant,
      toggleVisited,
    }),
    [
      restaurants,
      filteredRestaurants,
      loading,
      error,
      searchQuery,
      areaFilter,
      categoryFilter,
      visitedFilter,
      getRestaurant,
      addRestaurant,
      updateRestaurant,
      deleteRestaurant,
      toggleVisited,
    ],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurants() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurants must be used inside RestaurantProvider');
  return ctx;
}
