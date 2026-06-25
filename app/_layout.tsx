import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RestaurantProvider } from '@/context/RestaurantContext';

function HeaderIcon({ name, onPress }: { name: any; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ paddingHorizontal: 6 }}>
      <Ionicons name={name} size={21} color="#fff" />
    </Pressable>
  );
}

function AppStack() {
  const { user, loading, displayName, isAdmin, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    );
  }

  return (
    <RestaurantProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FF6B6B' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: '🍽️ 내 맛집 리스트',
            headerLeft: () => (
              <Pressable
                onPress={signOut}
                style={{ marginLeft: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                hitSlop={8}
              >
                <Text style={{ color: '#fff', fontSize: 13 }}>{displayName}</Text>
                <Ionicons name="log-out-outline" size={18} color="#fff" />
              </Pressable>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isAdmin && (
                  <HeaderIcon name="mail-outline" onPress={() => router.push('/admin/feedback' as any)} />
                )}
                <HeaderIcon name="compass-outline" onPress={() => router.push('/explore' as any)} />
                <HeaderIcon name="chatbubble-outline" onPress={() => router.push('/feedback' as any)} />
              </View>
            ),
          }}
        />
        <Stack.Screen name="explore" options={{ title: '둘러보기' }} />
        <Stack.Screen name="user/[id]" options={{ title: '리스트' }} />
        <Stack.Screen
          name="form"
          options={({ route }: any) => ({
            title: route.params?.id ? '맛집 수정' : '맛집 추가',
            presentation: 'modal',
          })}
        />
        <Stack.Screen name="detail/[id]" options={{ title: '맛집 상세' }} />
        <Stack.Screen name="feedback" options={{ title: '피드백 보내기', presentation: 'modal' }} />
        <Stack.Screen name="review/[id]" options={{ title: '리뷰 작성', presentation: 'modal' }} />
        <Stack.Screen name="admin/feedback" options={{ title: '받은 피드백' }} />
      </Stack>
    </RestaurantProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppStack />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
