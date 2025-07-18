

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
    { name: 'Алахоры', passiveBonuses: ['Беззвучие (противник теряет 5 ОМ)', 'Гибкость (-5 физ. урон)'], activeAbilities: [{ name: 'Железный ёж', description: 'Поглощает урон от след. заклинания и дает физ. щит.', cost: {om: 30} }] },
    { name: 'Алариены', passiveBonuses: ['Меткость— + 10 к урону'], activeAbilities: [{ name: 'Дождь из осколков', description: 'Наносит 40 урона.', cost: {om: 30} }] },
    { name: 'Амфибии', passiveBonuses: ['Аморфное тело (-10 урон)', 'Глубинная стойкость (+5 ОЗ/ход)'], activeAbilities: [{ name: 'Водяной захват', description: 'Лишает врага одного действия.', cost: {om: 30} }] },
    { name: 'Антаресы', passiveBonuses: ['Исцеление (+10 ОЗ/ход)', 'Проницательность (-5 урон)'], activeAbilities: [{ name: 'Самоисцеление', description: 'Восстанавливает +50 ОЗ.', cost: {om: 30} }] },
    { name: 'Антропоморфы', passiveBonuses: ['Животная реакция (-5 ОД)', 'Слух обострён (-10 урона от звуковых атак)'], activeAbilities: [{ name: 'Ипостась зверя', description: 'Наносит 40 урона.', cost: {om: 30} }] },
    { name: 'Арахнии', passiveBonuses: ['Ловкие конечности (-5 ОД)', 'Иммунитет к паутине'], activeAbilities: [{ name: 'Паутина', description: 'Лишает врага 1 действия и наносит 20 урона.', cost: {om: 30} }] },
    { name: 'Арахниды', passiveBonuses: ['Экзоскелет (-10 урон)', 'Шестиглазое зрение (-5 физ. урон)'], activeAbilities: [{ name: 'Жало-хищника', description: 'Наносит 50 урона.', cost: {om: 30} }] },
    { name: 'Аспиды', passiveBonuses: ['Иммунитет к яду', 'Изворотливость (-10 урон)'], activeAbilities: [{ name: 'Окаменяющий взгляд', description: 'Лишает врага одного действия.', cost: {om: 30} }] },
    { name: 'Астролоиды', passiveBonuses: ['Звёздный резонанс (+10 ОМ/ход)', 'Понимание звёзд (-5 урон от света/эфира)'], activeAbilities: [{ name: 'Метеорит', description: 'Наносит 60 урона.', cooldown: 3, cost: {om: 40}} ] },
    { name: 'Бабочки', passiveBonuses: ['Иллюзорное движение (-10 урона от первой атаки в каждом ходе)'], activeAbilities: [{ name: 'Трепет крыльев', description: 'Лишает врага одного действия и наносит 10 урона.', cost: {om: 30}}] },
    { name: 'Безликие', passiveBonuses: ['Отзеркаливание урона'], activeAbilities: [] },
    { name: 'Белояры', passiveBonuses: ['Стойкость гиганта (-10 урон)', 'Воинская слава (+10 урона при контратаке)'], activeAbilities: [{ name: 'Удар предков', description: 'Наносит 60 урона.', cost: {om: 40} }] },
    { name: 'Бракованные пересмешники', passiveBonuses: ['Разрыв личности (-5 урон)', 'Облик желания (-5 урон)'], activeAbilities: [{ name: 'Зеркальная любовь', description: 'Лишает врага одного действия и наносит 20 урона.', cost: {om: 30} }] },
    { name: 'Вампиры', passiveBonuses: ['Кровавое могущество (+10 урона, если ОЗ врага меньше 100)', 'Регенерация (+5 ОЗ каждый второй ход)'], activeAbilities: [{ name: 'Укус', description: 'Наносит 40 урона и восстанавливает +20 ОЗ.', cost: {od: 30, om: 30} }] },
    { name: 'Вансаэльцы', passiveBonuses: ['Истинное благородство (-5 урона от любых способностей, если ОЗ выше 150)', 'Этикет крови (+1 ОМ/ход)'], activeAbilities: [{ name: 'Приказ крови', description: 'Наносит 30 урона.', cost: {om: 20} }] },
    { name: 'Василиски', passiveBonuses: ['Иммунитет к яду', 'Изворотливость (-10 урон)'], activeAbilities: [{ name: 'Окаменяющий взгляд', description: 'Лишает противника одного действия.', cost: {om: 30} }] },
    { name: 'Веспы', passiveBonuses: ['Эхолокация (+10 к урону при первом попадании в дуэли)', 'Удар крыла (+10 к физическим атакам)'], activeAbilities: [{ name: 'Теневой прорыв', description: 'Наносит 45 урона.', cost: {om: 30} }] },
    { name: 'Вулгары', passiveBonuses: ['Скальная шкура (-10 урона от физических атак)', 'Рёв предков (+5 урона по врагу, если персонаж был атакован в прошлом ходу)'], activeAbilities: [{ name: 'Удар глыбы', description: 'Наносит 60 урона.', cost: { om: 60 } }] },
    { name: 'Гуриты', passiveBonuses: ['Глубокая регенерация (+10 ОЗ/ход)', 'Токсины слизи (наносит эффект отравления)'], activeAbilities: [{ name: 'Щупальца глубин', description: 'Лишают врага 1 действия и наносят 30 урона.', cost: {om: 30} }] },
    { name: 'Дарнатиаре', passiveBonuses: ['Кристальная стабильность (+10 ОМ/ход)', 'Магический резонанс (-5 урона от заклинаний)'], activeAbilities: [{ name: 'Разлом ауры', description: 'Наносит 50 урона.', cost: { om: 30 } }] },
    { name: 'Джакали', passiveBonuses: ['Аура благословения (+5 ОЗ/ход)', 'Чуткий слух (-10 урон от звука/воздуха)'], activeAbilities: [{ name: 'Глас богов', description: 'Наносит 35 урона и восстанавливает +15 ОЗ.', cost: { om: 30 } }] },
    { name: 'Джинны', passiveBonuses: ['Энергетический сосуд (+10 ОМ каждый второй ход)', 'Иллюзии плоти (-10 урона от первой атаки в дуэли)'], activeAbilities: [{ name: 'Исполнение желания', description: 'Наносит 50 урона.', cost: { om: 30 } }] },
    { name: 'Домовые', passiveBonuses: ['Сила очага (+10 ОЗ/ход без урона)', 'Щепетильный нюх (-5 урона от яда)'], activeAbilities: [{ name: 'Очистка', description: 'Снимает все негативные эффекты и восстанавливает +30 ОЗ.', cost: { om: 30 } }] },
    { name: 'Драконы', passiveBonuses: ['Чешуя предков (-10 урона от всех физических атак)', 'Драконья ярость (+10 урона)'], activeAbilities: [{ name: 'Дыхание стихии', description: 'Наносит 100 урона выбранной стихией.', cost: { om: 40 } }] },
    { name: 'Дриады', passiveBonuses: ['Единение с природой (+10 ОМ/ход)', 'Хрупкость (+10 к получаемому урону от огня и льда)'], activeAbilities: [{ name: 'Удушающее плетение', description: 'Наносит 40 урона и лишает врага одного действия.', cost: { om: 30 } }] },
    { name: 'Дриды', passiveBonuses: ['Лёгкие кости (+5 урона к получаемым физическим атакам)', 'Быстрые мышцы (-5 ОД на действия, связанные с перемещением)'], activeAbilities: [{ name: 'Рывок мотылька', description: 'Наносит 45 урона и восстанавливает 10 ОЗ.', cost: { om: 30 } }] },
    { name: 'Дроу', passiveBonuses: ['Темная выдержка (-10 урона от атак тьмы)', 'Воинская форма (-5 физ. урон)'], activeAbilities: [{ name: 'Лунный кнут', description: 'Наносит 55 урона.', cost: { om: 30 } }] },
    { name: 'Духи', passiveBonuses: ['Слияние со стихией (+5 ОМ/ход)', 'Сопротивление воздействию (-20 урона от стихий)'], activeAbilities: [{ name: 'Эхо мира духов', description: 'Наносит 50 урона эфиром.', cost: { om: 40 } }] },
    { name: 'Друиды', passiveBonuses: ['Друидическая связь (+10 ОМ/ход)', 'Мелодия исцеления (+5 ОЗ/ход)'], activeAbilities: [{ name: 'Песня стихий', description: 'Наносит 45 урона или восстанавливает 45 ОЗ.', cost: { om: 30 } }] },
    { name: 'Инсектоиды', passiveBonuses: ['Живучесть (+5 ОЗ/ход)', 'Насекомая стойкость (-5 физ. урон)'], activeAbilities: [{ name: 'Кислотное жало', description: 'Наносит 50 урона.', cost: { om: 30 } }] },
    { name: 'Ихо', passiveBonuses: ['Вибрация чувств (-5 урон от звука/эфира)', 'Призыв сердца (+10 ОМ каждый третий ход)'], activeAbilities: [{ name: 'Голос рода', description: 'Лишает врага одного действия и наносит 30 урона.', cost: {om: 30} }] },
    { name: 'Карлики', passiveBonuses: ['Земная устойчивость (-10 урона от магических атак врага)', 'Сила кузни (+10 урона к физическим атакам по врагу)'], activeAbilities: [{ name: 'Кузнечный молот', description: 'Наносит 50 урона.', cost: {om: 30} }] },
    { name: 'Кентавры', passiveBonuses: ['Галоп (-5 ОД)'], activeAbilities: [{ name: 'Копыта бури', description: 'Наносит 55 урона.', cost: {om: 30} }] },
    { name: 'Кицунэ', passiveBonuses: ['Иллюзорный обман (-10 урона от магических атак врага)', 'Хвостовой резерв (+10 ОМ каждый четный ход)'], activeAbilities: [{ name: 'Танец девяти хвостов', description: 'Лишает врага одного действия и наносит 35 урона.', cost: {om: 30} }] },
    { name: 'Коралиты', passiveBonuses: ['Венец жизни (-5 урона от атак, если ОЗ выше 150)', 'Предчувствие (+3 ОЗ/ход)'], activeAbilities: [{ name: 'Коралловый плевок', description: 'Наносит 45 урона.', cost: {om: 30} }] },
    { name: 'Кордеи', passiveBonuses: ['Прочная шкура (-5 урона от физических атак)', 'Уязвимость к свету и огню (+10 урона)'], activeAbilities: [{ name: 'Кровавая печать', description: 'Наносит 55 урона.', cost: {om: 30} }] },
    { name: 'Куклы', passiveBonuses: ['Безжизненность (иммунитет к ядам и горению)', 'Абсолютная память (не тратится ОД)'], activeAbilities: [{ name: 'Заряд артефакта', description: 'Наносит 40 урона или восстанавливает 40 ОЗ (рандом).', cost: { om: 30 } }] },
    { name: 'Кунари', passiveBonuses: ['Светлая душа (-10 урона от магии эфира, света и иллюзий)', 'Живая защита (+5 ОЗ/ход)'], activeAbilities: [{ name: 'Природное возрождение', description: 'Восстанавливает +60 ОЗ.', cost: {om: 30} }] },
    { name: 'Лартисты', passiveBonuses: ['Картина боли (+5 урона, если атакует дважды подряд)', 'Цикличность (+5 ОЗ, если персонаж пропускает действие)'], activeAbilities: [{ name: 'Затягивание в полотно', description: 'Блокирует все магические способности.', cost: {om: 30} }] },
    { name: 'Лепреконы', passiveBonuses: ['Иллюзии (противник теряет 10 ОМ)', 'Уворот (-5 урон от всех атак)'], activeAbilities: [{ name: 'Подменный клад', description: 'Скрывается на 1 ход и восстанавливает 40 ОЗ.', cost: {om: 30} }] },
    { name: 'Миканиды', passiveBonuses: ['Грибница (+10 ОЗ/ход)', 'Споры (противник получает -10 урона при следующей атаке)'], activeAbilities: [{ name: 'Споровый взрыв', description: 'Наносит 40 урона и ослабляет врага.', cost: {om: 30} }] },
    { name: 'Мириоды', passiveBonuses: ['Хитиновый покров (-10 урона от физических атак)', 'Боль превращения (+10 урон)'], activeAbilities: [{ name: 'Смертельный рывок', description: 'Наносит 60 урона.', cost: {om: 40} }] },
    { name: 'Нарраторы', passiveBonuses: ['Повесть боли (+10 ОМ)', 'Истинное слово (-5 урона от заклинаний)'], activeAbilities: [{ name: 'Конец главы', description: 'Наносит 50 урона и накладывает Удержание.', cost: {om: 50} }] },
    { name: 'Неземные', passiveBonuses: ['Воздушный рывок (-10 урона от атак ближнего боя)', 'Лёгкость (-5 ОД на уклонение)'], activeAbilities: [{ name: 'Прыжок веры', description: 'Уклонение от след. атаки и +30 ОМ.', cost: {om: 30} }] },
    { name: 'Неониды', passiveBonuses: ['Биосвечение (-5 урон от света/воды)', 'Очищение (+5 ОЗ от яда)'], activeAbilities: [{ name: 'Световой взрыв', description: 'Наносит 40 урона и ослепляет врага.', cost: {om: 30} }] },
    { name: 'Нетленные', passiveBonuses: ['Боль в отдалении (-10 урон)', 'Временной отпечаток (иммунитет к физ. урону)'], activeAbilities: [{ name: 'Откат', description: 'Полностью восстанавливает ОЗ и снимает 1 негативный эффект.', cost: {} }] },
    { name: 'Нимфилус', passiveBonuses: ['Стихийная преданность (+5 урона при атаке своей стихией)', 'Потеря формы (-10 ОЗ при ОМ=0)'], activeAbilities: [{ name: 'Трансформация', description: 'Увеличивает урон следующего действия на +30 и восстанавливает +10 ОМ.', cost: { om: 30 } }] },
    { name: 'Оборотни', passiveBonuses: ['Инстинкт (-10 от этого урона)', 'Взрыв ярости (+10 урона по врагу в случае, если ОЗ ниже 100)'], activeAbilities: [{ name: 'Полный Зверь', description: 'Наносит 50 урона.', cost: { om: 30 } }] },
    { name: 'Огненные крыланы (Фениксы)', passiveBonuses: ['Теплокровность (+50 иммунитет к огню)', 'Перерождение (+50 ОЗ при падении ниже 30 ОЗ)'], activeAbilities: [{ name: 'Крылья пламени', description: 'Наносят 60 урона огнём.', cost: { om: 40 } }] },
    { name: 'Оприты', passiveBonuses: ['Электроустойчивость (-50 урона от атак стихии молний)'], activeAbilities: [{ name: 'Электрический разряд', description: 'Наносит 50 урона стихией молний и врагу, и себе.', cost: { om: 30 } }] },
    { name: 'Орк', passiveBonuses: ['Расовая ярость (+10 к урону)'], activeAbilities: [] },
    { name: 'Пересмешники', passiveBonuses: ['Смена облика (-10 урона от первой атаки противника)'], activeAbilities: [{ name: 'Кража лица', description: 'Лишает врага одного действия.', cost: { om: 30 } }] },
    { name: 'Полукоты', passiveBonuses: ['Девять жизней (+50 ОЗ при падении ниже 10 ОЗ)', 'Уверенность в прыжке (+10 к физическим атакам)'], activeAbilities: [{ name: 'Когти судьбы', description: 'Наносит 40 урона.', cost: { om: 30 } }] },
    { name: 'Полузаи', passiveBonuses: ['Усиленный слух (-5 урона от звуковых атак)', 'Воздушное ускорение (-5 ОД на действия, связанные с перемещением)'], activeAbilities: [{ name: 'Вихрь эфира', description: 'Накладывает эффект удержания.', cost: { om: 30 } }] },
    { name: 'Призраки', passiveBonuses: ['Эфирная форма (иммунитет к физ. атакам)', 'Ясновидение (враг теряет 5 ОМ/ход)'], activeAbilities: [{ name: 'Страх из-за занавеси', description: 'Лишает врага действия и наносит 20 урона.', cost: { om: 30 } }] },
    { name: 'Проклятые', passiveBonuses: ['Скверна (+5 ОМ потеря)', 'Холод утраты (-5 урона от атак света)'], activeAbilities: [{ name: 'Вторая фаза', description: 'Наносит 60 урона и накладывает эффект тления.', cost: { om: 40 } }] },
    { name: 'Псилаты', passiveBonuses: ['Единение с духами (+10 к урону от стихийных атак)', 'Духовное зрение (-5 урона от заклинаний духовного типа)'], activeAbilities: [{ name: 'Транс-шаман', description: 'На 2 хода восстанавливает 10 ОЗ и 10 ОМ.', cost: { om: 30 } }] },
    { name: 'Рариты', passiveBonuses: ['Перья теней (-10 урона от магии воздуха)', 'Хищный флирт (противник теряет 1 ОМ)'], activeAbilities: [{ name: 'Распахнуть маску', description: 'Наносит 50 урона и ослепляет врага.', cost: { om: 30 } }] },
    { name: 'Саламандры', passiveBonuses: ['Огненная суть — иммунитет к огню', 'Пылающий дух (+5 к урону, если ОЗ ниже 100)'], activeAbilities: [{ name: 'Вспышка', description: 'Наносит 40 урона.', cost: { om: 20 } }] },
    { name: 'Светоликие', passiveBonuses: ['Светлая броня (-10 урона от тьмы)', 'Озарение (+10 ОМ каждый ход)'], activeAbilities: [{ name: 'Луч очищения', description: 'Случайно наносит 40 урона или лечит 40 ОЗ.', cost: { om: 30 } }] },
    { name: 'Сирены', passiveBonuses: ['Очарование (враг тратит 10 ОД при атаке)', 'Водная грация (-5 урона, если враг атакует водой)'], activeAbilities: [{ name: 'Песня безмолвия', description: 'Накладывает эффект очарования.', cost: { om: 30 } }] },
    { name: 'Скелеты', passiveBonuses: ['Бессмертие костей (иммунитет к ядам и горению)', 'Холод нежизни (враг теряет 2 ОЗ/ход)'], activeAbilities: [{ name: 'Некросотрясение', description: 'Наносит 60 урона.', cost: { om: 40 } }] },
    { name: 'Слизни', passiveBonuses: ['Скользкость (-10 урона от физических атак)', 'Магопоглощение (+10 ОМ каждый ход при попадании под заклинание)'], activeAbilities: [{ name: 'Переформа', description: 'Игнорирует весь урон на 1 ход.', cost: { om: 50 } }] },
    { name: 'Снежные эльфы', passiveBonuses: ['Лёд в венах (-30 урона от атак стихии льда)'], activeAbilities: [{ name: 'Цветок льда', description: 'Наносит 60 урона льдом.', cost: { om: 40 } }] },
    { name: 'Солнечные эльфы', passiveBonuses: ['Светлая энергия (+10 ОМ каждый ход)', 'Прозрение (-5 урона от атак тьмы)'], activeAbilities: [{ name: 'Луч истины', description: 'Наносит 20 урона и снимает негативные эффекты.', cost: { om: 30 } }] },
    { name: 'Сфинксы', passiveBonuses: ['Око истины (-30 урона от иллюзий и заклинаний)', 'Грация охотника (-5 урона от физических атак)'], activeAbilities: [{ name: 'Когти закона', description: 'Наносит 55 урона.', cost: { om: 30 } }] },
    { name: 'Тальены', passiveBonuses: ['Ритм крови (+10 ОМ/ход каждый второй ход)', 'Гибкость (-5 физ. урон)'], activeAbilities: [{ name: 'Танец лезвий', description: 'Наносит 45 урона.', cost: { om: 30 } }] },
    { name: 'Тени', passiveBonuses: ['Слияние с сумраком (-10 урона от атак света)', 'Отражение страха (враг теряет 10 ОМ)'], activeAbilities: [{ name: 'Угасание', description: 'Наносит 50 урона и лишает врага одного действия.', cost: { om: 40 } }] },
    { name: 'Тритоны', passiveBonuses: ['Водная адаптация (-10 урона от атак воды и холода)', 'Холодный ум (+5 ОМ/ход)'], activeAbilities: [{ name: 'Всплеск', description: 'Наносит 50 урона врагу и 40 себе, снижает ОД врага на 30.', cost: { om: 30 } }] },
    { name: 'Хамелеоны', passiveBonuses: ['Скрытность (-10 урона от первой атаки)', 'Мимикрия (-15 ОД на уклонение)'], activeAbilities: [{ name: 'Цветовой обман', description: 'Автоматически уклоняется 3 хода подряд.', cost: { om: 50 } }] },
    { name: 'Химеры', passiveBonuses: ['Ипостась силы (-10 урона от физических атак)', 'Адаптация (+10 ОЗ при уроне > 40)'], activeAbilities: [{ name: 'Переворот', description: 'Наносит 40 урона и лишает врага действия.', cost: { om: 40 } }] },
    { name: 'Цынаре', passiveBonuses: ['Гипнотический взгляд (враг теряет 10 ОД/ход)', 'Танец грации (-10 урона при ОЗ > 100)'], activeAbilities: [{ name: 'Порыв харизмы', description: 'Накладывает эффект удержания.', cost: { om: 30 } }] },
    { name: 'Человек', passiveBonuses: [], activeAbilities: [] },
    { name: 'Энергетические вампиры', passiveBonuses: ['Энергетический резонанс (+1 ОЗ/ход)', 'Аура желания (враг теряет 10 ОМ при физ. атаке)'], activeAbilities: [{ name: 'Энергозахват', description: 'Наносит 30 урона и восстанавливает 20 ОЗ.', cost: { om: 30 } }] },
    { name: 'Ятанаги', passiveBonuses: ['Эфирная стабильность (+10 ОМ/ход)', 'Магическое тело (-5 урона при ОМ > 50)'], activeAbilities: [{ name: 'Поток стихий', description: 'Наносит 60 урона эфиром.', cost: { om: 40 } }] },
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
    'Тьма': { name: 'Тьма', weakTo: ['Жизнь', 'Свет'], strongAgainst: ['Энергия', 'Ментал'] },
    'Жизнь': { name: 'Жизнь', weakTo: ['Смерть'], strongAgainst: ['Проклятия', 'Яды'] },
    'Смерть': { name: 'Смерть', weakTo: ['Жизнь', 'Свет'], strongAgainst: ['Живые', 'Лёгкие ткани'] },
    'Растения': { name: 'Растения', weakTo: ['Огонь', 'Лава'], strongAgainst: ['Земля', 'Вода'] },
    'Лава': { name: 'Лава', weakTo: ['Воздух'], strongAgainst: ['Лёд', 'Металл', 'Растения'] },
    'Звук': { name: 'Звук', weakTo: ['Металл', 'Эфир'], strongAgainst: ['Молния', 'Воздух'] },
    'Кровь': { name: 'Кровь', weakTo: ['Свет', 'Жизнь'], strongAgainst: ['Живые цели'] },
    'Эфир': { name: 'Эфир', weakTo: [], strongAgainst: [] }, // Нейтральная
    'Иллюзии': { name: 'Иллюзии', weakTo: [], strongAgainst: [] }, // Нейтральная
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
  DOT_EFFECTS: ['Отравление', 'Горение', 'Ожог', 'Кровотечение', 'Тление', 'Отравление (3)', 'Отравление (2)', 'Отравление (1)', 'Горение (2)', 'Горение (1)', 'Кровотечение (2)'],
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
