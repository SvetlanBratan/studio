
'use client';

import { useState } from 'react';
import type { Action, CharacterStats, ActionType, PrayerEffectType } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Trash2, Send, ShieldCheck, HeartPulse, SparklesIcon } from 'lucide-react';
import { RULES, getActionLabel, RACES, ELEMENTS } from '@/lib/rules';
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

interface TurnFormProps {
  player: CharacterStats;
  opponent: CharacterStats;
  onSubmit: (actions: Action[]) => void;
}

export default function TurnForm({ player, opponent, onSubmit }: TurnFormProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [isPrayerDialogOpen, setIsPrayerDialogOpen] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const playerRaceInfo = RACES.find(r => r.name === player.race);

  const addAction = (type: string, payload?: any) => {
    if (actions.length >= RULES.MAX_ACTIONS_PER_TURN || !type) return;

    if (type === 'prayer') {
      setIsPrayerDialogOpen(true);
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

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };
  
  const handleFormSubmit = () => {
    onSubmit(actions);
    setActions([]);
  };
  
  const getOdCostPenalty = (player: CharacterStats): number => {
    for (const wound of RULES.WOUND_PENALTIES) {
        if (player.oz < wound.threshold) {
            return wound.penalty;
        }
    }
    return 0;
  };

  const odPenalty = getOdCostPenalty(player);

  const hasPrayerAction = actions.some(a => a.type === 'prayer');
  const hasAddedAction = (actionType: ActionType) => actions.some(a => a.type === actionType);

  const isFaceless = player.race === 'Безликие';

  const actionOptions: {value: ActionType, label: string, disabled: boolean}[] = [
    { value: 'strong_spell', label: 'Сильный ритуал', disabled: isFaceless || player.cooldowns.strongSpell > 0 || player.om < RULES.RITUAL_COSTS.strong || hasAddedAction('strong_spell') },
    { value: 'medium_spell', label: 'Средний ритуал', disabled: isFaceless || player.om < RULES.RITUAL_COSTS.medium },
    { value: 'small_spell', label: 'Малый ритуал', disabled: isFaceless || player.om < RULES.RITUAL_COSTS.small },
    { value: 'household_spell', label: 'Бытовое заклинание', disabled: player.om < RULES.RITUAL_COSTS.household },
    { value: 'shield', label: 'Создать щит (Средний ритуал)', disabled: player.om < RULES.RITUAL_COSTS.medium || hasAddedAction('shield') },
    { value: 'dodge', label: `Уворот (${RULES.NON_MAGIC_COSTS.dodge + odPenalty} ОД)`, disabled: player.od < RULES.NON_MAGIC_COSTS.dodge + odPenalty || hasAddedAction('dodge') },
    { value: 'use_item', label: 'Использовать предмет', disabled: player.cooldowns.item > 0 || player.od < RULES.NON_MAGIC_COSTS.use_item + odPenalty || player.inventory.length === 0 || hasAddedAction('use_item') },
    { value: 'prayer', label: 'Молитва', disabled: player.cooldowns.prayer > 0 || player.od < RULES.NON_MAGIC_COSTS.prayer + odPenalty || hasPrayerAction },
    { value: 'remove_effect', label: 'Снять с себя эффект', disabled: player.penalties.length === 0 || hasAddedAction('remove_effect')},
    { value: 'rest', label: 'Отдых', disabled: hasAddedAction('rest') },
  ];

  const racialAbilities = playerRaceInfo?.activeAbilities.map(ability => {
    const odCost = (ability.cost?.od ?? 0) + odPenalty;
    return {
      value: `racial_${ability.name}`,
      label: `${ability.name}`,
      disabled: (player.cooldowns[ability.name] ?? 0) > 0 || (ability.cost?.om ?? 0) > player.om || odCost > player.od || actions.some(a => a.type === 'racial_ability' && a.payload.name === ability.name),
    }
  }) || [];

  const spellActions: ActionType[] = ['strong_spell', 'medium_spell', 'small_spell', 'household_spell'];

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
                        {(spellActions.includes(action.type) || action.type === 'shield') && player.elementalKnowledge.length > 0 && (
                          <Select
                            value={action.payload?.element || ''}
                            onValueChange={(element) => updateActionPayload(index, { element })}
                          >
                            <SelectTrigger className="w-full sm:w-[150px] h-8">
                              <SelectValue placeholder="Стихия..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Нейтрально</SelectItem>
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
                  <SelectLabel>Основные действия</SelectLabel>
                  {actionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                          {opt.label}
                      </SelectItem>
                  ))}
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

        <Button onClick={handleFormSubmit} disabled={actions.length === 0} className="w-full">
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
    </>
  );
}

    