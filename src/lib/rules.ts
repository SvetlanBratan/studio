
import type { ReserveLevel, FaithLevel, ActionType, Race, RaceAbility, PrayerEffectType } from "@/types/duel";

type RitualType = 'household' | 'small' | 'medium' | 'strong';

export const FAITH_LEVELS: Record<FaithLevel, number> = {
  'Ненависть/Проклят': -1,
  'Равнодушие': 0,
  'Верующий': 1,
  'Прихожанин': 2,
  'Неофит': 3,
  'Храмовник': 4,
  'Послушник': 5,
  'Священник': 6,
  'Прорицатель/Духовник': 7,
  'Наместник храма': 8,
  'Первожрец': 9,
  'Верховный жрец/Мессия': 10,
};

export const RESERVE_LEVELS: Record<ReserveLevel, number> = {
  'Неофит': 90,
  'Адепт': 180,
  'Специалист': 270,
  'Мастер': 360,
  'Магистр': 450,
  'Архимаг': 540,
  'Архимагистр': 630,
  'Божественный сын': 1890,
};

export const RACES: Race[] = [
  { name: 'Алахоры', passiveBonuses: ['+3 урона при попадании (металлическая кровь)'], activeAbilities: [{ name: 'Кислотное распыление', description: '-10 ОЗ врагу', cooldown: 3}] },
  { name: 'Алариены', passiveBonuses: ['+3 исцеления/ход'], activeAbilities: [{ name: 'Дар сладости', description: 'восстановить +15 ОЗ', cooldown: 4}] },
  { name: 'Амфибии', passiveBonuses: ['+2 урона и +2 исцеления/ход'], activeAbilities: [{ name: 'Брызг из жабр', description: 'ослепление на 1 ход', cooldown: 5}] },
  { name: 'Антаресы', passiveBonuses: ['+к инициативе, -10 ОД при дезориентации'], activeAbilities: [{ name: 'Всплеск приторной силы', description: 'бафф на +10 ОЗ/ОМ'}] },
  { name: 'Антропоморфы', passiveBonuses: ['+2 исцеления/ход'], activeAbilities: [{ name: 'Инстинкт зверя', description: '+10 к урону, -10 ОД'}] },
  { name: 'Арахнии', passiveBonuses: ['+1 исцеления, +1 ОМ'], activeAbilities: [{ name: 'Паутина', description: 'замедление врага, -10 ОД'}] },
  { name: 'Арахниды', passiveBonuses: ['Иммунитет к ядам'], activeAbilities: [{ name: 'Ядовитый дым', description: 'отравление -5 ОЗ/ход (3 хода)', cooldown: 4}] },
  { name: 'Аспиды', passiveBonuses: ['+1 урона космической магией'], activeAbilities: [{ name: 'Кислотное дыхание', description: '-15 ОЗ в радиусе 5м'}] },
  { name: 'Астролоиды', passiveBonuses: ['+3 исцеления/ход'], activeAbilities: [{ name: 'Призыв звезды', description: 'метеорит на -20 ОЗ', cooldown: 3}, {name: 'Танец лепестков', description: '+10 ОЗ'}] },
  { name: 'Бабочки', passiveBonuses: ['Копирование последнего действия врага, абсолютно все действия отзеркаливаются, не тратит ОЗ и ОМ'], activeAbilities: [] },
  { name: 'Безликие', passiveBonuses: ['+5 к физической атаке'], activeAbilities: [{ name: 'Пронзающий удар', description: '+20 ОЗ физурона'}] },
  { name: 'Белояры', passiveBonuses: ['+4 урона/исцеления если влюблены'], activeAbilities: [{ name: 'Песня влюблённого', description: '-10 ОЗ врагу, +10 ОЗ себе'}] },
  { name: 'Бракованные пересмешники', passiveBonuses: ['+3 к восстановлению ОМ при укусе'], activeAbilities: [{ name: 'Укус', description: '+10 ОМ, -10 ОЗ врагу'}] },
  { name: 'Вампиры', passiveBonuses: ['+5 ОМ при общении с духами'], activeAbilities: [{ name: 'Обратиться к духам', description: 'призыв духа-хранителя'}] },
  { name: 'Василиски', passiveBonuses: ['Ядовитый урон -10 при укусе'], activeAbilities: [{ name: 'Окаменение взглядом', description: 'враг теряет ход'}] },
  { name: 'Веспы', passiveBonuses: ['-1 ОД у врага'], activeAbilities: [{ name: 'Вспышка зрения', description: 'ослепление на 1 ход'}] },
  { name: 'Вулгары', passiveBonuses: ['Иммунитет к болезням, +10 ОЗ/ход'], activeAbilities: [{ name: 'Удар подавления', description: 'снижает ОМ врага на 15'}] },
  { name: 'Гуриты', passiveBonuses: ['+2 исцеления/ход'], activeAbilities: [{ name: 'Обволакивающая слизь', description: 'замедление врага'}] },
  { name: 'Дарнатиаре', passiveBonuses: ['+10 ОМ/ОЗ при религиозных ритуалах'], activeAbilities: [{ name: 'Целительный ветер', description: '+15 ОЗ союзнику'}] },
  { name: 'Джакали', passiveBonuses: ['+3 к случайной характеристике в начале боя'], activeAbilities: [{ name: 'Благословение крови', description: '+20 ОЗ союзнику, при молитве'}] },
  { name: 'Джинны', passiveBonuses: ['+10 ОЗ при ОЗ <50'], activeAbilities: [{ name: 'Элементальная вспышка', description: 'случайный урон 15-25'}] },
  { name: 'Домовые', passiveBonuses: ['+5 урона магией, +10 ОМ/ход'], activeAbilities: [{ name: 'Забота дома', description: '+15 ОЗ и снятие одного эффекта'}] },
  { name: 'Драконы', passiveBonuses: ['+3 исцеления при природе'], activeAbilities: [{ name: 'Драконий выдох', description: '-20 ОЗ врагу огнём/льдом/кислотой'}] },
  { name: 'Дриады', passiveBonuses: ['+2 ОЗ при контакте с цветами'], activeAbilities: [{ name: 'Корнеплетение', description: 'обездвиживание врага', cooldown: 4}] },
  { name: 'Дриды', passiveBonuses: ['+4 урона/ход ночью'], activeAbilities: [{ name: 'Цветочный нектар', description: '+10 ОЗ и +5 ОМ'}] },
  { name: 'Дроу', passiveBonuses: ['Шанс отравить врага (15%)'], activeAbilities: [{ name: 'Теневая стрела', description: '-15 ОЗ, +5 к уклонению'}] },
  { name: 'Инсектоиды', passiveBonuses: ['+2 ОМ/ход в группе'], activeAbilities: [{ name: 'Кислотный укус', description: '-10 ОЗ и яд -3/ход'}] },
  { name: 'Ир Эйн', passiveBonuses: ['+2 ОМ/ход'], activeAbilities: [{ name: 'Пивной рев', description: 'деморализация врага (-ОД)'}] },
  { name: 'Ихо', passiveBonuses: ['+5 к броне'], activeAbilities: [{ name: 'Лозунг крови', description: '+10 ОМ союзникам рядом'}] },
  { name: 'Карлики', passiveBonuses: ['+15 ОД в поле'], activeAbilities: [{ name: 'Молот правды', description: 'пробивает щит и наносит 15 урона'}] },
  { name: 'Кентавры', passiveBonuses: ['+2 ОМ за каждые 3 хвоста'], activeAbilities: [{ name: 'Копытный разгон', description: 'нанести урон и отступить'}] },
  { name: 'Кицунэ', passiveBonuses: ['+10 к сопротивлению'], activeAbilities: [{ name: 'Иллюзия хвостов', description: 'дезориентация врага'}] },
  { name: 'Коралиты', passiveBonuses: ['+10 ОЗ в лесной местности'], activeAbilities: [{ name: 'Всплеск солёной воды', description: 'обезоруживает на 1 ход'}] },
  { name: 'Кордеи', passiveBonuses: ['невосприимчивость ко всем видам урона, кроме плетельщиц'], activeAbilities: [{ name: 'Пылающая кровь', description: '-10 ОЗ врагу при атаке в ближнем бою'}] },
  { name: 'Кунари', passiveBonuses: ['-5 ОД у врага при зрительном контакте'], activeAbilities: [{ name: 'Зов леса', description: '+10 ОЗ всей группе'}] },
  { name: 'Ларимы', passiveBonuses: ['+10 ОМ при удаче'], activeAbilities: [{ name: 'Укус', description: '-15 ОЗ, игнорирует щит'}] },
  { name: 'Лартисты', passiveBonuses: ['+10 ОЗ/ход'], activeAbilities: [{ name: 'Мир красок', description: 'вводит врага в иллюзию (-действие)'}] },
  { name: 'Лепреконы', passiveBonuses: ['-5 ОД у врага при предсказании действий'], activeAbilities: [{ name: 'Клеверная искра', description: '+15 ОЗ и +10 ОМ (1 раз в бой)'}] },
  { name: 'Миканиды', passiveBonuses: ['+5 ОЗ/ОМ союзнику рядом'], activeAbilities: [{ name: 'Споры восстановления', description: '+10 ОЗ всем в зоне 5м'}] },
  { name: 'Мириоды', passiveBonuses: ['+10 ОМ при заклинаниях воды'], activeAbilities: [{ name: 'Кислотное дыхание', description: '-10 ОЗ, игнорирует броню'}] },
  { name: 'Нарраторы', passiveBonuses: ['+10 ОЗ, сниженный урон от физических атак'], activeAbilities: [{ name: 'Печать Слова', description: 'враг не может повторить последнее заклинание'}] },
  { name: 'Неземные', passiveBonuses: ['+10 ОЗ и ОД в звероформе'], activeAbilities: [{ name: 'Ментальное прикосновение', description: 'восстановление +15 ОЗ'}] },
  { name: 'Неониды', passiveBonuses: ['+5 урона огнём'], activeAbilities: [{ name: 'Фосфоресцирующий всплеск', description: 'ослепление врагов'}] },
  { name: 'Нетленные', passiveBonuses: ['+10 ОМ, возможен удар током'], activeAbilities: [{ name: 'Желеобразный барьер', description: 'поглощает 15 урона'}] },
  { name: 'Нимфилус', passiveBonuses: ['Иммунитет к иллюзиям'], activeAbilities: [{ name: 'Сладкое прикосновение', description: '+10 ОЗ и -ОД врагу'}] },
  { name: 'Оборотни', passiveBonuses: ['-5 ОД у врага рядом'], activeAbilities: [{ name: 'Смена формы', description: 'звериный облик, бонусы к урону'}] },
  { name: 'Огненные крыланы', passiveBonuses: ['-8 ОЗ/ход врагу и себе'], activeAbilities: [{ name: 'Крылья Пламени', description: 'атака по всем врагам в зоне'}] },
  { name: 'Оприты', passiveBonuses: ['-5 ОД у врага'], activeAbilities: [{ name: 'Разряд', description: '-10 ОЗ и -5 ОМ врагу'}] },
  { name: 'Пересмешники', passiveBonuses: ['Окаменяющий взгляд при атаке'], activeAbilities: [{ name: 'Имитация', description: 'доступны все бонусные действия других рас'}] },
  { name: 'Полукоты', passiveBonuses: ['+5 урона огнём, иммунитет к огню'], activeAbilities: [{ name: 'Мурлыканье', description: 'усыпляет врага на 1 ход'}] },
  { name: 'Полузаи', passiveBonuses: ['+5 ОМ при светлых заклинаниях'], activeAbilities: [{ name: 'Прыжок Зайца', description: 'уворот + перемещение'}] },
  { name: 'Проклятые', passiveBonuses: ['-5 ОД у врага рядом'], activeAbilities: [{ name: 'Извержение Скверны', description: 'массовый урон по всем'}] },
  { name: 'Псилаты', passiveBonuses: ['+10 ОЗ/ход'], activeAbilities: [{ name: 'Психошок', description: 'спутанность действий врага'}] },
  { name: 'Рариты', passiveBonuses: ['+5 урона льдом, иммунитет к холоду'], activeAbilities: [{ name: 'Каменное касание', description: '-15 ОЗ, шанс паралича'}] },
  { name: 'Саламандры', passiveBonuses: ['+10 ОЗ при дневном свете'], activeAbilities: [{ name: 'Пламенный след', description: '-10 ОЗ всем на клетке'}] },
  { name: 'Светоликие', passiveBonuses: ['+10 ОЗ/щит'], activeAbilities: [{ name: 'Вспышка Света', description: 'ослепление врагов'}] },
  { name: 'Сирены', passiveBonuses: ['Иммунитет к контролю'], activeAbilities: [{ name: 'Песнь чар', description: 'транс на 1 ход'}] },
  { name: 'Слизни', passiveBonuses: ['-5 урона по себе'], activeAbilities: [{ name: 'Склизкий отпор', description: 'враг соскальзывает, теряет действие'}] },
  { name: 'Снежные эльфы', passiveBonuses: ['-10 ОЗ/2 хода врагу при укусе'], activeAbilities: [{ name: 'Ледяной вихрь', description: '-15 ОЗ, замедление'}] },
  { name: 'Солнечные эльфы', passiveBonuses: ['Незаметность'], activeAbilities: [{ name: 'Луч истины', description: 'раскрытие маскировки, урон светом'}] },
  { name: 'Сфинксы', passiveBonuses: ['+10 ОМ, -5 ОЗ/ход'], activeAbilities: [{ name: 'Загадка Сфинкса', description: '-20 ОЗ'}] },
  { name: 'Тальены', passiveBonuses: ['-5 ОД у врагов рядом'], activeAbilities: [{ name: 'Психостенка', description: 'отражение дебаффов'}] },
  { name: 'Тени', passiveBonuses: ['-8 ОЗ при укусе'], activeAbilities: [{ name: 'Теневой шаг', description: 'перемещение без траты ОД'}] },
  { name: 'Тритоны', passiveBonuses: ['Иммунитет к боли и страху'], activeAbilities: [{ name: 'Призыв боли', description: 'враг теряет 10 ОЗ/ход 3 хода'}] },
  { name: 'Хамелеоны', passiveBonuses: ['Игнорируют физ. урон'], activeAbilities: [{ name: 'Маскировка', description: '+50% уворота на 1 ход'}] },
  { name: 'Химеры', passiveBonuses: ['Сопротивление к колющему и режущему'], activeAbilities: [{ name: 'Мутация', description: 'временно копирует черты другой расы'}] },
  { name: 'Цынаре', passiveBonuses: ['Иммунитет к ко всем действиям'], activeAbilities: [{ name: 'Гипноз', description: 'враг теряет ход'}] },
  { name: 'Энергетические вампиры', passiveBonuses: ['Иммунитет к ко всем действиям'], activeAbilities: [{ name: 'Похищение энергии', description: '+10 ОМ, -10 ОМ у врага'}] },
  { name: 'Ятанаги', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Кровавое жжение', description: 'вызывает зуд, -5 ОД и -5 ОЗ'}] },
  { name: 'Куклы', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Прокол иглой', description: 'переносит эффект на другого'}] },
  { name: 'Призраки', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Призрачный вой', description: 'враг теряет 1 действие'}] },
  { name: 'Скелеты', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Костяной шквал', description: 'массовый урон в ближнем бою'}] },
  { name: 'Жнецы', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Коса конца', description: 'мгновенно снимает все очки ОЗ'}] },
  { name: 'Духи', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Эфирный крик', description: '-10 ОМ врагу, при наличии духовной связи'}] },
];

export const getOmFromReserve = (reserve: ReserveLevel): number => RESERVE_LEVELS[reserve] || 90;
export const getFaithLevelFromString = (faith: FaithLevel): number => FAITH_LEVELS[faith] || 0;

export const getActionLabel = (type: ActionType, payload?: any): string => {
  const prayerEffectLabels: Record<PrayerEffectType, string> = {
    eternal_shield: 'Вечный щит (4 хода)',
    full_heal_oz: 'Полное исцеление ОЗ',
    full_heal_om: 'Полное восполнение ОМ',
  };

  const labels: Record<ActionType, string> = {
      strong_spell: "Сильный ритуал",
      medium_spell: "Средний ритуал",
      small_spell: "Малый ритуал",
      household_spell: "Бытовое заклинание",
      dodge: "Уворот",
      use_item: "Использовать предмет",
      shield: "Создать щит",
      prayer: "Молитва",
      remove_effect: "Снять эффект",
      rest: "Отдых",
      racial_ability: "Расовая способность"
  };

  if (type === 'prayer' && payload?.effect) {
    return `${labels.prayer}: ${prayerEffectLabels[payload.effect]}`;
  }
  if (type === 'racial_ability' && payload?.name) {
    return `${labels.racial_ability}: ${payload.name}`;
  }
  return labels[type] || type;
}


export const RULES = {
  STARTING_OZ: 200,
  STARTING_OD: 100,
  MAX_ACTIONS_PER_TURN: 2,
  MAX_INVENTORY_ITEMS: 2,

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

  DOT_EFFECTS: ['Отравление', 'Горение', 'Ожог', 'Отравление (3)', 'Отравление (2)', 'Отравление (1)'],
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
    '-1': 0, '0': 1, '1': 2, '2': 3, '3': 4, '4': 5, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  } as Record<string, number>,

  DODGE_VS_STRONG_SPELL_DMG_REDUCTION: 20,
};
