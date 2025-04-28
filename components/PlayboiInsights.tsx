import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Brain, ArrowUp, Calendar, Heart, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { type Profile, type Meeting } from '@/lib/supabase';
import { differenceInDays, format, subDays } from 'date-fns';

interface PlayboiInsightsProps {
  profiles: Profile[];
  meetings: Meeting[];
}

const PlayboiInsights: React.FC<PlayboiInsightsProps> = ({ profiles, meetings }) => {
  // Get insights based on data analysis
  const insights = generateInsights(profiles, meetings);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Brain size={24} color={Colors.white} />
        <Text style={styles.title}>Playboi Insights</Text>
      </View>

      <View style={styles.insightsGrid}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              {React.cloneElement(insight.icon, {
                // Remove problematic event handlers
                onResponderTerminate: undefined,
                onResponderRelease: undefined
              })}
              <Text style={styles.insightTitle}>{insight.title}</Text>
            </View>
            <Text style={styles.insightText}>{insight.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

function generateInsights(profiles: Profile[], meetings: Meeting[]) {
  console.log('Starting insights generation');
  
  if (!profiles.length) {
    throw new Error('No profiles available');
  }
  if (!meetings.length) {
    throw new Error('No meetings available');
  }

  const insights = [];
  const now = new Date();
  const lastWeek = subDays(now, 7);

  try {
    // 1. Who to see next
    console.log('Calculating who to see next');
    const lastMeetingDates = new Map<string, Date>();
    meetings.forEach(meeting => {
      const date = new Date(meeting.date);
      const current = lastMeetingDates.get(meeting.profile_id);
      if (!current || date > current) {
        lastMeetingDates.set(meeting.profile_id, date);
      }
    });

    let longestGap = { profileId: '', days: 0 };
    lastMeetingDates.forEach((date, profileId) => {
      const days = differenceInDays(now, date);
      if (days > longestGap.days) {
        longestGap = { profileId, days };
      }
    });

    if (longestGap.profileId) {
      const profile = profiles.find(p => p.id === longestGap.profileId);
      if (profile) {
        insights.push({
          icon: <Heart size={20} color={Colors.red[500]} />,
          title: 'Who to See Next',
          text: `Haven't seen ${profile.name} in ${longestGap.days} days. Time to reach out!`,
        });
      }
    }

    // 2. Dating activity analysis
    console.log('Analyzing dating activity');
    const recentMeetings = meetings.filter(m => new Date(m.date) > lastWeek);
    const prevWeekMeetings = meetings.filter(m => {
      const date = new Date(m.date);
      return date <= lastWeek && date > subDays(lastWeek, 7);
    });

    if (recentMeetings.length !== prevWeekMeetings.length) {
      const change = recentMeetings.length - prevWeekMeetings.length;
      insights.push({
        icon: <Calendar size={20} color={Colors.purple[500]} />,
        title: 'Dating Activity',
        text: `Your dating activity is ${change > 0 ? 'up' : 'down'} ${Math.abs(change)} dates compared to last week.`,
      });
    }

    // 3. Date idea recommendation
    console.log('Generating date idea');
    const dateIdeas = [
      'Try a cooking class together',
      'Visit a local art gallery',
      'Go for a sunset picnic',
      'Take a dance lesson',
      'Explore a new neighborhood',
      'Do a wine tasting',
      'Try an escape room',
      'Go stargazing',
    ];

    insights.push({
      icon: <Sparkles size={20} color={Colors.yellow[500]} />,
      title: 'Date Idea',
      text: dateIdeas[Math.floor(Math.random() * dateIdeas.length)],
    });

    console.log('Successfully generated insights:', insights.length);
    return insights.slice(0, 2); // Return only 2 random insights
  } catch (error) {
    console.error('Error in insights generation:', error);
    throw error;
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Rubik-Bold',
    fontSize: 24,
    color: Colors.white,
    marginLeft: 8,
  },
  insightsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  insightCard: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 8,
  },
  insightText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.gray[400],
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.red[500],
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  errorDetail: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PlayboiInsights;