export type ReserveLevel =
  | 'Неофит'
  | 'Адепт'
  | 'Специалист'
  | 'Мастер'
  | 'Магистр'
  | 'Архимаг'
  | 'Архимагистр'
  | 'Божественный сын';

export interface CharacterStats {
  id: string;
  name: string;
  race: string;
  reserve: ReserveLevel;
  elementalKnowledge: string; // e.g. "Магия времени (Мастер), Магия света (Адепт)"
  faithLevel: number;
  physicalCondition: string;
  bonuses: string[]; // e.g. "Иммунитет к контролю", "Боевая магия", "Уязвимость к огню"
  penalties: string[]; // e.g. "Отравление", "Горение"
  inventory: string[];
  oz: number; // Health
  maxOz: number;
  om: number; // Mana
  maxOm: number;
  od: number; // Action Points
  maxOd: number;
  shield: number;
  cooldowns: {
    strongSpell: number; // turns remaining
    item: number; // turns remaining
    prayer: number; // turns remaining
  };
}

export type ActionType = 'strong_spell' | 'medium_spell' | 'small_spell' | 'household_spell' | 'dodge' | 'use_item' | 'shield' | 'prayer' | 'remove_effect' | 'rest';

export interface Action {
  type: ActionType;
  // For spells, we might add target and effect details
  payload?: any;
}

export interface Turn {
  turnNumber: number;
  playerId: string;
  playerName: string;
  actions: Action[];
  log: string[]; // Detailed log of what happened
  startStats: Pick<CharacterStats, 'oz' | 'om' | 'od' | 'shield'>;
  endStats: Pick<CharacterStats, 'oz' | 'om' | 'od' | 'shield'>;
}

export interface DuelState {
  player1: CharacterStats;
  player2: CharacterStats;
  turnHistory: Turn[];
  currentTurn: number;
  activePlayerId: string;
  winner?: string;
  log: string[]; // Live duel log for the current turn
}
