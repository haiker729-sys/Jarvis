import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Volume2, Copy, Check, Edit2, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { AppTheme, ChatTurn, PersonaType } from '../types';

interface ChatViewProps {
  messages: ChatTurn[];
  theme: AppTheme;
  persona: PersonaType;
  userName: string;
  isGenerating: boolean;
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  onSpeakMessage: (text: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  theme,
  persona,
  userName,
  isGenerating,
  onSendMessage,
  onClearHistory,
  onSpeakMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditUserMessage = (text: string) => {
    setInputText(text);
  };

  const isDark = theme === 'dark' || theme === 'red' || theme === 'sunset';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden pb-24">
      {/* Top Header for Chat */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Interactive Stream</h2>
            <p className="text-[10px] text-slate-400 font-mono">
              {persona} • Connected
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1.5"
          title="Start New Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Mode Chips bar (from fragment_chat.xml) */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-b border-white/5 text-[11px]">
        <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-medium">
          {persona} Active
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-medium">
          Mode: Code & Assistant
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-medium">
          Gemini Multimodal
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">
                Awaiting your instructions, {userName || 'Sir'}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Speak via the microphone or type below. Try commands like "Play song on YouTube", "Remember that...", or ask any question.
              </p>
            </div>
          </div>
        ) : (
          messages.map((turn) => (
            <div key={turn.id} className="space-y-3">
              {/* User Message */}
              <div className="flex justify-end items-end gap-2 group">
                <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl rounded-br-none text-sm break-words shadow-md ${
                      theme === 'sunset'
                        ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white'
                        : theme === 'red'
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white'
                        : theme === 'light'
                        ? 'bg-blue-600 text-white'
                        : 'bg-cyan-600 text-white'
                    }`}
                  >
                    {turn.userTranscript}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => handleEditUserMessage(turn.userTranscript)}
                      className="p-1 hover:text-white transition-colors"
                      title="Edit this query"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Assistant Message */}
              <div className="flex justify-start items-start gap-2 group">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs mt-1 flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
                  <div
                    className={`px-4 py-3 rounded-2xl rounded-tl-none text-sm break-words border backdrop-blur-md shadow-sm ${
                      isDark
                        ? 'bg-slate-900/70 border-slate-700/60 text-slate-200'
                        : 'bg-white/90 border-slate-200 text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {turn.jarvisResponse}
                    </p>

                    {turn.commandExecuted && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Task: {turn.commandExecuted}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => onSpeakMessage(turn.jarvisResponse)}
                      className="p-1 hover:text-white transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(turn.id, turn.jarvisResponse)}
                      className="p-1 hover:text-white transition-colors"
                      title="Copy message"
                    >
                      {copiedId === turn.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-white/10 backdrop-blur-xl bg-black/20 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Instruct ${persona}...`}
          className={`flex-1 px-4 py-2.5 rounded-2xl text-sm border outline-none transition-all ${
            isDark
              ? 'bg-slate-900/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-cyan-500'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
          }`}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isGenerating}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40 ${
            theme === 'sunset'
              ? 'bg-orange-500 hover:bg-orange-400'
              : theme === 'red'
              ? 'bg-rose-500 hover:bg-rose-400'
              : theme === 'light'
              ? 'bg-blue-600 hover:bg-blue-500'
              : 'bg-cyan-500 hover:bg-cyan-400'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
