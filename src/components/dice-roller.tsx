'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Loader2 } from 'lucide-react';
import type { CharacterStats } from '@/types/duel';

interface DiceRollerProps {
  player: CharacterStats;
}

export default function DiceRoller({ player }: DiceRollerProps) {
  const [result, setResult] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);
    setTimeout(() => {
      const baseRoll = Math.floor(Math.random() * 10) + 1;
      const faithBonus = player.faithLevel;
      const total = baseRoll + faithBonus;
      setResult(`${total} (${baseRoll} + ${faithBonus})`);
      setIsRolling(false);
    }, 500);
  };

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Dices className="w-6 h-6 text-primary" />
          <span>Бросок Костей (d10)</span>
        </CardTitle>
        <CardDescription>Используйте для проверок. Уровень веры ({player.faithLevel}) будет добавлен как бонус.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="w-auto px-4 h-24 bg-primary/10 rounded-lg flex items-center justify-center text-4xl font-bold text-primary transition-all">
          {isRolling ? <Loader2 className="w-12 h-12 animate-spin" /> : result ?? '?'}
        </div>
        <Button onClick={rollDice} disabled={isRolling}>
          Бросить кость
        </Button>
      </CardContent>
    </Card>
  );
}
