
'use client';

import { useState, useEffect } from 'react';
import type { DuelState, Turn, Action, CharacterStats, ReserveLevel, FaithLevel } from '@/types/duel';
import CharacterPanel from '@/components/character-panel';
import TurnForm from '@/components/turn-form';
import DuelLog from '@/components/duel-log';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Gamepad2, ShieldAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RULES, getOmFromReserve, getFaithLevelFromString, getActionLabel, RACES, ELEMENTS } from '@/lib/rules';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DuelSetup from '@/components/duel-setup';

const initialPlayer1: CharacterStats = {
  id: 'player1',
  name: 'Игрок 1',
  race: 'Человек',
  reserve: 'Неофит',
  elementalKnowledge: [],
  faithLevel: 0,
  faithLevelName: 'Равнодушие',
  physicalCondition: 'В полном здравии',
  bonuses: ['Иммунитет к контролю'],
  penalties: [],
  inventory: [],
  oz: 250,
  maxOz: 250,
  om: 90,
  maxOm: 90,
  od: 100,
  maxOd: 100,
  shield: 0,
  isDodging: false,
  cooldowns: { strongSpell: 0, item: 0, prayer: 0 },
};

const initialPlayer2: CharacterStats = {
  id: 'player2',
  name: 'Игрок 2',
  race: 'Орк',
  reserve: 'Неофит',
  elementalKnowledge: [],
  faithLevel: 0,
  faithLevelName: 'Равнодушие',
  physicalCondition: 'В полном здравии',
  bonuses: ['Расовая ярость (+10 к урону)', 'Боевая магия'],
  penalties: [],
  inventory: [],
  oz: 250,
  maxOz: 250,
  om: 90,
  maxOm: 90,
  od: 100,
  maxOd: 100,
  shield: 0,
  isDodging: false,
  cooldowns: { strongSpell: 0, item: 0, prayer: 0 },
};

