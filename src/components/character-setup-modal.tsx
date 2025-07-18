

'use client';

import { useState } from 'react';
import type { CharacterStats } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import CharacterSetupForm from './character-setup-form';

interface CharacterSetupModalProps {
  character: CharacterStats;
  onSave: (character: CharacterStats) => void;
  onCancel: () => void;
}

export default function CharacterSetupModal({ character, onSave, onCancel }: CharacterSetupModalProps) {
  const [editableCharacter, setEditableCharacter] = useState<CharacterStats>(character);
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
    onSave(finalCharacter);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    Настройка персонажа: {character.name}
                </DialogTitle>
                <DialogDescription>
                    Выберите расу, резерв и другие параметры вашего персонажа перед началом дуэли.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <CharacterSetupForm
                    character={editableCharacter}
                    onCharacterChange={setEditableCharacter}
                />
            </div>
            <DialogFooter>
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
