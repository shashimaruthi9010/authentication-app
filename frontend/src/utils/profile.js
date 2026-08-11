const PROFILE_KEY = 'user_profile';

const REQUIRED_FIELDS = [
  'age',
  'sex',
  'height',
  'weight',
  'activity_level',
  'health_goal',
];

/**
 * Returns true when the user has a completed health profile in localStorage.
 */
export function isProfileComplete() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return false;

  try {
    const profile = JSON.parse(raw);
    if (profile.profile_completed !== true) return false;
    return REQUIRED_FIELDS.every((field) => {
      const value = profile[field];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
  } catch {
    return false;
  }
}

/**
 * Persist the health profile locally and mark it complete.
 * @param {Object} data
 */
export function saveUserProfile(data) {
  const profile = {
    ...data,
    dietary_restrictions: data.dietary_restrictions ?? [],
    profile_completed: true,
    completed_at: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * Read the stored health profile, if any.
 */
export function getUserProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear profile data (e.g. on logout — optional helper for future use).
 */
export function clearUserProfile() {
  localStorage.removeItem(PROFILE_KEY);
}
