import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image as RNImage, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useRootNavigationState } from 'expo-router';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';
import { getProfiles, getUpcomingDates, getMeetings, type Profile, type UpcomingDate, type Meeting } from '@/lib/supabase';
import RosterCard from '@/components/RosterCard';
import WeekCalendar from '@/components/WeekCalendar';
import PlayboiInsights from '@/components/PlayboiInsights';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Bell } from 'lucide-react-native';

export default function LineupScreen() {
  const { user } = useAuth();
  const rootNavigationState = useRootNavigationState();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [trackModalVisible, setTrackModalVisible] = useState(false);
  const [prefillMeeting, setPrefillMeeting] = useState<any>(null);
  const [meetingNotes, setMeetingNotes] = useState('');

  // Handle authentication
  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (!user) router.replace('/(auth)/sign-in');
  }, [user, rootNavigationState]);

  // Load data when authenticated
  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      setError(null);
      
      const [profilesData, upcomingDatesData] = await Promise.all([
        getProfiles(),
        getUpcomingDates()
      ]);
      
      setProfiles(profilesData);
      setUpcomingDates(upcomingDatesData);

      if (profilesData.length > 0) {
        const meetingsPromises = profilesData.map(profile => getMeetings(profile.id));
        const meetingsData = await Promise.all(meetingsPromises);
        setMeetings(meetingsData.flat());
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // Playboi Reply logic
  async function pickChatImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        setChatImage(result.assets[0].uri);
        setReply(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick image.');
    }
  }

  async function getPlayboiReply() {
    if (!chatImage) return;
    setReplyLoading(true);
    setReply(null);
    try {
      // Use OpenAI API key from environment
      const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      // Convert image to base64
      const response = await fetch(chatImage);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        // Call OpenAI Vision API (GPT-4o, 04-mini)
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a witty, charming playboi. Analyze the chat screenshot and suggest a clever, playful reply.'
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: 'Here is a screenshot of my chat. What should I reply to keep the conversation fun and flirty? Make sure you analyze all of the most recent messages sent so that it is within content' },
                  { type: 'image_url', image_url: { url: base64data } }
                ]
              }
            ],
            max_tokens: 200,
          }),
        });
        const data = await openaiRes.json();
        console.log(data); // For debugging
        if (data.error) {
          setReply('OpenAI error: ' + data.error.message);
          setReplyLoading(false);
          return;
        }
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          setReply(data.choices[0].message.content.trim());
        } else {
          setReply('Could not get a reply. Try again.');
        }
        setReplyLoading(false);
      };
    } catch (err) {
      setReply('Error getting reply.');
      setReplyLoading(false);
    }
  }

  // Expo Notifications setup
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Listen for notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const upcomingDateId = response.notification.request.content.data.upcomingDateId;
      const date = upcomingDates.find(d => d.id === upcomingDateId);
      if (date) {
        setPrefillMeeting(date);
        setMeetingNotes(date.notes || '');
        setTrackModalVisible(true);
      }
    });
    return () => subscription.remove();
  }, [upcomingDates]);

  if (!user) return null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Lineup" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Lineup" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Lineup" 
        rightElement={
          <TouchableOpacity onPress={() => console.log('Notification bell pressed')} style={{ padding: 4 }}>
            <Bell size={22} color={Colors.white} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[500]}
            colors={[Colors.primary[500]]}
            progressBackgroundColor={Colors.secondary[300]}
          />
        }
      >
        <View style={styles.content}>
          <WeekCalendar upcomingDates={upcomingDates.filter((date): date is UpcomingDate & { profiles: { name: string } } => date.profiles !== undefined)} />

          <Text style={styles.sectionTitle}>Recently Active</Text>

          {profiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No players added yet</Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => router.push('/roster/add-player')}
              >
                <Text style={styles.addFirstButtonText}>Add Your First Player</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              {profiles.map((profile) => (
                <TouchableOpacity 
                  key={profile.id}
                  style={styles.cardContainer}
                  onPress={() => router.push(`/roster/${profile.id}`)}
                >
                  <RosterCard 
                    profile={profile} 
                    meetings={meetings.filter(m => m.profile_id === profile.id)}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Playboi Reply section */}
          <View style={{ marginTop: 24, marginBottom: 24, paddingHorizontal: 16 }}>
            <Text style={styles.sectionTitle}>Playboi Reply</Text>
            <TouchableOpacity style={{ backgroundColor: Colors.secondary[400], borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 }} onPress={pickChatImage}>
              <Text style={{ color: Colors.white, fontFamily: 'DMSans-Bold', fontSize: 16 }}>{chatImage ? 'Change Screenshot' : 'Upload Chat Screenshot'}</Text>
            </TouchableOpacity>
            {chatImage && (
              <RNImage source={{ uri: chatImage }} style={{ width: '100%', height: 220, borderRadius: 12, marginBottom: 12, resizeMode: 'contain', backgroundColor: Colors.secondary[300] }} />
            )}
            {chatImage && (
              <TouchableOpacity style={{ backgroundColor: Colors.primary[500], borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 }} onPress={getPlayboiReply} disabled={replyLoading}>
                <Text style={{ color: Colors.white, fontFamily: 'DMSans-Bold', fontSize: 16 }}>{replyLoading ? 'Thinking...' : 'Get Playboi Reply'}</Text>
              </TouchableOpacity>
            )}
            {reply && (
              <View style={{ backgroundColor: Colors.secondary[400], borderRadius: 12, padding: 14, marginTop: 8 }}>
                <Text style={{ color: Colors.white, fontFamily: 'DMSans-Regular', fontSize: 16 }}>{reply}</Text>
              </View>
            )}
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.secondary[400],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  retryButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  sectionTitle: {
    fontFamily: 'Rubik-Bold',
    fontSize: 24,
    color: Colors.white,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  cardContainer: {
    width: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
    marginHorizontal: 16,
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.white,
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: Colors.secondary[400],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  addFirstButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.white,
  },
});