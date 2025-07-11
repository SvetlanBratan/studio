'use client';

import { useState, useEffect } from 'react';
import type { CharacterStats } from '@/types/duel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatBar from './stat-bar';
import { Heart, Sparkles, Wind, Shield, User, BookOpen, Cross, Briefcase, Bot, Siren, Edit, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface CharacterPanelProps {
  character: CharacterStats;
  isActive: boolean;
  onUpdate: (character: CharacterStats) => void;
}

export default function CharacterPanel({ character, isActive, onUpdate }: CharacterPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableCharacter, setEditableCharacter] = useState<CharacterStats>(character);

  useEffect(() => {
    // Reset local state if the external character data changes (e.g., on duel reset)
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

  const handleArrayInputChange = (field: 'bonuses' | 'penalties' | 'inventory', value: string) => {
    setEditableCharacter(prev => ({...prev, [field]: value.split(',').map(s => s.trim()).filter(Boolean)}));
  };

  const handleSave = () => {
    onUpdate(editableCharacter);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableCharacter(character);
    setIsEditing(false);
  };

  const renderStatEditor = (label: string, name: keyof CharacterStats, value: number, maxName: keyof CharacterStats, maxValue: number) => (
    <div className="grid grid-cols-2 gap-2 items-center">
      <Label htmlFor={`${name}-${character.id}`}>{label}</Label>
      <div className="flex gap-1">
        <Input
          id={`${name}-${character.id}`}
          name={name}
          type="number"
          value={value}
          onChange={handleNumericInputChange}
          className="h-8"
        />
        <span className="self-center">/</span>
         <Input
          name={maxName}
          type="number"
          value={maxValue}
          onChange={handleNumericInputChange}
          className="h-8"
        />
      </div>
    </div>
  );

  const renderTextEditor = (label: string, name: keyof CharacterStats, value: string, component: 'input' | 'textarea' = 'input') => {
    const Comp = component === 'input' ? Input : Textarea;
    return (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor={`${name}-${character.id}`}>{label}</Label>
          <Comp
              id={`${name}-${character.id}`}
              name={name}
              value={value}
              onChange={handleInputChange}
              className={component === 'input' ? "h-8" : ""}
          />
        </div>
    );
  };

   const renderArrayEditor = (label: string, field: 'bonuses' | 'penalties' | 'inventory', value: string[]) => (
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
               {!isEditing && (
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
               <Input name="race" value={editableCharacter.race} onChange={handleInputChange} placeholder="Раса" />
               <Input name="reserve" value={editableCharacter.reserve} onChange={handleInputChange} placeholder="Резерв" />
             </div>
          ) : (
             <CardDescription>{character.race} / {character.reserve}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          {isEditing ? (
            <div className="space-y-3">
              {renderStatEditor("ОЗ", "oz", editableCharacter.oz, "maxOz", editableCharacter.maxOz)}
              {renderStatEditor("ОМ", "om", editableCharacter.om, "maxOm", editableCharacter.maxOm)}
              {renderStatEditor("ОД", "od", editableCharacter.od, "maxOd", editableCharacter.maxOd)}
            </div>
          ) : (
            <div className="space-y-3">
              <StatBar label="ОЗ" value={character.oz} maxValue={character.maxOz} colorClass="bg-red-500" icon={<Heart className="w-4 h-4 text-red-500" />} />
              <StatBar label="ОМ" value={character.om} maxValue={character.maxOm} colorClass="bg-blue-500" icon={<Sparkles className="w-4 h-4 text-blue-500" />} />
              <StatBar label="ОД" value={character.od} maxValue={character.maxOd} colorClass="bg-green-500" icon={<Wind className="w-4 h-4 text-green-500" />} />
              {character.shield > 0 && <StatBar label="Щит" value={character.shield} maxValue={character.shield} colorClass="bg-gray-400" icon={<Shield className="w-4 h-4 text-gray-400" />} />}
            </div>
          )}
          
          <Separator />
          
          {isEditing ? (
            <div className="space-y-3">
              {renderTextEditor("Знания", "elementalKnowledge", editableCharacter.elementalKnowledge, 'textarea')}
              <div className="grid grid-cols-2 gap-2">
                {renderTextEditor("Вера", "faithLevel", String(editableCharacter.faithLevel))}
                {renderTextEditor("Состояние", "physicalCondition", editableCharacter.physicalCondition)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> <strong>Знания:</strong></div>
                <div className="text-right">{character.elementalKnowledge}</div>
                
                <div className="flex items-center gap-2"><Cross className="w-4 h-4 text-primary" /> <strong>Вера:</strong></div>
                <div className="text-right">{character.faithLevel}</div>

                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> <strong>Состояние:</strong></div>
                <div className="text-right">{character.physicalCondition}</div>
            </div>
          )}
          
          <Separator />
          
           {isEditing ? (
              <div className="space-y-3">
                  {renderArrayEditor("Бонусы", "bonuses", editableCharacter.bonuses)}
                  {renderArrayEditor("Штрафы", "penalties", editableCharacter.penalties)}
                  {renderArrayEditor("Инвентарь", "inventory", editableCharacter.inventory)}
              </div>
          ) : (
            <>
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
                  {character.inventory.length > 0 ? character.inventory.map((item, i) => <Badge key={i} variant="outline">{item}</Badge>) : <span className="text-xs text-muted-foreground">Пусто</span>}
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
