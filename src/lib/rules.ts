
import type { ReserveLevel, FaithLevel, ActionType, Race, RaceAbility, PrayerEffectType, Element, CharacterStats } from "@/types/duel";

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
    { name: 'Алахоры', passiveBonuses: ['Беззвучие', 'Гибкость (-5 физ. урон)'], activeAbilities: [{ name: 'Железный ёж', description: 'Поглощает урон от след. заклинания и дает физ. щит.', cost: {om: 30} }] },
    { name: 'Алариены', passiveBonuses: ['Меткость (+10 урон)'], activeAbilities: [{ name: 'Дождь из осколков', description: 'Наносит 40 урона.', cost: {om: 30} }] },
    { name: 'Амфибии', passiveBonuses: ['Аморфное тело (-10 урон)', '+5 ОЗ/ход'], activeAbilities: [{ name: 'Водяной захват', description: 'Лишает врага одного действия.', cost: {om: 30} }] },
    { name: 'Антаресы', passiveBonuses: ['+10 ОЗ/ход', 'Проницательность (-5 урон)'], activeAbilities: [{ name: 'Самоисцеление', description: 'Восстанавливает +50 ОЗ.', cost: {om: 30} }] },
    { name: 'Антропоморфы', passiveBonuses: ['Животная реакция (скидка 5 ОД)', '-10 урон от звука'], activeAbilities: [{ name: 'Ипостась зверя', description: 'Наносит 40 урона.', cost: {om: 30} }] },
    { name: 'Арахнии', passiveBonuses: ['Ловкие конечности (скидка 5 ОД)', 'Иммунитет к замедлению'], activeAbilities: [{ name: 'Паутина', description: 'Лишает врага 1 действия и наносит 20 урона.', cost: {om: 30} }] },
    { name: 'Арахниды', passiveBonuses: ['Экзоскелет (-10 урон)', 'Шестиглазое зрение (-5 физ. урон)'], activeAbilities: [{ name: 'Жало-хищника', description: 'Наносит 50 урона.', cost: {om: 30} }] },
    { name: 'Аспиды', passiveBonuses: ['Иммунитет к яду', 'Изворотливость (-10 урон)'], activeAbilities: [{ name: 'Окаменяющий взгляд', description: 'Лишает врага одного действия.', cost: {om: 30} }] },
    { name: 'Астролоиды', passiveBonuses: ['+10 ОМ/ход', 'Понимание звёзд (-5 урон от света/эфира)'], activeAbilities: [{ name: 'Метеорит', description: 'Наносит 60 урона.', cooldown: 3, cost: {om: 40}} ] },
    { name: 'Бабочки', passiveBonuses: ['+3 исцеления/ход'], activeAbilities: [{name: 'Танец лепестков', description: '+10 ОЗ', cost: {om: 10}}] },
    { name: 'Безликие', passiveBonuses: ['Отзеркаливание урона'], activeAbilities: [] },
    { name: 'Белояры', passiveBonuses: ['+5 к физической атаке'], activeAbilities: [{ name: 'Пронзающий удар', description: '+20 ОЗ физурона', cost: {od: 30} }] },
    { name: 'Бракованные пересмешники', passiveBonuses: ['+4 к урону/исцелению (описательно)'], activeAbilities: [{ name: 'Песня влюблённого', description: '-10 ОЗ врагу, +10 ОЗ себе', cost: {om: 30} }] },
    { name: 'Вампиры', passiveBonuses: ['+3 к восстановлению ОМ при укусе'], activeAbilities: [{ name: 'Укус', description: '-10 ОЗ врагу', cost: {od: 10} }] },
    { name: 'Вансаэльцы', passiveBonuses: ['+5 ОМ (описательно)'], activeAbilities: [{ name: 'Обратиться к духам', description: 'призыв духа-хранителя', cost: {om: 90} }] },
    { name: 'Василиски', passiveBonuses: ['Укус (+10 ОЗ)'], activeAbilities: [{ name: 'Окаменение взглядом', description: 'враг теряет ход', cooldown: 5, cost: {om: 90} }, { name: 'Укус', description: 'Наносит 10 урона', cost: { od: 15 } }] },
    { name: 'Веспы', passiveBonuses: ['-1 ОД у врага/ход'], activeAbilities: [{ name: 'Вспышка зрения', description: 'ослепление на 1 ход', cost: {om: 10} }] },
    { name: 'Вулгары', passiveBonuses: ['Иммунитет к болезням', '+10 ОЗ/ход'], activeAbilities: [{ name: 'Удар подавления', description: 'снижает ОМ врага на 15', cost: {om: 10} }] },
    { name: 'Гуриты', passiveBonuses: [], activeAbilities: [{ name: 'Обволакивающая слизь', description: 'замедление врага', cost: {om: 10} }] },
    { name: 'Дарнатиаре', passiveBonuses: ['+2 исцеления/ход'], activeAbilities: [{ name: 'Целительный ветер', description: '+15 ОЗ', cost: {om: 30} }] },
    { name: 'Джакали', passiveBonuses: ['+10 ОМ/ОЗ при ритуалах'], activeAbilities: [{ name: 'Благословение крови', description: '+20 ОЗ при молитве', cost: {om: 30} }] },
    { name: 'Джинны', passiveBonuses: ['+3 к случайной характеристике (описательно)'], activeAbilities: [{ name: 'Элементальная вспышка', description: 'случайный урон 15-25', cost: {om: 30} }] },
    { name: 'Домовые', passiveBonuses: ['+10 ОЗ/ход при ОЗ < 50'], activeAbilities: [{ name: 'Забота дома', description: '+15 ОЗ и снятие одного эффекта', cost: {om: 30} }] },
    { name: 'Драконы', passiveBonuses: ['+50 ОЗ', '+5 урона магией', '+10 ОМ/ход'], activeAbilities: [{ name: 'Драконий выдох', description: '-20 ОЗ врагу огнём, накладывает Горение (2)', cost: {om: 30} }] },
    { name: 'Дриады', passiveBonuses: ['+3 исцеления/ход'], activeAbilities: [{ name: 'Корнеплетение', description: 'обездвиживание врага на 1 ход', cooldown: 4, cost: {om: 30} }] },
    { name: 'Дриды', passiveBonuses: ['+2 ОЗ/ход'], activeAbilities: [{ name: 'Цветочный нектар', description: '+10 ОЗ и +5 ОМ', cost: {om: 10} }] },
    { name: 'Дроу', passiveBonuses: ['Скидка к урону от яда (3)', '+4 урона/ход'], activeAbilities: [{ name: 'Теневая стрела', description: '-15 ОЗ', cost: {om: 10} }] },
    { name: 'Инсектоиды', passiveBonuses: ['Шанс отравить врага (описательно)'], activeAbilities: [{ name: 'Кислотный укус', description: '-10 ОЗ и яд -3/ход', cost: {od: 10, om: 10} }] },
    { name: 'Ир Эйн', passiveBonuses: ['+2 ОМ/ход'], activeAbilities: [{ name: 'Пивной рев', description: 'деморализация врага (-ОД)', cost: {od: 10} }] },
    { name: 'Ихо', passiveBonuses: ['+2 ОМ/ход'], activeAbilities: [{ name: 'Лозунг крови', description: '+10 ОМ', cost: {om: 10} }] },
    { name: 'Карлики', passiveBonuses: ['+5 к броне (описательно)'], activeAbilities: [{ name: 'Молот правды', description: 'пробивает щит и наносит 15 урона', cost: {od: 30} }] },
    { name: 'Кентавры', passiveBonuses: ['Скидка на ОД (15)'], activeAbilities: [{ name: 'Копытный разгон', description: 'нанести урон и отступить', cost: {od: 20} }] },
    { name: 'Кицунэ', passiveBonuses: ['+2 ОМ за каждые 3 хвоста (описательно)'], activeAbilities: [{ name: 'Иллюзия хвостов', description: 'дезориентация врага', cost: {om: 30} }] },
    { name: 'Коралиты', passiveBonuses: [], activeAbilities: [{ name: 'Всплеск солёной воды', description: 'обезоруживает на 1 ход', cost: {om: 10} }] },
    { name: 'Кордеи', passiveBonuses: ['+50 ОЗ', '+10 к сопротивлению (описательно)'], activeAbilities: [{ name: 'Пылающая кровь', description: '-10 ОЗ врагу при атаке в ближнем бою', cost: {oz: 5} }] },
    { name: 'Кунари', passiveBonuses: ['Штраф к заклинаниям опустошения резерва (20 ОМ)', 'Начальный штраф к ОД (-5)', '+10 ОЗ/ход'], activeAbilities: [{ name: 'Зов леса', description: '+10 ОЗ', cost: {om: 30} }] },
    { name: 'Ларимы', passiveBonuses: ['+50 ОЗ', 'Поглощение входящего магического урона'], activeAbilities: [{ name: 'Укус', description: '-15 ОЗ, игнорирует щит', cost: {od: 20} }] },
    { name: 'Лартисты', passiveBonuses: ['-5 ОД у врага (постоянно)'], activeAbilities: [{ name: 'Мир красок', description: 'вводит врага в иллюзию (-действие)', cost: {om: 30} }] },
    { name: 'Лепреконы', passiveBonuses: ['+10 ОМ/ход'], activeAbilities: [{ name: 'Клеверная искра', description: '+15 ОЗ и +10 ОМ (1 раз в бой)', cost: {om: 10} }] },
    { name: 'Миканиды', passiveBonuses: ['+10 ОЗ/ход'], activeAbilities: [{ name: 'Споры восстановления', description: '+10 ОЗ', cost: {om: 30} }] },
    { name: 'Мириоды', passiveBonuses: [], activeAbilities: [{ name: 'Кислотное дыхание', description: '-10 ОЗ, игнорирует броню', cost: {om: 10} }] },
    { name: 'Нарраторы', passiveBonuses: ['-5 ОД у врага/ход'], activeAbilities: [{ name: 'Печать Слова', description: 'враг не может повторить последнее заклинание', cost: {om: 30} }] },
    { name: 'Неземные', passiveBonuses: ['+5 ОЗ/ОМ в ход'], activeAbilities: [{ name: 'Ментальное прикосновение', description: 'восстановление +15 ОЗ', cost: {om: 10} }] },
    { name: 'Неониды', passiveBonuses: ['+10 ОМ/ход'], activeAbilities: [{ name: 'Фосфоресцирующий всплеск', description: 'ослепление врагов', cost: {om: 10} }] },
    { name: 'Нетленные', passiveBonuses: ['+50 ОЗ', '+10 ОЗ/ход', 'Сниженный физ. урон (описательно)'], activeAbilities: [{ name: 'Желеобразный барьер', description: 'поглощает 15 урона', cost: {om: 30} }] },
    { name: 'Нимфилус', passiveBonuses: [], activeAbilities: [{ name: 'Сладкое прикосновение', description: '+10 ОЗ и -ОД врагу', cost: {om: 10} }] },
    { name: 'Оборотни', passiveBonuses: ['+10 ОЗ/ход', 'Скидка на ОД (10)'], activeAbilities: [{ name: 'Смена формы', description: 'звериный облик, бонусы к урону', cost: {om: 90} }] },
    { name: 'Огненные крыланы', passiveBonuses: ['+5 урона огнём', 'Иммунитет к огню'], activeAbilities: [{ name: 'Крылья Пламени', description: 'атака по всем врагам в зоне', cost: {om: 30} }] },
    { name: 'Оприты', passiveBonuses: ['+10 ОМ/ход'], activeAbilities: [{ name: 'Разряд', description: '-10 ОЗ и -5 ОМ врагу', cost: {om: 10} }] },
    { name: 'Орк', passiveBonuses: ['Расовая ярость (+10 к урону)'], activeAbilities: [] },
    { name: 'Пересмешники', passiveBonuses: ['Иммунитет к иллюзиям'], activeAbilities: [{ name: 'Имитация', description: 'доступны все бонусные действия других рас', cost: {om: 90} }] },
    { name: 'Полукоты', passiveBonuses: ['Скидка на ОД (5)'], activeAbilities: [{ name: 'Мурлыканье', description: 'усыпление врага на 1 ход', cost: {om: 30} }] },
    { name: 'Полузаи', passiveBonuses: [], activeAbilities: [{ name: 'Прыжок Зайца', description: 'уворот + перемещение', cost: {od: 15} }] },
    { name: 'Проклятые', passiveBonuses: ['-8 ОЗ/ход врагу и себе'], activeAbilities: [{ name: 'Извержение Скверны', description: 'массовый урон по всем', cost: {om: 90, oz: 50} }] },
    { name: 'Псилаты', passiveBonuses: ['-5 ОД у врага/ход'], activeAbilities: [{ name: 'Психошок', description: 'спутанность действий врага', cost: {om: 30} }] },
    { name: 'Рариты', passiveBonuses: ['Окаменяющий взгляд при атаке (описательно)'], activeAbilities: [{ name: 'Каменное касание', description: '-15 ОЗ, шанс паралича', cost: {om: 10} }] },
    { name: 'Саламандры', passiveBonuses: ['+5 урона огнём', 'Иммунитет к огню'], activeAbilities: [{ name: 'Пламенный след', description: '-10 ОЗ всем на клетке', cost: {om: 10} }] },
    { name: 'Светоликие', passiveBonuses: ['+5 ОМ/ход'], activeAbilities: [{ name: 'Вспышка Света', description: 'ослепление врагов', cost: {om: 30} }] },
    { name: 'Сирены', passiveBonuses: ['-5 ОД у врага/ход'], activeAbilities: [{ name: 'Песнь чар', description: 'транс на 1 ход', cost: {om: 30} }] },
    { name: 'Слизни', passiveBonuses: ['+10 ОЗ/ход', 'Штраф к отравлению (3)'], activeAbilities: [{ name: 'Склизкий отпор', description: 'враг соскальзывает, теряет действие', cost: {om: 10} }] },
    { name: 'Снежные эльфы', passiveBonuses: ['+5 урона льдом', 'Иммунитет к льду'], activeAbilities: [{ name: 'Ледяной вихрь', description: '-15 ОЗ, замедление', cost: {om: 30} }] },
    { name: 'Солнечные эльфы', passiveBonuses: ['+10 ОЗ/ход'], activeAbilities: [{ name: 'Луч истины', description: 'раскрытие маскировки, урон светом 15', cost: {om: 10} }] },
    { name: 'Сфинксы', passiveBonuses: ['+10 ОЗ/щит'], activeAbilities: [{ name: 'Загадка Сфинкса', description: '-20 ОЗ', cost: {om: 30} }] },
    { name: 'Тальены', passiveBonuses: [], activeAbilities: [{ name: 'Психостенка', description: 'отражение дебаффов', cost: {om: 30} }] },
    { name: 'Тени', passiveBonuses: ['-5 урона по себе'], activeAbilities: [{ name: 'Теневой шаг', description: 'перемещение без траты ОД', cost: {om: 10} }] },
    { name: 'Тритоны', passiveBonuses: ['При попадании: Накладывает кровотечение (2)'], activeAbilities: [{ name: 'Призыв боли', description: '-10 ОЗ/ход в течение 3 ходов', cost: {om: 30} }] },
    { name: 'Человек', passiveBonuses: [], activeAbilities: [] },
    { name: 'Хамелеоны', passiveBonuses: ['Незаметность (описательно)'], activeAbilities: [{ name: 'Маскировка', description: '+50% уворота на 1 ход', cost: {om: 30} }] },
    { name: 'Химеры', passiveBonuses: [], activeAbilities: [{ name: 'Мутация', description: 'временно копирует черты другой расы', cost: {om: 90} }] },
    { name: 'Цынаре', passiveBonuses: ['+10 ОМ/ход', '-5 ОЗ/ход'], activeAbilities: [{ name: 'Гипноз', description: 'враг теряет ход', cooldown: 5, cost: {om: 90} }] },
    { name: 'Энергетические вампиры', passiveBonuses: ['-5 ОД у врага/ход'], activeAbilities: [{ name: 'Похищение энергии', description: '+10 ОМ, -10 ОМ у врага', cooldown: 2, cost: {om: 10} }] },
    { name: 'Ятанаги', passiveBonuses: ['-8 ОЗ при укусе (описательно)'], activeAbilities: [{ name: 'Кровавое жжение', description: '-5 ОЗ и -5 ОД, вызывает зуд', cost: {oz: 5, od: 5} }] },
    { name: 'Куклы', passiveBonuses: ['Иммунитет к боли и страху', 'Штраф к заклинаниям опустошения резерва (20 ОМ)'], activeAbilities: [{ name: 'Прокол иглой', description: 'переносит эффект на другого', cost: {om: 90} }] },
    { name: 'Призраки', passiveBonuses: ['Игнорируют физический урон', 'Невосприимчивы к боли и смерти'], activeAbilities: [{ name: 'Призрачный вой', description: 'враг теряет 1 действие', cost: {om: 30} }] },
    { name: 'Скелеты', passiveBonuses: ['+50 ОЗ', 'Сопротивление колющему и режущему', 'Невосприимчивы к боли и смерти'], activeAbilities: [{ name: 'Костяной шквал', description: 'массовый урон в ближнем бою', cost: {od: 30} }] },
    { name: 'Жнецы', passiveBonuses: ['+50 ОЗ', 'Иммунитет ко всем действиям', 'Невосприимчивы к боли и смерти'], activeAbilities: [{ name: 'Коса конца', description: 'мгновенно снимает все очки ОЗ', cost: {om: 90} }] },
    { name: 'Духи', passiveBonuses: ['Недоступны для физ. атак', 'Невосприимчивы к боли и смерти'], activeAbilities: [{ name: 'Эфирный крик', description: '-10 ОМ врагу', cost: {om: 30} }] },
];

