import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  Clock,
  Terminal,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Briefcase,
  LineChart,
  CalendarCheck,
  Bot,
  User,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AgentQueryResponse, AgentTraceStep } from '../types';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  structuredResult?: AgentQueryResponse['structured_result'];
  trace?: AgentTraceStep[];
  executionMode?: string;
  suggestedActions?: string[];
}

export const AgentDrawer: React.FC = () => {
  const { isAgentDrawerOpen, closeAgentDrawer, agentInitialPrompt, currentStudent } = useApp();
  const [query, setQuery] = useState<string>('');
  const [mode, setMode] = useState<'auto' | 'live' | 'demo'>('auto');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initialize first greeting message if empty
  useEffect(() => {
    if (messages.length === 0 && currentStudent) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Hello ${currentStudent.full_name}! I am PlaceMate Copilot, your agentic placement assistant. Ask me to evaluate your profile against job listings, check mandatory eligibility, identify skill gaps, or draft a personalized preparation roadmap.`,
          timestamp: Date.now(),
          suggestedActions: [
            'Assess top jobs & verify eligibility',
            'Analyze skill gaps for Google SDE',
            'Generate 4-week preparation plan'
          ]
        }
      ]);
    }
  }, [currentStudent]);

  useEffect(() => {
    if (agentInitialPrompt && isAgentDrawerOpen) {
      setQuery(agentInitialPrompt);
    }
  }, [agentInitialPrompt, isAgentDrawerOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isAgentDrawerOpen) return null;

  const handleRunAgent = async (promptToRun?: string) => {
    const activePrompt = (promptToRun || query).trim();
    if (!currentStudent || !activePrompt || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: activePrompt,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);
    setError(null);

    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
      structuredResult: m.structuredResult,
      trace: m.trace
    }));

    try {
      const response = await api.runAgentQuery(currentStudent.id, activePrompt, mode, historyPayload);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.final_answer,
        timestamp: Date.now(),
        structuredResult: response.structured_result,
        trace: response.trace,
        executionMode: response.execution_mode,
        suggestedActions: response.suggested_actions
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Agent failed to execute. Please verify network status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionText: string) => {
    closeAgentDrawer();
    const act = actionText.toLowerCase();
    if (act.includes('job') || act.includes('details') || act.includes('match')) {
      navigate('/jobs');
    } else if (act.includes('skill') || act.includes('gap')) {
      navigate('/skills');
    } else if (act.includes('prep') || act.includes('plan') || act.includes('roadmap')) {
      navigate('/prep');
    } else if (act.includes('interview') || act.includes('mock')) {
      navigate('/mock-interview');
    }
  };

  const toggleTrace = (msgId: string) => {
    setExpandedTraceId((prev) => (prev === msgId ? null : msgId));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md md:max-w-xl bg-surface h-full shadow-2xl flex flex-col border-l border-theme animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-theme flex items-center justify-between bg-surface-tint">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-app text-white flex items-center justify-center shadow-subtle shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-ink text-sm">
                  PlaceMate AI Copilot
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-theme text-primary-app">
                  Agentic AI
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Transparent multi-step reasoning with verifiable tools
              </p>
            </div>
          </div>
          <button
            onClick={closeAgentDrawer}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector & Quick Bar */}
        <div className="px-4 py-2 border-b border-theme bg-canvas flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Execution Mode:</span>
          </div>
          <select
            value={mode}
            onChange={(e: any) => setMode(e.target.value)}
            className="bg-surface text-[11px] font-semibold text-ink rounded-lg px-2 py-1 border border-theme focus:outline-none cursor-pointer"
          >
            <option value="auto">Auto (Live AI or Deterministic)</option>
            <option value="demo">Deterministic Tool Engine</option>
            <option value="live">Live LLM Function Calling</option>
          </select>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isTraceExpanded = expandedTraceId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-surface-tint border border-theme text-primary-app flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`space-y-3 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Layer A: Natural Conversational Text Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-primary-app text-white shadow-subtle rounded-br-xs'
                        : 'bg-canvas border border-theme text-ink shadow-2xs rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-medium space-y-1">
                      {msg.text}
                    </div>
                  </div>

                  {/* Layer B: Structured Result Cards (Rendered for assistant when available) */}
                  {!isUser && msg.structuredResult && (
                    <div className="space-y-2 pt-1 w-full animate-in fade-in duration-200">
                      {/* 1. Job Match Structured Card */}
                      {msg.structuredResult.job_match && (
                        <div className="p-3 bg-surface rounded-xl border border-theme shadow-subtle space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-primary-app" />
                              Top Match Result
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-surface-tint text-primary-app border border-theme">
                              {msg.structuredResult.job_match.score}% Match
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-ink">
                              {msg.structuredResult.job_match.title}
                            </h4>
                            <p className="text-[11px] text-muted">
                              {msg.structuredResult.job_match.company} · {msg.structuredResult.job_match.eligibility_status}
                            </p>
                          </div>
                          <button
                            onClick={() => handleActionClick('jobs')}
                            className="w-full py-1.5 px-3 bg-surface-tint hover:bg-primary-app hover:text-white text-primary-app text-[11px] font-bold rounded-lg border border-theme transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>View Job Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* 2. Skill Gaps Card */}
                      {msg.structuredResult.skill_gaps && (
                        <div className="p-3 bg-surface rounded-xl border border-theme shadow-subtle space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                              <LineChart className="w-3 h-3 text-amber-500" />
                              Target Skill Gaps
                            </span>
                            <span className="text-[10px] text-muted font-semibold">
                              {msg.structuredResult.skill_gaps.missing_count} Skills to Deepen
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.structuredResult.skill_gaps.missing_skills.map((sk: string) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => handleActionClick('skills')}
                            className="w-full py-1.5 px-3 bg-canvas hover:bg-surface text-ink text-[11px] font-bold rounded-lg border border-theme transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Analyze Full Skill Gaps</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* 3. Preparation Plan Roadmap Card */}
                      {msg.structuredResult.prep_plan && (
                        <div className="p-3 bg-surface rounded-xl border border-theme shadow-subtle space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                              <CalendarCheck className="w-3 h-3 text-emerald-500" />
                              Preparation Roadmap
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {msg.structuredResult.prep_plan.tasks_count} Tasks · 28 Days
                            </span>
                          </div>
                          <button
                            onClick={() => handleActionClick('prep')}
                            className="w-full py-1.5 px-3 bg-surface-tint hover:bg-primary-app hover:text-white text-primary-app text-[11px] font-bold rounded-lg border border-theme transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Open 4-Week Prep Plan</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Layer C: Agent Activity Trace (Collapsible & Separated from Chat) */}
                  {!isUser && msg.trace && msg.trace.length > 0 && (
                    <div className="w-full border border-theme rounded-xl overflow-hidden bg-surface">
                      <button
                        type="button"
                        onClick={() => toggleTrace(msg.id)}
                        className="w-full p-2.5 bg-canvas/80 hover:bg-canvas flex items-center justify-between text-left cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-primary-app" />
                          <span className="text-[11px] font-bold text-ink">
                            Agent Activity Trace ({msg.trace.length} Tools Executed)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted">
                          <span className="font-mono text-[10px]">
                            {msg.executionMode === 'LIVE_AI' ? '⚡ Live AI' : '🤖 Deterministic Engine'}
                          </span>
                          {isTraceExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </button>

                      {isTraceExpanded && (
                        <div className="p-3 space-y-2 border-t border-theme bg-surface text-xs animate-in fade-in duration-150">
                          {msg.trace.map((step) => (
                            <div
                              key={step.step_number}
                              className="p-2 rounded-lg bg-canvas border border-theme space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-surface-tint text-primary-app flex items-center justify-center font-bold text-[9px] border border-theme">
                                    {step.step_number}
                                  </span>
                                  <span className="font-mono font-bold text-ink text-[11px]">
                                    {step.tool_name}()
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-muted font-mono flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {step.duration_ms}ms
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    {step.status}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-surface p-1.5 rounded font-mono text-[10px] text-muted overflow-x-auto border border-theme/60">
                                args: {JSON.stringify(step.arguments)}
                              </div>

                              <p className="text-[11px] text-ink font-medium leading-relaxed">
                                {step.result_summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested Follow-up Action Chips */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedActions.map((act) => (
                        <button
                          key={act}
                          onClick={() => handleActionClick(act)}
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-surface border border-theme text-ink hover:bg-surface-tint hover:text-primary-app transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <span>{act}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-muted" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-primary-app text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-surface-tint border border-theme text-primary-app flex items-center justify-center shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-canvas border border-theme text-xs text-muted space-y-1">
                <span className="font-semibold text-ink block">
                  Executing verified placement tools...
                </span>
                <span className="text-[11px] block text-muted">
                  Checking database listings, mandatory criteria, and roadmaps
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Preset Chips */}
        <div className="p-3.5 border-t border-theme bg-surface space-y-2">
          {/* Quick Presets */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {[
              'Match top jobs & check eligibility',
              'Analyze skill gaps for Google SDE',
              'Generate 4-week preparation plan',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => handleRunAgent(preset)}
                className="text-[10px] bg-canvas hover:bg-surface-tint text-muted hover:text-primary-app px-2.5 py-1 rounded-lg border border-theme transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {preset}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAgent();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask PlaceMate Copilot (e.g. summarize my profile, check job eligibility)..."
              className="flex-1 bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary-app"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-primary-app hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-subtle transition-opacity cursor-pointer shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
