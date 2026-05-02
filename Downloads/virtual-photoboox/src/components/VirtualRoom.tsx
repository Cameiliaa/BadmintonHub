import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CameraView } from './CameraView';
import { LAYOUTS, Room } from '@/types';
import { Users, Link as LinkIcon, Play, AlertCircle, Sparkles, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

interface VirtualRoomProps {
  roomId: string;
  onSessionComplete: (userId: string, photos: string[], layoutId?: string) => void;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function VirtualRoom({ roomId, onSessionComplete }: VirtualRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isJoined, setIsJoined] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoom({ id: snapshot.id, ...snapshot.data() } as Room);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
    });

    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    } else {
      setUserId('guest-' + Math.random().toString(36).substring(2, 11));
    }

    return () => unsubscribe();
  }, [roomId]);

  const joinRoom = async () => {
    if (!userName.trim() || !room) return;
    
    const roomRef = doc(db, 'rooms', roomId);
    const updatedParticipants = [...new Set([...room.participants, userId])];
    
    try {
      await updateDoc(roomRef, {
        participants: updatedParticipants
      });
      setIsJoined(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  };

  const startCountdown = async () => {
    if (!room) return;
    const roomRef = doc(db, 'rooms', roomId);
    try {
      await updateDoc(roomRef, {
        status: 'countdown',
        countdownStart: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  };

  const handleCaptureComplete = async (photos: string[]) => {
    if (!room) return;
    
    const roomRef = doc(db, 'rooms', roomId);
    try {
      await updateDoc(roomRef, {
        [`capturedPhotos.${userId}`]: photos
      });
      onSessionComplete(userId, photos, room.currentLayout);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  };

  if (!room) {
    return (
      <div className="h-screen w-full flex items-center justify-center atmosphere-bg">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-medium tracking-widest uppercase text-xs">Accessing Room Assets...</p>
        </motion.div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center atmosphere-bg p-6">
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="w-full max-w-md glass-panel overflow-hidden relative rounded-[2.5rem]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-secondary" />
            <div className="p-10 text-center">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-primary/10 mb-8 border border-primary/20">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase italic neon-text leading-tight">Photoboox</h1>
              <p className="text-zinc-500 text-xs mb-10 font-black uppercase tracking-[0.2em]">Join the Star Session</p>

              <div className="space-y-4">
                <Input
                  placeholder="Enter your star name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-center text-lg font-bold"
                />
                <Button 
                  onClick={joinRoom} 
                  disabled={!userName.trim()}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 group transition-all"
                >
                  Join Party ✨
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-center gap-8 text-zinc-500">
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Active</span>
                    <span className="text-sm font-black text-white">{room.participants.length}</span>
                 </div>
                 <div className="h-8 w-[1px] bg-white/10" />
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Room ID</span>
                    <span className="text-sm font-black text-white">{roomId.slice(0, 6)}</span>
                 </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isHost = room.hostId === userId;
  const layout = LAYOUTS.find(l => l.id === room.currentLayout) || LAYOUTS[0];

  return (
    <div className="min-h-screen atmosphere-bg text-white font-sans selection:bg-primary selection:text-white">
      {/* Immersive Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-20 glass-panel border-x-0 border-t-0 flex items-center justify-between px-8 z-50 sticky top-0"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-black italic uppercase tracking-tighter text-xl leading-none">Photoboox</h2>
            <div className="flex items-center gap-2 mt-1">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] uppercase font-black tracking-[0.1em] text-emerald-500">{room.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center -space-x-3">
            {room.participants.map((pId) => (
              <div 
                key={pId} 
                className={cn(
                  "h-10 w-10 rounded-full border-4 border-[#050505] flex items-center justify-center text-[10px] font-black uppercase transition-transform hover:scale-110",
                  pId === userId ? "bg-primary z-10" : "bg-zinc-800"
                )}
              >
                {pId.charAt(0)}
              </div>
            ))}
          </div>
          <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest">
            <LogOut className="h-4 w-4 mr-2" />
            Leave
          </Button>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto p-10 relative">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Stage */}
            <div className="lg:col-span-8 space-y-10">
               <motion.div 
                 initial={{ scale: 0.98, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="rounded-[3rem] overflow-hidden glass-panel relative border-2 border-white/5 shadow-2xl p-1"
               >
                  <div className="absolute top-6 left-6 z-20 flex gap-2">
                     <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Cam</span>
                     {room.status === 'countdown' && (
                        <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">Snapping Soon...</span>
                     )}
                  </div>

                  <CameraView 
                    layout={layout} 
                    onCaptureComplete={handleCaptureComplete}
                    autoStart={room.status === 'countdown'}
                  />
               </motion.div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="glass-panel p-8 border-white/5 group hover:bg-white/10 transition-all duration-500">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Host Controls</h3>
                     {isHost && room.status === 'waiting' ? (
                        <div className="space-y-4">
                           <p className="text-zinc-400 text-sm font-medium">Ready to trigger the photobooth? Everyone currently in the room will enter capture mode simultaneously.</p>
                           <Button onClick={startCountdown} className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest text-xs group">
                             <Play className="h-4 w-4 mr-2 fill-current group-hover:scale-110 transition-transform" />
                             Trigger Boom!
                           </Button>
                        </div>
                     ) : (
                        <div className="py-4 flex flex-col items-center text-center">
                           <AlertCircle className="h-8 w-8 text-zinc-700 mb-4" />
                           <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Wait for Host to Start</p>
                        </div>
                     )}
                  </Card>

                  <Card className="glass-panel p-8 border-white/5 flex flex-col items-center justify-center text-center">
                     <Users className="h-8 w-8 text-primary mb-4" />
                     <h4 className="font-black uppercase tracking-tighter text-xl leading-none">Share Room</h4>
                     <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mt-2 mb-6">Let friends scan & join</p>
                     
                     <div className="bg-white p-4 rounded-[2rem] shadow-2xl relative group cursor-pointer">
                        <QRCodeSVG value={window.location.href} size={140} />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center">
                           <LinkIcon className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                     </div>
                  </Card>
               </div>
            </div>

            {/* Sidebar: Participants & Social */}
            <div className="lg:col-span-4 space-y-10">
               <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-3">
                     <div className="h-[1px] flex-1 bg-white/10" />
                     Participants
                     <div className="h-[1px] flex-1 bg-white/10" />
                  </h3>
                  
                  <div className="space-y-4">
                    {room.participants.map((pId) => (
                      <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={pId} 
                        className="glass-panel p-5 flex items-center justify-between group transition-all hover:bg-white/10 rounded-3xl"
                      >
                         <div className="flex items-center gap-4">
                           <div className={cn(
                              "h-3 w-3 rounded-full", 
                              pId === userId ? "bg-[#ff00e5] shadow-[0_0_15px_#ff00e5]" : "bg-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.5)]"
                           )} />
                           <div>
                              <span className="text-sm font-black italic uppercase tracking-tight block">
                                 {pId === userId ? "You (Owner)" : `Guest-${pId.slice(0, 4)}`}
                              </span>
                              {pId === userId && <span className="text-[8px] font-black uppercase tracking-widest text-[#ff00e5]">Studio Host</span>}
                           </div>
                         </div>
                         {room.capturedPhotos?.[pId] ? (
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Ready</span>
                               <div className="h-10 w-7 bg-zinc-800 rounded-md border border-white/10 overflow-hidden shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                  <img src={Array.isArray(room.capturedPhotos[pId]) ? room.capturedPhotos[pId][0] : room.capturedPhotos[pId]} alt="cap" className="w-full h-full object-cover" />
                               </div>
                            </div>
                         ) : (
                            <div className="flex items-center gap-2 opacity-30">
                               <div className="h-1 w-1 bg-zinc-500 rounded-full animate-ping" />
                               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 tracking-tighter">Waiting</span>
                            </div>
                         )}
                      </motion.div>
                    ))}
                  </div>
               </div>

               <Card className="glass-panel p-8 bg-primary/5 border-primary/20 rounded-[2rem] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 blur-[60px] rounded-full" />
                  <Sparkles className="h-6 w-6 text-primary mb-4" />
                  <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">College Project Mode</h4>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                    This session is being recorded as a premium digital asset. Your photos will be processed with specialized filters after capture.
                  </p>
               </Card>
            </div>
         </div>
      </main>
    </div>
  );
}