export const getOmFromReserve = (reserve: ReserveLevel): number => RESERVE_LEVELS[reserve] || 90;
export const getFaithLevelFromString = (faith: FaithLevel): number => FAITH_LEVELS[faith] || 0;

export const calculateMaxOz = (bonuses: string[]): number => {
    let maxOz = RULES.STARTING_OZ;
    bonuses.forEach(bonus => {
        const ozMatch = bonus.match(/\+(\d+) ОЗ/);
        if (ozMatch) {
            maxOz += parseInt(ozMatch[1], 10);
        }
    });
    return maxOz;
};

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

  let label = labels[type] || type;

  if ((type.includes('spell') || type === 'shield') && payload?.element && payload.element !== 'physical') {
    label += ` (${payload.element})`;
  }

  if (type === 'prayer' && payload?.effect) {
    return `${labels.prayer}: ${prayerEffectLabels[payload.effect]}`;
  }
  if (type === 'racial_ability' && payload?.name) {
    return `${labels.racial_ability}: ${payload.name}`;
  }
  return label;
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
    'Эфир': { name: 'Эфир', weakTo: [], strongAgainst: [] }, // Нейтральная
    'Божественная': { name: 'Божественная', weakTo: [], strongAgainst: [] }, // Вне круга
};


export const RULES = {
  STARTING_OZ: 250,
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
    strongSpell: 2,
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

  POISON_EFFECTS: ['Отравление', 'Отравление (3)', 'Отравление (2)', 'Отравление (1)'],
  DOT_EFFECTS: ['Отравление', 'Горение', 'Ожог', 'Кровотечение', 'Отравление (3)', 'Отравление (2)', 'Отравление (1)', 'Горение (2)', 'Горение (1)', 'Кровотечение (2)'],
  DOT_DAMAGE: 8,

  OD_REGEN_ON_REST: 50,
  OM_REGEN_ON_REST: 15,
  
  BASE_SHIELD_VALUE: 25,
  
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
  ELEMENTAL_VULNERABILITY_MULTIPLIER: 2,
};

