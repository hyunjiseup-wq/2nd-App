import { Ionicons } from '@expo/vector-icons';
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
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (mode === 'signup' && !displayName.trim()) {
      Alert.alert('입력 오류', '닉네임을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, displayName.trim());
        Alert.alert(
          '가입 완료',
          '회원가입이 완료됐어요! 이메일 인증 없이 바로 로그인할 수 있어요.',
          [{ text: '로그인하기', onPress: () => setMode('login') }],
        );
      }
    } catch (e: any) {
      const msg = e.message ?? '오류가 발생했어요.';
      if (msg.includes('Invalid login credentials')) {
        Alert.alert('로그인 실패', '이메일 또는 비밀번호가 틀렸어요.');
      } else if (msg.includes('User already registered')) {
        Alert.alert('이미 가입된 계정', '해당 이메일로 이미 가입돼 있어요. 로그인해주세요.');
        setMode('login');
      } else {
        Alert.alert('오류', msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* 로고 */}
          <View style={styles.logoArea}>
            <Text style={styles.logoEmoji}>🍽️</Text>
            <Text style={styles.logoTitle}>서울 맛집 리스트</Text>
            <Text style={styles.logoSub}>나만의 서울 맛집을 기록하고 공유하세요</Text>
          </View>

          {/* 탭 */}
          <View style={styles.tabRow}>
            <Pressable
              onPress={() => setMode('login')}
              style={[styles.tab, mode === 'login' && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>로그인</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('signup')}
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>회원가입</Text>
            </Pressable>
          </View>

          {/* 폼 */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="닉네임 (예: 현지)"
                placeholderTextColor="#bbb"
                autoCapitalize="none"
                returnKeyType="next"
              />
            )}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              placeholderTextColor="#bbb"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호 (6자 이상)"
              placeholderTextColor="#bbb"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
            >
              <Ionicons name={mode === 'login' ? 'log-in-outline' : 'person-add-outline'} size={20} color="#fff" />
              <Text style={styles.btnText}>
                {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            {mode === 'login'
              ? '아직 계정이 없으신가요? 위에서 회원가입하세요.'
              : '이미 계정이 있으신가요? 위에서 로그인하세요.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60, gap: 0 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 56 },
  logoTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginTop: 8 },
  logoSub: { fontSize: 14, color: '#999', marginTop: 6, textAlign: 'center' },
  tabRow: { flexDirection: 'row', marginBottom: 20, borderRadius: 12, backgroundColor: '#f5f5f5', padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 15, color: '#aaa', fontWeight: '600' },
  tabTextActive: { color: '#FF6B6B' },
  form: { gap: 12, marginBottom: 16 },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 13, color: '#bbb', marginTop: 8 },
});