const getPhysicalCondition = (oz: number, maxOz: number): string => {
    const healthPercentage = (oz / maxOz) * 100;
    if (healthPercentage > 75) return 'В полном здравии';
    if (healthPercentage > 50) return 'Ранен';
    if (healthPercentage > 25) return 'Тяжело ранен';
    return 'Изнеможден';
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

  const executeTurn = (turnActions: Action[]) => {
    if (!duel) return;

    setDuel(prevDuel => {
        if (!prevDuel) return null;

        let actions = [...turnActions];
        const turnLog: string[] = [];
        let activePlayer = prevDuel.activePlayerId === 'player1' ? { ...prevDuel.player1 } : { ...prevDuel.player2 };
        let opponent = prevDuel.activePlayerId === 'player1' ? { ...prevDuel.player2 } : { ...prevDuel.player1 };
        
        const startStats = { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: activePlayer.shield };
        
        let turnSkipped = false;
        const simpleTurnSkipEffects = ['Под гипнозом', 'Обездвижен'];
        let petrificationCount = 0;
        
        // Passive regen and effects at start of turn
        activePlayer.bonuses.forEach(bonus => {
            const healMatch = bonus.match(/\+(\d+) исцеления\/ход/);
            if (healMatch) {
                const healAmount = parseInt(healMatch[1], 10);
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + healAmount);
                turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${healAmount} ОЗ.`);
            }
            const omMatch = bonus.match(/\+(\d+) ОМ\/ход/);
            if (omMatch) {
                const omAmount = parseInt(omMatch[1], 10);
                activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + omAmount);
                turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${omAmount} ОМ.`);
            }
        });


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
                    actions = []; // remove all actions
                    turnLog.push(`${activePlayer.name} ослеплен и не может совершать действия в этом ходу!`);
                }

                if (duration > 0) {
                    return `${name} (${duration})`;
                }
                turnLog.push(`Эффект "${name}" закончился для ${activePlayer.name}.`);
                return '';
            }
            return p;
        }).filter(p => p !== '');

        if (petrificationCount >= 2) {
            turnSkipped = true;
            turnLog.push(`${activePlayer.name} полностью окаменел и пропускает ход!`);
        } else if (petrificationCount === 1 && actions.length > 0) {
            const lostAction = actions.pop();
            if(lostAction) {
              turnLog.push(`${activePlayer.name} частично окаменел и теряет одно действие: "${getActionLabel(lostAction.type, lostAction.payload)}".`);
            }
        }
        
        for (const key in activePlayer.cooldowns) {
            const typedKey = key as keyof typeof activePlayer.cooldowns;
            if (activePlayer.cooldowns[typedKey] > 0) {
                activePlayer.cooldowns[typedKey]--;
            }
        }
        
        activePlayer.penalties.forEach(p => {
            const isPoisonEffect = RULES.POISON_EFFECTS.some(dot => p.startsWith(dot.replace(/ \(\d+\)/, '')));
            if (isPoisonEffect && activePlayer.bonuses.includes('Иммунитет к ядам')) {
                 turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} имеет иммунитет к яду, урон от "${p}" не получен.`);
                 return;
            }

            if (RULES.DOT_EFFECTS.some(dot => p.startsWith(dot.replace(/ \(\d+\)/, '')))) {
                let damage = RULES.DOT_DAMAGE;
                if (activePlayer.bonuses.includes('Скидка к урону от яда (3)')) {
                    damage = Math.max(0, damage - 3);
                    turnLog.push(`Пассивная способность (Дроу): Скидка к урону от яда уменьшает урон до ${damage}.`);
                }
                if (activePlayer.penalties.includes('Штраф к отравлению (3)')) {
                    damage += 3;
                     turnLog.push(`Пассивная способность (Слизень): Штраф к отравлению увеличивает урон до ${damage}.`);
                }
                activePlayer.oz -= damage;
                turnLog.push(`${activePlayer.name} получает ${damage} урона от эффекта "${p}".`);
            }
        });

        if (turnSkipped) {
            const newTurn: Turn = {
                turnNumber: prevDuel.currentTurn,
                playerId: activePlayer.id,
                playerName: activePlayer.name,
                actions: [{type: 'rest', payload: {name: 'Пропуск хода'}}],
                log: turnLog,
                startStats: startStats,
                endStats: { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: activePlayer.shield },
            };
            
            setLog(turnLog);
            
            activePlayer.physicalCondition = getPhysicalCondition(activePlayer.oz, activePlayer.maxOz);
            opponent.physicalCondition = getPhysicalCondition(opponent.oz, opponent.maxOz);


            return {
                ...prevDuel,
                player1: prevDuel.activePlayerId === 'player1' ? activePlayer : opponent,
                player2: prevDuel.activePlayerId === 'player2' ? activePlayer : opponent,
                turnHistory: [...prevDuel.turnHistory, newTurn],
                currentTurn: prevDuel.currentTurn + 1,
                activePlayerId: prevDuel.activePlayerId === 'player1' ? 'player2' : 'player1',
                winner: undefined,
                log: turnLog,
            };
        }

        actions.forEach(action => {
            turnLog.push(`${activePlayer.name} использует действие: "${getActionLabel(action.type, action.payload)}".`);
            
            const getOdCostPenalty = (player: CharacterStats): number => {
                for (const wound of RULES.WOUND_PENALTIES) {
                    if (player.oz < wound.threshold) {
                        return wound.penalty;
                    }
                }
                return 0;
            };

            const calculateDamage = (spellType: 'household' | 'small' | 'medium' | 'strong'): number => {
                let damage = RULES.RITUAL_DAMAGE[activePlayer.reserve]?.[spellType] ?? 0;
                
                if (opponent.penalties.includes('Уязвимость')) {
                    const bonus = RULES.DAMAGE_BONUS.vulnerability[spellType];
                    damage += bonus;
                    turnLog.push(`Эффект "Уязвимость" увеличивает урон на ${bonus}.`);
                }
                if (activePlayer.bonuses.includes('Боевая магия')) {
                    const bonus = RULES.DAMAGE_BONUS.battle_magic[spellType];
                    damage += bonus;
                    turnLog.push(`Пассивный бонус "Боевая магия" увеличивает урон на ${bonus}.`);
                }
                 if (activePlayer.race === 'Орк' && activePlayer.bonuses.includes('Расовая ярость (+10 к урону)')) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Орк): "Расовая ярость" увеличивает урон на 10.`);
                }
                
                const attackerElements = activePlayer.elementalKnowledge;
                const defenderElements = opponent.elementalKnowledge;

                if (attackerElements.length > 0 && defenderElements.length > 0) {
                    const mainAttackerElement = ELEMENTS[attackerElements[0]];
                    const mainDefenderElement = ELEMENTS[defenderElements[0]];

                    if (mainAttackerElement && mainDefenderElement) {
                        if (mainAttackerElement.strongAgainst.includes(mainDefenderElement.name)) {
                            turnLog.push(`Стихийное преимущество! ${mainAttackerElement.name} силен против ${mainDefenderElement.name}. Урон увеличен на 50%.`);
                            damage *= 1.5;
                        } else if (mainAttackerElement.weakTo.includes(mainDefenderElement.name)) {
                            turnLog.push(`Стихийная уязвимость! ${mainAttackerElement.name} слаб против ${mainDefenderElement.name}. Урон уменьшен на 50%.`);
                            damage *= 0.5;
                        }
                    }
                }
                
                return Math.round(damage);
            };

            const applyDamage = (target: CharacterStats, amount: number, isSpell: boolean) => {
                let finalDamage = amount;

                if (target.race === 'Ларимы' && isSpell) {
                    const restoredOm = Math.round(amount);
                    target.om = Math.min(target.maxOm, target.om + restoredOm);
                    turnLog.push(`Пассивная способность (Ларимы): ${target.name} поглощает ${restoredOm} магического урона и восстанавливает ОМ.`);
                    return;
                }

                if (target.isDodging) {
                    const dodgeRoll = Math.floor(Math.random() * 10) + 1;
                    turnLog.push(`${target.name} пытается увернуться... Бросок: ${dodgeRoll}.`);
                    if (dodgeRoll >= 6) { 
                        finalDamage *= 0.5; 
                        turnLog.push(`Уворот успешен! ${target.name} получает на 50% меньше урона.`);
                    } else {
                        turnLog.push(`Уворот не удался. ${target.name} получает полный урон.`);
                    }
                    target.isDodging = false;
                    turnLog.push(`${target.name} больше не находится в состоянии уворота.`);
                }

                finalDamage = Math.round(finalDamage);

                if (target.shield > 0) {
                    const damageToShield = Math.min(target.shield, finalDamage);
                    target.shield -= damageToShield;
                    const remainingDamage = finalDamage - damageToShield;

                    turnLog.push(`Щит ${target.name} поглощает ${damageToShield} урона.`);
                    if (target.shield <= 0) {
                        turnLog.push(`Щит ${target.name} был уничтожен.`);
                    }

                    if (remainingDamage > 0) {
                        target.oz -= remainingDamage;
                        turnLog.push(`${target.name} получает ${remainingDamage} урона, пробившего щит.`);
                    }
                } else {
                    target.oz -= finalDamage;
                    turnLog.push(`${target.name} получает ${finalDamage} урона.`);
                }
            };
            
            const applyEffect = (target: CharacterStats, effect: string) => {
                if (!target.penalties.some(p => p.startsWith(effect.split(' (')[0]))) {
                    target.penalties.push(effect);
                }
            };

            let damageDealt = 0;
            const odPenalty = getOdCostPenalty(activePlayer);

            switch(action.type) {
                case 'strong_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.strong;
                    damageDealt = calculateDamage('strong');
                    applyDamage(opponent, damageDealt, true);
                    activePlayer.cooldowns.strongSpell = RULES.COOLDOWNS.strongSpell;
                    break;
                case 'medium_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.medium;
                    damageDealt = calculateDamage('medium');
                    applyDamage(opponent, damageDealt, true);
                    break;
                case 'small_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.small;
                    damageDealt = calculateDamage('small');
                    applyDamage(opponent, damageDealt, true);
                    break;
                case 'household_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.household;
                    damageDealt = calculateDamage('household');
                    applyDamage(opponent, damageDealt, true);
                    break;
                case 'shield':
                    activePlayer.om -= RULES.RITUAL_COSTS.medium;
                    activePlayer.shield += RULES.BASE_SHIELD_VALUE;
                    turnLog.push(`${activePlayer.name} создает щит прочностью ${RULES.BASE_SHIELD_VALUE}.`);
                    break;
                case 'dodge':
                    {
                        const cost = RULES.NON_MAGIC_COSTS.dodge + odPenalty;
                        activePlayer.od -= cost;
                        activePlayer.isDodging = true;
                        turnLog.push(`${activePlayer.name} готовится увернуться от следующей атаки. Затраты ОД: ${cost}${odPenalty > 0 ? ` (включая штраф ${odPenalty})` : ''}.`);
                    }
                    break;
                case 'use_item':
                     {
                        const cost = RULES.NON_MAGIC_COSTS.use_item + odPenalty;
                        activePlayer.od -= cost;
                        activePlayer.cooldowns.item = RULES.COOLDOWNS.item;
                        turnLog.push(`${activePlayer.name} использует предмет. Затраты ОД: ${cost}${odPenalty > 0 ? ` (включая штраф ${odPenalty})` : ''}.`);
                        
                        if (activePlayer.inventory.length > 0) {
                            const item = activePlayer.inventory[0];
                            if (item.type === 'heal') {
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + item.amount);
                                turnLog.push(`${activePlayer.name} использует "${item.name}" и восстанавливает ${item.amount} ОЗ.`);
                            }
                             if (item.type === 'damage') {
                                applyDamage(opponent, item.amount, false);
                                turnLog.push(`${activePlayer.name} использует "${item.name}" и наносит ${item.amount} урона.`);
                            }
                            activePlayer.inventory.shift();
                        }
                     }
                    break;
                case 'prayer':
                    {
                        const cost = RULES.NON_MAGIC_COSTS.prayer + odPenalty;
                        activePlayer.od -= cost;
                        activePlayer.cooldowns.prayer = RULES.COOLDOWNS.prayer;
                        
                        const roll = Math.floor(Math.random() * 10) + 1;
                        const requiredRoll = RULES.PRAYER_CHANCE[String(activePlayer.faithLevel)] || 0;
                        const isSuccess = activePlayer.faithLevel === 10 || (activePlayer.faithLevel > -1 && roll <= requiredRoll);

                        turnLog.push(`${activePlayer.name} молится о "${getActionLabel(action.type, action.payload)}". Бросок: ${roll}, нужно <= ${requiredRoll}. Затраты ОД: ${cost}${odPenalty > 0 ? ` (включая штраф ${odPenalty})` : ''}.`);

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
                    break;
                case 'remove_effect':
                    if (activePlayer.penalties.length > 0) {
                        const removedEffect = activePlayer.penalties.shift();
                        turnLog.push(`${activePlayer.name} снимает с себя эффект: "${removedEffect}".`);
                    }
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
                            const cost = ability.cost.od + odPenalty;
                            activePlayer.od -= cost;
                            turnLog.push(`Затраты ОД: ${cost}${odPenalty > 0 ? ` (включая штраф ${odPenalty})` : ''}.`);
                         }
                         if(ability.cost?.oz) {
                            activePlayer.oz -= ability.cost.oz;
                            turnLog.push(`Затраты ОЗ: ${ability.cost.oz}.`);
                         }

                         switch(abilityName) {
                            case 'Кислотное распыление':
                                 applyDamage(opponent, 10, false);
                                 break;
                            case 'Дар сладости':
                                 activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 15);
                                 turnLog.push(`${activePlayer.name} восстанавливает 15 ОЗ.`);
                                 break;
                            case 'Брызг из жабр':
                                applyEffect(opponent, 'Ослепление (1)');
                                turnLog.push(`${opponent.name} ослеплен на 1 ход.`);
                                break;
                            case 'Ядовитый дым':
                                applyEffect(opponent, 'Отравление (3)');
                                turnLog.push(`${opponent.name} отравлен на 3 хода.`);
                                break;
                            case 'Призыв звезды':
                                applyDamage(opponent, 20, true);
                                break;
                            case 'Танец лепестков':
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 10);
                                turnLog.push(`${activePlayer.name} восстанавливает 10 ОЗ.`);
                                break;
                            case 'Песня влюблённого':
                                applyDamage(opponent, 10, true);
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 10);
                                turnLog.push(`${activePlayer.name} восстанавливает 10 ОЗ.`);
                                break;
                            case 'Укус': 
                                applyDamage(opponent, 10, false);
                                if (activePlayer.bonuses.includes('+3 к восстановлению ОМ при укусе')) {
                                    const omRestored = 3;
                                    activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + omRestored);
                                    turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${omRestored} ОМ от укуса.`);
                                }
                                break;
                             case 'Окаменение взглядом':
                                applyEffect(opponent, 'Окаменение (1)');
                                turnLog.push(`${opponent.name} частично окаменел и теряет одно действие в следующем ходу.`);
                                break;
                             case 'Драконий выдох':
                                 applyDamage(opponent, 20, true);
                                 applyEffect(opponent, 'Горение (2)');
                                 turnLog.push(`${opponent.name} загорелся на 2 хода.`);
                                 break;
                             case 'Корнеплетение':
                                 applyEffect(opponent, 'Обездвижен (1)');
                                 turnLog.push(`${opponent.name} обездвижен на 1 ход.`);
                                 break;
                             case 'Теневая стрела':
                                 applyDamage(opponent, 15, true);
                                 break;
                            case 'Коса конца':
                                 opponent.oz = 0;
                                 turnLog.push(`${activePlayer.name} использует Косу конца. ${opponent.name} повержен!`);
                                 break;
                            case 'Похищение энергии':
                                const stolenOm = 10;
                                opponent.om = Math.max(0, opponent.om - stolenOm);
                                activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + stolenOm);
                                turnLog.push(`${activePlayer.name} похищает ${stolenOm} ОМ у ${opponent.name}.`);
                                break;
                            case 'Гипноз':
                                applyEffect(opponent, 'Под гипнозом (1)');
                                turnLog.push(`${opponent.name} под гипнозом и пропустит следующий ход.`);
                                break;
                         }
                    }
                    break;
            }
        });

        activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + RULES.PASSIVE_OM_REGEN);
        turnLog.push(`${activePlayer.name} восстанавливает ${RULES.PASSIVE_OM_REGEN} ОМ пассивно.`);

        const isResting = actions.some(a => a.type === 'rest');
        if (isResting) {
            activePlayer.od = Math.min(activePlayer.maxOd, activePlayer.od + RULES.OD_REGEN_ON_REST);
            turnLog.push(`${activePlayer.name} отдыхает и восстанавливает ${RULES.OD_REGEN_ON_REST} ОД.`);
        }

        activePlayer.oz = Math.max(0, activePlayer.oz);
        opponent.oz = Math.max(0, opponent.oz);
        activePlayer.om = Math.max(0, activePlayer.om);
        activePlayer.od = Math.max(0, activePlayer.od);
        
        activePlayer.physicalCondition = getPhysicalCondition(activePlayer.oz, activePlayer.maxOz);
        opponent.physicalCondition = getPhysicalCondition(opponent.oz, opponent.maxOz);

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
    const p1WithRace = { ...initialPlayer1, race: RACES[0].name, bonuses: [...RACES[0].passiveBonuses] };
    const p2WithRace = { ...initialPlayer2, race: RACES[0].name, bonuses: [...RACES[0].passiveBonuses] };

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
                        initialPlayer1={p1WithRace}
                        initialPlayer2={p2WithRace}
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

              <DuelLog turns={duel.turnHistory} player1Name={duel.player1.name} player2Name={duel.player2.name} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
