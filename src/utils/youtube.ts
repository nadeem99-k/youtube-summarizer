import axios from 'axios';

interface VideoSnippet {
  title: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  transcript?: string;
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  duration?: string;
  tags?: string[];
  category?: string;
  language?: string;
}

export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const fetchVideoData = async (videoId: string): Promise<VideoSnippet> => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
        }
      }
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const videoItem = response.data.items[0];
    const videoData = videoItem.snippet;
    const statistics = videoItem.statistics;
    const duration = videoItem.contentDetails.duration;
    const language = videoData.defaultLanguage || 'en';
    
    // Format duration from ISO 8601
    const formattedDuration = duration.replace('PT', '')
      .replace('H', ' hours ')
      .replace('M', ' minutes ')
      .replace('S', ' seconds');

    // Combine all information without transcript
    const fullContent = `
      Title: ${videoData.title}
      Channel: ${videoData.channelTitle}
      Language: ${language}
      Published: ${new Date(videoData.publishedAt).toLocaleDateString()}
      Duration: ${formattedDuration}
      Views: ${parseInt(statistics.viewCount).toLocaleString()}
      Likes: ${parseInt(statistics.likeCount).toLocaleString()}
      Comments: ${parseInt(statistics.commentCount).toLocaleString()}
      
      Description:
      ${videoData.description}
      
      Tags: ${videoData.tags ? videoData.tags.join(', ') : 'No tags'}
    `;

    return {
      ...videoData,
      description: fullContent,
      statistics,
      duration: formattedDuration,
      tags: videoData.tags || [],
      language
    };
  } catch (error) {
    console.error('Error fetching video data:', error);
    throw new Error('Failed to fetch video data. Please check your YouTube URL.');
  }
}; 