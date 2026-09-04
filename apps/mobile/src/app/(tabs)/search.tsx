import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '../../components/Screen';

const sampleResults = ['alice', 'funspot', 'design', 'launch'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <Screen title="Search" subtitle="Explore people, posts, and hashtags">
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setQuery}
        placeholder="Search users or topics"
        style={styles.input}
        value={query}
      />

      <View style={styles.grid}>
        {(query ? sampleResults.filter((item) => item.toLowerCase().includes(query.toLowerCase())) : sampleResults).map((item) => (
          <View key={item} style={styles.chip}>
            <Text style={styles.chipText}>#{item}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
});
