'use client';

import { useState, useEffect } from 'react';
import type { DuelState, Turn, Action, CharacterStats, ReserveLevel, FaithLevel } from '@/types/duel';
import CharacterPanel from '@/components/character-panel';
import TurnForm from '@/components/turn-form';
import DuelLog from '@/components/duel-log';
import DiceRoller from '@/components/dice-roller';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Gamepad2, ShieldAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RULES, getOmFromReserve, getFaithLevelFromString, getActionLabel } from '@/lib/rules';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DuelSetup from '@/components/duel-setup';

const initialPlayer1: CharacterStats = {
  id: 'player1',
  name: 'Игрок 1',
  race: 'Человек',
  reserve: 'Неофит',
  elementalKnowledge: 'Магия времени (Мастер)',
  faithLevel: 0,
  faithLevelName: 'Равнодушие',
  physicalCondition: 'В полном здравии',
  bonuses: ['Иммунитет к контролю'],
  penalties: [],
  inventory: [],
  oz: 200,
  maxOz: 200,
  om: 90,
  maxOm: 90,
  od: 100,
  maxOd: 100,
  shield: 0,
  cooldowns: { strongSpell: 0, item: 0, prayer: 0 },
};

const initialPlayer2: CharacterStats = {
  id: 'player2',
  name: 'Игрок 2',
  race: 'Орк',
  reserve: 'Неофит',
  elementalKnowledge: 'Магия хаоса (Специалист), Магия огня (Специалист)',
  faithLevel: 0,
  faithLevelName: 'Равнодушие',
  physicalCondition: 'В полном здравии',
  bonuses: ['Расовая ярость (+10 к урону)', 'Боевая магия'],
  penalties: [],
  inventory: [],
  oz: 200,
  maxOz: 200,
  om: 90,
  maxOm: 90,
  od: 100,
  maxOd: 100,
  shield: 0,
  cooldowns: { strongSpell: 0, item: 0, prayer: 0 },
};

export default function Home() {
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const handleDuelStart = (player1: CharacterStats, player2: CharacterStats) => {
    setDuel({
      player1,
      player2,
      turnHistory: [],
      currentTurn: 1,
      activePlayerId: Math.random() < 0.5 ? 'player1' : 'player2',
      winner: undefined,
      log: [],
    });
  };

  const handleCharacterUpdate = (updatedCharacter: CharacterStats) => {
    if (!duel) return;

    const newMaxOm = getOmFromReserve(updatedCharacter.reserve);
    const newFaithLevel = getFaithLevelFromString(updatedCharacter.faithLevelName);
    const charData = { ...updatedCharacter, maxOm: newMaxOm, faithLevel: newFaithLevel };

    setDuel(prevDuel => {
      if (!prevDuel) return null;
      return {
        ...prevDuel,
        player1: prevDuel.player1.id === charData.id ? charData : prevDuel.player1,
        player2: prevDuel.player2.id === charData.id ? charData : prevDuel.player2,
      }
    });
  };

  const executeTurn = (actions: Action[]) => {
     if (!duel) return;

    setDuel(prevDuel => {
        if (!prevDuel) return null;

        const turnLog: string[] = [];
        let activePlayer = prevDuel.activePlayerId === 'player1' ? { ...prevDuel.player1 } : { ...prevDuel.player2 };
        let opponent = prevDuel.activePlayerId === 'player1' ? { ...prevDuel.player2 } : { ...prevDuel.player1 };
        
        const startStats = { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: activePlayer.shield };

        // 1. Cooldowns tick down
        for (const key in activePlayer.cooldowns) {
            const typedKey = key as keyof typeof activePlayer.cooldowns;
            if (activePlayer.cooldowns[typedKey] > 0) {
                activePlayer.cooldowns[typedKey]--;
            }
        }
        
        // 2. Apply penalties (like poison/burn)
        activePlayer.penalties.forEach(p => {
            if (RULES.DOT_EFFECTS.includes(p)) {
                const damage = RULES.DOT_DAMAGE;
                activePlayer.oz -= damage;
                turnLog.push(`${activePlayer.name} получает ${damage} урона от эффекта "${p}".`);
            }
        });

        // 3. Execute actions
        actions.forEach(action => {
            turnLog.push(`${activePlayer.name} использует действие: ${getActionLabel(action.type)}`);
        });

        // 4. Passive regen
        activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + RULES.PASSIVE_OM_REGEN);

        const isResting = actions.some(a => a.type === 'rest');
        if (isResting) {
            activePlayer.od = Math.min(activePlayer.maxOd, activePlayer.od + RULES.OD_REGEN_ON_REST);
             turnLog.push(`${activePlayer.name} отдыхает и восстанавливает ${RULES.OD_REGEN_ON_REST} ОД.`);
        }

        // Check for winner
        let winner;
        if (activePlayer.oz <= 0) winner = opponent.name;
        if (opponent.oz <= 0) winner = activePlayer.name;

        const newTurn: Turn = {
            turnNumber: prevDuel.currentTurn,
            playerId: activePlayer.id,
            playerName: activePlayer.name,
            actions: actions,
            log: turnLog,
            startStats: startStats,
            endStats: { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: activePlayer.shield },
        };
        
        setLog(turnLog);

        return {
            ...prevDuel,
            player1: prevDuel.activePlayerId === 'player1' ? activePlayer : opponent,
            player2: prevDuel.activePlayerId === 'player2' ? activePlayer : opponent,
            turnHistory: [...prevDuel.turnHistory, newTurn],
            currentTurn: prevDuel.currentTurn + 1,
            activePlayerId: prevDuel.activePlayerId === 'player1' ? 'player2' : 'player1',
            winner: winner,
            log: turnLog,
        };
    });
  };
  
  const resetDuel = () => {
    setDuel(null);
    setLog([]);
  };

  if (!duel) {
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
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users />
                        Настройка дуэли
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DuelSetup
                        initialPlayer1={initialPlayer1}
                        initialPlayer2={initialPlayer2}
                        onDuelStart={handleDuelStart}
                    />
                </CardContent>
            </Card>
        </main>
      </div>
    );
  }

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
              <CharacterPanel character={duel.player1} isActive={duel.activePlayerId === 'player1'} onUpdate={handleCharacterUpdate} />
              <CharacterPanel character={duel.player2} isActive={duel.activePlayerId === 'player2'} onUpdate={handleCharacterUpdate} />
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
                    opponent={opponent}
                    onSubmit={executeTurn}
                  />
                </CardContent>
              </Card>

              {log.length > 0 && (
                <Alert variant="default" className="border-primary">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <AlertTitle>События Хода</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {log.map((entry, i) => <li key={i}>{entry}</li>)}
                        </ul>
                    </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-8">
                <DiceRoller player={activePlayer} />
              </div>

              <DuelLog turns={duel.turnHistory} player1Name={duel.player1.name} player2Name={duel.player2.name} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
