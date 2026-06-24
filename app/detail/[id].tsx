import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_BG, CATEGORY_COLORS } from '@/constants/filters';
import { useRestaurants } from '@/context/RestaurantContext';

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < count ? 'star' : 'star-outline'}
          size={20}
          color={i < count ? '#FDCB6E' : '#ddd'}
        />
      ))}
    </View>
  );
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRestaurant, toggleVisited, deleteRestaurant } = useRestaurants();
  const [deleting, setDeleting] = useState(false);

  const restaurant = getRestaurant(id);

  if (!restaurant) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>맛집을 찾을 수 없어요</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  const { name, area, category, address, naver_map_url, tags, memo, visited, priority } = restaurant;
  const catColor = category ? CATEGORY_COLORS[category] ?? '#888' : '#888';
  const catBg = category ? CATEGORY_BG[category] ?? '#f5f5f5' : '#f5f5f5';

  function handleDelete() {
    Alert.alert('맛집 삭제', `"${name}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          await deleteRestaurant(id);
          router.back();
        },
      },
    ]);
  }

  function handleOpenMap() {
    if (!naver_map_url) return;
    Linking.openURL(naver_map_url).catch(() =>
      Alert.alert('오류', '지도를 열 수 없습니다.'),
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 헤더 카드 */}
        <View style={styles.heroCard}>
          <View style={styles.badges}>
            {category && (
              <View style={[styles.badge, { backgroundColor: catBg }]}>
                <Text style={[styles.badgeText, { color: catColor }]}>{category}</Text>
              </View>
            )}
            {area && (
              <View style={styles.areaBadge}>
                <Text style={styles.areaBadgeText}>📍 {area}</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroName}>{name}</Text>
          <View style={styles.starsRow}>
            <Stars count={priority} />
            <Text style={styles.priorityText}>우선순위 {priority}/5</Text>
          </View>

          {/* 방문 토글 */}
          <Pressable
            onPress={() => toggleVisited(id)}
            style={[styles.visitedToggle, visited && styles.visitedToggleActive]}
          >
            <Ionicons
              name={visited ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={visited ? '#fff' : '#aaa'}
            />
            <Text style={[styles.visitedToggleText, visited && styles.visitedToggleTextActive]}>
              {visited ? '방문 완료' : '아직 안 가봤어요'}
            </Text>
          </Pressable>
        </View>

        {/* 상세 정보 */}
        <View style={styles.infoCard}>
          <InfoRow icon="🗺️" label="주소" value={address} />
          <InfoRow icon="📝" label="메모" value={memo} />
        </View>

        {/* 태그 */}
        {tags && tags.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>태그</Text>
            <View style={styles.tagRow}>
              {tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 네이버 지도 버튼 */}
        {naver_map_url && (
          <Pressable
            onPress={handleOpenMap}
            style={({ pressed }) => [styles.mapBtn, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.mapBtnText}>네이버 지도로 보기</Text>
          </Pressable>
        )}

        {/* 액션 버튼 */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => router.push({ pathname: '/form', params: { id } })}
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="create-outline" size={18} color="#6C5CE7" />
            <Text style={styles.editBtnText}>수정</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            disabled={deleting}
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            <Text style={styles.deleteBtnText}>삭제</Text>
          </Pressable>
        </View>

        <Text style={styles.timestamp}>
          추가일: {new Date(restaurant.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFound: { fontSize: 17, color: '#555' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FF6B6B', borderRadius: 10 },
  backBtnText: { color: '#fff', fontWeight: '600' },

  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  areaBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#f0f0f0' },
  areaBadgeText: { fontSize: 13, color: '#666' },
  heroName: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityText: { fontSize: 13, color: '#888' },
  visitedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  visitedToggleActive: { backgroundColor: '#00B894' },
  visitedToggleText: { fontSize: 14, color: '#888', fontWeight: '500' },
  visitedToggleTextActive: { color: '#fff' },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoIcon: { fontSize: 18, marginTop: 1 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#aaa', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#333', lineHeight: 22 },

  sectionTitle: { fontSize: 13, color: '#aaa', fontWeight: '600', marginBottom: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 13, color: '#666' },

  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#03C75A',
    borderRadius: 14,
    paddingVertical: 14,
  },
  mapBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 10 },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
  },
  editBtnText: { color: '#6C5CE7', fontSize: 15, fontWeight: '700' },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
  },
  deleteBtnText: { color: '#FF6B6B', fontSize: 15, fontWeight: '700' },
  timestamp: { textAlign: 'center', fontSize: 12, color: '#ccc' },
});
