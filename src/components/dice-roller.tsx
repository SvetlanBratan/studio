'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Loader2 } from 'lucide-react';

export default function DiceRoller() {
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 10) + 1;
      setResult(roll);
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
        <CardDescription>Используйте для проверок веры или атак фамильяров.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center text-5xl font-bold text-primary transition-all">
          {isRolling ? <Loader2 className="w-12 h-12 animate-spin" /> : result ?? '?'}
        </div>
        <Button onClick={rollDice} disabled={isRolling}>
          Бросить кость
        </Button>
      </CardContent>
    </Card>
  );
}
