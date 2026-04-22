import { NextResponse } from 'next/server';
import { verifyToken } from '../../../utils/auth';
import { listEntries, getDailyUsage, saveEntry, isHistoryEnabled } from '../../../services/history';

export const dynamic = 'force-dynamic';

function authenticate(request) {
    const accessToken = process.env.ACCESS_TOKEN;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { ok: false, status: 401, error: 'Accès refusé : Token manquant' };
    }
    const userToken = authHeader.split(' ')[1];
    if (!verifyToken(userToken, accessToken)) {
        return { ok: false, status: 403, error: 'Accès interdit : Identifiants invalides' };
    }
    return { ok: true };
}

export async function GET(request) {
    const auth = authenticate(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    if (!isHistoryEnabled()) {
        return NextResponse.json({ entries: [], usage: { count: 0, limit: 50 }, enabled: false });
    }

    try {
        const [entries, usage] = await Promise.all([listEntries(), getDailyUsage()]);
        return NextResponse.json({ entries, usage, enabled: true });
    } catch (error) {
        console.error('❌ [HISTORY LIST ERROR]:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne serveur' }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = authenticate(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    if (!isHistoryEnabled()) {
        return NextResponse.json({ ok: false, enabled: false });
    }

    try {
        const body = await request.json();
        const { type, keyword, content, imageUrl, formData } = body;

        if (!type || (type !== 'text' && type !== 'image')) {
            return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
        }
        if (!content && !imageUrl) {
            return NextResponse.json({ error: 'Contenu manquant' }, { status: 400 });
        }

        const entry = await saveEntry({
            type,
            keyword: (keyword || '').toString().slice(0, 300),
            content: content || null,
            imageUrl: imageUrl || null,
            formData: formData || null,
        });

        return NextResponse.json({ ok: true, entry: { id: entry.id, createdAt: entry.createdAt } });
    } catch (error) {
        console.error('❌ [HISTORY SAVE ERROR]:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne serveur' }, { status: 500 });
    }
}
