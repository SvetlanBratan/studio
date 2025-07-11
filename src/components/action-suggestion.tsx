'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { suggestNextAction, SuggestNextActionOutput } from '@/ai/flows/suggest-next-action';
import type { CharacterStats } from '@/types/duel';
import { RULES } from '@/lib/rules';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ActionSuggestionProps {
  player: CharacterStats;
  opponent: CharacterStats;
}

export default function ActionSuggestion({ player, opponent }: ActionSuggestionProps) {
  const [suggestion, setSuggestion] = useState<SuggestNextActionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestion = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    const playerStatsString = `
- ОЗ: ${player.oz}
- ОМ: ${player.om}
- ОД: ${player.od}
- Штрафы: ${player.penalties.join(', ') || 'нет'}
- Бонусы: ${player.bonuses.join(', ') || 'нет'}
- Раса: ${player.race}
- Резерв: ${player.reserve}
- Знания стихий: ${player.elementalKnowledge}
- Уровень веры: ${player.faithLevel}
- Инвентарь: ${player.inventory.join(', ') || 'пусто'}
    `;

    const opponentStatsString = `
- ОЗ: ${opponent.oz}
- ОМ: ${opponent.om}
- ОД: ${opponent.od}
- Раса: ${opponent.race}
- Штрафы: ${opponent.penalties.join(', ') || 'нет'}
- Бонусы: ${opponent.bonuses.join(', ') || 'нет'}
    `;

    try {
      const result = await suggestNextAction({
        playerStats: playerStatsString,
        opponentStats: opponentStatsString,
        duelRules: JSON.stringify(RULES),
      });
      setSuggestion(result);
    } catch (e) {
      setError('Не удалось получить совет от ИИ. Попробуйте еще раз.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Wand2 className="w-6 h-6 text-accent" />
          <span>Советник по Стратегии</span>
        </CardTitle>
        <CardDescription>Получите совет от ИИ для вашего следующего хода.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={getSuggestion} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Анализ...</span>
            </>
          ) : (
            'Предложить действие'
          )}
        </Button>
        
        {error && <Alert variant="destructive"><AlertTitle>Ошибка</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        {suggestion && (
          <Alert className="border-accent">
            <Sparkles className="h-4 w-4 text-accent" />
            <AlertTitle className="font-bold text-accent">Рекомендация ИИ</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p><strong>Действие:</strong> {suggestion.suggestedAction}</p>
              <p><strong>Стоимость:</strong> {suggestion.costEstimate}</p>
              <p><strong>Прогноз:</strong> {suggestion.predictedEffect}</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
