import React, { useState } from 'react';

const ChatBotUI = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  // Handle sending a message
  const handleSend = () => {
    if (input.trim() === '') return;
    // Add the user's message to the conversation
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    
    // TODO: Integrate your AI API call here.
    // For example, fetch the AI response and then:
    // setMessages((prev) => [...prev, { sender: 'bot', text: aiResponse }]);

    setInput('');
  };

  // Allow pressing Enter to send the message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-300 dark:bg-gray-800">
      {/* Chat messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-900'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input area */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={handleSend}
          className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBotUI;
