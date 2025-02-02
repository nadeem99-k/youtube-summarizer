import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

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

    // Get video transcript
    let transcript = '';
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = transcriptItems.map(item => item.text).join(' ');
    } catch {
      console.log('No transcript available, using description only');
    }

    // Combine transcript with other information
    const fullContent = `
      Title: ${videoData.title}
      
      Transcript:
      ${transcript}
      
      Description:
      ${videoData.description}
      
      Views: ${parseInt(statistics.viewCount).toLocaleString()}
      Likes: ${parseInt(statistics.likeCount).toLocaleString()}
      Comments: ${parseInt(statistics.commentCount).toLocaleString()}
      
      Tags: ${videoData.tags ? videoData.tags.join(', ') : 'No tags'}
    `;

    return {
      ...videoData,
      description: fullContent,
      transcript,
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