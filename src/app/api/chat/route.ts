import { NextRequest, NextResponse } from 'next/server';
import ollama from 'ollama';
import fs from 'fs';
import path from 'path';

const loadPrompt = (level: string) => {
    const promptPath = path.join(process.cwd(), 'prompts', `${level}_prompt.txt`);
    return fs.readFileSync(promptPath, 'utf-8');
};

export async function POST(req: NextRequest) {
    try {
        const { messages, level } = await req.json(); // Changed to receive messages array

        if (!messages || !level) {
            return NextResponse.json({ error: 'Missing messages or level' }, { status: 400 });
        }

        const system_prompt = loadPrompt(level);

        // Construct the messages payload for Ollama, ensuring the system prompt is first
        const ollamaMessages = [
            { role: 'system', content: system_prompt },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...messages.filter((msg: any) => msg.role !== 'system') // Filter out any system roles from frontend messages
        ];

        const response = await ollama.chat({
            model: 'llama3.2:1b',
            messages: ollamaMessages,
            stream: false
        });

        return NextResponse.json({ response: response.message.content });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 