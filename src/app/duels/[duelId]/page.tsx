
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { firestore } from '@/lib/firestore';

import type { DuelState, Turn, Action, CharacterStats } from '@/types/duel';
import CharacterPanel from '@/components/character-panel';
import TurnForm from '@/components/turn-form';
import DuelLog from '@/components/duel-log';
import CharacterSetupModal from '@/components/character-setup-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Swords, Settings2, ShieldAlert, Check, ClipboardCopy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RULES, getActionLabel, RACES, initialPlayerStats, ELEMENTS } from '@/lib/rules';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { updateDuel, joinDuel } from '@/lib/firestore';
import { deepClone } from '@/lib/utils';

const getPhysicalCondition = (oz: number, maxOz: number): string => {
    const healthPercentage = (oz / maxOz) * 100;
    if (healthPercentage > 75) return 'В полном здравии';
    if (healthPercentage > 50) return 'Ранен';
    if (healthPercentage > 25) return 'Тяжело ранен';
    return 'Изнеможден';
};


export default function DuelPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const duelId = params.duelId as string;
  const isLocalSolo = duelId === 'solo';

  const [localDuelState, setLocalDuelState] = useState<DuelState | null>(null);
  const [copied, setCopied] = useState(false);

  const duelRef = !isLocalSolo ? doc(firestore, 'duels', duelId) : null;
  const [onlineDuel, onlineDuelLoading, onlineDuelError] = useDocumentData(duelRef);

  const duelData = isLocalSolo ? localDuelState : (onlineDuel as DuelState | undefined);
  const duelLoading = isLocalSolo ? false : onlineDuelLoading;
  const duelError = isLocalSolo ? null : onlineDuelError;

  useEffect(() => {
    if (isLocalSolo && !localDuelState && user) {
        const player1 = initialPlayerStats(user.uid, user.displayName || 'Игрок 1');
        const player2 = initialPlayerStats('SOLO_PLAYER_2', 'Игрок 2 (Соло)');
        setLocalDuelState({
            player1,
            player2,
            turnHistory: [],
            currentTurn: 1,
            activePlayerId: 'player1',
            winner: null,
            log: [],
            createdAt: new Date(),
            duelStarted: false,
        });
    }
  }, [isLocalSolo, localDuelState, user]);

  useEffect(() => {
    if (!isLocalSolo && user && onlineDuel && !onlineDuel.player2 && onlineDuel.player1.id !== user.uid) {
        joinDuel(duelId, user.uid, user.displayName || "Игрок 2");
    }
  }, [user, onlineDuel, duelId, isLocalSolo]);

  useEffect(() => {
    if (duelData && duelData.player1.isSetupComplete && duelData.player2?.isSetupComplete && !duelData.duelStarted) {
        handleUpdateDuelState({
            duelStarted: true,
            activePlayerId: Math.random() < 0.5 ? 'player1' : 'player2'
        });
    }
  }, [duelData]);

  const handleUpdateDuelState = (updatedDuel: Partial<DuelState>) => {
    if (isLocalSolo) {
        setLocalDuelState(prev => prev ? { ...prev, ...updatedDuel } as DuelState : null);
    } else {
        updateDuel(duelId, updatedDuel);
    }
  }

  const handleCharacterUpdate = (updatedCharacter: CharacterStats) => {
    if (!duelData) return;
    const updatedDuel: Partial<DuelState> = {
        player1: duelData.player1.id === updatedCharacter.id ? updatedCharacter : duelData.player1,
        player2: duelData.player2 && duelData.player2.id === updatedCharacter.id ? updatedCharacter : duelData.player2,
    };
    handleUpdateDuelState(updatedDuel);
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
        let opponent = deepClone(duelData.activePlayerId === 'player1' ? duelData.player2 : duelData.player1);
        
        const startStats = { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: deepClone(activePlayer.shield) };
        
        let turnSkipped = false;
        const simpleTurnSkipEffects = ['Под гипнозом', 'Обездвижен', 'Транс', 'Усыпление'];
        let petrificationCount = 0;
        
        activePlayer.bonuses.forEach(bonus => {
            const healMatch = bonus.match(/\+(\d+) исцеления\/ход/);
            if (healMatch) {
                const healAmount = parseInt(healMatch[1], 10);
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + healAmount);
                turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${healAmount} ОЗ.`);
            }
             const ozMatch = bonus.match(/\+(\d+) ОЗ\/ход/);
            if (ozMatch) {
                const ozAmount = parseInt(ozMatch[1], 10);
                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + ozAmount);
                turnLog.push(`Пассивная способность (${activePlayer.race}): ${activePlayer.name} восстанавливает ${ozAmount} ОЗ.`);
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
                    actions = []; 
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

            const isBurning = p.startsWith('Горение');
            if (isBurning && activePlayer.bonuses.some(b => b === 'Иммунитет к огню' || b === 'Иммунитет к льду')) {
                const immunityType = activePlayer.bonuses.includes('Иммунитет к огню') ? 'огню' : 'льду';
                turnLog.push(`Иммунитет к ${immunityType}: урон от "${p}" не получен.`);
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
                turnNumber: duelData.currentTurn,
                playerId: activePlayer.id,
                playerName: activePlayer.name,
                actions: [{type: 'rest', payload: {name: 'Пропуск хода'}}],
                log: turnLog,
                startStats: startStats,
                endStats: { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: activePlayer.shield },
            };
            
            activePlayer.physicalCondition = getPhysicalCondition(activePlayer.oz, activePlayer.maxOz);
            opponent.physicalCondition = getPhysicalCondition(opponent.oz, opponent.maxOz);
            
            const { isDodging: _activeIsDodging, ...finalActivePlayer } = activePlayer;
            const { isDodging: _opponentIsDodging, ...finalOpponent } = opponent;

            const updatedDuel: Partial<DuelState> = {
                player1: duelData.activePlayerId === 'player1' ? finalActivePlayer : finalOpponent,
                player2: duelData.activePlayerId === 'player2' ? finalActivePlayer : finalOpponent,
                turnHistory: [...duelData.turnHistory, newTurn],
                currentTurn: duelData.currentTurn + 1,
                activePlayerId: duelData.activePlayerId === 'player1' ? 'player2' : 'player1',
                winner: null,
                log: turnLog,
            };
            handleUpdateDuelState(updatedDuel);
            return;
        }

        const applyEffect = (target: CharacterStats, effect: string) => {
            const effectName = effect.split(' (')[0];
            
            const immunityCheck = `Иммунитет к ${effectName.toLowerCase()}`;
            if (target.bonuses.some(b => b.toLowerCase().startsWith(immunityCheck))) {
                 turnLog.push(`${target.name} имеет иммунитет к эффекту "${effectName}" и он не был наложен.`);
                 return;
            }
            if (effectName === 'Горение' && target.bonuses.some(b => b === 'Иммунитет к огню' || b === 'Иммунитет к льду')) {
                const immunityType = target.bonuses.includes('Иммунитет к огню') ? 'огню' : 'льду';
                turnLog.push(`${target.name} имеет иммунитет к ${immunityType}, и эффект "${effectName}" не был наложен.`);
                return;
            }

            const existingEffectIndex = target.penalties.findIndex(p => p.startsWith(effectName));

            if (existingEffectIndex > -1) {
                const existingEffect = target.penalties[existingEffectIndex];
                const existingMatch = existingEffect.match(/\((\d+)\)/);
                const newMatch = effect.match(/\((\d+)\)/);

                if (existingMatch && newMatch) {
                    const existingDuration = parseInt(existingMatch[1], 10);
                    const newDuration = parseInt(newMatch[1], 10);
                    if (newDuration > existingDuration) {
                        target.penalties[existingEffectIndex] = effect;
                        turnLog.push(`Эффект "${effectName}" на ${target.name} был обновлен.`);
                    }
                }
            } else {
                target.penalties.push(effect);
                turnLog.push(`${target.name} получает эффект "${effect}".`);
            }
        };

        const applyDamage = (attacker: CharacterStats, target: CharacterStats, amount: number, isSpell: boolean, spellElement?: string) => {
            let finalDamage = amount;

            if (isSpell && spellElement) {
                const immunityString = `Иммунитет к ${spellElement.toLowerCase()}`;
                if (target.bonuses.some(b => b.toLowerCase() === immunityString)) {
                    turnLog.push(`${target.name} имеет иммунитет к стихии "${spellElement}" и не получает урон.`);
                    return;
                }
            }

            if (target.bonuses.includes('Поглощение входящего магического урона') && isSpell) {
                const restoredOm = Math.round(amount);
                target.om = Math.min(target.maxOm, target.om + restoredOm);
                turnLog.push(`Пассивная способность (Ларимы): ${target.name} поглощает ${restoredOm} магического урона и восстанавливает ОМ.`);
                return;
            }

            if (isSpell && spellElement === 'Вода') {
                const burningIndex = target.penalties.findIndex(p => p.startsWith('Горение'));
                if (burningIndex > -1) {
                    const removedEffect = target.penalties.splice(burningIndex, 1)[0];
                    turnLog.push(`Стихия Воды тушит эффект "${removedEffect}" на ${target.name}.`);
                }
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
            }
            finalDamage = Math.round(finalDamage);

            let damageDealtToTarget = 0;

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
                if (attacker.bonuses.includes('При попадании: Накладывает кровотечение (2)')) {
                    applyEffect(target, 'Кровотечение (2)');
                }
            }

            if (target.race === 'Безликие' && damageDealtToTarget > 0) {
                attacker.oz -= damageDealtToTarget;
                turnLog.push(`Пассивная способность (Безликий): отзеркаливает ${damageDealtToTarget} урона обратно в ${attacker.name}!`);
            }
            
            if (isSpell && spellElement) {
                switch (spellElement) {
                    case 'Огонь':
                        applyEffect(target, 'Горение (2)');
                        break;
                }
            }
        };

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
                 if (activePlayer.bonuses.includes('Расовая ярость (+10 к урону)')) {
                    damage += 10;
                    turnLog.push(`Пассивная способность (Орк): "Расовая ярость" увеличивает урон на 10.`);
                }

                return Math.round(damage);
            };

            let damageDealt = 0;
            const odPenalty = getOdCostPenalty(activePlayer);

            switch(action.type) {
                case 'strong_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.strong;
                    damageDealt = calculateDamage('strong');
                    applyDamage(activePlayer, opponent, damageDealt, true, action.payload?.element);
                    activePlayer.cooldowns.strongSpell = RULES.COOLDOWNS.strongSpell;
                    break;
                case 'medium_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.medium;
                    damageDealt = calculateDamage('medium');
                    applyDamage(activePlayer, opponent, damageDealt, true, action.payload?.element);
                    break;
                case 'small_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.small;
                    damageDealt = calculateDamage('small');
                    applyDamage(activePlayer, opponent, damageDealt, true, action.payload?.element);
                    break;
                case 'household_spell':
                    activePlayer.om -= RULES.RITUAL_COSTS.household;
                    damageDealt = calculateDamage('household');
                    applyDamage(activePlayer, opponent, damageDealt, true, action.payload?.element);
                    break;
                case 'shield':
                    activePlayer.om -= RULES.RITUAL_COSTS.medium;
                    activePlayer.shield.hp += RULES.BASE_SHIELD_VALUE;
                    activePlayer.shield.element = action.payload?.element === 'physical' ? null : action.payload?.element || null;
                    const shieldType = activePlayer.shield.element ? `${activePlayer.shield.element} щит` : "Физический щит";
                    turnLog.push(`${activePlayer.name} создает ${shieldType} прочностью ${RULES.BASE_SHIELD_VALUE}.`);
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
                                applyDamage(activePlayer, opponent, item.amount, false);
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
                         
                         turnLog.push(`Способность "${ability.name}": ${ability.description}.`);

                         switch(abilityName) {
                            case 'Кислотное распыление':
                                 applyDamage(activePlayer, opponent, 10, false);
                                 turnLog.push(`Способность "Кислотное распыление": ${opponent.name} получает 10 урона.`);
                                 break;
                            case 'Дар сладости':
                                 activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 15);
                                 turnLog.push(`Способность "Дар сладости": ${activePlayer.name} восстанавливает 15 ОЗ.`);
                                 break;
                            case 'Брызг из жабр':
                                applyEffect(opponent, 'Ослепление (1)');
                                break;
                            case 'Ядовитый дым':
                                applyEffect(opponent, 'Отравление (3)');
                                break;
                            case 'Призыв звезды':
                                applyDamage(activePlayer, opponent, 20, true);
                                turnLog.push(`Способность "Призыв звезды": ${opponent.name} получает 20 урона.`);
                                break;
                            case 'Танец лепестков':
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 10);
                                turnLog.push(`Способность "Танец лепестков": ${activePlayer.name} восстанавливает 10 ОЗ.`);
                                break;
                            case 'Песня влюблённого':
                                applyDamage(activePlayer, opponent, 10, true);
                                activePlayer.oz = Math.min(activePlayer.maxOz, activePlayer.oz + 10);
                                turnLog.push(`Способность "Песня влюблённого": ${opponent.name} получает 10 урона, а ${activePlayer.name} восстанавливает 10 ОЗ.`);
                                break;
                            case 'Укус': 
                                {
                                    let biteDamage = 10;
                                    if(activePlayer.bonuses.includes('Укус (+10 ОЗ)')) {
                                        biteDamage += 10;
                                        turnLog.push(`Пассивная способность (Василиск): Укус усилен и наносит дополнительно 10 урона.`);
                                    }
                                    applyDamage(activePlayer, opponent, biteDamage, false);
                                    if (activePlayer.bonuses.includes('+3 к восстановлению ОМ при укусе')) {
                                        const omRestored = 3;
                                        activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + omRestored);
                                        turnLog.push(`Пассивная способность (Вампир): ${activePlayer.name} восстанавливает ${omRestored} ОМ от укуса.`);
                                    }
                                    turnLog.push(`Способность "Укус": ${opponent.name} получает ${biteDamage} урона.`);
                                }
                                break;
                             case 'Окаменение взглядом':
                                applyEffect(opponent, 'Окаменение (1)');
                                break;
                             case 'Драконий выдох':
                                 applyDamage(activePlayer, opponent, 20, true, 'Огонь');
                                 applyEffect(opponent, 'Горение (2)');
                                 break;
                             case 'Корнеплетение':
                                 applyEffect(opponent, 'Обездвижен (1)');
                                 break;
                             case 'Теневая стрела':
                                 applyDamage(activePlayer, opponent, 15, true);
                                 turnLog.push(`Способность "Теневая стрела": ${opponent.name} получает 15 урона.`);
                                 break;
                            case 'Коса конца':
                                 opponent.oz = 0;
                                 turnLog.push(`Способность "Коса конца": ОЗ ${opponent.name} снижены до 0.`);
                                 break;
                            case 'Похищение энергии':
                                const stolenOm = 10;
                                opponent.om = Math.max(0, opponent.om - stolenOm);
                                activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + stolenOm);
                                turnLog.push(`Способность "Похищение энергии": ${activePlayer.name} похищает 10 ОМ у ${opponent.name}.`);
                                break;
                            case 'Гипноз':
                                applyEffect(opponent, 'Под гипнозом (1)');
                                break;
                            case 'Фосфоресцирующий всплеск':
                                applyEffect(opponent, 'Ослепление (1)');
                                break;
                            case 'Песнь чар':
                                applyEffect(opponent, 'Транс (1)');
                                break;
                            case 'Мурлыканье':
                                applyEffect(opponent, 'Усыпление (1)');
                                break;
                            case 'Луч истины':
                                applyDamage(activePlayer, opponent, 15, true, 'Свет');
                                turnLog.push(`Способность "Луч истины": ${opponent.name} получает 15 урона светом.`);
                                break;
                         }
                    }
                    break;
            }
        });
        
        const isResting = actions.some(a => a.type === 'rest');
        if (isResting) {
            activePlayer.od = Math.min(activePlayer.maxOd, activePlayer.od + RULES.OD_REGEN_ON_REST);
            activePlayer.om = Math.min(activePlayer.maxOm, activePlayer.om + RULES.OM_REGEN_ON_REST);
            turnLog.push(`${activePlayer.name} отдыхает и восстанавливает ${RULES.OD_REGEN_ON_REST} ОД и ${RULES.OM_REGEN_ON_REST} ОМ.`);
        }

        activePlayer.oz = Math.max(0, activePlayer.oz);
        opponent.oz = Math.max(0, opponent.oz);
        activePlayer.om = Math.max(0, activePlayer.om);
        activePlayer.od = Math.max(0, activePlayer.od);
        
        activePlayer.physicalCondition = getPhysicalCondition(activePlayer.oz, activePlayer.maxOz);
        opponent.physicalCondition = getPhysicalCondition(opponent.oz, opponent.maxOz);

        let winner = null;
        if (activePlayer.oz <= 0) winner = opponent.name;
        if (opponent.oz <= 0) winner = activePlayer.name;

        const newTurn: Turn = {
            turnNumber: duelData.currentTurn,
            playerId: activePlayer.id,
            playerName: activePlayer.name,
            actions: actions,
            log: turnLog,
            startStats: startStats,
            endStats: { oz: activePlayer.oz, om: activePlayer.om, od: activePlayer.od, shield: deepClone(activePlayer.shield) },
        };
        
        const { isDodging: _activeIsDodging, ...finalActivePlayer } = activePlayer;
        const { isDodging: _opponentIsDodging, ...finalOpponent } = opponent;

        const updatedDuel: Partial<DuelState> = {
            player1: duelData.activePlayerId === 'player1' ? finalActivePlayer : finalOpponent,
            player2: duelData.activePlayerId === 'player2' ? finalActivePlayer : finalOpponent,
            turnHistory: [...duelData.turnHistory, newTurn],
            currentTurn: duelData.currentTurn + 1,
            activePlayerId: duelData.activePlayerId === 'player1' ? 'player2' : 'player1',
            winner: winner,
            log: turnLog,
        };

        handleUpdateDuelState(updatedDuel);
  };
  
  if (loading || duelLoading || (isLocalSolo && !localDuelState)) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    );
  }

  if (duelError || !duelData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-destructive">Не удалось загрузить дуэль. Возможно, ID неверный.</p>
            <Button onClick={() => router.push('/duels')}>
                <ArrowLeft className="mr-2" />
                Вернуться к списку дуэлей
            </Button>
        </div>
      )
  }
  
  if (!user) {
    // This should not be reached if useAuth redirects correctly.
    return null;
  }

  if (!isLocalSolo && !duelData.player2) {
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
      )
  }

  const currentPlayerId = user.uid === duelData.player1.id ? 'player1' : 'player2';
  const player = currentPlayerId === 'player1' ? duelData.player1 : duelData.player2!;
  const opponent = currentPlayerId === 'player1' ? (isLocalSolo ? duelData.player2! : duelData.player2) : duelData.player1;

  if (!player) {
     return <div className="flex items-center justify-center min-h-screen">Загрузка игрока...</div>;
  }
  
  const isMyTurn = isLocalSolo || (duelData.duelStarted && duelData.activePlayerId === currentPlayerId);

  const activePlayer = duelData.activePlayerId === 'player1' ? duelData.player1 : duelData.player2!;
  const opponentPlayer = duelData.activePlayerId === 'player1' ? duelData.player2! : duelData.player1;

  const bothPlayersSetup = duelData.player1.isSetupComplete && duelData.player2?.isSetupComplete;
  const showSetupModal = player && !player.isSetupComplete;
  
  const renderWaitingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Settings2 className="animate-spin" />
                    Ожидание оппонента
                </CardTitle>
                <CardDescription>
                    Ваш оппонент еще настраивает своего персонажа. Дуэль начнется, как только он будет готов.
                </CardDescription>
            </CardHeader>
        </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showSetupModal && player && (
         <CharacterSetupModal 
            character={player} 
            onSave={handleCharacterUpdate}
         />
      )}
      
      {isLocalSolo && duelData.player2 && !duelData.player2.isSetupComplete && (
         <CharacterSetupModal 
            character={duelData.player2} 
            onSave={handleCharacterUpdate}
         />
      )}


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
      
      {!duelData.duelStarted && !isLocalSolo && opponent && !opponent.isSetupComplete && player.isSetupComplete && renderWaitingScreen()}
      
      {(bothPlayersSetup) && (
        <main className="container mx-auto p-2 md:p-4">
            {duelData.winner ? (
            <Card className="text-center p-4 md:p-8 mt-4">
                <CardTitle className="text-2xl md:text-3xl font-bold text-accent mb-4">Дуэль Окончена!</CardTitle>
                <CardContent>
                <p className="text-lg md:text-xl">Победитель: {duelData.winner}</p>
                <Button onClick={() => router.push('/duels')} className="mt-6">Начать новую</Button>
                </CardContent>
            </Card>
            ) : (
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                  <CharacterPanel 
                      character={duelData.player1} 
                      isActive={duelData.activePlayerId === 'player1'} 
                  />
                  {duelData.player2 && 
                      <CharacterPanel 
                          character={duelData.player2} 
                          isActive={duelData.activePlayerId === 'player2'} 
                      />}
                </div>

                <div className="w-full lg:w-2/3 flex flex-col gap-4">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                        <span>Ход {duelData.currentTurn}: {activePlayer.name}</span>
                        <span className={`text-sm font-medium ${isMyTurn ? 'text-accent' : 'text-muted-foreground'}`}>
                            {isMyTurn ? "Ваш ход" : `Ход ${opponentPlayer.name}`}
                        </span>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    {isMyTurn ? (
                        <TurnForm
                            player={activePlayer}
                            opponent={opponentPlayer}
                            onSubmit={executeTurn}
                        />
                    ) : (
                        <div className="text-center text-muted-foreground p-4 md:p-8">
                            Ожидание хода оппонента...
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
      )}
    </div>
  );
}
