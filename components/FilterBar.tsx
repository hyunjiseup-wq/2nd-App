import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AREAS, CATEGORIES } from '@/constants/filters';
import { VisitedFilter } from '@/types/restaurant';

interface Props {
  areaFilter: string | null;
  categoryFilter: string | null;
  visitedFilter: VisitedFilter;
  onAreaChange: (area: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onVisitedChange: (v: VisitedFilter) => void;
}

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor?: string;
}

function Chip({ label, active, onPress, activeColor = '#FF6B6B' }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: activeColor, borderColor: activeColor }]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const VISITED_OPTIONS: { label: string; value: VisitedFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '✓ 방문함', value: 'visited' },
  { label: '♡ 가고싶음', value: 'unvisited' },
];

export default function FilterBar({
  areaFilter,
  categoryFilter,
  visitedFilter,
  onAreaChange,
  onCategoryChange,
  onVisitedChange,
}: Props) {
  return (
    <View>
      {/* 지역 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Chip
          label="전체 지역"
          active={areaFilter === null}
          onPress={() => onAreaChange(null)}
        />
        {AREAS.map((area) => (
          <Chip
            key={area}
            label={area}
            active={areaFilter === area}
            onPress={() => onAreaChange(areaFilter === area ? null : area)}
          />
        ))}
      </ScrollView>

      {/* 카테고리 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Chip
          label="전체 카테고리"
          active={categoryFilter === null}
          onPress={() => onCategoryChange(null)}
          activeColor="#6C5CE7"
        />
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={categoryFilter === cat}
            onPress={() => onCategoryChange(categoryFilter === cat ? null : cat)}
            activeColor="#6C5CE7"
          />
        ))}
      </ScrollView>

      {/* 방문 필터 */}
      <View style={styles.visitedRow}>
        {VISITED_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onVisitedChange(opt.value)}
            style={[
              styles.visitedChip,
              visitedFilter === opt.value && styles.visitedChipActive,
            ]}
          >
            <Text
              style={[
                styles.visitedText,
                visitedFilter === opt.value && styles.visitedTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  visitedRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  visitedChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  visitedChipActive: {
    backgroundColor: '#00B894',
    borderColor: '#00B894',
  },
  visitedText: { fontSize: 13, color: '#555' },
  visitedTextActive: { color: '#fff', fontWeight: '600' },
});
