import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AREAS, CATEGORIES } from '@/constants/filters';
import { useRestaurants } from '@/context/RestaurantContext';
import { Restaurant } from '@/types/restaurant';

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {text}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Label text={label} required={required} />
      {children}
    </View>
  );
}

function ChipSelector({
  options,
  value,
  onChange,
  color = '#FF6B6B',
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  color?: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(active ? '' : opt)}
              style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={4}>
          <Ionicons
            name={n <= value ? 'star' : 'star-outline'}
            size={28}
            color={n <= value ? '#FDCB6E' : '#ddd'}
          />
        </Pressable>
      ))}
      <Text style={styles.priorityLabel}>{value}/5</Text>
    </View>
  );
}

type FormData = {
  name: string;
  area: string;
  category: string;
  address: string;
  naver_map_url: string;
  tagsInput: string;
  memo: string;
  visited: boolean;
  priority: number;
};

export default function FormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { getRestaurant, addRestaurant, updateRestaurant } = useRestaurants();

  const isEdit = Boolean(id);
  const existing = id ? getRestaurant(id) : undefined;

  const [form, setForm] = useState<FormData>({
    name: '',
    area: '',
    category: '',
    address: '',
    naver_map_url: '',
    tagsInput: '',
    memo: '',
    visited: false,
    priority: 3,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        area: existing.area ?? '',
        category: existing.category ?? '',
        address: existing.address ?? '',
        naver_map_url: existing.naver_map_url ?? '',
        tagsInput: (existing.tags ?? []).join(', '),
        memo: existing.memo ?? '',
        visited: existing.visited,
        priority: existing.priority,
      });
    }
  }, []);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert('입력 오류', '식당 이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    const tags = form.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> = {
      name: form.name.trim(),
      area: form.area || undefined,
      category: form.category || undefined,
      address: form.address.trim() || undefined,
      naver_map_url: form.naver_map_url.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      memo: form.memo.trim() || undefined,
      visited: form.visited,
      priority: form.priority,
    };

    if (isEdit && id) {
      await updateRestaurant(id, payload);
    } else {
      await addRestaurant(payload);
    }
    setSaving(false);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* 식당 이름 */}
          <Field label="식당 이름" required>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => set('name', v)}
              placeholder="예: 성수연방"
              placeholderTextColor="#ccc"
              returnKeyType="next"
            />
          </Field>

          {/* 지역 */}
          <Field label="지역">
            <TextInput
              style={styles.input}
              value={form.area}
              onChangeText={(v) => set('area', v)}
              placeholder="직접 입력하거나 아래에서 선택"
              placeholderTextColor="#ccc"
            />
            <ChipSelector
              options={AREAS}
              value={form.area}
              onChange={(v) => set('area', v)}
            />
          </Field>

          {/* 카테고리 */}
          <Field label="카테고리">
            <TextInput
              style={styles.input}
              value={form.category}
              onChangeText={(v) => set('category', v)}
              placeholder="직접 입력하거나 아래에서 선택"
              placeholderTextColor="#ccc"
            />
            <ChipSelector
              options={CATEGORIES}
              value={form.category}
              onChange={(v) => set('category', v)}
              color="#6C5CE7"
            />
          </Field>

          {/* 주소 */}
          <Field label="주소">
            <TextInput
              style={styles.input}
              value={form.address}
              onChangeText={(v) => set('address', v)}
              placeholder="서울 성동구 연무장5가길 7"
              placeholderTextColor="#ccc"
            />
          </Field>

          {/* 네이버 지도 URL */}
          <Field label="네이버 지도 URL">
            <TextInput
              style={styles.input}
              value={form.naver_map_url}
              onChangeText={(v) => set('naver_map_url', v)}
              placeholder="https://map.naver.com/..."
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              keyboardType="url"
            />
          </Field>

          {/* 태그 */}
          <Field label="태그 (쉼표로 구분)">
            <TextInput
              style={styles.input}
              value={form.tagsInput}
              onChangeText={(v) => set('tagsInput', v)}
              placeholder="예: 라멘, 줄서는집, 혼밥"
              placeholderTextColor="#ccc"
            />
          </Field>

          {/* 메모 */}
          <Field label="메모">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.memo}
              onChangeText={(v) => set('memo', v)}
              placeholder="방문 후기나 기억할 점을 적어두세요"
              placeholderTextColor="#ccc"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Field>

          {/* 우선순위 */}
          <Field label="우선순위">
            <StarPicker value={form.priority} onChange={(v) => set('priority', v)} />
          </Field>

          {/* 방문 여부 */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>방문 완료</Text>
            <Switch
              value={form.visited}
              onValueChange={(v) => set('visited', v)}
              trackColor={{ false: '#ddd', true: '#00B894' }}
              thumbColor="#fff"
            />
          </View>

          {/* 저장 버튼 */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }, saving && { opacity: 0.6 }]}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? '저장 중...' : isEdit ? '수정 완료' : '추가하기'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, gap: 4, paddingBottom: 40 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  required: { color: '#FF6B6B' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
  },
  textarea: { height: 100, paddingTop: 12 },
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
  priorityLabel: { alignSelf: 'center', fontSize: 14, color: '#888', marginLeft: 4 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  switchLabel: { fontSize: 15, color: '#333', fontWeight: '500' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
