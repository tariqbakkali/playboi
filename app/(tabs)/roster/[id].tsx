import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Heart, DollarSign, Star, Siren as Fire, Calendar, Pen } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { getProfile, getMeetings, getUpcomingDates, type Meeting, type Profile, type UpcomingDate } from '@/lib/supabase';
import { format } from 'date-fns';

const STATUS_COLORS = {
  prospect: Colors.secondary[500],
  dating: Colors.purple[500],
  situationship: Colors.blue[500],
  side_piece: Colors.red[500],
  wifey: Colors.green[500],
};

const STATUS_LABELS = {
  prospect: 'Prospect 👀',
  dating: 'Dating 💑',
  situationship: 'Situationship 🤔',
  side_piece: 'Side Piece 🌙',
  wifey: 'Wifey 💍',
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function StarRating({ rating, size = 16, color = Colors.yellow[500] }: { rating: number; size?: number; color?: string }) {
  return (
    <View style={styles.starRating}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <Star
          key={num}
          size={size}
          color={color}
          fill={num <= rating ? color : 'none'}
          strokeWidth={1.5}
        />
      ))}
      <Text style={[styles.ratingText, { fontSize: size }]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function PlayerDetailsScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' && UUID_PATTERN.test(params.id) ? params.id : null;
  
  const [player, setPlayer] = useState<Profile | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid Player ID</Text>
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => router.replace('/roster')}
          >
            <Text style={styles.returnButtonText}>Return to Roster</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  useFocusEffect(
    React.useCallback(() => {
      loadPlayerData();
    }, [id])
  );

  async function loadPlayerData() {
    try {
      setLoading(true);
      setError(null);
      
      const [playerData, meetingsData, upcomingDatesData] = await Promise.all([
        getProfile(id),
        getMeetings(id),
        getUpcomingDates()
      ]);

      if (!playerData) {
        setError('Player not found');
        return;
      }
      
      setPlayer(playerData);
      setMeetings(meetingsData);
      setUpcomingDates(upcomingDatesData.filter(date => date.profile_id === id));
    } catch (err) {
      console.error('Error loading player:', err);
      setError('Failed to load player data');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    if (!player) return;
    router.push({
      pathname: `/roster/${id}/edit`,
      params: { initialData: JSON.stringify(player) }
    });
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => router.replace('/roster')}
          >
            <Text style={styles.returnButtonText}>Return to Roster</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.loadingText}>Loading player data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!player) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Player not found</Text>
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => router.replace('/roster')}
          >
            <Text style={styles.returnButtonText}>Return to Roster</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalSpent = meetings.reduce((sum, meeting) => sum + (meeting.amount_spent || 0), 0);
  const hookups = meetings.filter(m => m.base).length;
  const cpn = hookups > 0 ? `$${(totalSpent / hookups).toFixed(0)}` : 'N/A';
  
  // Calculate average ratings
  const avgDateRating = meetings.length ? 
    (meetings.reduce((sum, m) => sum + (m.rating || 0), 0) / meetings.length) : 
    0;
  
  const avgPerformanceRating = meetings.filter(m => m.performance_rating).length ? 
    (meetings.reduce((sum, m) => sum + (m.performance_rating || 0), 0) / meetings.filter(m => m.performance_rating).length) : 
    0;

  // Calculate overall rating (1/3 of each rating type)
  const overallRating = (
    ((player.looks_rating || 0) + avgPerformanceRating + avgDateRating) / 3
  ).toFixed(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: Colors.secondary[400] }]}
            onPress={handleEdit}
          >
            <Pen size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: Colors.blue[500] }]}
            onPress={() => router.push(`/roster/${id}/add-expense`)}
          >
            <DollarSign size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: Colors.green[500] }]}
            onPress={() => router.push(`/roster/${id}/add-meeting`)}
          >
            <Plus size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          {player.image_url ? (
            <Image source={{ uri: player.image_url }} style={styles.profileImage} />
          ) : (
            <View style={[styles.initialsContainer, { backgroundColor: Colors.secondary[400] }]}>
              <Text style={styles.initials}>
                {player.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{player.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[player.status] }]}>
            <Text style={styles.statusText}>{STATUS_LABELS[player.status]}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Heart size={24} color={Colors.white} strokeWidth={1.5} />
            <Text style={styles.statValue}>{meetings.length}</Text>
            <Text style={styles.statLabel}>Dates</Text>
          </View>

          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.white} strokeWidth={1.5} />
            <Text style={styles.statValue}>${totalSpent}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>

          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.white} strokeWidth={1.5} />
            <Text style={styles.statValue}>{cpn}</Text>
            <Text style={styles.statLabel}>CPN</Text>
          </View>

          <View style={styles.statCard}>
            <Star size={24} color={Colors.white} strokeWidth={1.5} />
            <Text style={styles.statValue}>{overallRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.ratingsCard}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Looks</Text>
            <StarRating rating={player.looks_rating || 0} />
          </View>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Performance</Text>
            <StarRating rating={avgPerformanceRating} />
          </View>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Date</Text>
            <StarRating rating={avgDateRating} />
          </View>
        </View>

        {upcomingDates.length > 0 && (
          <View style={styles.upcomingDatesCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Upcoming Dates</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/add-date')}
              >
                <Plus size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
            {upcomingDates.map((date) => (
              <View key={date.id} style={styles.upcomingDateRow}>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateType}>{date.type}</Text>
                  <Text style={styles.dateDate}>
                    {format(new Date(date.date), 'EEE, MMM d')}
                  </Text>
                </View>
                {date.notes && (
                  <Text style={styles.dateNotes} numberOfLines={2}>
                    {date.notes}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.factsCard}>
          <Text style={styles.cardTitle}>Quick Facts</Text>
          {player.likes?.length > 0 && (
            <Text style={styles.factText}>❤️ Likes: {player.likes.join(', ')}</Text>
          )}
          {player.dislikes?.length > 0 && (
            <Text style={styles.factText}>🚫 Dislikes: {player.dislikes.join(', ')}</Text>
          )}
          {player.notes && (
            <Text style={styles.factText}>📝 {player.notes}</Text>
          )}
        </View>

        <View style={styles.meetingsCard}>
          <Text style={styles.cardTitle}>Recent Meetings / Gifts</Text>
          {meetings.length === 0 ? (
            <Text style={styles.emptyText}>No meetings or expenses yet</Text>
          ) : (
            meetings.slice(0, 3).map((meeting) => (
              <View key={meeting.id} style={styles.meetingRow}>
                <View style={styles.meetingHeader}>
                  <View style={styles.meetingInfo}>
                    <Text style={styles.meetingDate}>
                      {format(new Date(meeting.date), 'MMM d, yyyy')}
                    </Text>
                    <View style={styles.meetingType}>
                      {meeting.type === 'expense' ? (
                        <DollarSign size={14} color={Colors.white} />
                      ) : (
                        <Calendar size={14} color={Colors.white} />
                      )}
                      <Text style={styles.meetingTypeText}>{meeting.type}</Text>
                    </View>
                  </View>
                  <View style={styles.meetingStats}>
                    {meeting.type !== 'expense' && meeting.base && (
                      <Text style={styles.meetingStat}>
                        {meeting.base === 'strikeout' ? '❌' : '🍑'}
                      </Text>
                    )}
                    {meeting.type === 'expense' ? (
                      <Text style={styles.meetingAmount}>
                        ${meeting.amount_spent}
                      </Text>
                    ) : (
                      <Text style={styles.meetingScore}>{meeting.rating}/10</Text>
                    )}
                  </View>
                </View>
                {meeting.notes && (
                  <Text style={styles.meetingSummary}>{meeting.notes}</Text>
                )}
              </View>
            ))
          )}
        </View>

        <TouchableOpacity 
          style={styles.addMeetingButton}
          onPress={() => router.push(`/roster/${id}/add-meeting`)}
        >
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addMeetingText}>Add New Meeting</Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.secondary[500],
  },
  initialsContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.secondary[500],
  },
  initials: {
    fontFamily: 'Rubik-Bold',
    fontSize: 48,
    color: Colors.white,
  },
  name: {
    fontFamily: 'Rubik-Bold',
    fontSize: 32,
    color: Colors.white,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.white,
  },
  ratingsCard: {
    backgroundColor: Colors.secondary[300],
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[400],
  },
  ratingLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.white,
  },
  starRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: 'DMSans-Bold',
    color: Colors.white,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '23%',
    backgroundColor: Colors.secondary[400],
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  statValue: {
    fontFamily: 'Rubik-Bold',
    fontSize: 20,
    color: Colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 4,
  },
  factsCard: {
    backgroundColor: Colors.secondary[300],
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  cardTitle: {
    fontFamily: 'Rubik-Bold',
    fontSize: 18,
    color: Colors.white,
    marginBottom: 12,
  },
  factText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.gray[400],
    marginBottom: 8,
  },
  meetingsCard: {
    backgroundColor: Colors.secondary[300],
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.gray[400],
    textAlign: 'center',
    marginVertical: 16,
  },
  meetingRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[400],
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingDate: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
    marginBottom: 4,
  },
  meetingType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingTypeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[400],
    marginLeft: 6,
  },
  meetingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingStat: {
    fontSize: 16,
    marginRight: 8,
  },
  meetingScore: {
    fontFamily: 'Rubik-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  meetingSummary: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.gray[400],
    lineHeight: 20,
  },
  addMeetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary[400],
    marginHorizontal: 16,
    marginBottom: 100,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  addMeetingText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
  },
  returnButton: {
    backgroundColor: Colors.secondary[400],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  returnButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  upcomingDatesCard: {
    backgroundColor: Colors.secondary[300],
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: Colors.secondary[400],
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  upcomingDateRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[400],
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateType: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  dateDate: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[400],
  },
  dateNotes: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.gray[400],
    lineHeight: 20,
  },
  meetingAmount: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.green[500],
  },
});