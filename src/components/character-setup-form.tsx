

'use client';

import type { CharacterStats, ReserveLevel, FaithLevel, InventoryItem, WeaponType, ArmorType } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { RULES, RESERVE_LEVELS, FAITH_LEVELS, ELEMENTS, RACES, getOmFromReserve, calculateMaxOz, getFaithLevelFromString, ARMORS, WEAPONS } from '@/lib/rules';
import { Badge } from './ui/badge';

interface CharacterSetupFormProps {
    character: CharacterStats;
    onCharacterChange: (character: CharacterStats) => void;
}

export default function CharacterSetupForm({ character, onCharacterChange }: CharacterSetupFormProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onCharacterChange({ ...character, [name]: value });
    };

    const handleSelectChange = (field: 'reserve' | 'faithLevelName' | 'race' | 'weapon' | 'armor', value: string) => {
        let newState = { ...character };

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
        if (field === 'armor') {
            const armor = ARMORS[value as ArmorType];
            if (armor) {
                newState.shield.hp = armor.shieldBonus;
            }
        }
        onCharacterChange(newState);
    };

    const handleMultiSelectChange = (item: string, checked: boolean) => {
        const currentValues = character.elementalKnowledge || [];
        const newValues = checked
            ? [...currentValues, item]
            : currentValues.filter(v => v !== item);
        onCharacterChange({ ...character, elementalKnowledge: newValues });
    };

    const handleInventoryChange = (index: number, field: keyof InventoryItem, value: string | number) => {
        const newInventory = [...character.inventory];
        (newInventory[index] as any)[field] = value;
        onCharacterChange({ ...character, inventory: newInventory });
    };

    const addInventoryItem = () => {
        if (character.inventory.length < RULES.MAX_INVENTORY_ITEMS) {
            onCharacterChange({
                ...character,
                inventory: [...character.inventory, { name: 'Новый предмет', type: 'heal', amount: 10 }]
            });
        }
    };

    const removeInventoryItem = (index: number) => {
        onCharacterChange({
            ...character,
            inventory: character.inventory.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor={`name-${character.id}`}>Имя</Label>
                    <Input id={`name-${character.id}`} name="name" value={character.name} onChange={handleInputChange} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label>Раса</Label>
                    <Select value={character.race} onValueChange={(v) => handleSelectChange('race', v)}>
                        <SelectTrigger><SelectValue placeholder="Раса" /></SelectTrigger>
                        <SelectContent>
                            {RACES.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label>Резерв</Label>
                    <Select value={character.reserve} onValueChange={(v) => handleSelectChange('reserve', v as ReserveLevel)}>
                        <SelectTrigger><SelectValue placeholder="Резерв" /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(RESERVE_LEVELS).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label>Вера</Label>
                    <Select value={character.faithLevelName} onValueChange={(v) => handleSelectChange('faithLevelName', v as FaithLevel)}>
                        <SelectTrigger><SelectValue placeholder="Вера" /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(FAITH_LEVELS).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>Пассивные бонусы</Label>
                    <div className="flex flex-wrap gap-1 p-2 rounded-md bg-muted/50 min-h-10">
                        {character.bonuses.length > 0 ? character.bonuses.map((bonus, i) => <Badge key={i} variant="secondary" className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">{bonus}</Badge>) : <span className="text-xs text-muted-foreground">Автоматически от расы</span>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label>Оружие</Label>
                    <Select value={character.weapon} onValueChange={(v) => handleSelectChange('weapon', v as WeaponType)}>
                        <SelectTrigger><SelectValue placeholder="Оружие" /></SelectTrigger>
                        <SelectContent>
                            {Object.values(WEAPONS).map(w => <SelectItem key={w.name} value={w.name}>{w.name} (Урон: {w.damage}, Дальность: {w.range}м)</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label>Броня</Label>
                    <Select value={character.armor} onValueChange={(v) => handleSelectChange('armor', v as ArmorType)}>
                        <SelectTrigger><SelectValue placeholder="Броня" /></SelectTrigger>
                        <SelectContent>
                            {Object.values(ARMORS).map(a => <SelectItem key={a.name} value={a.name}>{a.name} (Щит: {a.shieldBonus}, Штраф ОД: {a.odPenalty})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid w-full items-center gap-1.5">
                    <Label>Знания стихий</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start font-normal flex-wrap h-auto min-h-10">
                                <div className="flex gap-1 flex-wrap">
                                    {character.elementalKnowledge.length > 0 ? (
                                        character.elementalKnowledge.map(e => <Badge key={e} variant="secondary">{e}</Badge>)
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
                                        const isSelected = character.elementalKnowledge.includes(element.name);
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
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Инвентарь (Максимум: {RULES.MAX_INVENTORY_ITEMS})</Label>
                        <Button size="sm" variant="ghost" onClick={addInventoryItem} disabled={character.inventory.length >= RULES.MAX_INVENTORY_ITEMS}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Добавить
                        </Button>
                    </div>
                    {character.inventory.map((item, index) => (
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
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
