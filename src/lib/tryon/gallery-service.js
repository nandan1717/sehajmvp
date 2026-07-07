import { supabase, isSupabaseConfigured } from '../supabase/client';

const MAX_PHOTOS = 2;

function getStorageKey(type, userId) {
  const id = userId || 'guest';
  return `rivaaz_tryon_${type}_${id}`;
}

// Helper to get from local storage
function getLocal(key) {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return [];
  }
}

// Helper to save to local storage
function saveLocal(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

/**
 * Get user's reference photos (limited to 2)
 */
export async function getUserPhotos(userId) {
  const localKey = getStorageKey('photos', userId);
  const localPhotos = getLocal(localKey);

  if (isSupabaseConfigured && userId && userId !== 'guest') {
    try {
      const { data, error } = await supabase
        .from('tryon_photos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(MAX_PHOTOS);

      if (!error && data) {
        // Merge or sync if needed, return database photos
        if (data.length > 0) return data;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using localStorage fallback:', err);
    }
  }

  return localPhotos;
}

/**
 * Save a reference photo for try-on (enforces 2-photo limit)
 * @param {string} userId
 * @param {object} photoData - { url, dataUrl, name }
 * @param {string} [replaceId] - Optional ID of existing photo to replace if at limit
 */
export async function saveUserPhoto(userId, photoData, replaceId = null) {
  const photos = await getUserPhotos(userId);
  const localKey = getStorageKey('photos', userId);

  const newPhoto = {
    id: photoData.id || `photo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    url: photoData.url || photoData.dataUrl,
    dataUrl: photoData.dataUrl || photoData.url,
    name: photoData.name || `My Photo ${photos.length + 1}`,
    createdAt: new Date().toISOString(),
    isDefault: photos.length === 0 // Make default if it's the first photo
  };

  let updatedPhotos = [...photos];

  // Check 2-photo limit
  if (updatedPhotos.length >= MAX_PHOTOS) {
    if (replaceId) {
      // Replace specified photo
      const index = updatedPhotos.findIndex(p => p.id === replaceId);
      if (index !== -1) {
        newPhoto.isDefault = updatedPhotos[index].isDefault;
        updatedPhotos[index] = newPhoto;
      } else {
        // Replace oldest non-default or oldest
        const nonDefaultIndex = updatedPhotos.findIndex(p => !p.isDefault);
        if (nonDefaultIndex !== -1) {
          updatedPhotos[nonDefaultIndex] = newPhoto;
        } else {
          updatedPhotos[0] = newPhoto;
          updatedPhotos[0].isDefault = true;
        }
      }
    } else {
      // Replace oldest photo by default when at 2 photo limit
      const nonDefaultIndex = updatedPhotos.findIndex(p => !p.isDefault);
      if (nonDefaultIndex !== -1) {
        updatedPhotos[nonDefaultIndex] = newPhoto;
      } else {
        updatedPhotos[0] = newPhoto;
        updatedPhotos[0].isDefault = true;
      }
    }
  } else {
    updatedPhotos.push(newPhoto);
  }

  // Ensure at least one photo is default
  if (!updatedPhotos.some(p => p.isDefault) && updatedPhotos.length > 0) {
    updatedPhotos[0].isDefault = true;
  }

  // Save to localStorage
  saveLocal(localKey, updatedPhotos);

  // Save to Supabase if configured
  if (isSupabaseConfigured && userId && userId !== 'guest') {
    try {
      if (replaceId) {
        await supabase.from('tryon_photos').delete().eq('id', replaceId).eq('user_id', userId);
      }
      await supabase.from('tryon_photos').upsert({
        id: newPhoto.id,
        user_id: userId,
        url: newPhoto.url,
        data_url: newPhoto.dataUrl,
        name: newPhoto.name,
        is_default: newPhoto.isDefault,
        created_at: newPhoto.createdAt
      });
    } catch (err) {
      console.warn('Supabase photo save failed, saved in localStorage:', err);
    }
  }

  return { success: true, photos: updatedPhotos, addedPhoto: newPhoto };
}

/**
 * Set one of the 2 photos as default
 */
export async function setDefaultPhoto(userId, photoId) {
  const photos = await getUserPhotos(userId);
  const localKey = getStorageKey('photos', userId);

  const updatedPhotos = photos.map(p => ({
    ...p,
    isDefault: p.id === photoId
  }));

  saveLocal(localKey, updatedPhotos);

  if (isSupabaseConfigured && userId && userId !== 'guest') {
    try {
      await supabase.from('tryon_photos').update({ is_default: false }).eq('user_id', userId);
      await supabase.from('tryon_photos').update({ is_default: true }).eq('id', photoId).eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase setDefault failed:', err);
    }
  }

  return { success: true, photos: updatedPhotos };
}

/**
 * Delete a user photo
 */
export async function deleteUserPhoto(userId, photoId) {
  const photos = await getUserPhotos(userId);
  const localKey = getStorageKey('photos', userId);

  let updatedPhotos = photos.filter(p => p.id !== photoId);

  // If deleted photo was default, make the remaining one default
  if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isDefault)) {
    updatedPhotos[0].isDefault = true;
  }

  saveLocal(localKey, updatedPhotos);

  if (isSupabaseConfigured && userId && userId !== 'guest') {
    try {
      await supabase.from('tryon_photos').delete().eq('id', photoId).eq('user_id', userId);
      if (updatedPhotos.length > 0 && updatedPhotos[0].isDefault) {
        await supabase.from('tryon_photos').update({ is_default: true }).eq('id', updatedPhotos[0].id).eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Supabase delete failed:', err);
    }
  }

  return { success: true, photos: updatedPhotos };
}

/**
 * Get user's saved try-on outfit looks from gallery
 */
export async function getTryonGallery(userId) {
  const localKey = getStorageKey('gallery', userId);
  const localGallery = getLocal(localKey);

  if (isSupabaseConfigured && userId && userId !== 'guest') {
    try {
      const { data, error } = await supabase
        .from('tryon_gallery')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          tryonImageUrl: item.tryon_image_url,
          photoUsedUrl: item.photo_used_url,
          product: item.product_data,
          stylistNotes: item.stylist_notes,
          createdAt: item.created_at
        }));
      }
    } catch (err) {
      console.warn('Supabase gallery fetch failed, using localStorage:', err);
    }
  }

  return localGallery;
}

/**
 * Save a generated try-on outfit look to gallery
 */
export async function saveTryonLook(userId, lookData) {
  const gallery = await getTryonGallery(userId);
  const localKey = getStorageKey('gallery', userId);

  const newLook = {
    id: `look_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    tryonImageUrl: lookData.tryonImageUrl,
    photoUsedUrl: lookData.photoUsedUrl || null,
    product: lookData.product || {},
    stylistNotes: lookData.stylistNotes || 'AI custom draping and fit analysis.',
    createdAt: new Date().toISOString()
  };

  const updatedGallery = [newLook, ...gallery];
  saveLocal(localKey, updatedGallery);

  if (isSupabaseConfigured && userId && userId !== 'guest') {
    try {
      await supabase.from('tryon_gallery').insert({
        id: newLook.id,
        user_id: userId,
        tryon_image_url: newLook.tryonImageUrl,
        photo_used_url: newLook.photoUsedUrl,
        product_data: newLook.product,
        stylist_notes: newLook.stylistNotes,
        created_at: newLook.createdAt
      });
    } catch (err) {
      console.warn('Supabase gallery save failed, saved in localStorage:', err);
    }
  }

  return { success: true, look: newLook, gallery: updatedGallery };
}

/**
 * Delete a saved look from gallery
 */
export async function deleteTryonLook(userId, lookId) {
  const gallery = await getTryonGallery(userId);
  const localKey = getStorageKey('gallery', userId);

  const updatedGallery = gallery.filter(l => l.id !== lookId);
  saveLocal(localKey, updatedGallery);

  if (isSupabaseConfigured && userId && userId !== 'guest') {
    try {
      await supabase.from('tryon_gallery').delete().eq('id', lookId).eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase gallery delete failed:', err);
    }
  }

  return { success: true, gallery: updatedGallery };
}

/**
 * Migrate guest photos and gallery to authenticated user when they sign in with Google
 */
export async function syncGuestToUserProfile(userId) {
  if (!userId || userId === 'guest') return;

  const guestPhotos = getLocal('rivaaz_tryon_photos_guest');
  const guestGallery = getLocal('rivaaz_tryon_gallery_guest');

  if (guestPhotos.length > 0) {
    const userPhotos = await getUserPhotos(userId);
    if (userPhotos.length < MAX_PHOTOS) {
      for (const gp of guestPhotos) {
        if (userPhotos.length < MAX_PHOTOS) {
          await saveUserPhoto(userId, gp);
          userPhotos.push(gp);
        }
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rivaaz_tryon_photos_guest');
    }
  }

  if (guestGallery.length > 0) {
    for (const gl of guestGallery) {
      await saveTryonLook(userId, gl);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rivaaz_tryon_gallery_guest');
    }
  }
}
