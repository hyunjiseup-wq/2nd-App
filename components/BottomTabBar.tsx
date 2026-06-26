import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'home' | 'discover' | 'explore' | 'profile';

interface TabDef {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
}

const TABS: TabDef[] = [
  { key: 'home', label: '홈', icon: 'home-outline', iconActive: 'home', route: '/' },
  { key: 'discover', label: '전체 맛집', icon: 'restaurant-outline', iconActive: 'restaurant', route: '/discover' },
  { key: 'explore', label: '둘러보기', icon: 'compass-outline', iconActive: 'compass', route: '/explore' },
  { key: 'profile', label: '마이', icon: 'person-outline', iconActive: 'person', route: '/profile' },
];

// 탭바를 보여줄 메인 화면 경로 (그 외엔 숨김)
const MAIN_PATHS = new Set(['/', '/discover', '/explore', '/profile']);

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (!MAIN_PATHS.has(pathname)) return null;

  const go = (route: string) => {
    if (route === pathname) return;
    // navigate: 이미 스택에 있으면 재사용(중복 푸시 방지)
    router.navigate(route as any);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* 왼쪽 2개 */}
      {TABS.slice(0, 2).map((t) => (
        <TabButton key={t.key} tab={t} active={pathname === t.route} onPress={() => go(t.route)} />
      ))}

      {/* 가운데 + 버튼 */}
      <View style={styles.centerWrap}>
        <Pressable style={styles.fab} onPress={() => router.push('/form' as any)} hitSlop={6}>
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>
      </View>

      {/* 오른쪽 2개 */}
      {TABS.slice(2).map((t) => (
        <TabButton key={t.key} tab={t} active={pathname === t.route} onPress={() => go(t.route)} />
      ))}
    </View>
  );
}

function TabButton({ tab, active, onPress }: { tab: TabDef; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tab} onPress={onPress} hitSlop={4}>
      <Ionicons name={active ? tab.iconActive : tab.icon} size={23} color={active ? '#FF7A45' : '#B0B0B0'} />
      <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    ...Platform.select({
      web: { boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 12,
      },
    }),
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 11, color: '#B0B0B0', fontWeight: '500' },
  labelActive: { color: '#FF7A45', fontWeight: '700' },
  centerWrap: { width: 64, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF7A45',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    borderWidth: 3,
    borderColor: '#fff',
    ...Platform.select({
      web: { boxShadow: '0 4px 10px rgba(255,122,69,0.4)' } as any,
      default: {
        shadowColor: '#FF7A45',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
});
