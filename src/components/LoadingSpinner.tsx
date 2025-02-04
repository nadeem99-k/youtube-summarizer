import Image from 'next/image';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4">
      <Image 
        src="/og-image.png" 
        alt="Loading" 
        width={48}
        height={48}
        className="animate-bounce opacity-80 rounded-lg object-cover"
      />
      <div className="relative w-10 h-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="w-10 h-10 rounded-full border-4 border-purple-200 opacity-20"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full animate-spin">
          <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-purple-500"></div>
        </div>
      </div>
    </div>
  );
} 