import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  Send,
  BookOpen,
  Code2,
  HelpCircle,
  Award,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  Brain,
  Bug,
  HelpCircle as QuestionIcon,
  FileCheck2,
  RotateCcw,
  Terminal,
  Layers,
  Database,
  Network,
  Cpu,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TutorMessage } from '../types';

export const LearningBotPage: React.FC = () => {
  const { currentStudent } = useApp();
  const [selectedDomain, setSelectedDomain] = useState<string>('Python & Data Structures');
  const [selectedMode, setSelectedMode] = useState<string>('learn');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Intermediate');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Python');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [showCodeBox, setShowCodeBox] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now()}`);
  const [lastFailedQuery, setLastFailedQuery] = useState<{ msg: string; code?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const domains = [
    { id: 'Python & Data Structures', label: 'Python & DSA', icon: Code2, desc: 'Algorithms, OOP, Complexity' },
    { id: 'SQL & Database Queries', label: 'SQL & DBMS', icon: Database, desc: 'Joins, Indexes, Normalization, ACID' },
    { id: 'System Design & Architecture', label: 'System Design', icon: Layers, desc: 'Scalability, Caching, CAP, Microservices' },
    { id: 'AI & Machine Learning', label: 'AI & ML', icon: Brain, desc: 'Supervised/Unsupervised, Metrics, Deep Learning' },
    { id: 'Core CS (OS, Networks, OOP)', label: 'Core CS', icon: Cpu, desc: 'OS Paging, Threads, TCP/UDP, Deadlocks' },
    { id: 'Behavioral & HR (STAR Method)', label: 'Behavioral & HR', icon: UserCheck, desc: 'STAR Framework, Conflict, Culture Fit' },
  ];

  const modes = [
    {
      id: 'learn',
      label: 'Learn a Topic',
      icon: BookOpen,
      desc: 'Progressive concept teaching from fundamentals to interview rigor'
    },
    {
      id: 'doubt',
      label: 'Explain a Doubt',
      icon: HelpCircle,
      desc: 'Direct, clear answers to specific technical questions'
    },
    {
      id: 'practice',
      label: 'Practice Questions',
      icon: Sparkles,
      desc: 'Campus recruitment interview challenges with hints & test cases'
    },
    {
      id: 'debug',
      label: 'Debug Code',
      icon: Bug,
      desc: 'Identify root causes, runtime crashes, and optimal fixes'
    },
    {
      id: 'quiz',
      label: 'Quiz Me',
      icon: QuestionIcon,
      desc: 'Interactive 4-option placement assessment with detailed analysis'
    },
    {
      id: 'review',
      label: 'Review My Answer',
      icon: FileCheck2,
      desc: 'Constructive evaluation of your code or written explanation'
    },
  ];

  const languages = ['Python', 'SQL', 'JavaScript', 'Java', 'C++'];

  // Domain & Mode specific quick prompts
  const getPromptsForCurrentContext = (): string[] => {
    const isSql = selectedDomain.includes('SQL');
    const isSys = selectedDomain.includes('System Design');
    const isMl = selectedDomain.includes('Machine Learning');
    const isCs = selectedDomain.includes('Core CS');
    const isHr = selectedDomain.includes('HR');

    if (isSql) {
      if (selectedMode === 'doubt') return ['What is database normalization?', 'Why does this SQL query return duplicate rows?', 'Difference between WHERE and HAVING?'];
      if (selectedMode === 'practice') return ['Find the 2nd highest salary across departments.', 'Write a query using DENSE_RANK window function.', 'Find departments with zero employees.'];
      if (selectedMode === 'debug') return ['SELECT dept_id, AVG(salary) FROM emp WHERE AVG(salary) > 50000 GROUP BY dept_id;', 'Fix Cartesian product in this multi-table join.'];
      if (selectedMode === 'quiz') return ['Quiz me on Clustered vs Non-Clustered Indexes.', 'Quiz me on ACID transaction isolation levels.'];
      if (selectedMode === 'review') return ['Review my query: SELECT * FROM emp WHERE salary > (SELECT AVG(salary) FROM emp);', 'Review my database normalization explanation.'];
      return ['Teach me SQL joins using two sample tables.', 'Explain database indexing with B-Trees.', 'Explain ACID properties in relational databases.'];
    }

    if (isSys) {
      if (selectedMode === 'doubt') return ['How does caching improve system performance?', 'What is the CAP Theorem?', 'Horizontal vs Vertical scaling?'];
      if (selectedMode === 'practice') return ['Design a URL Shortener (TinyURL).', 'Design a Distributed Rate Limiter serving 100k QPS.', 'Design a notification system with message queues.'];
      if (selectedMode === 'quiz') return ['Quiz me on CAP Theorem trade-offs.', 'Quiz me on Cache-Aside vs Write-Through caching.'];
      if (selectedMode === 'review') return ['Review my architectural design for an e-commerce checkout service.', 'Review my database sharding proposal.'];
      return ['Introduce system design fundamentals and scalability.', 'Explain Redis caching strategies (LRU, TTL, Write-Through).', 'Explain Load Balancers and Consistent Hashing.'];
    }

    if (isMl) {
      if (selectedMode === 'doubt') return ['What is the difference between classification and regression?', 'What is the difference between Precision and Recall?', 'What is Overfitting and how do you prevent it?'];
      if (selectedMode === 'practice') return ['Solve a customer churn prediction case study.', 'How do you handle class imbalance in credit card fraud detection?'];
      if (selectedMode === 'quiz') return ['Quiz me on False Positives vs False Negatives in medical diagnosis.', 'Quiz me on Supervised vs Unsupervised learning.'];
      if (selectedMode === 'review') return ['Review my model evaluation metric choice for fraud detection.', 'Review my feature engineering pipeline.'];
      return ['Explain supervised versus unsupervised learning.', 'Explain the Bias-Variance trade-off with examples.', 'Explain how Neural Network backpropagation works.'];
    }

    if (isCs) {
      if (selectedMode === 'doubt') return ['How does TCP differ from UDP?', 'What is the difference between a Process and a Thread?', 'What is Virtual Memory and Paging?'];
      if (selectedMode === 'practice') return ['Trace the TCP 3-Way Handshake step by step.', 'Explain how SYN Cookies prevent SYN flood attacks.'];
      if (selectedMode === 'quiz') return ['Quiz me on Deadlock Coffman conditions.', 'Quiz me on CPU scheduling algorithms.'];
      return ['Explain Operating System Process vs Thread mechanics.', 'Explain the TCP 3-Way Handshake with packet flags.', 'Explain Deadlock Coffman conditions and prevention.'];
    }

    if (isHr) {
      if (selectedMode === 'practice') return ['Practice question: Tell me about a time you had conflict with a teammate.', 'Practice question: What is your greatest weakness?'];
      if (selectedMode === 'quiz') return ['Quiz me on effective HR interview communication strategies.', 'Quiz me on salary negotiation best practices.'];
      if (selectedMode === 'review') return ['Review my STAR response for conflict resolution.', 'Review my 1-minute elevator pitch for Tell me about yourself.'];
      return ['Explain the STAR method for behavioral interviews.', 'How to answer What is your greatest weakness constructively?', 'Master the 1-minute Tell me about yourself pitch.'];
    }

    // Default Python & DSA
    if (selectedMode === 'doubt') return ['What is the difference between a Python list and a tuple?', 'What is the difference between Shallow and Deep Copy?', 'What is Method Resolution Order (MRO)?'];
    if (selectedMode === 'practice') return ['Give me three beginner questions about OOP.', 'Solve a two-pointer problem with O(N) time and O(1) space.', 'Write a recursive function to reverse a string.'];
    if (selectedMode === 'debug') return ['Debug this code: print(10 / 0).', 'Debug this code: const x = null; console.log(x.length);', 'Debug this code: arr = [1, 2]; print(arr[5]).'];
    if (selectedMode === 'quiz') return ['Quiz me on Python dict vs list time complexity.', 'Quiz me on Python OOP and inheritance.'];
    if (selectedMode === 'review') return ['Review my answer: A list is mutable with [] and tuple is immutable with ().', 'Review my recursive factorial code.'];
    return ['Explain Python inheritance with an example.', 'Explain recursion using factorial.', 'Explain Two-Pointer algorithm technique.'];
  };

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'tutor',
      domain: 'Python & Data Structures',
      topic: 'Python & Data Structures',
      mode: 'learn',
      difficulty: 'Intermediate',
      title: 'Welcome to PlaceMate AI Placement Tutor',
      content:
        `Hello ${currentStudent ? currentStudent.full_name.split(' ')[0] : 'Candidate'}! I am your technical placement coach. ` +
        `I support 6 dedicated domains (Python, SQL, System Design, ML, Core CS, HR) and 6 learning modes across 3 difficulty tiers.\n\n` +
        `**To begin:** Select your **Domain**, **Mode**, and **Difficulty** above, then click a suggested quick question or type your doubt below!`,
      suggestedFollowups: [
        'Explain Python inheritance with an example.',
        'Teach me SQL joins using two sample tables.',
        'Introduce system design fundamentals and scalability.',
        'Explain supervised versus unsupervised learning.'
      ],
      provider: 'Grounded Placement Engine',
      isLiveAi: false,
      timestamp: Date.now()
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const studentMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      domain: selectedDomain,
      topic: selectedDomain,
      mode: selectedMode,
      difficulty: selectedDifficulty,
      content: text,
      codeSnippet: codeSnippet.trim() ? codeSnippet.trim() : undefined,
      language: selectedLanguage,
      conversationId,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInputMessage('');
    const codePayload = codeSnippet.trim() ? codeSnippet.trim() : undefined;
    setCodeSnippet('');
    setShowCodeBox(false);
    setIsLoading(true);
    setLastFailedQuery(null);

    try {
      const studentId = currentStudent?.id || 'S001';
      // Pass clean conversation history (last 6 turns)
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'student' ? 'user' : 'assistant',
        content: m.content
      }));

      const res = await api.askTutor(
        studentId,
        selectedDomain,
        selectedMode,
        text,
        selectedDifficulty,
        codePayload,
        selectedLanguage.toLowerCase(),
        conversationId,
        history
      );

      const tutorMsg: TutorMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        domain: res.domain || selectedDomain,
        topic: res.topic || selectedDomain,
        mode: res.mode || selectedMode,
        difficulty: res.difficulty || selectedDifficulty,
        title: res.title,
        content: res.response,
        suggestedFollowups: res.suggested_followups,
        provider: res.provider || 'Grounded Placement Engine',
        isLiveAi: res.is_live_ai,
        conversationId,
        timestamp: res.timestamp * 1000
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err: any) {
      setLastFailedQuery({ msg: text, code: codePayload });
      const errorMsg: TutorMessage = {
        id: `err-${Date.now()}`,
        sender: 'tutor',
        domain: selectedDomain,
        mode: selectedMode,
        difficulty: selectedDifficulty,
        content: `⚠️ **Unable to complete tutor request**: ${err.message || 'Network error'}. Your question was saved. Click **Retry** below to resubmit.`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([messages[0]]);
    setShowClearConfirm(false);
    setLastFailedQuery(null);
    setConversationId(`conv-${Date.now()}`);
  };

  const activePrompts = getPromptsForCurrentContext();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-surface-tint text-primary-app flex items-center justify-center border border-theme shadow-2xs">
              <GraduationCap className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
              AI Placement Tutor & Technical Coach
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Multi-Domain Active
              </span>
            </h2>
          </div>
          <p className="text-xs text-muted mt-1">
            Question-aware coaching across 6 technical domains, 6 learning modes, and 3 difficulty levels.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {showClearConfirm ? (
            <div className="flex items-center gap-1.5 p-1 bg-surface border border-red-500/30 rounded-xl">
              <span className="text-[11px] text-muted px-1.5">Reset session?</span>
              <button
                onClick={handleClearChat}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 bg-canvas hover:bg-surface text-ink text-[10px] rounded-lg cursor-pointer border border-theme"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-theme text-xs font-semibold text-muted hover:text-ink rounded-xl shadow-subtle cursor-pointer transition-colors"
              title="Reset conversation state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Conversation</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Domain, Mode & Difficulty Selectors */}
      <div className="p-4 bg-surface rounded-2xl border border-theme shadow-subtle space-y-3.5">
        {/* 1. Technical Domain Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
              1. Technical Domain:
            </span>
            <span className="text-[11px] font-semibold text-primary-app">
              Active: {selectedDomain}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {domains.map((d) => {
              const Icon = d.icon;
              const isSelected = selectedDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary-app bg-surface-tint shadow-2xs ring-1 ring-primary-app/40'
                      : 'border-theme bg-canvas hover:border-primary-app/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-app' : 'text-muted'}`} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-primary-app' : 'text-ink'}`}>
                      {d.label}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted line-clamp-1 leading-tight">
                    {d.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Learning Modes */}
        <div className="pt-2 border-t border-theme">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
              2. Learning Interaction Mode:
            </span>
            <span className="text-[11px] font-semibold text-primary-app">
              Mode: {modes.find((m) => m.id === selectedMode)?.label}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {modes.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary-app bg-surface-tint shadow-2xs ring-1 ring-primary-app/40'
                      : 'border-theme bg-canvas hover:border-primary-app/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`w-3 h-3 ${isSelected ? 'text-primary-app' : 'text-muted'}`} />
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-primary-app' : 'text-ink'}`}>
                      {m.label}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted line-clamp-1 leading-tight">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Difficulty Level & Language Filter */}
        <div className="pt-2 border-t border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted whitespace-nowrap">
              3. Difficulty Level:
            </span>
            <div className="flex gap-1.5">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                const isSelected = selectedDifficulty === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-ink text-canvas shadow-subtle'
                        : 'bg-canvas text-muted hover:text-ink border border-theme'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language selector when in debug mode */}
          {(selectedMode === 'debug' || showCodeBox) && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted whitespace-nowrap">
                Language:
              </span>
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`py-0.5 px-2 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      selectedLanguage === lang
                        ? 'bg-primary-app text-white'
                        : 'bg-canvas text-muted border border-theme hover:text-ink'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Quick-Start Prompts */}
      <div className="px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1.5">
          Suggested Questions for {selectedDomain} ({modes.find((m) => m.id === selectedMode)?.label}):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {activePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-surface border border-theme text-muted hover:text-primary-app hover:border-primary-app transition-all cursor-pointer shadow-2xs font-medium"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="p-4 sm:p-6 bg-surface rounded-2xl border border-theme shadow-subtle min-h-[380px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'student'
                  ? 'bg-primary-app text-white shadow-subtle rounded-tr-xs'
                  : 'bg-canvas text-ink border border-theme shadow-2xs rounded-tl-xs space-y-2.5'
              }`}
            >
              {/* Tutor Header with Domain, Mode & Difficulty Badges */}
              {msg.sender === 'tutor' && (
                <div className="flex items-center justify-between pb-2 border-b border-theme/60 mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-surface-tint text-primary-app flex items-center justify-center font-bold text-[10px]">
                      <Sparkles className="w-3 h-3" />
                    </span>
                    <span className="font-bold text-xs text-ink">{msg.title || 'Technical Coaching'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {msg.domain && (
                      <span className="text-[10px] font-semibold text-primary-app bg-surface-tint px-2 py-0.5 rounded-md border border-primary-app/20">
                        {msg.domain}
                      </span>
                    )}
                    {msg.difficulty && (
                      <span className="text-[10px] font-semibold text-muted bg-surface px-1.5 py-0.5 rounded-md border border-theme">
                        {msg.difficulty}
                      </span>
                    )}
                    {msg.provider && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border ${
                          msg.isLiveAi
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-surface text-muted border-theme'
                        }`}
                        title="AI Model Engine"
                      >
                        {msg.isLiveAi ? '✨ Live AI' : '📚 Grounded Engine'}
                      </span>
                    )}
                    <button
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className="p-1 text-muted hover:text-ink rounded transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {msg.content}
              </div>

              {/* Attached Code Block */}
              {msg.codeSnippet && (
                <div className="p-2.5 bg-black/40 text-emerald-300 font-mono text-[11px] rounded-xl border border-white/10 mt-2 overflow-x-auto">
                  <div className="text-[9px] uppercase tracking-wider text-muted mb-1 font-sans">
                    Supplied Code ({msg.language || 'Code'}):
                  </div>
                  <pre>{msg.codeSnippet}</pre>
                </div>
              )}

              {/* Suggested Followups */}
              {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                <div className="pt-2.5 border-t border-theme/60 mt-2 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                    Recommended Follow-ups:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowups.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(fu)}
                        className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-surface border border-theme text-primary-app hover:bg-primary-app hover:text-white transition-all cursor-pointer font-medium shadow-2xs"
                      >
                        → {fu}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-[10px] text-muted px-2 pt-1">
              {msg.sender === 'student' ? 'You' : 'PlaceMate AI Tutor'}
            </span>
          </div>
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-canvas border border-theme rounded-2xl w-fit text-xs text-muted animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-app" />
            <span>Formulating {selectedDomain} ({selectedMode}) response at {selectedDifficulty} level...</span>
          </div>
        )}

        {/* Retry Button */}
        {lastFailedQuery && !isLoading && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs text-red-600">
            <span>Failed to send: &quot;{lastFailedQuery.msg.slice(0, 40)}...&quot;</span>
            <button
              onClick={() => handleSendMessage(lastFailedQuery.msg)}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3.5 bg-surface rounded-2xl border border-theme shadow-subtle space-y-2.5"
      >
        {/* Collapsible Code Box */}
        {showCodeBox && (
          <div className="p-2.5 bg-canvas rounded-xl border border-theme space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-primary-app" />
                Paste Code / Error Trace to Debug or Review ({selectedLanguage}):
              </span>
              <button
                type="button"
                onClick={() => setShowCodeBox(false)}
                className="text-[10px] text-muted hover:text-ink cursor-pointer"
              >
                Hide Code Box
              </button>
            </div>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder={`Paste your ${selectedLanguage} code or query here...`}
              className="w-full bg-surface border border-theme rounded-lg p-2.5 font-mono text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary-app/40"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask about ${selectedDomain} in ${modes.find((m) => m.id === selectedMode)?.label} mode...`}
            className="flex-1 bg-canvas border border-theme rounded-xl px-4 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-app/40"
          />

          <button
            type="button"
            onClick={() => setShowCodeBox(!showCodeBox)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              showCodeBox || codeSnippet.trim()
                ? 'bg-surface-tint border-primary-app text-primary-app'
                : 'bg-canvas border-theme text-muted hover:text-ink'
            }`}
            title="Attach Code Snippet"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">{showCodeBox ? 'Code Open' : '+ Code'}</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || (!inputMessage.trim() && !codeSnippet.trim())}
            className="px-4 sm:px-5 py-2.5 bg-primary-app hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-subtle transition-opacity flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Tutor</span>
          </button>
        </div>
      </form>
    </div>
  );
};
