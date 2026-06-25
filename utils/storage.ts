import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant } from '@/types/restaurant';
import { inferAreaFromAddress } from '@/constants/filters';
import rawSeedData from '@/seoul_restaurant_app_starter/restaurants_from_json.json';

const STORAGE_KEY = '@seoul_restaurants';
const INITIALIZED_KEY = '@seoul_restaurants_initialized';

interface RawRestaurant {
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
  lat?: number;
  lng?: number;
}

function transformRaw(raw: RawRestaurant): Restaurant {
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter(Boolean)
    : typeof raw.tags === 'string' && raw.tags.trim()
    ? raw.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const area = raw.area || inferAreaFromAddress(raw.address);
  const now = new Date().toISOString();

  return {
    id: String(raw.id),
    owner_id: '',
    name: raw.name,
    area: area || undefined,
    category: raw.category || undefined,
    address: raw.address || undefined,
    naver_map_url: raw.naver_map_url || undefined,
    tags: tags.length > 0 ? tags : undefined,
    memo: raw.memo || undefined,
    visited: raw.visited ?? false,
    wishlist: false,
    priority: raw.priority ?? 3,
    created_at: now,
    updated_at: now,
  };
}

export async function loadRestaurants(): Promise<Restaurant[]> {
  const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
  if (!initialized) {
    const seed = (rawSeedData as RawRestaurant[]).map(transformRaw);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
    return seed;
  }
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Restaurant[]) : [];
}

export async function saveRestaurants(restaurants: Restaurant[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
