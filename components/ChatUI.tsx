'use client';

import LoadingDots from '@/components/LoadingDots';
import { Message } from '@/types/message';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'react-feather';
import '@/styles/chat-styles.css';
import { Document } from 'langchain/dist/document';

type ChatUIProps = {
  collectionName: string;
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
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
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
      next: { revalidate: 0 },
      body: JSON.stringify({
        query: message,
        history: history,
        // collectionName: props.collectionName,
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

  const formatPageName = (url: string) => {
    // Split the URL by "/" and get the last segment
    const pageName = url.split('/').pop();

    // Split by "-" and then join with space
    if (pageName) {
      const formattedName = pageName.split('-').join(' ');

      // Capitalize only the first letter of the entire string
      return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    }
  };

  //scroll to bottom of chat
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  return (
    <main className="h-96 bg-black flex flex-col w-full">
      <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full">
        <h1 className="sm:text-2xl lg:text-4xl text-white font-extralight">
          Ask me about your document
        </h1>
        <form
          className="rounded-2xl border-white-700 border-opacity-5 border w-full flex-grow flex flex-col max-h-full overflow-clip"
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          <div className="overflow-y-auto flex flex-col gap-2 p-4 h-96">
            {history.map((message: Message, idx) => {
              const isLastMessage = idx === history.length - 1;
              switch (message.role) {
                case 'assistant':
                  return (
                    <div
                      ref={isLastMessage ? lastMessageRef : null}
                      key={`chat-wrapper-${idx.toString()}`}
                      className="flex gap-2"
                    >
                      <div className="w-auto max-w-xl break-words bg-black rounded-b-xl rounded-tr-xl text-white p-6">
                        <p className="text-sm font-medium text-pink-500 mb-2">
                          AI assistant
                        </p>
                        {message.content}
                        {message.links && (
                          <div className="mt-4 flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500">
                              Sources:
                            </p>

                            {message.links?.map((link) => {
                              return (
                                <a
                                  href={link}
                                  key={link}
                                  className="block w-fit px-2 py-1 text-sm  text-pink-700 bg-black-100 rounded"
                                >
                                  {formatPageName(link)}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                case 'user':
                  return (
                    <div
                      className="w-auto max-w-xl break-words bg-black rounded-b-xl rounded-tl-xl text-white p-6 self-end"
                      key={`${message.content}-${idx.toString()}`}
                      ref={isLastMessage ? lastMessageRef : null}
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
              <div ref={lastMessageRef} className="flex gap-2">
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
    </main>
  );
}
