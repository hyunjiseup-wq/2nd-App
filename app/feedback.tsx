import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurants } from '@/context/RestaurantContext';

const TYPES = [
  { value: 'general', label: '💬 일반 피드백', color: '#6C5CE7' },
  { value: 'feature', label: '✨ 기능 요청', color: '#00B894' },
  { value: 'bug', label: '🐛 버그 신고', color: '#FF6B6B' },
  { value: 'data', label: '📍 맛집 정보 수정', color: '#FDCB6E' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const { submitFeedback } = useRestaurants();
  const [type, setType] = useState('general');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!content.trim()) {
      Alert.alert('내용을 입력해주세요');
      return;
    }
    setSending(true);
    try {
      await submitFeedback(type, content.trim());
      Alert.alert('감사합니다!', '피드백이 전송됐어요. 소중한 의견 고마워요 😊', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('오류', '전송에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.desc}>
            불편한 점, 추가됐으면 하는 기능, 잘못된 맛집 정보 등 뭐든 알려주세요!
          </Text>

          {/* 유형 선택 */}
          <View style={styles.typeGrid}>
            {TYPES.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setType(t.value)}
                style={[
                  styles.typeChip,
                  type === t.value && { backgroundColor: t.color, borderColor: t.color },
                ]}
              >
                <Text style={[styles.typeText, type === t.value && { color: '#fff' }]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 내용 */}
          <TextInput
            style={styles.textarea}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 자유롭게 적어주세요..."
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Pressable
            onPress={handleSend}
            disabled={sending}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }, sending && { opacity: 0.6 }]}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.btnText}>{sending ? '전송 중...' : '피드백 보내기'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  desc: { fontSize: 14, color: '#666', lineHeight: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  typeText: { fontSize: 13, color: '#555', fontWeight: '500' },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 140,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
