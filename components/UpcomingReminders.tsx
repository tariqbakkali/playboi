import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Bell, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';

import Colors from '@/constants/Colors';
import { reminders } from '@/data/mockData';

const UpcomingReminders: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Bell size={20} color={Colors.white} />
          <Text style={styles.title}>Upcoming Reminders</Text>
        </View>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all</Text>
          <ChevronRight size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.remindersScrollContent}
      >
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <TouchableOpacity key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={[styles.reminderType, { backgroundColor: getReminderTypeColor(reminder.type) }]}>
                  <Text style={styles.reminderTypeText}>{getReminderTypeLabel(reminder.type)}</Text>
                </View>
                <Text style={styles.reminderDate}>
                  {format(new Date(reminder.date), 'MMM d')}
                </Text>
              </View>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderPerson}>with {reminder.personName}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyRemindersContainer}>
            <Text style={styles.emptyRemindersText}>No upcoming reminders</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getReminderTypeColor = (type: string): string => {
  switch (type) {
    case 'followUp':
      return Colors.blue[500];
    case 'date':
      return Colors.secondary[400];
    case 'birthday':
      return Colors.secondary[500];
    default:
      return Colors.secondary[600];
  }
};

const getReminderTypeLabel = (type: string): string => {
  switch (type) {
    case 'followUp':
      return 'Follow Up';
    case 'date':
      return 'Date';
    case 'birthday':
      return 'Birthday';
    default:
      return 'Reminder';
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Rubik-Bold',
    fontSize: 18,
    color: Colors.white,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.white,
    marginRight: 2,
  },
  remindersScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  reminderCard: {
    width: 200,
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reminderTypeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.white,
  },
  reminderDate: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[500],
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
    marginBottom: 4,
  },
  reminderPerson: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.gray[600],
  },
  emptyRemindersContainer: {
    width: 280,
    height: 100,
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  emptyRemindersText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[500],
  },
});

export default UpcomingReminders;