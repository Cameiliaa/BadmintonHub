import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LayoutSelector } from '@/components/LayoutSelector';
import { CameraView } from '@/components/CameraView';
import { PhotoEditor } from '@/components/PhotoEditor';
import { VirtualRoom } from '@/components/VirtualRoom';
import { AdminDashboard } from '@/components/AdminDashboard';
import { LAYOUTS, LayoutConfig, Room } from '@/types';
import { Camera, Users, Sparkles, Layout as LayoutIcon, ChevronLeft, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

type AppState = 'home' | 'layout-select' | 'camera' | 'editor' | 'room' | 'admin';

const googleProvider = new GoogleAuthProvider();

export default function App() {
  const [state, setState] = useState<AppState>('home');
  const [selectedLayout, setSelectedLayout] = useState<LayoutConfig>(LAYOUTS[3]); // Classic 4 default
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    // Check if room ID is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
      setCurrentRoomId(roomId);
      setState('room');
    }

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the login popup.");
      } else {
        console.error("Login failed:", error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const createRoom = async () => {
    if (!user) {
      await handleSignIn();
      return;
    }
    
    try {
      const roomRef = await addDoc(collection(db, 'rooms'), {
        name: `${user.displayName || 'Guest'}'s Party`,
        hostId: user.uid,
        status: 'waiting',
        currentLayout: selectedLayout.id,
        participants: [user.uid],
        createdAt: serverTimestamp(),
        capturedPhotos: {}
      });

      setCurrentRoomId(roomRef.id);
      // Update URL without refreshing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', roomRef.id);
      window.history.pushState({}, '', newUrl);
      
      setState('room');
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const navigateTo = (newState: AppState) => {
    if (newState === 'home') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('room');
      window.history.pushState({}, '', newUrl);
      setCurrentRoomId('');
    }
    setState(newState);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user && (state === 'room' || state === 'camera')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fbc2eb] to-[#a6c1ee] flex items-center justify-center p-6 text-zinc-900">
        <div className="glass p-12 rounded-[3rem] text-center space-y-8 max-w-md border-2 border-white/60 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#ff00e5] to-[#00d2ff] rounded-3xl flex items-center justify-center mx-auto shadow-xl">
             <Camera className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black italic tracking-tighter">Identity Check!</h2>
            <p className="text-zinc-600 font-medium leading-relaxed">Sign in with your Google account to join the photobooth and save your memories.</p>
          </div>
          <Button onClick={handleSignIn} size="lg" className="w-full h-14 text-xl font-black italic bg-white text-zinc-900 border-2 border-zinc-100 rounded-2xl shadow-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-3">
             <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
             Continue with Google
          </Button>
          <Button variant="ghost" onClick={() => navigateTo('home')} className="text-zinc-500 font-bold italic">Maybe Later</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen atmosphere-bg text-white font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="mx-6 mt-6 px-8 py-4 flex items-center justify-between glass-panel rounded-[2.5rem] sticky top-6 z-50 shadow-2xl border border-white/10">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('home')}>
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Photoboox</h1>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Premium Capture</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 pr-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden sm:block">{user.displayName || 'Guest'}</span>
              <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border-2 border-white/10 shadow-sm" alt="Profile" />
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleSignIn} className="font-black text-[10px] uppercase tracking-widest text-primary hover:bg-white/5 rounded-xl">Sign In</Button>
          )}

          {state !== 'home' && (
            <Button variant="ghost" size="sm" onClick={() => navigateTo('home')} className="hidden sm:flex items-center text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase text-[10px] tracking-widest">
              <ChevronLeft className="mr-1 h-3 w-3" /> Back
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait">
          {state === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-16 py-12"
            >
              <div className="space-y-6 max-w-4xl mx-auto">
                <motion.h1 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white uppercase italic"
                >
                  Snap. Style. <br />
                  <span className="gradient-text neon-text">Share.</span>
                </motion.h1>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs max-w-2xl mx-auto">Premium Virtual Photobooth Experience</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="glass-panel p-12 rounded-[3.5rem] group cursor-pointer border border-white/5 shadow-2xl relative overflow-hidden"
                  onClick={() => navigateTo('layout-select')}
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent opacity-50" />
                  <div className="h-20 w-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-8 border border-primary/20 group-hover:rotate-6 transition-transform">
                    <Camera className="h-10 w-10" />
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Studio Solo</h3>
                  <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8">Personal session with pro customizer. Capture your best angles in private.</p>
                  <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.2em]">
                    Start Session <ChevronLeft className="h-3 w-3 rotate-180" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -10 }}
                  className="glass-panel p-12 rounded-[3.5rem] group cursor-pointer border border-white/5 shadow-2xl relative overflow-hidden"
                  onClick={createRoom}
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-secondary to-transparent opacity-50" />
                  <div className="h-20 w-20 bg-secondary/10 text-secondary rounded-3xl flex items-center justify-center mb-8 border border-secondary/20 group-hover:-rotate-6 transition-transform">
                    <Users className="h-10 w-10" />
                  </div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Party Space</h3>
                  <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8">Synced captures with the squad. Invite everyone via code or link.</p>
                  <div className="flex items-center gap-2 text-secondary font-black uppercase text-[10px] tracking-[0.2em]">
                    Create Room <ChevronLeft className="h-3 w-3 rotate-180" />
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-12 pt-16">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#ff00e5]" />
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-600">Fabric.js Engine</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#00d2ff]" />
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-600">Real-time Cloud Sync</span>
                </div>
              </div>
            </motion.div>
          )}


          {state === 'layout-select' && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight">Choose your style</h2>
                <p className="text-zinc-500">Select the grid layout for your photobooth session</p>
              </div>
              
              <LayoutSelector 
                selectedId={selectedLayout.id} 
                onSelect={setSelectedLayout} 
              />

              <div className="flex justify-center pt-8">
                <Button size="lg" onClick={() => navigateTo('camera')} className="h-14 px-12 text-lg rounded-full shadow-xl shadow-primary/20">
                  Continue to Camera <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {state === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                 <h2 className="text-2xl font-bold">Snap your photos</h2>
                 <Button variant="outline" size="sm" onClick={() => navigateTo('layout-select')}>Change Layout</Button>
              </div>
              <CameraView 
                layout={selectedLayout} 
                onCaptureComplete={(photos) => {
                  setCapturedPhotos(photos);
                  navigateTo('editor');
                }} 
              />
            </motion.div>
          )}

          {state === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PhotoEditor 
                photos={capturedPhotos} 
                layout={selectedLayout}
                onSave={() => {
                  // After save, could show success or go home
                  // For now, staying in editor so they can download
                }}
                onCancel={() => navigateTo('camera')}
              />
            </motion.div>
          )}

          {state === 'room' && (
            <motion.div
              key="room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VirtualRoom 
                roomId={currentRoomId} 
                onSessionComplete={(uid, photos, roomLayout) => {
                  setCapturedPhotos(photos);
                  if (roomLayout) {
                    const layout = LAYOUTS.find(l => l.id === roomLayout);
                    if (layout) setSelectedLayout(layout);
                  }
                  navigateTo('editor');
                }}
              />
            </motion.div>
          )}

          {state === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-[0.03]">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-pink-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-violet-500 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}
