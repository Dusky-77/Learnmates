import { User } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type EmailAuthInfo = {
  exists: boolean;
  providers: string[];
  emailConfirmed: boolean;
};

function isMissingRpcError(error: PostgrestError): boolean {
  return (
    error.code === 'PGRST202' ||
    error.message.includes('Could not find the function') ||
    error.message.includes('schema cache')
  );
}

function displayNameFromUser(user: User): string {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Student'
  );
}

export async function getEmailAuthInfo(email: string): Promise<EmailAuthInfo> {
  const { data, error } = await supabase.rpc('get_email_auth_info', {
    check_email: email.trim().toLowerCase(),
  });

  if (error) {
    if (isMissingRpcError(error)) {
      return { exists: false, providers: [], emailConfirmed: false };
    }
    throw new Error(error.message);
  }

  const payload = data as {
    exists?: boolean;
    providers?: string[];
    email_confirmed?: boolean;
  };

  return {
    exists: Boolean(payload?.exists),
    providers: payload?.providers ?? [],
    emailConfirmed: Boolean(payload?.email_confirmed),
  };
}

export function getAuthConflictMessage(info: EmailAuthInfo, mode: 'signup' | 'signin'): string | null {
  if (!info.exists) {
    return null;
  }

  const hasGoogle = info.providers.includes('google');
  const hasEmail = info.providers.includes('email');

  if (mode === 'signup') {
    if (hasGoogle && !hasEmail) {
      return 'This email is already registered with Google. Please sign in with Google instead.';
    }
    if (hasEmail) {
      return 'An account with this email already exists. Sign in instead of creating a new account.';
    }
    return 'An account with this email already exists. Try signing in.';
  }

  if (hasGoogle && !hasEmail) {
    return 'This account uses Google sign-in. Please use the "Sign in with Google" button.';
  }

  return null;
}

export async function ensureProfile(user: User): Promise<boolean> {
  const name = displayNameFromUser(user);

  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (readError) {
    console.error('Failed to read profile:', readError.message);
    return false;
  }

  if (existing) {
    return true;
  }

  const { error: insertError } = await supabase.from('profiles').insert({
    id: user.id,
    name,
  });

  if (!insertError) {
    return true;
  }

  if (insertError.code === '23505') {
    return true;
  }

  console.error('Failed to ensure profile:', insertError.message);
  return false;
}

async function isUsernameTakenViaRpc(username: string): Promise<boolean | null> {
  const { data, error } = await supabase.rpc('is_username_taken', {
    check_username: username,
  });

  if (!error) {
    return Boolean(data);
  }

  if (isMissingRpcError(error)) {
    return null;
  }

  throw new Error(error.message);
}

async function isUsernameAvailableViaRpc(username: string, userId?: string): Promise<boolean | null> {
  const { data, error } = await supabase.rpc('is_username_available', {
    desired_username: username,
    for_user_id: userId ?? null,
  });

  if (!error) {
    return Boolean(data);
  }

  if (isMissingRpcError(error)) {
    return null;
  }

  throw new Error(error.message);
}

export async function isUsernameAvailable(username: string, userId?: string): Promise<boolean> {
  const viaAvailable = await isUsernameAvailableViaRpc(username, userId);
  if (viaAvailable !== null) {
    return viaAvailable;
  }

  const viaTaken = await isUsernameTakenViaRpc(username);
  if (viaTaken === null) {
    return true;
  }

  if (!viaTaken) {
    return true;
  }

  if (!userId) {
    return false;
  }

  const { data: ownProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();

  return ownProfile?.username?.toLowerCase() === username.toLowerCase();
}

export function isUsernameUniqueViolation(error: PostgrestError | null): boolean {
  return error?.code === '23505' && (error.message.includes('username') || error.details?.includes('username'));
}
