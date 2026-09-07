import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function DrapeVideo({ videoUrl, posterUrl }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!videoUrl) return null;

  return (
    <div className="relative rounded-lg overflow-hidden border border-gold/15 bg-teal-dark shadow-2xl group max-w-lg mx-auto aspect-[9/16]">
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Video Shading overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Title Tag */}
      <div className="absolute top-4 left-4 bg-teal-dark/80 backdrop-blur-sm border border-gold/30 px-3 py-1 rounded">
        <span className="text-[10px] text-gold uppercase tracking-widest font-bold">Drape & Fall Showcase</span>
      </div>

      {/* Video controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={toggleMute}
          className="p-2 bg-teal-dark/80 backdrop-blur-sm text-gold hover:text-white rounded border border-gold/20 hover:border-gold/50 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          onClick={togglePlay}
          className="p-2 bg-teal-dark/80 backdrop-blur-sm text-gold hover:text-white rounded border border-gold/20 hover:border-gold/50 transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