export const PENALTY_EFFECTS: string[] = [
    'Под гипнозом (1)',
    'Обездвижен (1)',
    'Транс (1)',
    'Усыпление (1)',
    'Окаменение (1)',
    'Ослепление (1)',
    'Отравление (3)',
    'Горение (2)',
    'Кровотечение (2)',
    'Уязвимость',
    'Штраф к отравлению (3)',
];

export const initialPlayerStats = (id: string, name: string): CharacterStats => {
    const race = RACES.find(r => r.name === 'Человек') || RACES[0];
    const reserve = 'Неофит';
    const maxOm = getOmFromReserve(reserve);
    const bonuses = [...race.passiveBonuses];
    const maxOz = calculateMaxOz(bonuses);

    return {
        id,
        name,
        race: race.name,
        reserve,
        elementalKnowledge: [],
        faithLevel: 0,
        faithLevelName: 'Равнодушие',
        physicalCondition: 'В полном здравии',
        bonuses,
        penalties: [],
        inventory: [],
        oz: maxOz,
        maxOz: maxOz,
        om: maxOm,
        maxOm,
        od: 100,
        maxOd: 100,
        shield: { hp: 0, element: null },
        isDodging: false,
        cooldowns: { strongSpell: 0, item: 0, prayer: 0 },
        isSetupComplete: false,
    };
};
