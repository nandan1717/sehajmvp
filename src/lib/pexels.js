// lib/pexels.js

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

/**
 * Fetch photos from Pexels
 * @param {string} query - The search query
 * @param {string} orientation - The orientation of the photos (landscape, portrait, square)
 * @returns {Promise<Array>} Array of photo objects
 */
export async function getPexelsPhotos(query = 'indian ethnic wear', perPage = 10, orientation = 'portrait') {
  if (!PEXELS_API_KEY) {
    console.warn('PEXELS_API_KEY is missing. Returning empty array for photos.');
    return [];
  }

  try {
    const orientationParam = orientation ? `&orientation=${orientation}` : '';
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}${orientationParam}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      // Cache for 1 hour to avoid hitting API limits during dev/nav
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      console.error(`Pexels API error: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return data.photos || [];
  } catch (error) {
    console.error('Error fetching Pexels photos:', error);
    return [];
  }
}

/**
 * Fetch videos from Pexels
 * @param {string} query - The search query
 * @param {number} perPage - Number of results to return
 * @returns {Promise<Array>} Array of video objects
 */
export async function getPexelsVideos(query = 'indian fashion', perPage = 5, orientation = 'portrait') {
  if (!PEXELS_API_KEY) {
    console.warn('PEXELS_API_KEY is missing. Returning empty array for videos.');
    return [];
  }

  try {
    const orientationParam = orientation ? `&orientation=${orientation}` : '';
    const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}${orientationParam}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      console.error(`Pexels API error: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return data.videos || [];
  } catch (error) {
    console.error('Error fetching Pexels videos:', error);
    return [];
  }
}

/**
 * Fetch a specific video by ID from Pexels
 * @param {string|number} id - The video ID
 * @returns {Promise<Object|null>} The video object or null
 */
export async function getPexelsVideoById(id) {
  if (!PEXELS_API_KEY) {
    console.warn('PEXELS_API_KEY is missing. Returning null.');
    return null;
  }

  try {
    const res = await fetch(`https://api.pexels.com/videos/videos/${id}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      console.error(`Pexels API error fetching video by ID: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data || null;
  } catch (error) {
    console.error('Error fetching Pexels video by ID:', error);
    return null;
  }
}

