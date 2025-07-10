'use client';

import { useState } from 'react';
import type { DuelState, Turn, Action, CharacterStats } from '@/types/duel';
import CharacterPanel from '@/components/character-panel';
import TurnForm from '@/components/turn-form';
import DuelLog from '@/components/duel-log';
import ActionSuggestion from '@/components/action-suggestion';
import DiceRoller from '@/components/dice-roller';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const initialPlayer1: CharacterStats = {
  id: 'player1',
  name: 'Элара, Чародейка Времени',
  race: 'Тальен',
  reserve: 'Мастер',
  elementalKnowledge: 'Магия времени (Мастер), Магия света (Адепт)',
  faithLevel: 2,
  physicalCondition: 'В полном здравии',
  bonuses: ['Иммунитет к контролю'],
  penalties: [],
  inventory: ['Зелье малого исцеления x2', 'Кристалл времени x1'],
  oz: 200,
  maxOz: 200,
  om: 360,
  maxOm: 360,
  od: 100,
  maxOd: 100,
  shield: 0,
};

const initialPlayer2: CharacterStats = {
  id: 'player2',
  name: 'Громмаш, Рыцарь Хаоса',
  race: 'Орк',
  reserve: 'Специалист',
  elementalKnowledge: 'Магия хаоса (Специалист), Магия огня (Специалист)',
  faithLevel: -1,
  physicalCondition: 'В полном здравии',
  bonuses: ['Расовая ярость (+10 к урону)'],
  penalties: [],
  inventory: ['Зелье силы x1'],
  oz: 200,
  maxOz: 200,
  om: 270,
  maxOm: 270,
  od: 100,
  maxOd: 100,
  shield: 0,
};

const initialDuelState: DuelState = {
  player1: initialPlayer1,
  player2: initialPlayer2,
  turnHistory: [],
  currentTurn: 1,
  activePlayerId: 'player1',
  winner: undefined,
};

export default function Home() {
  const [duel, setDuel] = useState<DuelState>(initialDuelState);

  const handleTurnSubmit = (turnData: Omit<Turn, 'turnNumber' | 'startStats' | 'endStats'>) => {
    setDuel(prevDuel => {
      const activePlayer = prevDuel.activePlayerId === 'player1' ? prevDuel.player1 : prevDuel.player2;
      const opponent = prevDuel.activePlayerId === 'player1' ? prevDuel.player2 : prevDuel.player1;

      const startStats = { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od };
      
      let newOz = activePlayer.oz;
      let newOm = activePlayer.om;
      let newOd = activePlayer.od;
      
      // Basic cost calculation
      turnData.actions.forEach(action => {
        if(action.costType === 'om') newOm -= action.cost;
        if(action.costType === 'od') newOd -= action.cost;
      });

      // Passive mana regen
      newOm += 25;
      if (newOm > activePlayer.maxOm) newOm = activePlayer.maxOm;

      const updatedActivePlayer = { ...activePlayer, oz: newOz, om: newOm, od: newOd };

      const newTurn: Turn = {
        ...turnData,
        turnNumber: prevDuel.currentTurn,
        startStats,
        endStats: { oz: newOz, om: newOm, od: newOd },
      };

      // Naive implementation - assumes actions don't affect opponent for now
      // A full implementation would parse action descriptions to calculate damage etc.
      
      return {
        ...prevDuel,
        player1: prevDuel.activePlayerId === 'player1' ? updatedActivePlayer : prevDuel.player1,
        player2: prevDuel.activePlayerId === 'player2' ? updatedActivePlayer : prevDuel.player2,
        turnHistory: [...prevDuel.turnHistory, newTurn],
        currentTurn: prevDuel.currentTurn + 1,
        activePlayerId: prevDuel.activePlayerId === 'player1' ? 'player2' : 'player1',
      };
    });
  };
  
  const resetDuel = () => {
    setDuel(initialDuelState);
  };

  const activePlayer = duel.activePlayerId === 'player1' ? duel.player1 : duel.player2;
  const opponent = duel.activePlayerId === 'player1' ? duel.player2 : duel.player1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border shadow-md bg-card">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Swords className="text-primary w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary-foreground">
              Magic Duel Assistant
            </h1>
          </div>
           <Button onClick={resetDuel} variant="destructive">
            <Gamepad2 className="mr-2 h-4 w-4" /> Начать новую дуэль
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {duel.winner ? (
           <Card className="text-center p-8">
            <CardTitle className="text-3xl font-bold text-accent mb-4">Дуэль Окончена!</CardTitle>
            <CardContent>
              <p className="text-xl">Победитель: {duel.winner}</p>
              <Button onClick={resetDuel} className="mt-6">Начать заново</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
              <CharacterPanel character={duel.player1} isActive={duel.activePlayerId === 'player1'} />
              <CharacterPanel character={duel.player2} isActive={duel.activePlayerId === 'player2'} />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ход {duel.currentTurn}: {activePlayer.name}</span>
                     <span className="text-sm font-medium text-muted-foreground">Очередь хода</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TurnForm
                    player={activePlayer}
                    onSubmit={handleTurnSubmit}
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ActionSuggestion player={activePlayer} opponent={opponent} />
                <DiceRoller />
              </div>

              <DuelLog turns={duel.turnHistory} player1Name={duel.player1.name} player2Name={duel.player2.name} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
