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
import { Restaurant, Review, VisitedFilter } from '@/types/restaurant';
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
  toggleWishlist: (id: string) => Promise<void>;
  getReviews: (restaurantId: string) => Promise<Review[]>;
  saveReview: (restaurantId: string, rating: number, content: string) => Promise<void>;
  submitFeedback: (type: string, content: string) => Promise<void>;
}

// ── Supabase 행 타입 ─────────────────────────────────────────────────────────

type SupabaseRow = {
  id: string;
  name: string;
  area: string | null;
  category: string | null;
  address: string | null;
  naver_map_url: string | null;
  image_url: string | null;
  tags: string[] | null;
  memo: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
};

type UserState = { visited: boolean; wishlist: boolean };

function fromRow(row: SupabaseRow, state?: UserState): Restaurant {
  return {
    id: row.id,
    name: row.name,
    area: row.area ?? undefined,
    category: row.category ?? undefined,
    address: row.address ?? undefined,
    naver_map_url: row.naver_map_url ?? undefined,
    image_url: row.image_url ?? undefined,
    tags: row.tags ?? undefined,
    memo: row.memo ?? undefined,
    visited: state?.visited ?? false,
    wishlist: state?.wishlist ?? false,
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
      id: makeUUID(),
      name: r.name,
      area,
      category: r.category || null,
      address: r.address || null,
      naver_map_url: r.naver_map_url || null,
      image_url: null,
      tags: tags && tags.length > 0 ? tags : null,
      memo: r.memo || null,
      visited: false,
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
  const [rawRestaurants, setRawRestaurants] = useState<SupabaseRow[]>([]);
  const [userStates, setUserStates] = useState<Map<string, UserState>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [visitedFilter, setVisitedFilter] = useState<VisitedFilter>('all');

  // auth 상태 구독
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserStates = useCallback(async (uid: string) => {
    const { data, error: err } = await supabase
      .from('user_restaurant_states')
      .select('restaurant_id, visited, wishlist')
      .eq('user_id', uid);

    if (err) {
      console.warn('[UserStates] fetch error:', err.message);
      return;
    }

    const map = new Map<string, UserState>();
    for (const row of data ?? []) {
      map.set(row.restaurant_id, { visited: row.visited, wishlist: row.wishlist });
    }
    setUserStates(map);
  }, []);

  const fetchAll = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('seoul_restaurants')
      .select('id, name, area, category, address, naver_map_url, image_url, tags, memo, priority, created_at, updated_at')
      .order('priority', { ascending: false })
      .order('name', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setRawRestaurants((data ?? []) as SupabaseRow[]);
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

  useEffect(() => {
    if (userId) fetchUserStates(userId);
    else setUserStates(new Map());
  }, [userId, fetchUserStates]);

  // raw + userStates 병합
  const restaurants = useMemo<Restaurant[]>(
    () => rawRestaurants.map((r) => fromRow(r, userStates.get(r.id))),
    [rawRestaurants, userStates],
  );

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
      if (visitedFilter === 'wishlist' && !r.wishlist) return false;
      return true;
    });
  }, [restaurants, searchQuery, areaFilter, categoryFilter, visitedFilter]);

  const getRestaurant = useCallback(
    (id: string) => restaurants.find((r) => r.id === id),
    [restaurants],
  );

  // ── 유저 상태 업서트 ──────────────────────────────────────────────────────

  const upsertUserState = useCallback(
    async (restaurantId: string, patch: Partial<UserState>) => {
      if (!userId) return;
      const current = userStates.get(restaurantId) ?? { visited: false, wishlist: false };
      const next = { ...current, ...patch };

      const { error: err } = await supabase.from('user_restaurant_states').upsert({
        user_id: userId,
        restaurant_id: restaurantId,
        visited: next.visited,
        wishlist: next.wishlist,
        updated_at: new Date().toISOString(),
      });

      if (err) throw new Error(err.message);

      setUserStates((prev) => {
        const copy = new Map(prev);
        copy.set(restaurantId, next);
        return copy;
      });
    },
    [userId, userStates],
  );

  const toggleVisited = useCallback(
    async (id: string) => {
      const current = userStates.get(id) ?? { visited: false, wishlist: false };
      await upsertUserState(id, { visited: !current.visited });
    },
    [userStates, upsertUserState],
  );

  const toggleWishlist = useCallback(
    async (id: string) => {
      const current = userStates.get(id) ?? { visited: false, wishlist: false };
      await upsertUserState(id, { wishlist: !current.wishlist });
    },
    [userStates, upsertUserState],
  );

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const addRestaurant = useCallback(
    async (data: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) => {
      const newId = makeUUID();
      const { data: row, error: err } = await supabase
        .from('seoul_restaurants')
        .insert({
          id: newId,
          name: data.name,
          area: data.area ?? null,
          category: data.category ?? null,
          address: data.address ?? null,
          naver_map_url: data.naver_map_url ?? null,
          image_url: data.image_url ?? null,
          tags: data.tags ?? null,
          memo: data.memo ?? null,
          visited: false,
          priority: data.priority,
        })
        .select('id, name, area, category, address, naver_map_url, image_url, tags, memo, priority, created_at, updated_at')
        .single();

      if (err) throw new Error(err.message);

      const newRow = row as SupabaseRow;
      setRawRestaurants((prev) => [newRow, ...prev]);

      if (data.visited || data.wishlist) {
        await upsertUserState(newId, { visited: data.visited, wishlist: data.wishlist });
      }

      return newId;
    },
    [upsertUserState],
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
          ...(data.image_url !== undefined && { image_url: data.image_url ?? null }),
          ...(data.tags !== undefined && { tags: data.tags ?? null }),
          ...(data.memo !== undefined && { memo: data.memo ?? null }),
          ...(data.priority !== undefined && { priority: data.priority }),
        })
        .eq('id', id);

      if (err) throw new Error(err.message);

      setRawRestaurants((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...(data.name !== undefined && { name: data.name! }),
                ...(data.area !== undefined && { area: data.area ?? null }),
                ...(data.category !== undefined && { category: data.category ?? null }),
                ...(data.address !== undefined && { address: data.address ?? null }),
                ...(data.naver_map_url !== undefined && { naver_map_url: data.naver_map_url ?? null }),
                ...(data.image_url !== undefined && { image_url: data.image_url ?? null }),
                ...(data.tags !== undefined && { tags: data.tags ?? null }),
                ...(data.memo !== undefined && { memo: data.memo ?? null }),
                ...(data.priority !== undefined && { priority: data.priority! }),
                updated_at: new Date().toISOString(),
              }
            : r,
        ),
      );

      if (data.visited !== undefined || data.wishlist !== undefined) {
        await upsertUserState(id, {
          ...(data.visited !== undefined && { visited: data.visited }),
          ...(data.wishlist !== undefined && { wishlist: data.wishlist }),
        });
      }
    },
    [upsertUserState],
  );

  const deleteRestaurant = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('seoul_restaurants').delete().eq('id', id);
    if (err) throw new Error(err.message);
    setRawRestaurants((prev) => prev.filter((r) => r.id !== id));
    setUserStates((prev) => {
      const copy = new Map(prev);
      copy.delete(id);
      return copy;
    });
  }, []);

  // ── 리뷰 ─────────────────────────────────────────────────────────────────

  const getReviews = useCallback(async (restaurantId: string): Promise<Review[]> => {
    const { data, error: err } = await supabase
      .from('restaurant_reviews')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (err) throw new Error(err.message);
    return (data ?? []) as Review[];
  }, []);

  const saveReview = useCallback(
    async (restaurantId: string, rating: number, content: string) => {
      if (!userId) throw new Error('로그인이 필요합니다');
      const { data: userData } = await supabase.auth.getUser();
      const displayName =
        userData?.user?.user_metadata?.display_name ??
        userData?.user?.email?.split('@')[0] ??
        '익명';

      const { error: err } = await supabase.from('restaurant_reviews').upsert({
        id: makeUUID(),
        restaurant_id: restaurantId,
        user_id: userId,
        display_name: displayName,
        rating,
        content: content.trim() || null,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id,restaurant_id' });

      if (err) throw new Error(err.message);
    },
    [userId],
  );

  // ── 피드백 ────────────────────────────────────────────────────────────────

  const submitFeedback = useCallback(
    async (type: string, content: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const displayName =
        userData?.user?.user_metadata?.display_name ??
        userData?.user?.email?.split('@')[0] ??
        '익명';

      const { error: err } = await supabase.from('app_feedback').insert({
        id: makeUUID(),
        user_id: userId ?? null,
        display_name: displayName,
        type,
        content,
      });

      if (err) throw new Error(err.message);
    },
    [userId],
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
      toggleWishlist,
      getReviews,
      saveReview,
      submitFeedback,
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
      toggleWishlist,
      getReviews,
      saveReview,
      submitFeedback,
    ],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurants() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurants must be used inside RestaurantProvider');
  return ctx;
}
