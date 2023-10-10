'use client';

import LoadingDots from '@/components/LoadingDots';
import { Message } from '@/types/message';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'react-feather';
import '@/styles/chat-styles.css';
import { Document } from 'langchain/dist/document';

type ChatUIProps = {
  docs: Document<Record<string, any>>[];
};

export default function ChatUI(props: ChatUIProps) {
  const [message, setMessage] = useState<string>('');
  const [history, setHistory] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! Ask me questions about your document.'
    }
  ]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleClick = () => {
    if (message == '') return;
    setHistory((oldHistory) => [
      ...oldHistory,
      { role: 'user', content: message }
    ]);
    setMessage('');
    setLoading(true);
    fetch('/api/create-start-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: message,
        history: history,
        docs: props.docs
      })
    })
      .then(async (res) => {
        const r = await res.json();
        setHistory((oldHistory) => [...oldHistory, r]);
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
      });
  };

  //scroll to bottom of chat
  useEffect(() => {
    if (chatRef.current) {
      const barHeight = '40px';
      chatRef.current.style.scrollMargin = barHeight;
      chatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  return (
    <section className="h-120 bg-black flex flex-col w-full" ref={chatRef}>
      <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full">
        <p
          ref={chatRef}
          className="text-xl pt-6 font-extrabold text-pink-500 lg:text-4xl"
        >
          Ask me about your document
        </p>
        <form
          className="rounded-2xl border-white-700 border-opacity-5 border w-full flex-grow flex flex-col max-h-full overflow-clip"
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          <div className="overflow-y-auto flex flex-col gap-2 p-4 h-96">
            {history.map((message: Message, idx) => {
              switch (message.role) {
                case 'assistant':
                  return (
                    <div
                      key={`chat-wrapper-${idx.toString()}`}
                      className="flex gap-2"
                    >
                      <div className="w-auto max-w-xl break-words bg-black rounded-b-xl rounded-tr-xl text-white p-6">
                        <p className="text-sm font-medium text-pink-500 mb-2">
                          AI assistant
                        </p>
                        {message.content}
                      </div>
                    </div>
                  );
                case 'user':
                  return (
                    <div
                      className="w-auto max-w-xl break-words bg-black rounded-b-xl rounded-tl-xl text-white p-6 self-end"
                      key={`${message.content}-${idx.toString()}`}
                    >
                      <p className="text-sm font-medium text-pink-500 mb-2">
                        You
                      </p>
                      {message.content}
                    </div>
                  );
              }
            })}
            {loading && (
              <div className="flex gap-2">
                <div className="w-auto max-w-xl break-words bg-black rounded-b-xl rounded-tr-xl text-white p-6 ">
                  <p className="text-sm font-medium text-pink-500 mb-4">
                    AI assistant
                  </p>
                  <LoadingDots />
                </div>
              </div>
            )}
          </div>

          {/* input area */}
          <div className="flex sticky bottom-0 w-full sm:px-4 lg:px-4 lg:pb-6 relative">
            <div className="flex sticky bottom-0 w-full lg:px-4 lg:pb-6 relative bg-black rounded-b-xl">
              <textarea
                aria-label="chat input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isFocused ? '' : 'Ask anything'}
                className="flex-grow text-white resize-none rounded-l-xl border border-white-900/10 
    bg-black p-6 placeholder:text-pink-400 placeholder:leading-10 focus:border-pink-500 focus:outline-none 
    focus:ring-4 focus:ring-pink-500/10"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleClick();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleClick();
                }}
                className="sendButton flex items-center justify-center rounded-r-xl border border-white bg-black px-3 text-sm 
     font-semibold text-white hover:bg-white hover:text-black active:bg-gray-300 
     disabled:bg-gray-100 disabled:text-gray-400 border-l border-white transition-colors duration-200 cursor-pointer"
                type="submit"
                aria-label="Send"
                disabled={!message || loading}
              >
                <Send />
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
