import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Calendar } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Profile } from '@/types/types';
import { format } from 'date-fns';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.imageContainer}>
        {profile.imageUrl ? (
          <Image source={{ uri: profile.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.initialsContainer, { backgroundColor: getRandomColor(profile.id) }]}>
            <Text style={styles.initials}>{getInitials(profile.name)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.vibe}>{profile.vibe}</Text>
        
        {profile.lastConversation && (
          <View style={styles.lastConvoContainer}>
            <Text style={styles.lastConvoLabel}>Last talked:</Text>
            <Text style={styles.lastConvoDate}>
              {format(new Date(profile.lastConversation.date), 'MMM d')}
            </Text>
          </View>
        )}
      </View>
      
      {profile.nextReminder && (
        <View style={styles.reminderContainer}>
          <Calendar size={14} color={Colors.primary[500]} />
          <Text style={styles.reminderText}>
            {format(new Date(profile.nextReminder.date), 'MMM d')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getRandomColor = (id: string): string => {
  const colors = [
    Colors.primary[500],
    Colors.secondary[500],
    Colors.purple[500],
    Colors.blue[500],
    Colors.green[500],
  ];
  
  // Simple hash function to consistently get the same color for the same ID
  const hashCode = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hashCode % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 120,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Rubik-Bold',
    fontSize: 36,
    color: Colors.white,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.gray[900],
    marginBottom: 2,
  },
  vibe: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.gray[600],
    marginBottom: 8,
  },
  lastConvoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastConvoLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.gray[500],
    marginRight: 4,
  },
  lastConvoDate: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.gray[700],
  },
  reminderContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.primary[700],
    marginLeft: 4,
  },
});

export default ProfileCard;