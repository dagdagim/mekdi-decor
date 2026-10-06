'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_MESSAGES } from '@/lib/data/mock-db';
import { MessageItem, EventRequestPayload } from '@/lib/types';
import {
  MessageSquare,
  Send,
  User,
  CheckCheck,
  FileText,
  Phone,
  Paperclip,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';

interface ThreadItem {
  id: string;
  clientName: string;
  title: string;
  venue?: string;
  phone?: string;
  quoteId?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('e-108');
  const [newInput, setNewInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchMessagesAndThreads = async () => {
    setIsLoading(true);
    try {
      const [msgRes, reqRes] = await Promise.all([
        fetch('/api/messages'),
        fetch('/api/event-requests'),
      ]);
      const msgData = await msgRes.json();
      const reqData = await reqRes.json();

      const allMsgs: MessageItem[] = msgData.success && Array.isArray(msgData.data) ? msgData.data : INITIAL_MESSAGES;
      setMessages(allMsgs);

      // Build threads from messages and event requests
      const threadMap = new Map<string, ThreadItem>();

      // Base default threads
      threadMap.set('e-108', {
        id: 'e-108',
        clientName: 'Sara Tekle',
        title: "Sarah's Wedding (Hawassa)",
        venue: 'Skyline Event Hall, Hawassa',
        phone: '+251 922 334 455',
        quoteId: 'MD-QT-2026-108',
        lastMessage: 'Regarding stage drape colors and floral arch',
        lastTimestamp: new Date().toISOString(),
        unreadCount: 0,
      });

      threadMap.set('e-109', {
        id: 'e-109',
        clientName: 'Michael Kebede',
        title: '30th Birthday Gala',
        venue: 'Home Venue / Villa Compound',
        phone: '+251 911 234 567',
        lastMessage: 'Can we adjust the neon typography sign?',
        lastTimestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        unreadCount: 1,
      });

      // Add threads from live event requests
      if (reqData.success && Array.isArray(reqData.data)) {
        reqData.data.forEach((r: EventRequestPayload) => {
          const tId = r.id || r.requestNumber || `e-${r.guestName}`;
          if (!threadMap.has(tId)) {
            threadMap.set(tId, {
              id: tId,
              clientName: r.guestName,
              title: `${r.eventType} In-App Inquiry`,
              venue: r.venueName || r.venueType || 'Hawassa Venue',
              phone: r.guestPhone,
              lastMessage: r.specialNotes || `Inquiry for ${r.guestCount} guests decoration`,
              lastTimestamp: r.createdAt || new Date().toISOString(),
              unreadCount: 0,
            });
          }
        });
      }

      // Update thread lastMessage from actual database messages
      allMsgs.forEach((m) => {
        const existing = threadMap.get(m.eventId);
        if (existing) {
          existing.lastMessage = m.content;
          existing.lastTimestamp = m.timestamp;
        } else {
          threadMap.set(m.eventId, {
            id: m.eventId,
            clientName: m.senderName,
            title: `Event Inquiries (${m.eventId})`,
            lastMessage: m.content,
            lastTimestamp: m.timestamp,
            unreadCount: 0,
          });
        }
      });

      const threadList = Array.from(threadMap.values());
      setThreads(threadList);
      if (!threadMap.has(activeThreadId) && threadList.length > 0) {
        setActiveThreadId(threadList[0].id);
      }
    } catch (e) {
      console.warn('Could not fetch messages/threads:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesAndThreads();
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || {
    id: 'e-108',
    clientName: 'Sara Tekle',
    title: "Sarah's Wedding (Hawassa)",
    venue: 'Skyline Event Hall, Hawassa',
    phone: '+251 922 334 455',
    quoteId: 'MD-QT-2026-108',
  };

  // Filter messages for active thread (or show general if none match)
  const threadMessages = messages.filter(
    (m) => m.eventId === activeThreadId || (!messages.some((x) => x.eventId === activeThreadId) && m.eventId === 'e-108')
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInput.trim()) return;

    const newMessage: MessageItem = {
      id: `msg-${Date.now()}`,
      eventId: activeThreadId,
      senderName: 'Mekdes Tadesse (Admin)',
      senderRole: 'ADMIN',
      content: newInput,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setNewInput('');

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeThreadId,
          senderName: 'Mekdes Tadesse (Admin)',
          senderRole: 'ADMIN',
          content: newMessage.content,
        }),
      });
    } catch (err) {
      console.error('Error posting message:', err);
    }
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
            Client In-App Messaging & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Real-time event threads with clients, intake inquiries, and quote clarifications from database.
          </p>
        </div>

        <button
          onClick={fetchMessagesAndThreads}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-cream-300 text-charcoal-700 hover:text-burgundy-900 hover:bg-cream-100 transition-colors w-fit shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-burgundy-900' : ''}`} />
          <span>Refresh Threads</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-cream-200 shadow-card overflow-hidden h-[680px]">
        {/* Thread Sidebar (4 cols) */}
        <div className="lg:col-span-4 border-r border-cream-200 flex flex-col justify-between">
          <div className="p-3.5 border-b border-cream-200 bg-cream-50/50 space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-charcoal-700 block">
              Active Conversations & Inquiries ({threads.length})
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search threads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-cream-300 bg-white text-xs text-charcoal-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-cream-100">
            {filteredThreads.map((thread) => {
              const isSelected = thread.id === activeThreadId;
              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cream-100/70 border-l-4 border-burgundy-900'
                      : 'hover:bg-cream-50/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-editorial text-sm font-bold text-charcoal-900 truncate">
                      {thread.clientName}
                    </span>
                    <span className="text-[10px] text-charcoal-400 shrink-0">
                      {new Date(thread.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-xs text-burgundy-900 font-medium block truncate">
                    {thread.title}
                  </span>
                  <p className="text-xs text-charcoal-500 truncate mt-1">
                    {thread.lastMessage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Thread Container (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full bg-cream-50/30">
          {/* Thread Header */}
          <div className="p-4 border-b border-cream-200 bg-white flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-base font-bold text-charcoal-900">
                {activeThread.clientName} — {activeThread.title}
              </h3>
              <span className="text-xs text-charcoal-500">
                {activeThread.venue || 'Mekdi Decor Inquiry'}{' '}
                {activeThread.quoteId ? `• Quote ${activeThread.quoteId}` : ''}
              </span>
            </div>

            {activeThread.phone && (
              <a
                href={`tel:${activeThread.phone}`}
                className="p-2 rounded-xl bg-cream-100 text-charcoal-700 hover:text-burgundy-900 hover:bg-cream-200 transition-colors"
                title={`Call ${activeThread.clientName}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Messages Feed */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {threadMessages.length === 0 ? (
              <div className="py-20 text-center text-charcoal-400 text-xs font-light">
                No previous messages in this inquiry thread. Send the first response below.
              </div>
            ) : (
              threadMessages.map((m) => {
                const isAdmin = m.senderRole === 'ADMIN';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-charcoal-400 mb-1 px-1">
                      {m.senderName}
                    </span>
                    <div
                      className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed shadow-xs ${
                        isAdmin
                          ? 'bg-burgundy-900 text-cream-50 rounded-br-none'
                          : 'bg-white text-charcoal-800 border border-cream-200 rounded-bl-none'
                      }`}
                    >
                      {m.content}
                      {m.quoteReferenceId && (
                        <div className="mt-2 pt-2 border-t border-cream-50/20">
                          <Link
                            href={`/quotes/${m.quoteReferenceId}`}
                            className="inline-flex items-center gap-1 text-[11px] text-gold-300 font-semibold underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Quote {m.quoteReferenceId}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-charcoal-400 mt-1 px-1">
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isAdmin && <CheckCheck className="w-3 h-3 text-gold-600" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-cream-200 bg-white flex items-center gap-3"
          >
            <input
              type="text"
              placeholder={`Reply to ${activeThread.clientName} regarding decor scope, venue logistics, or invoice...`}
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
            />
            <button
              type="submit"
              className="p-2.5 rounded-2xl bg-burgundy-900 text-gold-300 hover:bg-burgundy-800 transition-colors cursor-pointer shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
