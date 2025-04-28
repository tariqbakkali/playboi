import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/Colors';
import { getProfiles, createUpcomingDate, updateUpcomingDate, type Profile, type UpcomingDate } from '@/lib/supabase';
import { format } from 'date-fns';

const meetingTypes = [
  { id: 'date', label: 'Date 🎭' },
  { id: 'hangout', label: 'Hangout 🎮' },
  { id: 'came-over', label: 'Came Over 🏠' },
  { id: 'saw-out', label: 'Saw Out 🎉' },
  { id: 'other', label: 'Other 📝' },
];

export default function AddDateScreen() {
  const params = useLocalSearchParams();
  const isEditing = !!params.dateId;
  const initialData = params.initialData ? JSON.parse(params.initialData as string) as UpcomingDate : null;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>(initialData?.profile_id || '');
  const [meetingType, setMeetingType] = useState(initialData?.type || '');
  const [date, setDate] = useState(initialData ? new Date(initialData.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles');
    }
  }

  function handleDateChange(event: any, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      // Preserve the existing time
      newDate.setHours(date.getHours(), date.getMinutes());
      setDate(newDate);
    }
  }

  function handleTimeChange(event: any, selectedTime?: Date) {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(newDate);
    }
  }

  async function handleSubmit() {
    if (!selectedProfile) {
      setError('Please select a player');
      return;
    }

    if (!meetingType) {
      setError('Please select a meeting type');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateData = {
        profile_id: selectedProfile,
        type: meetingType,
        date: date.toISOString(),
        notes: notes || undefined,
      };

      if (isEditing && params.dateId) {
        await updateUpcomingDate(params.dateId as string, dateData);
      } else {
        await createUpcomingDate(dateData);
      }

      router.back();
    } catch (err) {
      console.error('Error saving upcoming date:', err);
      setError('Failed to save upcoming date');
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
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Date' : 'Schedule Date'}</Text>
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

      <ScrollView style={styles.scrollView}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Player</Text>
          <View style={styles.profileGrid}>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileButton,
                  selectedProfile === profile.id && styles.profileButtonActive
                ]}
                onPress={() => setSelectedProfile(profile.id)}
              >
                <Text style={[
                  styles.profileButtonText,
                  selectedProfile === profile.id && styles.profileButtonTextActive
                ]}>{profile.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          {/* Date Picker */}
          <TouchableOpacity 
            style={styles.dateTimeContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={Colors.gray[400]} />
            <Text style={styles.dateTimeText}>
              {format(date, 'EEEE, MMMM d, yyyy')}
            </Text>
          </TouchableOpacity>

          {/* Time Picker */}
          <TouchableOpacity 
            style={[styles.dateTimeContainer, { marginTop: 8 }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Clock size={20} color={Colors.gray[400]} />
            <Text style={styles.dateTimeText}>
              {format(date, 'h:mm a')}
            </Text>
          </TouchableOpacity>

          {/* iOS Date Picker Modal */}
          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={styles.pickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerButtonText, styles.pickerDoneText]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor={Colors.white}
              />
            </View>
          )}

          {/* iOS Time Picker Modal */}
          {Platform.OS === 'ios' && showTimePicker && (
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity 
                  onPress={() => setShowTimePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={styles.pickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowTimePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerButtonText, styles.pickerDoneText]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor={Colors.white}
              />
            </View>
          )}

          {/* Android Pickers */}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {Platform.OS === 'android' && showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes & Details</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any important details or plans"
            placeholderTextColor={Colors.gray[600]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
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
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileButton: {
    backgroundColor: Colors.secondary[300],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
    minWidth: '48%',
  },
  profileButtonActive: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[600],
  },
  profileButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  profileButtonTextActive: {
    color: Colors.white,
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
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  dateTimeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 12,
  },
  pickerModal: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[400],
  },
  pickerButton: {
    paddingHorizontal: 12,
  },
  pickerButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.white,
  },
  pickerDoneText: {
    color: Colors.green[500],
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
});