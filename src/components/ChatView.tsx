import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { X, Send, Camera, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraCapture } from './CameraCapture';

interface ChatViewProps {
  recipient: UserProfile;
  onClose: () => void;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  image?: string;
  video?: string;
  isSystem?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ recipient, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'system',
      text: `Olá! Para agilizar seu orçamento, por favor envie uma foto ou vídeo em tempo real do local/serviço a ser executado.`,
      timestamp: Date.now(),
      isSystem: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const handleSend = (text: string, image?: string, video?: string) => {
    if (!text && !image && !video) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text,
      timestamp: Date.now(),
      image,
      video
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');

    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        senderId: recipient.uid,
        text: (image || video) ? "Recebi o arquivo em tempo real! Vou analisar e te mando o orçamento em breve." : "Olá! Como posso ajudar na sua obra?",
        timestamp: Date.now()
      }]);
    }, 2000);
  };

  const handleCapture = (data: string, type: 'image' | 'video') => {
    if (type === 'image') {
      handleSend("Foto em tempo real do serviço", data);
    } else {
      handleSend("Vídeo em tempo real do serviço", undefined, data);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
      <AnimatePresence>
        {showCamera && (
          <CameraCapture 
            onCapture={handleCapture} 
            onClose={() => setShowCamera(false)} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl h-full sm:h-[80vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img 
              src={recipient.photoURL} 
              alt="" 
              className="w-10 h-10 rounded-full object-cover" 
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-black text-zinc-900">{recipient.displayName}</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online agora</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.isSystem ? 'bg-purple-50 text-purple-700 border border-purple-100 text-center w-full' :
                msg.senderId === 'me' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white text-zinc-800 rounded-tl-none'
              }`}>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Capture" 
                    className="rounded-xl mb-2 max-h-60 w-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                )}
                {msg.video && (
                  <video src={msg.video} controls className="rounded-xl mb-2 max-h-60 w-full object-cover" />
                )}
                <p className="text-sm font-medium">{msg.text}</p>
                <div className={`text-[9px] mt-1 flex items-center gap-1 ${msg.senderId === 'me' ? 'text-purple-200' : 'text-zinc-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.senderId === 'me' && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-zinc-100">
          <div className="flex items-center gap-2 bg-zinc-100 rounded-2xl p-2">
            <button 
              onClick={() => setShowCamera(true)}
              className="p-2 text-zinc-500 hover:text-purple-600 transition-colors"
              title="Tirar foto em tempo real"
            >
              <Camera className="w-6 h-6" />
            </button>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium p-2"
            />
            <button 
              onClick={() => handleSend(inputText)}
              className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
