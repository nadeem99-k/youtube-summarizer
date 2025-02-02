import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Transform Video Content
            <br />
            Into Quick Insights
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Save hours of your time by getting AI-powered summaries of YouTube videos. Perfect for research, learning, and content analysis.
          </p>
          
          <Link 
            href="/summarizer" 
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block text-lg"
          >
            Get Started
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { number: "1M+", label: "Videos Summarized" },
            { number: "500K+", label: "Happy Users" },
            { number: "100%", label: "Time Saved" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: "Quick Summaries",
              description: "Get concise summaries of long videos in seconds",
              icon: "⚡",
            },
            {
              title: "Key Points",
              description: "Extract main ideas and important timestamps",
              icon: "🎯",
            },
            {
              title: "Save Time",
              description: "Understand video content without watching the full length",
              icon: "⏰",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-12 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Summarizing?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students, researchers, and professionals who are already saving time with our video summarizer.
          </p>
          <Link 
            href="/summarizer" 
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block"
          >
            Try It Now &ndash; It&apos;s Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2024 YouTube Summarizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
