import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, DollarSign, Heart, Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { createMeeting } from '@/lib/supabase';

const meetingTypes = [
  { id: 'date', label: 'Date 🎭' },
  { id: 'hangout', label: 'Hangout 🎮' },
  { id: 'came-over', label: 'Came Over 🏠' },
  { id: 'saw-out', label: 'Saw Out 🎉' },
  { id: 'other', label: 'Other 📝' },
];

const bases = [
  { id: 'strikeout', emoji: '❌', label: 'Strikeout' },
  { id: 'home', emoji: '🍑', label: 'Home Run' },
];

export default function AddMeetingScreen() {
  const { id } = useLocalSearchParams();
  const [meetingType, setMeetingType] = useState('');
  const [amount, setAmount] = useState('');
  const [base, setBase] = useState('');
  const [performanceRating, setPerformanceRating] = useState(5);
  const [dateRating, setDateRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!meetingType) {
      setError('Please select a meeting type');
      return;
    }

    if (!dateRating) {
      setError('Please rate the date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createMeeting({
        profile_id: id as string,
        type: meetingType,
        amount_spent: amount ? parseFloat(amount) : 0,
        base: base || undefined,
        rating: dateRating,
        performance_rating: base === 'home' ? performanceRating : undefined,
        notes: notes || undefined,
        date: new Date().toISOString(),
      });

      router.back();
    } catch (err) {
      console.error('Error saving meeting:', err);
      setError('Failed to save meeting');
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
        <Text style={styles.headerTitle}>Add Meeting</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Save Meeting</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type of Meeting</Text>
          <View style={styles.typeGrid}>
            {meetingTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  meetingType === type.id && styles.typeButtonActive
                ]}
                onPress={() => setMeetingType(type.id)}
              >
                <Text style={[
                  styles.typeButtonText,
                  meetingType === type.id && styles.typeButtonTextActive
                ]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How Much You Spent</Text>
          <View style={styles.inputContainer}>
            <DollarSign size={20} color={Colors.gray[400]} />
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base You Got To</Text>
          <View style={styles.basesContainer}>
            {bases.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.baseButton,
                  base === b.id && styles.baseButtonActive
                ]}
                onPress={() => setBase(b.id)}
              >
                <Text style={styles.baseEmoji}>{b.emoji}</Text>
                <Text style={[
                  styles.baseLabel,
                  base === b.id && styles.baseLabelActive
                ]}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {base === 'home' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rate the Performance</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.ratingButton,
                    performanceRating === num && styles.ratingButtonActive
                  ]}
                  onPress={() => setPerformanceRating(num)}
                >
                  <Text style={[
                    styles.ratingText,
                    performanceRating === num && styles.ratingTextActive
                  ]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate the Date</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.ratingButton,
                  dateRating === num && styles.ratingButtonActive
                ]}
                onPress={() => setDateRating(num)}
              >
                <Text style={[
                  styles.ratingText,
                  dateRating === num && styles.ratingTextActive
                ]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes & Highlights</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add important details, facts learned, etc."
            placeholderTextColor={Colors.gray[400]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Save Meeting</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: Colors.green[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.green[600],
  },
  buttonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  scrollView: {
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: Colors.secondary[300],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
    minWidth: '48%',
  },
  typeButtonActive: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[600],
  },
  typeButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.white,
    paddingVertical: 12,
    marginLeft: 8,
  },
  basesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  baseButton: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  baseButtonActive: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[600],
  },
  baseEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  baseLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  baseLabelActive: {
    color: Colors.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary[300],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  ratingButtonActive: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[600],
  },
  ratingText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.gray[400],
  },
  ratingTextActive: {
    color: Colors.white,
  },
  notesInput: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    padding: 16,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.white,
    height: 120,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  submitButton: {
    backgroundColor: Colors.secondary[500],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.secondary[600],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});