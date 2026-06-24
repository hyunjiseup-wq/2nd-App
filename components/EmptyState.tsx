import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  title?: string;
  subtitle?: string;
}

export default function EmptyState({
  title = '맛집이 없어요',
  subtitle = '새로운 맛집을 추가해 보세요!',
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍽️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#333' },
  subtitle: { fontSize: 14, color: '#999' },
});
