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
        const { user_input, level } = await req.json();

        if (!user_input || !level) {
            return NextResponse.json({ error: 'Missing user_input or level' }, { status: 400 });
        }

        const system_prompt = loadPrompt(level);

        const response = await ollama.chat({
            model: 'llama3.2:1b',
            messages: [
                { role: 'system', content: system_prompt },
                { role: 'user', content: user_input }
            ],
            stream: false
        });

        return NextResponse.json({ response: response.message.content });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 