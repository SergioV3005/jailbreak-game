'use client';
import { useState } from 'react';

export default function Home() {
  const [level, setLevel] = useState('easy');
  const [userInput, setUserInput] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [secretRevealed, setSecretRevealed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSecret = async (selectedLevel: string) => {
    const response = await fetch(`/api/secrets?level=${selectedLevel}`);
    const data = await response.json();
    return data.secret;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSecretRevealed(null);
    setLlmResponse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput, level }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLlmResponse(data.response);

      const secret = await loadSecret(level);
      if (secret && data.response.includes(secret)) {
        setSecretRevealed(true);
      } else {
        setSecretRevealed(false);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      setLlmResponse('Error: Could not get response from LLM.');
      setSecretRevealed(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">
          🧠 Jailbreak the LLM
        </h1>

        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4 text-left">
            <label htmlFor="difficulty" className="block text-gray-700 text-sm font-bold mb-2">
              Choose Difficulty:
            </label>
            <select
              id="difficulty"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="mb-6 text-left">
            <label htmlFor="user_input" className="block text-gray-700 text-sm font-bold mb-2">
              Try to jailbreak the LLM:
            </label>
            <input
              type="text"
              id="user_input"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your prompt here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {llmResponse && (
            <div className="mt-8 text-left bg-gray-50 p-4 rounded-md">
              <p className="text-gray-800 font-bold mb-2">LLM Response:</p>
              <p className="text-gray-600">{llmResponse}</p>
            </div>
          )}

          {secretRevealed !== null && (
            <div className="mt-4">
              {secretRevealed ? (
                <p className="text-green-600 font-bold">🎉 Secret revealed! You successfully jailbroke the model.</p>
              ) : (
                <p className="text-red-600 font-bold">❌ Try again. The LLM is resisting...</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
