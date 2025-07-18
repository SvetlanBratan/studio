
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createDuel } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dices, LogIn, LogOut, Swords, User as UserIcon } from 'lucide-react';

export default function DuelsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [joinDuelId, setJoinDuelId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }
  
  const handleCreateDuel = async () => {
    if (!user || isCreating) return;
    setIsCreating(true);
    try {
      const duelId = await createDuel(user.uid, user.displayName || `Игрок ${user.uid.substring(0, 5)}`);
      if (duelId) {
        router.push(`/duels/${duelId}`);
      } else {
        // Handle error case, maybe show a toast
        console.error("Не удалось получить ID дуэли.");
      }
    } catch (error) {
      console.error("Не удалось создать дуэль:", error);
      // Optionally show a toast message to the user here
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSoloDuel = () => {
    router.push(`/duels/solo`);
  };

  const handleJoinDuel = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinDuelId.trim()) {
      router.push(`/duels/${joinDuelId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
       <header className="p-4 border-b border-border shadow-md bg-card">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Swords className="text-primary w-8 h-8" />
              <h1 className="text-xl md:text-2xl font-headline font-bold text-primary-foreground">
                Magic Duel Assistant
              </h1>
            </div>
            {user && (
              <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                      {user.displayName || user.email || 'Гость'}
                  </span>
                  <Button onClick={signOut} variant="ghost" size="icon" aria-label="Выйти">
                      <LogOut className="w-5 h-5" />
                  </Button>
              </div>
            )}
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-8 flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
           <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Присоединиться к дуэли</CardTitle>
                    <CardDescription>Создайте новую дуэль или войдите в существующую по ID.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleCreateDuel} disabled={isCreating} className="w-full" size="lg">
                        <Dices className="mr-2" />
                        {isCreating ? 'Создание...' : 'Создать новую дуэль (Онлайн)'}
                    </Button>
                    <Button onClick={handleCreateSoloDuel} className="w-full" size="lg" variant="outline">
                        <UserIcon className="mr-2" />
                        Создать пробную дуэль (Соло)
                    </Button>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                            Или
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleJoinDuel} className="space-y-2">
                        <div>
                            <Label htmlFor="duelId">ID Дуэли</Label>
                            <Input 
                                id="duelId"
                                placeholder="Введите ID дуэли"
                                value={joinDuelId}
                                onChange={(e) => setJoinDuelId(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full">
                           <LogIn className="mr-2" />
                           Присоединиться
                        </Button>
                    </form>
                </CardContent>
           </Card>
        </main>
    </div>
  );
}
