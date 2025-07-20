

'use client';

import { useState } from 'react';
import type { CharacterStats, ReserveLevel } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldQuestion } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import CharacterSetupForm from './character-setup-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { RESERVE_LEVELS } from '@/lib/rules';

interface CharacterSetupModalProps {
  character: CharacterStats;
  onSave: (character: CharacterStats, enemyReserveLevel?: ReserveLevel) => void;
  onCancel: () => void;
  isPvE?: boolean;
}

export default function CharacterSetupModal({ character, onSave, onCancel, isPvE = false }: CharacterSetupModalProps) {
  const [editableCharacter, setEditableCharacter] = useState<CharacterStats>(character);
  const [enemyReserveLevel, setEnemyReserveLevel] = useState<ReserveLevel>('Неофит');
  const [isOpen, setIsOpen] = useState(true);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        onCancel();
    }
    setIsOpen(open);
  }

  const handleSave = () => {
    const finalCharacter: CharacterStats = { 
        ...editableCharacter,
        isSetupComplete: true 
    };
    onSave(finalCharacter, isPvE ? enemyReserveLevel : undefined);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    Настройка персонажа: {character.name}
                </DialogTitle>
                <DialogDescription>
                    Выберите расу, резерв и другие параметры вашего персонажа перед началом дуэли.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-y-auto pr-4 flex-grow">
                <CharacterSetupForm
                    character={editableCharacter}
                    onCharacterChange={setEditableCharacter}
                />
                {isPvE && (
                    <div className="mt-6 pt-4 border-t">
                         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShieldQuestion/>Настройка врага</h3>
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label>Резерв врага (Сложность)</Label>
                            <Select value={enemyReserveLevel} onValueChange={(v: ReserveLevel) => setEnemyReserveLevel(v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {Object.keys(RESERVE_LEVELS).map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                )}
            </div>
            <DialogFooter className="pt-4 border-t shrink-0">
                 <DialogClose asChild>
                    <Button variant="outline" onClick={onCancel}>Отмена</Button>
                </DialogClose>
                <Button onClick={handleSave} size="lg">
                    <ShieldCheck className="mr-2"/>
                    Готов к бою
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
