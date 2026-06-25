import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRestaurants } from '@/context/RestaurantContext';
import { Profile } from '@/types/restaurant';

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getUsers } = useRestaurants();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMe = item.id === user?.id;
          return (
            <Pressable
              style={({ pressed }) => [styles.userCard, pressed && { opacity: 0.9 }]}
              onPress={() => router.push(`/user/${item.id}` as any)}
            >
              <View style={[styles.avatar, item.is_admin && styles.avatarAdmin]}>
                <Text style={styles.avatarText}>{item.display_name[0] ?? '?'}</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>
                    {item.display_name}
                    {isMe && <Text style={styles.meTag}> (나)</Text>}
                  </Text>
                  {item.is_admin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>공식</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userCount}>맛집 {item.count ?? 0}개</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <Text style={styles.header}>
            다른 사람의 맛집 리스트를 구경하고{'\n'}맘에 드는 곳을 내 리스트로 담아보세요 👀
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptySub}>아직 사용자가 없어요</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 8 },
  header: { fontSize: 14, color: '#888', lineHeight: 20, marginBottom: 8, paddingHorizontal: 2 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAdmin: { backgroundColor: '#FF6B6B' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  meTag: { fontSize: 13, color: '#aaa', fontWeight: '500' },
  adminBadge: { backgroundColor: '#FFE8E8', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  adminBadgeText: { fontSize: 11, color: '#FF6B6B', fontWeight: '700' },
  userCount: { fontSize: 13, color: '#999', marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptySub: { fontSize: 14, color: '#aaa' },
});
