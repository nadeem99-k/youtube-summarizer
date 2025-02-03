import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Content is too short for summarization' },
        { status: 400 }
      );
    }

    // Enhanced prompt for educational content
    const enhancedText = `
Generate a detailed summary of this educational video content. Include:
- Main topics and concepts covered
- Key points and explanations
- Important examples or demonstrations
- Any recommendations or resources mentioned

Content:
${text}
`.trim();

    // Try different models in case one is unavailable
    const models = [
      'facebook/bart-large-cnn',
      'sshleifer/distilbart-cnn-12-6',
      'google/pegasus-xsum'
    ];

    // Define type for lastError
    let lastError: { response?: { status: number } } | null = null;

    for (const model of models) {
      let retries = 3; // Reset retries for each model
      
      while (retries > 0) {
        try {
          console.log(`Trying model: ${model}, attempt: ${4 - retries}`);
          
          const response = await axios.post(
            `https://api-inference.huggingface.co/models/${model}`,
            {
              inputs: enhancedText.slice(0, 2000),
              parameters: {
                max_length: 300,
                min_length: 100,
                do_sample: true,
                temperature: 0.8,
                top_p: 0.95,
                repetition_penalty: 1.2
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              timeout: 60000
            }
          );

          // Handle different response formats
          const summary = response.data?.[0]?.summary_text || 
                         response.data?.[0]?.generated_text ||
                         response.data?.summary_text ||
                         response.data?.generated_text;

          if (summary && summary.length > 100) {
            console.log(`Successfully generated summary using model: ${model}`);
            
            // Format the summary into sections
            const formattedSummary = summary
              .replace(/\n+/g, '\n')
              .split(/\.|!|\?/)
              .filter(Boolean)
              .map((s: string) => s.trim())
              .join('. ')
              .replace(/\s+/g, ' ')
              .trim();

            return NextResponse.json({ summary: formattedSummary });
          }
          
          console.log(`Summary too short from model: ${model}`);
          throw new Error('Summary too short or empty');
          
        } catch (error: unknown) {
          const modelError = error as { response?: { status?: number }, message?: string };
          console.error(`Error with model ${model}, attempt ${4 - retries}:`, modelError.message);
          lastError = modelError;
          retries--;

          if (modelError.response?.status === 429) {
            console.log('Rate limit hit, waiting 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          } else if (modelError.response?.status === 503) {
            console.log('Model loading, waiting 10 seconds...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          } else if (retries > 0) {
            console.log('General error, waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          if (retries === 0 && models.indexOf(model) === models.length - 1) {
            console.error('All models and retries failed');
            break;
          }
        }
      }
    }
    
    // Handle different error cases
    if (lastError?.response) {
      const status = lastError.response.status;
      console.error(`Final error status: ${status}`);
      
      switch (status) {
        case 429:
          return NextResponse.json(
            { error: 'Service is busy. Please wait a moment and try again.' },
            { status: 429 }
          );
        case 503:
          return NextResponse.json(
            { error: 'Models are currently initializing. Please try again in a few moments.' },
            { status: 503 }
          );
        default:
          return NextResponse.json(
            { error: `Failed to generate summary (${status}). Please try again.` },
            { status }
          );
      }
    }
    
    return NextResponse.json(
      { error: 'Could not generate summary at this time. Please try again later.' },
      { status: 500 }
    );
    
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 