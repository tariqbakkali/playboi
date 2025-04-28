import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { DollarSign, Calendar, Heart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { getProfiles, getMeetings, type Profile, type Meeting } from '@/lib/supabase';
import Header from '@/components/Header';
import { format, subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth, subYears } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

type Period = 'weekly' | 'monthly' | 'yearly';

type TopProfile = Profile & { rating: number };

export default function PlaybookScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('weekly');
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalDates: 0,
    totalHookups: 0,
  });
  const [chartData, setChartData] = useState({
    labels: ['3/23', '3/30', '4/6', '4/13', '4/20', '4/27'],
    datasets: [{ data: [0, 0, 0, 0, 71, 0] }],
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [top3, setTop3] = useState<TopProfile[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  async function loadData() {
    try {
      setError(null);
      
      // Load profiles and meetings
      const loadedProfiles = await getProfiles();
      const allMeetings = await Promise.all(loadedProfiles.map(p => getMeetings(p.id)));
      const allMeetingsFlat = allMeetings.flat();
      setProfiles(loadedProfiles);
      setMeetings(allMeetingsFlat);

      // Calculate stats based on selected period
      const now = new Date();
      const filteredMeetings = allMeetingsFlat.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        switch (selectedPeriod) {
          case 'weekly':
            return meetingDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          case 'monthly':
            return meetingDate >= subMonths(now, 6);
          case 'yearly':
            return meetingDate >= subYears(now, 3); // Show last 3 years
        }
      });

      const totalSpent = filteredMeetings.reduce((sum, m) => sum + (m.amount_spent || 0), 0);
      const totalDates = filteredMeetings.length;
      const totalHookups = filteredMeetings.filter(m => m.base).length;

      setStats({
        totalSpent,
        totalDates,
        totalHookups,
      });

      // Update chart data based on period
      updateChartData(filteredMeetings);

      // Compute Top 3 Rankings by 'rating' as on roster ID page
      function computeProfileRating(profile: Profile, allMeetings: Meeting[]): number {
        const profileMeetings = allMeetings.filter(m => m.profile_id === profile.id);
        if (!profileMeetings.length) return 0;
        const avgDateRating = profileMeetings.length
          ? profileMeetings.reduce((sum, m) => sum + (m.rating || 0), 0) / profileMeetings.length
          : 0;
        const perfMeetings = profileMeetings.filter(m => m.base === 'home' && (m as any).performance_rating);
        const avgPerformanceRating = perfMeetings.length
          ? perfMeetings.reduce((sum, m) => sum + ((m as any).performance_rating || 0), 0) / perfMeetings.length
          : 0;
        const looks = profile.looks_rating || 0;
        return Number(((looks + avgPerformanceRating + avgDateRating) / 3).toFixed(1));
      }

      const top3Profiles: TopProfile[] = loadedProfiles
        .map((profile: Profile) => Object.assign({}, profile, {
          rating: computeProfileRating(profile, allMeetingsFlat),
        }))
        .filter((p) => p.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
      setTop3(top3Profiles);

      const medals = ['🥇', '🥈', '🥉'];

    } catch (err) {
      console.error('Error loading playbook data:', err);
      setError('Failed to load playbook data');
    } finally {
      setLoading(false);
    }
  }

  function updateChartData(meetings: any[]) {
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];

    switch (selectedPeriod) {
      case 'weekly':
        // Last 6 weeks
        for (let i = 5; i >= 0; i--) {
          const weekStart = startOfWeek(subWeeks(now, i));
          const weekEnd = endOfWeek(subWeeks(now, i));
          
          // Format label as M/DD
          labels.push(format(weekStart, 'M/d'));
          
          const weekMeetings = meetings.filter(m => {
            const meetingDate = new Date(m.date);
            return meetingDate >= weekStart && meetingDate <= weekEnd;
          });
          
          // Calculate average CPN for the week
          const weekHookups = weekMeetings.filter(m => m.base).length;
          const weekSpent = weekMeetings.reduce((sum, m) => sum + (m.amount_spent || 0), 0);
          const weekCPN = weekHookups > 0 ? Math.round(weekSpent / weekHookups) : 0;
          
          data.push(weekCPN);
        }
        break;

      case 'monthly':
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(now, i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          
          labels.push(format(monthDate, 'MMM'));
          
          const monthMeetings = meetings.filter(m => {
            const meetingDate = new Date(m.date);
            return meetingDate >= monthStart && meetingDate <= monthEnd;
          });
          
          // Calculate average CPN for the month
          const monthHookups = monthMeetings.filter(m => m.base).length;
          const monthSpent = monthMeetings.reduce((sum, m) => sum + (m.amount_spent || 0), 0);
          const monthCPN = monthHookups > 0 ? Math.round(monthSpent / monthHookups) : 0;
          
          data.push(monthCPN);
        }
        break;

      case 'yearly':
        // Show last 3 years
        const currentYear = now.getFullYear();
        for (let i = 2; i >= 0; i--) {
          const year = currentYear - i;
          labels.push(year.toString());
          
          const yearMeetings = meetings.filter(m => {
            const meetingDate = new Date(m.date);
            return meetingDate.getFullYear() === year;
          });
          
          // Calculate average CPN for the year
          const yearHookups = yearMeetings.filter(m => m.base).length;
          const yearSpent = yearMeetings.reduce((sum, m) => sum + (m.amount_spent || 0), 0);
          const yearCPN = yearHookups > 0 ? Math.round(yearSpent / yearHookups) : 0;
          
          data.push(yearCPN);
        }
        break;
    }

    setChartData({
      labels,
      datasets: [{ data }],
    });
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Playbook" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Playbook" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Playbook" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[500]}
            colors={[Colors.primary[500]]}
          />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={styles.periodOption}
            onPress={() => setSelectedPeriod('weekly')}
          >
            <Text style={selectedPeriod === 'weekly' ? styles.periodTextActive : styles.periodText}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.periodOption}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={selectedPeriod === 'monthly' ? styles.periodTextActive : styles.periodText}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.periodOption}
            onPress={() => setSelectedPeriod('yearly')}
          >
            <Text style={selectedPeriod === 'yearly' ? styles.periodTextActive : styles.periodText}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.green[500]} />
            <Text style={styles.statValue}>${stats.totalSpent}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={24} color={Colors.purple[500]} />
            <Text style={styles.statValue}>{stats.totalDates}</Text>
            <Text style={styles.statLabel}>Total Dates</Text>
          </View>

          <View style={styles.statCard}>
            <Heart size={24} color={Colors.red[500]} />
            <Text style={[styles.statValue, styles.textCenter]}>{stats.totalHookups}</Text>
            <Text style={[styles.statLabel, styles.textCenter]}>Total{'\n'}Hookups</Text>
          </View>
        </View>

        {/* CPN Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Average CPN by {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</Text>
          <View style={styles.chartCard}>
            <LineChart
              data={chartData}
              width={340}
              height={220}
              chartConfig={{
                backgroundColor: Colors.secondary[300],
                backgroundGradientFrom: Colors.secondary[300],
                backgroundGradientTo: Colors.secondary[300],
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: () => Colors.gray[400],
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: Colors.green[600],
                },
                formatYLabel: (value) => `$${value}`,
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>

        {/* Top 3 Rankings */}
        {top3.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 3 Players</Text>
            <View style={styles.top3Row}>
              {top3.map((profile, idx) => (
                <View key={profile.id} style={[styles.top3Card, idx === top3.length - 1 && { marginBottom: 0 }]}>
                  <Text style={styles.medal}>{['🥇', '🥈', '🥉'][idx]}</Text>
                  {profile.image_url ? (
                    <Image source={{ uri: profile.image_url }} style={styles.top3Image} />
                  ) : (
                    <View style={styles.top3InitialsContainer}>
                      <Text style={styles.top3Initials}>{profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</Text>
                    </View>
                  )}
                  <Text style={styles.top3Name} numberOfLines={1}>{profile.name}</Text>
                  <View style={styles.top3RatingRow}>
                    <Text style={styles.top3RatingLabel}>Rating</Text>
                    <Text style={styles.top3RatingValue}>{profile.rating || '-'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.red[500],
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary[300],
    margin: 16,
    borderRadius: 20,
    padding: 4,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  periodText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.gray[400],
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  periodTextActive: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
    backgroundColor: Colors.secondary[400],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  statValue: {
    fontFamily: 'Rubik-Bold',
    fontSize: 24,
    color: Colors.white,
    marginVertical: 8,
  },
  textCenter: {
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Rubik-Bold',
    fontSize: 24,
    color: Colors.white,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  top3Row: {
    flexDirection: 'column',
  },
  top3Card: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[400],
    alignSelf: 'stretch',
    marginBottom: 16,
    flexDirection: 'row',
  },
  medal: {
    fontSize: 28,
    color: '#FFD700', // gold
    marginRight: 16,
  },
  top3Image: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  top3InitialsContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  top3Initials: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: Colors.white,
  },
  top3Name: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.white,
    flex: 1,
    marginBottom: 0,
  },
  top3RatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  top3RatingLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.gray[400],
    marginRight: 4,
  },
  top3RatingValue: {
    fontFamily: 'Rubik-Bold',
    fontSize: 18,
    color: Colors.white,
    marginLeft: 0,
  },
});