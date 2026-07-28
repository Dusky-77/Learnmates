import { FavoriteSubject, saveFavoriteSubjects } from './favoriteSubjects';
import { supabase } from '../lib/supabaseClient';

export type UserProfile = {
  username: string | null;
  name: string | null;
  study_level: string | null;
  boards: string[] | null;
  exam_session: string | null;
  profile_complete: boolean;
};

export async function loadFavoriteSubjectsForUser(userId: string): Promise<FavoriteSubject[]> {
  const { data, error } = await supabase
    .from('user_favorite_subjects')
    .select('subject, level, board')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to load favorite subjects:', error.message);
    return [];
  }

  const subjects = (data ?? []).map((row) => ({
    subject: row.subject,
    level: row.level,
    board: row.board as FavoriteSubject['board'],
  }));

  if (subjects.length > 0) {
    saveFavoriteSubjects(subjects);
  }

  return subjects;
}

export async function saveFavoriteSubjectsForUser(
  userId: string,
  subjects: FavoriteSubject[]
): Promise<{ error: string | null }> {
  const { error: deleteError } = await supabase
    .from('user_favorite_subjects')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (subjects.length === 0) {
    return { error: null };
  }

  const rows = subjects.map((item) => ({
    user_id: userId,
    subject: item.subject,
    level: item.level,
    board: item.board,
  }));

  const { error } = await supabase.from('user_favorite_subjects').insert(rows);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function syncFavoriteSubjectsToDb(
  userId: string,
  subjects: FavoriteSubject[]
): Promise<void> {
  const { error } = await saveFavoriteSubjectsForUser(userId, subjects);
  if (error) {
    console.error('Failed to sync favorite subjects:', error);
  }
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, name, study_level, boards, exam_session, profile_complete')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch profile:', error.message);
    return null;
  }

  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'study_level' | 'boards' | 'exam_session'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update profile:', error.message);
    return { error: error.message };
  }

  return { error: null };
}
