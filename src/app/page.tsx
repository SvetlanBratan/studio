'use client';

import { useState, useEffect } from 'react';
import type { DuelState, Turn, Action, CharacterStats, ReserveLevel, ActionType } from '@/types/duel';
import CharacterPanel from '@/components/character-panel';
import TurnForm from '@/components/turn-form';
import DuelLog from '@/components/duel-log';
import DiceRoller from '@/components/dice-roller';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Gamepad2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RULES } from '@/lib/rules';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const getOmFromReserve = (reserve: ReserveLevel): number => RULES.OM_RESERVE[reserve] || 0;

const initialPlayer1: CharacterStats = {
  id: 'player1',
  name: 'Элара, Чародейка Времени',
  race: 'Тальен',
  reserve: 'Мастер',
  elementalKnowledge: 'Магия времени (Мастер)',
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
  cooldowns: { strongSpell: 0, item: 0, prayer: 0 },
};

const initialPlayer2: CharacterStats = {
  id: 'player2',
  name: 'Громмаш, Рыцарь Хаоса',
  race: 'Орк',
  reserve: 'Специалист',
  elementalKnowledge: 'Магия хаоса (Специалист), Магия огня (Специалист)',
  faithLevel: -1,
  physicalCondition: 'В полном здравии',
  bonuses: ['Расовая ярость (+10 к урону)', 'Боевая магия'],
  penalties: [],
  inventory: ['Зелье силы x1'],
  oz: 200,
  maxOz: 200,
  om: 270,
  maxOm: 270,
  od: 100,
  maxOd: 100,
  shield: 0,
  cooldowns: { strongSpell: 0, item: 0, prayer: 0 },
};

const initialDuelState: DuelState = {
  player1: initialPlayer1,
  player2: initialPlayer2,
  turnHistory: [],
  currentTurn: 1,
  activePlayerId: 'player1',
  winner: undefined,
  log: [],
};


export default function Home() {
  const [duel, setDuel] = useState<DuelState>(initialDuelState);

  // Choose first player randomly
  useEffect(() => {
    setDuel(prev => ({
      ...prev,
      activePlayerId: Math.random() < 0.5 ? 'player1' : 'player2'
    }))
  }, [])

  const handleCharacterUpdate = (updatedCharacter: CharacterStats) => {
    const newMaxOm = getOmFromReserve(updatedCharacter.reserve);
    const charData = { ...updatedCharacter, maxOm: newMaxOm };
    
    setDuel(prevDuel => ({
      ...prevDuel,
      player1: prevDuel.player1.id === charData.id ? charData : prevDuel.player1,
      player2: prevDuel.player2.id === charData.id ? charData : prevDuel.player2,
    }));
  };

  const executeTurn = (actions: Action[]) => {
    setDuel(prevDuel => {
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
            // ... action logic will be implemented here in next steps
            turnLog.push(`${activePlayer.name} использует действие: ${action.type}`);
        });

        // 4. Passive regen
        activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + RULES.PASSIVE_OM_REGEN);

        // A resting turn regenerates OD
        const isResting = !actions.some(a => ['dodge', 'use_item', 'prayer'].includes(a.type));
        if (isResting) {
            activePlayer.od = Math.min(activePlayer.maxOd, activePlayer.od + RULES.OD_REGEN_ON_REST);
        }

        // Check for winner
        let winner;
        if (duel.player1.oz <= 0) winner = duel.player2.name;
        if (duel.player2.oz <= 0) winner = duel.player1.name;

        const newTurn: Turn = {
            turnNumber: prevDuel.currentTurn,
            playerId: activePlayer.id,
            playerName: activePlayer.name,
            actions: actions,
            log: turnLog,
            startStats: startStats,
            endStats: { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: activePlayer.shield },
        };
        
        return {
            ...prevDuel,
            player1: prevDuel.activePlayerId === 'player1' ? activePlayer : opponent,
            player2: prevDuel.activePlayerId === 'player2' ? activePlayer : opponent,
            turnHistory: [...prevDuel.turnHistory, newTurn],
            currentTurn: prevDuel.currentTurn + 1,
            activePlayerId: prevDuel.activePlayerId === 'player1' ? 'player2' : 'player1',
            winner: winner,
            log: [], // Clear log for next turn
        };
    });
  };
  
  const resetDuel = () => {
    // Reset players to initial state but keep their potentially edited names etc.
    const p1Reset = { ...duel.player1, ...initialPlayer1, name: duel.player1.name, race: duel.player1.race };
    const p2Reset = { ...duel.player2, ...initialPlayer2, name: duel.player2.name, race: duel.player2.race };
    
    setDuel({
        ...initialDuelState,
        player1: { ...p1Reset, maxOm: getOmFromReserve(p1Reset.reserve) },
        player2: { ...p2Reset, maxOm: getOmFromReserve(p2Reset.reserve) },
        activePlayerId: Math.random() < 0.5 ? 'player1' : 'player2'
    });
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

              {duel.log.length > 0 && (
                <Alert variant="default" className="border-primary">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <AlertTitle>События Хода</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {duel.log.map((entry, i) => <li key={i}>{entry}</li>)}
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
