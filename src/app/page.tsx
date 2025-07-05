'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [level, setLevel] = useState('easy');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [secretRevealed, setSecretRevealed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [secretInput, setSecretInput] = useState(''); // New state for secret input
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSecret = async (selectedLevel: string) => {
    const response = await fetch(`/api/secrets?level=${selectedLevel}`);
    const data = await response.json();
    return data.secret;
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setSecretRevealed(null);

    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: userInput }]);
    setUserInput(''); // Clear input field

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userInput }], level }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const llmResponseContent = data.response;
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: llmResponseContent }]);

      // Remove secret check from here

    } catch (error) {
      console.error('Failed to submit:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Error: Could not get response from LLM.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecretCheck = async () => {
    if (!secretInput.trim()) return;

    setIsLoading(true); // Can reuse isLoading, or create a separate state if needed
    setSecretRevealed(null);

    try {
      const secret = await loadSecret(level);
      if (secret && secretInput.includes(secret)) {
        setSecretRevealed(true);
      } else {
        setSecretRevealed(false);
      }
    } catch (error) {
      console.error('Failed to load secret:', error);
      setSecretRevealed(false); // Indicate failure to load/check
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-2 bg-gray-100 p-4">
      <main className="flex flex-col items-center w-full flex-grow text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 sm:mb-8">
          🧠 Jailbreak the LLM
        </h1>

        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white p-4 sm:p-8 rounded-lg shadow-md flex-grow overflow-hidden">
          {/* Left Panel: Conversation */}
          <div className="flex flex-col flex-grow md:w-3/4 relative mb-4 md:mb-0 md:mr-4">
            <div className="flex-grow overflow-y-auto pr-2 sm:pr-4 pb-4 md:border-r md:border-gray-200 min-h-0">
              <p className="text-lg font-bold mb-4 text-left text-gray-800">Conversation:</p>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${msg.role === 'user'
                      ? 'bg-blue-500 text-white text-right' // Added text-right
                      : 'bg-gray-200 text-gray-800 text-left' // Added text-left
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* User Input at the bottom */}
            <div className="flex pt-4 border-t border-gray-200">
              <input
                type="text"
                id="user_input"
                className="flex-grow shadow appearance-none border rounded-l-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                placeholder="Try to jailbreak the LLM..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                disabled={isLoading}
              />
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg focus:outline-none focus:shadow-outline disabled:opacity-50 text-sm sm:text-base"
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </div>

          {/* Right Panel: Difficulty and Secret */}
          <div className="w-full md:w-1/4 pl-0 md:pl-4 flex flex-col pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-200">
            {/* <div className="mb-6 text-left">
              <label htmlFor="difficulty" className="block text-gray-700 text-sm font-bold mb-2">
                Choose Difficulty:
              </label>
              <select
                id="difficulty"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={isLoading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>*/}

            <div className="mb-6 text-left">
              <label htmlFor="secret_input" className="block text-gray-700 text-sm font-bold mb-2">
                Submit Secret:
              </label>
              <input
                type="text"
                id="secret_input"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2 text-sm sm:text-base"
                placeholder="Enter the secret here..."
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSecretCheck();
                  }
                }}
                disabled={isLoading}
              />
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 text-sm sm:text-base"
                type="button"
                onClick={handleSecretCheck}
                disabled={isLoading}
              >
                Check Secret
              </button>
            </div>

            {secretRevealed !== null && (
              <div className="mt-4">
                {secretRevealed ? (
                  <p className="text-green-600 font-bold text-sm sm:text-base">🎉 Secret revealed! You successfully jailbroke the model.</p>
                ) : (
                  <p className="text-red-600 font-bold text-sm sm:text-base">❌ Try again. The LLM is resisting...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
