
import type { ReserveLevel, FaithLevel, ActionType, Race, RaceAbility, PrayerEffectType, Element } from "@/types/duel";

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
    { name: 'Алахоры', passiveBonuses: ['+3 урона при попадании (металлическая кровь)'], activeAbilities: [{ name: 'Кислотное распыление', description: '-10 ОЗ врагу', cooldown: 3, cost: {om: 10} }] },
    { name: 'Алариены', passiveBonuses: ['+3 исцеления/ход'], activeAbilities: [{ name: 'Дар сладости', description: 'восстановить +15 ОЗ', cooldown: 4, cost: {om: 10} }] },
    { name: 'Амфибии', passiveBonuses: ['+2 урона и +2 исцеления/ход'], activeAbilities: [{ name: 'Брызг из жабр', description: 'ослепление на 1 ход', cooldown: 5, cost: {om: 10} }] },
    { name: 'Антаресы', passiveBonuses: ['+к инициативе, -10 ОД при дезориентации'], activeAbilities: [{ name: 'Всплеск приторной силы', description: 'бафф на +10 ОЗ/ОМ', cost: {om: 30} }] },
    { name: 'Антропоморфы', passiveBonuses: ['+2 исцеления/ход'], activeAbilities: [{ name: 'Инстинкт зверя', description: '+10 к урону', cost: {od: 10} }] },
    { name: 'Арахнии', passiveBonuses: ['+1 исцеления, +1 ОМ'], activeAbilities: [{ name: 'Паутина', description: 'замедление врага', cost: {od: 10, om: 10} }] },
    { name: 'Арахниды', passiveBonuses: ['Иммунитет к ядам'], activeAbilities: [{ name: 'Ядовитый дым', description: 'отравление -5 ОЗ/ход (3 хода)', cooldown: 4, cost: {om: 10} }] },
    { name: 'Аспиды', passiveBonuses: ['+1 урона космической магией'], activeAbilities: [{ name: 'Кислотное дыхание', description: '-15 ОЗ в радиусе 5м', cost: {om: 30} }] },
    { name: 'Астролоиды', passiveBonuses: ['+3 исцеления/ход'], activeAbilities: [{ name: 'Призыв звезды', description: 'метеорит на -20 ОЗ', cooldown: 3, cost: {om: 30}}, {name: 'Танец лепестков', description: '+10 ОЗ', cost: {om: 10}}] },
    { name: 'Бабочки', passiveBonuses: ['Копирование последнего действия врага, абсолютно все действия отзеркаливаются, не тратит ОЗ и ОМ'], activeAbilities: [] },
    { name: 'Безликие', passiveBonuses: ['+5 к физической атаке', 'Отражает весь урон'], activeAbilities: [{ name: 'Пронзающий удар', description: '+20 ОЗ физурона', cost: {od: 30} }] },
    { name: 'Белояры', passiveBonuses: ['+4 урона/исцеления если влюблены'], activeAbilities: [{ name: 'Песня влюблённого', description: '-10 ОЗ врагу, +10 ОЗ себе', cost: {om: 30} }] },
    { name: 'Бракованные пересмешники', passiveBonuses: ['+3 к восстановлению ОМ при укусе'], activeAbilities: [{ name: 'Укус', description: '-10 ОЗ врагу', cost: {od: 10} }] },
    { name: 'Вампиры', passiveBonuses: ['+3 к восстановлению ОМ при укусе'], activeAbilities: [{ name: 'Укус', description: '-10 ОЗ врагу', cost: {od: 10} }] },
    { name: 'Вансаэльцы', passiveBonuses: ['+5 ОМ при общении с духами'], activeAbilities: [{ name: 'Обратиться к духам', description: 'призыв духа-хранителя', cost: {om: 90} }] },
    { name: 'Василиски', passiveBonuses: ['Ядовитый урон -10 при укусе'], activeAbilities: [{ name: 'Окаменение взглядом', description: 'враг теряет ход', cost: {om: 90} }] },
    { name: 'Веспы', passiveBonuses: ['-1 ОД у врага'], activeAbilities: [{ name: 'Вспышка зрения', description: 'ослепление на 1 ход', cost: {om: 10} }] },
    { name: 'Вулгары', passiveBonuses: ['Иммунитет к болезням, +10 ОЗ/ход'], activeAbilities: [{ name: 'Удар подавления', description: 'снижает ОМ врага на 15', cost: {om: 10} }] },
    { name: 'Гуриты', passiveBonuses: ['+2 исцеления/ход'], activeAbilities: [{ name: 'Обволакивающая слизь', description: 'замедление врага', cost: {om: 10} }] },
    { name: 'Дарнатиаре', passiveBonuses: ['+2 исцеления/ход'], activeAbilities: [{ name: 'Целительный ветер', description: '+15 ОЗ союзнику', cost: {om: 30} }] },
    { name: 'Джакали', passiveBonuses: ['+10 ОМ/ОЗ при религиозных ритуалах'], activeAbilities: [{ name: 'Благословение крови', description: '+20 ОЗ союзнику, при молитве', cost: {om: 30} }] },
    { name: 'Джинны', passiveBonuses: ['+10 ОЗ при ОЗ <50'], activeAbilities: [{ name: 'Элементальная вспышка', description: 'случайный урон 15-25', cost: {om: 30} }] },
    { name: 'Домовые', passiveBonuses: ['+5 урона магией, +10 ОМ/ход'], activeAbilities: [{ name: 'Забота дома', description: '+15 ОЗ и снятие одного эффекта', cost: {om: 30} }] },
    { name: 'Драконы', passiveBonuses: ['+5 урона магией, +10 ОМ/ход'], activeAbilities: [{ name: 'Драконий выдох', description: '-20 ОЗ врагу огнём/льдом/кислотой', cost: {om: 30} }] },
    { name: 'Дриады', passiveBonuses: ['+3 исцеления при природе'], activeAbilities: [{ name: 'Корнеплетение', description: 'обездвиживание врага', cooldown: 4, cost: {om: 30} }] },
    { name: 'Дриды', passiveBonuses: ['+2 ОЗ при контакте с цветами'], activeAbilities: [{ name: 'Цветочный нектар', description: '+10 ОЗ и +5 ОМ', cost: {om: 10} }] },
    { name: 'Дроу', passiveBonuses: ['+4 урона/ход ночью', 'Скидка к урону от яда (3)'], activeAbilities: [{ name: 'Теневая стрела', description: '-15 ОЗ, +5 к уклонению', cost: {om: 10} }] },
    { name: 'Инсектоиды', passiveBonuses: ['Шанс отравить врага (15%)'], activeAbilities: [{ name: 'Кислотный укус', description: '-10 ОЗ и яд -3/ход', cost: {od: 10, om: 10} }] },
    { name: 'Ир Эйн', passiveBonuses: ['+2 ОМ/ход в группе'], activeAbilities: [{ name: 'Пивной рев', description: 'деморализация врага (-ОД)', cost: {od: 10} }] },
    { name: 'Ихо', passiveBonuses: ['+2 ОМ/ход'], activeAbilities: [{ name: 'Лозунг крови', description: '+10 ОМ союзникам рядом', cost: {om: 10} }] },
    { name: 'Карлики', passiveBonuses: ['+5 к броне'], activeAbilities: [{ name: 'Молот правды', description: 'пробивает щит и наносит 15 урона', cost: {od: 30} }] },
    { name: 'Кентавры', passiveBonuses: ['+15 ОД в поле', 'Скидка на ОД (5)'], activeAbilities: [{ name: 'Копытный разгон', description: 'нанести урон и отступить', cost: {od: 20} }] },
    { name: 'Кицунэ', passiveBonuses: ['+2 ОМ за каждые 3 хвоста'], activeAbilities: [{ name: 'Иллюзия хвостов', description: 'дезориентация врага', cost: {om: 30} }] },
    { name: 'Коралиты', passiveBonuses: ['+10 к сопротивлению'], activeAbilities: [{ name: 'Всплеск солёной воды', description: 'обезоруживает на 1 ход', cost: {om: 10} }] },
    { name: 'Кордеи', passiveBonuses: ['+10 ОЗ в лесной местности'], activeAbilities: [{ name: 'Пылающая кровь', description: '-10 ОЗ врагу при атаке в ближнем бою', cost: {oz: 5} }] },
    { name: 'Кунари', passiveBonuses: ['Штраф к заклинаниям опустошения резерва (20 ОМ)'], activeAbilities: [{ name: 'Зов леса', description: '+10 ОЗ всей группе', cost: {om: 30} }] },
    { name: 'Ларимы', passiveBonuses: ['Поглощение входящего магического урона'], activeAbilities: [{ name: 'Укус', description: '-15 ОЗ, игнорирует щит', cost: {od: 20} }] },
    { name: 'Лартисты', passiveBonuses: ['+10 ОМ при удаче'], activeAbilities: [{ name: 'Мир красок', description: 'вводит врага в иллюзию (-действие)', cost: {om: 30} }] },
    { name: 'Лепреконы', passiveBonuses: ['+10 ОЗ/ход'], activeAbilities: [{ name: 'Клеверная искра', description: '+15 ОЗ и +10 ОМ (1 раз в бой)', cost: {om: 10} }] },
    { name: 'Миканиды', passiveBonuses: ['-5 ОД у врага при предсказании действий'], activeAbilities: [{ name: 'Споры восстановления', description: '+10 ОЗ всем в зоне 5м', cost: {om: 30} }] },
    { name: 'Мириоды', passiveBonuses: ['+5 ОЗ/ОМ союзнику рядом'], activeAbilities: [{ name: 'Кислотное дыхание', description: '-10 ОЗ, игнорирует броню', cost: {om: 10} }] },
    { name: 'Нарраторы', passiveBonuses: ['+10 ОМ при заклинаниях воды'], activeAbilities: [{ name: 'Печать Слова', description: 'враг не может повторить последнее заклинание', cost: {om: 30} }] },
    { name: 'Неземные', passiveBonuses: ['+10 ОЗ, сниженный урон от физических атак'], activeAbilities: [{ name: 'Ментальное прикосновение', description: 'восстановление +15 ОЗ', cost: {om: 10} }] },
    { name: 'Неониды', passiveBonuses: ['+10 ОЗ и ОД в звероформе'], activeAbilities: [{ name: 'Фосфоресцирующий всплеск', description: 'ослепление врагов', cost: {om: 10} }] },
    { name: 'Нетленные', passiveBonuses: ['+5 урона огнём'], activeAbilities: [{ name: 'Желеобразный барьер', description: 'поглощает 15 урона', cost: {om: 30} }] },
    { name: 'Нимфилус', passiveBonuses: ['+10 ОМ, возможен удар током'], activeAbilities: [{ name: 'Сладкое прикосновение', description: '+10 ОЗ и -ОД врагу', cost: {om: 10} }] },
    { name: 'Оборотни', passiveBonuses: ['Иммунитет к иллюзиям', 'Скидка на ОД (5)'], activeAbilities: [{ name: 'Смена формы', description: 'звериный облик, бонусы к урону', cost: {om: 90} }] },
    { name: 'Огненные крыланы', passiveBonuses: ['-5 ОД у врага рядом'], activeAbilities: [{ name: 'Крылья Пламени', description: 'атака по всем врагам в зоне', cost: {om: 30} }] },
    { name: 'Оприты', passiveBonuses: ['-8 ОЗ/ход врагу и себе'], activeAbilities: [{ name: 'Разряд', description: '-10 ОЗ и -5 ОМ врагу', cost: {om: 10} }] },
    { name: 'Пересмешники', passiveBonuses: ['-5 ОД у врага'], activeAbilities: [{ name: 'Имитация', description: 'доступны все бонусные действия других рас', cost: {om: 90} }] },
    { name: 'Полукоты', passiveBonuses: ['Окаменяющий взгляд при атаке', 'Скидка на ОД (5)'], activeAbilities: [{ name: 'Мурлыканье', description: 'усыпляет врага на 1 ход', cost: {om: 30} }] },
    { name: 'Полузаи', passiveBonuses: ['+5 урона огнём, иммунитет к огню'], activeAbilities: [{ name: 'Прыжок Зайца', description: 'уворот + перемещение', cost: {od: 15} }] },
    { name: 'Проклятые', passiveBonuses: ['+5 ОМ при светлых заклинаниях'], activeAbilities: [{ name: 'Извержение Скверны', description: 'массовый урон по всем', cost: {om: 90, oz: 50} }] },
    { name: 'Псилаты', passiveBonuses: ['-5 ОД у врага рядом'], activeAbilities: [{ name: 'Психошок', description: 'спутанность действий врага', cost: {om: 30} }] },
    { name: 'Рариты', passiveBonuses: ['+10 ОЗ/ход'], activeAbilities: [{ name: 'Каменное касание', description: '-15 ОЗ, шанс паралича', cost: {om: 10} }] },
    { name: 'Саламандры', passiveBonuses: ['+5 урона льдом, иммунитет к холоду'], activeAbilities: [{ name: 'Пламенный след', description: '-10 ОЗ всем на клетке', cost: {om: 10} }] },
    { name: 'Светоликие', passiveBonuses: ['+10 ОЗ при дневном свете'], activeAbilities: [{ name: 'Вспышка Света', description: 'ослепление врагов', cost: {om: 30} }] },
    { name: 'Сирены', passiveBonuses: ['+10 ОЗ/щит'], activeAbilities: [{ name: 'Песнь чар', description: 'транс на 1 ход', cost: {om: 30} }] },
    { name: 'Слизни', passiveBonuses: ['Иммунитет к контролю', 'Штраф к отравлению (3)'], activeAbilities: [{ name: 'Склизкий отпор', description: 'враг соскальзывает, теряет действие', cost: {om: 10} }] },
    { name: 'Снежные эльфы', passiveBonuses: ['-5 урона по себе'], activeAbilities: [{ name: 'Ледяной вихрь', description: '-15 ОЗ, замедление', cost: {om: 30} }] },
    { name: 'Солнечные эльфы', passiveBonuses: ['-10 ОЗ/2 хода врагу при укусе'], activeAbilities: [{ name: 'Луч истины', description: 'раскрытие маскировки, урон светом', cost: {om: 10} }] },
    { name: 'Сфинксы', passiveBonuses: ['Незаметность'], activeAbilities: [{ name: 'Загадка Сфинкса', description: '-20 ОЗ', cost: {om: 30} }] },
    { name: 'Тальены', passiveBonuses: ['+10 ОМ, -5 ОЗ/ход'], activeAbilities: [{ name: 'Психостенка', description: 'отражение дебаффов', cost: {om: 30} }] },
    { name: 'Тени', passiveBonuses: ['-5 ОД у врагов рядом'], activeAbilities: [{ name: 'Теневой шаг', description: 'перемещение без траты ОД', cost: {om: 10} }] },
    { name: 'Тритоны', passiveBonuses: ['-8 ОЗ при укусе'], activeAbilities: [{ name: 'Призыв боли', description: 'враг теряет 10 ОЗ/ход 3 хода', cost: {om: 30} }] },
    { name: 'Хамелеоны', passiveBonuses: ['Иммунитет к боли и страху'], activeAbilities: [{ name: 'Маскировка', description: '+50% уворота на 1 ход', cost: {om: 30} }] },
    { name: 'Химеры', passiveBonuses: ['Игнорируют физ. урон'], activeAbilities: [{ name: 'Мутация', description: 'временно копирует черты другой расы', cost: {om: 90} }] },
    { name: 'Цынаре', passiveBonuses: ['Сопротивление к колющему и режущему'], activeAbilities: [{ name: 'Гипноз', description: 'враг теряет ход', cost: {om: 90} }] },
    { name: 'Энергетические вампиры', passiveBonuses: ['Иммунитет к ко всем действиям'], activeAbilities: [{ name: 'Похищение энергии', description: '+10 ОМ, -10 ОМ у врага', cost: {om: 10} }] },
    { name: 'Ятанаги', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Кровавое жжение', description: 'вызывает зуд, -5 ОД и -5 ОЗ', cost: {oz: 5, od: 5} }] },
    { name: 'Куклы', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону', 'Штраф к заклинаниям опустошения резерва (20 ОМ)'], activeAbilities: [{ name: 'Прокол иглой', description: 'переносит эффект на другого', cost: {om: 90} }] },
    { name: 'Призраки', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Призрачный вой', description: 'враг теряет 1 действие', cost: {om: 30} }] },
    { name: 'Скелеты', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Костяной шквал', description: 'массовый урон в ближнем бою', cost: {od: 30} }] },
    { name: 'Жнецы', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Коса конца', description: 'мгновенно снимает все очки ОЗ', cost: {om: 90} }] },
    { name: 'Духи', passiveBonuses: ['Недоступны для физического взаимодействия, невосприимчивы к боли и смертельному урону'], activeAbilities: [{ name: 'Эфирный крик', description: '-10 ОМ врагу, при наличии духовной связи', cost: {om: 30} }] },
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

export const ELEMENTS: Record<string, Element> = {
    'Огонь': { name: 'Огонь', weakTo: ['Вода', 'Лёд', 'Кровь'], strongAgainst: ['Растения', 'Металл', 'Лёд'] },
    'Вода': { name: 'Вода', weakTo: ['Земля', 'Металл'], strongAgainst: ['Огонь', 'Кровь'] },
    'Лёд': { name: 'Лёд', weakTo: ['Лава', 'Свет'], strongAgainst: ['Огонь', 'Земля'] },
    'Земля': { name: 'Земля', weakTo: ['Воздух', 'Звук'], strongAgainst: ['Молния', 'Кровь'] },
    'Воздух': { name: 'Воздух', weakTo: ['Камень', 'Звук'], strongAgainst: ['Земля', 'Пыль'] },
    'Молния': { name: 'Молния', weakTo: ['Земля'], strongAgainst: ['Вода', 'Эфир'] },
    'Свет': { name: 'Свет', weakTo: ['Тьма', 'Кровь'], strongAgainst: ['Смерть', 'Проклятья'] },
    'Тьма': { name: 'Тьма', weakTo: ['Свет', 'Жизнь'], strongAgainst: ['Энергия', 'Ментал'] },
    'Жизнь': { name: 'Жизнь', weakTo: ['Смерть'], strongAgainst: ['Проклятия', 'Яды'] },
    'Смерть': { name: 'Смерть', weakTo: ['Жизнь', 'Свет'], strongAgainst: ['Живые', 'Лёгкие ткани'] },
    'Растения': { name: 'Растения', weakTo: ['Огонь', 'Лава'], strongAgainst: ['Земля', 'Вода'] },
    'Лава': { name: 'Лава', weakTo: ['Воздух'], strongAgainst: ['Лёд', 'Металл', 'Растения'] },
    'Звук': { name: 'Звук', weakTo: ['Металл', 'Эфир'], strongAgainst: ['Молния', 'Воздух'] },
    'Кровь': { name: 'Кровь', weakTo: ['Свет', 'Жизнь'], strongAgainst: ['Живые цели'] },
    'Металл': { name: 'Металл', weakTo: ['Огонь'], strongAgainst: ['Земля'] },
    'Эфир': { name: 'Эфир', weakTo: [], strongAgainst: [] }, // Нейтральная
    'Божественная': { name: 'Божественная', weakTo: [], strongAgainst: [] }, // Вне круга
};


export const RULES = {
  STARTING_OZ: 500,
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

    
