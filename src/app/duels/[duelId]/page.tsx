

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { firestore } from '@/lib/firestore';

import type { DuelState, Turn, Action, CharacterStats, ArmorType, WeaponType } from '@/types/duel';
import CharacterPanel from '@/components/character-panel';
import TurnForm from '@/components/turn-form';
import CharacterSetupModal from '@/components/character-setup-modal';
import SoloSetupForm from '@/components/solo-setup-form';
import PixelCharacter from '@/components/pixel-character';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Swords, Settings2, ShieldAlert, Check, ClipboardCopy, ArrowLeft, Ruler, Eye, ScrollText, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RULES, getActionLabel, RACES, initialPlayerStats, ELEMENTS, WEAPONS, ARMORS, ITEMS, createEnemy } from '@/lib/rules';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { updateDuel, joinDuel } from '@/lib/firestore';
import { deepClone } from '@/lib/utils';
import DuelLog from '@/components/duel-log';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


const getPhysicalCondition = (oz: number, maxOz: number): string => {
    const healthPercentage = (oz / maxOz) * 100;
    if (healthPercentage > 75) return 'В полном здравии';
    if (healthPercentage > 50) return 'Ранен';
    if (healthPercentage > 25) return 'Тяжело ранен';
    return 'Изнеможден';
};


