import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Profile } from '../types/types';
import Colors from '../constants/Colors';
import PlayerCard from './PlayerCard';

interface LineupSectionProps {
  title: string;
  players: Profile[];
  style?: object;
  cardStyle?: object;
}

const LineupSection: React.FC<LineupSectionProps> = ({ 
  title, 
  players = [],
  style = {},
  cardStyle = {}
}) => {
  if (title === "Starting") {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.formation}>
          {/* Top row - two players */}
          <View style={styles.topRow}>
            {players.slice(1, 3).map((player) => (
              <PlayerCard 
                key={player?.id ?? Math.random().toString()}
                player={player}
                style={[styles.formationCard, cardStyle]}
              />
            ))}
          </View>
          
          {/* Bottom player */}
          <View style={styles.bottomRow}>
            {players.slice(0, 1).map((player) => (
              <PlayerCard 
                key={player?.id ?? Math.random().toString()}
                player={player}
                style={[styles.formationCard, cardStyle]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.horizontalScroll}>
        {players.map((player) => (
          <PlayerCard 
            key={player?.id ?? Math.random().toString()}
            player={player}
            style={[styles.card, cardStyle]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Rubik-Bold',
    fontSize: 20,
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  formation: {
    height: 240,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  bottomRow: {
    alignItems: 'center',
  },
  formationCard: {
    width: 100,
    height: 100,
  },
  horizontalScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  card: {
    width: 80,
    height: 80,
  },
});

export default LineupSection;