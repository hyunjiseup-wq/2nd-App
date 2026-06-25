import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRestaurants } from '@/context/RestaurantContext';
import { Feedback } from '@/types/restaurant';

const TYPE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  general: { label: '💬 일반', color: '#6C5CE7', bg: '#F0EEFF' },
  feature: { label: '✨ 기능 요청', color: '#00B894', bg: '#E8FFF9' },
  bug: { label: '🐛 버그', color: '#FF6B6B', bg: '#FFE8E8' },
  data: { label: '📍 정보 수정', color: '#E1A100', bg: '#FFF8E8' },
};

export default function AdminFeedbackScreen() {
  const { isAdmin } = useAuth();
  const { getAllFeedback } = useRestaurants();
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await getAllFeedback());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllFeedback]);

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
  }, [isAdmin, load]);

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={40} color="#ccc" />
        <Text style={styles.noAuth}>관리자만 볼 수 있는 화면이에요</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        renderItem={({ item }) => {
          const t = TYPE_LABEL[item.type] ?? TYPE_LABEL.general;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: t.bg }]}>
                  <Text style={[styles.typeBadgeText, { color: t.color }]}>{t.label}</Text>
                </View>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.content}>{item.content}</Text>
              <Text style={styles.author}>— {item.display_name ?? '익명'}</Text>
            </View>
          );
        }}
        ListHeaderComponent={
          <Text style={styles.header}>친구들이 보낸 피드백 {items.length}건</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptySub}>아직 받은 피드백이 없어요</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  noAuth: { fontSize: 15, color: '#999' },
  list: { padding: 16 },
  header: { fontSize: 14, color: '#888', marginBottom: 10, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },
  date: { fontSize: 12, color: '#bbb' },
  content: { fontSize: 15, color: '#333', lineHeight: 22 },
  author: { fontSize: 13, color: '#999', textAlign: 'right' },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptySub: { fontSize: 14, color: '#aaa' },
});
