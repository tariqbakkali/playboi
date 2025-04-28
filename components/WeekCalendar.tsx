import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { format, addDays, isSameDay } from 'date-fns';
import Colors from '@/constants/Colors';
import { type UpcomingDate, deleteUpcomingDate } from '@/lib/supabase';
import { router } from 'expo-router';
import { Plus, Calendar, Trash2, CreditCard as Edit, Clock } from 'lucide-react-native';

interface WeekCalendarProps {
  upcomingDates: Array<UpcomingDate & { profiles: { name: string } }>;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ upcomingDates }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateDetails, setSelectedDateDetails] = useState<(UpcomingDate & { profiles: { name: string } }) | null>(null);
  const [loading, setLoading] = useState(false);
  
  const today = new Date();
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const dateDetails = upcomingDates.find(upcomingDate => 
      isSameDay(new Date(upcomingDate.date), date)
    );
    
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      dateDetails,
    };
  });

  async function handleDelete() {
    if (!selectedDateDetails) return;

    try {
      setLoading(true);
      await deleteUpcomingDate(selectedDateDetails.id);
      setModalVisible(false);
      // Refresh the page to show updated data
      router.replace(router.canGoBack() ? router.back() : '/');
    } catch (error) {
      console.error('Error deleting date:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    if (!selectedDateDetails) return;
    setModalVisible(false); // Close modal before navigation
    router.push({
      pathname: '/add-date',
      params: { 
        dateId: selectedDateDetails.id,
        initialData: JSON.stringify(selectedDateDetails)
      }
    });
  }

  function handleAddDate() {
    setModalVisible(false); // Close modal before navigation
    router.push('/add-date');
  }

  function handleDayPress(date: Date, details?: UpcomingDate & { profiles: { name: string } }) {
    setSelectedDate(date);
    setSelectedDateDetails(details || null);
    setModalVisible(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Dates</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddDate}
        >
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendar}>
        {days.map((day, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.dayContainer,
              index === 0 && styles.todayContainer,
              day.dateDetails && styles.plannedDateContainer
            ]}
            onPress={() => handleDayPress(day.date, day.dateDetails)}
          >
            <Text style={[
              styles.dayName, 
              index === 0 && styles.todayText,
              day.dateDetails && styles.plannedDateText
            ]}>
              {day.dayName}
            </Text>
            <Text style={[
              styles.dayNumber, 
              index === 0 && styles.todayText,
              day.dateDetails && styles.plannedDateText
            ]}>
              {day.dayNumber}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Calendar size={20} color={Colors.white} />
              <Text style={styles.modalDate}>
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>

            {selectedDateDetails ? (
              <>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalName}>{selectedDateDetails.profiles.name}</Text>
                  <View style={styles.modalTypeContainer}>
                    <Text style={styles.modalType}>{selectedDateDetails.type}</Text>
                    <View style={styles.modalTime}>
                      <Clock size={16} color={Colors.gray[400]} />
                      <Text style={styles.modalTimeText}>
                        {format(new Date(selectedDateDetails.date), 'h:mm a')}
                      </Text>
                    </View>
                  </View>
                  {selectedDateDetails.notes && (
                    <Text style={styles.modalNotes}>{selectedDateDetails.notes}</Text>
                  )}
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.editButton]}
                    onPress={handleEdit}
                  >
                    <Edit size={16} color={Colors.white} />
                    <Text style={styles.modalButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDelete}
                    disabled={loading}
                  >
                    <Trash2 size={16} color={Colors.white} />
                    <Text style={styles.modalButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.noDateText}>No date planned</Text>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={handleAddDate}
                >
                  <Plus size={16} color={Colors.white} />
                  <Text style={styles.modalButtonText}>Plan a Date</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Rubik-Bold',
    fontSize: 24,
    color: Colors.white,
  },
  addButton: {
    backgroundColor: Colors.secondary[400],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dayContainer: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  todayContainer: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[600],
  },
  plannedDateContainer: {
    backgroundColor: Colors.green[500],
    borderColor: Colors.green[600],
  },
  dayName: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: Colors.gray[400],
    marginBottom: 2,
  },
  dayNumber: {
    fontFamily: 'Rubik-Bold',
    fontSize: 14,
    color: Colors.white,
  },
  todayText: {
    color: Colors.white,
  },
  plannedDateText: {
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalDate: {
    fontFamily: 'Rubik-Bold',
    fontSize: 18,
    color: Colors.white,
    marginLeft: 8,
  },
  modalDetails: {
    marginBottom: 16,
  },
  modalName: {
    fontFamily: 'Rubik-Bold',
    fontSize: 20,
    color: Colors.white,
    marginBottom: 8,
  },
  modalTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalType: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.gray[400],
  },
  modalTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary[400],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  modalTimeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.white,
    marginLeft: 6,
  },
  modalNotes: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.gray[400],
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary[400],
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  editButton: {
    backgroundColor: Colors.blue[500],
    borderColor: Colors.blue[600],
  },
  deleteButton: {
    backgroundColor: Colors.red[500],
    borderColor: Colors.red[600],
  },
  modalButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  noDateText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.gray[400],
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default WeekCalendar;