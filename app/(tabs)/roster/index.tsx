import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { UserPlus, Search, ArrowUpDown } from 'lucide-react-native';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';
import RosterCard from '@/components/RosterCard';
import { getProfiles, getMeetings, type Profile, type Meeting } from '@/lib/supabase';

type SortOption = 'name' | 'date' | 'status';

export default function RosterScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfiles();
      setProfiles(data);

      // Load meetings for all profiles
      const meetingsPromises = data.map(profile => getMeetings(profile.id));
      const meetingsData = await Promise.all(meetingsPromises);
      setMeetings(meetingsData.flat());
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Name', value: 'name' },
    { label: 'Date Added', value: 'date' },
    { label: 'Status', value: 'status' },
  ];

  const sortProfiles = (profiles: Profile[]) => {
    return [...profiles].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status':
          const statusOrder = {
            wifey: 0,
            dating: 1,
            situationship: 2,
            side_piece: 3,
            prospect: 4,
          };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });
  };

  const filterProfiles = (profiles: Profile[]) => {
    if (!searchQuery) return sortProfiles(profiles);
    
    const query = searchQuery.toLowerCase();
    return sortProfiles(profiles.filter(profile => 
      profile.name.toLowerCase().includes(query)
    ));
  };

  const getProfileMeetings = (profileId: string) => {
    return meetings.filter(meeting => meeting.profile_id === profileId);
  };

  const filteredProfiles = filterProfiles(profiles);
  const activeProfiles = filteredProfiles.filter(profile => !profile.bench);
  const benchProfiles = filteredProfiles.filter(profile => profile.bench);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header 
          title="Roster" 
          rightElement={
            <TouchableOpacity style={styles.addButton}>
              <UserPlus size={24} color={Colors.white} />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header 
          title="Roster" 
          rightElement={
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/roster/add-player')}>
              <UserPlus size={24} color={Colors.white} />
            </TouchableOpacity>
          }
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfiles}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Roster" 
        rightElement={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/roster/add-player')}
          >
            <UserPlus size={24} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search roster..."
            placeholderTextColor={Colors.gray[600]}
          />
        </View>

        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <ArrowUpDown size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {showSortOptions && (
        <View style={styles.sortOptionsContainer}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && styles.sortOptionActive
              ]}
              onPress={() => {
                setSortBy(option.value);
                setShowSortOptions(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.value && styles.sortOptionTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Active Players</Text>
            {activeProfiles.length === 0 ? (
              <Text style={styles.emptySectionText}>No active players</Text>
            ) : (
              <View style={styles.grid}>
                {activeProfiles.map((profile) => (
                  <TouchableOpacity 
                    key={profile.id}
                    style={styles.cardContainer}
                    onPress={() => router.push(`/roster/${profile.id}`)}
                  >
                    <RosterCard 
                      profile={profile} 
                      meetings={getProfileMeetings(profile.id)}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Bench</Text>
            {benchProfiles.length === 0 ? (
              <Text style={styles.emptySectionText}>No bench players</Text>
            ) : (
              <View style={styles.grid}>
                {benchProfiles.map((profile) => (
                  <TouchableOpacity 
                    key={profile.id}
                    style={styles.cardContainer}
                    onPress={() => router.push(`/roster/${profile.id}`)}
                  >
                    <RosterCard 
                      profile={profile} 
                      meetings={getProfileMeetings(profile.id)}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
        renderItem={null}
        keyExtractor={() => ''}
        contentContainerStyle={styles.rosterList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadProfiles}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
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
  addButton: {
    backgroundColor: Colors.secondary[400],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 4,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.white,
    paddingVertical: 12,
    marginLeft: 8,
  },
  sortButton: {
    backgroundColor: Colors.secondary[400],
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  sortOptionsContainer: {
    backgroundColor: Colors.secondary[300],
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  sortOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sortOptionActive: {
    backgroundColor: Colors.secondary[500],
  },
  sortOptionText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[400],
  },
  sortOptionTextActive: {
    color: Colors.white,
  },
  rosterList: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontFamily: 'Rubik-Bold',
    fontSize: 22,
    color: Colors.white,
    marginTop: 4,
    marginBottom: 16,
    marginLeft: 16,
  },
  emptySectionText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.gray[400],
    marginBottom: 16,
    marginLeft: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 8,
  },
  cardContainer: {
    width: '48%',
  },
});