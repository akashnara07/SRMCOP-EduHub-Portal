import React, { useState, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Maximize2, Send, Check, Clock, ListCollapse } from 'lucide-react';
import GlassCard from '../GlassCard';
import { Resource } from '../../types';

interface VideoPlayerProps {
  resource: Resource;
  onBack: () => void;
}

export default function VideoPlayer({
  resource,
  onBack,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(12.5); // simulated progress
  const [duration, setDuration] = useState(2520); // 42 mins in seconds
  const [notes, setNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<Array<{ id: string; time: string; text: string }>>([
    { id: '1', time: '02:15', text: 'Epithelial tissue lacks direct blood supply (avascular) - relies on underlying connective tissue for nutrients.' },
    { id: '2', time: '08:40', text: 'Stratified squamous cells form the main barrier of the epidermis, showing high levels of keratinization.' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (!isYouTube) return null;

    let videoId = '';
    if (url.includes('embed/')) {
      const parts = url.split('embed/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    } else if (url.includes('v=')) {
      const parts = url.split('v=');
      if (parts[1]) {
        videoId = parts[1].split('&')[0];
      }
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split('?')[0];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : url;
  };

  const ytUrl = getYouTubeEmbedUrl(resource.url || '');

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying); // fallback simulation
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    const formatSimulatedTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const newNote = {
      id: Date.now().toString(),
      time: formatSimulatedTime(currentTime),
      text: notes.trim()
    };

    setSavedNotes([newNote, ...savedNotes]);
    setNotes('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header and Back navigation */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/60 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
            Lecture Video
          </span>
          <h1 className="font-display font-extrabold text-xl text-gray-900 tracking-tight mt-1">
            {resource.title}
          </h1>
        </div>
      </div>

      {/* Main Grid: Video Player + Notes Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2-spans): Video Stage */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative aspect-video rounded-[24px] overflow-hidden bg-black shadow-2xl border border-white/20 group">
            {ytUrl ? (
              <iframe
                src={ytUrl}
                title={resource.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <>
                {/* Native video or mock illustration overlay */}
                <video
                  ref={videoRef}
                  src={resource.url || "https://www.w3schools.com/html/mov_bbb.mp4"}
                  className="w-full h-full object-cover"
                  onClick={togglePlay}
                />

                {/* Glowing Apple-style Frosted Overlay Controller */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3 transition-opacity duration-300 opacity-90 group-hover:opacity-100 z-30">
                  {/* Progress Slider Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/80 font-mono font-bold">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8B1E3F] to-[#CD4368] rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg border border-maroon-800 cursor-pointer"
                        style={{ left: `calc(${(currentTime / duration) * 100}% - 7px)` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/80 font-mono font-bold">{formatTime(duration)}</span>
                  </div>

                  {/* Controls layout */}
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                      <button onClick={togglePlay} className="hover:scale-110 transition-transform" type="button">
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                      </button>
                      <button onClick={() => setCurrentTime(0)} className="hover:scale-110 transition-transform" type="button">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <div className="w-[1px] h-4 bg-white/20" />
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-white/80" />
                        <div className="w-16 h-1 bg-white/30 rounded-full">
                          <div className="w-12 h-full bg-white rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-white/80">
                      <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full">1.0x Speed</span>
                      <Maximize2 className="w-4.5 h-4.5 hover:text-white cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Play overlay button if not playing */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                    <div className="w-16 h-16 rounded-full bg-[#8B1E3F] border border-white/20 text-white flex items-center justify-center shadow-2xl shadow-maroon-900/40 transform hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Description & metadata */}
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-base text-gray-900 mb-2">Lecture Abstract & Objectives</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {resource.description} Learn classification criteria of basic tissues, structural definitions of squamous, columnar, and cuboidal cells, with clinical correlations to drug permeability profiles.
            </p>
            <div className="flex gap-4 items-center mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
              <span>FACULTY: Dr. V. Chitra</span>
              <span>•</span>
              <span>ESTIMATED DURATION: 42 Mins</span>
              <span>•</span>
              <span>ACADEMIC CODE: BP101T-L3</span>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Interactive Notes taking pad */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col justify-between h-[450px]">
            <div className="flex flex-col gap-4 overflow-hidden h-full">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-display font-bold text-sm text-gray-900">Lecture Annotations</h3>
                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full uppercase">
                  Timed Notes
                </span>
              </div>

              {/* Saved Notes Scroll Area */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
                {savedNotes.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-12">No timed notes created yet. Take down notes as you watch.</p>
                ) : (
                  savedNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-white/40 border border-white/20 rounded-2xl flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#8B1E3F]">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Timestamp: {note.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Note input form */}
            <form onSubmit={handleAddNote} className="border-t border-gray-100 pt-4 mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Append a notes entry at current time..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 bg-gray-100/60 hover:bg-gray-100/80 border-none text-xs text-gray-800 placeholder-gray-400 p-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#8B1E3F]"
              />
              <button 
                type="submit" 
                className="w-10 h-10 rounded-full bg-[#8B1E3F] hover:bg-[#b32a4e] text-white flex items-center justify-center shrink-0 shadow-md shadow-maroon-900/15"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
