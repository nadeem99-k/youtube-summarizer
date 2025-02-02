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
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{parseInt(videoData.statistics?.viewCount || '0').toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>{parseInt(videoData.statistics?.likeCount || '0').toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-gray-400">Published: {formatDate(videoData.publishedAt)}</p>
                      <p className="text-gray-400">Channel: {videoData.channelTitle}</p>
                      {videoData.duration && <p className="text-gray-400">Duration: {videoData.duration}</p>}
                      {videoData.language && (
                        <p className="text-gray-400">
                          Language: {new Intl.DisplayNames(['en'], { type: 'language' }).of(videoData.language)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-xl font-semibold mb-4">{videoData.title}</h2>
                  
                  {videoData.tags && videoData.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {videoData.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300 border border-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                    <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="whitespace-pre-line text-sm text-gray-300">{videoData.description}</p>
                    </div>
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
            <div className="bg-gray-800/50 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                AI-Generated Summary
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-4 md:p-6 border border-gray-700">
                <div className="text-gray-300 prose prose-invert max-w-none break-words">
                  {summary.split('\n').map((paragraph, index) => (
                    <p 
                      key={index} 
                      className={`mb-4 leading-relaxed whitespace-pre-wrap ${
                        index === 0 ? 'text-base md:text-lg font-medium text-purple-300' : 'text-sm md:text-base text-gray-300'
                      }`}
                    >
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => navigator.clipboard.writeText(summary)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Summary
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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