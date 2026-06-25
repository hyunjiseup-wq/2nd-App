import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RestaurantProvider } from '@/context/RestaurantContext';

function AppStack() {
  const { user, loading, displayName, signOut } = useAuth();
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
            title: '🍽️ 서울 맛집 리스트',
            headerRight: () => (
              <Pressable
                onPress={() => router.push('/feedback' as any)}
                style={{ marginRight: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                hitSlop={8}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
              </Pressable>
            ),
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  signOut();
                }}
                style={{ marginLeft: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                hitSlop={8}
              >
                <Text style={{ color: '#fff', fontSize: 13 }}>{displayName}</Text>
                <Ionicons name="log-out-outline" size={18} color="#fff" />
              </Pressable>
            ),
          }}
        />
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
