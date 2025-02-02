import { NextResponse } from 'next/server';
import axios from 'axios';

const MAX_TEXT_LENGTH = 5000; // Hugging Face has a token limit

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for summarization');
    }

    // Truncate text if it's too long
    const truncatedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) + '...'
      : text;

    console.log('Sending text to Hugging Face:', truncatedText.substring(0, 100) + '...');

    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        {
          inputs: truncatedText,
          parameters: {
            max_length: 300,  // Reduced from 500
            min_length: 100,  // Reduced from 200
            length_penalty: 1.0,  // Reduced from 2.0
            num_beams: 4,
            temperature: 0.8,  // Slightly increased for more creative summaries
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout
        }
      );

      if (!response.data || !response.data[0]?.summary_text) {
        throw new Error('Invalid response from Hugging Face API');
      }

      console.log('Summary received:', response.data[0].summary_text);
      return NextResponse.json({ summary: response.data[0].summary_text });
    } catch (apiError: unknown) {
      const error = apiError as Error;
      console.error('Hugging Face API error:', error.message);
      
      // Try with an even shorter text if the first attempt failed
      if (truncatedText.length > 2000) {
        const shorterText = truncatedText.substring(0, 2000) + '...';
        const retryResponse = await axios.post(
          'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
          {
            inputs: shorterText,
            parameters: {
              max_length: 200,
              min_length: 50,
              length_penalty: 1.0,
              num_beams: 4,
              temperature: 0.8,
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 60000,
          }
        );

        if (retryResponse.data && retryResponse.data[0]?.summary_text) {
          return NextResponse.json({ summary: retryResponse.data[0].summary_text });
        }
      }
      
      throw error;
    }
  } catch (error: unknown) {
    console.error('Summarization error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
} 