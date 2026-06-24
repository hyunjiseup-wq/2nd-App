import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_BG, CATEGORY_COLORS } from '@/constants/filters';
import { Restaurant } from '@/types/restaurant';

interface Props {
  restaurant: Restaurant;
  onPress: () => void;
  onToggleVisited: () => void;
}

function Stars({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < count ? 'star' : 'star-outline'}
          size={12}
          color={i < count ? '#FDCB6E' : '#ccc'}
        />
      ))}
    </View>
  );
}

export default function RestaurantCard({ restaurant, onPress, onToggleVisited }: Props) {
  const { name, area, category, memo, tags, priority, visited } = restaurant;
  const catColor = category ? CATEGORY_COLORS[category] ?? '#888' : '#888';
  const catBg = category ? CATEGORY_BG[category] ?? '#f5f5f5' : '#f5f5f5';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      {/* 상단: 카테고리 배지 + 지역 + 별점 */}
      <View style={styles.topRow}>
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
        <Stars count={priority} />
      </View>

      {/* 식당 이름 */}
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>

      {/* 메모 */}
      {memo ? (
        <Text style={styles.memo} numberOfLines={2}>
          {memo}
        </Text>
      ) : null}

      {/* 태그 */}
      {tags && tags.length > 0 && (
        <View style={styles.tagRow}>
          {tags.slice(0, 4).map((tag, i) => (
            <Text key={i} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}

      {/* 하단: 방문 토글 + 화살표 */}
      <View style={styles.bottomRow}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggleVisited();
          }}
          style={[styles.visitedBtn, visited && styles.visitedBtnActive]}
          hitSlop={4}
        >
          <Ionicons
            name={visited ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={visited ? '#fff' : '#aaa'}
          />
          <Text style={[styles.visitedBtnText, visited && styles.visitedBtnTextActive]}>
            {visited ? '방문함' : '가고싶음'}
          </Text>
        </Pressable>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  areaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  areaBadgeText: { fontSize: 12, color: '#666' },
  name: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  memo: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  tag: { fontSize: 12, color: '#999', backgroundColor: '#f8f8f8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  visitedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  visitedBtnActive: { backgroundColor: '#00B894' },
  visitedBtnText: { fontSize: 12, color: '#888', fontWeight: '500' },
  visitedBtnTextActive: { color: '#fff' },
});
