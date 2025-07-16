
'use client';

import { useState, useEffect } from 'react';
import type { CharacterStats, ReserveLevel, FaithLevel, InventoryItem } from '@/types/duel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatBar from './stat-bar';
import { Heart, Sparkles, Wind, Shield, User, BookOpen, Cross, Briefcase, Siren, Edit, Save, X, Timer, Package, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RULES, RESERVE_LEVELS, FAITH_LEVELS, ELEMENTS, RACES, getOmFromReserve } from '@/lib/rules';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

interface CharacterPanelProps {
  character: CharacterStats;
  isActive: boolean;
  onUpdate: (character: CharacterStats) => void;
  canEdit: boolean;
}

export default function CharacterPanel({ character, isActive, onUpdate, canEdit }: CharacterPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableCharacter, setEditableCharacter] = useState<CharacterStats>(character);

  useEffect(() => {
    setEditableCharacter(character);
  }, [character]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableCharacter(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableCharacter(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleSelectChange = (field: 'reserve' | 'faithLevelName' | 'race', value: string) => {
    setEditableCharacter(prev => {
        let newState = { ...prev, [field]: value };
        if (field === 'race') {
            const selectedRace = RACES.find(r => r.name === value);
            if (selectedRace) {
                newState.bonuses = [...selectedRace.passiveBonuses];
            }
        }
        if (field === 'reserve') {
            const newMaxOm = getOmFromReserve(value as ReserveLevel);
            newState.maxOm = newMaxOm;
            newState.om = Math.min(newState.om, newMaxOm); // Adjust current om if it exceeds new max
        }
        return newState;
    });
  };
  
  const handleElementsChange = (element: string) => {
    const newElements = editableCharacter.elementalKnowledge.includes(element)
      ? editableCharacter.elementalKnowledge.filter(e => e !== element)
      : [...editableCharacter.elementalKnowledge, element];
    setEditableCharacter(prev => ({ ...prev, elementalKnowledge: newElements }));
  };

  const handleArrayInputChange = (field: 'penalties', value: string) => {
    setEditableCharacter(prev => ({...prev, [field]: value.split(',').map(s => s.trim()).filter(Boolean)}));
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
      inventory: prev.inventory.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onUpdate(editableCharacter);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableCharacter(character);
    setIsEditing(false);
  };

  const renderStatEditor = (label: string, name: keyof CharacterStats, value: number) => (
    <div className="grid grid-cols-2 gap-2 items-center">
      <Label htmlFor={`${name}-${character.id}`}>{label}</Label>
      <Input
        id={`${name}-${character.id}`}
        name={name}
        type="number"
        value={value}
        onChange={handleNumericInputChange}
        className="h-8"
      />
    </div>
  );
  
   const renderArrayEditor = (label: string, field: 'penalties', value: string[]) => (
     <div className="grid w-full items-center gap-1.5">
        <Label htmlFor={`${field}-${character.id}`}>{label} (через запятую)</Label>
        <Textarea
            id={`${field}-${character.id}`}
            name={field}
            value={value.join(', ')}
            onChange={(e) => handleArrayInputChange(field, e.target.value)}
        />
     </div>
  );

  const renderInventoryEditor = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Инвентарь</Label>
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


  const renderCooldown = (label: string, value: number) => {
    if (value <= 0) return null;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge variant="secondary" className="gap-1">
                    <Timer className="w-3 h-3" /> {label}: {value}
                </Badge>
            </TooltipTrigger>
            <TooltipContent><p>Осталось ходов перезарядки</p></TooltipContent>
        </Tooltip>
    )
  }

  return (
    <TooltipProvider>
      <Card className={cn("transition-all duration-300 flex flex-col", isActive ? "border-accent shadow-accent/20 shadow-lg" : "border-border")}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-headline">
             {isEditing ? (
              <Input name="name" value={editableCharacter.name} onChange={handleInputChange} className="text-2xl font-semibold leading-none tracking-tight"/>
            ) : (
              character.name
            )}
            <div className="flex items-center gap-2">
              {isActive && !isEditing && (
                <Tooltip>
                  <TooltipTrigger>
                    <Siren className="w-5 h-5 text-accent animate-pulse" />
                  </TooltipTrigger>
                  <TooltipContent><p>Текущий ход</p></TooltipContent>
                </Tooltip>
              )}
               {canEdit && !isEditing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Редактировать</p></TooltipContent>
                </Tooltip>
               )}
            </div>
          </CardTitle>
          {isEditing ? (
             <div className="flex gap-2">
               <Select value={editableCharacter.race} onValueChange={(v) => handleSelectChange('race', v)}>
                 <SelectTrigger><SelectValue placeholder="Раса" /></SelectTrigger>
                 <SelectContent>
                   {RACES.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                 </SelectContent>
               </Select>
               <Select value={editableCharacter.reserve} onValueChange={(v) => handleSelectChange('reserve', v as ReserveLevel)}>
                 <SelectTrigger><SelectValue placeholder="Резерв" /></SelectTrigger>
                 <SelectContent>
                   {Object.keys(RESERVE_LEVELS).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                 </SelectContent>
               </Select>
             </div>
          ) : (
             <CardDescription>{character.race} / {character.reserve}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          {isEditing ? (
            <div className="space-y-3">
              {renderStatEditor("Макс. ОЗ", "maxOz", editableCharacter.maxOz)}
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label>Макс. ОМ</Label>
                <Input value={editableCharacter.maxOm} disabled className="h-8 bg-muted/50" />
              </div>
              {renderStatEditor("Макс. ОД", "maxOd", editableCharacter.maxOd)}
            </div>
          ) : (
            <div className="space-y-3">
              <StatBar label="ОЗ" value={character.oz} maxValue={character.maxOz} colorClass="bg-red-500" icon={<Heart className="w-4 h-4 text-red-500" />} />
              <StatBar label="ОМ" value={character.om} maxValue={character.maxOm} colorClass="bg-blue-500" icon={<Sparkles className="w-4 h-4 text-blue-500" />} />
              <StatBar label="ОД" value={character.od} maxValue={character.maxOd} colorClass="bg-green-500" icon={<Wind className="w-4 h-4 text-green-500" />} />
              {character.shield.hp > 0 && <StatBar label={`Щит (${character.shield.element || 'Физический'})`} value={character.shield.hp} maxValue={character.shield.hp} colorClass="bg-gray-400" icon={<Shield className="w-4 h-4 text-gray-400" />} />}
            </div>
          )}
          
          <Separator />
          
          {isEditing ? (
            <div className="space-y-3">
               <div className="grid w-full items-center gap-1.5">
                 <Label>Знания стихий</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal flex-wrap h-auto min-h-10">
                            <div className="flex gap-1 flex-wrap">
                                {editableCharacter.elementalKnowledge.length > 0 ? (
                                    editableCharacter.elementalKnowledge.map(e => <Badge key={e}>{e}</Badge>)
                                ) : (
                                    "Выберите стихии..."
                                )}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Поиск стихий..." />
                            <CommandList>
                                <CommandEmpty>Стихия не найдена.</CommandEmpty>
                                <CommandGroup>
                                    {Object.values(ELEMENTS).map((element) => (
                                    <CommandItem
                                        key={element.name}
                                        value={element.name}
                                        onSelect={(currentValue) => handleElementsChange(currentValue)}
                                    >
                                        {element.name}
                                        <span className="ml-auto">
                                            {editableCharacter.elementalKnowledge.includes(element.name) ? "✓" : ""}
                                        </span>
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
               </div>
              <div className="grid grid-cols-1 gap-2">
                <Select value={editableCharacter.faithLevelName} onValueChange={(v) => handleSelectChange('faithLevelName', v as FaithLevel)}>
                   <SelectTrigger><SelectValue placeholder="Вера" /></SelectTrigger>
                   <SelectContent>
                       {Object.keys(FAITH_LEVELS).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                   </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> <strong>Знания:</strong></div>
                <div className="text-right">{character.elementalKnowledge.join(', ') || 'Нет'}</div>
                
                <div className="flex items-center gap-2"><Cross className="w-4 h-4 text-primary" /> <strong>Вера:</strong></div>
                <div className="text-right">{character.faithLevelName} ({character.faithLevel})</div>

                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> <strong>Состояние:</strong></div>
                <div className="text-right">{character.physicalCondition}</div>
            </div>
          )}
          
          <Separator />
          
           {isEditing ? (
              <div className="space-y-3">
                  <div className="space-y-1">
                      <Label>Бонусы</Label>
                      <div className="flex flex-wrap gap-1">
                          {editableCharacter.bonuses.length > 0 ? editableCharacter.bonuses.map((bonus, i) => <Badge key={i} variant="secondary" className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">{bonus}</Badge>) : <span className="text-xs text-muted-foreground">Автоматически от расы</span>}
                      </div>
                  </div>
                  {renderArrayEditor("Штрафы", "penalties", editableCharacter.penalties)}
                  {renderInventoryEditor()}
              </div>
          ) : (
            <>
              <div>
                <h4 className="font-semibold mb-2 text-sm">Перезарядки:</h4>
                <div className="flex flex-wrap gap-1">
                    {renderCooldown('Сил. ритуал', character.cooldowns.strongSpell)}
                    {renderCooldown('Предмет', character.cooldowns.item)}
                    {renderCooldown('Молитва', character.cooldowns.prayer)}
                    {character.cooldowns.strongSpell <=0 && character.cooldowns.item <=0 && character.cooldowns.prayer <=0 && <span className="text-xs text-muted-foreground">Нет</span>}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm">Бонусы:</h4>
                <div className="flex flex-wrap gap-1">
                  {character.bonuses.length > 0 ? character.bonuses.map((bonus, i) => <Badge key={i} variant="secondary" className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">{bonus}</Badge>) : <span className="text-xs text-muted-foreground">Нет</span>}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm">Штрафы:</h4>
                <div className="flex flex-wrap gap-1">
                  {character.penalties.length > 0 ? character.penalties.map((penalty, i) => <Badge key={i} variant="destructive">{penalty}</Badge>) : <span className="text-xs text-muted-foreground">Нет</span>}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-sm">Инвентарь:</h4>
                <div className="flex flex-wrap gap-1">
                  {character.inventory.length > 0 ? character.inventory.map((item, i) => <Badge key={i} variant="outline" className="gap-1"><Package className="w-3 h-3" />{item.name} ({item.type === 'heal' ? 'Лечение' : 'Урон'}: {item.amount})</Badge>) : <span className="text-xs text-muted-foreground">Пусто</span>}
                </div>
              </div>
            </>
           )}

        </CardContent>
         {isEditing && (
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleCancel}><X className="mr-2"/>Отмена</Button>
            <Button onClick={handleSave}><Save className="mr-2"/>Сохранить</Button>
          </CardFooter>
        )}
      </Card>
    </TooltipProvider>
  );
}
