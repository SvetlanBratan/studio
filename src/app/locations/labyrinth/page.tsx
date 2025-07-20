
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Swords, ArrowLeft } from 'lucide-react';
import Labyrinth from '@/components/labyrinth';

export default function LabyrinthPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 border-b border-border shadow-md bg-card shrink-0">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Swords className="text-primary w-8 h-8" />
                        <h1 className="text-xl md:text-2xl font-headline font-bold text-primary-foreground">
                            Лесной Лабиринт
                        </h1>
                    </div>
                    <Button onClick={() => router.push('/duels')} variant="secondary" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Покинуть
                    </Button>
                </div>
            </header>
            <main className="container mx-auto p-4 flex-grow flex items-center justify-center">
                <Labyrinth />
            </main>
        </div>
    );
}
