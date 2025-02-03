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
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              About YouTube Summarizer
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Your AI-powered companion for quick and efficient video content understanding.
            </p>
          </div>
          
          {/* Content Sections */}
          <div className="space-y-12">
            {/* Mission */}
            <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                Our Mission
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We strive to make video content more accessible and time-efficient for everyone. Our AI-powered tool helps you extract key information from YouTube videos quickly and efficiently.
              </p>
            </div>

            {/* Technology */}
            <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                Our Technology
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We leverage advanced natural language processing and machine learning algorithms to analyze video content and generate concise, accurate summaries. Our AI models are trained on millions of videos to understand context, identify key points, and extract meaningful information.
              </p>
            </div>

            {/* Features */}
            <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                Why Choose Us?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Accurate Summaries", desc: "Get reliable and precise video content summaries" },
                  { title: "Fast Processing", desc: "Quick turnaround times for your video analysis" },
                  { title: "User-Friendly", desc: "Simple and intuitive interface for all users" },
                  { title: "Multi-Language", desc: "Support for videos in various languages" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 mt-1">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center pt-8">
            <Link 
              href="/summarizer" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Try It Now
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 