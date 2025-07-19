

'use client';

import { useState, useMemo } from 'react';
import type { Action, CharacterStats, ActionType, PrayerEffectType, WeaponType } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Trash2, Send, ShieldCheck, HeartPulse, SparklesIcon, Heart, Zap, MoveHorizontal, Crosshair, Info, Ban } from 'lucide-react';
import { RULES, getActionLabel, RACES, WEAPONS, ARMORS } from '@/lib/rules';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface TurnFormProps {
  player: CharacterStats;
  opponent: CharacterStats;
  onSubmit: (actions: Action[]) => void;
  distance: number;
}

export default function TurnForm({ player, opponent, onSubmit, distance }: TurnFormProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [isPrayerDialogOpen, setIsPrayerDialogOpen] = useState(false);
  const [isDruidAbilityOpen, setIsDruidAbilityOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isHealDialogOpen, setIsHealDialogOpen] = useState(false);
  const [moveAmount, setMoveAmount] = useState(1);
  const [healAmount, setHealAmount] = useState(1);
  const [moveDirection, setMoveDirection] = useState<'closer' | 'further'>('further');
  const [selectValue, setSelectValue] = useState('');
  const playerRaceInfo = RACES.find(r => r.name === player.race);

  const maxActionsPerTurn = useMemo(() => {
    return player.penalties.some(p => p.startsWith('Потеря действия')) ? 1 : RULES.MAX_ACTIONS_PER_TURN;
  }, [player.penalties]);
  
  const restActionsCount = useMemo(() => actions.filter(a => a.type === 'rest').length, [actions]);


  const calculatePotentialDamage = (baseDamage: number, isSpell: boolean, spellElement?: string): number => {
    let damage = baseDamage;
    const wasAttackedLastTurn = player.statuses?.includes('Был атакован в прошлом ходу');
    let damageTakenLastTurn = 0; // Simplified for UI, real logic is in duel engine
    
    // This is a simplified version of the damage calculation logic from the main page
    // It only includes attacker's bonuses to give a baseline damage estimate
    if (player.bonuses.includes('Трансформация (+30 урон)')) damage += 30;
    if (player.bonuses.includes('Единение с духами (+10 к урону от стихийных атак)') && isSpell) damage += 10;
    if (player.bonuses.includes('Стихийная преданность (+5 урона при атаке своей стихией)') && isSpell && spellElement && player.elementalKnowledge.includes(spellElement)) damage += 5;
    if (player.bonuses.includes('Взрыв ярости (+10 урона по врагу в случае, если ОЗ ниже 100)') && player.oz < 100) damage += 5;
    if (player.bonuses.includes('Пылающий дух (+5 к урону, если ОЗ ниже 100)') && player.oz < 100) damage += 5;
    if (isSpell && player.bonuses.includes('Боевая магия')) {
        const actionType = actions.length > 0 ? actions[actions.length-1].type : 'small_spell'; // Approximation
        const bonus = RULES.DAMAGE_BONUS.battle_magic[actionType as keyof typeof RULES.DAMAGE_BONUS.battle_magic] ?? 0;
        damage += bonus;
    }
    if (player.bonuses.includes('Расовая ярость (+10 к урону)')) damage += 10;
    if (player.bonuses.includes('Меткость— + 10 к урону')) damage += 10;
    if (player.bonuses.includes('Боль превращения (+10 урон)')) damage += 10;
    if (player.bonuses.includes('Воинская слава (+10 урона при контратаке)') && wasAttackedLastTurn) damage += 10;
    if (player.bonuses.includes('Рёв предков (+5 урона по врагу, если персонаж был атакован в прошлом ходу)') && wasAttackedLastTurn) damage += 5;
    if (player.bonuses.includes('Кровавое могущество (+10 урона, если ОЗ врага меньше 100)') && opponent.oz < 100) damage += 10;
    if (player.bonuses.includes('Эхолокация (+10 к урону при первом попадании в дуэли)')) damage += 10; // This might be off if not first hit
    if (player.bonuses.includes('Драконья ярость (+10 урона, если получено более 40 урона за прошлый ход)') && damageTakenLastTurn > 40) damage += 10;
    if (!isSpell && player.bonuses.includes('Удар крыла (+10 к физическим атакам)')) damage += 10;
    if (!isSpell && player.bonuses.includes('Уверенность в прыжке (+10 к физическим атакам)')) damage += 10;
    if (!isSpell && player.bonuses.includes('Сила кузни (+10 к физическим атакам по врагу)')) damage += 10;

    return Math.round(damage);
  };

  const addAction = (type: string, payload?: any) => {
    if (actions.length >= maxActionsPerTurn || !type) return;

    if (type === 'prayer') {
      setIsPrayerDialogOpen(true);
      return;
    }
    
    if (type === 'racial_Песня стихий') {
      setIsDruidAbilityOpen(true);
      return;
    }

    if (type === 'move') {
      setMoveAmount(1); // Reset on open
      setIsMoveDialogOpen(true);
      return;
    }

    if (type === 'heal_self') {
      setHealAmount(1); // Reset on open
      setIsHealDialogOpen(true);
      return;
    }
    
    if (type === 'physical_attack') {
        const weapon = WEAPONS[player.weapon];
        setActions([...actions, {type: 'physical_attack', payload: { weapon: weapon.name }}]);
        setSelectValue('');
        return;
    }
    
    if (type === 'rest') {
        if (restActionsCount < 2) {
            setActions([...actions, { type: 'rest', payload: {} }]);
        }
        setSelectValue('');
        return;
    }

    if (type.startsWith('racial_')) {
      const abilityName = type.substring(7);
      const ability = playerRaceInfo?.activeAbilities.find(a => a.name === abilityName);
      if (ability) {
        setActions([...actions, { type: 'racial_ability', payload: { name: ability.name, description: ability.description } }]);
      }
    } else {
      setActions([...actions, { type: type as ActionType, payload }]);
    }
    setSelectValue('');
  };
  
  const updateActionPayload = (index: number, newPayload: any) => {
    const newActions = [...actions];
    newActions[index].payload = { ...newActions[index].payload, ...newPayload };
    setActions(newActions);
  };

  const handlePrayerSelect = (effect: PrayerEffectType) => {
    if (actions.length < maxActionsPerTurn) {
      setActions([...actions, { type: 'prayer', payload: { effect } }]);
    }
    setIsPrayerDialogOpen(false);
    setSelectValue('');
  };

  const handleDruidAbilitySelect = (subAction: 'damage' | 'heal') => {
      if (actions.length < maxActionsPerTurn) {
          setActions([...actions, { type: 'racial_ability', payload: { name: 'Песня стихий', subAction } }]);
      }
      setIsDruidAbilityOpen(false);
      setSelectValue('');
  };

  const handleMoveSelect = () => {
    if (actions.length < maxActionsPerTurn) {
      const finalDistance = moveDirection === 'closer' ? -moveAmount : moveAmount;
      if (distance + finalDistance < 0) {
        console.error("Cannot move closer than 0 meters");
        setIsMoveDialogOpen(false);
        return;
      }
      setActions([...actions, { type: 'move', payload: { distance: finalDistance } }]);
    }
    setIsMoveDialogOpen(false);
    setSelectValue('');
  };

  const handleHealSelect = () => {
    if(actions.length < maxActionsPerTurn) {
      setActions([...actions, { type: 'heal_self', payload: { amount: healAmount } }]);
    }
    setIsHealDialogOpen(false);
    setSelectValue('');
  };


  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };
  
  const handleFormSubmit = () => {
    onSubmit(actions);
    setActions([]);
  };
  
  const getOdCostPenalty = (p: CharacterStats): { wound: number; armor: number; charm: number } => {
    if (p.race === 'Куклы' && p.bonuses.includes('Абсолютная память — не тратится ОД.')) {
        return { wound: -Infinity, armor: 0, charm: 0 }; // Special value for zero cost
    }
    let woundPenalty = 0;
    for (const wound of RULES.WOUND_PENALTIES) {
        if (p.oz < wound.threshold) {
            woundPenalty = wound.penalty;
        }
    }
    const armorPenalty = ARMORS[p.armor as ArmorType]?.odPenalty ?? 0;
    const charmPenalty = p.penalties.some(p => p.startsWith('Очарование (Сирена)')) ? 10 : 0;
    
    return { wound: woundPenalty, armor: armorPenalty, charm: charmPenalty };
  };

  const odPenalties = getOdCostPenalty(player);

  const hasPrayerAction = actions.some(a => a.type === 'prayer');
  const hasAddedAction = (actionType: ActionType) => actions.some(a => a.type === actionType);

  const isFaceless = player.race === 'Безликие';
  const hasElementalKnowledge = player.elementalKnowledge.length > 0;
  
  const spellRange = RULES.SPELL_RANGES[player.reserve];
  const isOpponentInRangeForSpells = distance <= spellRange;

  const weaponInfo = WEAPONS[player.weapon as WeaponType];
  const isOpponentInRangeForWeapon = distance <= weaponInfo.range;
  
  const getFinalOdCost = (baseCost: number, isMove: boolean = false) => {
    if (odPenalties.wound === -Infinity) return 0; // Check for the special value
    
    let cost = baseCost + odPenalties.wound + odPenalties.armor + odPenalties.charm;
    
    let reduction = 0;
     if (isMove && player.bonuses.includes('Быстрые мышцы (-5 ОД на действия, связанные с перемещением)')) {
        reduction += 5;
    }
    if (player.bonuses.includes('Лёгкость (-5 ОД на уклонение)')) reduction += 5;
    if (player.bonuses.includes('Мимикрия (-15 ОД на уклонение)')) reduction += 15;
    if (player.bonuses.includes('Животная реакция (-5 ОД на физические действия)') || player.bonuses.includes('Ловкие конечности (-5 ОД на действия)') || player.bonuses.includes('Галоп (-5 ОД на действия)')) {
        reduction += 5;
    }
    return Math.max(0, cost - reduction);
  };
  const physicalAttackCost = getFinalOdCost(RULES.NON_MAGIC_COSTS.physical_attack);

  const isSubmitDisabled = useMemo(() => {
    if (actions.length === 0) return true;
    return actions.some(action => {
      const needsElement = ['strong_spell', 'medium_spell', 'small_spell', 'household_spell', 'shield'].includes(action.type);
      return needsElement && !action.payload?.element;
    });
  }, [actions]);

  const strongSpellDamage = calculatePotentialDamage(RULES.RITUAL_DAMAGE[player.reserve]?.strong ?? 0, true);
  const mediumSpellDamage = calculatePotentialDamage(RULES.RITUAL_DAMAGE[player.reserve]?.medium ?? 0, true);
  const smallSpellDamage = calculatePotentialDamage(RULES.RITUAL_DAMAGE[player.reserve]?.small ?? 0, true);
  const householdSpellDamage = calculatePotentialDamage(RULES.RITUAL_DAMAGE[player.reserve]?.household ?? 0, true);
  const physicalAttackDamage = calculatePotentialDamage(weaponInfo.damage, false);
  
  const getActionDisabledReason = (type: string, racialAbilityName?: string): string | null => {
      if (type === 'rest') {
          return restActionsCount >= 2 ? 'Можно отдохнуть только дважды за ход' : null;
      }
      
      const racialAbility = racialAbilityName ? playerRaceInfo?.activeAbilities.find(a => a.name === racialAbilityName) : null;
      let omCost = racialAbility?.cost?.om ?? RULES.RITUAL_COSTS[type.replace('_spell', '') as keyof typeof RULES.RITUAL_COSTS] ?? 0;
      if (type === 'heal_self') omCost = 0; // Dynamic cost
      
      const odCost = getFinalOdCost(racialAbility?.cost?.od ?? RULES.NON_MAGIC_COSTS[type as keyof typeof RULES.NON_MAGIC_COSTS] ?? 0);
      const cooldown = racialAbilityName ? (player.cooldowns[racialAbilityName] ?? 0) : (player.cooldowns[type as keyof typeof player.cooldowns] ?? 0);
      
      if (cooldown > 0) return `На перезарядке (Осталось: ${cooldown} хода)`;
      if (player.om < omCost) return `Недостаточно ОМ (Требуется: ${omCost} > Есть: ${player.om})`;
      if (player.od < odCost) return `Недостаточно ОД (Требуется: ${odCost} > Есть: ${player.od})`;
      
      const isSpell = type.includes('spell') || type === 'shield';
      if(isSpell) {
        if(isFaceless && type !== 'household_spell') return 'Безликие не могут использовать магию';
        if(!hasElementalKnowledge) return 'Нет знаний стихий для использования магии';
        if(type !== 'shield' && !isOpponentInRangeForSpells) return `Цель вне зоны досягаемости (Текущая: ${distance}м > Требуемая: ${spellRange}м)`;
      }

      if (type === 'physical_attack' && !isOpponentInRangeForWeapon) {
          return `Цель вне зоны досягаемости (Текущая: ${distance}м > Требуемая: ${weaponInfo.range}м)`;
      }
      
      if (type === 'heal_self' && !player.elementalKnowledge.includes('Исцеление')) {
        return 'Требуется знание стихии "Исцеление"';
      }

      if(hasAddedAction(type as ActionType)) return 'Это действие уже добавлено';
      if(type === 'use_item' && player.inventory.length === 0) return 'Инвентарь пуст';

      return null;
  };

  const renderSelectOption = (value: string, label: string, group: string, racialAbilityName?: string) => {
    const disabledReason = getActionDisabledReason(value, racialAbilityName);
    const isDisabled = !!disabledReason;

    const item = <SelectItem value={value} disabled={isDisabled}>{label}</SelectItem>

    if(isDisabled) {
        return (
            <Tooltip>
                <TooltipTrigger asChild><div className="relative flex w-full items-center">{item}</div></TooltipTrigger>
                <TooltipContent><p>{disabledReason}</p></TooltipContent>
            </Tooltip>
        );
    }
    return item;
  }
  
  const moveCostPerMeter = getFinalOdCost(RULES.NON_MAGIC_COSTS.move_per_meter, true);
  const maxMoveDistance = moveCostPerMeter > 0 ? Math.floor(player.od / moveCostPerMeter) : Infinity;
  const currentMoveCost = moveCostPerMeter * moveAmount;
  const canConfirmMove = currentMoveCost <= player.od;

  const healCostPerOz = 2;
  const maxHealAmount = useMemo(() => {
    if (!player) return 0;
    const missingHealth = player.maxOz - player.oz;
    const maxHealFromOm = Math.floor(player.om / healCostPerOz);
    return Math.min(missingHealth, maxHealFromOm);
  }, [player, healCostPerOz]);

  const currentHealCost = healAmount * healCostPerOz;
  const canConfirmHeal = currentHealCost <= player.om && healAmount <= (player.maxOz - player.oz);

  const actionOptions = [
    // Physical
    { group: 'physical', value: 'physical_attack', label: `Атака (${weaponInfo.name}) - Урон: ${physicalAttackDamage}, Дальность: ${weaponInfo.range}м, ОД: ${physicalAttackCost}` },
    
    // Magic
    { group: 'magic', value: 'strong_spell', label: `Сильный ритуал - Урон: ${strongSpellDamage}, Дальность: ${spellRange}м` },
    { group: 'magic', value: 'medium_spell', label: `Средний ритуал - Урон: ${mediumSpellDamage}, Дальность: ${spellRange}м` },
    { group: 'magic', value: 'small_spell', label: `Малый ритуал - Урон: ${smallSpellDamage}, Дальность: ${spellRange}м` },
    { group: 'magic', value: 'household_spell', label: `Бытовое - Урон: ${householdSpellDamage}, Дальность: ${spellRange}м` },
    { group: 'magic', value: 'shield', label: 'Создать щит' },
    { group: 'magic', value: 'heal_self', label: 'Исцелить себя' },

    // Other
    { group: 'other', value: 'dodge', label: `Уворот (${getFinalOdCost(RULES.NON_MAGIC_COSTS.dodge)} ОД)` },
    { group: 'other', value: 'move', label: 'Передвижение' },
    { group: 'other', value: 'use_item', label: 'Использовать предмет' },
    { group: 'other', value: 'prayer', label: 'Молитва' },
    { group: 'other', value: 'remove_effect', label: 'Снять с себя эффект' },
    { group: 'other', value: 'rest', label: 'Отдых' },
  ];

  const racialAbilities = playerRaceInfo?.activeAbilities.map(ability => {
    const value = `racial_${ability.name}`;
    return {
      group: 'racial',
      value: value,
      label: `${ability.name}`,
      racialAbilityName: ability.name,
    }
  }) || [];

  const spellActionsWithElement = ['strong_spell', 'medium_spell', 'small_spell', 'household_spell', 'shield'];

  const isUnderHold = player.penalties.some(p => p.startsWith('Удержание'));

  if (isUnderHold) {
      return (
          <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-destructive/10 text-destructive-foreground">
                  <Ban className="w-8 h-8 mb-2 text-destructive" />
                  <h3 className="font-semibold">Способности заблокированы</h3>
                  <p className="text-sm text-center">Вы находитесь под эффектом "Удержание". Вы можете только попытаться снять его или отдохнуть.</p>
              </div>
              <div className="space-y-2">
                  <Button 
                      onClick={() => addAction('remove_effect')} 
                      disabled={hasAddedAction('remove_effect') || actions.length >= maxActionsPerTurn}
                      className="w-full"
                  >
                      Снять с себя эффект
                  </Button>
                  <Button 
                      onClick={() => addAction('rest')} 
                      disabled={restActionsCount >= 2 || actions.length >= maxActionsPerTurn}
                      className="w-full"
                      variant="secondary"
                  >
                      Отдых ({restActionsCount}/2)
                  </Button>
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">Выбранные действия:</label>
                {actions.length === 0 && <p className="text-sm text-muted-foreground">Выберите действие.</p>}
                <div className="space-y-2">
                    {actions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded-lg bg-background/50">
                            <span className="flex-grow">{index + 1}. {getActionLabel(action.type, action.payload)}</span>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8" onClick={() => removeAction(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
              </div>
              <Button onClick={handleFormSubmit} disabled={actions.length === 0} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Завершить ход
              </Button>
          </div>
      )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Выбранные действия:</label>
          {actions.length === 0 && <p className="text-sm text-muted-foreground">Выберите до {maxActionsPerTurn} действий.</p>}
          <div className="space-y-2">
              {actions.map((action, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 border rounded-lg bg-background/50">
                      <span className="flex-grow">{index + 1}. {getActionLabel(action.type, action.payload)}</span>
                      <div className="flex items-center gap-2">
                        {spellActionsWithElement.includes(action.type) && action.payload?.name !== 'Песня стихий' && player.elementalKnowledge.length > 0 && (
                          <Select
                            value={action.payload?.element || ''}
                            onValueChange={(element) => updateActionPayload(index, { element })}
                          >
                            <SelectTrigger className="w-full sm:w-[180px] h-8">
                              <SelectValue placeholder="Стихия..." />
                            </SelectTrigger>
                            <SelectContent>
                              {player.elementalKnowledge.filter(e => e !== 'Исцеление').map(el => (
                                <SelectItem key={el} value={el}>{el}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8" onClick={() => removeAction(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                  </div>
              ))}
          </div>
        </div>
        
        {actions.length < maxActionsPerTurn && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select onValueChange={(value) => addAction(value)} value={selectValue}>
              <SelectTrigger>
                  <SelectValue placeholder="Добавить действие..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                    <SelectLabel>Физические действия</SelectLabel>
                    {actionOptions.filter(o => o.group === 'physical').map(opt => <div key={opt.value}>{renderSelectOption(opt.value, opt.label, opt.group)}</div>)}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Магические действия</SelectLabel>
                    {actionOptions.filter(o => o.group === 'magic').map(opt => <div key={opt.value}>{renderSelectOption(opt.value, opt.label, opt.group)}</div>)}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Прочие действия</SelectLabel>
                  {actionOptions.filter(o => o.group === 'other').map(opt => <div key={opt.value}>{renderSelectOption(opt.value, opt.label, opt.group)}</div>)}
                </SelectGroup>
                {racialAbilities.length > 0 && (
                   <SelectGroup>
                      <SelectLabel>Расовые способности</SelectLabel>
                      {racialAbilities.map(opt => <div key={opt.value}>{renderSelectOption(opt.value, opt.label, opt.group, opt.racialAbilityName)}</div>)}
                   </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleFormSubmit} disabled={isSubmitDisabled} className="w-full">
          <Send className="mr-2 h-4 w-4" />
          Завершить ход
        </Button>
      </div>
      
      <AlertDialog open={isPrayerDialogOpen} onOpenChange={setIsPrayerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выберите эффект молитвы</AlertDialogTitle>
            <AlertDialogDescription>
              Выберите одно из благословений, о котором вы хотите молиться. Успех зависит от вашей Веры.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col space-y-2">
            <Button variant="outline" className="justify-start" onClick={() => handlePrayerSelect('eternal_shield')}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {getActionLabel('prayer', {effect: 'eternal_shield'})}
            </Button>
             <Button variant="outline" className="justify-start" onClick={() => handlePrayerSelect('full_heal_oz')}>
              <HeartPulse className="mr-2 h-4 w-4" />
              {getActionLabel('prayer', {effect: 'full_heal_oz'})}
            </Button>
             <Button variant="outline" className="justify-start" onClick={() => handlePrayerSelect('full_heal_om')}>
              <SparklesIcon className="mr-2 h-4 w-4" />
              {getActionLabel('prayer', {effect: 'full_heal_om'})}
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDruidAbilityOpen} onOpenChange={setIsDruidAbilityOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Песня стихий</AlertDialogTitle>
                <AlertDialogDescription>
                    Выберите, как использовать способность: нанести урон или исцелить себя.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col space-y-2">
                <Button variant="outline" className="justify-start" onClick={() => handleDruidAbilitySelect('damage')}>
                    <Zap className="mr-2 h-4 w-4 text-destructive" />
                    Нанести 45 урона
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleDruidAbilitySelect('heal')}>
                    <Heart className="mr-2 h-4 w-4 text-green-500" />
                    Восстановить 45 ОЗ
                </Button>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    
    <AlertDialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Передвижение</AlertDialogTitle>
                <AlertDialogDescription>
                    Выберите, на какое расстояние и в каком направлении вы хотите переместиться. Стоимость: {moveCostPerMeter} ОД за 1 метр.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Направление</Label>
                    <Select value={moveDirection} onValueChange={(v: 'closer' | 'further') => setMoveDirection(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="further">Разорвать дистанцию</SelectItem>
                            <SelectItem value="closer">Сократить дистанцию</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="move-amount">Расстояние (метры)</Label>
                    <Input 
                        id="move-amount"
                        type="number"
                        value={moveAmount}
                        onChange={e => {
                            const val = Number(e.target.value);
                            if (isNaN(val)) return;
                            setMoveAmount(Math.max(1, Math.min(val, isFinite(maxMoveDistance) ? maxMoveDistance : 999)));
                        }}
                        min={1}
                        max={isFinite(maxMoveDistance) ? maxMoveDistance : 999}
                    />
                 </div>
                 <p className="text-sm text-muted-foreground">
                    Стоимость: {currentMoveCost} ОД. Текущие ОД: {player.od}. Текущая дистанция: {distance}м.
                 </p>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleMoveSelect} disabled={!canConfirmMove}>Подтвердить</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={isHealDialogOpen} onOpenChange={setIsHealDialogOpen}>
      <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Исцелить себя</AlertDialogTitle>
              <AlertDialogDescription>
                  Выберите, сколько ОЗ вы хотите восстановить. Стоимость: 2 ОМ за 1 ОЗ.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="heal-amount">Очки здоровья (ОЗ)</Label>
                  <Input 
                      id="heal-amount"
                      type="number"
                      value={healAmount}
                      onChange={e => {
                          const val = Number(e.target.value);
                           if (isNaN(val) || !isFinite(maxHealAmount)) return;
                          setHealAmount(Math.max(1, Math.min(val, maxHealAmount)));
                      }}
                      min={1}
                      max={isFinite(maxHealAmount) ? maxHealAmount : 1}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Стоимость: {currentHealCost} ОМ. Текущие ОМ: {player.om}.
                </p>
                 {isFinite(maxHealAmount) &&
                    <p className="text-sm text-muted-foreground">
                        Максимум можно восстановить: {maxHealAmount} ОЗ.
                    </p>
                 }
          </div>
          <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleHealSelect} disabled={!canConfirmHeal}>Подтвердить</AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </TooltipProvider>
  );
}
