'use client';

import type { Turn } from '@/types/duel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Scroll, History } from 'lucide-react';

interface DuelLogProps {
  turns: Turn[];
  player1Name: string;
  player2Name: string;
}

export default function DuelLog({ turns, player1Name, player2Name }: DuelLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <History className="w-6 h-6 text-primary" />
          <span>Журнал Дуэли</span>
        </CardTitle>
        <CardDescription>История всех ходов в этой дуэли.</CardDescription>
      </CardHeader>
      <CardContent>
        {turns.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Scroll className="mx-auto h-12 w-12" />
            <p className="mt-4">Журнал пока пуст. Сделайте первый ход!</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {[...turns].reverse().map((turn) => (
              <AccordionItem value={`turn-${turn.turnNumber}`} key={turn.turnNumber}>
                <AccordionTrigger>
                  Ход {turn.turnNumber}: {turn.playerName}
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    {turn.log.map((logEntry, index) => (
                      <li key={index}>
                        {logEntry}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold pt-2">Итог хода: {turn.endStats.oz} ОЗ, {turn.endStats.om} ОМ, {turn.endStats.od} ОД, {turn.endStats.shield} Щит</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
