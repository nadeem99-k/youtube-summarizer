import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            YouTube Summarizer
          </Link>
          <nav className="space-x-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/summarizer" className="text-gray-400 hover:text-white transition-colors">
              Summarizer
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">About YouTube Summarizer</h1>
          
          <div className="prose prose-invert">
            <p className="text-gray-300 mb-6">
              YouTube Summarizer is an AI-powered tool designed to help you extract key information from YouTube videos quickly and efficiently. Our mission is to make video content more accessible and time-efficient for everyone.
            </p>

            <h2 className="text-2xl font-bold mb-4">Our Technology</h2>
            <p className="text-gray-300 mb-6">
              We use advanced natural language processing and machine learning algorithms to analyze video content and generate concise, accurate summaries. Our AI model is trained on millions of videos to understand context, identify key points, and extract meaningful information.
            </p>

            <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>Accurate and reliable summaries</li>
              <li>Fast processing times</li>
              <li>User-friendly interface</li>
              <li>Support for multiple languages</li>
              <li>Regular updates and improvements</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 