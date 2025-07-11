'use client';

import { useState } from 'react';
import type { Action, CharacterStats, ActionType } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Send } from 'lucide-react';
import { RULES } from '@/lib/rules';

interface TurnFormProps {
  player: CharacterStats;
  opponent: CharacterStats;
  onSubmit: (actions: Action[]) => void;
}

export default function TurnForm({ player, opponent, onSubmit }: TurnFormProps) {
  const [actions, setActions] = useState<Action[]>([]);

  const addAction = (type: ActionType) => {
    if (actions.length < RULES.MAX_ACTIONS_PER_TURN) {
      setActions([...actions, { type }]);
    }
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };
  
  const handleFormSubmit = () => {
    onSubmit(actions);
    setActions([]);
  };

  const getActionLabel = (type: ActionType) => {
    const labels: Record<ActionType, string> = {
        strong_spell: "Сильный ритуал",
        medium_spell: "Средний ритуал",
        small_spell: "Малый ритуал",
        household_spell: "Бытовое заклинание",
        dodge: "Уворот",
        use_item: "Использовать предмет",
        shield: "Создать щит",
        prayer: "Молитва",
        remove_effect: "Снять эффект",
        rest: "Отдых",
    };
    return labels[type];
  }

  const actionOptions: {value: ActionType, label: string, disabled: boolean}[] = [
    { value: 'strong_spell', label: 'Сильный ритуал', disabled: player.cooldowns.strongSpell > 0 || player.om < RULES.RITUAL_COSTS.strong },
    { value: 'medium_spell', label: 'Средний ритуал', disabled: player.om < RULES.RITUAL_COSTS.medium },
    { value: 'small_spell', label: 'Малый ритуал', disabled: player.om < RULES.RITUAL_COSTS.small },
    { value: 'household_spell', label: 'Бытовое заклинание', disabled: player.om < RULES.RITUAL_COSTS.household },
    { value: 'shield', label: 'Создать щит (Средний ритуал)', disabled: player.om < RULES.RITUAL_COSTS.medium },
    { value: 'dodge', label: 'Уворот', disabled: player.od < RULES.NON_MAGIC_COSTS.dodge },
    { value: 'use_item', label: 'Использовать предмет', disabled: player.cooldowns.item > 0 || player.od < RULES.NON_MAGIC_COSTS.use_item },
    { value: 'prayer', label: 'Молитва', disabled: player.cooldowns.prayer > 0 || player.od < RULES.NON_MAGIC_COSTS.prayer },
    { value: 'remove_effect', label: 'Снять с себя эффект', disabled: player.penalties.length === 0 },
    { value: 'rest', label: 'Отдых', disabled: false },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Выбранные действия:</label>
        {actions.length === 0 && <p className="text-sm text-muted-foreground">Выберите до {RULES.MAX_ACTIONS_PER_TURN} действий.</p>}
        <div className="space-y-2">
            {actions.map((action, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded-lg bg-background/50">
                    <span>{index + 1}. {getActionLabel(action.type)}</span>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8" onClick={() => removeAction(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
      </div>
      
      {actions.length < RULES.MAX_ACTIONS_PER_TURN && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Select onValueChange={(value) => addAction(value as ActionType)}>
            <SelectTrigger>
                <SelectValue placeholder="Добавить действие..." />
            </SelectTrigger>
            <SelectContent>
                {actionOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={handleFormSubmit} disabled={actions.length === 0} className="w-full">
        <Send className="mr-2 h-4 w-4" />
        Завершить ход
      </Button>
    </div>
  );
}
