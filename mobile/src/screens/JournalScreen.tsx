import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { addEntry, getAllEntries, updateEntry } from '../storage/journalLog';
import { JournalEntry } from '../types/journal';

// Spec §7: optional post-session prompt (see HomeScreen's focus check) +
// manual entry from Home, both landing here. Offline-first (local storage,
// synced by ../sync/syncEngine.ts when signed in). Edits are permitted;
// edit history is explicitly not required by spec, so there isn't one.

type Props = NativeStackScreenProps<RootStackParamList, 'Journal'>;

const MOODS = [1, 2, 3, 4, 5];

export default function JournalScreen({ route }: Props) {
  const { cardId, sessionId } = route.params ?? {};

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [mood, setMood] = useState<number | null>(null);

  const reload = useCallback(() => {
    getAllEntries().then(setEntries);
  }, []);

  useFocusEffect(reload);

  const onSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingId) {
      await updateEntry(editingId, { text: trimmed, mood });
    } else {
      await addEntry({ text: trimmed, mood, cardId, sessionId });
    }

    setText('');
    setMood(null);
    setEditingId(null);
    reload();
  };

  const onEdit = (entry: JournalEntry) => {
    setEditingId(entry.entryId);
    setText(entry.text);
    setMood(entry.mood);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setText('');
    setMood(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="What's on your mind?"
          placeholderTextColor="#8a8aa0"
          multiline
        />
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.moodButton, mood === m && styles.moodButtonSelected]}
              onPress={() => setMood(mood === m ? null : m)}
            >
              <Text style={styles.moodButtonText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.composerActions}>
          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveButton, !text.trim() && styles.saveButtonDisabled]}
            onPress={onSave}
            disabled={!text.trim()}
          >
            <Text style={styles.saveButtonText}>{editingId ? 'Save' : 'Add entry'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(e) => e.entryId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.entry} onPress={() => onEdit(item)}>
            <Text style={styles.entryDate}>
              {new Date(item.createdAt).toLocaleDateString()}
              {item.mood ? ` · mood ${item.mood}/5` : ''}
            </Text>
            <Text style={styles.entryText} numberOfLines={3}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet.</Text>}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a24',
  },
  composer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2b3a',
  },
  input: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 14,
    color: '#e6e6f0',
    fontSize: 15,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  moodButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2b2b3a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodButtonSelected: {
    backgroundColor: '#f2c14e',
  },
  moodButtonText: {
    color: '#e6e6f0',
    fontWeight: '600',
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#b8b8c8',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#f2c14e',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#1a1a24',
    fontWeight: '700',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  entry: {
    backgroundColor: '#2b2b3a',
    borderRadius: 12,
    padding: 14,
  },
  entryDate: {
    color: '#8a8aa0',
    fontSize: 12,
    marginBottom: 4,
  },
  entryText: {
    color: '#e6e6f0',
    fontSize: 14,
  },
  emptyText: {
    color: '#8a8aa0',
    textAlign: 'center',
    marginTop: 40,
  },
});
