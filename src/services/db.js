import { supabase } from '../utils/supabase';

// -------------------------------------------------------------
// PROFILE OPERATIONS
// -------------------------------------------------------------

/**
 * Fetch the current user's profile table record
 * @param {string} userId - UUID
 */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
};

/**
 * Update the current user's profile table configuration
 * @param {string} userId - UUID
 * @param {object} profileData - Properties (name, target_course, budget, etc.)
 */
export const updateProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select();

  return { data, error };
};

// -------------------------------------------------------------
// SAVED UNIVERSITIES OPERATIONS
// -------------------------------------------------------------

/**
 * Save a new university for the user
 * @param {object} universityData - { user_id, university_name, country, course }
 */
export const saveUniversity = async (universityData) => {
  const { data, error } = await supabase
    .from('saved_universities')
    .insert([universityData])
    .select();

  return { data, error };
};

/**
 * Get all Universities saved by a user
 * @param {string} userId - UUID
 */
export const getSavedUniversities = async (userId) => {
  const { data, error } = await supabase
    .from('saved_universities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

// -------------------------------------------------------------
// LOAN PROFILES OPERATIONS
// -------------------------------------------------------------

/**
 * Insert or log a new loan calculation response
 * @param {object} loanData - { user_id, income, has_coapplicant, has_collateral, eligibility, emi }
 */
export const saveLoanProfile = async (loanData) => {
  const { data, error } = await supabase
    .from('loan_profiles')
    .insert([loanData])
    .select();

  return { data, error };
};

// -------------------------------------------------------------
// USER PROGRESS OPERATIONS
// -------------------------------------------------------------

/**
 * Update the user's gamification score and checklist progress
 * @param {string} userId - UUID
 * @param {object} progressData - e.g. { profile_completed: true, score: 50 }
 */
export const updateProgress = async (userId, progressData) => {
  const { data, error } = await supabase
    .from('user_progress')
    .update({ 
      ...progressData,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select();

  return { data, error };
};

/**
 * Fetch the user's gamification score and checklist progress
 * @param {string} userId - UUID
 */
export const getProgress = async (userId) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
};
