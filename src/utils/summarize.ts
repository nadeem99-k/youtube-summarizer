import axios from 'axios';

export const generateSummary = async (text: string): Promise<string> => {
  try {
    if (!text || text.trim().length < 50) {
      throw new Error('Not enough content to generate a meaningful summary');
    }

    // Clean and format the text
    const cleanText = text
      .replace(/\([^)]*\)/g, '') // Remove content in parentheses
      .replace(/http\S+|www\.\S+/g, '') // Remove URLs
      .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Remove extra spaces
      .trim();

    // Simplified format for better API response
    const formattedText = `
Summarize this YouTube video content:
${cleanText.slice(0, 1000)}
`.trim();

    try {
      const response = await axios.post('/api/summarize', { 
        text: formattedText 
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000, // Increased timeout to 60 seconds
        validateStatus: (status) => status === 200
      });

      if (!response.data?.summary) {
        throw new Error('Failed to generate summary - empty response');
      }

      // Simplified response format
      return response.data.summary
        .split('\n')
        .filter(Boolean)
        .join('\n\n');

    } catch (apiError: any) {
      console.error('API Error:', apiError);
      
      if (apiError.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      
      if (apiError.response) {
        switch (apiError.response.status) {
          case 429:
            throw new Error('Too many requests. Please wait a moment and try again.');
          case 500:
            throw new Error('The summarization service is currently busy. Please try again in a few moments.');
          case 503:
            throw new Error('Service temporarily unavailable. Please try again later.');
          default:
            throw new Error(`Summarization failed (${apiError.response.status}). Please try again.`);
        }
      }
      
      throw new Error('Network error. Please check your connection and try again.');
    }
  } catch (error: any) {
    console.error('Summarization error:', error);
    throw error; // Preserve the original error message
  }
}; 