import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an auth context
import { format, isToday, isYesterday } from 'date-fns';
import { useLocation } from "react-router-dom";

interface Contact {
  id: string;
  full_name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Messages() {
  const { user } = useAuth() || { user: null };
  const location = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse dealerId from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dealerId = params.get("dealerId");
    if (dealerId && contacts.length > 0) {
      const dealerContact = contacts.find((c) => c.id === dealerId);
      if (dealerContact) {
        setSelectedContact(dealerContact);
      } else {
        // If dealer is not in contacts, fetch their info and add as contact
        (async () => {
          const { data: userData } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', dealerId)
            .single();
          if (userData) {
            setContacts((prev) => [
              {
                id: userData.id,
                full_name: userData.full_name || 'Dealer',
                avatar_url: userData.avatar_url,
                last_message: 'No messages yet',
                last_message_time: new Date().toISOString(),
                unread_count: 0,
              },
              ...prev,
            ]);
            setSelectedContact({
              id: userData.id,
              full_name: userData.full_name || 'Dealer',
              avatar_url: userData.avatar_url,
              last_message: 'No messages yet',
              last_message_time: new Date().toISOString(),
              unread_count: 0,
            });
          }
        })();
      }
    }
  }, [location.search, contacts]);
  
  // Fetch contacts
  useEffect(() => {
    if (!user) return;
    
    const fetchContacts = async () => {
      setLoading(true);
      
      // Get all conversations where the current user is involved
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('receiver_id, created_at, message, is_read')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });
        
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id, created_at, message, is_read')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
        
      if (sentError || receivedError) {
        console.error('Error fetching messages:', sentError || receivedError);
        setLoading(false);
        return;
      }
      
      // Combine and get unique contacts
      const contactIds = new Set();
      if (sentMessages) {
        sentMessages.forEach(msg => contactIds.add(msg.receiver_id));
      }
      if (receivedMessages) {
        receivedMessages.forEach(msg => contactIds.add(msg.sender_id));
      }
      
      // Fetch contact details and last messages
      const contactsData: Contact[] = [];
      
      for (const contactId of contactIds) {
        // Get user details
        const { data: userData } = await supabase
          .from('users')
          .select('id, full_name, avatar_url')
          .eq('id', contactId)
          .single();
          
        if (!userData) continue;
        
        // Get last message
        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('message, created_at, is_read, sender_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('sender_id', contactId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
          
        contactsData.push({
          id: userData.id,
          full_name: userData.full_name || 'Unknown User',
          avatar_url: userData.avatar_url,
          last_message: lastMessageData?.message || 'No messages yet',
          last_message_time: lastMessageData?.created_at || new Date().toISOString(),
          unread_count: unreadCount || 0
        });
      }
      
      // Sort by last message time
      contactsData.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );
      
      setContacts(contactsData);
      
      // Select first contact if available and none selected
      if (contactsData.length > 0 && !selectedContact) {
        setSelectedContact(contactsData[0]);
      }
      
      setLoading(false);
    };
    
    fetchContacts();
    
    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, 
        () => {
          fetchContacts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [user]);
  
  // Fetch messages for selected contact
  useEffect(() => {
    if (!user || !selectedContact) return;
    
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      
      setMessages(data || []);
      
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', selectedContact.id)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
        
      // Update unread count in contacts
      setContacts(prev => 
        prev.map(contact => 
          contact.id === selectedContact.id 
            ? { ...contact, unread_count: 0 } 
            : contact
        )
      );
    };
    
    fetchMessages();
    
    // Set up real-time subscription for this conversation
    const conversationSubscription = supabase
      .channel(`conversation-${selectedContact.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${selectedContact.id}),and(sender_id=eq.${selectedContact.id},receiver_id=eq.${user.id}))`
        }, 
        (payload) => {
          // Add new message to the list
          setMessages(prev => [...prev, payload.new as Message]);
          
          // Mark as read if received
          if (payload.new.sender_id === selectedContact.id && payload.new.receiver_id === user.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', payload.new.id);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(conversationSubscription);
    };
  }, [user, selectedContact]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;
    
    const message = {
      sender_id: user.id,
      receiver_id: selectedContact.id,
      message: newMessage.trim(),
      is_read: false
    };
    
    const { error } = await supabase
      .from('messages')
      .insert(message);
      
    if (error) {
      console.error('Error sending message:', error);
      return;
    }
    
    setNewMessage('');
  };
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Messages
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-12rem)]">
          {/* Contacts List */}
          <div className="border-r dark:border-gray-700 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
              </div>
            ) : (
              contacts.map(contact => (
                <div 
                  key={contact.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 ${
                    selectedContact?.id === contact.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 relative">
                      {contact.avatar_url ? (
                        <img 
                          src={contact.avatar_url} 
                          alt={contact.full_name} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                      {contact.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {contact.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {contact.full_name}
                      </p>
                      <p className={`text-sm truncate ${
                        contact.unread_count > 0 
                          ? 'text-gray-900 dark:text-white font-medium' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {contact.last_message}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatMessageTime(contact.last_message_time)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="col-span-2 flex flex-col">
            {selectedContact ? (
              <>
                <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-3">
                  {selectedContact.avatar_url ? (
                    <img 
                      src={selectedContact.avatar_url} 
                      alt={selectedContact.full_name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedContact.full_name}
                    </h2>
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
                          <p>{message.message}</p>
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

                <div className="p-4 border-t dark:border-gray-700">
                  <form 
                    className="flex space-x-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
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
      </div>
    </div>
  );
}