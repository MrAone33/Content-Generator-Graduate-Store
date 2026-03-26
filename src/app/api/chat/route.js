import { NextResponse } from 'next/server';
import { verifyToken } from '../../../utils/auth';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        if (!verifyToken(token, process.env.ACCESS_TOKEN)) {
            return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
        }

        const { messages } = await request.json();
        if (!messages || !messages.length) {
            return NextResponse.json({ error: 'Messages requis' }, { status: 400 });
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Cle API manquante' }, { status: 500 });
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
            }),
            signal: AbortSignal.timeout(55000),
        });

        const data = await response.json();
        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: 500 });
        }

        return NextResponse.json({ reply: data.content[0].text });
    } catch (err) {
        console.error("Chat error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
