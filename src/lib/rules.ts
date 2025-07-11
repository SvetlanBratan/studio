import { ReserveLevel } from "@/types/duel";

type RitualType = 'household' | 'small' | 'medium' | 'strong';

export const RULES = {
  STARTING_OZ: 200,
  STARTING_OD: 100,
  MAX_ACTIONS_PER_TURN: 2,

  RITUAL_COSTS: {
    strong: 90,
    medium: 30,
    small: 10,
    household: 5,
  },
  
  NON_MAGIC_COSTS: {
    dodge: 30,
    use_item: 30,
    prayer: 30,
    order_familiar: 30,
    move_per_meter: 1,
  },

  COOLDOWNS: {
    strongSpell: 2, // 1 turn of use, 1 turn of cd -> use on turn 1, available on turn 3
    item: 3,
    prayer: 4,
  },

  OM_RESERVE: {
    'Неофит': 90,
    'Адепт': 180,
    'Специалист': 270,
    'Мастер': 360,
    'Магистр': 450,
    'Архимаг': 540,
    'Архимагистр': 630,
    'Божественный сын': 1890,
  } as Record<ReserveLevel, number>,

  RITUAL_DAMAGE: {
    'Неофит': { household: 3, small: 6, medium: 16, strong: 48 },
    'Адепт': { household: 3, small: 7, medium: 20, strong: 60 },
    'Специалист': { household: 4, small: 8, medium: 24, strong: 72 },
    'Мастер': { household: 4, small: 9, medium: 28, strong: 84 },
    'Магистр': { household: 5, small: 11, medium: 32, strong: 96 },
    'Архимаг': { household: 5, small: 12, medium: 36, strong: 108 },
    'Архимагистр': { household: 6, small: 14, medium: 40, strong: 120 },
    'Божественный сын': { household: 6, small: 16, medium: 44, strong: 132 },
  } as Record<ReserveLevel, Record<RitualType, number>>,

  DAMAGE_BONUS: {
    vulnerability: { household: 1, small: 5, medium: 10, strong: 15 },
    battle_magic: { household: 1, small: 5, medium: 10, strong: 15 },
  } as Record<'vulnerability' | 'battle_magic', Record<RitualType, number>>,

  DOT_EFFECTS: ['Отравление', 'Горение', 'Ожог'],
  DOT_DAMAGE: 8,

  PASSIVE_OM_REGEN: 25,
  OD_REGEN_ON_REST: 50,
  
  BASE_SHIELD_VALUE: 25, // For one medium ritual
  
  WOUND_PENALTIES: [
      { threshold: 150, penalty: 3 },
      { threshold: 100, penalty: 4 },
      { threshold: 50, penalty: 5 },
  ],

  PRAYER_CHANCE: {
    '-1': 0, '0': 10, '1': 20, '2': 30, '3': 40, '4': 50, '5': 50,
    '6': 60, '7': 70, '8': 80, '9': 90, '10': 100,
  } as Record<string, number>,

  DODGE_VS_STRONG_SPELL_DMG_REDUCTION: 20,
};
