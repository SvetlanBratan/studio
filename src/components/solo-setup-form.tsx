

'use client';

import { useState } from 'react';
import type { CharacterStats } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import CharacterSetupForm from './character-setup-form';

interface SoloSetupFormProps {
  player1: CharacterStats;
  player2: CharacterStats;
  onSave: (player1: CharacterStats, player2: CharacterStats) => void;
  onCancel: () => void;
}

export default function SoloSetupForm({ player1, player2, onSave, onCancel }: SoloSetupFormProps) {
  const [p1Stats, setP1Stats] = useState<CharacterStats>(player1);
  const [p2Stats, setP2Stats] = useState<CharacterStats>(player2);

  const handleSave = () => {
    onSave(p1Stats, p2Stats);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-6xl flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users />
            Настройка пробной дуэли
          </DialogTitle>
          <DialogDescription>
            Настройте обоих персонажей для начала сольного поединка.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 overflow-y-auto flex-grow px-1">
            <div className="h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 shrink-0"><User/>Игрок 1</h3>
                <div className="overflow-y-auto pr-2 flex-grow">
                    <CharacterSetupForm
                        character={p1Stats}
                        onCharacterChange={setP1Stats}
                    />
                </div>
            </div>
             <div className="border-l border-border px-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 shrink-0"><User/>Игрок 2</h3>
                 <div className="overflow-y-auto pr-2 flex-grow">
                    <CharacterSetupForm
                        character={p2Stats}
                        onCharacterChange={setP2Stats}
                    />
                </div>
            </div>
        </div>
        <DialogFooter className="pt-4 border-t shrink-0">
          <Button variant="outline" onClick={onCancel}>Отмена</Button>
          <Button onClick={handleSave} size="lg">
            <ShieldCheck className="mr-2" />
            Начать дуэль
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
