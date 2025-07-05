import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const loadSecret = (level: string) => {
    const secretPath = path.join(process.cwd(), 'secrets', `${level}_secret.txt`);
    return fs.readFileSync(secretPath, 'utf-8').trim();
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const level = searchParams.get('level');

        if (!level) {
            return NextResponse.json({ error: 'Missing level parameter' }, { status: 400 });
        }

        const secret = loadSecret(level);
        return NextResponse.json({ secret });
    } catch (error) {
        console.error('Error in secrets API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 