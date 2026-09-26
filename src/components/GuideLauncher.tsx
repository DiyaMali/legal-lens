'use client';

import { useState, useRef, useEffect, useId } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GuideResponse, GuideAllowedRoute } from '@/lib/schemas/guide';
import { GUIDE_DEFAULT_CHIPS } from '@/lib/guide/knowledge';
import { Sparkles, Send, X } from 'lucide-react';

interface Message {
  sender: 'user' | 'guide';
  text: string;
  action?: {
    type: 'NAVIGATE';
    route: GuideAllowedRoute;
    label: string;
  };
  chips?: string[];
}

export function GuideLauncher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'guide',
      text: 'Hi there! I am your Legal Lens Assistant. How can I help you navigate contracts, detect clause risks, or explore features today?',
      chips: GUIDE_DEFAULT_CHIPS,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        launcherButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll to bottom of message list on updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = (await response.json()) as GuideResponse & {
        error?: { code: string; message: string };
      };

      if (!response.ok || data.error) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'guide',
            text:
              data.error?.message ||
              'Sorry, I encountered an issue. Please try asking again!',
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'guide',
          text: data.reply,
          action: data.action,
          chips: data.suggestedChips,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'guide',
          text: 'Unable to connect to the guide service. Please check your network.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (route: GuideAllowedRoute) => {
    setIsOpen(false);
    router.push(route);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Mascot Launcher button with Peeking Mascot */}
      {!isOpen && (
        <div className="relative group">
          {/* Peeking Mascot Character from Above */}
          <div className="absolute -top-14 right-6 w-14 h-14 pointer-events-none transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-110 z-10 filter drop-shadow-lg rounded-full border-2 border-orange-500/40 bg-slate-900 p-1 overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/images/legal-guide-mascot.png"
                alt="Legal Lens Guide Peeking Mascot"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse shadow-sm" />
            </div>
          </div>

          <button
            ref={launcherButtonRef}
            type="button"
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            aria-expanded={false}
            aria-controls={panelId}
            aria-label="Open Legal Lens Guide chatbot"
            className="flex items-center gap-2.5 rounded-full bg-slate-900/95 hover:bg-slate-900 backdrop-blur-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            <div className="flex flex-col text-left">
              <span className="leading-tight font-bold flex items-center gap-1.5 text-[13px]">
                <span>Legal Guide</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </span>
              <span className="text-[10px] text-slate-300 dark:text-slate-500 font-medium">
                App helper &amp; FAQ assistant
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Guide Panel Dialog with Peeking Mascot Header */}
      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Legal Lens Guide Chatbot"
          className="relative flex h-[540px] w-[360px] sm:w-[415px] flex-col rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 overflow-visible animate-in fade-in zoom-in-95 duration-150 mt-12"
        >
          {/* Peeking Mascot on Top of Dialog */}
          <div className="absolute -top-12 left-6 w-14 h-14 pointer-events-none drop-shadow-xl z-20 transition-transform hover:scale-105 rounded-full border-2 border-orange-500/40 bg-slate-900 p-1 overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src="/images/legal-guide-mascot.png"
                alt="Legal Lens Mascot Guide"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
            </div>
          </div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50/80 via-amber-50/40 to-white px-5 py-3.5 dark:border-slate-800 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900 rounded-t-3xl">
            <div className="flex items-center gap-2 pl-14">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Legal Lens Guide</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/20">AI Mascot</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  App helper &amp; FAQ assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                launcherButtonRef.current?.focus();
              }}
              aria-label="Close guide"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 focus:outline-none dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start items-start'
                }`}
              >
                {/* Guide Mascot Avatar for responses */}
                {m.sender === 'guide' && (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-orange-50/80 border border-orange-200/60 dark:border-slate-700 dark:bg-slate-800 shadow-2xs flex-shrink-0 mt-0.5">
                    <Image
                      src="/images/legal-guide-mascot.png"
                      alt="Guide"
                      fill
                      sizes="28px"
                      className="object-contain p-0.5"
                    />
                  </div>
                )}

                <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} max-w-[82%]`}>
                  <div
                    className={`rounded-2xl px-4 py-3 leading-relaxed shadow-2xs ${
                      m.sender === 'user'
                        ? 'bg-orange-600 text-white dark:bg-orange-500'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Nav Action Button */}
                  {(() => {
                    const action = m.action;
                    if (!action) return null;
                    return (
                      <button
                        type="button"
                        onClick={() => handleActionClick(action.route)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 border border-orange-200/60 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800 transition-colors cursor-pointer"
                      >
                        <span>{action.label}</span>
                        <span>→</span>
                      </button>
                    );
                  })()}

                  {/* Suggested Chips */}
                  {m.chips && m.chips.length > 0 && i === messages.length - 1 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-9 animate-pulse">
                <span>Mascot is researching your query…</span>
              </div>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="border-t border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about using Legal Lens, clauses, diffs..."
                maxLength={200}
                disabled={isLoading}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer flex-shrink-0 dark:bg-orange-500 dark:hover:bg-orange-600"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
