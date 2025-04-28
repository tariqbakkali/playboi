import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Check, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { createProfile, uploadProfileImage } from '@/lib/supabase';

const STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospect 👀' },
  { value: 'dating', label: 'Dating 💑' },
  { value: 'situationship', label: 'Situationship 🤔' },
  { value: 'side_piece', label: 'Side Piece 🌙' },
  { value: 'wifey', label: 'Wifey 💍' },
];

export default function AddPlayerScreen() {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'prospect' | 'dating' | 'situationship' | 'side_piece' | 'wifey'>('prospect');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [notes, setNotes] = useState('');
  const [looksRating, setLooksRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const imagePickerRef = useRef<ImagePicker.ImagePickerResult | null>(null);

  async function handleImagePick() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64 && result.assets[0].uri) {
        imagePickerRef.current = result;
        setImageUrl(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image');
    }
  }

  async function handleAddPlayer() {
    if (!name) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let finalImageUrl = '';

      if (imagePickerRef.current?.assets?.[0]?.base64) {
        const base64Data = imagePickerRef.current.assets[0].base64;
        finalImageUrl = await uploadProfileImage(`data:image/jpeg;base64,${base64Data}`);
      }

      await createProfile({
        name,
        status,
        image_url: finalImageUrl || undefined,
        likes: likes ? likes.split(',').map(like => like.trim()).filter(Boolean) : [],
        dislikes: dislikes ? dislikes.split(',').map(dislike => dislike.trim()).filter(Boolean) : [],
        notes: notes || '',
        looks_rating: looksRating,
        rating: ''
      });

      router.back();
    } catch (err) {
      setError('Failed to add player. Please try again.');
      console.error('Error adding player:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Player</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleAddPlayer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Check size={24} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.imageSection}>
          <TouchableOpacity onPress={handleImagePick}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={40} color={Colors.gray[400]} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.imageButton}
            onPress={handleImagePick}
          >
            <Text style={styles.imageButtonText}>
              {imageUrl ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter player name"
              placeholderTextColor={Colors.gray[600]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Looks Rating</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.ratingButton,
                    looksRating === num && styles.ratingButtonActive
                  ]}
                  onPress={() => setLooksRating(num)}
                >
                  <Text style={[
                    styles.ratingText,
                    looksRating === num && styles.ratingTextActive
                  ]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusButton,
                    status === option.value && styles.statusButtonActive
                  ]}
                  onPress={() => setStatus(option.value as any)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    status === option.value && styles.statusButtonTextActive
                  ]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Likes</Text>
            <TextInput
              style={styles.input}
              value={likes}
              onChangeText={setLikes}
              placeholder="Enter likes (comma-separated)"
              placeholderTextColor={Colors.gray[600]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dislikes</Text>
            <TextInput
              style={styles.input}
              value={dislikes}
              onChangeText={setDislikes}
              placeholder="Enter dislikes (comma-separated)"
              placeholderTextColor={Colors.gray[600]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes"
              placeholderTextColor={Colors.gray[600]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary[400],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  headerTitle: {
    fontFamily: 'Rubik-Bold',
    fontSize: 20,
    color: Colors.white,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.green[600],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.red[500],
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: Colors.secondary[300],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.secondary[500],
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.secondary[400],
  },
  imageButton: {
    backgroundColor: Colors.secondary[400],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary[500],
  },
  imageButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.white,
  },
  form: {
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
  textArea: {
    minHeight: 120,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary[300],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary[400],
  },
  ratingButtonActive: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[600],
  },
  ratingText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.gray[400],
  },
  ratingTextActive: {
    color: Colors.white,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    backgroundColor: Colors.secondary[300],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary[400],
    minWidth: '48%',
  },
  statusButtonActive: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[600],
  },
  statusButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  statusButtonTextActive: {
    color: Colors.white,
  },
});