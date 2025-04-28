import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Bell, 
  Shield, 
  User, 
  Info, 
  LogOut,
  ChevronRight,
  X,
  Check
} from 'lucide-react-native';

import Header from '@/components/Header';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }

  async function handleUpdateProfile() {
    try {
      setLoading(true);
      setError(null);

      if (password) {
        const { error } = await supabase.auth.updateUser({
          password: password
        });
        if (error) throw error;
      }

      if (email !== user?.email) {
        const { error } = await supabase.auth.updateUser({
          email: email
        });
        if (error) throw error;
      }

      setIsEditing(false);
      setPassword('');
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell size={22} color={Colors.secondary[500]} />,
          title: 'Notifications',
          rightElement: <ChevronRight size={20} color={Colors.gray[400]} />,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: <Shield size={22} color={Colors.green[500]} />,
          title: 'Privacy',
          rightElement: <ChevronRight size={20} color={Colors.gray[400]} />,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          icon: <Info size={22} color={Colors.blue[500]} />,
          title: 'About',
          rightElement: <ChevronRight size={20} color={Colors.gray[400]} />,
        },
        {
          icon: <LogOut size={22} color={Colors.red[500]} />,
          title: 'Log Out',
          onPress: handleSignOut,
          isDanger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Settings" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileInitials}>
              {user?.email?.[0].toUpperCase() || '?'}
            </Text>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.gray[600]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.gray[600]}
                  secureTextEntry
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={[styles.editButton, styles.cancelButton]} 
                  onPress={() => {
                    setIsEditing(false);
                    setEmail(user?.email || '');
                    setPassword('');
                    setError(null);
                  }}
                >
                  <X size={20} color={Colors.white} />
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.editButton, styles.saveButton, loading && styles.buttonDisabled]} 
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Check size={20} color={Colors.white} />
                      <Text style={styles.editButtonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={item.onPress}
                >
                  <View style={styles.settingItemLeft}>
                    {item.icon}
                    <Text 
                      style={[
                        styles.settingItemTitle,
                        item.isDanger && styles.dangerText
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                  {item.rightElement}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.secondary[500],
  },
  profileInitials: {
    fontFamily: 'Rubik-Bold',
    fontSize: 32,
    color: Colors.white,
  },
  profileEmail: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.white,
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: Colors.secondary[400],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  editProfileText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.white,
  },
  editForm: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.white,
  },
  input: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 12,
    padding: 16,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.secondary[400],
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  saveButton: {
    backgroundColor: Colors.green[500],
    borderWidth: 1,
    borderColor: Colors.green[600],
  },
  editButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.red[500],
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.gray[500],
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: Colors.secondary[300],
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 12,
  },
  dangerText: {
    color: Colors.red[500],
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 100,
    paddingTop: 8,
  },
  version: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.gray[400],
  },
});