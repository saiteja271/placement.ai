import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useApp, THEMES, ThemeId } from '../context/AppContext';

interface ThemeSelectorProps {
  compact?: boolean;
  align?: 'left' | 'right';
  showLabel?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  compact = false,
  align = 'right',
  showLabel = true,
}) => {
  const { theme, setTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Labelled Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Choose appearance theme"
        title={`Current theme: ${activeTheme.name}`}
        className={`flex items-center gap-2 rounded-xl border border-theme bg-surface hover:bg-surface-alt transition-all cursor-pointer shadow-subtle ${
          compact
            ? 'px-2 py-1.5 text-xs'
            : 'px-3 py-1.5 text-xs font-semibold'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-primary-app shrink-0" />
          <span
            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
            style={{ backgroundColor: activeTheme.primaryColor }}
          />
        </div>

        {showLabel && (
          <span className="text-ink font-medium text-xs whitespace-nowrap">
            {activeTheme.name}
          </span>
        )}

        <ChevronDown className="w-3 h-3 text-muted shrink-0" />
      </button>

      {/* Accessible Interactive Popover Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Theme selection panel"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-72 rounded-2xl bg-surface border border-theme shadow-xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Popover Header */}
          <div className="px-1.5 pt-1 pb-1 border-b border-theme/60 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-primary-app" />
                <span>Appearance Theme</span>
              </h4>
              <p className="text-[10px] text-muted">
                Live color tokens across all pages
              </p>
            </div>
            <span className="text-[10px] font-bold text-primary-app bg-surface-tint px-2 py-0.5 rounded-full border border-theme">
              4 Themes
            </span>
          </div>

          {/* Theme List */}
          <div className="space-y-1.5">
            {THEMES.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-surface-tint border-primary-app shadow-subtle'
                      : 'bg-canvas hover:bg-surface-alt border-theme/70'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ink">
                        {t.name}
                      </span>
                      {t.id === 'lavender' && (
                        <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-primary-app text-white">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted truncate">
                      {t.tagline}
                    </p>

                    {/* Color Swatches (Canvas, Surface, Primary Accent) */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <div className="flex items-center gap-1 text-[9px] text-muted font-medium">
                        <span
                          className="w-3.5 h-3.5 rounded-md border border-theme shadow-2xs"
                          style={{ backgroundColor: t.canvasBg }}
                          title={`Canvas: ${t.canvasBg}`}
                        />
                        <span>Canvas</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-muted font-medium">
                        <span
                          className="w-3.5 h-3.5 rounded-md border border-theme shadow-2xs"
                          style={{ backgroundColor: t.cardBg }}
                          title={`Card: ${t.cardBg}`}
                        />
                        <span>Card</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-muted font-medium">
                        <span
                          className="w-3.5 h-3.5 rounded-md border border-theme shadow-2xs"
                          style={{ backgroundColor: t.primaryColor }}
                          title={`Primary: ${t.primaryColor}`}
                        />
                        <span>Accent</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-primary-app text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-theme bg-surface" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
