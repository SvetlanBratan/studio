

import type { ITEMS } from '@/lib/rules';

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

export type ItemName = keyof typeof ITEMS;

export interface InventoryItem {
    name: ItemName;
}

export type WeaponType = 'Меч' | 'Топор' | 'Копье' | 'Кинжал' | 'Сюрикены' | 'Лук' | 'Кулаки';
export type ArmorType = 'Тканевая' | 'Кожаная' | 'Кольчуга' | 'Латная' | 'Зачарованная';

export interface Weapon {
    name: WeaponType;
    damage: number;
    range: number; // in meters
}

export interface Armor {
    name: ArmorType;
    shieldBonus: number;
    odPenalty: number;
}


export interface RaceAbility {
    name:string;
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
  elementalKnowledge: string[];
  faithLevel: number;
  faithLevelName: FaithLevel;
  physicalCondition: string;
  bonuses: string[];
  penalties: string[];
  statuses?: string[];
  inventory: InventoryItem[];
  weapon: WeaponType;
  armor: ArmorType;
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
    physical_attack: number;
    [key: string]: number; // For racial abilities
  };
  isSetupComplete: boolean;
}

export type PrayerEffectType = 'eternal_shield' | 'full_heal_oz' | 'full_heal_om';

export type ActionType = 'strong_spell' | 'medium_spell' | 'small_spell' | 'household_spell' | 'dodge' | 'use_item' | 'shield' | 'prayer' | 'remove_effect' | 'rest' | 'racial_ability' | 'move' | 'physical_attack';

export interface Action {
  type: ActionType;
  payload?: any & { element?: string; distance?: number };
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
  winner: string | null;
  log: string[];
  createdAt: any; // Using 'any' for Firebase Timestamp compatibility
  duelStarted: boolean;
  distance: number;
}
