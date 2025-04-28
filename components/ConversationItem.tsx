import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Flag } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { Conversation } from '@/types/types';

interface ConversationItemProps {
  conversation: Conversation;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.leftSide}>
        <View style={[
          styles.personInitialsContainer, 
          { backgroundColor: getRandomColor(conversation.personId) }
        ]}>
          <Text style={styles.personInitials}>
            {getInitials(conversation.personName)}
          </Text>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.personName}>{conversation.personName}</Text>
            <Text style={styles.date}>
              {format(new Date(conversation.date), 'MMM d')}
            </Text>
          </View>
          
          <View style={styles.topicsContainer}>
            {conversation.topics.map((topic, index) => (
              <View key={index} style={styles.topicBadge}>
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
          
          <Text 
            style={styles.summary} 
            numberOfLines={2}
          >
            {conversation.summary}
          </Text>
        </View>
      </View>
      
      {conversation.flagged && (
        <View style={styles.flagContainer}>
          <Flag size={16} color={Colors.secondary[500]} fill={Colors.secondary[500]} />
        </View>
      )}
      
      {!conversation.read && (
        <View style={styles.unreadIndicator} />
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
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leftSide: {
    flex: 1,
    flexDirection: 'row',
  },
  personInitialsContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  personInitials: {
    fontFamily: 'Rubik-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  personName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.gray[900],
  },
  date: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.gray[500],
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  topicBadge: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  topicText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: Colors.primary[700],
  },
  summary: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 20,
  },
  flagContainer: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
  },
});

export default ConversationItem;