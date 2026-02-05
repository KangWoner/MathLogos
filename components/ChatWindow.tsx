
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { geminiService } from '../services/geminiService';
import { ChatMessage, MessageRole, StudentProfile } from '../types';

interface ChatWindowProps {
  profile: StudentProfile;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const greet = async () => {
      setIsTyping(true);
      const greeting = `반갑습니다, ${profile.name} 학생. 수리논술 전문가입니다. 
현재 ${profile.grade}이며 수학 ${profile.mathLevel} 등급이라고 하셨군요. 
목표하시는 [${profile.targetUniversities.join(', ') || '대학'}] 수리논술 준비에 대해 궁금한 점이나, 직접 푼 논술 답안 분석이 필요하시면 말씀해 주세요. 사진은 여러 장 업로드 가능합니다.`;
      
      setMessages([{ role: MessageRole.MODEL, text: greeting }]);
      setIsTyping(false);
    };
    greet();
  }, [profile.grade, profile.mathLevel, profile.name, profile.targetUniversities]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      (Array.from(files) as File[]).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && selectedImages.length === 0) return;

    const userMsg: ChatMessage = { 
        role: MessageRole.USER, 
        text: input, 
        images: selectedImages.length > 0 ? [...selectedImages] : undefined 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImages([]);
    setIsTyping(true);

    try {
      const imagesBase64 = userMsg.images ? userMsg.images.map(img => img.split(',')[1]) : undefined;
      let aiResponseText = '';
      setMessages(prev => [...prev, { role: MessageRole.MODEL, text: '' }]);
      const stream = geminiService.sendMessageStream(userMsg.text, imagesBase64);
      for await (const chunk of stream) {
        aiResponseText += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = aiResponseText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: MessageRole.MODEL, text: "오류가 발생했습니다. 다시 시도해주세요." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 min-h-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === MessageRole.USER 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.images && msg.images.length > 0 && (
                  <div className={`grid gap-2 mb-3 ${msg.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {msg.images.map((img, i) => (
                      <img key={i} src={img} alt={`Upload ${i}`} className="w-full h-auto max-h-60 object-cover rounded-lg border border-slate-100" />
                    ))}
                  </div>
                )}
                <div className="prose prose-slate max-w-none prose-sm md:prose-base dark:prose-invert">
                  {msg.role === MessageRole.USER ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath, remarkGfm]} 
                      rehypePlugins={[rehypeKatex]}
                      components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                      }}
                    >
                      {msg.text || (idx === messages.length - 1 && isTyping ? '분석 중입니다...' : '')}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 md:p-6 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto">
          {selectedImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedImages.map((img, index) => (
                <div key={index} className="relative inline-block">
                  <img src={img} alt={`Preview ${index}`} className="h-14 w-14 object-cover rounded-lg border-2 border-blue-500" />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 bg-slate-100 rounded-2xl p-2 px-3 shadow-inner border border-slate-200">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-blue-600 transition-colors shrink-0"
              title="Upload math problem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6.75v11.25a1.5 1.5 0 001.5 1.5z" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="궁금한 점을 물어보거나 여러 장의 풀이 사진을 업로드하세요..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 text-slate-700 resize-none min-h-[40px] max-h-32 text-sm md:text-base"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || (!input.trim() && selectedImages.length === 0)}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-4 mt-3 text-[10px] text-slate-400">
            <p>수리논술 전문 AI 비서는 입시 전략 수립을 돕지만, 최종 지원 결정은 전문가와 상담하시길 권장합니다.</p>
            <div className="flex items-center gap-1">
              <span>|</span>
              <span>문의:</span>
              <a href="mailto:woner@questio.co.kr" className="underline hover:text-blue-600">woner@questio.co.kr</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
