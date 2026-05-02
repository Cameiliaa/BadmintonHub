import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, ImageIcon, Settings, Upload, Trash2, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12 atmosphere-bg min-h-screen text-white selection:bg-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Studio <span className="gradient-text neon-text">Terminal</span></h1>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">System Control v2.4</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="glass-panel rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest px-6 hover:bg-white/10">Terminate</Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-20 glass-panel rounded-[2.5rem] p-2 border border-white/10 shadow-3xl">
          <TabsTrigger value="templates" className="rounded-[2rem] data-[state=active]:bg-primary data-[state=active]:text-white font-black italic uppercase tracking-widest text-[10px] transition-all">
            <LayoutGrid className="mr-2 h-4 w-4" /> Blueprints
          </TabsTrigger>
          <TabsTrigger value="stickers" className="rounded-[2rem] data-[state=active]:bg-primary data-[state=active]:text-white font-black italic uppercase tracking-widest text-[10px] transition-all">
            <ImageIcon className="mr-2 h-4 w-4" /> Artifacts
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-[2rem] data-[state=active]:bg-primary data-[state=active]:text-white font-black italic uppercase tracking-widest text-[10px] transition-all">
            <Settings className="mr-2 h-4 w-4" /> Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-16 space-y-10">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-400">Layout Blueprints</h2>
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-2xl h-14 px-8 font-black uppercase italic tracking-tighter">
              <Plus className="mr-2 h-5 w-5" /> Push Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={i} 
                className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl"
              >
                <div className="aspect-[3/4] bg-zinc-950/50 relative">
                   <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                      <ImageIcon className="h-16 w-16 opacity-30" />
                   </div>
                   <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-8">
                     <Button size="sm" className="w-full h-12 bg-white text-black hover:bg-zinc-100 rounded-2xl font-black uppercase tracking-widest text-[10px]">Modify</Button>
                     <Button size="sm" variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 rounded-2xl font-black uppercase tracking-widest text-[10px]">Purge</Button>
                   </div>
                </div>
                <div className="p-8 bg-white/[0.02]">
                  <h3 className="font-black italic uppercase tracking-tighter text-lg">Batch-00{i}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] italic">Active Slot</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stickers" className="mt-16 space-y-10">
           <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-400">Asset Library</h2>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black uppercase italic tracking-tighter shadow-lg shadow-primary/20">
              <Upload className="mr-2 h-5 w-5" /> Push Core Assets
            </Button>
          </div>

          <div className="glass-panel rounded-[3rem] p-16 border-dashed border-2 border-white/10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-colors">
             <div className="h-24 w-24 rounded-3xl bg-primary/10 shadow-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform border border-primary/20">
                <Upload className="h-10 w-10 text-primary" />
             </div>
             <h3 className="text-3xl font-black italic uppercase tracking-tighter">Ingest Session Artifacts</h3>
             <p className="text-zinc-500 font-medium max-w-sm mx-auto mt-4 text-xs tracking-widest uppercase leading-loose">Drop transparent assets (PNG) to propagate them to all active studio sessions.</p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 pt-10 px-4">
             {['❤️', '✨', '🔥', '👑', '😎', '🎉', '🌈', '⚡', '🛸', '🪐'].map((emoji, i) => (
               <div key={i} className="aspect-square glass-panel rounded-2xl flex items-center justify-center p-4 hover:bg-white/10 cursor-grab active:cursor-grabbing relative group transition-all hover:scale-110 border border-white/5 shadow-xl">
                  <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{emoji}</span>
                  <button className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl border-2 border-zinc-950">
                    <Trash2 className="h-3 w-3" />
                  </button>
               </div>
             ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-16">
          <div className="glass-panel rounded-[3rem] p-12 space-y-10 max-w-3xl border border-white/10 shadow-3xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 h-64 w-64 bg-primary/5 blur-[80px] rounded-full" />
             
             <h2 className="text-4xl font-black italic uppercase tracking-tighter">Engine <span className="text-primary italic neon-text">Configuration</span></h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2 block">Studio Identity</label>
                   <Input defaultValue="Virtual Photoboox" className="h-16 bg-white/5 rounded-2xl border-white/10 font-bold focus:border-primary/50 text-white placeholder:text-zinc-700 transition-all" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2 block">Trigger Window (S)</label>
                   <Input type="number" defaultValue="3" className="h-16 bg-white/5 rounded-2xl border-white/10 font-bold focus:border-primary/50 text-white transition-all" />
                </div>
             </div>

             <div className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-inner group">
                <div>
                   <h4 className="font-black text-lg italic uppercase tracking-tighter">Stealth Deployment</h4>
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Obfuscate session IDs from public indexing</p>
                </div>
                <div className="h-10 w-16 bg-zinc-900 rounded-full relative p-1.5 cursor-pointer border border-white/10 group-hover:border-primary/50 transition-colors">
                   <div className="h-full aspect-square bg-primary rounded-full transition-all translate-x-6 shadow-[0_0_15px_#ff00e5]" />
                </div>
             </div>
             
             <Button className="w-full h-18 bg-white text-black hover:bg-zinc-200 text-xl font-black italic uppercase tracking-tighter rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02]">
                Commit Changes
             </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
