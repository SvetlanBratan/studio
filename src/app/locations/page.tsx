
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, ArrowLeft, Trees } from 'lucide-react';
import Image from 'next/image';

export default function LocationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
       <header className="p-4 border-b border-border shadow-md bg-card">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Swords className="text-primary w-8 h-8" />
              <h1 className="text-xl md:text-2xl font-headline font-bold text-primary-foreground">
                Локации
              </h1>
            </div>
             <Button onClick={() => router.push('/duels')} variant="secondary" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Назад
            </Button>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-8 flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
           <Card className="w-full max-w-sm overflow-hidden">
                <div className="relative h-48 w-full">
                     <Image
                        src="https://placehold.co/600x400.png"
                        alt="Forest Labyrinth"
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="forest path"
                    />
                </div>
                <CardHeader>
                    <CardTitle>Лесной лабиринт</CardTitle>
                    <CardDescription>Исследуйте запутанный лес, сражайтесь с монстрами и найдите выход.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/locations/labyrinth')} className="w-full">
                        <Trees className="mr-2" />
                        Войти в лабиринт
                    </Button>
                </CardContent>
           </Card>
        </main>
    </div>
  );
}
