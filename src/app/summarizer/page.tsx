'use client';
import { useState } from 'react';
import { extractVideoId, fetchVideoData } from '@/utils/youtube';
import Image from 'next/image';
import { generateSummary } from '@/utils/summarize';

interface VideoData {
  title: string;
  description: string;
  channelTitle: string;
  thumbnails: {
    medium: { url: string };
  };
  publishedAt: string;
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  duration?: string;
  tags?: string[];
  transcript?: string;
  language?: string;
}

export default function Summarizer() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please check the URL and try again.');
      }

      const data = await fetchVideoData(videoId);
      setVideoData(data);

      const textToSummarize = data.description || 'No description available for this video.';
      const summary = await generateSummary(textToSummarize);
      
      if (!summary) {
        throw new Error('Failed to generate summary. Please try again.');
      }

      setSummary(summary);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Summarize Your YouTube Video
          </h1>
          
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="flex-1 px-6 py-4 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none text-white placeholder-gray-400"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Summarize'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
          </form>

          {/* Video Information */}
          {videoData && (
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <Image
                    src={videoData.thumbnails.medium.url}
                    alt={videoData.title}
                    width={320}
                    height={180}
                    className="rounded-lg w-full"
                  />
                  <div className="mt-4 text-gray-400 space-y-2">
                    <p>Published: {formatDate(videoData.publishedAt)}</p>
                    <p>Channel: {videoData.channelTitle}</p>
                    {videoData.language && (
                      <p>Language: {new Intl.DisplayNames(['en'], { type: 'language' }).of(videoData.language)}</p>
                    )}
                    {videoData.duration && <p>Duration: {videoData.duration}</p>}
                    {videoData.statistics && (
                      <>
                        <p>Views: {parseInt(videoData.statistics.viewCount).toLocaleString()}</p>
                        <p>Likes: {parseInt(videoData.statistics.likeCount).toLocaleString()}</p>
                        <p>Comments: {parseInt(videoData.statistics.commentCount).toLocaleString()}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-xl font-semibold mb-2">{videoData.title}</h2>
                  
                  {videoData.tags && videoData.tags.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {videoData.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-gray-300 prose prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mt-4 mb-2">Description</h3>
                    <p className="whitespace-pre-line">{videoData.description}</p>
                    
                    {videoData.transcript && (
                      <>
                        <h3 className="text-lg font-semibold mt-6 mb-2">Transcript</h3>
                        <div className="max-h-60 overflow-y-auto bg-gray-900/50 p-4 rounded-lg">
                          <p className="whitespace-pre-line">{videoData.transcript}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!videoData && (
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">How to use:</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Copy the URL of any YouTube video</li>
                <li>Paste it in the input field above</li>
                <li>Click &ldquo;Summarize&rdquo; and wait for the magic</li>
              </ol>
            </div>
          )}

          {/* Summary Result */}
          {summary && (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                AI-Generated Summary
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                <div className="text-gray-300 prose prose-invert max-w-none">
                  {/* Split summary into paragraphs */}
                  {summary.split('\n').map((paragraph, index) => (
                    <p 
                      key={index} 
                      className={`mb-4 leading-relaxed ${
                        index === 0 ? 'text-lg font-medium text-purple-300' : 'text-gray-300'
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Share and Copy buttons */}
                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => navigator.clipboard.writeText(summary)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                      />
                    </svg>
                    Copy Summary
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" 
                      />
                    </svg>
                    Print
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 