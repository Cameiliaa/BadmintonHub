import { useState, useEffect, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutConfig } from '@/types';
import { cn } from '@/lib/utils';

interface CameraViewProps {
  layout: LayoutConfig;
  onCaptureComplete: (photos: string[]) => void;
  autoStart?: boolean;
}

export function CameraView({ layout, onCaptureComplete, autoStart = false }: CameraViewProps) {
  const { videoRef, startCamera, capturePhoto, error, stream } = useCamera();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const totalPhotosNeeded = layout.cols * layout.rows;

  const startSession = useCallback(async () => {
    setCapturedPhotos([]);
    await startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (autoStart) {
      startSession();
    }
  }, [autoStart, startSession]);

  const triggerCaptureSequence = async () => {
    if (isCountingDown || !stream) return;
    
    setIsCountingDown(true);
    const photos: string[] = [];
    
    for (let i = 0; i < totalPhotosNeeded; i++) {
      // Countdown for each photo
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        // Subtle beep or vibration could go here in a real app
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setCountdown(0);
      
      // TRIGGER FLASH
      setIsFlashActive(true);
      const photo = capturePhoto();
      
      if (photo) {
        photos.push(photo);
        setCapturedPhotos(prev => [...prev, photo]);
      }
      
      // Clear flash after a short burst
      setTimeout(() => setIsFlashActive(false), 150);
      
      // Small pause between photos if there are more
      if (i < totalPhotosNeeded - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    setIsCountingDown(false);
    // Slight delay before transitioning to editor for better UX
    setTimeout(() => onCaptureComplete(photos), 1000);
  };

  return (
    <div className="relative w-full overflow-hidden bg-black aspect-video group selection:none">
      {/* ERROR OVERLAY */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 text-white p-10 z-50 animate-in fade-in duration-500">
          <div className="max-w-xs text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-6" />
            <p className="text-lg font-black uppercase tracking-tight mb-2 text-white">Camera Access Denied</p>
            <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-8">Please enable camera permissions in your browser settings to continue the experience.</p>
            <Button variant="outline" onClick={startCamera} className="w-full border-white/20 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px]">Try Resetting</Button>
          </div>
        </div>
      )}

      {/* FEED */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1] brightness-110 contrast-110"
      />

      {/* OVERRAYS: SCANLINES & VIGNETTE */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* COUNTDOWN UI */}
      <AnimatePresence>
        {isCountingDown && countdown > 0 && (
          <motion.div
            key={countdown}
            initial={{ scale: 3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.1, opacity: 0, rotate: 10 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="relative">
               <span className="text-[14rem] font-black text-white drop-shadow-[0_0_50px_#ff00e5] italic select-none">
                 {countdown}
               </span>
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 0.8 }}
                 className="h-2 bg-primary absolute -bottom-4 left-0 rounded-full shadow-[0_0_20px_#ff00e5]" 
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLASH LAYER */}
      <AnimatePresence>
        {isFlashActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
            className="absolute inset-0 bg-white pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      {/* ROLL PREVIEW ROLL */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
         {Array.from({ length: totalPhotosNeeded }).map((_, idx) => (
            <div 
               key={idx} 
               className={cn(
                  "h-14 w-10 border-2 rounded-lg overflow-hidden bg-black/40 backdrop-blur transition-all duration-500",
                  capturedPhotos[idx] ? "border-primary scale-110 shadow-[0_0_15px_rgba(255,0,229,0.3)]" : "border-white/10 opacity-40"
               )}
            >
               {capturedPhotos[idx] && <img src={capturedPhotos[idx]} className="w-full h-full object-cover scale-x-[-1]" />}
            </div>
         ))}
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-4 glass-panel rounded-[2rem] border-white/20 shadow-3xl z-30">
        {!stream ? (
          <Button onClick={startSession} className="h-14 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-xs group">
            <Camera className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            Enable Studio Assets
          </Button>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 italic">Layout</span>
              <span className="text-sm font-black uppercase tracking-tighter">{layout.name}</span>
            </div>
            
            <div className="w-[1px] h-10 bg-white/10 mx-2" />
            
            <Button 
              disabled={isCountingDown}
              onClick={triggerCaptureSequence}
              className={cn(
                 "h-20 w-20 rounded-full p-1.5 transition-all duration-500 shadow-2xl relative group",
                 isCountingDown ? "bg-zinc-800 scale-95" : "bg-white hover:scale-110"
              )}
            >
               <div className={cn(
                  "h-full w-full rounded-full border-4 border-white flex items-center justify-center transition-colors duration-500",
                  isCountingDown ? "bg-zinc-700" : "bg-gradient-to-tr from-[#ff00e5] to-[#00d2ff]"
               )}>
                  {isCountingDown ? (
                     <RefreshCw className="h-8 w-8 text-white animate-spin" />
                  ) : (
                     <Camera className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                  )}
               </div>
               
               {/* Pulse effect when ready */}
               {!isCountingDown && (
                  <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping pointer-events-none" />
               )}
            </Button>
            
            <div className="w-[1px] h-10 bg-white/10 mx-2" />
            
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 italic">Status</span>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                 <span className="text-sm font-black uppercase tracking-tighter">Ready</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* SHUTTER OVERLAY (BLACK) */}
      <AnimatePresence>
         {isCountingDown && countdown === 0 && !isFlashActive && (
            <motion.div 
               initial={{ scaleY: 0 }}
               animate={{ scaleY: [0, 1, 0] }}
               transition={{ duration: 0.15 }}
               className="absolute inset-0 bg-black pointer-events-none z-20 origin-top"
            />
         )}
      </AnimatePresence>
    </div>
  );
}
