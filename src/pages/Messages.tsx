import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from "react-router-dom";
import { format, isToday, isYesterday } from 'date-fns';
import { MessageSquare, Send, User, Check, CheckCheck, Smile, Paperclip, Loader2 } from 'lucide-react';
// You may need to install these packages:
import Picker from 'emoji-picker-react'; // npm install emoji-picker-react

interface Contact {
  id: string;
  full_name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  online: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: 'text' | 'image' | 'file';
  file_url?: string;
}

export default function Messages() {
  const { user } = useAuth() || { user: null };
  const location = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get userId from URL
  const params = new URLSearchParams(location.search);
  const userId = params.get("userId");

  // Typing indicator logic (simplified)
  useEffect(() => {
    if (!selectedContact || !user) return;
    let typingTimeout: NodeJS.Timeout;
    if (typing) {
      supabase
        .from('typing')
        .upsert({ sender_id: user.id, receiver_id: selectedContact.id, typing: true });
      typingTimeout = setTimeout(() => setTyping(false), 2000);
    } else {
      supabase
        .from('typing')
        .upsert({ sender_id: user.id, receiver_id: selectedContact.id, typing: false });
    }
    return () => clearTimeout(typingTimeout);
  }, [typing, selectedContact, user]);

  useEffect(() => {
    if (!selectedContact || !user) return;
    const channel = supabase
      .channel('typing-indicator')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'typing' }, (payload) => {
        if (payload.new.sender_id === selectedContact.id && payload.new.receiver_id === user.id) {
          setIsTyping(payload.new.typing);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedContact, user]);

  // REMOVE THIS EFFECT (Effect 1)
  // useEffect(() => {
  //   if (userId && contacts.every(c => String(c.id) !== String(userId))) {
  //     (async () => {
  //       const { data: userData } = await supabase
  //         .from('users')
  //         .select('id, full_name, avatar_url')
  //         .eq('id', userId)
  //         .single();
  //       if (userData) {
  //         const newContact = {
  //           id: userData.id,
  //           full_name: userData.full_name || 'User',
  //           avatar_url: userData.avatar_url,
  //           last_message: 'No messages yet',
  //           last_message_time: new Date().toISOString(),
  //           unread_count: 0,
  //           online: false,
  //         };
  //         setContacts(prev => [newContact, ...prev]);
  //         setSelectedContact(newContact);
  //       }
  //     })();
  //   }
  // }, [userId, contacts]);

  // Effect 2: When contacts change, select user if present
  useEffect(() => {
    if (userId && contacts.length > 0) {
      const contact = contacts.find(c => String(c.id) === String(userId));
      if (contact) {
        setSelectedContact(contact);
      }
    }
  }, [userId, contacts]);

  // Fetch contacts (with search, online status)
  useEffect(() => {
    if (!user) return;
    const fetchContacts = async () => {
      setLoading(true);
      let contactsData: Contact[] = [];
      // ... your fetch logic here, populate contactsData ...
      
      // After fetching, check if userId is present in URL and not in contacts
      if (userId && contactsData.every(c => String(c.id) !== String(userId))) {
      // Try to fetch from users table
      let { data: userData } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', userId)
        .single();
      
      // If not found in users, try dealers table
      if (!userData) {
        const { data: dealerData } = await supabase
          .from('dealers')
          .select('id, full_name, avatar_url')
          .eq('id', userId)
          .single();
        userData = dealerData;
      }
      
      if (userData) {
        const newContact = {
          id: userData.id,
          full_name: userData.full_name || 'User',
          avatar_url: userData.avatar_url,
          last_message: 'No messages yet',
          last_message_time: new Date().toISOString(),
          unread_count: 0,
          online: false,
        };
        contactsData = [newContact, ...contactsData];
      }
    }
    setContacts(contactsData);
    
    // Select the contact if userId is present
    if (userId && contactsData.length > 0) {
      const contact = contactsData.find(c => String(c.id) === String(userId));
      if (contact) {
        setSelectedContact(contact);
      }
    }
    setLoading(false);
  };
    fetchContacts();
    // ... real-time subscription logic ...
  }, [user, userId]);

  // Fetch messages for selected contact (with infinite scroll)
  useEffect(() => {
    if (!user || !selectedContact) return;
    // ... fetch messages logic ...
  }, [user, selectedContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;
    // ... send message logic ...
    setNewMessage('');
    setShowEmoji(false);
    setFile(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user || !selectedContact) return;
    setUploading(true);
    const file = e.target.files[0];
    // ... upload logic to Supabase Storage ...
    setUploading(false);
  };

  const handleEmojiClick = (event: any, emojiObject: any) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900">
      {/* Contacts Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
            </div>
          ) : (
            contacts
              .filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()))
              .map(contact => (
                <div
                  key={contact.id}
                  className={`p-4 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedContact?.id === contact.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="relative">
                    {contact.avatar_url ? (
                      <img src={contact.avatar_url} alt={contact.full_name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                    {contact.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">{contact.full_name}</span>
                      <span className="text-xs text-gray-400">{formatMessageTime(contact.last_message_time)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.last_message}</span>
                      {contact.unread_count > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{contact.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="flex items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
              {selectedContact.avatar_url ? (
                <img src={selectedContact.avatar_url} alt={selectedContact.full_name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div className="ml-3">
                <div className="font-semibold text-gray-900 dark:text-white">{selectedContact.full_name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{selectedContact.online ? 'Online' : 'Offline'}</div>
                {isTyping && <div className="text-xs text-blue-500">Typing...</div>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Send a message to start the conversation
                  </p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-primary-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      {message.type === 'image' && message.file_url ? (
                        <img src={message.file_url} alt="attachment" className="max-w-xs rounded mb-2" />
                      ) : message.type === 'file' && message.file_url ? (
                        <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Download file</a>
                      ) : (
                        <p>{message.message}</p>
                      )}
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-70">
                          {format(new Date(message.created_at), 'h:mm a')}
                        </span>
                        {message.sender_id === user?.id && (
                          message.is_read
                            ? <CheckCheck className="w-3 h-3 opacity-70" />
                            : <Check className="w-3 h-3 opacity-70" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Message Input */}
            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
              <form
                className="flex items-center space-x-2"
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <button type="button" onClick={() => setShowEmoji(v => !v)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                  <Smile />
                </button>
                {showEmoji && (
                  <div className="absolute bottom-16 left-4 z-10">
                    <Picker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => {
                    setNewMessage(e.target.value);
                    setTyping(true);
                  }}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <label className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                  <Paperclip />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !file}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Your Messages
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Select a conversation from the list or start a new one to begin messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}