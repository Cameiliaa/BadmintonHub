import { LAYOUTS, LayoutConfig, LayoutType } from '@/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface LayoutSelectorProps {
  selectedId: LayoutType;
  onSelect: (layout: LayoutConfig) => void;
}

export function LayoutSelector({ selectedId, onSelect }: LayoutSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mx-auto px-4 focus-visible:outline-none">
      {LAYOUTS.map((layout) => (
        <div
          key={layout.id}
          className={cn(
            "relative cursor-pointer transition-all duration-500 hover:scale-105 p-8 flex flex-col items-center gap-6 glass-panel rounded-[2.5rem] group border focus-visible:outline-none",
            selectedId === layout.id 
              ? "border-primary/50 bg-primary/5 shadow-[0_0_30px_rgba(255,0,229,0.1)] scale-105 z-10" 
              : "border-white/5 hover:bg-white/10"
          )}
          onClick={() => onSelect(layout)}
        >
          {selectedId === layout.id && (
            <div className="absolute -top-3 -right-3 bg-primary text-white rounded-full p-2 shadow-[0_0_20px_#ff00e5] z-20">
              <Check className="h-4 w-4 stroke-[4px]" />
            </div>
          )}
          
          <div 
            className="grid gap-2 w-full aspect-[2/3] p-4 bg-black/40 rounded-3xl border border-white/10 shadow-inner group-hover:border-white/20 transition-colors"
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
            }}
          >
            {Array.from({ length: layout.cols * layout.rows }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "rounded-lg shadow-2xl bg-zinc-800 transition-all duration-500",
                  selectedId === layout.id ? "bg-gradient-to-tr from-primary to-secondary scale-100" : "group-hover:bg-zinc-700"
                )}
              />
            ))}
          </div>
          
          <div className="text-center">
            <span className={cn(
              "font-black text-[10px] uppercase tracking-[0.2em] italic block mb-1 transition-colors",
              selectedId === layout.id ? "text-primary" : "text-zinc-600"
            )}>{layout.name}</span>
            <span className="text-[10px] font-black text-zinc-400 opacity-50 uppercase tracking-widest">{layout.cols}x{layout.rows} GRID</span>
          </div>
        </div>
      ))}
    </div>
  );
}
