import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RestaurantCard from '@/components/RestaurantCard';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/context/AuthContext';
import { useRestaurants } from '@/context/RestaurantContext';
import { Restaurant } from '@/types/restaurant';

export default function UserListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { getUserRestaurants, getUsers, copyRestaurant, restaurants: myRestaurants } = useRestaurants();

  const [items, setItems] = useState<Restaurant[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());

  const isMyList = id === user?.id;

  // 내가 이미 담은 맛집 이름 집합 (중복 담기 방지 표시용)
  const myNames = new Set(myRestaurants.map((r) => r.name));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, users] = await Promise.all([getUserRestaurants(id), getUsers()]);
      setItems(list);
      const owner = users.find((u) => u.id === id);
      setOwnerName(owner?.display_name ?? '사용자');
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [id, getUserRestaurants, getUsers]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    navigation.setOptions({ title: ownerName ? `${ownerName}님의 리스트` : '리스트' });
  }, [ownerName, navigation]);

  async function handleCopy(r: Restaurant) {
    try {
      await copyRestaurant(r);
      setCopiedIds((prev) => new Set(prev).add(r.id));
    } catch {
      // 실패 시 무시
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter((r) => `${r.name} ${r.area ?? ''} ${r.memo ?? ''}`.toLowerCase().includes(q))
    : items;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            mode={isMyList ? 'own' : 'browse'}
            onPress={() => router.push(`/detail/${item.id}`)}
            onCopy={() => handleCopy(item)}
            copied={copiedIds.has(item.id) || (!isMyList && myNames.has(item.name))}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                {isMyList ? '내 리스트예요' : `${ownerName}님이 추천하는 맛집 ${items.length}곳`}
              </Text>
            </View>
            <SearchBar value={query} onChangeText={setQuery} />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptySub}>
              {q ? '검색 결과가 없어요' : '아직 등록된 맛집이 없어요'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: 40 },
  banner: {
    backgroundColor: '#F0EEFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerText: { fontSize: 14, color: '#6C5CE7', fontWeight: '600', textAlign: 'center' },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptySub: { fontSize: 14, color: '#aaa' },
});
