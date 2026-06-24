import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RestaurantProvider } from '@/context/RestaurantContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            options={{ title: '🍽️ 서울 맛집 리스트' }}
          />
          <Stack.Screen
            name="form"
            options={({ route }: any) => ({
              title: route.params?.id ? '맛집 수정' : '맛집 추가',
              presentation: 'modal',
            })}
          />
          <Stack.Screen
            name="detail/[id]"
            options={{ title: '맛집 상세' }}
          />
        </Stack>
      </RestaurantProvider>
    </GestureHandlerRootView>
  );
}
