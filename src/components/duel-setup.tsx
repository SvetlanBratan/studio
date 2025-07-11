
'use client';

import { useState } from 'react';
import type { CharacterStats, FaithLevel, InventoryItem, ReserveLevel } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { getFaithLevelFromString, getOmFromReserve, RESERVE_LEVELS, FAITH_LEVELS, RULES, RACES } from '@/lib/rules';
import { User, Dices, PlusCircle, Trash2 } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface DuelSetupProps {
  initialPlayer1: CharacterStats;
  initialPlayer2: CharacterStats;
  onDuelStart: (player1: CharacterStats, player2: CharacterStats) => void;
}

const PlayerSetupForm = ({ player, onUpdate }: { player: CharacterStats, onUpdate: (player: CharacterStats) => void }) => {

  const handleInputChange = (field: keyof CharacterStats, value: any) => {
    onUpdate({ ...player, [field]: value });
  };
  
  const handleReserveChange = (value: ReserveLevel) => {
    const maxOm = getOmFromReserve(value);
    onUpdate({ ...player, reserve: value, om: maxOm, maxOm: maxOm });
  };

  const handleFaithChange = (value: FaithLevel) => {
    const faithLevel = getFaithLevelFromString(value);
    onUpdate({ ...player, faithLevelName: value, faithLevel });
  };
  
  const handleRaceChange = (raceName: string) => {
    const selectedRace = RACES.find(r => r.name === raceName);
    if (selectedRace) {
      onUpdate({ ...player, race: selectedRace.name, bonuses: [...selectedRace.passiveBonuses] });
    }
  };

  const handleInventoryChange = (index: number, field: keyof InventoryItem, value: string | number) => {
    const newInventory = [...player.inventory];
    (newInventory[index] as any)[field] = value;
    onUpdate({ ...player, inventory: newInventory });
  };

  const addInventoryItem = () => {
    if (player.inventory.length < RULES.MAX_INVENTORY_ITEMS) {
        onUpdate({
            ...player,
            inventory: [...player.inventory, { name: 'Новый предмет', type: 'heal', amount: 10 }]
        });
    }
  };

  const removeInventoryItem = (index: number) => {
    onUpdate({
      ...player,
      inventory: player.inventory.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <User />
            {player.name || `Игрок ${player.id.slice(-1)}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${player.id}`}>Имя</Label>
          <Input id={`name-${player.id}`} value={player.name} onChange={(e) => handleInputChange('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`race-${player.id}`}>Раса</Label>
          <Select value={player.race} onValueChange={handleRaceChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RACES.map(race => (
                <SelectItem key={race.name} value={race.name}>{race.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor={`elementalKnowledge-${player.id}`}>Знания стихий</Label>
            <Textarea
              id={`elementalKnowledge-${player.id}`}
              value={player.elementalKnowledge}
              onChange={(e) => handleInputChange('elementalKnowledge', e.target.value)}
              placeholder="Пример: Магия огня (Мастер), Магия воды (Адепт)"
            />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label>Резерв</Label>
            <Select value={player.reserve} onValueChange={handleReserveChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                {Object.keys(RESERVE_LEVELS).map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
            <Label>Вера</Label>
            <Select value={player.faithLevelName} onValueChange={handleFaithChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                {Object.keys(FAITH_LEVELS).map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label>Инвентарь</Label>
                <Button size="sm" variant="ghost" onClick={addInventoryItem} disabled={player.inventory.length >= RULES.MAX_INVENTORY_ITEMS}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Добавить
                </Button>
            </div>
             {player.inventory.map((item, index) => (
                <div key={index} className="flex gap-2 p-2 border rounded">
                    <Input 
                        value={item.name} 
                        onChange={(e) => handleInventoryChange(index, 'name', e.target.value)} 
                        placeholder="Название"
                        className="h-8"
                    />
                    <Select value={item.type} onValueChange={(v: 'heal' | 'damage') => handleInventoryChange(index, 'type', v)}>
                        <SelectTrigger className="h-8 w-[100px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="heal">Лечение</SelectItem>
                            <SelectItem value="damage">Урон</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input 
                        type="number"
                        value={item.amount} 
                        onChange={(e) => handleInventoryChange(index, 'amount', Number(e.target.value))} 
                        className="h-8 w-20"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => removeInventoryItem(index)}>
                        <Trash2 className="w-4 h-4 text-destructive"/>
                    </Button>
                </div>
            ))}
        </div>

      </CardContent>
    </Card>
  );
};

export default function DuelSetup({ initialPlayer1, initialPlayer2, onDuelStart }: DuelSetupProps) {
  const [player1, setPlayer1] = useState<CharacterStats>(initialPlayer1);
  const [player2, setPlayer2] = useState<CharacterStats>(initialPlayer2);

  const handleStart = () => {
    onDuelStart(player1, player2);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlayerSetupForm player={player1} onUpdate={setPlayer1} />
        <PlayerSetupForm player={player2} onUpdate={setPlayer2} />
      </div>
      <Separator />
      <div className="flex justify-center">
        <Button size="lg" onClick={handleStart}>
          <Dices className="mr-2" />
          Начать дуэль
        </Button>
      </div>
    </div>
  );
}

    