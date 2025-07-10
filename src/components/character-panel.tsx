'use client';

import type { CharacterStats } from '@/types/duel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatBar from './stat-bar';
import { Heart, Sparkles, Wind, Shield, User, BookOpen, Cross, Briefcase, Bot, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface CharacterPanelProps {
  character: CharacterStats;
  isActive: boolean;
}

export default function CharacterPanel({ character, isActive }: CharacterPanelProps) {
  return (
    <TooltipProvider>
      <Card className={cn("transition-all duration-300", isActive ? "border-accent shadow-accent/20 shadow-lg" : "border-border")}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-headline">
            {character.name}
            {isActive && (
              <Tooltip>
                <TooltipTrigger>
                  <Siren className="w-5 h-5 text-accent animate-pulse" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Текущий ход</p>
                </TooltipContent>
              </Tooltip>
            )}
          </CardTitle>
          <CardDescription>{character.race} / {character.reserve}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <StatBar label="ОЗ" value={character.oz} maxValue={character.maxOz} colorClass="bg-red-500" icon={<Heart className="w-4 h-4 text-red-500" />} />
            <StatBar label="ОМ" value={character.om} maxValue={character.maxOm} colorClass="bg-blue-500" icon={<Sparkles className="w-4 h-4 text-blue-500" />} />
            <StatBar label="ОД" value={character.od} maxValue={character.maxOd} colorClass="bg-green-500" icon={<Wind className="w-4 h-4 text-green-500" />} />
            {character.shield > 0 && <StatBar label="Щит" value={character.shield} maxValue={character.shield} colorClass="bg-gray-400" icon={<Shield className="w-4 h-4 text-gray-400" />} />}
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> <strong>Знания:</strong></div>
              <div className="text-right">{character.elementalKnowledge}</div>
              
              <div className="flex items-center gap-2"><Cross className="w-4 h-4 text-primary" /> <strong>Вера:</strong></div>
              <div className="text-right">{character.faithLevel}</div>

              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> <strong>Состояние:</strong></div>
              <div className="text-right">{character.physicalCondition}</div>
          </div>
          
          <Separator />

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

        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
