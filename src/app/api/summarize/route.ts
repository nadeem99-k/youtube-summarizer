import { NextResponse } from 'next/server';
import axios from 'axios';

const MAX_TEXT_LENGTH = 8000; // Increased for better context
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add custom error type at the top of the file
interface ApiError extends Error {
  response?: {
    status: number;
  };
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for summarization');
    }

    const truncatedText = text.length > MAX_TEXT_LENGTH 
      ? text.substring(0, MAX_TEXT_LENGTH) + '...'
      : text;

    // Try with a better model for detailed summaries
    const models = [
      'facebook/bart-large-cnn',
      'sshleifer/distilbart-cnn-12-6',
      'google/pegasus-xsum'
    ];

    for (const model of models) {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            await sleep(RETRY_DELAY * Math.pow(2, attempt - 1));
          }

          const response = await axios.post(
            `https://api-inference.huggingface.co/models/${model}`,
            {
              inputs: truncatedText,
              parameters: {
                max_length: 1000,
                min_length: 300,
                length_penalty: 2.0,
                num_beams: 4,
                temperature: 0.7,
                repetition_penalty: 1.2,
                do_sample: true,
                top_k: 50,
                top_p: 0.95,
                early_stopping: true
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
            // Post-process the summary
            let summary = response.data[0].summary_text;
            
            // Add section headers
            summary = `🎯 Key Points:\n${summary}\n\n` +
                     `🔍 Main Topics Covered:\n` +
                     summary.split('. ')
                       .filter((s: string) => s.length > 30)
                       .map((s: string) => `• ${s.trim()}`)
                       .join('\n');

            return NextResponse.json({ summary });
          }
        } catch (error: unknown) {
          const apiError = error as ApiError;
          console.error(`Model ${model}, Attempt ${attempt + 1} failed:`, apiError.message);
          if (apiError.response && apiError.response.status !== 500) {
            continue; // Try next model
          }
        }
      }
    }

    throw new Error('Failed to generate summary with all models');
  } catch (error: unknown) {
    console.error('Summarization error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again in a few moments.' },
      { status: 500 }
    );
  }
} 