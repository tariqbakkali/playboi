import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Profile } from '@/types/types';
import { useTheme } from '@/context/ThemeContext';

interface PlayerCardProps {
  player?: Profile;
  style?: object;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, style }) => {
  const { colors } = useTheme();

  // If no player is provided, show empty state
  if (!player) {
    return (
      <TouchableOpacity style={[styles.container, style]}>
        <View style={[styles.initialsContainer, { backgroundColor: colors.gray[400] }]}>
          <Text style={styles.initials}>--</Text>
        </View>
        <View style={[styles.nameTag, { backgroundColor: colors.secondary[500] }]}>
          <Text style={styles.name} numberOfLines={1}>Empty</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.container, style]}>
      {player.imageUrl ? (
        <Image source={{ uri: player.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.initialsContainer, { backgroundColor: getRandomColor(player.id) }]}>
          <Text style={styles.initials}>{getInitials(player.name)}</Text>
        </View>
      )}
      <View style={[styles.nameTag, { backgroundColor: colors.secondary[500] }]}>
        <Text style={styles.name} numberOfLines={1}>
          {player.name.split(' ')[0]}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const getInitials = (name: string): string => {
  if (!name) return '--';
  
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getRandomColor = (id: string): string => {
  const { colors } = useTheme();
  const colorOptions = [
    colors.primary[500],
    colors.secondary[500],
    colors.purple[500],
    colors.blue[500],
    colors.green[500],
  ];
  
  if (!id) return colorOptions[0];
  
  const hashCode = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorOptions[hashCode % colorOptions.length];
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#f472b6',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  initials: {
    fontFamily: 'Rubik-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  nameTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    alignItems: 'center',
  },
  name: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#ffffff',
  },
});

export default PlayerCard;