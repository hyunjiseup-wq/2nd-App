import React from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
  admin?: boolean;
  style?: StyleProp<ViewStyle>;
}

// 프로필 사진(있으면 이미지, 없으면 닉네임 첫 글자) 공용 아바타
export default function Avatar({ uri, name, size = 44, admin, style }: Props) {
  const radius = size / 2;
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: radius, backgroundColor: '#eee' }, style as any]}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius, backgroundColor: admin ? '#FF7A45' : '#6C5CE7' },
        style,
      ]}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: Math.round(size * 0.42) }}>
        {(name?.[0] ?? '?').toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
