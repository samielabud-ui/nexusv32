import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  RotateCcw
} from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface NexusVideoPlayerProps {
  videoId: string;
  title: string;
  onComplete?: () => void;
}

const NexusVideoPlayer: React.FC<NexusVideoPlayerProps> = ({ videoId, title, onComplete }) => {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadYoutubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          initPlayer();
        };
      } else {
        initPlayer();
      }
    };

    loadYoutubeAPI();

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  const initPlayer = () => {
    if (player) {
      try { player.destroy(); } catch(e) {}
    }

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          setPlayer(event.target);
          setDuration(event.target.getDuration());
          setIsReady(true);
          event.target.playVideo();
        },
        onStateChange: (event: any) => {
          // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
          setIsPlaying(event.data === 1);
          if (event.data === 0 && onComplete) {
            onComplete();
          }
        }
      }
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && player) {
      interval = setInterval(() => {
        try {
          setCurrentTime(player.getCurrentTime());
        } catch(e) {}
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    handleMouseMove();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) return;
    const time = parseFloat(e.target.value);
    player.seekTo(time, true);
    setCurrentTime(time);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!player) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) return;
    const val = parseInt(e.target.value);
    player.setVolume(val);
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
  };

  const changePlaybackRate = (rate: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!player) return;
    player.setPlaybackRate(rate);
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden group select-none"
      style={{ cursor: showControls ? 'default' : 'none' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      {/* The actual YouTube Player */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[100.5%] h-[100.5%] scale-105">
           <div ref={playerRef} className="w-full h-full"></div>
        </div>
      </div>

      {/* Custom Controls Overlay */}
      <div className={`absolute inset-0 z-30 flex flex-col justify-end transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        {/* Gradient Shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none"></div>

        {/* Top Bar (Title) */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between pointer-events-none">
          <h3 className="text-white font-bold text-sm md:text-lg drop-shadow-lg truncate pr-10">{title}</h3>
        </div>

        {/* Center Play Button (Large) */}
        {!isPlaying && isReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-nexus-blue/90 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-300">
              <Play size={32} fill="white" className="text-white ml-1 md:ml-2 md:w-10 md:h-10" />
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="p-3 md:p-6 space-y-2 md:space-y-4 relative z-40" onClick={(e) => e.stopPropagation()}>
          {/* Progress Bar */}
          <div className="relative group/progress h-4 flex items-center">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-nexus-blue hover:h-1.5 transition-all z-10"
            />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-nexus-blue rounded-full pointer-events-none group-hover/progress:h-1.5 transition-all"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6">
              <button onClick={togglePlay} className="text-white hover:text-nexus-blue transition-colors">
                {isPlaying ? <Pause size={20} fill="currentColor" className="md:w-6 md:h-6" /> : <Play size={20} fill="currentColor" className="md:w-6 md:h-6" />}
              </button>
              
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-nexus-blue transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={18} className="md:w-5 md:h-5" /> : <Volume2 size={18} className="md:w-5 md:h-5" />}
                </button>
                <div className="w-0 group-hover/volume:w-16 md:group-hover/volume:w-24 h-1 bg-white/20 rounded-full overflow-hidden transition-all flex items-center">
                   <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={isMuted ? 0 : volume} 
                    onChange={handleVolumeChange}
                    className="w-full h-full appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>

              <span className="text-white/90 text-[10px] md:text-xs font-mono tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} 
                  className={`text-white hover:text-nexus-blue transition-colors ${showSettings ? 'text-nexus-blue' : ''}`}
                >
                  <Settings size={18} className="md:w-5 md:h-5" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-4 bg-nexus-card border border-nexus-border rounded-xl p-2 min-w-[140px] shadow-2xl animate-in slide-in-from-bottom-2 z-50">
                    <p className="text-[10px] font-bold text-nexus-text-sec uppercase tracking-widest px-3 py-2 border-b border-nexus-border mb-1">Velocidade</p>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button 
                        key={rate} 
                        onClick={(e) => changePlaybackRate(rate, e)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-colors flex items-center justify-between ${playbackRate === rate ? 'bg-nexus-blue text-white' : 'text-nexus-text-main hover:bg-nexus-hover'}`}
                      >
                        <span>{rate === 1 ? 'Normal' : rate + 'x'}</span>
                        {playbackRate === rate && <div className="w-1 h-1 bg-white rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="text-white hover:text-nexus-blue transition-colors">
                <Maximize size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 bg-nexus-bg flex flex-col items-center justify-center z-50">
          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-nexus-blue/20 border-t-nexus-blue rounded-full animate-spin mb-4"></div>
          <p className="text-nexus-text-sec text-[10px] font-bold uppercase tracking-widest animate-pulse">Iniciando Player Nexus</p>
        </div>
      )}
    </div>
  );
};

export default NexusVideoPlayer;
