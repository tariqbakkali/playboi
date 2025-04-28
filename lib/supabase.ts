import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client with minimal config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Types
export type Profile = {
  rating: string;
  id: string;
  user_id: string;
  name: string;
  status: 'prospect' | 'dating' | 'situationship' | 'side_piece' | 'wifey';
  image_url?: string;
  likes: string[];
  dislikes: string[];
  notes: string;
  looks_rating?: number;
  created_at: string;
  updated_at: string;
  bench?: boolean;
};

export type Meeting = {
  id: string;
  profile_id: string;
  type: string;
  amount_spent: number;
  base?: string;
  rating: number;
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
};

export type UpcomingDate = {
  id: string;
  profile_id: string;
  type: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
  };
};

// Database functions
export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Profile[];
}

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function createProfile(profile: Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      ...profile,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(id: string, profile: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getMeetings(profileId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('profile_id', profileId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Meeting[];
}

export async function createMeeting(meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single();

  if (error) throw error;
  return data as Meeting;
}

export async function getUpcomingDates() {
  const { data, error } = await supabase
    .from('upcoming_dates')
    .select(`
      *,
      profiles (
        name
      )
    `)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createUpcomingDate(upcomingDate: Omit<UpcomingDate, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('upcoming_dates')
    .insert(upcomingDate)
    .select()
    .single();

  if (error) throw error;
  return data as UpcomingDate;
}

export async function updateUpcomingDate(id: string, upcomingDate: Partial<UpcomingDate>) {
  const { data, error } = await supabase
    .from('upcoming_dates')
    .update(upcomingDate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as UpcomingDate;
}

export async function deleteUpcomingDate(id: string) {
  const { error } = await supabase
    .from('upcoming_dates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadProfileImage(base64Image: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Extract base64 data from data URI
  const base64Data = base64Image.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `${user.id}-${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('profile-images')
    .upload(filename, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('profile-images')
    .getPublicUrl(data.path);

  return publicUrl;
}