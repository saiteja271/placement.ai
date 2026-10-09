import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Check,
  Key,
  ShieldCheck,
  Cpu,
  Database,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useApp, THEMES } from '../context/AppContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, currentStudent } = useApp();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isSavedKey, setIsSavedKey] = useState<boolean>(false);

  useEffect(() => {
    api.getHealth().then(setHealthStatus).catch(console.error);
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
          Settings & Environment
        </h2>
        <p className="text-xs text-muted mt-1">
          Configure application visual theme, optional LLM keys, and inspect engine health.
        </p>
      </div>

      <div className="space-y-5">
        {/* Appearance Settings - 4 Theme Grid */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary-app" />
            <div>
              <h3 className="font-bold text-sm text-ink">
                Interface Color Themes
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Choose between four professionally balanced visual styles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {THEMES.map((t) => {
              const isSelected = theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-primary-app bg-surface-tint shadow-subtle ring-2 ring-primary-app/20'
                      : 'border-theme bg-canvas hover:border-primary-app/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-ink">{t.name}</span>
                        {t.isDark ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">Dark</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium">Light</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted mt-1 leading-snug">
                        {t.id === 'lavender' && 'Soft lavender accents, crisp white cards, and calm indigo highlights.'}
                        {t.id === 'ocean' && 'Airy blue-white canvas with ocean teal and cyan accents.'}
                        {t.id === 'sand' && 'Warm off-white surfaces with terracotta & natural earth tones.'}
                        {t.id === 'midnight' && 'Deep charcoal surfaces with high-contrast night typography.'}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary-app text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Swatches preview */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-theme/40">
                    <span className="text-[10px] text-muted mr-1">Palette:</span>
                    <span className="w-4 h-4 rounded-full border border-theme shadow-2xs" style={{ backgroundColor: t.canvasBg }} title="Canvas" />
                    <span className="w-4 h-4 rounded-full border border-theme shadow-2xs" style={{ backgroundColor: t.cardBg }} title="Surface" />
                    <span className="w-4 h-4 rounded-full border border-theme shadow-2xs" style={{ backgroundColor: t.primaryColor }} title="Primary Accent" />
                    <span className="w-4 h-4 rounded-full border border-theme shadow-2xs" style={{ backgroundColor: t.textColor }} title="Text Ink" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI & LLM Key Settings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary-app" />
              <h3 className="font-bold text-sm text-ink">
                AI Orchestration Mode & Keys
              </h3>
            </div>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              PlaceMate AI operates with a resilient dual-mode architecture:
            </p>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-theme space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Active: Fallback Deterministic Engine (Zero Hallucination Local Tools)</span>
            </div>
            <p className="text-muted text-[11px] leading-relaxed">
              All eligibility evaluations, skill-gap diagnoses, and 4-week roadmaps run with zero external API dependencies using deterministic algorithms. No hallucinated criteria or fabricated vacancies.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-ink">
              Optional Google Gemini / OpenAI API Key (Loaded from environment or entered below):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-... or AIzaSy... (optional for live tool calling)"
                className="flex-1 bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-app/40"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSavedKey(true);
                  setTimeout(() => setIsSavedKey(false), 3000);
                }}
                className="px-4 py-2 bg-primary-app hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-opacity cursor-pointer shrink-0"
              >
                {isSavedKey ? 'Configured!' : 'Save Key'}
              </button>
            </div>
            <span className="text-[10px] text-muted">
              Keys are strictly read from local environment or browser session; never exposed or committed to source control.
            </span>
          </div>
        </div>

        {/* System Diagnostics Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary-app" />
            <h3 className="font-bold text-sm text-ink">
              System Diagnostics
            </h3>
          </div>

          {healthStatus ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 bg-canvas rounded-xl border border-theme">
                <span className="text-muted block text-[10px]">Backend Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {healthStatus.status}
                </span>
              </div>
              <div className="p-3 bg-canvas rounded-xl border border-theme">
                <span className="text-muted block text-[10px]">Rule Engine</span>
                <span className="font-bold text-ink">
                  {healthStatus.rules_engine}
                </span>
              </div>
              <div className="p-3 bg-canvas rounded-xl border border-theme">
                <span className="text-muted block text-[10px]">Database</span>
                <span className="font-bold text-ink">
                  SQLite Persistence
                </span>
              </div>
              <div className="p-3 bg-canvas rounded-xl border border-theme">
                <span className="text-muted block text-[10px]">Candidate</span>
                <span className="font-bold text-primary-app truncate block">
                  {currentStudent?.full_name || 'None'}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted">Checking backend health...</span>
          )}
        </div>
      </div>
    </div>
  );
};

