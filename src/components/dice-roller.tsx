'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Loader2, Cross, Shield, Heart } from 'lucide-react';
import type { CharacterStats } from '@/types/duel';
import { RULES } from '@/lib/rules';

interface DiceRollerProps {
  player: CharacterStats;
}

export default function DiceRoller({ player }: DiceRollerProps) {
  const [d10Result, setD10Result] = useState<string | null>(null);
  const [isD10Rolling, setIsD10Rolling] = useState(false);
  
  const [prayerResult, setPrayerResult] = useState<string | null>(null);
  const [isPrayerRolling, setIsPrayerRolling] = useState(false);

  const rollD10 = () => {
    setIsD10Rolling(true);
    setD10Result(null);
    setTimeout(() => {
      const baseRoll = Math.floor(Math.random() * 10) + 1;
      // Note: Faith bonus is no longer added here, it's used for prayer checks.
      setD10Result(`${baseRoll}`);
      setIsD10Rolling(false);
    }, 500);
  };
  
  const rollForPrayer = () => {
    setIsPrayerRolling(true);
    setPrayerResult(null);
    setTimeout(() => {
      if (player.faithLevel === -1) {
          setPrayerResult('Провал. Боги ненавидят вас.');
          setIsPrayerRolling(false);
          return;
      }
      if (player.faithLevel === 10) {
          setPrayerResult('Успех! Боги всегда слышат вас.');
          setIsPrayerRolling(false);
          return;
      }
      
      const roll = Math.floor(Math.random() * 10) + 1;
      const requiredRoll = RULES.PRAYER_CHANCE[String(player.faithLevel)];
      
      if (roll <= requiredRoll) {
          setPrayerResult(`Успех! (Выпало ${roll}, нужно <= ${requiredRoll})`);
      } else {
          setPrayerResult(`Провал (Выпало ${roll}, нужно <= ${requiredRoll})`);
      }
      setIsPrayerRolling(false);
    }, 500);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Dices className="w-6 h-6 text-primary" />
            <span>Бросок Костей (d10)</span>
          </CardTitle>
          <CardDescription>Используйте для различных проверок.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="w-auto px-4 h-24 bg-primary/10 rounded-lg flex items-center justify-center text-4xl font-bold text-primary transition-all">
            {isD10Rolling ? <Loader2 className="w-12 h-12 animate-spin" /> : d10Result ?? '?'}
          </div>
          <Button onClick={rollD10} disabled={isD10Rolling}>
            Бросить d10
          </Button>
        </CardContent>
      </Card>
      
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Cross className="w-6 h-6 text-primary" />
            <span>Проверка Молитвы</span>
          </CardTitle>
          <CardDescription>
            Шанс на успех зависит от веры ({player.faithLevelName}). 
            Шанс: {(RULES.PRAYER_CHANCE[String(player.faithLevel)] || 0) * 10}%.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="w-auto px-4 h-24 bg-primary/10 rounded-lg flex items-center justify-center text-xl text-center font-bold text-primary transition-all">
            {isPrayerRolling ? <Loader2 className="w-12 h-12 animate-spin" /> : prayerResult ?? '?'}
          </div>
          <Button onClick={rollForPrayer} disabled={isPrayerRolling || player.cooldowns.prayer > 0}>
             {player.cooldowns.prayer > 0 ? `На перезарядке: ${player.cooldowns.prayer}` : 'Помолиться'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
