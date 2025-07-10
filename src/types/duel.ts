export interface CharacterStats {
  id: string;
  name: string;
  race: string;
  reserve: string;
  elementalKnowledge: string;
  faithLevel: number;
  physicalCondition: string;
  bonuses: string[];
  penalties: string[];
  inventory: string[];
  oz: number; // Health
  maxOz: number;
  om: number; // Mana
  maxOm: number;
  od: number; // Action Points
  maxOd: number;
  shield: number;
}

export interface Action {
  description: string;
  costType: 'om' | 'od' | 'none';
  cost: number;
}

export interface Turn {
  turnNumber: number;
  playerId: string;
  playerName: string;
  actions: Action[];
  passiveEffects: string;
  bonuses: string;
  penalties: string;
  startStats: Pick<CharacterStats, 'oz' | 'om' | 'od'>;
  endStats: Pick<CharacterStats, 'oz' | 'om' | 'od'>;
}

export interface DuelState {
  player1: CharacterStats;
  player2: CharacterStats;
  turnHistory: Turn[];
  currentTurn: number;
  activePlayerId: string;
  winner?: string;
}
