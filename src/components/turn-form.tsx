

'use client';

import { useState, useMemo } from 'react';
import type { Action, CharacterStats, ActionType, PrayerEffectType, WeaponType } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Trash2, Send, ShieldCheck, HeartPulse, SparklesIcon, Heart, Zap, MoveHorizontal, Crosshair } from 'lucide-react';
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
  const [moveAmount, setMoveAmount] = useState(1);
  const [moveDirection, setMoveDirection] = useState<'closer' | 'further'>('further');
  const [selectValue, setSelectValue] = useState('');
  const playerRaceInfo = RACES.find(r => r.name === player.race);

  const addAction = (type: string, payload?: any) => {
    if (actions.length >= RULES.MAX_ACTIONS_PER_TURN || !type) return;

    if (type === 'prayer') {
      setIsPrayerDialogOpen(true);
      return;
    }
    
    if (type === 'racial_Песня стихий') {
      setIsDruidAbilityOpen(true);
      return;
    }

    if (type === 'move') {
      setIsMoveDialogOpen(true);
      return;
    }
    
    if (type === 'physical_attack') {
        const weapon = WEAPONS[player.weapon];
        setActions([...actions, {type: 'physical_attack', payload: { weapon: weapon.name }}]);
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
    if (actions.length < RULES.MAX_ACTIONS_PER_TURN) {
      setActions([...actions, { type: 'prayer', payload: { effect } }]);
    }
    setIsPrayerDialogOpen(false);
    setSelectValue('');
  };

  const handleDruidAbilitySelect = (subAction: 'damage' | 'heal') => {
      if (actions.length < RULES.MAX_ACTIONS_PER_TURN) {
          setActions([...actions, { type: 'racial_ability', payload: { name: 'Песня стихий', subAction } }]);
      }
      setIsDruidAbilityOpen(false);
      setSelectValue('');
  };

  const handleMoveSelect = () => {
    if (actions.length < RULES.MAX_ACTIONS_PER_TURN) {
      const finalDistance = moveDirection === 'closer' ? -moveAmount : moveAmount;
      if (distance + finalDistance < 0) {
        // Potentially show a toast or error message
        console.error("Cannot move closer than 0 meters");
        setIsMoveDialogOpen(false);
        return;
      }
      setActions([...actions, { type: 'move', payload: { distance: finalDistance } }]);
    }
    setIsMoveDialogOpen(false);
    setSelectValue('');
    setMoveAmount(1);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };
  
  const handleFormSubmit = () => {
    onSubmit(actions);
    setActions([]);
  };
  
  const getOdCostPenalty = (player: CharacterStats): number => {
    if (player.race === 'Куклы' && player.bonuses.includes('Абсолютная память — не тратится ОД.')) {
        return -Infinity; // Special value for zero cost
    }
    let penalty = 0;
    for (const wound of RULES.WOUND_PENALTIES) {
        if (player.oz < wound.threshold) {
            penalty = wound.penalty;
        }
    }
    const armorPenalty = ARMORS[player.armor]?.odPenalty ?? 0;
    return penalty + armorPenalty;
  };

  const odPenalty = getOdCostPenalty(player);

  const hasPrayerAction = actions.some(a => a.type === 'prayer');
  const hasAddedAction = (actionType: ActionType) => actions.some(a => a.type === actionType);

  const isFaceless = player.race === 'Безликие';
  const hasElementalKnowledge = player.elementalKnowledge.length > 0;
  
  const spellRange = RULES.SPELL_RANGES[player.reserve];
  const isOpponentInRangeForSpells = distance <= spellRange;

  const weaponInfo = WEAPONS[player.weapon];
  const isOpponentInRangeForWeapon = distance <= weaponInfo.range;
  const getFinalOdCost = (baseCost: number) => {
    if (odPenalty === -Infinity) return 0;
    return baseCost + odPenalty;
  };
  const physicalAttackCost = getFinalOdCost(RULES.NON_MAGIC_COSTS.physical_attack);

  const isSubmitDisabled = useMemo(() => {
    if (actions.length === 0) return true;
    return actions.some(action => {
      const needsElement = ['strong_spell', 'medium_spell', 'small_spell', 'household_spell', 'shield'].includes(action.type);
      return needsElement && !action.payload?.element;
    });
  }, [actions]);

  const actionOptions: {value: string, label: string, disabled: boolean, tooltip?: string, group: 'magic' | 'physical' | 'other'}[] = [
    // Physical
    { group: 'physical', value: 'physical_attack', label: `Атака оружием (${weaponInfo.name}) - ${physicalAttackCost} ОД`, disabled: player.od < physicalAttackCost || !isOpponentInRangeForWeapon || player.cooldowns.physical_attack > 0, tooltip: !isOpponentInRangeForWeapon ? `Цель вне зоны досягаемости (${distance}m > ${weaponInfo.range}m)` : undefined },
    
    // Magic
    { group: 'magic', value: 'strong_spell', label: 'Сильный ритуал', disabled: isFaceless || !hasElementalKnowledge || player.cooldowns.strongSpell > 0 || player.om < RULES.RITUAL_COSTS.strong || hasAddedAction('strong_spell') || !isOpponentInRangeForSpells, tooltip: !isOpponentInRangeForSpells ? `Цель вне зоны досягаемости (${distance}m > ${spellRange}m)` : !hasElementalKnowledge ? 'Нет знаний стихий' : undefined },
    { group: 'magic', value: 'medium_spell', label: 'Средний ритуал', disabled: isFaceless || !hasElementalKnowledge || player.om < RULES.RITUAL_COSTS.medium || !isOpponentInRangeForSpells, tooltip: !isOpponentInRangeForSpells ? `Цель вне зоны досягаемости (${distance}m > ${spellRange}m)` : !hasElementalKnowledge ? 'Нет знаний стихий' : undefined },
    { group: 'magic', value: 'small_spell', label: 'Малый ритуал', disabled: isFaceless || !hasElementalKnowledge || player.om < RULES.RITUAL_COSTS.small || !isOpponentInRangeForSpells, tooltip: !isOpponentInRangeForSpells ? `Цель вне зоны досягаемости (${distance}m > ${spellRange}m)` : !hasElementalKnowledge ? 'Нет знаний стихий' : undefined },
    { group: 'magic', value: 'household_spell', label: 'Бытовое заклинание', disabled: player.om < RULES.RITUAL_COSTS.household || !isOpponentInRangeForSpells, tooltip: !isOpponentInRangeForSpells ? `Цель вне зоны досягаемости (${distance}m > ${spellRange}m)`: undefined },
    { group: 'magic', value: 'shield', label: 'Создать щит (Средний ритуал)', disabled: isFaceless || !hasElementalKnowledge || player.om < RULES.RITUAL_COSTS.medium || hasAddedAction('shield') },

    // Other
    { group: 'other', value: 'dodge', label: `Уворот (${getFinalOdCost(RULES.NON_MAGIC_COSTS.dodge)} ОД)`, disabled: player.od < getFinalOdCost(RULES.NON_MAGIC_COSTS.dodge) || hasAddedAction('dodge') },
    { group: 'other', value: 'move', label: 'Передвижение', disabled: false },
    { group: 'other', value: 'use_item', label: 'Использовать предмет', disabled: player.cooldowns.item > 0 || player.od < getFinalOdCost(RULES.NON_MAGIC_COSTS.use_item) || player.inventory.length === 0 || hasAddedAction('use_item') },
    { group: 'other', value: 'prayer', label: 'Молитва', disabled: player.cooldowns.prayer > 0 || player.od < getFinalOdCost(RULES.NON_MAGIC_COSTS.prayer) || hasPrayerAction },
    { group: 'other', value: 'remove_effect', label: 'Снять с себя эффект', disabled: player.penalties.length === 0 || hasAddedAction('remove_effect')},
    { group: 'other', value: 'rest', label: 'Отдых', disabled: hasAddedAction('rest') },
  ];

  const racialAbilities = playerRaceInfo?.activeAbilities.map(ability => {
    const odCost = getFinalOdCost(ability.cost?.od ?? 0);
    const value = ability.name === 'Песня стихий' ? `racial_${ability.name}` : `racial_${ability.name}`;
    
    return {
      value: value,
      label: `${ability.name}`,
      disabled: (player.cooldowns[ability.name] ?? 0) > 0 || (ability.cost?.om ?? 0) > player.om || odCost > player.od || actions.some(a => a.type === 'racial_ability' && a.payload.name === ability.name),
    }
  }) || [];

  const spellActionsWithElement = ['strong_spell', 'medium_spell', 'small_spell', 'household_spell', 'shield'];

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Выбранные действия:</label>
          {actions.length === 0 && <p className="text-sm text-muted-foreground">Выберите до {RULES.MAX_ACTIONS_PER_TURN} действий.</p>}
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
                              {player.elementalKnowledge.map(el => (
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
        
        {actions.length < RULES.MAX_ACTIONS_PER_TURN && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select onValueChange={(value) => addAction(value)} value={selectValue}>
              <SelectTrigger>
                  <SelectValue placeholder="Добавить действие..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                    <SelectLabel>Физические действия</SelectLabel>
                    {actionOptions.filter(o => o.group === 'physical').map(opt => <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</SelectItem>)}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Магические действия</SelectLabel>
                    {actionOptions.filter(o => o.group === 'magic').map(opt => <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</SelectItem>)}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Прочие действия</SelectLabel>
                  {actionOptions.filter(o => o.group === 'other').map(opt => <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</SelectItem>)}
                </SelectGroup>
                {racialAbilities.length > 0 && (
                   <SelectGroup>
                      <SelectLabel>Расовые способности</SelectLabel>
                      {racialAbilities.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                              {opt.label} {opt.disabled && player.cooldowns[opt.value.substring(7)] > 0 ? `(КД: ${player.cooldowns[opt.value.substring(7)]})` : ''}
                          </SelectItem>
                      ))}
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
                    Выберите, на какое расстояние и в каком направлении вы хотите переместиться. Стоимость: 1 ОД за 1 метр.
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
                        onChange={e => setMoveAmount(Math.max(1, Number(e.target.value)))}
                        min={1}
                    />
                 </div>
                 <p className="text-sm text-muted-foreground">
                    Стоимость: {moveAmount * RULES.NON_MAGIC_COSTS.move_per_meter} ОД. Текущая дистанция: {distance}м.
                 </p>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleMoveSelect}>Подтвердить</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
