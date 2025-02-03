import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const fetchVideoData = async (videoId: string) => {
  try {
    // Get video metadata from YouTube API
    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
      }
    });

    if (!videoResponse.data.items?.[0]) {
      throw new Error('Video not found');
    }

    const videoData = videoResponse.data.items[0];
    let transcriptText = '';
    const transcriptLanguage = 'en';

    try {
      // Try to fetch transcript with retries
      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`Attempting to fetch transcript, attempt ${4 - retries}`);
          
          // Use fetchTranscript to get video captions
          const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
          
          if (transcriptItems && transcriptItems.length > 0) {
            transcriptText = transcriptItems
              .map(item => item.text)
              .join(' ')
              .replace(/\[.*?\]/g, '') // Remove text in brackets
              .replace(/\(.*?\)/g, '') // Remove text in parentheses
              .replace(/(?:um|uh|like|you know)\s*/gi, '') // Remove filler words
              .replace(/\s+/g, ' ') // Normalize whitespace
              .replace(/([.!?])\s*/g, '$1\n') // Add newlines after sentences
              .trim();
            
            if (transcriptText.length > 100) {
              break;
            }
          }
          
          retries--;
          if (retries > 0) {
            // Exponential backoff
            const delay = Math.pow(2, 3 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error(`Attempt ${4 - retries} failed:`, error);
          retries--;
          if (retries > 0) {
            // Exponential backoff
            const delay = Math.pow(2, 3 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // If no transcript found, use video description as fallback
      if (!transcriptText) {
        console.log('Using video description as fallback');
        transcriptText = videoData.snippet.description
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .replace(/http\S+|www\.\S+/g, '')
          .replace(/[^\w\s.,!?-]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      if (!transcriptText || transcriptText.length < 100) {
        throw new Error('No suitable content available for this video');
      }

      // Extract timestamps and chapters if available
      const chapters = extractChapters(videoData.snippet.description);

      return {
        title: videoData.snippet.title,
        description: transcriptText,
        thumbnails: videoData.snippet.thumbnails,
        channelTitle: videoData.snippet.channelTitle,
        publishedAt: videoData.snippet.publishedAt,
        duration: formatDuration(videoData.contentDetails.duration),
        chapters: chapters,
        tags: videoData.snippet.tags || [],
        language: transcriptLanguage,
        transcript: transcriptText
      };

    } catch (error) {
      console.error('Content extraction error:', error);
      throw new Error('Could not extract video content. Please try a different video or check if captions are available.');
    }

  } catch (error: unknown) {
    console.error('Video data fetch error:', error);
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 403) {
      throw new Error('YouTube API quota exceeded. Please try again later.');
    } else if (axiosError.response?.status === 404) {
      throw new Error('Video not found. Please check the URL and try again.');
    } else {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch video data. Please try again.');
    }
  }
};

// Helper function to extract chapters from description
function extractChapters(description: string) {
  const timeRegex = /(\d{1,2}:)?(\d{1,2}):(\d{2})\s*[-–]\s*(.+)/g;
  const chapters = [];
  let match;

  while ((match = timeRegex.exec(description)) !== null) {
    chapters.push({
      time: match[0].split(/[-–]/)[0].trim(),
      title: match[4].trim()
    });
  }

  return chapters.length > 0 ? chapters : null;
}

// Helper function to format duration
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  let result = '';
  if (hours) result += `${hours}:`;
  result += `${minutes.padStart(2, '0')}:`;
  result += seconds.padStart(2, '0');

  return result;
} 