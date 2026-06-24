import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '@/components/EmptyState';
import FilterBar from '@/components/FilterBar';
import RestaurantCard from '@/components/RestaurantCard';
import SearchBar from '@/components/SearchBar';
import { useRestaurants } from '@/context/RestaurantContext';

export default function HomeScreen() {
  const router = useRouter();
  const {
    filteredRestaurants,
    loading,
    searchQuery,
    areaFilter,
    categoryFilter,
    visitedFilter,
    setSearchQuery,
    setAreaFilter,
    setCategoryFilter,
    setVisitedFilter,
    toggleVisited,
  } = useRestaurants();

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
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/detail/${item.id}`)}
            onToggleVisited={() => toggleVisited(item.id)}
          />
        )}
        ListHeaderComponent={
          <>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            <FilterBar
              areaFilter={areaFilter}
              categoryFilter={categoryFilter}
              visitedFilter={visitedFilter}
              onAreaChange={setAreaFilter}
              onCategoryChange={setCategoryFilter}
              onVisitedChange={setVisitedFilter}
            />
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                총 {filteredRestaurants.length}개의 맛집
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title={searchQuery ? '검색 결과가 없어요' : '맛집이 없어요'}
            subtitle={searchQuery ? '다른 키워드로 검색해 보세요' : '아래 + 버튼으로 추가하세요'}
          />
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />

      {/* 맛집 추가 FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        onPress={() => router.push('/form')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: 100 },
  countRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    paddingTop: 2,
  },
  countText: { fontSize: 12, color: '#aaa' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
