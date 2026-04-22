import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';
import { getEntry, deleteEntry, isHistoryEnabled } from '../../../../services/history';

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

export async function GET(request, { params }) {
    const auth = authenticate(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    if (!isHistoryEnabled()) {
        return NextResponse.json({ error: 'Historique désactivé' }, { status: 404 });
    }

    const { id } = await params;
    try {
        const entry = await getEntry(id);
        if (!entry) {
            return NextResponse.json({ error: 'Entrée introuvable ou expirée' }, { status: 404 });
        }
        return NextResponse.json({ entry });
    } catch (error) {
        console.error('❌ [HISTORY GET ERROR]:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne serveur' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const auth = authenticate(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    if (!isHistoryEnabled()) {
        return NextResponse.json({ error: 'Historique désactivé' }, { status: 404 });
    }

    const { id } = await params;
    try {
        await deleteEntry(id);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('❌ [HISTORY DELETE ERROR]:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne serveur' }, { status: 500 });
    }
}
