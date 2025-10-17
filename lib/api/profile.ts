import { supabase } from '../supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export async function getCurrentUserProfile(userId: string) {
  const [userRes, profileRes, intentRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('intents').select('*').eq('user_id', userId).single(),
  ]);

  if (userRes.error) throw userRes.error;

  return {
    user: userRes.data,
    profile: profileRes.data,
    intent: intentRes.data,
  };
}

export async function uploadAvatar(userId: string): Promise<string | null> {
  // Request permission
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    throw new Error('Permission to access camera roll is required');
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;

  const photo = result.assets[0];
  
  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(photo.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Upload to Supabase Storage
  const filePath = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage
    .from('pf-avatars')
    .upload(filePath, decode(base64), {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage
    .from('pf-avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function getAvatarUrl(userId: string): Promise<string | null> {
  const filePath = `${userId}/avatar.jpg`;
  const { data } = supabase.storage
    .from('pf-avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

