
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection } from 'firebase/firestore';
import { app } from './firebase';
import type { DuelState, CharacterStats } from '@/types/duel';
import { initialPlayerStats } from './rules';

export const firestore = app ? getFirestore(app) : null;

export async function createDuel(player1Id: string, player1Name: string): Promise<string> {
    if (!firestore) {
        throw new Error("Firestore is not initialized.");
    }
    const duelId = doc(collection(firestore, 'duels')).id;
    const duelRef = doc(firestore, 'duels', duelId);

    const initialState: DuelState = {
        player1: initialPlayerStats(player1Id, player1Name),
        player2: null,
        turnHistory: [],
        currentTurn: 1,
        activePlayerId: 'player1',
        winner: null,
        log: [],
        createdAt: new Date(),
    };

    await setDoc(duelRef, initialState);
    return duelId;
}

export async function joinDuel(duelId: string, player2Id: string, player2Name: string) {
    if (!firestore) {
        throw new Error("Firestore is not initialized.");
    }
    const duelRef = doc(firestore, 'duels', duelId);
    const duelSnap = await getDoc(duelRef);

    if (duelSnap.exists() && !duelSnap.data().player2) {
        await updateDoc(duelRef, {
            player2: initialPlayerStats(player2Id, player2Name),
            activePlayerId: Math.random() < 0.5 ? 'player1' : 'player2'
        });
    }
}

export async function updateDuel(duelId: string, duelData: Partial<DuelState>) {
    if (!firestore) {
        throw new Error("Firestore is not initialized.");
    }
    const duelRef = doc(firestore, 'duels', duelId);
    await updateDoc(duelRef, duelData);
}

// Re-export collection and other firestore functions if needed elsewhere
export { doc, collection, getDoc, setDoc as setFirestoreDoc, updateDoc as updateFirestoreDoc } from 'firebase/firestore';
