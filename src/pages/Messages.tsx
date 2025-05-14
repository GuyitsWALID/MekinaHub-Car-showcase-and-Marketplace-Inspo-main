import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  MessageSquare,
  Send,
  User as UserIcon,
  Check,
  CheckCircle,
  Paperclip,
  Loader2,
  Smile,
} from 'lucide-react';
import Picker from 'emoji-picker-react';

interface Contact {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  dealer_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: 'text' | 'image' | 'file';
  file_url: string | null;
}

export default function Messages() {
  const auth = useAuth();
  if (!auth || !auth.user) {
    // If not logged in, redirect to login (or render nothing)
    return <Navigate to="/auth" replace />;
  }
  const user = auth.user;
  const location = useLocation();
  const dealerId = new URLSearchParams(location.search).get('dealerId');

  const [contact, setContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!dealerId) return;
    (async () => {
      // Load contact
      let { data: u } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', dealerId)
        .single();
      if (!u) {
        const { data: d } = await supabase
          .from('dealers')
          .select('id, company_name, logo_url')
          .eq('id', dealerId)
          .single();
        if (d) {
          u = { id: d.id, full_name: d.company_name, avatar_url: d.logo_url };
        }
      }
      if (u) {
        setContact({
          id: u.id,
          name: u.full_name,
          avatar_url: u.avatar_url,
        });
      }

      // Load thread
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${dealerId}),and(sender_id.eq.${dealerId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
      setMessages(msgs ?? []);
    })();
  }, [dealerId, user.id]);

  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || !dealerId) return;
    let file_url: string | null = null;
    let type: Message['type'] = 'text';

    if (file) {
      setUploading(true);
      const path = `messages/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage
        .from('messages')
        .upload(path, file);
      if (!upErr) {
        const { data } = supabase.storage
          .from('messages')
          .getPublicUrl(path);
        file_url = data.publicUrl;
        type = file.type.startsWith('image/') ? 'image' : 'file';
      }
      setUploading(false);
    }

    await supabase.from('messages').insert({
      sender_id:   user.id,
      receiver_id: dealerId,
      dealer_id:   dealerId,
      message:     newMessage,
      is_read:     false,
      type,
      file_url,
    });

    setNewMessage('');
    setFile(null);
  };

  const onEmojiClick = (_: any, emoji: any) => {
    setNewMessage(m => m + emoji.emoji);
  };

  if (!contact) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-700">
        <div className="p-4 flex items-center">
          {contact.avatar_url ? (
            <img src={contact.avatar_url} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <UserIcon className="text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <div className="ml-3">
            <div className="font-semibold dark:text-white">{contact.name}</div>
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
              <MessageSquare className="mx-auto mb-2 w-12 h-12" />
              No messages yet.
            </div>
          ) : (
            messages.map(m => (
              <div
                key={m.id}
                className={`mb-4 flex ${
                  m.sender_id === user.id ? 'justify-end' : ''
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    m.sender_id === user.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-700 dark:text-white'
                  }`}
                >
                  {m.type === 'text' && <div>{m.message}</div>}
                  {(m.type === 'image' || m.type === 'file') && m.file_url && (
                    m.type === 'image' ? (
                      <img src={m.file_url} className="max-w-xs rounded" />
                    ) : (
                      <a
                        href={m.file_url}
                        target="_blank"
                        className="text-blue-500 dark:text-blue-400 underline"
                      >
                        Download file
                      </a>
                    )
                  )}
                  <div className="text-xs mt-1 text-right opacity-60 flex items-center justify-end">
                    <span>{format(new Date(m.created_at), 'h:mm a')}</span>
                    {m.sender_id === user.id && (
                      <span className="ml-1">
                        {m.is_read ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Check size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-700 flex items-center space-x-2 relative">
          <button onClick={() => setShowEmoji(v => !v)} className="text-gray-600 dark:text-gray-300">
            <Smile />
          </button>
          {showEmoji && (
            <div className="absolute bottom-full left-0 z-30">
              <Picker 
                onEmojiClick={(emojiObject: any) => {
                  setNewMessage(prev => prev + emojiObject.emoji);
                  setShowEmoji(false);
                }}
              />
            </div>
          )}
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 border dark:border-slate-600 rounded px-3 py-2 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400"
          />
          <label className="cursor-pointer text-gray-600 dark:text-gray-300">
            <Paperclip />
            <input
              type="file"
              className="hidden"
              onChange={e => e.target.files && setFile(e.target.files[0])}
            />
          </label>
          <button
            onClick={sendMessage}
            disabled={!newMessage && !file}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Send />}
          </button>
        </div>
      </main>
    </div>
  );
}
