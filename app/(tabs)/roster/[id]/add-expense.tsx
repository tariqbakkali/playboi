import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { createMeeting } from '@/lib/supabase';

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    if (!description) {
      setError('Please enter a description');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createMeeting({
        profile_id: id as string,
        type: 'expense',
        amount_spent: parseFloat(amount),
        notes: description,
        date: new Date().toISOString(),
        // Remove the rating field since expenses don't need ratings
      });

      router.back();
    } catch (err) {
      console.error('Error saving expense:', err);
      setError('Failed to save expense');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Check size={24} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor={Colors.gray[600]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="What was this expense for?"
              placeholderTextColor={Colors.gray[600]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary[400],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  headerTitle: {
    fontFamily: 'Rubik-Bold',
    fontSize: 20,
    color: Colors.white,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.green[600],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.red[500],
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: Colors.secondary[300],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.white,
  },
  input: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    padding: 16,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  textArea: {
    minHeight: 120,
  },
});