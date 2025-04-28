import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '@/constants/Colors';
import { type Profile, type Meeting } from '@/lib/supabase';
import { Star, Calendar } from 'lucide-react-native';

const STATUS_EMOJIS = {
  prospect: '👀',
  dating: '💑',
  situationship: '🤔',
  side_piece: '🌙',
  wifey: '💍',
};

interface RosterCardProps {
  profile: Profile;
  meetings?: Meeting[];
}

const RosterCard: React.FC<RosterCardProps> = ({ profile, meetings = [] }) => {
  // Calculate CPN (Cost Per Night)
  const totalSpent = meetings.reduce((sum, m) => sum + (m.amount_spent || 0), 0);
  const hookups = meetings.filter(m => m.base).length;
  const cpn = hookups > 0 ? Math.round(totalSpent / hookups) : 0;

  // Calculate average rating
  const avgRating = meetings.length > 0 
    ? (meetings.reduce((sum, m) => sum + (m.rating || 0), 0) / meetings.length).toFixed(1)
    : '0.0';

  return (
    <View style={[styles.container, profile.bench && styles.benchContainer]}>
      {/* Image */}
      {profile.image_url ? (
        <Image 
          source={{ uri: profile.image_url }} 
          style={[styles.image, profile.bench && styles.benchImage]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.initialsContainer, profile.bench && styles.benchContainer]}>
          <Text style={[styles.initials, profile.bench && styles.benchText]}>
            {profile.name.split(' ')[0][0].toUpperCase()}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.name, profile.bench && styles.benchText]} numberOfLines={1}>
          {profile.name.split(' ')[0]}
        </Text>
        
        <Text style={styles.status}>
          {STATUS_EMOJIS[profile.status]}
        </Text>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <View style={styles.statRow}>
              <Calendar size={12} color={profile.bench ? Colors.gray[600] : Colors.gray[400]} />
              <Text style={[styles.statValue, profile.bench && styles.benchText]}>{meetings.length}</Text>
            </View>
            <Text style={[styles.statLabel, profile.bench && styles.benchText]}>Dates</Text>
          </View>

          <View style={styles.stat}>
            <Text style={[styles.statValue, profile.bench && styles.benchText]}>${cpn}</Text>
            <Text style={[styles.statLabel, profile.bench && styles.benchText]}>CPN</Text>
          </View>
          
          <View style={styles.stat}>
            <View style={styles.ratingContainer}>
              <Star size={12} color={profile.bench ? Colors.gray[600] : Colors.yellow[500]} fill={profile.bench ? Colors.gray[600] : Colors.yellow[500]} />
              <Text style={[styles.statValue, profile.bench && styles.benchText]}>{avgRating}</Text>
            </View>
            <Text style={[styles.statLabel, profile.bench && styles.benchText]}>Rating</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  initialsContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.secondary[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Rubik-Bold',
    fontSize: 32,
    color: Colors.white,
  },
  content: {
    padding: 12,
    alignItems: 'center',
  },
  name: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.white,
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: Colors.gray[400],
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  benchContainer: {
    opacity: 0.6,
    backgroundColor: Colors.secondary[200],
  },
  benchImage: {
    opacity: 0.6,
  },
  benchText: {
    color: Colors.gray[600],
  },
});

export default RosterCard;