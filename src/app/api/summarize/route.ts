import { NextResponse } from 'next/server';
import axios from 'axios';

const MAX_TEXT_LENGTH = 5000; // Hugging Face has a token limit
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    let lastError: Error | null = null;
    
    // Try multiple times with exponential backoff
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          await sleep(RETRY_DELAY * Math.pow(2, attempt - 1));
        }

        const response = await axios.post(
          'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
          {
            inputs: truncatedText,
            parameters: {
              max_length: 800,
              min_length: 200,
              length_penalty: 2.0,
              num_beams: 4,
              temperature: 0.8,
              repetition_penalty: 1.2
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

        if (response.data && response.data[0]?.summary_text) {
          return NextResponse.json({ summary: response.data[0].summary_text });
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
        
        // If it's not a 500 error, don't retry
        if (error.response && error.response.status !== 500) {
          break;
        }
      }
    }

    // If all attempts failed, try with a shorter text
    if (truncatedText.length > 2000) {
      try {
        const shorterText = truncatedText.substring(0, 2000) + '...';
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
          {
            inputs: shorterText,
            parameters: {
              max_length: 400,
              min_length: 150,
              length_penalty: 2.0,
              num_beams: 4,
              temperature: 0.8,
              repetition_penalty: 1.2
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

        if (response.data && response.data[0]?.summary_text) {
          return NextResponse.json({ summary: response.data[0].summary_text });
        }
      } catch (error) {
        console.error('Shorter text attempt failed:', error);
      }
    }

    throw lastError || new Error('Failed to generate summary after all attempts');
  } catch (error: unknown) {
    console.error('Summarization error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again in a few moments.' },
      { status: 500 }
    );
  }
} 