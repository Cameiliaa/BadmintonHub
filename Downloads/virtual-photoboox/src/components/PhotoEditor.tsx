import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FILTERS, PhotoFilter, LayoutConfig } from '@/types';
import { Download, Smile, Image as ImageIcon, Palette, Type, ArrowLeft, Sparkles, X, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface PhotoEditorProps {
  photos: string[];
  layout: LayoutConfig;
  onSave: (finalDataUrl: string) => void;
  onCancel: () => void;
}

const EMOJIS = ['❤️', '✨', '🔥', '👑', '😎', '🎉', '📸', '💎', '🌈', '⚡', '🛸', '🪐'];

export function PhotoEditor({ photos, layout, onSave, onCancel }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('None');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const internalWidth = 1000; 
    const internalHeight = 1500;
    const paddingX = 70;
    const gap = 30;
    const brandingHeight = 140;
    const brandingGap = 50;
    
    const cols = layout.cols || 1;
    const rows = layout.rows || 1;
    const availableWidth = internalWidth - (paddingX * 2) - (gap * (cols - 1));
    const cellWidth = availableWidth / cols;
    
    let cellHeight = cellWidth; 
    if (rows > 1) {
      const maxGridHeight = internalHeight - (paddingX * 2) - brandingHeight - brandingGap;
      const calculatedHeight = (maxGridHeight - (gap * (rows - 1))) / rows;
      cellHeight = Math.min(calculatedHeight, cellWidth * 1.25);
    }

    const gridWidth = (cols * cellWidth) + ((cols - 1) * gap);
    const gridHeight = (rows * cellHeight) + ((rows - 1) * gap);
    
    const totalContentHeight = gridHeight + brandingGap + brandingHeight;
    const startY = (internalHeight - totalContentHeight) / 2;
    const startX = (internalWidth - gridWidth) / 2;
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: internalWidth,
      height: internalHeight,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    const resizeCanvas = () => {
      const wrapper = canvasRef.current?.closest('.canvas-wrapper');
      if (!wrapper) return;
      
      const containerWidth = wrapper.clientWidth - 80; 
      const containerHeight = wrapper.clientHeight - 80;
      
      const zoom = Math.min(containerWidth / internalWidth, containerHeight / internalHeight, 1);
      
      canvas.setZoom(zoom);
      canvas.setDimensions({
        width: internalWidth * zoom,
        height: internalHeight * zoom
      });
    };

    setFabricCanvas(canvas);

    const loadPhotos = async () => {
      // Paper Base
      const paper = new fabric.Rect({
        left: 0,
        top: 0,
        width: internalWidth,
        height: internalHeight,
        fill: '#ffffff',
        selectable: false,
        evented: false,
      });
      canvas.add(paper);

      // Branding Area
      const brandingCenterY = startY + gridHeight + brandingGap + (brandingHeight / 2);
      
      const brandText = new fabric.FabricText('VIRTUAL PHOTOBOOX', {
        left: internalWidth / 2,
        top: brandingCenterY - 20,
        fontSize: 54,
        fontWeight: '900',
        charSpacing: 400,
        fill: '#111111',
        originX: 'center',
        originY: 'center',
        selectable: false,
        fontFamily: 'Outfit',
      });
      canvas.add(brandText);

      const subText = new fabric.FabricText('• PREMIUM DIGITAL CAPTURE •', {
        left: internalWidth / 2,
        top: brandingCenterY + 40,
        fontSize: 18,
        fontWeight: '700',
        charSpacing: 500,
        fill: '#ff00e5',
        originX: 'center',
        originY: 'center',
        selectable: false,
        fontFamily: 'Outfit',
      });
      canvas.add(subText);

      // Grid Rendering
      for (let i = 0; i < rows * cols; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellLeft = startX + col * (cellWidth + gap);
        const cellTop = startY + row * (cellHeight + gap);

        const slot = new fabric.Rect({
          left: cellLeft,
          top: cellTop,
          width: cellWidth,
          height: cellHeight,
          fill: '#fcfcfc',
          selectable: false,
          evented: false,
          stroke: '#f2f2f2',
          strokeWidth: 1,
        });
        canvas.add(slot);

        if (photos[i]) {
          try {
            const img = await fabric.FabricImage.fromURL(photos[i]);
            const scaleX = cellWidth / img.width!;
            const scaleY = cellHeight / img.height!;
            const scale = Math.max(scaleX, scaleY);
            
            img.set({
              scaleX: scale,
              scaleY: scale,
              left: cellLeft + (cellWidth / 2),
              top: cellTop + (cellHeight / 2),
              originX: 'center',
              originY: 'center',
              selectable: true,
            });

            const clipPath = new fabric.Rect({
              left: cellLeft,
              top: cellTop,
              width: cellWidth,
              height: cellHeight,
              absolutePositioned: true,
              rx: 4,
              ry: 4,
            });
            img.clipPath = clipPath;
            canvas.add(img);
          } catch (e) {
            console.error("Image load failed:", e);
          }
        }
      }
      canvas.renderAll();
    };

    loadPhotos().then(() => resizeCanvas());

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
    };
  }, [photos, layout]);

  const applyFilter = async (filterObj: PhotoFilter) => {
    if (!fabricCanvas || !filterObj) return;
    const filterId = (filterObj.name || '').toLowerCase();
    setActiveFilter(filterObj.name || 'None');

    const objects = fabricCanvas.getObjects().filter(o => o.type === 'image') as fabric.FabricImage[];
    for (const obj of objects) {
      obj.filters = [];
      try {
        if (filterId === 'grayscale') obj.filters.push(new fabric.filters.Grayscale());
        else if (filterId === 'sepia') obj.filters.push(new fabric.filters.Sepia());
        else if (filterId === 'invert') obj.filters.push(new fabric.filters.Invert());
        else if (filterId === 'cool') obj.filters.push(new fabric.filters.BlendColor({ color: '#00e5ff', mode: 'multiply', alpha: 0.1 }));
        else if (filterId === 'warm') obj.filters.push(new fabric.filters.BlendColor({ color: '#ff9100', mode: 'multiply', alpha: 0.1 }));
        else if (filterId === 'vintage') obj.filters.push(new fabric.filters.Sepia());
        await obj.applyFilters();
      } catch (e) { console.error(e); }
    }
    fabricCanvas.renderAll();
  };

  const addSticker = (emoji: string) => {
    const text = new fabric.FabricText(emoji, {
      fontSize: 100,
      left: fabricCanvas?.width! / 2,
      top: fabricCanvas?.height! / 2,
      originX: 'center',
      originY: 'center',
      selectable: true,
    });
    fabricCanvas?.add(text);
    fabricCanvas?.setActiveObject(text);
    fabricCanvas?.renderAll();
  };

  const setPaperColor = (color: string) => {
    if (!fabricCanvas) return;
    const paper = fabricCanvas.getObjects().find(o => o.type === 'rect' && !o.clipPath);
    if (paper) {
      paper.set('fill', color);
      fabricCanvas.renderAll();
    }
  };

  const exportCanvas = async () => {
    if (!fabricCanvas) return;
    setIsExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Dramatic pause for effect
      const dataUrl = fabricCanvas.toDataURL({
        format: 'png',
        multiplier: 1 / (fabricCanvas.getZoom() || 1),
        quality: 1
      });
      
      // Trigger actual browser download
      const link = document.createElement('a');
      link.download = `photoboox-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onSave(dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] atmosphere-bg flex flex-col md:flex-row font-sans"
    >
      {/* Sidebar: Brutalist Controls */}
      <motion.div 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="w-full md:w-[400px] h-full glass-panel border-r border-white/10 z-50 overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_#ff00e5]" />
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Studio Editor</h2>
           </div>
           <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full hover:bg-white/10">
              <X className="h-5 w-5" />
           </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           <Tabs defaultValue="filters" className="w-full">
              <TabsList className="grid grid-cols-4 h-16 bg-white/5 border border-white/10 rounded-2xl p-1 mb-8">
                 <TabsTrigger value="filters" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                    <Palette className="h-3.5 w-3.5" />
                 </TabsTrigger>
                 <TabsTrigger value="stickers" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                    <Smile className="h-3.5 w-3.5" />
                 </TabsTrigger>
                 <TabsTrigger value="canvas" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                    <ImageIcon className="h-3.5 w-3.5" />
                 </TabsTrigger>
                 <TabsTrigger value="text" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                    <Type className="h-3.5 w-3.5" />
                 </TabsTrigger>
              </TabsList>

              <div className="space-y-8">
                 <TabsContent value="filters" className="mt-0">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Visual Profiles</label>
                    <div className="grid grid-cols-2 gap-3">
                       {FILTERS.map((f) => (
                          <Button
                             key={f.name}
                             onClick={() => applyFilter(f)}
                             className={cn(
                                "h-14 border border-white/5 rounded-2xl font-black uppercase italic tracking-tighter text-xs justify-start px-4 transition-all",
                                activeFilter === f.name ? "bg-primary text-white" : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                             )}
                          >
                             {activeFilter === f.name && <Sparkles className="h-3 w-3 mr-2 animate-pulse" />}
                             {f.name}
                          </Button>
                       ))}
                    </div>
                 </TabsContent>

                 <TabsContent value="stickers" className="mt-0">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Session Stickers</label>
                    <div className="grid grid-cols-4 gap-3">
                       {EMOJIS.map((emoji) => (
                          <Button
                             key={emoji}
                             variant="outline"
                             className="h-16 border-white/5 bg-white/5 hover:bg-white/10 hover:scale-110 transition-all rounded-2xl text-2xl"
                             onClick={() => addSticker(emoji)}
                          >
                             {emoji}
                          </Button>
                       ))}
                    </div>
                 </TabsContent>

                 <TabsContent value="canvas" className="mt-0">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Paper Texture</label>
                    <div className="grid grid-cols-2 gap-3">
                       {[
                          { name: 'Pure White', color: '#ffffff' },
                          { name: 'Dark Noir', color: '#000000' },
                          { name: 'Soft Pink', color: '#ffb7e5' },
                          { name: 'Cyber Blue', color: '#b7f0ff' }
                       ].map((item) => (
                          <Button
                             key={item.name}
                             onClick={() => setPaperColor(item.color)}
                             className="h-20 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 group"
                          >
                             <div className="h-8 w-8 rounded-full shadow-lg border border-white/10 group-hover:scale-110 transition-transform" style={{ backgroundColor: item.color }} />
                             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{item.name}</span>
                          </Button>
                       ))}
                    </div>
                 </TabsContent>
              </div>
           </Tabs>
        </div>

        <div className="p-8 border-t border-white/10 bg-black/20">
           <Button 
             disabled={isExporting}
             onClick={exportCanvas} 
             className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-2xl font-black uppercase italic tracking-tighter text-lg shadow-2xl relative overflow-hidden group"
           >
              {isExporting ? (
                 <div className="flex items-center gap-3">
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Baking Assets...
                 </div>
              ) : (
                 <div className="flex items-center justify-between w-full px-4">
                    <span>Export Artifacts</span>
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                 </div>
              )}
           </Button>
           <p className="text-[9px] text-center text-zinc-600 mt-4 font-black uppercase tracking-[0.2em]">Generated via Premium Capture Engine</p>
        </div>
      </motion.div>

      {/* Main Workspace */}
      <div className="flex-1 h-full relative overflow-hidden p-8 md:p-12 flex items-center justify-center">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,229,0.05)_0%,transparent_70%)] pointer-events-none" />
         
         <div className="relative w-full h-full flex items-center justify-center canvas-wrapper">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden bg-white/2 border-4 border-white/5"
            >
               <canvas ref={canvasRef} />
            </motion.div>
         </div>

         {/* Floating Workspace Label */}
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 text-zinc-500">
            <div className="h-[1px] w-12 bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Studio Workpiece • {layout.name}</span>
            <div className="h-[1px] w-12 bg-white/10" />
         </div>
      </div>
    </motion.div>
  );
}
