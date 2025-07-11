
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, Loader2 } from 'lucide-react';

export default function DiceRoller() {
  const [d10Result, setD10Result] = useState<string | null>(null);
  const [isD10Rolling, setIsD10Rolling] = useState(false);
  
  const rollD10 = () => {
    setIsD10Rolling(true);
    setD10Result(null);
    setTimeout(() => {
      const baseRoll = Math.floor(Math.random() * 10) + 1;
      setD10Result(`${baseRoll}`);
      setIsD10Rolling(false);
    }, 500);
  };

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Dices className="w-6 h-6 text-primary" />
          <span>Бросок Костей (d10)</span>
        </CardTitle>
        <CardDescription>Используйте для различных проверок, когда это требуется по правилам.</CardDescription>
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
  );
}
