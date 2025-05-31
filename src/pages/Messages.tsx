// src/pages/Messages.tsx

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
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
  AlertTriangle,
} from 'lucide-react';
import Picker from 'emoji-picker-react';
import type { Contact, Message } from '../types';

interface Conversation {
  dealerId: string;
  buyerId: string;
  displayName: string;
  avatarUrl: string | null;
}

export default function Messages() {
  const auth = useAuth();
  if (!auth || !auth.user) {
    return <Navigate to="/auth" replace />;
  }
  const user = auth.user;

  // 1) Determine if current user is a dealer, and fetch myDealerId if so
  const [myDealerId, setMyDealerId] = useState<string | null>(null);
  const [dealerError, setDealerError] = useState<string | null>(null);

  // 2) Sidebar: list of all conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);

  // 3) Which conversation is currently selected?
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // 4) Chat‐thread state
  const [contact, setContact] = useState<Contact | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  //
  // STEP 1: Fetch myDealerId (if I exist in dealers.user_id)
  //
  useEffect(() => {
    (async () => {
      try {
        const { data: dealerRow, error } = await supabase
          .from('dealers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching dealer record:', error);
          setDealerError('Failed to identify dealer.');
        } else if (dealerRow) {
          setMyDealerId(dealerRow.id);
        } else {
          setMyDealerId(null); // This user is a buyer
        }
      } catch (err) {
        console.error('Unexpected error fetching dealer record:', err);
        setDealerError('Unexpected error.');
      }
    })();
  }, [user.id]);

  //
  // STEP 2: Build the “conversations” array once we know myDealerId (buyer vs. dealer).
  //
  useEffect(() => {
    // Wait until we know whether we’re a dealer or buyer
    // (i.e. wait until myDealerId is either a string or explicitly null)
    if (myDealerId === undefined) return;

    setLoadingConversations(true);
    (async () => {
      try {
        if (myDealerId) {
          // ======== DEALER MODE ========
          // 1) Find all distinct buyer IDs from messages where dealer_id = myDealerId
          const { data: dealerMsgs, error: dmError } = await supabase
            .from('messages')
            .select('sender_id')
            .eq('dealer_id', myDealerId);

          if (dmError) {
            console.error('Error fetching dealer conversation IDs:', dmError);
            setConversationsError('Failed to load conversations.');
            setConversations([]);
            setLoadingConversations(false);
            return;
          }

          const buyerIds = Array.from(
            new Set((dealerMsgs ?? []).map((row: any) => row.sender_id))
          );
          if (buyerIds.length === 0) {
            setConversations([]);
            setConversationsError(null);
            setLoadingConversations(false);
            return;
          }

          // 2) Fetch each buyer’s profile (full_name + avatar_url)
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .in('id', buyerIds);

          if (usersError) {
            console.error('Error fetching buyer info:', usersError);
            setConversationsError('Failed to load buyer info.');
            setConversations([]);
          } else {
            const convs: Conversation[] = (users ?? []).map((u: any) => ({
              dealerId: myDealerId,
              buyerId: u.id,
              displayName: u.full_name,
              avatarUrl: u.avatar_url,
            }));
            setConversations(convs);
            setConversationsError(null);
          }
        } else {
          // ======== BUYER MODE ========
          // 1) Find all distinct dealer IDs from messages where I (buyer) participated
          const { data: userMsgs, error: userMsgsError } = await supabase
            .from('messages')
            .select('dealer_id, sender_id, receiver_id')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

          if (userMsgsError) {
            console.error('Error fetching user messages:', userMsgsError);
            setConversationsError('Failed to load conversations.');
            setConversations([]);
            setLoadingConversations(false);
            return;
          }

          const dealerIdsSet = new Set<string>();
          (userMsgs ?? []).forEach((row: any) => {
            if (
              row.dealer_id &&
              (row.sender_id === user.id || row.receiver_id === user.id)
            ) {
              dealerIdsSet.add(row.dealer_id);
            }
          });
          const filteredDealerIds = Array.from(dealerIdsSet);

          if (filteredDealerIds.length === 0) {
            setConversations([]);
            setConversationsError(null);
            setLoadingConversations(false);
            return;
          }

          // 2) Fetch each dealer’s profile (company_name + logo_url)
          const { data: dealers, error: dealersError } = await supabase
            .from('dealers')
            .select('id, company_name, logo_url')
            .in('id', filteredDealerIds);

          if (dealersError) {
            console.error('Error fetching dealer info:', dealersError);
            setConversationsError('Failed to load dealer info.');
            setConversations([]);
          } else {
            const convs: Conversation[] = (dealers ?? []).map((d: any) => ({
              dealerId: d.id,
              buyerId: user.id,
              displayName: d.company_name,
              avatarUrl: d.logo_url,
            }));
            setConversations(convs);
            setConversationsError(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error loading conversations:', err);
        setConversationsError('An unexpected error occurred.');
        setConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    })();
  }, [myDealerId, user.id]);

  //
  // STEP 3: Whenever “selectedConversation” changes, load its messages & mark unread
  //
  useEffect(() => {
    if (!selectedConversation) {
      setContact(null);
      setContactError(null);
      setMessages([]);
      setMessagesError(null);
      return;
    }

    const { dealerId, buyerId } = selectedConversation;
    let chatSubscription: any = null;

    (async () => {
      // a) Fetch “other party” contact info for display at top of chat
      if (myDealerId && buyerId) {
        // Dealer is chatting with a buyer → fetch buyer’s user row
        try {
          const { data: u, error: userError } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', buyerId)
            .single();
          if (userError) {
            console.error('Error loading buyer contact:', userError);
            setContact(null);
            setContactError('Failed to load buyer info.');
          } else if (u) {
            setContact({ id: u.id, name: u.full_name, avatar_url: u.avatar_url });
            setContactError(null);
          }
        } catch (err) {
          console.error('Unexpected error loading buyer info:', err);
          setContact(null);
          setContactError('Unexpected error.');
        }
      } else if (dealerId) {
        // Buyer is chatting with a dealer → fetch dealer’s row
        try {
          const { data: d, error: dealerErrorFetch } = await supabase
            .from('dealers')
            .select('id, company_name, logo_url')
            .eq('id', dealerId)
            .single();
          if (dealerErrorFetch) {
            console.error('Error loading dealer contact:', dealerErrorFetch);
            setContact(null);
            setContactError('Failed to load dealer info.');
          } else if (d) {
            setContact({ id: d.id, name: d.company_name, avatar_url: d.logo_url });
            setContactError(null);
          }
        } catch (err) {
          console.error('Unexpected error loading dealer info:', err);
          setContact(null);
          setContactError('Unexpected error.');
        }
      }

      // b) Fetch all messages (ascending) between dealerId & buyerId, then mark unread as read
      try {
        // Build filter: all messages where dealer_id = dealerId AND (sender_id = buyerId OR receiver_id = buyerId)
        const filterClause = `and(dealer_id.eq.${dealerId},or(sender_id.eq.${buyerId},receiver_id.eq.${buyerId}))`;

        const { data: msgs, error: selectError } = await supabase
          .from('messages')
          .select('*')
          .or(filterClause)
          .order('created_at', { ascending: true });

        if (selectError) {
          console.error('Error loading messages:', selectError);
          setMessagesError('Failed to load messages.');
        } else {
          setMessages(msgs ?? []);
          setMessagesError(null);

          // Immediately mark “unread” (where receiver_id === currentUser.id) as read
          const unreadIds =
            (msgs ?? [])
              .filter(
                (m: Message) =>
                  !m.is_read && m.receiver_id === user.id && m.dealer_id === dealerId
              )
              .map((m: Message) => m.id) ?? [];

          if (unreadIds.length > 0) {
            const { error: updateError } = await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', unreadIds);

            if (updateError) {
              console.error('Error marking messages read:', updateError);
            }
          }
        }
      } catch (err) {
        console.error('Unexpected error loading messages:', err);
        setMessagesError('Unexpected error.');
      }

      // c) Subscribe to new incoming messages where (dealer_id=dealerId AND receiver_id = me)
      try {
        chatSubscription = supabase
          .channel(`messages-thread-${dealerId}-${buyerId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `dealer_id=eq.${dealerId},receiver_id=eq.${user.id}`,
            },
            async (payload) => {
              const newMsg = payload.new as Message;
              setMessages((prev) => {
                if (prev.find((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              // Mark that new message “read” if I—its receiver—am viewing
              if (newMsg.receiver_id === user.id && !newMsg.is_read) {
                const { error: markError } = await supabase
                  .from('messages')
                  .update({ is_read: true })
                  .eq('id', newMsg.id);
                if (markError) {
                  console.error('Error marking new message read:', markError);
                }
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up real-time subscription:', err);
      }
    })();

    // Cleanup when unmounting or switching conversations
    return () => {
      if (chatSubscription) {
        supabase.removeChannel(chatSubscription);
      }
      setMessages([]);
      setContact(null);
      setContactError(null);
      setMessagesError(null);
    };
  }, [selectedConversation, myDealerId, user.id]);

  //
  // STEP 4: sendMessage() inserts a new row, then appends it to local state
  //
  const sendMessage = async () => {
    if (!selectedConversation) return;
    const { dealerId, buyerId } = selectedConversation;
    const isDealer = Boolean(myDealerId);

    if (!dealerId || !buyerId || (!newMessage.trim() && !file)) {
      return;
    }

    let file_url: string | null = null;
    let type: Message['type'] = 'text';

    if (file) {
      setUploading(true);
      try {
        const path = `messages/${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage
          .from('messages')
          .upload(path, file);
        if (upErr) {
          console.error('File upload error:', upErr);
        } else {
          const { data: urlData } = supabase.storage
            .from('messages')
            .getPublicUrl(path);
          if (urlData && urlData.publicUrl) {
            file_url = urlData.publicUrl;
            type = file.type.startsWith('image/') ? 'image' : 'file';
          } else {
            console.error('Failed to obtain public URL.');
          }
        }
      } catch (err) {
        console.error('Unexpected file upload error:', err);
      } finally {
        setUploading(false);
      }
    }

    try {
      const { data: inserted, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: isDealer ? buyerId : dealerId,
          dealer_id: dealerId,
          message: newMessage,
          is_read: false,
          type,
          file_url,
        })
        .select('*')
        .single();
      if (insertError) {
        console.error('Error inserting message:', insertError);
      } else if (inserted) {
        setMessages((prev) => [...prev, inserted]);
      }
    } catch (err) {
      console.error('Unexpected insert error:', err);
    }

    setNewMessage('');
    setFile(null);
  };

  const onEmojiClick = (emojiData: any, _event: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  //
  // Render: Sidebar (Conversation List) & Chat Panel
  //
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-700 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold dark:text-white mb-4">Conversations</h2>
        {loadingConversations ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : conversationsError ? (
          <div className="text-red-500">{conversationsError}</div>
        ) : conversations.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No conversations yet.</div>
        ) : (
          <ul>
            {conversations.map((conv) => {
              const isActive =
                selectedConversation &&
                selectedConversation.dealerId === conv.dealerId &&
                selectedConversation.buyerId === conv.buyerId;
              return (
                <li
                  key={`${conv.dealerId}-${conv.buyerId}`}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-center p-2 mb-2 rounded cursor-pointer ${
                    isActive
                      ? 'bg-blue-200 dark:bg-blue-700'
                      : 'hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {conv.avatarUrl ? (
                    <img
                      src={conv.avatarUrl}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="ml-3 dark:text-white">{conv.displayName}</span>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">
              Select a conversation to view messages.
            </div>
          </div>
        ) : contactError ? (
          <div className="h-full flex flex-col items-center justify-center text-red-500">
            <AlertTriangle className="w-12 h-12 mb-2" />
            <p>{contactError}</p>
          </div>
        ) : !contact ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-700">
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
                  className="w-10 h-10 rounded-full"
                  alt="avatar"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <UserIcon className="text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div className="ml-3">
                <div className="font-semibold dark:text-white">{contact.name}</div>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-slate-800">
              {messagesError && (
                <div className="text-center text-red-500 mb-4">{messagesError}</div>
              )}
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                  <MessageSquare className="mx-auto mb-2 w-12 h-12" />
                  No messages yet.
                </div>
              ) : (
                messages.map((m) => (
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
                          <img
                            src={m.file_url}
                            className="max-w-xs rounded"
                            alt="media"
                          />
                        ) : (
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
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

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-700 flex items-center space-x-2 relative">
              <button
                onClick={() => setShowEmoji((v) => !v)}
                className="text-gray-600 dark:text-gray-300"
                aria-label="Toggle emoji picker"
              >
                <Smile />
              </button>
              {showEmoji && (
                <div className="absolute bottom-full left-0 z-30">
                  <Picker onEmojiClick={onEmojiClick} />
                </div>
              )}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 border dark:border-slate-600 rounded px-3 py-2 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400"
              />
              <label className="cursor-pointer text-gray-600 dark:text-gray-300">
                <Paperclip />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
              <button
                onClick={sendMessage}
                disabled={(!newMessage.trim() && !file) || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                aria-label="Send message"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Send />}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
