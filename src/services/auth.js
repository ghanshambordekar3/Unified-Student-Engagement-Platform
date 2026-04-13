import { supabase } from '../utils/supabase';

/**
 * Sign up a new user with an email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object | null, error: object | null}>}
 */
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { user: data?.user, error };
};

/**
 * Sign in an existing user with an email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object | null, error: object | null}>}
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data?.user, error };
};

/**
 * Sign out the currently logged-in user
 * @returns {Promise<{error: object | null}>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Get the current active user session status
 * @returns {Promise<{session: object | null, user: object | null}>}
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, user: session?.user || null, error };
};

/**
 * Sign in with Google Web OAuth (Optional)
 * NOTE: Ensure Google Auth is enabled under Supabase Auth Providers setting.
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
};
