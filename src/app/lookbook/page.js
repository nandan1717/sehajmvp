import LookbookGrid from '@/components/LookbookGrid/LookbookGrid';
import LookbookHero from '@/components/LookbookHero/LookbookHero';
import { shopifyFetch } from '@/lib/shopify/client';
import { getShopQuery } from '@/lib/shopify/queries';
import { getPexelsPhotoById, getPexelsPhotos } from '@/lib/pexels';
import { unstable_cache } from 'next/cache';

export const metadata = {
  title: 'Lookbook | Indian Wear Store',
  description: 'Explore our latest collections and inspirations from our Instagram feed.',
};

// Mock data to use when INSTAGRAM_ACCESS_TOKEN is missing or API fails
const MOCK_POSTS = [
  {
    id: 'mock1',
    media_url: '/media/hero-video.mp4', // Local video to simulate a reel/story
    permalink: 'https://instagram.com/mehnazzlegacy',
    caption: 'Behind the scenes of our latest festive collection shoot! The energy on set was just unmatched. 🎥✨ #BTS #IndianWear',
    media_type: 'VIDEO',
    thumbnail_url: 'https://images.pexels.com/photos/18258356/pexels-photo-18258356.jpeg',
    timestamp: new Date().toISOString()
  },
  {
    id: 'mock2',
    media_url: 'https://images.pexels.com/photos/14856011/pexels-photo-14856011.jpeg',
    permalink: 'https://instagram.com/mehnazzlegacy',
    caption: 'Details matter. The intricate embroidery on our latest collection tells a story of craftsmanship passed down through generations. 🧵🤍',
    media_type: 'IMAGE',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mock3',
    media_url: 'https://images.pexels.com/photos/20349286/pexels-photo-20349286.jpeg',
    permalink: 'https://instagram.com/mehnazzlegacy',
    caption: 'Contemporary silhouettes meet traditional motifs. Step out in style with our modern take on classic Indian wear.',
    media_type: 'IMAGE',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'mock4',
    media_url: '/media/hero-video.mp4', // Simulating another video
    permalink: 'https://instagram.com/mehnazzlegacy',
    caption: 'Golden hour glow in our signature gold tissue saree. Elegance personified.',
    media_type: 'VIDEO',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'mock5',
    media_url: 'https://images.pexels.com/photos/16301282/pexels-photo-16301282.jpeg',
    permalink: 'https://instagram.com/mehnazzlegacy',
    caption: 'Pre-wedding festivities call for vibrant colors and comfortable fabrics that let you dance the night away! 💃🏽🎊',
    media_type: 'IMAGE',
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'mock6',
    media_url: 'https://images.pexels.com/photos/13816155/pexels-photo-13816155.jpeg',
    permalink: 'https://instagram.com/mehnazzlegacy',
    caption: 'A touch of modern luxury. Elevate your wardrobe with these timeless pieces.',
    media_type: 'IMAGE',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const getInstagramPosts = unstable_cache(
  async () => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!token) {
      return { posts: MOCK_POSTS, isMock: true };
    }

    try {
      // Note: To fetch 24h stories, you need an Instagram Business Account and to use the Graph API.
      // The endpoint would be `https://graph.facebook.com/v20.0/{ig_user_id}/stories`
      // For now, this fetches all your media (including vertical Reels and posts) which acts as a permanent lookbook feed.
      const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url&access_token=${token}&limit=12`;
      
      const res = await fetch(url); 
      
      if (!res.ok) {
        console.error('Failed to fetch from Instagram:', await res.text());
        return { posts: MOCK_POSTS, isMock: true }; // Fallback to mock on error
      }

      const data = await res.json();
      return { posts: data.data || [], isMock: false };
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      return { posts: MOCK_POSTS, isMock: true }; // Fallback to mock on error
    }
  },
  ['instagram-posts'],
  { revalidate: 3600, tags: ['instagram'] }
);

export default async function LookbookPage() {
  // Fetch Store Name
  const { body: shopBody } = await shopifyFetch({ query: getShopQuery });
  const storeName = shopBody?.data?.shop?.name || 'INDIAN WEAR STUDIO';

  // Fetch Instagram Feed
  const { posts, isMock } = await getInstagramPosts();

  // Fetch Hero Background Images (Specific IDs + Search results)
  const [photo1, photo2, photo3, pexelsData] = await Promise.all([
    getPexelsPhotoById('19487259'),
    getPexelsPhotoById('19389377'),
    getPexelsPhotoById('35485411'),
    getPexelsPhotos('punjabi suit models females muneeb malhotra', 5, 'landscape')
  ]);

  const specificImages = [photo1, photo2, photo3]
    .filter(Boolean)
    .map(photo => photo?.src?.original || photo?.src?.large2x);
    
  const genericImages = pexelsData
    .filter(Boolean)
    .map(photo => photo?.src?.original || photo?.src?.large2x);

  const heroImages = [...specificImages, ...genericImages].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <LookbookHero images={heroImages} storeName={storeName} />
      <LookbookGrid posts={posts} isMock={isMock} />
    </div>
  );
}
