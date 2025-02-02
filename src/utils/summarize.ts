import axios from 'axios';

export const generateSummary = async (text: string): Promise<string> => {
  try {
    const response = await axios.post('/api/summarize', { text });
    return response.data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}; 