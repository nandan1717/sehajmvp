const fs = require('fs');
const https = require('https');
const path = require('path');

const PEXELS_API_KEY = 't9zU87o1KdgC3mD6Wry2C6sRMHLHerAiwpuopJhyqVsJWRTAvrLd8oQr';
const QUERY = 'phulkari embroidery punjabi suit women';
const PUBLIC_MEDIA_DIR = path.join(__dirname, 'public', 'media');

if (!fs.existsSync(PUBLIC_MEDIA_DIR)) {
  fs.mkdirSync(PUBLIC_MEDIA_DIR, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // handle redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Failed to download, status code: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  try {
    console.log('Fetching video from Pexels API...');
    const videoRes = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(QUERY)}&per_page=5&orientation=portrait`, {
      headers: { Authorization: PEXELS_API_KEY }
    });
    const videoData = await videoRes.json();
    const hdVideo = videoData.videos[0]?.video_files?.find(v => v.quality === 'hd')?.link;
    
    if (hdVideo) {
      console.log('Downloading HD video from:', hdVideo);
      await downloadFile(hdVideo, path.join(PUBLIC_MEDIA_DIR, 'hero-video.mp4'));
      console.log('Video downloaded successfully.');
    } else {
      console.log('No HD video found.');
    }

    console.log('Fetching photo from Pexels API...');
    const photoRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(QUERY)}&per_page=1&orientation=portrait`, {
      headers: { Authorization: PEXELS_API_KEY }
    });
    const photoData = await photoRes.json();
    const largePhoto = photoData.photos[0]?.src?.large2x;
    
    if (largePhoto) {
      console.log('Downloading photo from:', largePhoto);
      await downloadFile(largePhoto, path.join(PUBLIC_MEDIA_DIR, 'hero-image.jpg'));
      console.log('Photo downloaded successfully.');
    } else {
      console.log('No photo found.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
