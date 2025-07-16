

export type ReserveLevel =
  | 'Неофит'
  | 'Адепт'
  | 'Специалист'
  | 'Мастер'
  | 'Магистр'
  | 'Архимаг'
  | 'Архимагистр'
  | 'Божественный сын';

export type FaithLevel =
  | 'Ненависть/Проклят'
  | 'Равнодушие'
  | 'Верующий'
  | 'Прихожанин'
  | 'Неофит'
  | 'Храмовник'
  | 'Послушник'
  | 'Священник'
  | 'Прорицатель/Духовник'
  | 'Наместник храма'
  | 'Первожрец'
  | 'Верховный жрец/Мессия';

export interface InventoryItem {
    name: string;
    type: 'heal' | 'damage';
    amount: number;
}

export interface RaceAbility {
    name: string;
    description: string;
    cost?: {
      om?: number;
      od?: number;
      oz?: number;
    };
    cooldown?: number;
}

export interface Race {
  name: string;
  passiveBonuses: string[];
  activeAbilities: RaceAbility[];
}

export interface Element {
    name: string;
    strongAgainst: string[];
    weakTo: string[];
}

export interface Shield {
    hp: number;
    element: string | null;
}
  
export interface CharacterStats {
  id: string;
  name: string;
  race: string;
  reserve: ReserveLevel;
  elementalKnowledge: string[]; // Changed from string to string[]
  faithLevel: number; // The numeric value from -1 to 10
  faithLevelName: FaithLevel; // The string name of the faith level
  physicalCondition: string;
  bonuses: string[];
  penalties: string[];
  inventory: InventoryItem[];
  oz: number; // Health
  maxOz: number;
  om: number; // Mana
  maxOm: number;
  od: number; // Action Points
  maxOd: number;
  shield: Shield;
  isDodging: boolean;
  cooldowns: {
    strongSpell: number; // turns remaining
    item: number; // turns remaining
    prayer: number; // turns remaining
    [key: string]: number; // For racial abilities
  };
}

export type PrayerEffectType = 'eternal_shield' | 'full_heal_oz' | 'full_heal_om';

export type ActionType = 'strong_spell' | 'medium_spell' | 'small_spell' | 'household_spell' | 'dodge' | 'use_item' | 'shield' | 'prayer' | 'remove_effect' | 'rest' | 'racial_ability';

export interface Action {
  type: ActionType;
  payload?: any & { element?: string };
}

export interface Turn {
  turnNumber: number;
  playerId: string;
  playerName:string;
  actions: Action[];
  log: string[];
  startStats: Pick<CharacterStats, 'oz' | 'om' | 'od' | 'shield'>;
  endStats: Pick<CharacterStats, 'oz' | 'om' | 'od' | 'shield'>;
}

export interface DuelState {
  player1: CharacterStats;
  player2: CharacterStats | null;
  turnHistory: Turn[];
  currentTurn: number;
  activePlayerId: 'player1' | 'player2';
  winner?: string;
  log: string[];
  createdAt: any; // Using 'any' for Firebase Timestamp compatibility
}
