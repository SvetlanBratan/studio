
'use client';

import { useState } from 'react';
import type { CharacterStats, ReserveLevel, FaithLevel, InventoryItem } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Trash2, Settings, ShieldCheck } from 'lucide-react';
import { RULES, RESERVE_LEVELS, FAITH_LEVELS, ELEMENTS, RACES, getOmFromReserve, calculateMaxOz, getFaithLevelFromString } from '@/lib/rules';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';


interface CharacterSetupModalProps {
  character: CharacterStats;
  onSave: (character: CharacterStats) => void;
}

export default function CharacterSetupModal({ character, onSave }: CharacterSetupModalProps) {
  const [editableCharacter, setEditableCharacter] = useState<CharacterStats>(character);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableCharacter(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: 'reserve' | 'faithLevelName' | 'race', value: string) => {
    setEditableCharacter(prev => {
        let newState = { ...prev };
        
        if (field === 'race') {
            const selectedRace = RACES.find(r => r.name === value);
            if (selectedRace) {
                const newBonuses = [...selectedRace.passiveBonuses];
                newState.bonuses = newBonuses;
                const newMaxOz = calculateMaxOz(newBonuses);
                newState.maxOz = newMaxOz;
                newState.oz = newMaxOz;
                newState.race = value;
            }
        } else {
            (newState as any)[field] = value;
        }

        if (field === 'reserve') {
            const newMaxOm = getOmFromReserve(value as ReserveLevel);
            newState.maxOm = newMaxOm;
            newState.om = newMaxOm;
        }
        if (field === 'faithLevelName') {
            newState.faithLevel = getFaithLevelFromString(value as FaithLevel);
        }
        return newState;
    });
  };
  
  const handleMultiSelectChange = (item: string, checked: boolean) => {
    setEditableCharacter(prev => {
      const currentValues = prev.elementalKnowledge || [];
      const newValues = checked
        ? [...currentValues, item]
        : currentValues.filter(v => v !== item);
      return { ...prev, elementalKnowledge: newValues };
    });
  };

  const handleInventoryChange = (index: number, field: keyof InventoryItem, value: string | number) => {
    const newInventory = [...editableCharacter.inventory];
    (newInventory[index] as any)[field] = value;
    setEditableCharacter(prev => ({ ...prev, inventory: newInventory }));
  };

  const addInventoryItem = () => {
    if (editableCharacter.inventory.length < RULES.MAX_INVENTORY_ITEMS) {
      setEditableCharacter(prev => ({
        ...prev,
        inventory: [...prev.inventory, { name: 'Новый предмет', type: 'heal', amount: 10 }]
      }));
    }
  };

  const removeInventoryItem = (index: number) => {
    setEditableCharacter(prev => ({
      ...prev,
      inventory: editableCharacter.inventory.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const finalCharacter: CharacterStats = { 
        ...editableCharacter,
        isSetupComplete: true 
    };
    onSave(finalCharacter);
  };
  
  const renderInventoryEditor = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Инвентарь (Максимум: {RULES.MAX_INVENTORY_ITEMS})</Label>
        <Button size="sm" variant="ghost" onClick={addInventoryItem} disabled={editableCharacter.inventory.length >= RULES.MAX_INVENTORY_ITEMS}>
            <PlusCircle className="w-4 h-4 mr-2" /> Добавить
        </Button>
      </div>
      {editableCharacter.inventory.map((item, index) => (
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
  );

  return (
    <Dialog open={true}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Settings />
                    Настройка персонажа: {character.name}
                </DialogTitle>
                <DialogDescription>
                    Выберите расу, резерв и другие параметры вашего персонажа перед началом дуэли.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name">Имя</Label>
                        <Input id="name" name="name" value={editableCharacter.name} onChange={handleInputChange} />
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label>Раса</Label>
                        <Select value={editableCharacter.race} onValueChange={(v) => handleSelectChange('race', v)}>
                            <SelectTrigger><SelectValue placeholder="Раса" /></SelectTrigger>
                            <SelectContent>
                            {RACES.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label>Резерв</Label>
                        <Select value={editableCharacter.reserve} onValueChange={(v) => handleSelectChange('reserve', v as ReserveLevel)}>
                            <SelectTrigger><SelectValue placeholder="Резерв" /></SelectTrigger>
                            <SelectContent>
                            {Object.keys(RESERVE_LEVELS).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label>Вера</Label>
                        <Select value={editableCharacter.faithLevelName} onValueChange={(v) => handleSelectChange('faithLevelName', v as FaithLevel)}>
                            <SelectTrigger><SelectValue placeholder="Вера" /></SelectTrigger>
                            <SelectContent>
                                {Object.keys(FAITH_LEVELS).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                      <Label>Пассивные бонусы</Label>
                      <div className="flex flex-wrap gap-1 p-2 rounded-md bg-muted/50 min-h-10">
                          {editableCharacter.bonuses.length > 0 ? editableCharacter.bonuses.map((bonus, i) => <Badge key={i} variant="secondary" className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">{bonus}</Badge>) : <span className="text-xs text-muted-foreground">Автоматически от расы</span>}
                      </div>
                  </div>
                </div>
                 <div className="space-y-4">
                     <div className="grid w-full items-center gap-1.5">
                        <Label>Знания стихий</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start font-normal flex-wrap h-auto min-h-10">
                                    <div className="flex gap-1 flex-wrap">
                                        {editableCharacter.elementalKnowledge.length > 0 ? (
                                            editableCharacter.elementalKnowledge.map(e => <Badge key={e} variant="secondary">{e}</Badge>)
                                        ) : (
                                            "Выберите стихии..."
                                        )}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <ScrollArea className="h-48">
                                <div className="p-4 space-y-2">
                                {Object.values(ELEMENTS).map((element) => {
                                    const isSelected = editableCharacter.elementalKnowledge.includes(element.name);
                                    return (
                                    <div key={element.name} className="flex items-center space-x-2">
                                        <Checkbox
                                        id={`element-${element.name}-${character.id}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleMultiSelectChange(element.name, !!checked)}
                                        />
                                        <label
                                        htmlFor={`element-${element.name}-${character.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                        {element.name}
                                        </label>
                                    </div>
                                    );
                                })}
                                </div>
                            </ScrollArea>
                            </PopoverContent>
                        </Popover>
                    </div>
                    {renderInventoryEditor()}
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSave} size="lg">
                    <ShieldCheck className="mr-2"/>
                    Готов к бою
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