export default function DuelPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const duelId = params.duelId as string;
  const isLocalSolo = duelId === 'solo';
  const isPvE = duelId === 'monster';
  
  const fromLabyrinth = searchParams.get('from') === 'labyrinth';
  const enemyId = searchParams.get('enemyId');

  const [localDuelState, setLocalDuelState] = useState<DuelState | null>(null);
  const [copied, setCopied] = useState(false);

  const duelRef = isLocalSolo || isPvE ? null : doc(firestore, 'duels', duelId);
  const [onlineDuel, onlineDuelLoading, onlineDuelError] = useDocumentData(duelRef);

  const duelData = isLocalSolo || isPvE ? localDuelState : (onlineDuel as DuelState | undefined);
  const duelLoading = authLoading || (isLocalSolo || isPvE ? false : onlineDuelLoading);

  useEffect(() => {
    if ((isLocalSolo || isPvE) && !localDuelState && user) {
        let player1;
        let duelStarted = false;

        if (fromLabyrinth) {
            const savedChar = sessionStorage.getItem('labyrinthCharacter');
            if (savedChar) {
                player1 = JSON.parse(savedChar);
                duelStarted = true;
            } else {
                router.push('/locations/labyrinth');
                return;
            }
        } else {
             player1 = initialPlayerStats(user.uid, 'Игрок 1');
        }

        const player2 = isPvE ? createEnemy() : initialPlayerStats('SOLO_PLAYER_2', 'Игрок 2');
        setLocalDuelState({
            player1,
            player2,
            turnHistory: [],
            currentTurn: 1,
            activePlayerId: 'player1',
            winner: null,
            log: [],
            createdAt: new Date(),
            duelStarted: duelStarted,
            distance: RULES.INITIAL_DISTANCE,
            animationState: { player1: 'idle', player2: 'idle' },
        });
    }
  }, [isLocalSolo, isPvE, localDuelState, user, fromLabyrinth, router]);
  
    useEffect(() => {
        if (duelData?.duelStarted && duelData.currentTurn === 1 && duelData.turnHistory.length === 0 && !duelData.log.some(l => l.includes('Первый ход'))) {
            const firstPlayer = Math.random() < 0.5 ? 'player1' : 'player2';
            handleUpdateDuelState({ 
                activePlayerId: firstPlayer,
                log: [`Первый ход определён случайно. Начинает ${firstPlayer === 'player1' ? duelData.player1.name : duelData.player2!.name}.`]
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duelData?.duelStarted]);

    // Enemy AI turn logic
    useEffect(() => {
        if (isPvE && duelData && duelData.duelStarted && duelData.activePlayerId === 'player2' && !duelData.winner && duelData.player2) {
            
            const performEnemyTurn = () => {
                const enemyActions: Action[] = [];
                let tempEnemyState = deepClone(duelData.player2!);
                let tempDistance = duelData.distance;

                // AI tries to perform up to 2 actions
                for (let i = 0; i < RULES.MAX_ACTIONS_PER_TURN; i++) {
                    const enemy = tempEnemyState;
                    const weapon = WEAPONS[enemy.weapon];
                    const spellRange = RULES.SPELL_RANGES[enemy.reserve];
                    const hasMagic = enemy.elementalKnowledge.length > 0;
                    
                    let chosenAction: Action | null = null;
                    
                    const strongSpellCost = RULES.RITUAL_COSTS.strong;
                    const mediumSpellCost = RULES.RITUAL_COSTS.medium;
                    const smallSpellCost = RULES.RITUAL_COSTS.small;
                    const canUseStrongSpell = hasMagic && tempDistance <= spellRange && enemy.om >= strongSpellCost && enemy.cooldowns.strongSpell <= 0;
                    const canUseMediumSpell = hasMagic && tempDistance <= spellRange && enemy.om >= mediumSpellCost;
                    const canUseSmallSpell = hasMagic && tempDistance <= spellRange && enemy.om >= smallSpellCost;
                    const canUseWeapon = tempDistance <= weapon.range && enemy.od >= RULES.NON_MAGIC_COSTS.physical_attack;

                    // Priority 1: Strong Magic
                    if (canUseStrongSpell) {
                        const randomElement = enemy.elementalKnowledge[Math.floor(Math.random() * enemy.elementalKnowledge.length)];
                        chosenAction = { type: 'strong_spell', payload: { element: randomElement } };
                        tempEnemyState.om -= strongSpellCost;
                        tempEnemyState.cooldowns.strongSpell = RULES.COOLDOWNS.strongSpell;
                    } 
                    // Priority 2: Medium Magic
                    else if (canUseMediumSpell) {
                        const randomElement = enemy.elementalKnowledge[Math.floor(Math.random() * enemy.elementalKnowledge.length)];
                        chosenAction = { type: 'medium_spell', payload: { element: randomElement } };
                        tempEnemyState.om -= mediumSpellCost;
                    }
                     // Priority 3: Small Magic
                    else if (canUseSmallSpell) {
                        const randomElement = enemy.elementalKnowledge[Math.floor(Math.random() * enemy.elementalKnowledge.length)];
                        chosenAction = { type: 'small_spell', payload: { element: randomElement } };
                        tempEnemyState.om -= smallSpellCost;
                    }
                    // Priority 4: Weapon Attack
                    else if (canUseWeapon) {
                        chosenAction = { type: 'physical_attack', payload: { weapon: enemy.weapon } };
                        tempEnemyState.od -= RULES.NON_MAGIC_COSTS.physical_attack;
                    }
                    // Priority 5: Move closer
                    else {
                        let distanceToClose = 0;
                        if (hasMagic && tempDistance > spellRange) {
                            distanceToClose = tempDistance - spellRange;
                        } else if (tempDistance > weapon.range) {
                            distanceToClose = tempDistance - weapon.range;
                        }
                        
                        if (distanceToClose > 0) {
                           const moveCost = Math.abs(distanceToClose) * RULES.NON_MAGIC_COSTS.move_per_meter;
                           if (enemy.od >= moveCost) {
                               chosenAction = { type: 'move', payload: { distance: -distanceToClose } };
                               tempEnemyState.od -= moveCost;
                               tempDistance -= distanceToClose;
                           }
                        }
                    }

                    // Priority 6: Rest
                    if (!chosenAction) {
                        chosenAction = { type: 'rest', payload: {} };
                    }
                    
                    if (chosenAction) {
                        enemyActions.push(chosenAction);
                    }
                }

                if (enemyActions.length > 0) {
                    setTimeout(() => {
                        executeTurn(enemyActions);
                    }, 1000); 
                }
            };
            
            performEnemyTurn();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPvE, duelData?.activePlayerId, duelData?.duelStarted, duelData?.winner]);


  const userRole: 'player1' | 'player2' | 'spectator' | null = React.useMemo(() => {
    if (!user || !duelData) return null;
    if (isLocalSolo || isPvE) return 'player1';
    if (user.uid === duelData.player1.id) return 'player1';
    if (duelData.player2 && user.uid === duelData.player2.id) return 'player2';
    return 'spectator';
  }, [user, duelData, isLocalSolo, isPvE]);


  useEffect(() => {
    const shouldJoin = searchParams.get('join') === 'true';
    if (userRole === 'spectator' && duelData?.player1 && !duelData.player2 && shouldJoin && user) {
        joinDuel(duelId, user.uid, "Игрок 2");
    }
  }, [userRole, duelData, duelId, user, searchParams]);


  const handleUpdateDuelState = useCallback((updatedDuel: Partial<DuelState>) => {
    if (isLocalSolo || isPvE) {
        setLocalDuelState(prev => prev ? { ...prev, ...updatedDuel } as DuelState : null);
    } else {
        if (duelId) {
            updateDuel(duelId, updatedDuel);
        }
    }
  }, [isLocalSolo, isPvE, duelId]);

  const handleCharacterUpdate = (updatedCharacter: CharacterStats) => {
    if (!duelData) return;

    const isPlayer1 = duelData.player1.id === updatedCharacter.id;
    const key = isPlayer1 ? 'player1' : 'player2';
    
    let newState: Partial<DuelState> = {
        [key]: { ...updatedCharacter, isSetupComplete: true }
    };
    
    if (fromLabyrinth && isPlayer1) {
        sessionStorage.setItem('labyrinthCharacter', JSON.stringify(newState.player1));
    }


    const updatedFullState = { ...duelData, ...newState };

    if (updatedFullState.player1.isSetupComplete && updatedFullState.player2?.isSetupComplete && !updatedFullState.duelStarted) {
        newState.duelStarted = true;
    }

    handleUpdateDuelState(newState);
  };

  const handleSoloSetupComplete = (player1: CharacterStats, player2: CharacterStats) => {
    const newState: DuelState = {
        ...(localDuelState!),
        player1: { ...player1, isSetupComplete: true },
        player2: { ...player2, isSetupComplete: true },
        duelStarted: true,
    };
    handleUpdateDuelState(newState);
  };
  
  const copyDuelId = () => {
    navigator.clipboard.writeText(duelId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const executeTurn = (turnActions: Action[]) => {
    if (!duelData || !duelData.player1 || !duelData.player2) return;
        let actions = [...turnActions];
        const turnLog: string[] = [];
        let activePlayer = deepClone(duelData.activePlayerId === 'player1' ? duelData.player1 : duelData.player2);
        let opponentPlayer = deepClone(duelData.activePlayerId === 'player1' ? duelData.player2 : duelData.player1);
        let newDistance = duelData.distance;
        let animationState: DuelState['animationState'] = { player1: 'idle', player2: 'idle' };
        
        const startStats = { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: deepClone(activePlayer.shield) };
        
        // Reset one-turn flags at the beginning of the turn
        activePlayer.bonuses = activePlayer.bonuses.filter(b => b !== 'Облик желания (-5 урон)');
        activePlayer.statuses = activePlayer.statuses?.filter(s => s !== 'Был атакован в прошлом ходу' && s !== 'Не атаковал в прошлом ходу') || [];
        activePlayer.isDodging = false;
        
        // Mark if the player was attacked in the previous turn
        const lastTurn = duelData.turnHistory[duelData.turnHistory.length - 1];
        let wasAttackedLastTurn = false;
        let didNotAttackLastTurn = false;
        let damageTakenLastTurn = 0;
        
        if (lastTurn && lastTurn.playerId !== activePlayer.id) {
            wasAttackedLastTurn = lastTurn.log.some(log => log.includes(`${activePlayer.name} получает`) && log.includes('урона'));
            if(wasAttackedLastTurn) {
                activePlayer.statuses = activePlayer.statuses || [];
                activePlayer.statuses.push('Был атакован в прошлом ходу');
                turnLog.push(`Статус: ${activePlayer.name} был атакован в прошлом ходу.`);

                const damageLogs = lastTurn.log.filter(log => log.includes(`${activePlayer.name} получает`) && log.includes('урона'));
                damageLogs.forEach(log => {
                    const match = log.match(/получает (\d+) урона/);
                    if (match) {
                        damageTakenLastTurn += parseInt(match[1], 10);
                    }
                });

                if (damageTakenLastTurn > 50 && activePlayer.bonuses.includes('Боль превращения (+10 урон)')) {
                    turnLog.push(`Пассивная способность (Мириоды): ${activePlayer.name} получил сильный урон и его следующая атака будет усилена.`);
                }
                
                if (damageTakenLastTurn > 30 && activePlayer.bonuses.includes('Повесть боли (+10 ОМ)')) {
                    activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + 10);
                    turnLog.push(`Пассивная способность (Нарраторы): ${activePlayer.name} получил сильный урон и восстанавливает 10 ОМ.`);
                }
            } else {
                 activePlayer.statuses = activePlayer.statuses || [];
                 activePlayer.statuses.push('Не атаковал в прошлом ходу');
                 turnLog.push(`Статус: ${activePlayer.name} не атаковал в прошлом ходу.`);
                 didNotAttackLastTurn = true;
            }
        }
        
        if (opponentPlayer.race === 'Цынаре' && opponentPlayer.bonuses.includes('Гипнотический взгляд — враг теряет 10 ОД каждый ход.')) {
            activePlayer.od = Math.max(0, activePlayer.od - 10);
            turnLog.push(`Пассивная способность (Цынаре): ${opponentPlayer.name} влияет на ${activePlayer.name}, который теряет 10 ОД.`);
        }
        if (opponentPlayer.race === 'Призраки' && opponentPlayer.bonuses.includes('Ясновидение — враг теряет 5 ОМ каждый ход.')) {
            activePlayer.om = Math.max(0, activePlayer.om - 5);
            turnLog.push(`Пассивная способность (Призраки): ${opponentPlayer.name} влияет на ${activePlayer.name}, который теряет 5 ОМ.`);
        }
        if (opponentPlayer.race === 'Скелеты' && opponentPlayer.bonuses.includes('Холод нежизни — враг теряет 2 ОЗ каждый ход.')) {
            activePlayer.oz -= 2;
            turnLog.push(`Пассивная способность (Скелеты): ${opponentPlayer.name} влияет на ${activePlayer.name}, который теряет 2 ОЗ.`);
        }
        if(opponentPlayer.race === 'Сирены' && opponentPlayer.bonuses.includes('Очарование (враг тратит 10 ОД при атаке по сирене)')) {
            const charmEffect = 'Очарование (Сирена)';
            if (!activePlayer.penalties.includes(charmEffect)) {
                activePlayer.penalties.push(charmEffect);
                turnLog.push(`Пассивная способность (Сирены): ${activePlayer.name} очарован. Его действия будут стоить на 10 ОД больше.`);
            }
        }

        activePlayer.bonuses.forEach(bonus => {
            // OZ Regen
            if (bonus === 'Глубинная стойкость (+5 ОЗ/ход)' || bonus === 'Живучесть (+5 ОЗ/ход)' || bonus === 'Аура благословения (+5 ОЗ/ход)' || bonus === 'Мелодия исцеления (+5 ОЗ/ход)' || bonus === 'Предчувствие (+3 ОЗ/ход)' || bonus === 'Живая защита (+5 ОЗ/ход)') {
                const healAmount = bonus === 'Предчувствие (+3 ОЗ/ход)' ? 3 : 5;
                if (bonus === 'Живая защита (+5 ОЗ/ход)') {
                    const opponentLastTurn = duelData.turnHistory.find(t => t.turnNumber === duelData.currentTurn - 1 && t.playerId === opponentPlayer.id);
                    const opponentUsedElemental = opponentLastTurn?.actions.some(a => a.payload?.element && a.payload.element !== 'physical');
                    if (!opponentUsedElemental) return;
                    turnLog.push(`Пассивная способность (Кунари): Враг использовал стихийную атаку, ${activePlayer.name} восстанавливает ${healAmount} ОЗ.`);
                } else {
                     turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${healAmount} ОЗ.`);
                }
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + healAmount);
            }
            if (bonus === 'Исцеление (+10 ОЗ/ход)' || bonus === 'Глубокая регенерация (+10 ОЗ/ход)' || bonus === 'Грибница (+10 ОЗ/ход)') {
                const healAmount = 10;
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + healAmount);
                turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${healAmount} ОЗ.`);
            }
             if (bonus === 'Энергетический резонанс — +1 ОЗ каждый ход.') {
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 1);
                turnLog.push(`Пассивная способность (Энергетические вампиры): ${activePlayer.name} восстанавливает 1 ОЗ.`);
            }
            if (bonus === 'Регенерация (+5 ОЗ каждый второй ход)' && duelData.currentTurn % 2 === 0) {
                 const healAmount = 5;
                 activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + healAmount);
                 turnLog.push(`Пассивная способность (Вампиры): ${activePlayer.name} восстанавливает ${healAmount} ОЗ.`);
            }
            if (bonus === 'Регенерация (+5 ОЗ каждый ход)') {
                const healAmount = 5;
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + healAmount);
                turnLog.push(`Пассивная способность (Монстр): ${activePlayer.name} восстанавливает ${healAmount} ОЗ.`);
            }
            if(bonus === 'Сила очага (+10 ОЗ/ход без урона)' && !wasAttackedLastTurn) {
                const healAmount = 10;
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + healAmount);
                turnLog.push(`Пассивная способность (Домовые): ${activePlayer.name} не получал урон и восстанавливает ${healAmount} ОЗ.`);
            }
             if (bonus === 'Транс-шаман (2)') {
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 10);
                activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + 10);
                turnLog.push(`Пассивная способность (Псилаты): ${activePlayer.name} восстанавливает 10 ОЗ и 10 ОМ от Транс-шамана.`);
             }


            // OM Regen
            if (bonus === 'Этикет крови (+1 ОМ/ход)' || bonus === 'Холодный ум (+5 ОМ/ход)' || bonus === 'Слияние со стихией — +5 ОМ каждый ход.') {
                const omAmount = bonus.includes('5') ? 5 : 1;
                activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + omAmount);
                turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${omAmount} ОМ.`);
            }
            if (bonus === 'Звёздный резонанс (+10 ОМ/ход)' || bonus === 'Кристальная стабильность (+10 ОМ/ход)' || bonus === 'Единение с природой (+10 ОМ/ход)' || bonus === 'Друидическая связь (+10 ОМ/ход)' || bonus === 'Озарение (+10 ОМ каждый ход)' || bonus === 'Светлая энергия (+10 ОМ/ход)' || bonus === 'Эфирная стабильность — +10 ОМ каждый ход.') {
                const omAmount = 10;
                activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + omAmount);
                turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${omAmount} ОМ.`);
            }
            if ((bonus === 'Энергетический сосуд (+10 ОМ каждый второй ход)' || bonus === 'Хвостовой резерв (+10 ОМ каждый четный ход)' || bonus === 'Ритм крови (+10 ОМ в начале каждого второго хода)') && duelData.currentTurn % 2 === 0) {
                 const omAmount = 10;
                 activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + omAmount);
                 turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${omAmount} ОМ.`);
            }
             if (bonus === 'Призыв сердца (+10 ОМ каждый третий ход)' && duelData.currentTurn % 3 === 0) {
                const omAmount = 10;
                activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + omAmount);
                turnLog.push(`Пассивная способность (Ихо): ${activePlayer.name} восстанавливает ${omAmount} ОМ.`);
            }
        });

        for (const key in activePlayer.cooldowns) {
            const typedKey = key as keyof typeof activePlayer.cooldowns;
            if (activePlayer.cooldowns[typedKey] > 0) {
                activePlayer.cooldowns[typedKey]--;
            }
        }
        
        // Clear one-turn buffs
        activePlayer.bonuses = activePlayer.bonuses.filter(b => b !== 'Железный ёж' && b !== 'Инстинкт (-10 от этого урона)');

        activePlayer.penalties.forEach(p => {
            const isPoisonEffect = RULES.POISON_EFFECTS.some(dot => p.startsWith(dot.replace(/ \(\d+\)/, '')));
            if (isPoisonEffect && (activePlayer.bonuses.includes('Иммунитет к яду') || activePlayer.race === 'Куклы' || activePlayer.race === 'Скелеты' || activePlayer.bonuses.includes('Безжизненность — иммунитет к ядам и горению') || activePlayer.bonuses.includes('Бессмертие костей — иммунитет к ядам и горению'))) {
                 turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} имеет иммунитет к яду, урон от "${p}" не получен.`);
                 return;
            }
            if (isPoisonEffect && activePlayer.bonuses.includes('Очищение (+5 ОЗ от яда)')) {
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 5);
                turnLog.push(`Пассивная способность (Неониды): ${activePlayer.name} очищает яд и восстанавливает 5 ОЗ.`);
                return;
            }

            const isBurning = p.startsWith('Горение');
            if (isBurning && (activePlayer.bonuses.some(b => b === 'Иммунитет к огню' || b === 'Иммунитет к льду') || activePlayer.race === 'Куклы' || activePlayer.race === 'Скелеты' || (activePlayer.race === 'Саламандры' && activePlayer.bonuses.includes('Огненная суть — иммунитет к огню')) || activePlayer.bonuses.includes('Безжизненность — иммунитет к ядам и горению') || activePlayer.bonuses.includes('Бессмертие костей — иммунитет к ядам и горению'))) {
                const immunityType = activePlayer.bonuses.includes('Иммунитет к огню') ? 'огню' : 'льду';
                turnLog.push(`Иммунитет к ${immunityType}: урон от "${p}" не получен.`);
                return;
            }
             if (p.startsWith('Тление')) {
                activePlayer.oz -= 10;
                turnLog.push(`${activePlayer.name} получает 10 урона от эффекта "Тление".`);
            }


            if (RULES.DOT_EFFECTS.some(dot => p.startsWith(dot.replace(/ \(\d+\)/, '')))) {
                let damage = RULES.DOT_DAMAGE;
                if (activePlayer.bonuses.includes('Щепетильный нюх (-5 урона от яда)')) {
                    damage = Math.max(0, damage - 5);
                    turnLog.push(`Пассивная способность (Домовые): Скидка к урону от яда уменьшает урон до ${damage}.`);
                }
                if (activePlayer.penalties.includes('Штраф к отравлению (3)')) {
                    damage += 3;
                     turnLog.push(`Пассивная способность (Слизень): Штраф к отравлению увеличивает урон до ${damage}.`);
                }
                activePlayer.oz -= damage;
                turnLog.push(`${activePlayer.name} получает ${damage} урона от эффекта "${p}".`);
                animationState = { ...animationState, [duelData.activePlayerId]: 'hit' };
            }
        });

        if (activePlayer.om === 0 && activePlayer.bonuses.includes('Потеря формы (при снижении ОМ до 0 теряют 10 ОЗ)')) {
            activePlayer.oz -= 10;
            turnLog.push(`Пассивная способность (Нимфилус): ОМ на нуле, ${activePlayer.name} теряет 10 ОЗ.`);
        }
        
        actions = actions.filter(action => {
            if (action.type === 'remove_effect') {
                if (activePlayer.penalties.length > 0) {
                    const removablePenalties = activePlayer.penalties.filter(p => !p.startsWith('Штраф ОД'));
                    if (removablePenalties.length > 0) {
                        const removedEffect = removablePenalties[0];
                        activePlayer.penalties = activePlayer.penalties.filter(p => p !== removedEffect);
                        turnLog.push(`${activePlayer.name} использует действие: "Снять эффект" и снимает с себя эффект: "${removedEffect}".`);
                    }
                }
                return false; // Remove this action from the list to be processed later
            }
            return true;
        });

        // Handle "Frozen" effect by reducing actions
        const frozenIndex = activePlayer.penalties.findIndex(p => p.startsWith('Заморожен'));
        if (frozenIndex > -1) {
             turnLog.push(`${activePlayer.name} находится под эффектом "Заморожен" и теряет одно действие.`);
             if (actions.length > 1) {
                 actions = actions.slice(0, 1);
             }
             // Consume the effect
             const removedEffect = activePlayer.penalties.splice(frozenIndex, 1)[0];
             turnLog.push(`Эффект "${removedEffect}" был использован и снят.`);
        }
        
        if (activePlayer.penalties.some(p => p.startsWith('Удержание'))) {
            actions = actions.filter(a => ['remove_effect', 'rest'].includes(a.type));
            if (actions.length === 0) {
                 turnLog.push(`${activePlayer.name} находится под эффектом "Удержание" и пропускает ход, так как не было выбрано доступное действие.`);
                 actions.push({type: 'rest', payload: {name: 'Пропуск хода из-за Удержания'}});
            }
        }

        // Handle "lose action" effects
        const loseActionPenaltyIndex = activePlayer.penalties.findIndex(p => p.startsWith('Потеря действия'));
        if (loseActionPenaltyIndex > -1) {
             turnLog.push(`${activePlayer.name} теряет одно действие из-за штрафа.`);
             // The turn-form will already limit actions to 1, so we just remove the penalty here.
             activePlayer.penalties.splice(loseActionPenaltyIndex, 1);
        }

        const applyEffect = (target: CharacterStats, effect: string, duration?: number) => {
            const effectName = effect.split(' (')[0];
            const finalEffect = duration ? `${effectName} (${duration})` : effect;
            
            const immunityCheck = `Иммунитет к ${effectName.toLowerCase()}`;
            if (target.bonuses.some(b => b.toLowerCase().startsWith(immunityCheck))) {
                 turnLog.push(`${target.name} имеет иммунитет к эффекту "${effectName}" и он не был наложен.`);
                 return;
            }
            if ((effectName === 'Горение' && (target.bonuses.some(b => b === 'Иммунитет к огню' || b === 'Иммунитет к льду') || target.race === 'Куклы' || target.race === 'Скелеты' || (target.race === 'Саламандры' && target.bonuses.includes('Огненная суть — иммунитет к огню')) || target.bonuses.includes('Безжизненность — иммунитет к ядам и горению') || target.bonuses.includes('Бессмертие костей — иммунитет к ядам и горению'))) ||
                (effectName === 'Отравление' && (target.race === 'Куклы' || target.race === 'Скелеты' || target.bonuses.includes('Безжизненность — иммунитет к ядам и горению') || target.bonuses.includes('Бессмертие костей — иммунитет к ядам и горению')))) {
                turnLog.push(`${target.name} имеет иммунитет к ${effectName}, и эффект не был наложен.`);
                return;
            }
            if (effectName.includes('замедления') && target.bonuses.includes('Иммунитет к паутине')) {
                turnLog.push(`Пассивная способность (Арахнии): ${target.name} имеет иммунитет к замедлению, эффект не наложен.`);
                return;
            }
            
            if (effectName === 'Заморожен' && target.bonuses.some(b => b === 'Иммунитет к льду' || b === 'Теплокровность (+50 иммунитет к огню)')) {
                 turnLog.push(`${target.name} имеет иммунитет к заморозке.`);
                 return;
            }

            const existingEffectIndex = target.penalties.findIndex(p => p.startsWith(effectName));

            if (existingEffectIndex > -1) {
                const existingEffect = target.penalties[existingEffectIndex];
                const existingMatch = existingEffect.match(/\((\d+)\)/);
                const newMatch = finalEffect.match(/\((\d+)\)/);

                if (existingMatch && newMatch) {
                    const existingDuration = parseInt(existingMatch[1], 10);
                    const newDuration = parseInt(newMatch[1], 10);
                    if (newDuration > existingDuration) {
                        target.penalties[existingEffectIndex] = finalEffect;
                        turnLog.push(`Эффект "${effectName}" на ${target.name} был обновлен.`);
                    }
                }
            } else {
                target.penalties.push(finalEffect);
                turnLog.push(`${target.name} получает эффект "${finalEffect}".`);
            }
        };

        const applyDamage = (attacker: CharacterStats, target: CharacterStats, amount: number, isSpell: boolean, spellElement?: string, isPhysical: boolean = !isSpell) => {
            let finalDamage = amount;
            let damageDealtToTarget = 0;
            const opponentPlayerId = duelData.activePlayerId === 'player1' ? 'player2' : 'player1';
            
            if (target.isDodging) {
                if (isSpell && newDistance < 10) {
                    finalDamage = Math.max(0, finalDamage - RULES.DODGE_VS_STRONG_SPELL_DMG_REDUCTION);
                    turnLog.push(`Уворот от мощного заклинания вблизи! ${target.name} поглощает ${RULES.DODGE_VS_STRONG_SPELL_DMG_REDUCTION} урона.`);
                } else {
                    const dodgeRoll = Math.floor(Math.random() * 10) + 1;
                    turnLog.push(`${target.name} пытается увернуться... Бросок: ${dodgeRoll}.`);
                    if (dodgeRoll >= 6) {
                        finalDamage *= 0.5;
                        turnLog.push(`Уворот успешен! ${target.name} получает на 50% меньше урона.`);
                    } else {
                        turnLog.push(`Уворот не удался. ${target.name} получает полный урон.`);
                    }
                }
            }
            
            const autoDodgeIndex = target.bonuses.findIndex(b => b.startsWith('Авто-уклонение'));
            if (autoDodgeIndex > -1) {
                const match = target.bonuses[autoDodgeIndex].match(/\((\d+)\)/);
                if (match) {
                    let duration = parseInt(match[1], 10) - 1;
                    target.isDodging = true;
                    turnLog.push(`Пассивная способность (Хамелеоны): ${target.name} автоматически уклоняется.`);
                    if (duration > 0) {
                        target.bonuses[autoDodgeIndex] = `Авто-уклонение (${duration})`;
                    } else {
                        target.bonuses.splice(autoDodgeIndex, 1);
                    }
                }
            }


            if (target.bonuses.includes('Переформа')) {
                turnLog.push(`Пассивная способность (Слизни): ${target.name} находится в неуязвимой форме и игнорирует весь урон.`);
                return;
            }

            if ((isPhysical && (target.bonuses.includes('Временной отпечаток (иммунитет к физическому урону)') || target.race === 'Призраки' || target.bonuses.includes('Эфирная форма — иммунитет к физическим атакам.') || target.race === 'Жнецы'))) {
                turnLog.push(`Пассивная способность (${target.race}): ${target.name} имеет иммунитет к физическому урону.`);
                return;
            }

            if (target.penalties.some(p => p.startsWith('Скрытность'))) {
                turnLog.push(`${target.name} находится в скрытности и избегает урона.`);
                return;
            }

            if (isSpell && spellElement) {
                const immunityString = `Иммунитет к ${spellElement.toLowerCase()}`;
                 if (target.race === 'Духи' && target.bonuses.includes('Сопротивление воздействию — -20 урона от стихий.')) {
                    finalDamage = Math.max(0, finalDamage - 20);
                    turnLog.push(`Пассивная способность (Духи): ${target.name} получает на 20 меньше урона от стихий.`);
                }
                if (target.bonuses.some(b => b === `Лёд в венах (-30 урона от атак стихии льда)` && spellElement === 'Лёд')) {
                    finalDamage = Math.max(0, finalDamage - 30);
                    turnLog.push(`Пассивная способность (Снежные эльфы): ${target.name} получает на 30 меньше урона от льда.`);
                }
                 if (target.bonuses.some(b => b === `Электроустойчивость (-50 урона от атак стихии молний)` && spellElement === 'Молния')) {
                    finalDamage = Math.max(0, finalDamage - 50);
                    turnLog.push(`Пассивная способность (Оприты): ${target.name} получает на 50 меньше урона от молнии.`);
                }
                if (target.bonuses.some(b => b === `Теплокровность (+50 иммунитет к огню)` && spellElement === 'Огонь')) {
                    finalDamage = Math.max(0, finalDamage - 50);
                    turnLog.push(`Пассивная способность (Фениксы): ${target.name} получает на 50 меньше урона от огня.`);
                }
                if (target.bonuses.some(b => b.toLowerCase() === immunityString || (b === 'Огненная суть — иммунитет к огню' && spellElement === 'Огонь'))) {
                    turnLog.push(`${target.name} имеет иммунитет к стихии "${spellElement}" и не получает урон.`);
                    return;
                }
                 if (target.bonuses.includes('Понимание звёзд (-5 урона от стихий света и эфира)') && (spellElement === 'Свет' || spellElement === 'Эфир')) {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (Астролоиды): ${target.name} получает на 5 меньше урона от света/эфира.`);
                }
                 if (target.bonuses.includes('Вибрация чувств (-5 урона от звуковых и эфирных атак)') && (spellElement === 'Звук' || spellElement === 'Эфир')) {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (Ихо): ${target.name} получает на 5 меньше урона от звука/эфира.`);
                }
                if (target.bonuses.includes('Чуткий слух (-10 урона от атак, связанных со звуком или воздушной магией)') && (spellElement === 'Звук' || spellElement === 'Воздух')) {
                    finalDamage = Math.max(0, finalDamage - 10);
                    turnLog.push(`Пассивная способность (Джакали): ${target.name} получает на 10 меньше урона от звука/воздуха.`);
                }
                 if (target.bonuses.includes('Перья теней (-10 урона от магии воздуха)') && spellElement === 'Воздух') {
                    finalDamage = Math.max(0, finalDamage - 10);
                    turnLog.push(`Пассивная способность (Рариты): ${target.name} получает на 10 меньше урона от воздуха.`);
                }
                if (target.bonuses.includes('Биосвечение (-5 урона от получаемых атак света и воды)') && (spellElement === 'Свет' || spellElement === 'Вода')) {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (Неониды): ${target.name} получает на 5 меньше урона от света/воды.`);
                }
                 if (target.bonuses.includes('Усиленный слух (-5 урона от звуковых атак)') && spellElement === 'Звук') {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (Полузаи): ${target.name} получает на 5 меньше урона от звуковых атак.`);
                }
                if (target.bonuses.includes('Хрупкость (+10 к получаемому урону от огня и льда)') && (spellElement === 'Огонь' || spellElement === 'Лёд')) {
                    finalDamage += 10;
                    turnLog.push(`Пассивная способность (Дриады): ${target.name} получает на 10 больше урона от огня/льда.`);
                }
                if (target.bonuses.includes('Уязвимость к свету и огню (+10 урона от этих стихий)') && (spellElement === 'Свет' || spellElement === 'Огонь')) {
                    finalDamage += 10;
                    turnLog.push(`Пассивная способность (Кордеи): ${target.name} получает на 10 больше урона от света/огня.`);
                }
                if (target.bonuses.includes('Темная выдержка (-10 урона от атак тьмы)') && spellElement === 'Тьма') {
                    finalDamage = Math.max(0, finalDamage - 10);
                    turnLog.push(`Пассивная способность (Дроу): ${target.name} получает на 10 меньше урона от тьмы.`);
                }
                if (target.bonuses.includes('Светлая броня (-10 урона от тьмы)') && spellElement === 'Тьма') {
                    finalDamage = Math.max(0, finalDamage - 10);
                    turnLog.push(`Пассивная способность (Светоликие): ${target.name} получает на 10 меньше урона от тьмы.`);
                }
                 if (target.bonuses.includes('Прозрение (-5 урона от атак тьмы)') && spellElement === 'Тьма') {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (Солнечные эльфы): ${target.name} получает на 5 меньше урона от тьмы.`);
                }
                if (target.bonuses.includes('Холод утраты (+5 урона от атак света)') && spellElement === 'Свет') {
                    finalDamage += 5;
                    turnLog.push(`Пассивная способность (Проклятые): ${target.name} получает на 5 больше урона от света.`);
                }
                 if (target.bonuses.includes('Слияние с сумраком (-10 урона от атак света)') && spellElement === 'Свет') {
                    finalDamage = Math.max(0, finalDamage - 10);
                    turnLog.push(`Пассивная способность (Тени): ${target.name} получает на 10 меньше урона от света.`);
                }
                if (target.bonuses.includes('Водная грация (-5 урона, если враг атакует водой)') && spellElement === 'Вода') {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (Сирены): ${target.name} получает на 5 меньше урона от воды.`);
                }
                 if (target.bonuses.includes('Водная адаптация (-10 урона от атак воды и холода)') && (spellElement === 'Вода' || spellElement === 'Лёд')) {
                    finalDamage = Math.max(0, finalDamage - 10);
                    turnLog.push(`Пассивная способность (Тритоны): ${target.name} получает на 10 меньше урона от воды и холода.`);
                }
            }
            
            if (target.bonuses.includes('Железный ёж') && isSpell) {
                turnLog.push(`Способность "Железный ёж": ${target.name} поглощает весь магический урон.`);
                target.bonuses = target.bonuses.filter(b => b !== 'Железный ёж'); // Remove after use
                target.shield.hp += RULES.BASE_SHIELD_VALUE;
                target.shield.element = null; // Physical shield
                turnLog.push(`Способность "Железный ёж": ${target.name} получает физический щит прочностью ${RULES.BASE_SHIELD_VALUE}.`);
                return; // No damage taken
            }

            // --- Damage Reduction Passives ---
            if (target.bonuses.includes('Аморфное тело (-10 урон)') || target.bonuses.includes('Экзоскелет (-10 урона от атак)') || target.bonuses.includes('Изворотливость (-10 урона от всех атак)') || target.bonuses.includes('Стойкость гиганта (-10 урона от всех атак)') || target.bonuses.includes('Боль в отдалении (-10 урона от всех атак)') ) {
                finalDamage = Math.max(0, finalDamage - 10);
                turnLog.push(`Пассивная способность (${target.race}): урон снижен на 10.`);
            }
             if (target.bonuses.includes('Танец грации — -10 урона от атак, пока ОЗ выше 100.') && target.oz > 100) {
                 finalDamage = Math.max(0, finalDamage - 10);
                 turnLog.push(`Пассивная способность (Цынаре): урон снижен на 10.`);
            }
            if (target.bonuses.includes('Проницательность (-5 урона от любого источника)') || target.bonuses.includes('Разрыв личности (-5 урона от всех атак)') || target.bonuses.includes('Уворот (-5 урона от всех атак)')) {
                finalDamage = Math.max(0, finalDamage - 5);
                turnLog.push(`Пассивная способность (${target.race}): урон снижен на 5.`);
            }
             if (target.bonuses.includes('Магический тело — -5 урона от всех атак, если текущий ОМ выше 50.') && target.om > 50) {
                 finalDamage = Math.max(0, finalDamage - 5);
                 turnLog.push(`Пассивная способность (Ятанаги): урон снижен на 5.`);
            }
            if (target.bonuses.includes('Облик желания (-5 урон)')) {
                 finalDamage = Math.max(0, finalDamage - 5);
                 turnLog.push(`Пассивная способность (Бракованные пересмешники): Облик желания снижает урон на 5.`);
            }
            if ((target.bonuses.includes('Истинное благородство (-5 урона от любых способностей, если ОЗ выше 150)') || target.bonuses.includes('Венец жизни (-5 урона от атак, если ОЗ выше 150)')) && target.oz > 150) {
                 finalDamage = Math.max(0, finalDamage - 5);
                 turnLog.push(`Пассивная способность (${target.race}): урон снижен на 5.`);
            }
            if (target.bonuses.includes('Иллюзорное движение — -10 урона от первой атаки в каждом ходе.') || target.bonuses.includes('Смена облика (-10 урона от первой атаки противника)') || target.bonuses.includes('Скрытность (-10 урона от первой атаки)')) {
                 const firstHitIndex = target.bonuses.findIndex(b => b.startsWith('Иллюзорное движение') || b.startsWith('Смена облика') || b.startsWith('Скрытность'));
                 if (firstHitIndex > -1) {
                    finalDamage = Math.max(0, finalDamage - 10);
                    target.bonuses.splice(firstHitIndex, 1);
                    turnLog.push(`Пассивная способность (${target.race}): урон от первой атаки снижен на 10.`);
                 }
            }
             if (target.bonuses.includes('Инстинкт (-10 от этого урона)')) {
                 const firstHitIndex = target.bonuses.indexOf('Инстинкт (-10 от этого урона)');
                 if (firstHitIndex > -1) {
                    finalDamage = Math.max(0, finalDamage - 10);
                    target.bonuses.splice(firstHitIndex, 1);
                    turnLog.push(`Пассивная способность (Оборотни): Инстинкт снижает урон на 10.`);
                 }
            }
            if (target.bonuses.includes('Иллюзии плоти (-10 урона от первой атаки в дуэли)') && duelData.turnHistory.length < 2) {
                 const firstHitIndex = target.bonuses.indexOf('Иллюзии плоти (-10 урона от первой атаки в дуэли)');
                 if (firstHitIndex > -1) {
                    finalDamage = Math.max(0, finalDamage - 10);
                    target.bonuses.splice(firstHitIndex, 1);
                    turnLog.push(`Пассивная способность (Джинны): Иллюзии плоти снижают урон на 10.`);
                 }
            }
             if (target.bonuses.includes('Хладнокровие (-5 урона если ОЗ > 150)') && target.oz > 150) {
                 finalDamage = Math.max(0, finalDamage - 5);
                 turnLog.push(`Пассивная способность (Монстр): Хладнокровие снижает урон на 5.`);
             }
             if (target.bonuses.includes('Толстая шкура (-10 урона от первой атаки)')) {
                 const firstHitIndex = target.bonuses.indexOf('Толстая шкура (-10 урона от первой атаки)');
                 if (firstHitIndex > -1) {
                     finalDamage = Math.max(0, finalDamage - 10);
                     target.bonuses.splice(firstHitIndex, 1);
                     turnLog.push(`Пассивная способность (Монстр): Толстая шкура снижает урон от первой атаки на 10.`);
                 }
             }

            // --- Physical/Spell Specific ---
            if(isPhysical) {
                 if (target.bonuses.includes('Ипостась силы — -10 урона от физических атак.')) {
                    finalDamage = Math.max(0, finalDamage - 10);
                    turnLog.push(`Пассивная способность (Химеры): физ. урон снижен на 10.`);
                }
                 if (target.bonuses.includes('Гибкость (-5 урона от физических атак)') || target.bonuses.includes('Шестиглазое зрение (- 5 от урона физических атак)') || target.bonuses.includes('Воинская форма (-5 урона от физических атак)') || target.bonuses.includes('Насекомая стойкость (-5 урона от физических атак)') || target.bonuses.includes('Прочная шкура (-5 урона от физических атак)') || target.bonuses.includes('Грация охотника (-5 урона от физических атак)')) {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (${target.race}): физ. урон снижен на 5.`);
                 }
                 if (target.bonuses.includes('Скальная шкура (-10 урона от физических атак)') || target.bonuses.includes('Чешуя предков (-10 урона от всех физических атак)') || target.bonuses.includes('Хитиновый покров (-10 урона от физических атак)') || target.bonuses.includes('Воздушный рывок (-10 урона от атак ближнего боя)') || target.bonuses.includes('Скользкость (-10 урона от физических атак)')) {
                    finalDamage = Math.max(0, finalDamage - 10);
                    turnLog.push(`Пассивная способность (${target.race}): физ. урон снижен на 10.`);
                 }
                 if (target.bonuses.includes('Лёгкие кости (+5 урона к получаемым физическим атакам)')) {
                    finalDamage += 5;
                    turnLog.push(`Пассивная способность (Дриды): физ. урон увеличен на 5.`);
                 }
                 if (attacker.race === 'Энергетические вампиры' && attacker.bonuses.includes('Аура желания — враг теряет 10 ОМ при физической атаке.')) {
                    target.om = Math.max(0, target.om - 10);
                    turnLog.push(`Пассивная способность (Энергетические вампиры): ${target.name} теряет 10 ОМ.`);
                 }
                 if (target.bonuses.includes('Панцирь (-10 урона от физических атак)')) {
                     finalDamage = Math.max(0, finalDamage - 10);
                     turnLog.push(`Пассивная способность (Монстр): Панцирь снижает физ. урон на 10.`);
                 }
                 if (target.bonuses.includes('Слизь (-5 урона от физической атаки)')) {
                     finalDamage = Math.max(0, finalDamage - 5);
                     turnLog.push(`Пассивная способность (Монстр): Слизь снижает физ. урон на 5.`);
                 }
            }
            if(isSpell) {
                if (target.race === 'Ларимы' && target.bonuses.includes('Поглощение магии, регенерация от физ. атак')) {
                    turnLog.push(`Пассивная способность (Ларимы): ${target.name} поглощает весь магический урон.`);
                    return;
                }
                if (target.bonuses.includes('Магический резонанс (-5 урона от заклинаний)') || target.bonuses.includes('Истинное слово (-5 урона от заклинаний)')) {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (${target.race}): магический урон снижен на 5.`);
                }
                 if (target.bonuses.includes('Духовное зрение (-5 урона от заклинаний духовного типа)') && spellElement && ['Эфир', 'Свет', 'Тьма', 'Жизнь', 'Смерть'].includes(spellElement)) {
                    finalDamage = Math.max(0, finalDamage - 5);
                    turnLog.push(`Пассивная способность (Псилаты): магический урон от духовных атак снижен на 5.`);
                 }
                if (target.bonuses.includes('Земная устойчивость (-10 урона от магических атак врага)') || target.bonuses.includes('Иллюзорный обман (-10 урона от магических атак врага)') || target.bonuses.includes('Светлая душа (-10 урона от магии эфира, света и иллюзий)') || target.bonuses.includes('Око истины (-30 урона от иллюзий и заклинаний)')) {
                    let text = `Пассивная способность (${target.race}):`;
                    if(target.race === 'Кунари' && spellElement && !['Эфир', 'Свет', 'Иллюзии'].includes(spellElement)){
                       // no reduction
                    } else if (target.race === 'Сфинксы' && spellElement && !['Иллюзии'].includes(spellElement)) {
                       // no reduction
                    } else {
                        const reduction = target.race === 'Сфинксы' ? 30 : 10;
                        finalDamage = Math.max(0, finalDamage - reduction);
                        turnLog.push(`${text} магический урон снижен на ${reduction}.`);
                    }
                }
                 if (attacker.bonuses.includes('Магопоглощение (+10 ОМ каждый ход при попадании под заклинание)')) {
                    attacker.om = Math.min(attacker.maxOm, attacker.om + 10);
                    turnLog.push(`Пассивная способность (Слизни): ${attacker.name} поглощает магию и восстанавливает 10 ОМ.`);
                }
            }

            if(isSpell && spellElement === 'Звук' && target.bonuses.includes('Слух обострён (-10 урона от звуковых атак)')) {
                finalDamage = Math.max(0, finalDamage - 10);
                turnLog.push(`Пассивная способность (Антропоморфы): урон от звука снижен на 10.`);
            }
             if (isSpell && spellElement === 'Лёд' && target.bonuses.includes('Шерсть стужи (-10 урона от атак стихии льда)')) {
                 finalDamage = Math.max(0, finalDamage - 10);
                 turnLog.push(`Пассивная способность (Монстр): Шерсть стужи снижает урон от льда на 10.`);
             }
             if (isSpell && spellElement === 'Огонь' && target.bonuses.includes('Раскалённая кожа (-10 урона от огненных атак)')) {
                 finalDamage = Math.max(0, finalDamage - 10);
                 turnLog.push(`Пассивная способность (Монстр): Раскалённая кожа снижает урон от огня на 10.`);
             }
             if (isSpell && spellElement === 'Звук' && target.bonuses.includes('Громовая броня (-10 урона от звуковых атак)')) {
                 finalDamage = Math.max(0, finalDamage - 10);
                 turnLog.push(`Пассивная способность (Монстр): Громовая броня снижает урон от звука на 10.`);
             }

            if (isSpell) {
                if (spellElement === 'Вода') {
                    const burningIndex = target.penalties.findIndex(p => p.startsWith('Горение'));
                    if (burningIndex > -1) {
                        const removedEffect = target.penalties.splice(burningIndex, 1)[0];
                        turnLog.push(`Стихия Воды тушит эффект "${removedEffect}" на ${target.name}.`);
                    }
                    applyEffect(target, 'Мокрый', 2);
                }
                if (spellElement === 'Лёд') {
                     const wetIndex = target.penalties.findIndex(p => p.startsWith('Мокрый'));
                     if (wetIndex > -1) {
                        target.penalties.splice(wetIndex, 1);
                        turnLog.push(`Эффект "Мокрый" на ${target.name} был использован для заморозки.`);
                        applyEffect(target, 'Заморожен', 1);
                     }
                }
                 if (spellElement === 'Огонь') {
                    const wetIndex = target.penalties.findIndex(p => p.startsWith('Мокрый'));
                    if (wetIndex > -1) {
                        target.penalties.splice(wetIndex, 1);
                        turnLog.push(`Огонь высушивает эффект "Мокрый" на ${target.name}.`);
                    }
                    const frozenIndex = target.penalties.findIndex(p => p.startsWith('Заморожен'));
                    if (frozenIndex > -1) {
                        target.penalties.splice(frozenIndex, 1);
                        turnLog.push(`Огонь растапливает лед, снимая эффект "Заморожен" с ${target.name}.`);
                    }
                }
            }
            

            finalDamage = Math.round(finalDamage);

            if (target.shield.hp > 0) {
                 if (target.shield.element === 'Эфир' && isSpell) {
                    turnLog.push(`Эфирный щит ${target.name} полностью поглощает магический урон.`);
                    return;
                }
                
                if (spellElement && target.shield.element) {
                    const shieldElementInfo = ELEMENTS[target.shield.element];
                    if (shieldElementInfo && shieldElementInfo.weakTo.includes(spellElement)) {
                        finalDamage *= RULES.ELEMENTAL_VULNERABILITY_MULTIPLIER;
                        turnLog.push(`Стихия "${spellElement}" уязвима для щита "${target.shield.element}"! Урон по щиту удвоен.`);
                    }
                }

                const absorbedDamage = Math.min(target.shield.hp, finalDamage);
                target.shield.hp -= absorbedDamage;
                const remainingDamage = finalDamage - absorbedDamage;

                turnLog.push(`Щит ${target.name} поглощает ${absorbedDamage} урона.`);
                if (target.shield.hp <= 0) {
                    turnLog.push(`Щит ${target.name} был уничтожен.`);
                    target.shield.element = null;
                }

                if (remainingDamage > 0) {
                    target.oz -= remainingDamage;
                    damageDealtToTarget = remainingDamage;
                    turnLog.push(`${target.name} получает ${remainingDamage} урона, пробившего щит.`);
                }
            } else {
                target.oz -= finalDamage;
                damageDealtToTarget = finalDamage;
                turnLog.push(`${target.name} получает ${finalDamage} урона.`);
            }

            if (damageDealtToTarget > 0) {
                animationState = { ...animationState, [opponentPlayerId]: 'hit' };
            }
            
            if (target.race === 'Безликие' && damageDealtToTarget > 0) {
                attacker.oz -= damageDealtToTarget;
                turnLog.push(`Пассивная способность (Безликий): отзеркаливает ${damageDealtToTarget} урона обратно в ${attacker.name}!`);
            }
             if (isPhysical && target.race === 'Ларимы' && damageDealtToTarget > 0) {
                const healedAmount = Math.round(damageDealtToTarget / 2);
                target.oz = Math.min(target.maxOz, target.oz + healedAmount);
                turnLog.push(`Пассивная способность (Ларимы): регенерация от физической атаки восстанавливает ${healedAmount} ОЗ.`);
             }

             if (damageDealtToTarget > 40 && target.race === 'Химеры') {
                 target.oz = Math.min(target.maxOz, target.oz + 10);
                 turnLog.push(`Пассивная способность (Химеры): ${target.name} восстанавливает 10 ОЗ после получения сильного урона.`);
             }
             if (damageDealtToTarget > 40 && target.race === 'Бракованные пересмешники') {
                 target.bonuses.push('Облик желания (-5 урон)');
                 turnLog.push(`Пассивная способность (Бракованные пересмешники): ${target.name} получает бонус "Облик желания" после получения сильного урона.`);
             }

            if (damageDealtToTarget > 0) {
                if(attacker.bonuses.includes('Скверна (при получении урона, противник теряет дополнительно 5 ОМ)')) {
                    target.om = Math.max(0, target.om - 5);
                    turnLog.push(`Пассивная способность (Проклятые): ${target.name} теряет 5 ОМ из-за скверны.`);
                }
                 if(target.bonuses.includes('Хищный флирт (при получении урона противник теряет 1 ОМ из-за ментального сбоя)')) {
                    attacker.om = Math.max(0, attacker.om - 1);
                    turnLog.push(`Пассивная способность (Рариты): ${attacker.name} теряет 1 ОМ из-за флирта.`);
                }
                 if(target.bonuses.includes('Отражение страха (при получении урона выше 40, враг теряет 10 ОМ)') && damageDealtToTarget > 40) {
                    attacker.om = Math.max(0, attacker.om - 10);
                    turnLog.push(`Пассивная способность (Тени): ${attacker.name} теряет 10 ОМ из-за страха.`);
                }
                if (attacker.bonuses.includes('При попадании: Накладывает кровотечение (2)')) {
                    applyEffect(target, 'Кровотечение', 2);
                }
                if (attacker.bonuses.includes('Эхолокация (+10 к урону при первом попадании в дуэли)')) {
                    const bonusIndex = attacker.bonuses.indexOf('Эхолокация (+10 к урону при первом попадании в дуэли)');
                    if (bonusIndex > -1) {
                        attacker.bonuses.splice(bonusIndex, 1);
                        turnLog.push(`Пассивная способность (Веспы) "Эхолокация" использована.`);
                    }
                }
                 if (attacker.bonuses.includes('Токсины слизи (наносит эффект отравления)')) {
                    applyEffect(target, 'Отравление', 1);
                    turnLog.push(`Пассивная способность (Гуриты) "Токсины слизи" накладывает отравление.`);
                }
                 if (attacker.bonuses.includes('Споры (противник получает -10 урона при следующей атаке)')) {
                    applyEffect(target, 'Ослабление (1)');
                    turnLog.push(`Пассивная способность (Миканиды) "Споры" ослабляет следующую атаку ${target.name}.`);
                }
                 if (attacker.bonuses.includes('Жало (враг теряет 5 ОЗ после атаки)')) {
                     const stingIndex = attacker.bonuses.indexOf('Жало (враг теряет 5 ОЗ после атаки)');
                     if (stingIndex > -1) {
                         target.oz -= 5;
                         turnLog.push(`Пассивная способность (Монстр): Жало наносит 5 урона ${target.name}.`);
                         attacker.bonuses.splice(stingIndex, 1); // one time effect
                     }
                 }
                 if (isPhysical && newDistance < 5 && attacker.bonuses.includes('Удушение (враг теряет 5 ОМ при атаке вблизи)')) {
                     target.om = Math.max(0, target.om - 5);
                     turnLog.push(`Пассивная способность (Монстр): Удушение заставляет ${target.name} потерять 5 ОМ.`);
                 }
            }
            
            if (target.oz < 30 && target.bonuses.includes('Перерождение (+50 ОЗ при падении ниже 30 ОЗ)')) {
                const bonusIndex = target.bonuses.indexOf('Перерождение (+50 ОЗ при падении ниже 30 ОЗ)');
                if(bonusIndex > -1) {
                    target.oz += 50;
                    target.bonuses.splice(bonusIndex, 1);
                    turnLog.push(`Пассивная способность (Фениксы): ${target.name} перерождается и восстанавливает 50 ОЗ.`);
                }
            }
            if (target.oz < 10 && target.bonuses.includes('Девять жизней (+50 ОЗ при падении ниже 10 ОЗ)')) {
                const bonusIndex = target.bonuses.indexOf('Девять жизней (+50 ОЗ при падении ниже 10 ОЗ)');
                 if(bonusIndex > -1) {
                    target.oz += 50;
                    target.bonuses.splice(bonusIndex, 1);
                    turnLog.push(`Пассивная способность (Полукоты): ${target.name} использует одну из девяти жизней и восстанавливает 50 ОЗ.`);
                }
            }
            
            if (isSpell && spellElement) {
                switch (spellElement) {
                    case 'Огонь':
                        applyEffect(target, 'Горение', 2);
                        break;
                }
            }
        };

        actions.forEach(action => {
            turnLog.push(`${activePlayer.name} использует действие: "${getActionLabel(action.type, action.payload)}".`);
            const isCastingAction = ['strong_spell', 'medium_spell', 'small_spell', 'household_spell', 'prayer'].includes(action.type);
            const isRangedWeapon = ['Кинжал', 'Сюрикены', 'Лук'].includes(activePlayer.weapon);

            const activePlayerId = duelData.activePlayerId;
            if (isCastingAction) {
                animationState = { 
                  ...animationState, 
                  [activePlayerId]: 'casting', 
                  spellElement: action.payload?.element 
                };
            }
            if (action.type === 'shield') {
                animationState = {
                    ...animationState,
                    [activePlayerId]: 'casting',
                    spellElement: undefined, // No projectile for shield
                };
            }
            if (action.type === 'physical_attack') {
                 if (isRangedWeapon) {
                     animationState = { ...animationState, [activePlayerId]: 'casting', weaponType: activePlayer.weapon };
                 } else {
                     animationState = { ...animationState, [activePlayerId]: 'attack' };
                 }
            }
             if (action.type === 'heal_self') {
                animationState = { ...animationState, [activePlayerId]: 'heal' };
            }
            if (action.type === 'rest') {
                animationState = { ...animationState, [activePlayerId]: 'rest' };
            }
            
            const getOdCostPenalty = (p: CharacterStats): { wound: number; armor: number; charm: number } => {
                let woundPenalty = 0;
                if (p.race !== 'Куклы' || !p.bonuses.includes('Абсолютная память — не тратится ОД.')) {
                    for (const wound of RULES.WOUND_PENALTIES) {
                        if (p.oz < wound.threshold) {
                            woundPenalty = wound.penalty;
                        }
                    }
                }
            
                const armorPenalty = ARMORS[p.armor as ArmorType]?.odPenalty ?? 0;
                
                const charmPenalty = p.penalties.some(p => p === 'Очарование (Сирена)') ? 10 : 0;
            
                return { wound: woundPenalty, armor: armorPenalty, charm: charmPenalty };
            };

            
            const isSpellAction = ['strong_spell', 'medium_spell', 'small_spell', 'racial_ability'].includes(action.type);
            const isHouseholdSpell = action.type === 'household_spell';
            const isShieldAction = action.type === 'shield';

            if ((isSpellAction || isHouseholdSpell) && activePlayer.race === 'Безликие') {
                if (!isHouseholdSpell) {
                    turnLog.push(`Действие "${getActionLabel(action.type, action.payload)}" не удалось: Безликие не могут использовать магию, кроме бытовой.`);
                    return; // Skip this action
                }
            }

            if ((isSpellAction || isHouseholdSpell || isShieldAction) && !action.type.startsWith('racial') && action.type !== 'heal_self' && activePlayer.elementalKnowledge.length === 0) {
                 turnLog.push(`Действие "${getActionLabel(action.type, action.payload)}" не удалось: у персонажа нет знаний стихий.`);
                 return;
            }
            
            const isSpellAttackAction = ['strong_spell', 'medium_spell', 'small_spell', 'household_spell'].includes(action.type);
            if (isSpellAttackAction && !isOpponentInRangeForSpells(activePlayer.reserve, newDistance)) {
                 const spellRange = RULES.SPELL_RANGES[activePlayer.reserve];
                 turnLog.push(`Действие "${getActionLabel(action.type, action.payload)}" не удалось: цель слишком далеко (${newDistance}м > ${spellRange}м).`);
                 return; // Skip this action
            }

            const calculateDamage = (baseDamage: number, isSpell: boolean = false, spellElement?: string): number => {
                let damage = baseDamage;
                
                if (opponentPlayer.penalties.includes('Уязвимость')) {
                    const bonus = isSpell ? RULES.DAMAGE_BONUS.vulnerability.medium : 5; // Placeholder for physical
                    damage += bonus;
                    turnLog.push(`Эффект "Уязвимость" увеличивает урон на ${bonus}.`);
                }
                
                const oslablenieIndex = opponentPlayer.penalties.findIndex(p => p.startsWith('Ослабление'));
                if (oslablenieIndex > -1) {
                    damage = Math.max(0, damage - 10);
                    opponentPlayer.penalties.splice(oslablenieIndex, 1);
                    turnLog.push(`Эффект "Ослабление" снижает урон ${activePlayer.name} на 10.`);
                }

                 if (activePlayer.bonuses.includes('Трансформация (+30 урон)')) {
                    const bonusIndex = activePlayer.bonuses.indexOf('Трансформация (+30 урон)');
                    if (bonusIndex > -1) {
                        damage += 30;
                        activePlayer.bonuses.splice(bonusIndex, 1);
                        turnLog.push(`Пассивная способность (Нимфилус): "Трансформация" увеличивает урон на 30.`);
                    }
                }
                 if (activePlayer.bonuses.includes('Единение с духами (+10 к урону от стихийных атак)') && isSpell) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Псилаты): "Единение с духами" увеличивает урон на 10.`);
                }
                 if (activePlayer.bonuses.includes('Стихийная преданность (+5 урона при атаке своей стихией)') && isSpell && spellElement && activePlayer.elementalKnowledge.includes(spellElement)) {
                    damage += 5;
                    turnLog.push(`Пассивная способность (Нимфилус): "Стихийная преданность" увеличивает урон на 5.`);
                }
                 if(activePlayer.bonuses.includes('Взрыв ярости (+10 урона по врагу в случае, если ОЗ ниже 100)') && activePlayer.oz < 100) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Оборотни): "Взрыв ярости" увеличивает урон на 10.`);
                }
                 if(activePlayer.bonuses.includes('Пылающий дух (+5 к урону, если ОЗ ниже 100)') && activePlayer.oz < 100) {
                    damage += 5;
                    turnLog.push(`Пассивная способность (Саламандры): "Пылающий дух" увеличивает урон на 5.`);
                }
                if (isSpell && activePlayer.bonuses.includes('Боевая магия')) {
                    const bonus = RULES.DAMAGE_BONUS.battle_magic[action.type as keyof typeof RULES.DAMAGE_BONUS.battle_magic] ?? 0;
                    damage += bonus;
                    turnLog.push(`Пассивный бонус "Боевая магия" увеличивает урон на ${bonus}.`);
                }
                 if (activePlayer.bonuses.includes('Расовая ярость (+10 к урону)')) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Орк): "Расовая ярость" увеличивает урон на 10.`);
                }
                if (activePlayer.bonuses.includes('Меткость— + 10 к урону')) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Алариены): "Меткость" увеличивает урон на 10.`);
                }
                 if (activePlayer.bonuses.includes('Боль превращения (+10 урон)')) {
                    const bonusIndex = activePlayer.bonuses.indexOf('Боль превращения (+10 урон)');
                    if (bonusIndex > -1) {
                        damage += 10;
                        activePlayer.bonuses.splice(bonusIndex, 1);
                        turnLog.push(`Пассивная способность (Мириоды) "Боль превращения" увеличивает урон на 10.`);
                    }
                }
                if (activePlayer.bonuses.includes('Воинская слава (+10 урона при контратаке)') && wasAttackedLastTurn) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Белояры): "Воинская слава" увеличивает урон на 10.`);
                }
                 if (activePlayer.bonuses.includes('Удар панциря (+5 урона при контратаке)') && wasAttackedLastTurn) {
                     damage += 5;
                     turnLog.push(`Пассивная способность (Монстр): "Удар панциря" увеличивает урон на 5.`);
                 }
                 if (activePlayer.bonuses.includes('Разгон (+5 урона если не атаковал)') && didNotAttackLastTurn) {
                     damage += 5;
                     turnLog.push(`Пассивная способность (Монстр): "Разгон" увеличивает урон на 5.`);
                 }
                if (activePlayer.bonuses.includes('Рёв предков (+5 урона по врагу, если персонаж был атакован в прошлом ходу)') && wasAttackedLastTurn) {
                    damage += 5;
                    turnLog.push(`Пассивная способность (Вулгары): "Рёв предков" увеличивает урон на 5.`);
                }
                if (activePlayer.bonuses.includes('Кровавое могущество (+10 урона, если ОЗ врага меньше 100)') && opponentPlayer.oz < 100) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Вампиры): "Кровавое могущество" увеличивает урон на 10.`);
                }
                 if (activePlayer.bonuses.includes('Эхолокация (+10 к урону при первом попадании в дуэли)')) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Веспы): "Эхолокация" увеличивает урон первой атаки на 10.`);
                }
                if (activePlayer.bonuses.includes('Драконья ярость (+10 урона, если получено более 40 урона за прошлый ход)') && damageTakenLastTurn > 40) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Драконы): "Драконья ярость" увеличивает урон на 10.`);
                }
                if (!isSpell && activePlayer.bonuses.includes('Удар крыла (+10 к физическим атакам)')) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Веспы): "Удар крыла" увеличивает физический урон на 10.`);
                }
                 if (!isSpell && activePlayer.bonuses.includes('Уверенность в прыжке (+10 к физическим атакам)')) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Полукоты): "Уверенность в прыжке" увеличивает физический урон на 10.`);
                }
                if (!isSpell && activePlayer.bonuses.includes('Сила кузни (+10 урона к физическим атакам по врагу)')) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Карлики): "Сила кузни" увеличивает физический урон на 10.`);
                }
                 if (opponentPlayer.bonuses.includes('Картина боли (враг получает +5 урона, если атакует дважды подряд)')) {
                    const playerLastTurn = duelData.turnHistory.find(t => t.turnNumber === duelData.currentTurn - 2);
                    if (playerLastTurn && playerLastTurn.actions.some(a => ['strong_spell', 'medium_spell', 'small_spell', 'household_spell', 'physical_attack'].includes(a.type))) {
                        damage += 5;
                        turnLog.push(`Пассивная способность (Лартисты): Враг атаковал дважды подряд, урон увеличен на 5.`);
                    }
                }

                return Math.round(damage);
            };
            
            if(isSpellAction && opponentPlayer.bonuses.includes('Беззвучие (противник теряет 5 ОМ)')) {
                activePlayer.om = Math.max(0, activePlayer.om - 5);
                turnLog.push(`Пассивная способность (Алахоры): ${opponentPlayer.name} искажает восприятие, ${activePlayer.name} теряет 5 ОМ.`);
            }
             if (opponentPlayer.bonuses.includes('Иллюзии (противник теряет 10 ОМ при первом применении любой способности)')) {
                const illusionIndex = opponentPlayer.bonuses.indexOf('Иллюзии (противник теряет 10 ОМ при первом применении любой способности)');
                if (illusionIndex > -1) {
                    activePlayer.om = Math.max(0, activePlayer.om - 10);
                    opponentPlayer.bonuses.splice(illusionIndex, 1);
                    turnLog.push(`Пассивная способность (Лепреконы): ${opponentPlayer.name} создает иллюзию, ${activePlayer.name} теряет 10 ОМ.`);
                }
            }

            let damageDealt = 0;
            const odPenalties = getOdCostPenalty(activePlayer);
            let odReduction = 0;
            if (activePlayer.bonuses.includes('Животная реакция (-5 ОД на физические действия)') || activePlayer.bonuses.includes('Ловкие конечности (-5 ОД на действия)') || activePlayer.bonuses.includes('Галоп (-5 ОД на действия)')) {
                odReduction = 5;
            }

            const getFinalOdCost = (baseCost: number, isMove: boolean = false) => {
                if (activePlayer.race === 'Куклы' && activePlayer.bonuses.includes('Абсолютная память — не тратится ОД.')) return 0;
                
                let moveReduction = 0;
                if (isMove && activePlayer.bonuses.includes('Быстрые мышцы (-5 ОД на действия, связанные с перемещением)')) {
                    moveReduction = 5;
                }
                
                const totalCost = baseCost + odPenalties.wound + odPenalties.armor + odPenalties.charm - odReduction - moveReduction;
                return Math.max(0, totalCost);
            };

            const logOdCost = (baseCost: number, finalCost: number) => {
                const penaltyDetails: string[] = [];
                if (odPenalties.wound > 0) penaltyDetails.push(`ранение: +${odPenalties.wound}`);
                if (odPenalties.armor > 0) penaltyDetails.push(`броня: +${odPenalties.armor}`);
                if (odPenalties.charm > 0) penaltyDetails.push(`очарование: +${odPenalties.charm}`);
                if (odReduction > 0) penaltyDetails.push(`бонус: -${odReduction}`);

                if (penaltyDetails.length > 0) {
                    turnLog.push(`Затраты ОД: ${finalCost} (база ${baseCost}, ${penaltyDetails.join(', ')})`);
                } else {
                    turnLog.push(`Затраты ОД: ${finalCost}`);
                }
            };


            switch(action.type) {
                case 'physical_attack': {
                    const weapon = WEAPONS[activePlayer.weapon as WeaponType];
                    const weaponRange = weapon.range;
                    if(newDistance > weaponRange) {
                        turnLog.push(`Действие "Атака оружием" не удалось: цель слишком далеко (${newDistance}м > ${weaponRange}м).`);
                        return;
                    }
                    const baseCost = RULES.NON_MAGIC_COSTS.physical_attack;
                    const finalCost = getFinalOdCost(baseCost);
                    if (activePlayer.od < finalCost) {
                        turnLog.push(`Действие "Атака оружием" не удалось: недостаточно ОД (требуется ${finalCost}, есть ${activePlayer.od}).`);
                        return;
                    }
                    activePlayer.od -= finalCost;
                    logOdCost(baseCost, finalCost);
                    damageDealt = calculateDamage(weapon.damage, false);
                    applyDamage(activePlayer, opponentPlayer, damageDealt, false, undefined, true);
                    if (activePlayer.weapon === 'Лук') {
                        activePlayer.cooldowns.physical_attack = RULES.COOLDOWNS.physical_attack;
                    }
                    break;
                }
                case 'strong_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.strong;
                    damageDealt = calculateDamage(RULES.RITUAL_DAMAGE[activePlayer.reserve]?.strong ?? 0, true, action.payload?.element);
                    applyDamage(activePlayer, opponentPlayer, damageDealt, true, action.payload?.element);
                    activePlayer.cooldowns.strongSpell = RULES.COOLDOWNS.strongSpell;
                    break;
                case 'medium_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.medium;
                    damageDealt = calculateDamage(RULES.RITUAL_DAMAGE[activePlayer.reserve]?.medium ?? 0, true, action.payload?.element);
                    applyDamage(activePlayer, opponentPlayer, damageDealt, true, action.payload?.element);
                    break;
                case 'small_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.small;
                    damageDealt = calculateDamage(RULES.RITUAL_DAMAGE[activePlayer.reserve]?.small ?? 0, true, action.payload?.element);
                    applyDamage(activePlayer, opponentPlayer, damageDealt, true, action.payload?.element);
                    break;
                case 'household_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.household;
                    damageDealt = calculateDamage(RULES.RITUAL_DAMAGE[activePlayer.reserve]?.household ?? 0, true, action.payload?.element);
                    applyDamage(activePlayer, opponentPlayer, damageDealt, true, action.payload?.element);
                    break;
                case 'heal_self': {
                    const healAmount = action.payload?.amount || 0;
                    const omCost = healAmount * 2;
                    activePlayer.om -= omCost;
                    activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + healAmount);
                    turnLog.push(`${activePlayer.name} восстанавливает ${healAmount} ОЗ за ${omCost} ОМ.`);
                    activePlayer.cooldowns.heal_self = RULES.COOLDOWNS.heal_self;
                    break;
                }
                case 'shield': {
                    const omCost = RULES.RITUAL_COSTS.medium;
                    if (activePlayer.om < omCost) {
                        turnLog.push(`Действие "Создать щит" не удалось: недостаточно ОМ (требуется ${omCost}, есть ${activePlayer.om}).`);
                        return;
                    }
                    activePlayer.om -= omCost;
                    activePlayer.shield.hp += RULES.BASE_SHIELD_VALUE;
                    activePlayer.shield.element = action.payload?.element || null;
                    const shieldType = activePlayer.shield.element ? `${activePlayer.shield.element} щит` : "Физический щит";
                    turnLog.push(`${activePlayer.name} создает ${shieldType} прочностью ${RULES.BASE_SHIELD_VALUE} за ${omCost} ОМ.`);
                    break;
                }
                case 'dodge':
                    {
                        let baseCost = RULES.NON_MAGIC_COSTS.dodge;
                        let reduction = 0;
                        if (activePlayer.bonuses.includes('Лёгкость (-5 ОД на уклонение)')) {
                            reduction += 5;
                            turnLog.push(`Пассивная способность (Неземные): Лёгкость снижает стоимость уклонения.`);
                        }
                         if (activePlayer.bonuses.includes('Мимикрия (-15 ОД на уклонение)')) {
                            reduction += 15;
                            turnLog.push(`Пассивная способность (Хамелеоны): Мимикрия снижает стоимость уклонения.`);
                        }
                        baseCost = Math.max(0, baseCost - reduction);
                        const finalCost = getFinalOdCost(baseCost);
                        if (activePlayer.od < finalCost) {
                            turnLog.push(`Действие "Уворот" не удалось: недостаточно ОД (требуется ${finalCost}, есть ${activePlayer.od}).`);
                            return;
                        }
                        activePlayer.od -= finalCost;
                        activePlayer.isDodging = true;
                        logOdCost(baseCost, finalCost);
                        turnLog.push(`${activePlayer.name} готовится увернуться от следующей атаки.`);
                    }
                    break;
                case 'move':
                    {
                        const distanceToMove = action.payload?.distance || 0;
                        const baseCost = Math.abs(distanceToMove) * RULES.NON_MAGIC_COSTS.move_per_meter;
                        const finalCost = getFinalOdCost(baseCost, true);

                        if (activePlayer.od >= finalCost) {
                            activePlayer.od -= finalCost;
                            newDistance = Math.max(0, newDistance + distanceToMove);
                            turnLog.push(`${activePlayer.name} изменяет дистанцию на ${distanceToMove > 0 ? '+' : ''}${distanceToMove}м. Новая дистанция: ${newDistance}м.`);
                            logOdCost(baseCost, finalCost);
                        } else {
                            turnLog.push(`Действие "Передвижение" не удалось: недостаточно ОД (требуется ${finalCost}, есть ${activePlayer.od}).`);
                        }
                    }
                    break;
                case 'use_item':
                     {
                        const baseCost = RULES.NON_MAGIC_COSTS.use_item;
                        const finalCost = getFinalOdCost(baseCost);
                        activePlayer.od -= finalCost;
                        logOdCost(baseCost, finalCost);
                        activePlayer.cooldowns.item = RULES.COOLDOWNS.item;
                        turnLog.push(`${activePlayer.name} использует предмет.`);
                        
                        if (activePlayer.inventory.length > 0) {
                            const itemUsed = activePlayer.inventory.shift();
                            if(itemUsed) {
                                const itemData = ITEMS[itemUsed.name];
                                if (itemData) {
                                     turnLog.push(`${activePlayer.name} использует "${itemData.name}".`);
                                    if (itemData.type === 'heal_oz') {
                                        activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + itemData.amount);
                                        turnLog.push(`Восстановлено ${itemData.amount} ОЗ.`);
                                    }
                                    if (itemData.type === 'heal_om') {
                                        activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + itemData.amount);
                                        turnLog.push(`Восстановлено ${itemData.amount} ОМ.`);
                                    }
                                    if (itemData.type === 'damage') {
                                        applyDamage(activePlayer, opponentPlayer, itemData.amount, false);
                                        turnLog.push(`Нанесено ${itemData.amount} урона.`);
                                    }
                                }
                            }
                        }
                     }
                    break;
                case 'prayer':
                    {
                        const baseCost = RULES.NON_MAGIC_COSTS.prayer;
                        const finalCost = getFinalOdCost(baseCost);
                        activePlayer.od -= finalCost;
                        logOdCost(baseCost, finalCost);
                        activePlayer.cooldowns.prayer = RULES.COOLDOWNS.prayer;
                        
                        const roll = Math.floor(Math.random() * 10) + 1;
                        const requiredRoll = RULES.PRAYER_CHANCE[String(activePlayer.faithLevel)] || 0;
                        const isSuccess = activePlayer.faithLevel === 10 || (activePlayer.faithLevel > -1 && roll <= requiredRoll);

                        turnLog.push(`${activePlayer.name} молится о "${getActionLabel(action.type, action.payload)}". Бросок: ${roll}, нужно <= ${requiredRoll}.`);

                        if (isSuccess) {
                            turnLog.push(`Молитва услышана!`);
                            switch(action.payload.effect) {
                                case 'eternal_shield':
                                    activePlayer.bonuses.push('Вечный щит (4)');
                                    turnLog.push(`${activePlayer.name} получает Вечный щит на 4 хода.`);
                                    break;
                                case 'full_heal_oz':
                                    activePlayer.oz = activePlayer.maxOz;
                                    turnLog.push(`${activePlayer.name} полностью восстанавливает ОЗ.`);
                                    break;
                                case 'full_heal_om':
                                    activePlayer.om = activePlayer.maxOm;
                                    turnLog.push(`${activePlayer.name} полностью восстанавливает ОМ.`);
                                    break;
                            }
                        } else {
                            turnLog.push(`Боги не ответили на молитву.`);
                        }
                    }
                    break;
                case 'rest':
                     if (activePlayer.bonuses.includes('Цикличность (+5 ОЗ, если персонаж пропускает действие)')) {
                        activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 5);
                        turnLog.push(`Пассивная способность (Лартисты): ${activePlayer.name} отдыхает и восстанавливает 5 ОЗ.`);
                     }
                    break;
                case 'remove_effect':
                    // This case is handled at the start of the turn now
                    break;
                case 'racial_ability':
                    const abilityName = action.payload.name;
                    
                    const playerRace = RACES.find(r => r.name === activePlayer.race);
                    const ability = playerRace?.activeAbilities.find(a => a.name === abilityName);

                    if (ability) {
                         if (ability.cooldown) {
                             activePlayer.cooldowns[abilityName] = ability.cooldown;
                         }

                         if(ability.cost?.om) {
                            activePlayer.om -= ability.cost.om;
                            turnLog.push(`Затраты ОМ: ${ability.cost.om}.`);
                         }
                         if(ability.cost?.od) {
                            const baseCost = ability.cost.od;
                            const finalCost = getFinalOdCost(baseCost);
                            activePlayer.od -= finalCost;
                            logOdCost(baseCost, finalCost);
                         }
                         if(ability.cost?.oz) {
                            activePlayer.oz -= ability.cost.oz;
                            turnLog.push(`Затраты ОЗ: ${ability.cost.oz}.`);
                         }
                         
                         turnLog.push(`Способность "${ability.name}": ${ability.description}.`);

                         switch(abilityName) {
                            // Alahory
                             case 'Железный ёж':
                                 activePlayer.bonuses.push('Железный ёж');
                                 turnLog.push(`${activePlayer.name} готовится поглотить следующее заклинание.`);
                                 break;
                            // Alarieny
                             case 'Дождь из осколков':
                                 applyDamage(activePlayer, opponentPlayer, 40, true, undefined, false);
                                 break;
                            // Amphibii
                             case 'Водяной захват':
                                 applyEffect(opponentPlayer, 'Потеря действия', 1);
                                 break;
                            // Antaresy
                             case 'Самоисцеление':
                                 activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 50);
                                 turnLog.push(`${activePlayer.name} восстанавливает 50 ОЗ.`);
                                 break;
                            // Antropomorphs
                             case 'Ипостась зверя':
                                 applyDamage(activePlayer, opponentPlayer, 40, false);
                                 break;
                            // Arahnii
                             case 'Паутина':
                                 applyEffect(opponentPlayer, 'Потеря действия', 1);
                                 applyDamage(activePlayer, opponentPlayer, 20, false);
                                 break;
                            // Arahnidy
                             case 'Жало-хищника':
                                 applyDamage(activePlayer, opponentPlayer, 50, false);
                                 break;
                            // Aspidy & Vasiliski
                             case 'Окаменяющий взгляд':
                                 applyEffect(opponentPlayer, 'Потеря действия', 1);
                                 break;
                            // Astroloidy
                             case 'Метеорит':
                                 applyDamage(activePlayer, opponentPlayer, 60, true, 'Огонь');
                                 break;
                            // Babochki
                             case 'Трепет крыльев':
                                 applyEffect(opponentPlayer, 'Потеря действия', 1);
                                 applyDamage(activePlayer, opponentPlayer, 10, false);
                                 break;
                            // Beloyary
                             case 'Удар предков':
                                 applyDamage(activePlayer, opponentPlayer, 60, false);
                                 break;
                            // Brakovannye peresmeshniki
                             case 'Зеркальная любовь':
                                 applyEffect(opponentPlayer, 'Потеря действия', 1);
                                 applyDamage(activePlayer, opponentPlayer, 20, false);
                                 break;
                            // Vampiry
                             case 'Укус':
                                 applyDamage(activePlayer, opponentPlayer, 40, false);
                                 activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 20);
                                 turnLog.push(`${activePlayer.name} восстанавливает 20 ОЗ.`);
                                 break;
                            // Vansaelians
                            case 'Приказ крови':
                                applyDamage(activePlayer, opponentPlayer, 30, true);
                                break;
                            // Vespy
                            case 'Теневой прорыв':
                                applyDamage(activePlayer, opponentPlayer, 45, false);
                                break;
                            // Vulgary
                            case 'Удар глыбы':
                                applyDamage(activePlayer, opponentPlayer, 60, true, undefined, false);
                                break;
                            // Gurity
                            case 'Щупальца глубин':
                                applyEffect(opponentPlayer, 'Потеря действия', 1);
                                applyDamage(activePlayer, opponentPlayer, 30, false);
                                break;
                            // Golos roda
                            case 'Голос рода':
                                applyEffect(opponentPlayer, 'Потеря действия', 1);
                                applyDamage(activePlayer, opponentPlayer, 30, false);
                                break;
                             // Darnatiare
                            case 'Разлом ауры':
                                applyDamage(activePlayer, opponentPlayer, 50, true);
                                break;
                            // Jakali
                            case 'Глас богов':
                                applyDamage(activePlayer, opponentPlayer, 35, true, 'Звук');
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 15);
                                turnLog.push(`${activePlayer.name} восстанавливает 15 ОЗ.`);
                                break;
                            // Dzhinny
                            case 'Исполнение желания':
                                applyDamage(activePlayer, opponentPlayer, 50, true);
                                break;
                            // Domovye
                            case 'Очистка':
                                activePlayer.penalties = [];
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 30);
                                turnLog.push(`${activePlayer.name} снимает все негативные эффекты и восстанавливает 30 ОЗ.`);
                                break;
                            // Drakony
                            case 'Дыхание стихии':
                                applyDamage(activePlayer, opponentPlayer, 100, true, action.payload?.element);
                                break;
                             // Driady
                            case 'Удушающее плетение':
                                applyDamage(activePlayer, opponentPlayer, 40, true, 'Растения');
                                applyEffect(opponentPlayer, 'Потеря действия', 1);
                                break;
                            // Dridy
                            case 'Рывок мотылька':
                                applyDamage(activePlayer, opponentPlayer, 45, false);
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 10);
                                turnLog.push(`${activePlayer.name} восстанавливает 10 ОЗ.`);
                                break;
                             // Drou
                            case 'Лунный кнут':
                                 applyDamage(activePlayer, opponentPlayer, 55, true, 'Тьма');
                                 break;
                             // Жнецы
                             case 'Коса Смерти':
                                 opponentPlayer.oz = 0;
                                 turnLog.push(`${activePlayer.name} использует Косу Смерти... ${opponentPlayer.name} повержен.`);
                                 break;
                            // Insektoidy
                            case 'Кислотное жало':
                                applyDamage(activePlayer, opponentPlayer, 50, false);
                                break;
                            // Karliki
                            case 'Кузнечный молот':
                                applyDamage(activePlayer, opponentPlayer, 50, false);
                                break;
                            // Kentaury
                            case 'Копыта бури':
                                applyDamage(activePlayer, opponentPlayer, 55, false);
                                break;
                            // Kitsune
                            case 'Танец девяти хвостов':
                                applyEffect(opponentPlayer, 'Потеря действия', 1);
                                applyDamage(activePlayer, opponentPlayer, 35, false);
                                break;
                            // Korality
                            case 'Коралловый плевок':
                                applyDamage(activePlayer, opponentPlayer, 45, false);
                                break;
                            // Kordei
                            case 'Кровавая печать':
                                applyDamage(activePlayer, opponentPlayer, 55, true, 'Кровь');
                                break;
                             // Kunari
                            case 'Природное возрождение':
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 60);
                                turnLog.push(`${activePlayer.name} восстанавливает 60 ОЗ.`);
                                break;
                            // Lartisty
                            case 'Затягивание в полотно':
                                applyEffect(opponentPlayer, 'Удержание', 1);
                                turnLog.push(`${opponentPlayer.name} не может использовать магические способности.`);
                                break;
                            // Leprekony
                            case 'Подменный клад':
                                applyEffect(activePlayer, 'Скрытность', 1);
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 40);
                                turnLog.push(`${activePlayer.name} уходит в скрытность на 1 ход и восстанавливает 40 ОЗ.`);
                                break;
                             // Mikanidy
                            case 'Споровый взрыв':
                                applyDamage(activePlayer, opponentPlayer, 40, false);
                                applyEffect(opponentPlayer, 'Ослабление (1)');
                                break;
                            // Druidy
                            case 'Песня стихий':
                                if (action.payload.subAction === 'damage') {
                                    applyDamage(activePlayer, opponentPlayer, 45, true, 'Земля');
                                } else if (action.payload.subAction === 'heal') {
                                    activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 45);
                                    turnLog.push(`${activePlayer.name} восстанавливает 45 ОЗ.`);
                                }
                                break;
                            // Myriads
                            case 'Смертельный рывок':
                                applyDamage(activePlayer, opponentPlayer, 60, false);
                                break;
                            // Narrators
                            case 'Конец главы':
                                applyDamage(activePlayer, opponentPlayer, 50, true);
                                applyEffect(opponentPlayer, 'Удержание', 1);
                                break;
                            // Ethereals
                            case 'Прыжок веры':
                                activePlayer.isDodging = true;
                                activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + 30);
                                turnLog.push(`${activePlayer.name} готовится увернуться от следующей атаки и восстанавливает 30 ОМ.`);
                                break;
                            // Neonids
                            case 'Световой взрыв':
                                applyDamage(activePlayer, opponentPlayer, 40, true, 'Свет');
                                applyEffect(opponentPlayer, 'Ослепление', 1);
                                break;
                            // Incorruptible
                            case 'Откат':
                                activePlayer.oz = activePlayer.maxOz;
                                if (activePlayer.penalties.length > 0) {
                                    const removedEffect = activePlayer.penalties.shift();
                                    turnLog.push(`${activePlayer.name} снимает эффект "${removedEffect}".`);
                                }
                                turnLog.push(`${activePlayer.name} полностью восстанавливает ОЗ.`);
                                break;
                             case 'Полный Зверь':
                                 applyDamage(activePlayer, opponentPlayer, 50, false);
                                 break;
                             case 'Крылья пламени':
                                 applyDamage(activePlayer, opponentPlayer, 60, true, 'Огонь');
                                 break;
                             case 'Электрический разряд':
                                 applyDamage(activePlayer, opponentPlayer, 50, true, 'Молния');
                                 activePlayer.oz -= 50;
                                 turnLog.push(`${activePlayer.name} также получает 50 урона от разряда.`);
                                 break;
                             case 'Кража лица':
                                 applyEffect(opponentPlayer, 'Потеря действия', 1);
                                 break;
                             case 'Когти судьбы':
                                 applyDamage(activePlayer, opponentPlayer, 40, false);
                                 break;
                             case 'Вихрь эфира':
                                 applyEffect(opponentPlayer, 'Удержание', 1);
                                 break;
                             case 'Вторая фаза':
                                 applyDamage(activePlayer, opponentPlayer, 60, true);
                                 applyEffect(opponentPlayer, 'Тление', 1);
                                 break;
                             case 'Транс-шаман':
                                 activePlayer.bonuses.push('Транс-шаман (2)');
                                 turnLog.push(`${activePlayer.name} входит в транс и будет восстанавливать ОЗ и ОМ в течение 2 ходов.`);
                                 break;
                              case 'Распахнуть маску':
                                 applyDamage(activePlayer, opponentPlayer, 50, false);
                                 applyEffect(opponentPlayer, 'Ослепление', 1);
                                 break;
                             case 'Вспышка':
                                 applyDamage(activePlayer, opponentPlayer, 40, true, 'Огонь');
                                 break;
                             case 'Луч очищения':
                                 if (Math.random() < 0.5) {
                                     activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 40);
                                     turnLog.push(`Луч очищения восстанавливает ${activePlayer.name} 40 ОЗ.`);
                                 } else {
                                     applyDamage(activePlayer, opponentPlayer, 40, true, 'Свет');
                                 }
                                 break;
                             case 'Песня безмолвия':
                                 applyEffect(opponentPlayer, 'Удержание', 1);
                                 break;
                             case 'Переформа':
                                 activePlayer.bonuses.push('Переформа');
                                 turnLog.push(`${activePlayer.name} принимает неуязвимую форму на 1 ход.`);
                                 break;
                             case 'Цветок льда':
                                 applyDamage(activePlayer, opponentPlayer, 60, true, 'Лёд');
                                 break;
                             case 'Луч истины':
                                 applyDamage(activePlayer, opponentPlayer, 20, true, 'Свет');
                                 if (activePlayer.penalties.length > 0) {
                                     const removedEffect = activePlayer.penalties.shift();
                                     turnLog.push(`Луч истины снимает с ${activePlayer.name} эффект: "${removedEffect}".`);
                                 }
                                 break;
                             case 'Когти закона':
                                 applyDamage(activePlayer, opponentPlayer, 55, false);
                                 break;
                            case 'Танец лезвий':
                                 applyDamage(activePlayer, opponentPlayer, 45, false);
                                 break;
                            case 'Угасание':
                                 applyDamage(activePlayer, opponentPlayer, 50, false);
                                 applyEffect(opponentPlayer, 'Потеря действия', 1);
                                 break;
                             case 'Всплеск':
                                 applyDamage(activePlayer, opponentPlayer, 50, true, 'Вода');
                                 activePlayer.oz -= 40;
                                 turnLog.push(`${activePlayer.name} также получает 40 урона от всплеска.`);
                                 opponentPlayer.od = Math.max(0, opponentPlayer.od - 30);
                                 turnLog.push(`${opponentPlayer.name} теряет 30 ОД.`);
                                 break;
                             case 'Цветовой обман':
                                 activePlayer.bonuses.push('Авто-уклонение (3)');
                                 turnLog.push(`${activePlayer.name} будет автоматически уклоняться 3 хода.`);
                                 break;
                            case 'Переворот':
                                applyDamage(activePlayer, opponentPlayer, 40, false);
                                applyEffect(opponentPlayer, 'Потеря действия', 1);
                                break;
                            case 'Порыв харизмы':
                                applyEffect(opponentPlayer, 'Удержание', 1);
                                break;
                            case 'Энергозахват':
                                applyDamage(activePlayer, opponentPlayer, 30, false);
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 20);
                                turnLog.push(`${activePlayer.name} восстанавливает 20 ОЗ.`);
                                break;
                            case 'Поток стихий':
                                applyDamage(activePlayer, opponentPlayer, 60, true, 'Эфир');
                                break;
                            case 'Заряд артефакта':
                                if (Math.random() < 0.5) {
                                    activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 40);
                                    turnLog.push(`Заряд артефакта восстанавливает ${activePlayer.name} 40 ОЗ.`);
                                } else {
                                    applyDamage(activePlayer, opponentPlayer, 40, false);
                                }
                                break;
                            case 'Страх из-за занавеси':
                                applyEffect(opponentPlayer, 'Потеря действия', 1);
                                applyDamage(activePlayer, opponentPlayer, 20, false);
                                break;
                            case 'Эхо мира духов':
                                applyDamage(activePlayer, opponentPlayer, 50, true, 'Эфир');
                                break;
                            case 'Некросотрясение':
                                applyDamage(activePlayer, opponentPlayer, 60, false);
                                break;
                         }
                    }
                    break;
            }
        });
        
        let turnSkipped = false;
        const simpleTurnSkipEffects = ['Под гипнозом', 'Обездвижен', 'Транс', 'Усыпление'];
        let petrificationCount = 0;

        activePlayer.penalties = activePlayer.penalties.map(p => {
            const match = p.match(/(.+) \((\d+)\)$/);
            if (match) {
                const name = match[1].trim();
                let duration = parseInt(match[2], 10) - 1;

                if (simpleTurnSkipEffects.includes(name) && !activePlayer.bonuses.includes('Иммунитет к контролю')) {
                    turnSkipped = true;
                    turnLog.push(`${activePlayer.name} пропускает ход из-за эффекта "${name}"!`);
                }
                if (name === 'Окаменение') {
                    petrificationCount++;
                }
                
                if (name === 'Ослепление') {
                    activePlayer.od = Math.max(0, activePlayer.od - 10);
                    turnLog.push(`${activePlayer.name} ослеплен и теряет 10 ОД!`);
                }
                
                if (name === 'Скрытность') {
                    turnLog.push(`${activePlayer.name} остается в скрытности.`);
                }
                
                if (name === 'Удержание') {
                    turnLog.push(`${activePlayer.name} находится под эффектом "${name}", магические способности недоступны.`);
                }

                if (duration > 0) {
                    return `${name} (${duration})`;
                }
                turnLog.push(`Эффект "${name}" закончился для ${activePlayer.name}.`);
                return '';
            }
            return p;
        }).filter(p => p !== '');
        
        // Recalculate wound penalties
        activePlayer.penalties = activePlayer.penalties.filter(p => !p.startsWith('Штраф ОД (Ранение)'));
        if (activePlayer.race !== 'Куклы' || !activePlayer.bonuses.includes('Абсолютная память — не тратится ОД.')) {
            for (const wound of RULES.WOUND_PENALTIES) {
                if (activePlayer.oz < wound.threshold) {
                     const penaltyName = `Штраф ОД (Ранение): +${wound.penalty}`;
                     if (!activePlayer.penalties.includes(penaltyName)) activePlayer.penalties.push(penaltyName);
                }
            }
        }
        
        // Add armor penalty if not present
        const armorPenalty = ARMORS[activePlayer.armor as ArmorType]?.odPenalty ?? 0;
        const armorPenaltyName = `Штраф ОД (Броня): +${armorPenalty}`;
        // First remove existing armor penalties to avoid duplicates if armor changes
        activePlayer.penalties = activePlayer.penalties.filter(p => !p.startsWith('Штраф ОД (Броня)'));
        if (armorPenalty > 0) {
            if (!activePlayer.penalties.includes(armorPenaltyName)) activePlayer.penalties.push(armorPenaltyName);
        }

        if (petrificationCount >= 2) {
            turnSkipped = true;
            turnLog.push(`${activePlayer.name} полностью окаменел и пропускает ход!`);
        } else if (petrificationCount === 1 && actions.length > 0) {
            const lostAction = actions.pop();
            if(lostAction) {
              turnLog.push(`${activePlayer.name} частично окаменел и теряет одно действие: "${getActionLabel(lostAction.type, lostAction.payload)}".`);
            }
        }
        
        if (turnSkipped && actions.length > 0) {
            const newTurn: Turn = {
                turnNumber: duelData.currentTurn,
                playerId: activePlayer.id,
                playerName: activePlayer.name,
                actions: [{type: 'rest', payload: {name: 'Пропуск хода'}}],
                log: turnLog,
                startStats: startStats,
                endStats: { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: activePlayer.shield },
            };
            
            activePlayer.physicalCondition = getPhysicalCondition(activePlayer.oz, activePlayer.maxOz);
            opponentPlayer.physicalCondition = getPhysicalCondition(opponentPlayer.oz, opponentPlayer.maxOz);
            
            const finalActivePlayer = activePlayer;
            const finalOpponent = opponentPlayer;

            const updatedDuel: Partial<DuelState> = {
                player1: duelData.activePlayerId === 'player1' ? finalActivePlayer : finalOpponent,
                player2: duelData.activePlayerId === 'player2' ? finalActivePlayer : finalOpponent,
                turnHistory: [...duelData.turnHistory, newTurn],
                currentTurn: duelData.currentTurn + 1,
                activePlayerId: duelData.activePlayerId === 'player1' ? 'player2' : 'player1',
                winner: null,
                log: turnLog,
                animationState: { player1: 'idle', player2: 'idle' },
            };
            handleUpdateDuelState(updatedDuel);
            return;
        }

        
        // Clear one-turn bonuses at the end of the turn
        activePlayer.bonuses = activePlayer.bonuses.filter(b => b !== 'Переформа');

        const isResting = actions.some(a => a.type === 'rest');
        if (isResting) {
            const restCount = actions.filter(a => a.type === 'rest').length;
            activePlayer.od = Math.min(activePlayer.maxOd, activePlayer.od + (RULES.OD_REGEN_ON_REST * restCount));
            activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + (RULES.OM_REGEN_ON_REST * restCount));
            turnLog.push(`${activePlayer.name} отдыхает (${restCount} раз) и восстанавливает ${RULES.OD_REGEN_ON_REST * restCount} ОД и ${RULES.OM_REGEN_ON_REST * restCount} ОМ.`);
        }

        activePlayer.oz = Math.max(0, activePlayer.oz);
        opponentPlayer.oz = Math.max(0, opponentPlayer.oz);
        activePlayer.om = Math.max(0, activePlayer.om);
        activePlayer.od = Math.max(0, activePlayer.od);
        
        activePlayer.physicalCondition = getPhysicalCondition(activePlayer.oz, activePlayer.maxOz);
        opponentPlayer.physicalCondition = getPhysicalCondition(opponentPlayer.oz, opponentPlayer.maxOz);

        let winner = null;
        if (activePlayer.oz <= 0) winner = opponentPlayer.name;
        if (opponentPlayer.oz <= 0) winner = activePlayer.name;

        if (winner && fromLabyrinth && activePlayer.name === winner) {
            const savedChar = sessionStorage.getItem('labyrinthCharacter');
            if (savedChar) {
                const updatedChar = { ...JSON.parse(savedChar), oz: activePlayer.oz };
                sessionStorage.setItem('labyrinthCharacter', JSON.stringify(updatedChar));
            }
        }


        const newTurn: Turn = {
            turnNumber: duelData.currentTurn,
            playerId: activePlayer.id,
            playerName: activePlayer.name,
            actions: actions,
            log: turnLog,
            startStats: startStats,
            endStats: { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: deepClone(activePlayer.shield) },
        };
        
        const finalActivePlayer = activePlayer;
        const finalOpponent = opponentPlayer;

        const updatedDuel: Partial<DuelState> = {
            player1: duelData.activePlayerId === 'player1' ? finalActivePlayer : finalOpponent,
            player2: duelData.activePlayerId === 'player2' ? finalActivePlayer : finalOpponent,
            turnHistory: [...duelData.turnHistory, newTurn],
            currentTurn: duelData.currentTurn + 1,
            activePlayerId: duelData.activePlayerId === 'player1' ? 'player2' : 'player1',
            winner: winner,
            log: turnLog,
            distance: newDistance,
        };
        
        handleUpdateDuelState({ ...updatedDuel, animationState });

        // Reset animations after a delay
        setTimeout(() => {
            handleUpdateDuelState({ animationState: { player1: 'idle', player2: 'idle' } });
        }, 1500); // 1.5 seconds for animations
  };
  
  if (duelLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }
  
  if (onlineDuelError && !isLocalSolo && !isPvE) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-destructive">Не удалось загрузить дуэль. Возможно, ID неверный.</p>
          <Button onClick={() => router.push('/duels')}>
              <ArrowLeft className="mr-2" />
              Вернуться к списку дуэлей
          </Button>
      </div>
    );
  }

  if (!duelData) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      );
  }

  // --- STAGE LOGIC ---
  const isPlayer1 = userRole === 'player1';
  const isPlayer2 = userRole === 'player2';
  
  // 1. PVE and Solo setup
  if ((isLocalSolo || isPvE) && !duelData.duelStarted) {
      if (isPvE && !fromLabyrinth) {
          // For PvE, only the player sets up their character
          if (!duelData.player1.isSetupComplete) {
              return <CharacterSetupModal character={duelData.player1} onSave={(char) => handleCharacterUpdate(char)} onCancel={() => router.push('/duels')} />;
          }
      } else if(isLocalSolo) {
          // For Solo, both players are set up
          return <SoloSetupForm player1={duelData.player1} player2={duelData.player2!} onSave={handleSoloSetupComplete} onCancel={() => router.push('/duels')} />;
      }
  }
  
  // --- Online Duel Flow ---
  if (!isLocalSolo && !isPvE && !duelData.duelStarted) {
      // Spectator waiting view
      if (userRole === 'spectator') {
          return (
              <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
                  <Card className="w-full max-w-md">
                      <CardHeader>
                          <CardTitle className="flex items-center justify-center gap-2">
                              <Settings2 className="animate-spin" />
                              Ожидание начала дуэли...
                          </CardTitle>
                          <CardDescription>
                              Игроки настраивают своих персонажей.
                          </CardDescription>
                      </CardHeader>
                  </Card>
              </div>
          );
      }

      // Player 1 setup
      if (isPlayer1 && !duelData.player1.isSetupComplete) {
        return <CharacterSetupModal character={duelData.player1} onSave={handleCharacterUpdate} onCancel={() => router.push('/duels')} />;
      }

      // Waiting for Player 2 to join
      if (isPlayer1 && !duelData.player2) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
              <Card className="w-full max-w-md">
                  <CardHeader>
                      <CardTitle>Ожидание второго игрока...</CardTitle>
                      <CardDescription>Поделитесь ID дуэли со своим оппонентом.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                          <Input value={duelId} readOnly className="flex-1" />
                          <Button onClick={copyDuelId} size="icon">
                              {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                          </Button>
                      </div>
                      <Button onClick={() => router.push('/duels')} variant="outline">
                          <ArrowLeft className="mr-2" />
                          Выбрать другую дуэль
                      </Button>
                  </CardContent>
              </Card>
          </div>
        );
      }
      
      // Player 2 setup
      if (isPlayer2 && duelData.player2 && !duelData.player2.isSetupComplete) {
          return <CharacterSetupModal character={duelData.player2} onSave={handleCharacterUpdate} onCancel={() => router.push('/duels')} />;
      }
      
      // Waiting for opponent to finish setup
      if ((isPlayer1 && duelData.player2 && !duelData.player2.isSetupComplete) || (isPlayer2 && !duelData.player1.isSetupComplete)) {
           return (
              <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
                  <Card className="w-full max-w-md">
                      <CardHeader>
                          <CardTitle className="flex items-center justify-center gap-2">
                              <Settings2 className="animate-spin" />
                              Ожидание оппонента
                          </CardTitle>
                          <CardDescription>
                              Ваш оппонент еще настраивает своего персонажа.
                          </CardDescription>
                      </CardHeader>
                  </Card>
              </div>
          );
      }
  }


  // At this point, setup is complete for both players.
  if (!duelData.duelStarted) {
      // This can happen briefly for online duels
      return <div className="flex items-center justify-center min-h-screen"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div></div>;
  }
  
  if (!duelData.player2) {
    // Should not happen if logic is correct, but a safeguard
    return <div>Ошибка: Данные второго игрока отсутствуют.</div>
  }
  
    const isOpponentInRangeForSpells = (reserve: CharacterStats['reserve'], distance: number) => {
        const spellRange = RULES.SPELL_RANGES[reserve];
        return distance <= spellRange;
    };

  const activePlayer = duelData.activePlayerId === 'player1' ? duelData.player1 : duelData.player2;
  const currentOpponent = duelData.activePlayerId === 'player1' ? duelData.player2 : duelData.player1;
  
  const isMyTurn = useMemo(() => {
    if (userRole === 'spectator') return false;
    if (isLocalSolo || isPvE) {
        return duelData.activePlayerId === 'player1';
    }
    return userRole === duelData.activePlayerId;
  }, [userRole, isLocalSolo, isPvE, duelData.activePlayerId]);

  const turnStatusText = () => {
    if (isLocalSolo) return "Ваш ход";
    if (isPvE) return isMyTurn ? "Ваш ход" : `Ход противника: ${activePlayer.name}`;
    if (userRole === 'spectator') return `Ход игрока ${activePlayer.name}`;
    if (isMyTurn) return "Ваш ход";
    return `Ход оппонента: ${activePlayer.name}`;
  }
  
  const scalingStartDistance = 150;
  const minScale = 0.3;
  const maxVisualDistance = 400;

  let distanceScale = 1;
  let distanceGap = duelData.distance * 4;
  
  if (duelData.distance > scalingStartDistance) {
      distanceGap = scalingStartDistance * 4;
      const distancePastThreshold = duelData.distance - scalingStartDistance;
      const scalingRange = maxVisualDistance - scalingStartDistance;
      const scaleReduction = (distancePastThreshold / scalingRange) * (1 - minScale);
      distanceScale = Math.max(minScale, 1 - scaleReduction);
  }
  
  const handleVictory = () => {
    if (fromLabyrinth) {
        router.push(`/locations/labyrinth?defeated=${enemyId}`);
    } else {
        router.push('/duels');
    }
  }

  // --- Main Duel Interface ---
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
           <Button onClick={() => router.push('/duels')} variant="secondary" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Покинуть
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto p-2 md:p-4">
        {duelData.winner ? (
        <Card className="text-center p-4 md:p-8 mt-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-accent mb-4">Дуэль Окончена!</CardTitle>
            <CardContent className="space-y-4">
                <p className="text-lg md:text-xl">Победитель: {duelData.winner}</p>
                
                {duelData.log && duelData.log.length > 0 && (
                    <div className="text-left bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><ScrollText className='w-5 h-5' />События последнего хода:</h4>
                        <Separator className="my-2" />
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {duelData.log.map((entry, i) => <li key={i}>{entry}</li>)}
                        </ul>
                    </div>
                )}
                
                <Button onClick={handleVictory} className="mt-6">
                    {fromLabyrinth ? 'Вернуться в лабиринт' : 'Начать новую'}
                </Button>
            </CardContent>
        </Card>
        ) : (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <CharacterPanel 
                  key={duelData.player1.id}
                  character={duelData.player1} 
                  isActive={duelData.activePlayerId === 'player1'} 
              />
              <CharacterPanel 
                  key={duelData.player2.id}
                  character={duelData.player2} 
                  isActive={duelData.activePlayerId === 'player2'} 
              />
            </div>

            <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                      <span>Ход {duelData.currentTurn}: {activePlayer.name}</span>
                       {fromLabyrinth && <Badge variant="outline"><MapPin className="mr-2"/>Битва в лабиринте</Badge>}
                    </div>
                    <span className={`text-sm font-medium ${(isMyTurn && userRole !== 'spectator') ? 'text-accent' : 'text-muted-foreground'}`}>
                        {turnStatusText()}
                    </span>
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 text-base text-muted-foreground font-medium pt-2">
                    <Ruler className="w-4 h-4"/>
                    <span>Дистанция: {duelData.distance}м</span>
                </CardDescription>
                </CardHeader>
                <CardContent>
                
                <div 
                    className={cn(
                        "mb-4 p-4 bg-muted/50 rounded-lg flex justify-center items-end h-48 relative overflow-hidden"
                    )}
                    style={{ gap: `${distanceGap}px` }}
                >
                    <PixelCharacter
                      pose={duelData.animationState?.player1 || 'idle'}
                      weapon={duelData.player1.weapon}
                      shield={duelData.player1.shield}
                      isActive={duelData.activePlayerId === 'player1'}
                      spellElement={duelData.animationState?.spellElement}
                      weaponType={duelData.animationState?.weaponType}
                      penalties={duelData.player1.penalties}
                      oz={duelData.player1.oz}
                      maxOz={duelData.player1.maxOz}
                      scale={distanceScale}
                    />
                    <PixelCharacter
                      pose={duelData.animationState?.player2 || 'idle'}
                      weapon={duelData.player2.weapon}
                      isFlipped={true}
                      shield={duelData.player2.shield}
                      isActive={duelData.activePlayerId === 'player2'}
                      spellElement={duelData.animationState?.spellElement}
                      weaponType={duelData.animationState?.weaponType}
                      penalties={duelData.player2.penalties}
                      oz={duelData.player2.oz}
                      maxOz={duelData.player2.maxOz}
                      scale={distanceScale}
                    />
                </div>


                {isMyTurn ? (
                    <TurnForm
                        player={activePlayer}
                        opponent={currentOpponent}
                        onSubmit={executeTurn}
                        distance={duelData.distance}
                    />
                ) : (
                    <div className="text-center text-muted-foreground p-4 md:p-8">
                       {userRole === 'spectator' ? (
                         <div className="flex items-center justify-center gap-2">
                           <Eye className="w-5 h-5" />
                           Вы наблюдаете за этой дуэлью.
                         </div>
                       ) : (
                        'Ожидание хода оппонента...'
                       )}
                    </div>
                )}
                </CardContent>
            </Card>

            {duelData.log && duelData.log.length > 0 && (
                <Alert variant="default" className="border-primary">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <AlertTitle>События последнего хода</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {duelData.log.map((entry, i) => <li key={i}>{entry}</li>)}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <DuelLog turns={duelData.turnHistory} player1Name={duelData.player1.name} player2Name={duelData.player2?.name || 'Оппонент'} />
            </div>
        </div>
        )}
      </main>
    </div>
  );
}
