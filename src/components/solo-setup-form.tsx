
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
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users />
            Настройка пробной дуэли
          </DialogTitle>
          <DialogDescription>
            Настройте обоих персонажей для начала сольного поединка.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto px-2">
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><User/>Игрок 1</h3>
                <CharacterSetupForm
                    character={p1Stats}
                    onCharacterChange={setP1Stats}
                />
            </div>
             <div className="border-l border-border px-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><User/>Игрок 2</h3>
                <CharacterSetupForm
                    character={p2Stats}
                    onCharacterChange={setP2Stats}
                />
            </div>
        </div>
        <DialogFooter className="pt-4 border-t">
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
