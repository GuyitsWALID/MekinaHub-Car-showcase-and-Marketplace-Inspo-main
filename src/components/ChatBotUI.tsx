'use client';

import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Cross1Icon, ChatBubbleIcon, PersonIcon, RocketIcon } from '@radix-ui/react-icons';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) setMessages(JSON.parse(storedMessages));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.trim().toLowerCase() === '/clean') {
      localStorage.removeItem('chatMessages');
      setMessages([]);
      setInput('');
      return;
    }

    const userMessage: Message = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://superb-fernanda-nextflow-37cec34f.koyeb.app/o3mini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();

      const aiMessage: Message = { id: Date.now(), text: data.response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);

      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { id: Date.now(), text: 'Error communicating with AI', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatWidget = (
    <div className="fixed top-0 left-0 w-full h-full flex items-end justify-end p-4 z-[100]">
      <div className="relative flex flex-col w-80 h-[500px] bg-background rounded-xl shadow-2xl border">
        <div className="flex justify-between items-center p-4 bg-primary rounded-t-xl">
          <h2 className="text-primary-foreground font-semibold">AI Assistant</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground">
            <Cross1Icon className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-center gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              {!message.isUser && <RocketIcon className="h-5 w-5 text-accent-foreground" />}
              <div className={`max-w-[85%] p-3 rounded-lg mt-1 mb-1 ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                <p className="text-sm leading-5">{message.text}</p>
              </div>
              {message.isUser && <PersonIcon className="h-5 w-5 text-primary-foreground" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-accent p-3 rounded-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="flex-1" disabled={isLoading} />
            <Button type="submit" size="sm" disabled={isLoading}>Send</Button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && typeof window !== "undefined" && ReactDOM.createPortal(chatWidget, document.body)}
      <Button onClick={() => setIsOpen(true)} variant="default" size="icon" className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform z-50">
        <ChatBubbleIcon className="h-6 w-6" />
      </Button>
    </>
  );
}
