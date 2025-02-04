export default function Clips() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-20">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          Video Clips
          <span className="block text-2xl md:text-3xl mt-2">Coming Soon</span>
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            We&apos;re working on an exciting new feature that will let you extract and summarize specific clips from YouTube videos. Stay tuned!
          </p>
          
          <div className="inline-flex items-center justify-center gap-2 text-purple-400">
            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Feature in Development</span>
          </div>
        </div>
      </div>
    </div>
  );
} 