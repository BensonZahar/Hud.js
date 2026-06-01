// MVD AHK VERSION: 2.1 (FIX-TRIGGER)
console.log("=== MVD AHK v2.334 FIX-TRIGGER ЗАГРУЖЕН ===");
// 1. СНАЧАЛА объявляем все константы и массивы
const rankTags = {
    "Рядовой": "[Р]",
    "Сержант": "[С]",
    "Старшина": "[СТ]",
    "Прапорщик": "[ПР]",
    "Лейтенант": "[Л]",
    "Капитан": "[К]",
    "Майор": "[М]",
    "Подполковник": "[ПП]",
    "Командир ДПС": "[Ком.ДПС]",
    "Командир ППС": "[Ком.ППС]",
    "Командир ОМОН": "[Ком.ОМОН]",
    "Заместитель командира ОМОН": "[Зам.Ком.ОМОН]",
    "Командир мотобатальона": "[Ком.МБ]",
    "Полковник": "[П]",
    "Генерал": "[Г]"
};
const mvdSkins = [15321, 15323, 15325, 15330, 15332, 15334, 15335, 190, 148, 15340, 15341, 15342, 15343, 15344, 15348, 15351];
const stroyRanks = ["Капитан", "Майор", "Подполковник", "Полковник", "Генерал"];
// КоАП тексты (сокращенные)
const dpsKoapLines = [
    "{FFD700}Глава 1. Нарушения, касаемо регистрации т/с",
    "{00FF00}1.1.{FFFFFF} Управление т/с без регистрационного знака | {FF0000}Штраф 5.000 рублей{FFFFFF}. (Искл: разрешено без номеров если пробег не превысил 100 км)",
    "",
    "{FFD700}Глава 2. Нарушения касаемо технического состояния т/с",
    "{00FF00}2.1.{FFFFFF} Управление т/с с неисправным двигателем (дымление без аварийных сигналов) | {FF0000}Штраф 10.000 рублей{FFFFFF}.",
    "",
    "{FFD700}Глава 3. Безопасность движения",
    "{00FF00}3.1.{FFFFFF} Управление т/с в алкогольном/наркотическом опьянении | {FF0000}Штраф 20.000 рублей{FFFFFF} + изъятие водительского удостоверения.",
    "{00FF00}3.2.{FFFFFF} Разговор по телефону во время движения | {FF0000}Штраф 5.500 рублей{FFFFFF}.",
    "{00FF00}3.3.{FFFFFF} Нарушение правил пользования звуковыми сигналами/аварийной сигнализацией (использование не по назначению, троллинг) | {FF0000}Штраф 6.500 рублей{FFFFFF}.",
    "{00FF00}3.4.{FFFFFF} Движение с выключенными габаритными огнями в ночное/вечернее время (с 21:00 по 6:00) | {FF0000}Штраф 5.000 рублей{FFFFFF}.",
    "{00FF00}3.5.{FFFFFF} Нарушение ПДД пешеходом (переход в неположенном месте, бег по дороге) | {FF0000}Штраф 5.000 рублей{FFFFFF}. Искл: сотрудник ПО при исполнении.",
    "{00FF00}3.6.{FFFFFF} Управление т/с с тонировкой лобового/боковых передних стекол ниже 50% | {FF0000}Штраф 15.000 рублей{FFFFFF}. Искл: ФСБ при исполнении.",
    "{00FF00}3.7.{FFFFFF} Движение без пристегнутого ремня или надетого шлема | {FF0000}Штраф 5.000 рублей{FFFFFF}.",
    "{00FF00}3.8.{FFFFFF} Намеренное создание дорожных заторов, помех | {FF0000}Штраф 10.000 рублей{FFFFFF}.",
    "",
    "{FFD700}Глава 4. Железная дорога",
    "{00FF00}4.1.{FFFFFF} Пересечение ж/д пути вне переезда или при закрытом шлагбауме | {FF0000}Штраф 25.000 рублей{FFFFFF} + лишение водительского удостоверения.",
    "",
    "{FFD700}Глава 5. Автомагистраль",
    "{00FF00}5.1.{FFFFFF} Разворот или движение задним ходом по автомагистрали | {FF0000}Штраф 15.000 рублей{FFFFFF}.",
    "",
    "{FFD700}Глава 6. Перекресток",
    "{00FF00}6.1.{FFFFFF} Проезд на красный сигнал светофора | {FF0000}Штраф 10.000 рублей{FFFFFF}.",
    "{00FF00}6.1.1.{FFFFFF} Проезд на жёлтый сигнал светофора | {FF0000}Штраф 5.000 рублей{FFFFFF}.",
    "{00FF00}6.1.2.{FFFFFF} Проезд на запрещающий/предупреждающий сигнал, в следствии чего произошло ДТП | {FF0000}Штраф 20.000 рублей{FFFFFF} + лишение удостоверения.",
    "",
    "{FFD700}Глава 7. Маневрирование",
    "{00FF00}7.1.{FFFFFF} Разворот/движение задним ходом в запрещённых местах (пешеходный переход, мост, ж/д переезд) | {FF0000}Штраф 15.000 рублей{FFFFFF}.",
    "{00FF00}7.2.{FFFFFF} Агрессивное вождение (таран, подрезы, выезды на встречную) | {FF0000}Штраф 20.000 рублей{FFFFFF} + изъятие лицензии на вождение.",
    "{00FF00}7.3.{FFFFFF} Невыполнение требования уступить дорогу т/с с преимущественным правом проезда | {FF0000}Штраф 10.000 рублей{FFFFFF}.",
    "",
    "{FFD700}Глава 8. Парковка, движение т/с",
    "{00FF00}8.1.{FFFFFF} Остановка/стоянка/парковка в неположенном месте | {FF0000}Штраф 8.000 рублей{FFFFFF} + эвакуация. (Искл: с аварийкой можно стоять до 5 мин, если не создаёт помеху)",
    "{00FF00}8.2.{FFFFFF} Движение т/с по велосипедным/пешеходным дорожкам, газонам или тротуарам | {FF0000}Штраф 6.500 рублей{FFFFFF}.",
    "{00FF00}8.3.{FFFFFF} Движение т/с по встречной полосе | {FF0000}Штраф 10.000 рублей{FFFFFF} + изъятие лицензии на вождение.",
    "{00FF00}8.3.1.{FFFFFF} Движение по встречной, в следствии чего произошло ДТП | {FF0000}Штраф 20.000 рублей{FFFFFF} + изъятие лицензии.",
    "",
    "{FFD700}Глава 9. Знаки и разметка",
    "{00FF00}9.1.{FFFFFF} Разворот/поворот через сплошную линию разметки | {FF0000}Штраф 12.000 рублей{FFFFFF}.",
    "{00FF00}9.2.{FFFFFF} Разворот/поворот через двойную сплошную | {FF0000}Штраф 15.000 рублей{FFFFFF}.",
    "{00FF00}9.3.{FFFFFF} Пересечение двойной сплошной линии | {FF0000}Штраф 13.000 рублей{FFFFFF}.",
    "{00FF00}9.4.{FFFFFF} Пересечение сплошной линии разметки | {FF0000}Штраф 15.000 рублей{FFFFFF}.",
    "*В случае ДТП после нарушений гл.9 — также изымается лицензия на вождение.",
    "",
    "{FFD700}Глава 10. Преимущество на дороге",
    "{00FF00}10.1.{FFFFFF} Непредоставление преимущества маршрутному транспорту на остановках | {FF0000}Штраф 5.000 рублей{FFFFFF}.",
    "{00FF00}10.2.{FFFFFF} Непредоставление преимущества спец. службам с маячком и сиреной или игнорирование громкоговорителя ФСБ | {FF0000}Штраф 15.000 рублей{FFFFFF} + изъятие лицензии.",
    "{00FF00}10.3.{FFFFFF} Непредоставление преимущества колонне в сопровождении гос. служб | {FF0000}Штраф 20.000 рублей{FFFFFF} + изъятие лицензии.",
    "{00FF00}10.4.{FFFFFF} Невыполнение требования уступить дорогу пешеходам/велосипедистам | {FF0000}Штраф 10.000 рублей{FFFFFF}.",
    "",
    "{FFD700}Глава 11. ДТП",
    "{00FF00}11.1.{FFFFFF} Виновник ДТП без вреда здоровью | {FF0000}Штраф 10.000 рублей{FFFFFF}.",
    "{00FF00}11.1.1.{FFFFFF} Виновник ДТП с тяжким вредом здоровью/смертью | {FF0000}Штраф 25.000 рублей{FFFFFF} + изъятие лицензии на оружие.",
    "{00FF00}11.2.{FFFFFF} Оставление места ДТП | {FF0000}Штраф 15.000 рублей{FFFFFF}.",
    "{00FF00}11.3.{FFFFFF} Создание аварийных ситуаций, провокация на ДТП, автоподставы | {FF0000}Штраф 20.000 рублей{FFFFFF} + изъятие водительского удостоверения.",
    "",
    "{FFD700}Глава 12. Скоростной режим",
    "{00FF00}12.1.{FFFFFF} Превышение скорости более чем на 30 км/ч (80-90 км/ч) | {FF0000}Штраф 5.000 рублей{FFFFFF}.",
    "{00FF00}12.2.{FFFFFF} Превышение скорости более чем на 50 км/ч (90-120 км/ч) | {FF0000}Штраф 7.000 рублей{FFFFFF}.",
    "{00FF00}12.3.{FFFFFF} Превышение на 30+ км/ч, в следствии чего произошло ДТП | {FF0000}Штраф 15.000 рублей{FFFFFF}.",
    "{00FF00}12.4.{FFFFFF} Превышение на 50+ км/ч, в следствии чего произошло ДТП | {FF0000}Штраф 25.000 рублей{FFFFFF} + изъятие водительского удостоверения.",
    "*В случае ДТП после нарушений гл.12 — также изымается лицензия на вождение.",
    "",
    "{FFD700}Глава 13. Административные правонарушения общественного порядка",
    "{00FF00}13.1.{FFFFFF} Оскорбление гражданского лица / сотрудника гос. структур | {FF0000}Штраф 10.000 рублей{FFFFFF}.",
    "{00FF00}13.1.1.{FFFFFF} Не грубое оскорбление сотрудника правоохранительных органов | {FF0000}Штраф 10.000 рублей{FFFFFF}.",
    "{00FF00}13.2.{FFFFFF} Мелкое хулиганство (нецензурная брань, громкие крики в общественных местах) | {FF0000}Штраф 8.000 рублей{FFFFFF}.",
    "{00FF00}13.3.{FFFFFF} Курение в общественных местах | {FF0000}Штраф 5.000 рублей{FFFFFF}.",
    "{00FF00}13.4.{FFFFFF} Распитие спиртных напитков в общественных местах | {FF0000}Штраф 7.000 рублей{FFFFFF}.",
    "{00FF00}13.5.{FFFFFF} Громкая музыка в жилых зонах в ночное время (23:00-06:00) | {FF0000}Штраф 4.000 рублей{FFFFFF}.",
    "{00FF00}13.6.{FFFFFF} Ношение отмычек или спец. приспособлений для незаконного проникновения | {FF0000}Штраф 15.000 рублей{FFFFFF}."
];
const ppsKoapLines = [
    "{FFD700}Общий раздел нарушений КоАП:",
    "",
    "{FFD700}Глава 1 || Административные правонарушения, посягающие на права граждан",
    "{00FF00}20.1.{FFFFFF} Оскорбление, то есть унижение чести и достоинства другого лица, выраженное в неприличной форме - влечет наложение административного штрафа на граждан в размере {FF0000}5.000 рублей{FFFFFF}.",
    "{00FF00}20.2.{FFFFFF} Дискриминация, то есть нарушение прав, свобод и законных интересов человека и гражданина в зависимости от его пола, расы, цвета кожи, национальности, языка, происхождения, имущественного, семейного, социального и должностного положения, возраста, места жительства, отношения к религии, убеждений, принадлежности или не принадлежности к общественным объединениям или каким-либо социальным группам - влечет наложение административного штрафа на граждан в размере от {FF0000}1.000 до 5.000 рублей{FFFFFF}.",
    "",
    "{FFD700}Глава 2 || Административные правонарушения, посягающие на здоровье, санитарно-эпидемиологическое благополучие населения и общественную нравственность",
    "{00FF00}20.3.{FFFFFF} Нанесение побоев или совершение иных насильственных действий, причинивших физическую боль, если эти действия не содержат уголовно наказуемого деяния - влечет наложение административного штрафа в размере от {FF0000}5.000 до 30.000 рублей{FFFFFF}, либо административный арест.",
    "{00FF00}20.4.{FFFFFF} Занятие народной медициной без получения разрешения, установленного законом - влечет наложение административного штрафа в размере от {FF0000}2.000 до 4.000 рублей{FFFFFF}.",
    "{00FF00}20.5.{FFFFFF} Потребление наркотических средств или психотропных веществ без назначения врача либо новых потенциально опасных псих-активных веществ, за исключением случаев, указанных в УК - влечет наложение административного штрафа в размере от {FF0000}5.000 до 10.000 рублей{FFFFFF} или административный арест.",
    "{00FF00}20.6.{FFFFFF} Занятие проституцией - влечет наложение административного штрафа в размере от {FF0000}1.500 до 3.000 тысяч рублей{FFFFFF}.",
    "{00FF00}20.7.{FFFFFF} Курение в общественных местах - влечет наложение административного штрафа в размере от {FF0000}2.000 до 3.000 тысяч рублей{FFFFFF}.",
    "{00FF00}20.8.{FFFFFF} Распитие спиртных напитков в общественных местах - влечет наложение административного штрафа в размере от {FF0000}3.000 до 5.000 тысяч рублей{FFFFFF}.",
    "",
    "{FFD700}Глава 3 || Административные правонарушения, посягающие на общественный порядок и общественную безопасность",
    "{00FF00}20.9.{FFFFFF} Мелкое хулиганство, то есть нарушение общественного порядка, выражающее явное неуважение к обществу, сопровождающееся нецензурной бранью в общественных местах, оскорбительным приставанием к гражданам, а равно уничтожением или повреждением чужого имущества - влечет наложение административного штрафа в размере от {FF0000}1.000 до 2.000 рублей{FFFFFF} или административный арест.",
    "{00FF00}30.1.{FFFFFF} Нарушение организатором публичного мероприятия установленного порядка организации либо проведения собрания, митинга, демонстрации, шествия или пикетирования, за исключением случаев, предусмотренных частями УК - влечет наложение административного штрафа на граждан в размере от {FF0000}10.000 до 20.000 рублей{FFFFFF}.",
    "{00FF00}30.2.{FFFFFF} Нарушение правил перевозки, транспортирования оружия и патронов к нему - влечет наложение административного штрафа в размере от {FF0000}1.000 до 2.000 рублей{FFFFFF}.",
    "{00FF00}30.3.{FFFFFF} Появление на улицах, стадионах, в скверах, парках, в транспортном средстве общего пользования, в других общественных местах в состоянии опьянения, оскорбляющем человеческое достоинство и общественную нравственность - влечет наложение административного штрафа в размере от {FF0000}1.000 до 3.000 рублей{FFFFFF}.",
    "{00FF00}30.4{FFFFFF} Организация блокирования, а равно активное участие в блокировании транспортных коммуникаций, за исключением случаев, предусмотренных УК - влечет наложение административного штрафа на граждан в размере от {FF0000}30.000 до 100.000 рублей{FFFFFF}.",
    "",
    "{FFD700}Глава 4 || Административные правонарушения, посягающие на общественный порядок в день тишины.",
    "{00FF00}40.1{FFFFFF} Подкуп избирателей, влечет наложение административного штрафа на граждан в размере от {FF0000}40.000 до 120.000{FFFFFF}, а так же арест до {FF0000}15 суток{FFFFFF}.",
    "{00FF00}40.2{FFFFFF} Агитация в день тишины, влечет наложение административного штрафа на граждан в размере от {FF0000}40.000 до 200.000{FFFFFF}, а так же арест до {FF0000}15 суток{FFFFFF}."
];
// УК РФ статьи для розыска
const ukLines = [
    "{FFD700}Глава 1. Преступления против жизни и здоровья человека.",
    "{00FF00}1.1.{FFFFFF} Нападение на гражданское лицо без использования оружия | {FF0000}2 года",
    "{00FF00}1.1.1.{FFFFFF} Побои | {FF0000}1 год",
    "{00FF00}1.1.2.{FFFFFF} Нападение на гражданское лицо с применением холодного оружия | {FF0000}3 года",
    "{00FF00}1.1.3.{FFFFFF} Вооружённое нападение на гражданское лицо | {FF0000}4 года",
    "{00FF00}1.2.{FFFFFF} Причинение смерти по неосторожности без оружия | {FF0000}1 год",
    "{00FF00}1.2.1.{FFFFFF} Причинение смерти по неосторожности при управлении транспортом | {FF0000}2 года",
    "{00FF00}1.3.{FFFFFF} Угроза причинения вреда здоровью (слова) | {FF0000}1 год",
    "{00FF00}1.3.1.{FFFFFF} Угроза причинения вреда здоровью с использованием оружия | {FF0000}2 года",
    "{00FF00}1.4.{FFFFFF} Изнасилование | {FF0000}2 года",
    "{00FF00}1.5.{FFFFFF} Воспрепятствование оказанию медицинской помощи | {FF0000}2 года",
    "",
    "{FFD700}Глава 2. Преступления против свободы и чести личности.",
    "{00FF00}2.1.{FFFFFF} Похищение человека | {FF0000}4 года",
    "{00FF00}2.2.{FFFFFF} Клевета | {FF0000}2 года",
    "",
    "{FFD700}Глава 3. Преступление против собственности.",
    "{00FF00}3.1.{FFFFFF} Кража | {FF0000}2 года",
    "{00FF00}3.1.1.{FFFFFF} Разбой | {FF0000}3 года",
    "{00FF00}3.2.{FFFFFF} Умышленное повреждение или порча частного имущества | {FF0000}2 года",
    "{00FF00}3.2.1.{FFFFFF} Умышленное повреждение или порча государственного имущества | {FF0000}3 года",
    "",
    "{FFD700}Глава 4. Преступления против общественной безопасности.",
    "{00FF00}4.1.{FFFFFF} Террористический акт | {FF0000}6 лет",
    "{00FF00}4.1.1.{FFFFFF} Заведомо ложное сообщение об акте терроризма | {FF0000}3 года",
    "{00FF00}4.2.{FFFFFF} Несообщение о преступлении | {FF0000}2 года",
    "{00FF00}4.3.{FFFFFF} Массовые беспорядки | {FF0000}5 лет",
    "{00FF00}4.4.{FFFFFF} Участие в несанкционированных митингах | {FF0000}2 года",
    "{00FF00}4.4.1.{FFFFFF} Организация несанкционированного митинга | {FF0000}3 года",
    "{00FF00}4.5.{FFFFFF} Ношение оружия в открытом виде | {FF0000}2 года",
    "{00FF00}4.5.1.{FFFFFF} Ношение оружия в открытом виде в общественных местах | {FF0000}3 года",
    "{00FF00}4.5.2.{FFFFFF} Ношение оружия и патронов без лицензии | {FF0000}2 года",
    "{00FF00}4.5.3.{FFFFFF} Ношение оружия в открытом виде без лицензии | {FF0000}4 года",
    "{00FF00}4.5.4.{FFFFFF} Ношение оружия в открытом виде в общественных местах без лицензии | {FF0000}5 лет",
    "{00FF00}4.6.{FFFFFF} Незаконное приобретение/передача/изготовление оружия и боеприпасов | {FF0000}2 года",
    "{00FF00}4.7.{FFFFFF} Помеха проведению мероприятий гос. структур | {FF0000}1 год",
    "{00FF00}4.8.{FFFFFF} Проникновение на желтую зону | {FF0000}2 года",
    "{00FF00}4.8.1.{FFFFFF} Проникновение на красную зону | {FF0000}4 года",
    "{00FF00}4.8.2.{FFFFFF} Проникновение на частную территорию без разрешения | {FF0000}1 год",
    "{00FF00}4.9.{FFFFFF} Соучастие в преступлении | {FF0000}3 года",
    "{00FF00}4.9.1.{FFFFFF} Принуждение к совершению нарушения законодательства",
    "",
    "{FFD700}Глава 5. Преступления против сотрудников гос. организаций.",
    "{00FF00}5.1.{FFFFFF} Нападение на сотрудника гос. организации при исполнении | {FF0000}4 года",
    "{00FF00}5.1.1.{FFFFFF} Нападение на сотрудника силовых структур при исполнении | {FF0000}5 лет",
    "{00FF00}5.1.2.{FFFFFF} Нападение на государственного деятеля при исполнении | {FF0000}6 лет",
    "{00FF00}5.2.{FFFFFF} Неподчинение законному требованию сотрудника ПО или МО | {FF0000}1 год",
    "{00FF00}5.2.1.{FFFFFF} Побег от сотрудников ПО | {FF0000}2 года",
    "{00FF00}5.3.{FFFFFF} Создание помехи сотруднику ПО при исполнении | {FF0000}2 года",
    "{00FF00}5.3.1.{FFFFFF} Провокация сотрудников правоохранительных органов | {FF0000}2 года",
    "{00FF00}5.4.{FFFFFF} Оскорбление сотрудников ПО в грубой форме | {FF0000}1 год",
    "{00FF00}5.5.{FFFFFF} Ложный вызов | {FF0000}2 года",
    "{00FF00}5.6.{FFFFFF} Дача ложных показаний | {FF0000}2 года",
    "{00FF00}5.7.{FFFFFF} Дача или попытка дачи взятки | {FF0000}3 года",
    "{00FF00}5.8.{FFFFFF} Случайное разглашение государственной тайны | {FF0000}1 год",
    "{00FF00}5.8.1.{FFFFFF} Намеренное разглашение/передача гос. тайны | {FF0000}3 года",
    "{00FF00}5.9.{FFFFFF} Шпионаж | {FF0000}4 года",
    "{00FF00}5.10.{FFFFFF} Присвоение полномочий должностного лица | {FF0000}3 года",
    "",
    "{FFD700}Глава 6. Преступления сотрудниками Гос. Организаций.",
    "{00FF00}6.1.1.{FFFFFF} Укрывательство преступлений | {FF0000}2 года",
    "{00FF00}6.2.{FFFFFF} Превышение должностных полномочий | {FF0000}2 года",
    "{00FF00}6.3.{FFFFFF} Халатность | {FF0000}4 года",
    "{00FF00}6.4.{FFFFFF} Разглашение сведений должностным лицом гос. тайны | {FF0000}4 года",
    "{00FF00}6.5.{FFFFFF} Вооружённый мятеж | {FF0000}6 лет",
    "{00FF00}6.6.{FFFFFF} Неоказание помощи больному | {FF0000}3 года",
    "{00FF00}6.7.{FFFFFF} Дезертирство | {FF0000}3 года",
    "{00FF00}6.8.{FFFFFF} Получение взятки должностным лицом | {FF0000}3 года",
    "",
    "{FFD700}Глава 7. Преступления, касаемо наркотических веществ.",
    "{00FF00}7.2.{FFFFFF} Хранение или перевозка наркотических веществ | {FF0000}3 года",
    "{00FF00}7.3.{FFFFFF} Приобретение, сбыт, распространение наркотических веществ | {FF0000}4 года",
    "{00FF00}7.4.{FFFFFF} Производство, изготовление, выращивание наркотических веществ | {FF0000}3 года"
];
// Маппинг статья УК → звёзды (из срока в годах/летах)
const ukStarsMap = {};
ukLines.forEach(line => {
    const codeMatch = line.match(/\{00FF00\}([\d.]+)\.\{FFFFFF\}/);
    const yearsMatch = line.match(/\{FF0000\}(\d+)\s*(год|года|лет)/);
    if (codeMatch && yearsMatch) {
        ukStarsMap[codeMatch[1]] = parseInt(yearsMatch[1]);
    }
});

let skinId = null;
// 3. Функция получения скина
function getSkinIdFromStore() {
    try {
        const menuInterface = window.interface("Menu");
        if (menuInterface && menuInterface.$store && menuInterface.$store.getters["player/skinId"] !== undefined) {
            return menuInterface.$store.getters["player/skinId"];
        }
        return null;
    } catch (e) {
        console.log(`Ошибка при получении Skin ID: ${e.message}`);
        return null;
    }
}
// 4. Функция отслеживания скина (ИСПРАВЛЕНА)
function trackSkinId() {
    const currentSkin = getSkinIdFromStore();
    if (currentSkin !== null && currentSkin !== skinId) {
        // ВАЖНО: Приводим к числу сразу!
        skinId = Number(currentSkin);
    
        console.log(`🔍 Новый Skin ID обнаружен: ${skinId}`);
    
        // Проверяем, является ли скин МВД
        if (mvdSkins.includes(skinId)) {
            console.log(`✅ Скин ${skinId} - это МВД скин!`);
        } else {
            console.log(`❌ Скин ${skinId} НЕ входит в список МВД`);
        }
    }
    setTimeout(trackSkinId, 5000);
}
// 5. ЗАПУСК после загрузки
setTimeout(() => {
    console.log('🚀 Запуск отслеживания скина МВД...');
    const initialSkin = getSkinIdFromStore();
    if (initialSkin !== null) {
        // Приводим к числу сразу
        skinId = Number(initialSkin);
        console.log(`📌 Начальный Skin ID: ${skinId}`);
    
        if (mvdSkins.includes(skinId)) {
            console.log(`✅ Скин ${skinId} в списке МВД - меню /dahk доступно`);
        } else {
            console.log(`⚠️ Скин ${skinId} не является МВД скином`);
        }
    } else {
        console.log('❌ Не удалось получить начальный Skin ID');
    }
    trackSkinId();
}, 500);
const licenseTypes = [
    { name: "МВД", id: "mvd_main" }
];
const mvdSubTypes = [
    { name: "Повседневная", id: "povsednev" },
    { name: "Строй", id: "stroy" }
];
let trackingName = `Отслеживание | {FF0000}Выкл`;
let autoCuffName = `Auto-cuff | {FF0000}Выкл`;
let autoGrabEnabled = true;
let autoGrabName = `Авто-снаряжение | {00FF00}Вкл`;
const povsednevOptions = [
    { name: "1. Приветствие", action: "greeting", needsId: true },
    { name: "2. Проверка документов", action: "checkDocuments" },
    { name: "3. Изучение документов", action: "studyDocuments" },
    { name: "4. Сканирование", action: "scanningTablet" },
    { name: "5. Надевание наручников", action: "cuffing", needsId: true },
    { name: "6. Посадка в машину", action: "putInCar", needsId: true },
    { name: "7. Доставка в участок", action: "arrest", needsId: true },
    { name: "8. Снятие наручников", action: "uncuffing", needsId: true },
    { name: "9. Преследование преступника", action: "chase", needsId: true },
    { name: "10. Обыск", action: "search", needsId: true },
    { name: "11. Конвоирование", action: "escort", needsId: true },
    { name: "12. Снятие розыска", action: "clearWanted", needsId: true },
    { name: "13. Выдача штрафа [/ticket]", action: "fine" },
    { name: "14. Выдача розыска [/su]", action: "wantedFine" },
    { name: "15. Изъятие веществ", action: "confiscate", needsId: true },
    { name: "16. Разбитие стекла", action: "breakGlass", needsId: true },
    { name: "17. Снятие маски", action: "removeMask" },
    { name: "18. Сканирование отпечатков", action: "fingerprint" },
    { name: "19. Изъятие прав", action: "takeLicense", needsId: true },
    { name: "20. Права Миранды", action: "miranda" }
];
const stroyOptions = [
    { name: "1. Объявление о строе (Основное)", action: "stroy1", needsInput: true },
    { name: "2. Объявление о строе (Повтор)", action: "stroy2", needsInput: true },
    { name: "3. Лекция", action: "lecture", sub: true },
    { name: "4. Тренировка", action: "training", sub: true },
    { name: "5. Спец.Задание", action: "special", sub: true }
];
const lectureOptions = [
    { name: "1. Устав", action: "ust1" },
    { name: "2. Субординация", action: "sub1" }
];
const trainingOptions = [
    { name: "1. Начало тренировки", action: "trenya1" },
    { name: "2. Разминка рук", action: "trenya2" },
    { name: "3. Отжимания", action: "trenya3" },
    { name: "4. Бег по плацу", action: "trenya4" },
    { name: "4. Восточное единоборство", action: "trenya5" },
    { name: "4. Завершение тренировки", action: "trenya6" }
];
const specialOptions = [
    { name: "1. Начало задания", action: "rp1" },
    { name: "2. Завершение задания", action: "rp2" }
];
const ITEMS_PER_PAGE = 7;
const KOAP_LINES_PER_PAGE = 50; // Для пагинации КоАП
// ==================== БЛОКИРОВКА СООБЩЕНИЯ "* Игрок слишком далеко" ====================
const messageFilters = [
    "* Игрок слишком далеко"
];
function shouldBlockMessage(message) {
    if (typeof message !== 'string') return false;
    const lowerMsg = message.toLowerCase();
    for (const filter of messageFilters) {
        if (lowerMsg.includes(filter.toLowerCase())) {
            console.log(`[FILTER] Заблокировано: "${filter}"`);
            return true;
        }
    }
    return false;
}
let currentPage = 0;
let shownLicenseTypes = [];
let shownMvdSubTypes = [];
let lastMenuType = null; // "povsednev" or "omon" or "stroy" or null
let giveLicenseTo = -1;
let targetId = null;
let currentMenu = null;
let currentSubMenu = null;
let currentAction = null;
let currentStroyAction = null;
let tempHour = null;
let scanInterval = null;
let setmarkInterval = null;
let pgInterval = null;
let idPgInterval = null;
let trackingNotificationOpen = false;
let chaseNotificationOpen = false;
let trackingNickname = null;
let currentScanId = null;
let autoCuffEnabled = false;
let currentKoapType = null;
let koapPage = 0;
let currentKoapLines = [];
// Розыск (wanted) state
let wantedStars = null;
let ukPage = 0;
let currentUkLines = [...ukLines];
let lastWantedCode = null; // последняя статья УК для авто-подстановки в серверный диалог
// Обработчик горячих клавиш
window.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === '0') {
        sendChatInput('/dahk');
    }
    // Alt+H — быстрый своп тазер ↔ дигл
    if (e.altKey && (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р')) {
        window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
    }
});

// ==================== НАТИВНАЯ A/D НАВИГАЦИЯ (TABLIST_HEADERS) ====================
// Диалоги с пагинацией используют стиль 5 (TABLIST_HEADERS) — движок сам добавляет A/D кнопки
// и вызывает OnMultiDialogClickNavigButton при их нажатии
const PAGINATED_DIALOG_IDS = [667, 671, 672, 673, 674];
let _lastPaginatedDialogId = null; // ID последнего открытого пагинированного диалога
let _navPending = false; // флаг: A/D навигация обработана, блокируем следующий OnDialogResponse(response=0)

// Перехватываем нативные A/D кнопки навигации TABLIST_HEADERS диалогов
const _origSendClientEventHandle = window.sendClientEventHandle;
window.sendClientEventHandle = function(event, ...args) {
    if (args[0] === 'OnMultiDialogClickNavigButton') {
        const direction = parseInt(args[1]); // 0 = назад (A), 1 = вперёд (D)
        const dlgId = parseInt(args[2]);
        if (PAGINATED_DIALOG_IDS.includes(dlgId)) {
            _navPending = true;
            setTimeout(() => { _navPending = false; }, 300); // сброс на случай если OnDialogResponse не пришёл
            console.log(`[NAV] A/D dlg=${dlgId} dir=${direction}`);
            if (direction === 1) {
                // D — следующая страница
                currentPage++;
            } else {
                // A — предыдущая страница или выход в родительское меню
                if (currentPage > 0) {
                    currentPage--;
                } else {
                    // Первая страница — выход назад
                    currentPage = 0;
                    if (dlgId === 667) {
                        lastMenuType = null; currentMenu = null;
                        setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
                    } else if (dlgId === 671) {
                        lastMenuType = null; currentMenu = null;
                        setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
                    } else if (dlgId === 672 || dlgId === 673 || dlgId === 674) {
                        currentSubMenu = null;
                        setTimeout(() => showStroyMenuPage(giveLicenseTo), 50);
                    }
                    return;
                }
            }
            // Перезагружаем текущее меню с новой страницей
            setTimeout(() => {
                if (dlgId === 667) showPovsednevMenuPage(giveLicenseTo);
                else if (dlgId === 671) showStroyMenuPage(giveLicenseTo);
                else if (dlgId === 672) showLectureMenuPage(giveLicenseTo);
                else if (dlgId === 673) showTrainingMenuPage(giveLicenseTo);
                else if (dlgId === 674) showSpecialMenuPage(giveLicenseTo);
            }, 50);
            return;
        }
    }
    return _origSendClientEventHandle.call(this, event, ...args);
};
// ==================== END A/D ====================
const setupChatHandler = () => {
    if (window.interface && window.interface('Hud')?.$refs?.chat?.add) {
        const originalAddFunction = window.interface('Hud').$refs.chat.add;
 
        window.interface('Hud').$refs.chat.add = function(message, ...args) {
            // ========== ФИЛЬТРАЦИЯ СООБЩЕНИЙ ==========
            if (shouldBlockMessage(message)) {
                console.log('[FILTER] ✋ Сообщение заблокировано');
                return;
            }
            // ==================== ОТСЛЕЖИВАНИЕ ПОГОНИ ====================
            if (typeof message === 'string' && currentScanId) {
                // Погоня началась или присоединились
                if (message.includes('Вы начали погоню за игроком') ||
                    message.includes('Вы присоединились к погоне')) {
                  
                    isInActiveChase = true;
                    console.log('[CHASE] 🚨 Погоня активна - /pg отключен');
                  
                    // Открываем синее уведомление
                    openChaseNotification(currentScanId);
                }
              
                // Преступник ушел от погони
                if (message.includes('Разыскиваемый ушел от погони!')) {
                    isInActiveChase = false;
                    console.log('[CHASE] ⚠️ Преступник ушел - /pg возобновлен');
                  
                    // Возвращаем красное уведомление
                    openTrackingNotification(currentScanId);
                }
            }
            // ==================== КОНЕЦ ОТСЛЕЖИВАНИЯ ПОГОНИ ====================
            // Auto-cuff logic
            if (autoCuffEnabled && typeof message === 'string') {
                const stunMatch = message.match(/Вы оглушили (\w+) на \d+ секунд/);
                if (stunMatch) {
                    const nickname = stunMatch[1];
                    setTimeout(() => {
                        sendChatInput(`/id ${nickname}`);
                    }, 500);
                }
         
                const idMatch = message.match(/\d+\. {[A-F0-9]{6}}(\w+){ffffff}, ID: (\d+),/);
                if (idMatch && idMatch[2]) {
                    const id = idMatch[2];
                    setTimeout(() => {
                        sendMessagesWithDelay([
                            "/do Наручники в руке.",
                            "/me надел наручники на человека напротив",
                            `/cuff ${id}`,
                            "/me схватил задержанного за руки",
                            "/me заломал задержанного и повёл задержанного",
                            `/escort ${id}`
                        ], [0, 300, 300, 300, 700, 700]);
                    }, 1000);
                }
            }
            // ==================== ОТСЛЕЖИВАНИЕ ШТРАФОВ ====================
            if (typeof message === 'string') {
                if (message.includes('Вы получили премию к зарплате в размере')) {
                    try {
                        window.openInterface('InformationTimer', ['К/Д Выдача штрафа', 300, false]);
                        console.log('[FINE] InformationTimer запущен на 5 минут');
                    } catch (err) {
                        console.error('[FINE] Ошибка открытия InformationTimer:', err);
                    }
                }
             
                if (message.includes('Вы недавно выдавали штраф')) {
                    snAdd('[1, "Выдача штрафа", "У вас еще к/д на выдачу штрафа", "FF0000", 5000]');
                    console.log('[FINE] ScreenNotification: кулдаун штрафа');
                }
            }
            // ==================== КОНЕЦ ОТСЛЕЖИВАНИЯ ====================
     
            return originalAddFunction.apply(this, [message, ...args]);
        };
        console.log('[Auto-cuff] Обработчик чата успешно установлен');
        console.log('[CHASE] Отслеживание погони активировано');
        console.log('[FINE] Отслеживание штрафов активировано');
    } else {
        setTimeout(setupChatHandler, 100);
    }
};
setupChatHandler();
const getPaginatedMenu = (options) => {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = options.slice(start, end);
    // TABLIST_HEADERS: первая строка — заголовок колонки
    let menuList = "Действие<n>";
    pageItems.forEach((option) => {
        menuList += `${option.name}<n>`;
    });
    return menuList;
};
const getPaginatedKoap = () => {
    return currentKoapLines.join("<n>");
};
// ==================== ФУНКЦИИ SCREENNOTIFICATION ====================
const snAdd = (payload) => {
    try {
        const sn = window.interface('ScreenNotification');
        if (sn && typeof sn.hideAll === 'function') sn.hideAll();
        setTimeout(() => {
            try { window.interface('ScreenNotification').add(payload); } catch(e) {}
        }, 100);
    } catch(e) {}
};
let currentNotificationId = 0;
let isInActiveChase = false; // Флаг активной погони
const openTrackingNotification = (id) => {
    currentNotificationId++;
    snAdd(`[1, "Идет отслеживание", "ID: ${id}", "FF0000", 36000000]`);
    trackingNotificationOpen = true;
    chaseNotificationOpen = false;
    console.log('[TRACKING] ScreenNotification открыт (красный)');
};
const openChaseNotification = (id) => {
    currentNotificationId++;
    snAdd(`[1, "Начата погоня", "ID: ${id}", "0000FF", 36000000]`);
    trackingNotificationOpen = false;
    chaseNotificationOpen = true;
    console.log('[CHASE] ScreenNotification открыт (синий)');
};
const closeTrackingNotifications = () => {
    try {
        const screenNotif = window.interface('ScreenNotification');
        if (screenNotif && typeof screenNotif.hideAll === 'function') {
            screenNotif.hideAll();
            trackingNotificationOpen = false;
            chaseNotificationOpen = false;
            console.log('[TRACKING] Все уведомления закрыты через hideAll');
        }
    } catch (err) {
        console.error('[TRACKING] Ошибка закрытия ScreenNotification:', err);
    }
};
const startTracking = (id) => {
    // Очищаем старые интервалы
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (setmarkInterval) {
        clearInterval(setmarkInterval);
        setmarkInterval = null;
    }
    if (pgInterval) {
        clearInterval(pgInterval);
        pgInterval = null;
    }
 
    currentScanId = id;
    trackingName = `Отслеживание | {00FF00}Вкл`;
    trackingNickname = null;
    isInActiveChase = false; // Сброс флага погони
 
    // Открываем красное уведомление
    openTrackingNotification(id);
 
    // Начальные команды
    sendMessagesWithDelay([
        `/id ${currentScanId}`,
        `/setmark ${currentScanId}`,
        `/pg ${currentScanId}`
    ], [0, 500, 1000]);
 
    // Интервал /pg каждые 2 секунды (только если НЕ в активной погоне)
    pgInterval = setInterval(() => {
        if (currentScanId && !isInActiveChase) {
            sendChatInput(`/pg ${currentScanId}`);
        }
    }, 2000);
 
    // Интервал /setmark каждые 31 секунду
    setmarkInterval = setInterval(() => {
        if (currentScanId) {
            sendChatInput(`/setmark ${currentScanId}`);
        }
    }, 31000);
 
    setTimeout(() => {
        showMvdSubMenu(giveLicenseTo);
    }, 100);
};
const stopTracking = () => {
    // Очищаем все интервалы
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (setmarkInterval) {
        clearInterval(setmarkInterval);
        setmarkInterval = null;
    }
    if (pgInterval) {
        clearInterval(pgInterval);
        pgInterval = null;
    }
 
    // Закрываем все уведомления
    closeTrackingNotifications();
 
    currentScanId = null;
    trackingNickname = null;
    trackingName = `Отслеживание | {FF0000}Выкл`;
    isInActiveChase = false;
 
    console.log('[TRACKING] Отслеживание остановлено');
};
const toggleAutoCuff = () => {
    autoCuffEnabled = !autoCuffEnabled;
    autoCuffName = `Auto-cuff | ${autoCuffEnabled ? "{00FF00}Вкл" : "{FF0000}Выкл"}`;
};
const toggleAutoGrab = () => {
    autoGrabEnabled = !autoGrabEnabled;
    autoGrabName = `Авто-снаряжение | ${autoGrabEnabled ? "{00FF00}Вкл" : "{FF0000}Выкл"}`;
    try {
        if (autoGrabEnabled) {
            const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length)
                ? AUTO_GRAB_SKIP
                : ((typeof window._mvdGrabSkip !== 'undefined') ? window._mvdGrabSkip : []);
            const skip = (key) => skipList.includes(key);
            const allItems = [
                { key: 'medkit',     label: 'Аптечка' },
                { key: 'painkiller', label: 'Обезболивающее' },
                { key: 'baton',      label: 'Дубинка' },
                { key: 'baton2',     label: 'Жезл' },
                { key: 'vest',       label: 'Бронежилет' },
                { key: 'taumeter',   label: 'Тауметр' },
                { key: 'diag',       label: 'Диагностика' },
                { key: 'taser',      label: 'Тазер' },
                { key: 'deagle',     label: 'Desert Eagle' },
                { key: 'magnum',     label: 'Патроны .44' },
                { key: 'akm',        label: 'АКМ' },
                { key: 'ammo762',    label: 'Патроны 7.62' },
                { key: 'aks74u',     label: 'АКС-74У' },
                { key: 'ammo545',    label: 'Патроны 5.45' },
                { key: 'remington',  label: 'Remington 870' },
                { key: 'ammo12x70',  label: 'Патроны 12x70' },
            ];
            const takenItems = allItems.filter(i => !skip(i.key)).map(i => i.label);
            snAdd(`[1, "Авто-снаряжение", "Берётся: ${takenItems.join(', ')}", "00FF00", 5000]`);
        } else {
            snAdd(`[1, "Авто-снаряжение", "Выключено", "FF4444", 3000]`);
        }
    } catch(e) {
        console.warn('[MVD-GRAB] toggleAutoGrab notify error:', e);
    }
};
const SendGiveLicenseCommand = (to, index) => {
    if (index < 0 || index >= shownLicenseTypes.length)
        return;
    const selected = shownLicenseTypes[index];
    switch (selected.id) {
        case "mvd_main": // МВД
            lastMenuType = "mvd_sub";
            setTimeout(() => {
                showMvdSubMenu(giveLicenseTo);
            }, 100);
            break;
    }
};
const HandlePovsednevCommand = (optionIndex) => {
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex;
    if (adjustedIndex >= 0 && adjustedIndex < povsednevOptions.length) {
        const option = povsednevOptions[adjustedIndex];
        currentAction = option.action;
  
        // Динамическая проверка needsId: для "greeting" не запрашивать ID, если скин ОМОН (15340)
        const isOmonSkin = skinId === 15340;
        const needsIdForThis = option.needsId && !(option.action === "greeting" && isOmonSkin);
  
        if (needsIdForThis) {
            setTimeout(() => {
                showIdInputDialog(giveLicenseTo);
            }, 50);
        } else if (option.action === "fine") {
            setTimeout(() => {
                showKoapTypeMenu(giveLicenseTo);
            }, 50);
        } else if (option.action === "wantedFine") {
            currentUkLines = [...ukLines];
            ukPage = 0;
            setTimeout(() => {
                showUkInputDialog(giveLicenseTo);
            }, 50);
        } else {
            executePovsednevAction(option.action, giveLicenseTo);
        }
    }
};
const HandleStroyCommand = (optionIndex) => {
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex;
    if (adjustedIndex >= 0 && adjustedIndex < stroyOptions.length) {
        const option = stroyOptions[adjustedIndex];
        currentStroyAction = option.action;
  
        if (option.needsInput) {
            setTimeout(() => {
                showHourInputDialog(giveLicenseTo);
            }, 50);
        } else if (option.sub) {
            currentSubMenu = option.action;
            currentPage = 0;
            setTimeout(() => {
                if (option.action === "lecture") {
                    showLectureMenuPage(giveLicenseTo);
                } else if (option.action === "training") {
                    showTrainingMenuPage(giveLicenseTo);
                } else if (option.action === "special") {
                    showSpecialMenuPage(giveLicenseTo);
                }
            }, 50);
        } else {
            executeStroyAction(option.action);
        }
    }
};
const HandleMvdSubCommand = (index) => {
    if (index < 0 || index >= shownMvdSubTypes.length)
        return;
    const selected = shownMvdSubTypes[index];
    switch (selected.id) {
        case "povsednev":
            lastMenuType = "povsednev";
            currentPage = 0;
            setTimeout(() => {
                showPovsednevMenuPage(giveLicenseTo);
            }, 50);
            break;
        case "stroy":
            lastMenuType = "stroy";
            currentPage = 0;
            setTimeout(() => {
                showStroyMenuPage(giveLicenseTo);
            }, 50);
            break;
        case "tracking":
            if (currentScanId) {
                stopTracking();
                setTimeout(() => {
                    showMvdSubMenu(giveLicenseTo);
                }, 50);
            } else {
                setTimeout(() => {
                    showTrackingInputDialog(giveLicenseTo);
                }, 100);
            }
            break;
        case "autocuff":
            toggleAutoCuff();
            setTimeout(() => {
                showMvdSubMenu(giveLicenseTo);
            }, 50);
            break;
        case "autograb":
            toggleAutoGrab();
            setTimeout(() => {
                showMvdSubMenu(giveLicenseTo);
            }, 50);
            break;
    }
};
const HandleLectureCommand = (optionIndex) => {
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex;
    if (adjustedIndex >= 0 && adjustedIndex < lectureOptions.length) {
        const option = lectureOptions[adjustedIndex];
        executeStroyAction(option.action);
    }
};
const HandleTrainingCommand = (optionIndex) => {
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex;
    if (adjustedIndex >= 0 && adjustedIndex < trainingOptions.length) {
        const option = trainingOptions[adjustedIndex];
        executeStroyAction(option.action);
    }
};
const HandleSpecialCommand = (optionIndex) => {
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex;
    if (adjustedIndex >= 0 && adjustedIndex < specialOptions.length) {
        const option = specialOptions[adjustedIndex];
        executeStroyAction(option.action);
    }
};
const HandleKoapTypeCommand = (index) => {
    if (index === 0) {
        currentKoapType = 'pps';
    } else if (index === 1) {
        currentKoapType = 'dps';
    }
    currentKoapLines = currentKoapType === 'dps' ? dpsKoapLines : ppsKoapLines;
    koapPage = 0;
    setTimeout(() => {
        showKoapInputDialog(giveLicenseTo);
    }, 50);
};
const HandleKoapInput = (input) => {
    const lowerInput = input.toLowerCase().trim();
    if (lowerInput === 'все' || lowerInput === 'all') {
        currentKoapLines = currentKoapType === 'dps' ? dpsKoapLines : ppsKoapLines;
        setTimeout(() => { showKoapInputDialog(giveLicenseTo); }, 50);
        return;
    }
    const parts = input.trim().split(/\s+/);
    if (parts.length === 3) {
        const [id, cost, code] = parts;
        sendChatInput(`/ticket ${id} ${cost} ${code} КоАП`);
    } else if (lowerInput) {
        const originalLines = currentKoapType === 'dps' ? dpsKoapLines : ppsKoapLines;
        currentKoapLines = originalLines.filter(l => l.toLowerCase().includes(lowerInput));
        setTimeout(() => { showKoapInputDialog(giveLicenseTo); }, 50);
    }
};
const HandleUkInput = (input) => {
    const lowerInput = input.toLowerCase().trim();
    if (lowerInput === 'все' || lowerInput === 'all') {
        currentUkLines = [...ukLines];
        setTimeout(() => { showUkInputDialog(giveLicenseTo); }, 50);
        return;
    }
    const parts = input.trim().split(/\s+/);
    if (parts.length === 2) {
        const [id, code] = parts;
        const stars = ukStarsMap[code];
        if (stars !== undefined) {
            lastWantedCode = `${code} УК`;
            sendChatInput(`/su ${id} ${stars}`);
        } else {
            // статья не найдена в маппинге — показываем снова
            console.log(`[УК] Статья ${code} не найдена в маппинге`);
            setTimeout(() => { showUkInputDialog(giveLicenseTo); }, 50);
        }
    } else if (lowerInput) {
        currentUkLines = ukLines.filter(l => l.toLowerCase().includes(lowerInput));
        setTimeout(() => { showUkInputDialog(giveLicenseTo); }, 50);
    }
};
const executePovsednevAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    const isOmonSkin = skinId === 15340;
    switch (action) {
        case "greeting":
            if (isOmonSkin) {
                sendMessagesWithDelay([
                    `Работает сотрудник СОБР | Мой позывной ${CALLSIGN}`,
                    "Предъявите, пожалуйста, Ваши документы, удостоверяющие Вашу личность.",
                    "Если Вы в течение 30 секунд не предъявите мне документы я сочту это за 21.1 УК.",
                    "Если Вы убежите или попробуете это сделать я сочту это за 8.1 УК."
                ], [0, 500, 500, 500]);
            } else {
                sendMessagesWithDelay([
                    `Здравия желаю, Вас беспокоит ${RANK} - ${FIRST_NAME} ${LAST_NAME}.`,
                    "/do Удостоверение в кармане.",
                    "/me засунул руку, затем резким движением достал удостоверение",
                    "/do Удостоверение в руке.",
                    "/me открыл удостоверение и показал человеку напротив",
                    `/doc ${targetId}`
                ], [0, 1000, 1000, 1000, 1000, 1000]);
            }
            break;
      
        case "checkDocuments":
            if (isOmonSkin) {
                sendMessagesWithDelay([
                    "/s Работает СОБР, руки за голову!",
                    "/s Если Вы убежите или попробуете это сделать я сочту это за 8.1 УК",
                    "/s Готовим свои документы!"
                ], [750, 1000, 1000]);
            } else {
                sendMessagesWithDelay([
                    "Будьте добры предъявить Ваши документы, а именно:",
                    "Паспорт, вод.права и документы на т/с.",
                    "/n /pass [id], /carpass [id]",
                    "А также, отстегните пожалуйста ремень безопасности.",
                    "/n /rem"
                ], [0, 1000, 1000, 1000, 1000]);
            }
            break;
      
        case "studyDocuments":
            sendMessagesWithDelay([
                "/me взял документы",
                "/do Документы в руке.",
                "/me открыл документы на нужной странице",
                "/do Документы открыты.",
                "/me осмотрел страницу",
                "/do Страница осмотрена.",
                "/me закрыл документы",
                "/do Документы закрыты.",
                "/me вернул документы"
            ], [0, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500]);
            break;
      
        case "wantedFine":
            sendChatInput(`/su ${targetId}`);
            break;

        case "wanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/me сообщил данные о нарушителе диспетчеру",
                "/do Данные сообщены.",
                "/do Нарушитель объявлен в розыск.",
                `/su ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            break;
      
        case "scanningTablet":
            sendMessagesWithDelay([
                "/me достал фоторобот из кармана",
                "/do Фоторобот в руке.",
                "/me сделал снимок лица, затем сравнил с подозреваемым",
                "Вы задержаны так как находитесь в федеральном розыске."
            ], [0, 1000, 1000, 1000]);
            break;
      
        case "cuffing":
            sendMessagesWithDelay([
                "/do Наручники в руке.",
                "/me надел наручники на человека напротив",
                `/cuff ${targetId}`
            ], [0, 300, 300]);
            break;
      
        case "putInCar":
            sendMessagesWithDelay([
                "/me открыл дверь автомобиля",
                "/do Дверь открыта.",
                "/me посадил преступника в патрульный автомобиль",
                `/putpl ${targetId}`
            ], [0, 1000, 1000, 1000]);
            break;
      
        case "arrest":
            sendMessagesWithDelay([
                "/me открыл двери ППС",
                "/do Двери открыты.",
                "/me провел человека в участок",
                "/do Человек в участке.",
                `/arrest ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            break;
      
        case "uncuffing":
            sendMessagesWithDelay([
                "/me снял наручники с преступника",
                "/me повесил наручники на пояс",
                "/do Наручники на поясе.",
                `/uncuff ${targetId}`,
                "/me отпустил преступника",
                "/do Человек свободен.",
                `/escort ${targetId}`
            ], [0, 600, 600, 600, 600, 600, 600]);
            break;
      
        case "chase":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/do Рация в руках.",
                "/me сообщил диспетчеру, о погоне за нарушителем",
                `/Pg ${targetId}`
            ], [0, 500, 500, 500]);
            break;
      
        case "search":
            sendMessagesWithDelay([
                "Сейчас я проведу у вас обыск.",
                "Повернитесь спиной и поднимите руки.",
                "/me достал резиновые перчатки",
                "/me надел перчатки на руки",
                "/me провёл руками по верхним частям тела",
                "/me провёл руками по нижним частям тела",
                `/search ${targetId}`
            ], [0, 1000, 1004, 1007, 1010, 1000, 1000]);
            break;
      
        case "escort":
            sendMessagesWithDelay([
                "/me схватил задержанного за руки",
                "/me заломал задержанного и повёл задержанного",
                `/escort ${targetId}`
            ], [0, 300, 300]);
            break;
      
        case "clearWanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки, затем зажал кнопку",
                "/do Кнопка зажата.",
                "/me сообщил данные подозреваемого диспетчеру",
                "/do Данные сообщены диспетчеру.",
                "/do Диспетчер: С подозреваемого снят розыск.",
                `/clear ${targetId}`
            ], [0, 700, 700, 700, 700, 700]);
            break;
      
        case "confiscate":
            sendMessagesWithDelay([
                "Я нащупал что то.",
                "/me аккуратно нащупал и достал запрещенный предмет/вещество",
                "/do Пакет для вещественных докозательств в кармане.",
                "/me достал этот пакет и положил туда запрещенную вещь/вещество и закрыл пакет",
                `/remove ${targetId}`
            ], [0, 500, 500, 500, 500]);
            break;
      
        case "breakGlass":
            sendMessagesWithDelay([
                "/me открыл дверь авто.",
                "/me вытащил человека с авто",
                `/ejectout ${targetId}`
            ], [0, 300, 300]);
            break;
      
        case "removeMask":
            sendMessagesWithDelay([
                "/do Человек напротив находится в маске.",
                "/me протянув правую руку вперёд, сорвал маску с лица у человека напротив",
                "/do Маска сорвана, человек находится без маски на лице.",
                "/n Команда для снятие маски: /reset или /maskoff"
            ], [0, 400, 400, 400]);
            break;
      
        case "fingerprint":
            sendMessagesWithDelay([
                "/do Аппарат 'CТОЛ' в кармане.",
                "/me резким движением достал Аппарат",
                "/do Аппарат 'СТОЛ' в руке.",
                "/me резким движением потянул руку гражданина напротив и приложил его палец к аппарату",
                "/do Процесс сканирования начат.",
                "/do Процесс завершен.",
                "/do Личность установлена."
            ], [0, 700, 700, 700, 700, 700, 700]);
            break;
      
        case "takeLicense":
            sendMessagesWithDelay([
                "/me взял права, затем переложил их в левую руку",
                "/me взял блокнот и ручку в правую руку",
                "/do Блокнот и ручка в руке.",
                "/me записал данные о нарушении и нарушителе в блокнот",
                "/do Данные заполнены.",
                "/me забрал водительские права",
                "/do Водительские права изъяты.",
                `/takelic ${targetId}`
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
        case "miranda":
            sendMessagesWithDelay([
                "Вы задержаны. Вам необходимо знать ваши права.",
                "Вы имеете право хранить молчание.",
                "Вы имеете право на получение адвокатской помощи.",
                "Вы имеете право на обжалование действий сотрудника силовой структуры.",
                "Вам ясны ваши права?"
            ], [0, 1500, 1500, 1500, 1500]);
            break;
    }
};
const executeStroyAction = (action, hour = null, minute = null) => {
    const tag = rankTags[RANK] || `[${RANK}]`;
    switch (action) {
        case "stroy1":
            sendMessagesWithDelay([
                `/r ${tag} Внимание.`,
                `/r ${tag} Прошу прийти на плац.`,
                `/r ${tag} Напомню, строй начнется в ${hour}:${minute} по МСК.`,
                `/r ${tag} Касается это всего младшего состава.`,
                `/r ${tag} Спасибо за внимание.`
            ], [0, 1700, 1700, 1700, 1700]);
            break;
        case "stroy2":
            sendMessagesWithDelay([
                `/r ${tag} Внимание.*Повторяя*`,
                `/r ${tag} Прошу прийти на плац.*Повторяя*`,
                `/r ${tag} Напомню, строй начнется в ${hour}:${minute} по МСК.*Повторяя*`,
                `/r ${tag} Касается это всего младшего состава.*Повторяя*`,
                `/r ${tag} Спасибо за внимание.*Повторяя*`
            ], [0, 1500, 1500, 1500, 1500]);
            break;
        case "ust1":
            sendMessagesWithDelay([
                "/s Итак бойцы, сейчас я вам проведу лекцию на тему \"Устав\".",
                "/s Устав устанавливает стандарты служебной деятельности.",
                "/s Следование Уставу способствует дисциплине. Каждый сотрудник обязан знать свои права и обязанности",
                "/s Знать устав - ваша обязанность. Незнание не освобождает от наказания.",
                "/s Следование Уставу положительно сказывается на нашем имидже в глазах граждан",
                "/s Соблюдение Устава — это не только ваша обязанность, но и залог успешной службы.",
                "/s Лекция окончена.",
                "/c 060"
            ], [0, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
            break;
        case "sub1":
            sendMessagesWithDelay([
                "/s Коллеги,я хочу прочитать лекцию на тему \"Субординцация\"",
                "/s В силовых структурах нет слов: \"можно\",\"да\",\"нет\",\"привет\"",
                "/s Обращаться нужно так:",
                "/s \"Разрешите\",\"Так точно\",\"Никак нет\",\"Здравия желаю\"",
                "/s Ко всем обращаться строго по званию.К примеру:",
                "Т.Полковник,т.Сержант,т.Подполковник и т.д",
                "/s Обращаться ко всем сослуживцам без исключения только на \"Вы\"",
                "/s Запрещенно перечить или огрызаться со старшими по званию.",
                "/s Не соблюдение субординации, это прямое нарушение",
                "/c 060"
            ], [0, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]);
            break;
        case "trenya1":
            sendMessagesWithDelay([
                `/s Здравия. Я ${RANK} ${LAST_NAME}.`,
                "/s Сегодня я проведу вам тренировку",
                "/s Начнём с приседаний."
            ], [0, 1700, 1700]);
            break;
        case "trenya2":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Дальше разминка рук.",
                "/n /anim 8 1",
                "/c 60"
            ], [0, 1700, 1700, 1700]);
            break;
        case "trenya3":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Отжимания.",
                "/n /anim 6 23",
                "/c 60"
            ], [0, 1500, 1500, 1500]);
            break;
        case "trenya4":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s Бег по плацу 3 круга.",
                "/s Без прыжков."
            ], [0, 1500, 1500]);
            break;
        case "trenya5":
            sendMessagesWithDelay([
                "/s Восточное единоборство.",
                "/n /anim 8 2"
            ], [0, 1500]);
            break;
        case "trenya6":
            sendMessagesWithDelay([
                "/s Закончили.",
                "/s На этом наша тренировка закончена, но не расходимся."
            ], [0, 1500]);
            break;
        case "rp1":
            sendMessagesWithDelay([
                "/s Хочу вам сказать.",
                "/s У меня для вас есть задания."
            ], [0, 1700]);
            break;
        case "rp2":
            sendMessagesWithDelay([
                "/s Всем спасибо за помощь.",
                "/s Помогли очень сильно.",
                "/s На этой ноте я хочу вам сказать...",
                "/s Вы свободны, можете идти."
            ], [0, 1500, 1500, 1500]);
            break;
    }
};
window.showGiveLicenseDialog = (e) => {
    giveLicenseTo = e;
    currentMenu = null;
    let availableTypes = [];
    if (mvdSkins.includes(skinId)) {
        availableTypes.push({ name: "МВД", id: "mvd_main" });
    }
    shownLicenseTypes = availableTypes;
    let licenseList = '';
    availableTypes.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[666,2,"АХК tg:ZaharKonst | P: ${giveLicenseTo}","","Выбрать","Отмена",0,0]`, licenseList, 0);
};
window.showPovsednevMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "povsednev";
    const menuList = getPaginatedMenu(povsednevOptions);
    const hasNext = (currentPage + 1) * ITEMS_PER_PAGE < povsednevOptions.length ? 1 : 0;
    window.addDialogInQueue(
        `[667,5,"Повседневная (Стр. ${currentPage + 1})","","Выбрать","Отмена",1,${hasNext}]`,
        menuList,
        0
    );
};
window.showStroyMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "stroy";
    const menuList = getPaginatedMenu(stroyOptions);
    const hasNext = (currentPage + 1) * ITEMS_PER_PAGE < stroyOptions.length ? 1 : 0;
    window.addDialogInQueue(
        `[671,5,"Строй (Стр. ${currentPage + 1})","","Выбрать","Отмена",1,${hasNext}]`,
        menuList,
        0
    );
};
window.showLectureMenuPage = (e) => {
    giveLicenseTo = e;
    const menuList = getPaginatedMenu(lectureOptions);
    const hasNext = (currentPage + 1) * ITEMS_PER_PAGE < lectureOptions.length ? 1 : 0;
    window.addDialogInQueue(
        `[672,5,"Лекция (Стр. ${currentPage + 1})","","Выбрать","Отмена",1,${hasNext}]`,
        menuList,
        0
    );
};
window.showTrainingMenuPage = (e) => {
    giveLicenseTo = e;
    const menuList = getPaginatedMenu(trainingOptions);
    const hasNext = (currentPage + 1) * ITEMS_PER_PAGE < trainingOptions.length ? 1 : 0;
    window.addDialogInQueue(
        `[673,5,"Тренировка (Стр. ${currentPage + 1})","","Выбрать","Отмена",1,${hasNext}]`,
        menuList,
        0
    );
};
window.showSpecialMenuPage = (e) => {
    giveLicenseTo = e;
    const menuList = getPaginatedMenu(specialOptions);
    const hasNext = (currentPage + 1) * ITEMS_PER_PAGE < specialOptions.length ? 1 : 0;
    window.addDialogInQueue(
        `[674,5,"Спец.Задание (Стр. ${currentPage + 1})","","Выбрать","Отмена",1,${hasNext}]`,
        menuList,
        0
    );
};
window.showMvdSubMenu = (e) => {
    giveLicenseTo = e;
    currentMenu = "mvd_sub";
    let availableSub = [
        { name: "Повседневная", id: "povsednev" }
    ];
    if (stroyRanks.includes(RANK)) {
        availableSub.push({ name: "Строй", id: "stroy" });
    }
    availableSub.push({ name: trackingName, id: "tracking" });
    availableSub.push({ name: autoCuffName, id: "autocuff" });
    if (window.AUTO_GRAB === true) {
        availableSub.push({ name: autoGrabName, id: "autograb" });
    }
    shownMvdSubTypes = availableSub;
    let licenseList = '';
    availableSub.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[677,2,"МВД","","Выбрать","Отмена",0,0]`, licenseList, 0);
};
window.showKoapTypeMenu = (e) => {
    giveLicenseTo = e;
    currentMenu = "koap_type";
    const menuList = "1. ППС КоАП (Административный)<n>2. ДПС КоАП (ПДД)";
    window.addDialogInQueue(`[678,2,"Выбор типа КоАП","","Выбрать","Отмена",0,0]`, menuList, 0);
};
window.showKoapInputDialog = (e) => {
    giveLicenseTo = e;
    const typeUpper = currentKoapType.toUpperCase();
    let title = `${typeUpper === 'DPS' ? 'ДПС' : 'ППС'} КоАП`;
    if (currentKoapLines.length < (currentKoapType === 'dps' ? dpsKoapLines.length : ppsKoapLines.length)) {
        title += ' [Поиск]';
    }
    const text = getPaginatedKoap();
    window.addDialogInQueue(`[679,1,"${title}","Ввод: ID статья сумма | Поиск: введи текст | Сброс: все","Подтвердить","Отмена",0,0]`, text, 0);
};
window.showWantedStarsInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[680,1,"Розыск — Кол-во звёзд","Введите количество звёзд (1-6):","Далее","Отмена",0,0]`, "", 0);
};
const getPaginatedUk = () => {
    return currentUkLines.join('<n>');
};
window.showUkInputDialog = (e) => {
    giveLicenseTo = e;
    let title = `УК РФ`;
    if (currentUkLines.length < ukLines.length) {
        title += ' [Поиск]';
    }
    const text = getPaginatedUk();
    window.addDialogInQueue(`[681,1,"${title}","Ввод: ID статья | Поиск: введи текст | Сброс: все","Подтвердить","Отмена",0,0]`, text, 0);
};
window.showIdInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[668,1,"Ввод ID","Введите ID игрока:","Подтвердить","Отмена",0,0]`, "", 0);
};
window.showTrackingInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[669,1,"Отслеживание","Введите ID для отслеживания:","Начать","Отмена",0,0]`, "", 0);
};
window.showHourInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[675,1,"Ввод часа","Введите когда начнется строй (Час. по МСК):","Подтвердить","Отмена",0,0]`, "", 0);
};
window.showMinuteInputDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[676,1,"Ввод минуты","Введите когда начнется строй (Мин. по МСК):","Подтвердить","Отмена",0,0]`, "", 0);
};
window.sendClientEventCustom = (event, ...args) => {
    console.log(`Событие: ${event}, Аргументы:`, args);
    if (args[0] === "OnDialogResponse" && (args[1] >= 666 && args[1] <= 681)) {
        if (args[1] === 666) { // Главное меню
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                SendGiveLicenseCommand(giveLicenseTo, listitem);
            } else {
                lastMenuType = null;
                currentMenu = null;
            }
        }
        else if (args[1] === 667) { // Меню Повседневная
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandlePovsednevCommand(optionIndex);
            } else if (args[2] === 0 && _navPending) {
                _navPending = false;
                return;
            } else if (args[2] === 0) {
                // ESC — возврат в МВД подменю
                currentPage = 0;
                lastMenuType = null; currentMenu = null;
                setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
                return;
            }
        }
        else if (args[1] === 668) { // Диалог ввода ID
            const inputId = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1 && currentAction) {
                if (currentMenu === "povsednev") {
                    executePovsednevAction(currentAction, inputId);
                }
            }
            currentAction = null;
        }
        else if (args[1] === 669) { // Диалог ввода ID для отслеживания
            const inputId = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                startTracking(inputId);
            } else {
                stopTracking();
                setTimeout(() => {
                    showMvdSubMenu(giveLicenseTo);
                }, 50);
            }
        }
        else if (args[1] === 671) { // Меню Строй
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleStroyCommand(optionIndex);
            } else if (args[2] === 0 && _navPending) {
                _navPending = false;
                return;
            } else if (args[2] === 0) {
                currentPage = 0;
                lastMenuType = null; currentMenu = null;
                setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
                return;
            }
        }
        else if (args[1] === 672) { // Меню Лекция
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleLectureCommand(optionIndex);
            } else if (args[2] === 0 && _navPending) {
                _navPending = false;
                return;
            } else if (args[2] === 0) {
                currentPage = 0;
                currentSubMenu = null;
                setTimeout(() => showStroyMenuPage(giveLicenseTo), 50);
                return;
            }
        }
        else if (args[1] === 673) { // Меню Тренировка
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleTrainingCommand(optionIndex);
            } else if (args[2] === 0 && _navPending) {
                _navPending = false;
                return;
            } else if (args[2] === 0) {
                currentPage = 0;
                currentSubMenu = null;
                setTimeout(() => showStroyMenuPage(giveLicenseTo), 50);
                return;
            }
        }
        else if (args[1] === 674) { // Меню Спец.Задание
            const optionIndex = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleSpecialCommand(optionIndex);
            } else if (args[2] === 0 && _navPending) {
                _navPending = false;
                return;
            } else if (args[2] === 0) {
                currentPage = 0;
                currentSubMenu = null;
                setTimeout(() => showStroyMenuPage(giveLicenseTo), 50);
                return;
            }
        }
        else if (args[1] === 675) { // Ввод часа
            const inputHour = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1 && currentStroyAction) {
                tempHour = inputHour;
                setTimeout(() => {
                    showMinuteInputDialog(giveLicenseTo);
                }, 50);
            }
            else {
                currentStroyAction = null;
            }
        }
        else if (args[1] === 676) { // Ввод минуты
            const inputMinute = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1 && currentStroyAction && tempHour) {
                executeStroyAction(currentStroyAction, tempHour, inputMinute);
            }
            currentStroyAction = null;
            tempHour = null;
        }
        else if (args[1] === 677) { // Меню МВД sub
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleMvdSubCommand(listitem);
            }
        }
        else if (args[1] === 678) { // Выбор типа КоАП
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleKoapTypeCommand(listitem);
            }
        }
        else if (args[1] === 679) { // Input для КоАП
            const input = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleKoapInput(input);
            }
        }
        else if (args[1] === 681) { // Input для УК (розыск)
            const input = args[4];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                HandleUkInput(input);
            } else {
                wantedStars = null;
            }
        }
    } else {
        window.sendClientEventHandle(event, ...args);
    }
};
window.sendChatInputCustom = e => {
    const args = e.split(" ");
    if (args[0] == "/dahk") {
        targetId = args[1];
        // Получаем актуальный скин напрямую перед проверкой
        const freshSkin = getSkinIdFromStore();
        if (freshSkin !== null) skinId = Number(freshSkin);
        if (mvdSkins.includes(skinId)) {
            // Успешное открытие меню МВД
            snAdd('[0, "AHK by TG: ZaharKonst", "Меню фракции \'МВД\'", "0000FF", 5000]');
            if (lastMenuType === "povsednev") {
                showPovsednevMenuPage(args[1]);
            } else if (lastMenuType === "stroy") {
                showStroyMenuPage(args[1]);
            } else if (lastMenuType === "mvd_sub") {
                showMvdSubMenu(args[1]);
            } else {
                showMvdSubMenu(args[1]);
            }
        } else {
            // Ошибка: скин не подходит
            snAdd('[0, "AHK by TG: ZaharKonst", "Не удалось определить фракцию попробуйте ещё раз", "FFFFFF", 5000]');
        }
    } else if (args[0] == "/mvdreset") {
        lastMenuType = null;
        currentMenu = null;
        currentSubMenu = null;
        currentAction = null;
        currentStroyAction = null;
        currentPage = 0;
        stopTracking();
        autoCuffEnabled = false;
        trackingName = `Отслеживание | {FF0000}Выкл`;
        autoCuffName = `Auto-cuff | {FF0000}Выкл`;
        sendChatInput("Настройки МВД сброшены. Следующее /mvd откроет главное меню.");
    } else {
        window.App.developmentMode || engine.trigger("SendChatInput", e);
    }
};
function sendMessagesWithDelay(messages, delays, index = 0) {
    if (index >= messages.length) return;
    setTimeout(() => {
        sendChatInput(messages[index]);
        sendMessagesWithDelay(messages, delays, index + 1);
    }, delays[index]);
}


sendChatInput = sendChatInputCustom;
sendClientEvent = sendClientEventCustom;




// ==================== DIALOG MONITOR (console only) ====================
// Перехват серверных диалогов — вывод в консоль + авто-действия


const _dlgOrigAddDialogInQueue = window.addDialogInQueue;
window.addDialogInQueue = function(dialogParams, content, priority) {
    try {
        if (dialogParams && typeof dialogParams === 'string') {
            const parsed = JSON.parse(dialogParams.trim());
            const dialogId = parseInt(parsed[0]);
            const style    = parseInt(parsed[1]);
            const title    = (parsed[2] || '').replace(/\{[A-Fa-f0-9]{6}\}/g, '');
            const info     = (parsed[3] || '').replace(/\{[A-Fa-f0-9]{6}\}/g, '');
            const button1  = (parsed[4] || '');
            const button2  = (parsed[5] || '');

            const styleNames = {0:'MSGBOX', 1:'INPUT', 2:'LIST', 3:'PASSWORD', 4:'TABLIST', 5:'TABLIST_HEADERS'};

            let contentText = '';
            if (content) {
                const raw = Array.isArray(content) ? content.join('') : String(content);
                contentText = raw
                    .replace(/<t>/gi, ' | ')
                    .replace(/\{[A-Fa-f0-9]{6}\}/g, '')
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, '')
                    .split('<n>').join('\n')
                    .trim();
            }

            console.log(
                `[DIALOG] id=${dialogId} style=${styleNames[style] || style}\n` +
                `  Заголовок: ${title}\n` +
                `  Инфо: ${info}\n` +
                (contentText ? `  Контент:\n${contentText.split('\n').map(l => '    ' + l).join('\n')}\n` : '') +
                `  Кнопки: [${button1}] [${button2}]`
            );

            // ── Трекинг пагинированных диалогов для Q/E перелистывания ──
            if (PAGINATED_DIALOG_IDS.includes(dialogId)) {
                _lastPaginatedDialogId = dialogId;
                console.log(`[Q/E] Открыт пагинированный диалог ${dialogId}`);
            } else {
                _lastPaginatedDialogId = null;
            }

            // ── Авто-снаряжение МВД: LIST "Полицейская служба" (id=0) ──
            if (style === 2 && dialogId === 0 && title.includes('Полицейская служба') && window.AUTO_GRAB && typeof window.autoGrab === 'function') {
                if (!window._mvdGrabProcessing) {
                    console.log('=== [MVD-GRAB v2.1] 🎯 ТРИГГЕР СРАБОТАЛ — Полицейская служба ===');
                    setTimeout(() => window.autoGrab(), 150);
                }
            }

            // Авто-розыск УДАЛЁН — диалог "Причина выдачи розыска" теперь показывается игроку в обычном режиме
        }
    } catch (err) {
        console.error('[DIALOG] Ошибка перехвата:', err.message);
    }
    return _dlgOrigAddDialogInQueue.call(this, dialogParams, content, priority);
};

console.log('[DIALOG MONITOR] Загружен. Все диалоги выводятся в консоль.');
// ==================== END DIALOG MONITOR ====================

// ==================== АВТОБРАНИЕ МВД ====================
// Авто-снаряжение — включается только если AUTO_GRAB === true
// (LoadAhk патчит константы ниже перед eval)
// Используем var чтобы избежать SyntaxError при повторном объявлении через eval
var AUTO_GRAB = false;
var AUTO_GRAB_SKIP = [];
// Явно пишем в window чтобы showMvdSubMenu (загруженный ДО eval) видел значение
window.AUTO_GRAB = AUTO_GRAB;
window.AUTO_GRAB_SKIP = AUTO_GRAB_SKIP;
// Проверяем и локальную переменную и window (на случай если патч LoadAhk сработал через window)
if (AUTO_GRAB || window.AUTO_GRAB === true) {
(function() {
    console.log('=== [MVD-GRAB v2.1] 🔫 БЛОК AUTO_GRAB ЗАПУЩЕН ===');
    window.AUTO_GRAB = true; // гарантируем что window.AUTO_GRAB = true внутри блока

    // ==================== ID ПРЕДМЕТОВ ====================
    const ITEM = {
        DEAGLE:      19,   // Desert Eagle
        AMMO_MAGNUM: 363,  // Патроны .44 Magnum
        AKM:         21,   // АКМ
        AMMO_762:    368,  // Патроны 7.62x39
        BATON:       32,   // Дубинка
        MEDKIT:      2,    // Аптечка
        PAINKILLERS: 379,  // Обезболивающее
        RADAR_GUN:   276,  // Тауметр
        DIAGNOSTICS: 254,  // Набор диагностики
        TASER:       13,   // Тазер
        AKS74U:      18,   // АКС-74У
        REMINGTON:   14,   // Remington 870
        AMMO_545:    366,  // Патроны 5.45x39
        AMMO_1270:   365,  // Патроны 12x70
    };

    // ==================== ПОРОГИ ПАТРОНОВ ====================
    const AMMO_THRESHOLD = { MAGNUM: 30, AK762: 60, AKS545: 60, REM1270: 20 };

    // ==================== ПОЗИЦИИ В МЕНЮ МВД (0-based) ====================
    const MENU = {
        PAINKILLERS:  0,
        MEDKIT:       1,
        BATON:        2,
        WAND:         3,
        VEST:         4,
        RADAR_GUN:    5,
        DIAGNOSTICS:  6,
        TASER:        7,
        DEAGLE:       8,
        AKM:          9,
        AKS74U:      10,
        REMINGTON:   11,
        AMMO_MAGNUM: 12,
        AMMO_762:    13,
        AMMO_545:    14,
        AMMO_1270:   15,
    };

    const DIALOG_ID = 0;
    const CT = { ACC: 0, INV: 1, BACK: 2, EXTRA: 3 };

    let isProcessing = false;

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function notify(title, text, color = "FFFFFF") {
        snAdd(`[1, "${title}", "${text}", "${color}", 2500]`);
    }

    // ==================== БРОНЯ ЧЕРЕЗ ХУД ====================
    function getArmourValue() {
        try {
            const hud = window.interface("Hud");
            if (!hud) return 0;
            const armour = hud.$data?.info?.armour ?? hud.data?.info?.armour ?? 0;
            return Number(armour) || 0;
        } catch(e) { return 0; }
    }

    // ==================== ИНВЕНТАРЬ ====================
    function findItem(itemId) {
        try {
            const inv = window.interface("InventoryNew");
            if (!inv?.items) return null;
            for (const cid of [CT.INV, CT.BACK, CT.ACC]) {
                const c = inv.items[cid];
                if (!c) continue;
                for (const [slot, item] of Object.entries(c)) {
                    if (item?.id === itemId) return { cid, slot: parseInt(slot), count: item.count || 1 };
                }
            }
        } catch(e) {}
        return null;
    }

    function countItem(itemId) {
        try {
            const inv = window.interface("InventoryNew");
            if (!inv?.items) return 0;
            let total = 0;
            for (const cid of [CT.INV, CT.BACK]) {
                const c = inv.items[cid];
                if (!c) continue;
                for (const item of Object.values(c)) {
                    if (item?.id === itemId) total += (item.count || 1);
                }
            }
            return total;
        } catch(e) { return 0; }
    }

    function openInventory() { sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnInventoryDisplayChange"); }
    function closeInventory() { window.closeInterface("InventoryNew"); }

    async function waitInventory(maxMs = 1000) {
        for (let i = 0; i < maxMs; i += 50) {
            try {
                const inv = window.interface("InventoryNew");
                if (inv?.items?.[CT.INV] !== undefined) return true;
            } catch(e) {}
            await sleep(50);
        }
        return false;
    }

    // ==================== МЕНЮ ====================
    function take(index) {
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnDialogResponse", DIALOG_ID, 1, index, "");
    }

    function closeMenu() {
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnDialogResponse", DIALOG_ID, 0, 0, "");
    }

    function openMenu() {
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnPlayerClientSideKey", 18);
    }

    // ==================== ОСНОВНАЯ ЛОГИКА ====================
    async function autoGrab() {
        if (typeof autoGrabEnabled !== 'undefined' && !autoGrabEnabled) return;
        if (isProcessing) return;
        isProcessing = true;

        try {
            const armourVal = getArmourValue();

            // ── Шаг 1: открываем инвентарь — диалог меню остаётся открытым ──
            // НЕ закрываем меню перед чтением инвентаря (диалог живой на сервере)
            let ready = false;
            for (let attempt = 0; attempt < 2 && !ready; attempt++) {
                if (attempt > 0) await sleep(300);
                openInventory();
                ready = await waitInventory(1500);
            }
            if (!ready) {
                notify("Ошибка", "Инвентарь не открылся", "FF0000");
                isProcessing = false;
                return;
            }

            // ── Шаг 2: читаем что нужно ──
            const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length) ? AUTO_GRAB_SKIP : ((typeof window._mvdGrabSkip !== 'undefined') ? window._mvdGrabSkip : []);
            const skip = (key) => skipList.includes(key);

            const has = {
                medkit:      skip('medkit')      ? 999 : (findItem(ITEM.MEDKIT)      ? 1 : 0),
                baton:       skip('baton')       ? 1   : (findItem(ITEM.BATON)       ? 1 : 0),
                vest:        skip('vest') ? 100 : armourVal,
                deagle:      skip('deagle')      ? 1   : (findItem(ITEM.DEAGLE)      ? 1 : 0),
                magnum:      skip('magnum')      ? 999 : countItem(ITEM.AMMO_MAGNUM),
                akm:         skip('akm')         ? 1   : (findItem(ITEM.AKM)         ? 1 : 0),
                ammo762:     skip('ammo762')     ? 999 : countItem(ITEM.AMMO_762),
                painkillers: skip('painkiller')  ? 1   : (findItem(ITEM.PAINKILLERS) ? 1 : 0),
                radarGun:    skip('taumeter')    ? 1   : (findItem(ITEM.RADAR_GUN)   ? 1 : 0),
                diagnostics: skip('diag')        ? 1   : (findItem(ITEM.DIAGNOSTICS) ? 1 : 0),
                taser:       skip('taser')       ? 1   : (findItem(ITEM.TASER)       ? 1 : 0),
                aks74u:      skip('aks74u')      ? 1   : (findItem(ITEM.AKS74U)      ? 1 : 0),
                ammo545:     skip('ammo545')     ? 999 : countItem(ITEM.AMMO_545),
                remington:   skip('remington')   ? 1   : (findItem(ITEM.REMINGTON)   ? 1 : 0),
                ammo1270:    skip('ammo12x70')   ? 999 : countItem(ITEM.AMMO_1270),
                wand:        skip('baton2')      ? 1   : 0, // жезл — нет ID, берём всегда
            };

            const need = {
                painkillers: !has.painkillers,
                medkit:      has.medkit < 1,
                baton:       !has.baton,
                wand:        !has.wand,
                vest:        has.vest < 10,
                radarGun:    !has.radarGun,
                diagnostics: !has.diagnostics,
                taser:       !has.taser,
                deagle:      !has.deagle,
                magnum:      has.magnum < AMMO_THRESHOLD.MAGNUM,
                akm:         !has.akm,
                ammo762:     has.ammo762 < AMMO_THRESHOLD.AK762,
                aks74u:      !has.aks74u,
                ammo545:     has.ammo545 < AMMO_THRESHOLD.AKS545,
                remington:   !has.remington,
                ammo1270:    has.ammo1270 < AMMO_THRESHOLD.REM1270,
            };

            // ── Шаг 3: закрываем инвентарь — диалог меню всё ещё живой ──
            closeInventory();
            await sleep(150);

            if (!Object.values(need).some(Boolean)) {
                notify("МВД", "Всё снаряжение есть ✓", "00FF00");
                isProcessing = false;
                return;
            }

            // ── Шаг 4: диалог открыт, сразу берём — НЕ переоткрываем меню ──

            // ── Тазер + Дигл одновременно несовместимы в руке.
            //    Если нужны оба: берём тазер (в руку), дигл тоже берём, но
            //    сразу после перекладываем его в рюкзак через OnInventoryItemMove.
            //    Флаг для пост-обработки:
            const needBothTaserDeagle = need.taser && need.deagle;

            const toTake = [];
            if (need.painkillers) toTake.push({ name: "Обезболивающее",                          idx: MENU.PAINKILLERS });
            if (need.medkit)      toTake.push({ name: "Аптечка",                                 idx: MENU.MEDKIT });
            if (need.baton)       toTake.push({ name: "Дубинка",                                 idx: MENU.BATON });
            if (need.wand)        toTake.push({ name: "Жезл",                                    idx: MENU.WAND });
            if (need.vest)        toTake.push({ name: `Бронежилет (${armourVal}%)`,              idx: MENU.VEST });
            if (need.radarGun)    toTake.push({ name: "Тауметр",                                 idx: MENU.RADAR_GUN });
            if (need.diagnostics) toTake.push({ name: "Диагностика",                             idx: MENU.DIAGNOSTICS });
            // Если нужны оба — дигл берём первым (он займёт руку), тазер потом → рюкзак
            if (need.deagle)      toTake.push({ name: "Desert Eagle",                            idx: MENU.DEAGLE });
            // Тазер: берём в любом случае (если нужен) — потом переложим в рюкзак если оба
            if (need.taser)       toTake.push({ name: "Тазер",                                   idx: MENU.TASER });
            if (need.magnum)      toTake.push({ name: `Патроны .44 (есть: ${has.magnum})`,       idx: MENU.AMMO_MAGNUM });
            if (need.akm)         toTake.push({ name: "АКМ",                                     idx: MENU.AKM });
            if (need.ammo762)     toTake.push({ name: `Патроны 7.62 (есть: ${has.ammo762})`,     idx: MENU.AMMO_762 });
            if (need.aks74u)      toTake.push({ name: "АКС-74У",                                 idx: MENU.AKS74U });
            if (need.ammo545)     toTake.push({ name: `Патроны 5.45 (есть: ${has.ammo545})`,     idx: MENU.AMMO_545 });
            if (need.remington)   toTake.push({ name: "Remington 870",                           idx: MENU.REMINGTON });
            if (need.ammo1270)    toTake.push({ name: `Патроны 12x70 (есть: ${has.ammo1270})`,   idx: MENU.AMMO_1270 });

            for (let i = 0; i < toTake.length; i++) {
                const delay = Math.floor(Math.random() * 700) + 500; // рандом 500–1200мс
                console.log(`[MVD-GRAB] → беру: ${toTake[i].name} (idx=${toTake[i].idx}) [задержка: ${delay}мс]`);
                take(toTake[i].idx);
                await sleep(delay); // случайная задержка между предметами
            }

            const notifyNames = toTake.map(t => t.name.replace(/ \(есть: \d+\)/, ''));
            notify("МВД", notifyNames.join(", "), "00FF00");
            window.playSound("inventory/take_light.mp3");

            // ── Шаг 5: финальная проверка — если тазер в INV и дигл тоже есть,
            //    перекладываем тазер в рюкзак (цель: дигл в руке, тазер в рюкзаке)
            //    Срабатывает всегда когда оба предмета присутствуют — не только при needBothTaserDeagle
            {
                // Ждём пока все предметы появятся в инвентаре
                await sleep(800);
                openInventory();
                await waitInventory(2000);
                await sleep(300);

                try {
                    const inv = window.interface("InventoryNew");
                    // Ищем тазер в INV (все стеки)
                    let taserInvSlot = -1, taserInvCount = 0;
                    const invItems = inv?.items?.[CT.INV];
                    if (invItems) {
                        for (const [s, item] of Object.entries(invItems)) {
                            if (item?.id === ITEM.TASER) {
                                taserInvSlot = parseInt(s);
                                taserInvCount = item.count || 1;
                                break;
                            }
                        }
                    }

                    // Есть ли дигл где-либо?
                    const deagleLoc2 = findItem(ITEM.DEAGLE);

                    if (taserInvSlot >= 0 && deagleLoc2) {
                        // Тазер в руке + дигл есть → тазер нужно убрать в рюкзак
                        let backFreeSlot = -1;
                        const backpack = inv?.items?.[CT.BACK];
                        for (let s = 0; s < 50; s++) {
                            if (!backpack || !backpack[s]) { backFreeSlot = s; break; }
                        }

                        closeInventory();
                        await sleep(150);

                        if (backFreeSlot >= 0) {
                            sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnInventoryItemMove",
                                parseInt(CT.INV),  parseInt(taserInvSlot),
                                parseInt(CT.BACK), parseInt(backFreeSlot),
                                parseInt(taserInvCount)
                            );
                            console.log(`[MVD-GRAB] Тазер (слот ${taserInvSlot} x${taserInvCount}) → рюкзак (слот ${backFreeSlot})`);
                            notify("МВД", "Тазер → рюкзак (дигл в руке)", "00FF88");
                        } else {
                            notify("МВД", "Рюкзак полон — тазер в руке", "FFA500");
                        }
                    } else {
                        closeInventory();
                    }
                } catch(e) {
                    console.error('[MVD-GRAB] Ошибка шага 5:', e);
                    closeInventory();
                }
            }

        } catch (err) {
            console.error('[MVD-GRAB] Ошибка:', err);
            notify("Ошибка", err.message, "FF0000");
        } finally {
            isProcessing = false;
        }
    }

    // ==================== ТРИГГЕР ====================
    // Авто-снаряжение запускается из общего хука addDialogInQueue (строка ~1541)
    // который ловит диалог style=LIST title="Полицейская служба" и вызывает window.autoGrab().
    // Публикуем autoGrab и флаг isProcessing через window._mvdGrabProcessing.
    window.autoGrab = autoGrab;
    Object.defineProperty(window, '_mvdGrabProcessing', {
        get: () => isProcessing,
        configurable: true
    });
    console.log('=== [MVD-GRAB v2.1] ✅ ГОТОВ — жду диалог Полицейская служба ===');
})();
} // end if (AUTO_GRAB)
// ==================== END АВТОБРАНИЕ МВД ====================

// ==================== СВОП ТАЗЕР ↔ ДИГЛ (Alt+H) ====================
// Работает всегда — независимо от AUTO_GRAB
(function() {
    const ITEM_TASER = 13;
    const ITEM_DEAGLE = 19;
    const ITEM_NAMES = { [ITEM_TASER]: 'Тазер(13)', [ITEM_DEAGLE]: 'Дигл(19)' };
    const CT = { ACC: 0, INV: 1, BACK: 2, EXTRA: 3 };
    const CT_NAMES = { 0: 'ACC', 1: 'INV', 2: 'BACK', 3: 'EXTRA' };

    let _swapBusy = false;

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function snNotify(title, text, color) {
        try {
            const sn = window.interface('ScreenNotification');
            if (sn && typeof sn.hideAll === 'function') sn.hideAll();
            setTimeout(() => {
                try { window.interface('ScreenNotification').add(`[1, "${title}", "${text}", "${color}", 2500]`); } catch(e) {}
            }, 60);
        } catch(e) {}
    }

    // ── Полное логирование инвентаря ──
    function logInventory(label) {
        try {
            const inv = window.interface("InventoryNew");
            if (!inv?.items) { console.log(`[INV-LOG] ${label}: items недоступны`); return; }
            const lines = [`[INV-LOG] ── ${label} ──`];
            for (const cid of [CT.ACC, CT.INV, CT.BACK, CT.EXTRA]) {
                const c = inv.items[cid];
                if (!c) continue;
                const entries = Object.entries(c);
                if (entries.length === 0) {
                    lines.push(`  ${CT_NAMES[cid]}(${cid}): пусто`);
                    continue;
                }
                for (const [slot, item] of entries) {
                    if (!item) continue;
                    const name = ITEM_NAMES[item.id] || `item${item.id}`;
                    lines.push(`  ${CT_NAMES[cid]}(${cid}) slot${slot}: ${name} x${item.count||1} w=${item.weight}`);
                }
            }
            console.log(lines.join('\n'));
        } catch(e) { console.log(`[INV-LOG] ${label}: ошибка`, e); }
    }

    // ── Найти предмет по id.
    //    consolidate=true → суммирует все стеки в одном контейнере и возвращает
    //    { cid, slot (первого стека), count (суммарный), allSlots[] }
    function findItem(itemId, consolidate) {
        try {
            const inv = window.interface("InventoryNew");
            if (!inv?.items) return null;
            for (const cid of [CT.INV, CT.BACK, CT.ACC, CT.EXTRA]) {
                const c = inv.items[cid];
                if (!c) continue;
                let firstSlot = -1, totalCount = 0, allSlots = [];
                for (const [slot, item] of Object.entries(c)) {
                    if (item?.id === itemId) {
                        const s = parseInt(slot);
                        const cnt = item.count || 1;
                        if (firstSlot === -1) firstSlot = s;
                        totalCount += cnt;
                        allSlots.push({ slot: s, count: cnt });
                    }
                }
                if (firstSlot !== -1) {
                    const loc = { cid, slot: firstSlot, count: consolidate ? totalCount : allSlots[0].count, allSlots };
                    console.log(`[SWAP] findItem(${ITEM_NAMES[itemId]||itemId}): ${CT_NAMES[cid]} slot${firstSlot} x${loc.count} (стеков: ${allSlots.length})`);
                    return loc;
                }
            }
        } catch(e) {}
        console.log(`[SWAP] findItem(${ITEM_NAMES[itemId]||itemId}): НЕ НАЙДЕН`);
        return null;
    }

    // ── Найти свободный слот, исключая занятые excludeSlots ──
    function findFreeSlot(targetCid, excludeSlots) {
        const excl = new Set(excludeSlots || []);
        try {
            const inv = window.interface("InventoryNew");
            if (!inv?.items) {
                console.warn(`[SWAP] findFreeSlot(${CT_NAMES[targetCid]}): inv.items недоступен!`);
                return -1;
            }
            const container = inv.items[targetCid];
            if (container === undefined || container === null) {
                // контейнер полностью пуст — ищем первый не-исключённый
                for (let s = 0; s < 50; s++) {
                    if (!excl.has(s)) {
                        console.log(`[SWAP] findFreeSlot(${CT_NAMES[targetCid]}): контейнер пуст → slot ${s}`);
                        return s;
                    }
                }
                return -1;
            }
            for (let s = 0; s < 50; s++) {
                if (!container[s] && !excl.has(s)) {
                    console.log(`[SWAP] findFreeSlot(${CT_NAMES[targetCid]}): свободен slot ${s}`);
                    return s;
                }
            }
            console.warn(`[SWAP] findFreeSlot(${CT_NAMES[targetCid]}): нет свободных слотов`);
        } catch(e) { console.error(`[SWAP] findFreeSlot error:`, e); }
        return -1;
    }

    function moveItem(fromCid, fromSlot, toCid, toSlot, count) {
        const cnt = count || 1;
        console.log(`[SWAP] moveItem: ${CT_NAMES[fromCid]}[${fromSlot}] → ${CT_NAMES[toCid]}[${toSlot}] x${cnt}`);
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnInventoryItemMove",
            parseInt(fromCid), parseInt(fromSlot),
            parseInt(toCid),   parseInt(toSlot),
            parseInt(cnt)
        );
    }

    function openInventory() {
        console.log('[SWAP] openInventory()');
        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnInventoryDisplayChange");
    }
    function closeInventory() {
        console.log('[SWAP] closeInventory()');
        try { window.closeInterface("InventoryNew"); } catch(e) {}
    }

    // ── Ждём пока инвентарь полностью загрузится (INV + BACK) ──
    async function waitInventory(maxMs) {
        console.log(`[SWAP] waitInventory(${maxMs}ms)...`);
        for (let i = 0; i < maxMs; i += 50) {
            try {
                const inv = window.interface("InventoryNew");
                if (inv?.items?.[CT.INV] !== undefined && inv?.items?.[CT.BACK] !== undefined) {
                    console.log(`[SWAP] waitInventory: готов за ${i}мс`);
                    return true;
                }
            } catch(e) {}
            await sleep(50);
        }
        // Fallback: хотя бы INV
        try {
            const inv = window.interface("InventoryNew");
            if (inv?.items?.[CT.INV] !== undefined) {
                console.warn('[SWAP] waitInventory: INV есть, BACK нет — продолжаем');
                return true;
            }
        } catch(e) {}
        console.error('[SWAP] waitInventory: таймаут!');
        return false;
    }

    // ══════════════════════════════════════════════════════════════════════
    // ЛОГИКА СВОПА (Alt+H) v4 — FIX: корректная работа со стеками тазера
    //
    //   ЦЕЛЬ: переключать активное оружие между дигл (INV) и тазер (BACK)
    //
    //   СЦЕНАРИИ:
    //     • Оба в INV         → тазер (весь стек) → свободный слот BACK
    //     • Дигл в INV        → дигл→свободный BACK, затем тазер (весь стек из BACK)→INV[deagleSlot]
    //     • Тазер в INV       → тазер→свободный BACK, затем дигл из BACK→INV[taserSlot]
    //     • Ни один в INV     → взять дигл из BACK (или тазер) в свободный INV
    //
    //   КЛЮЧЕВЫЕ ИСПРАВЛЕНИЯ vs v3:
    //     1. findItem теперь суммирует все стеки тазера в одном контейнере
    //        (после авто-снаряжения в рюкзаке могут быть 2 стека: x1 и x29)
    //     2. Прямой обмен УБРАН — вместо него последовательные ходы через
    //        свободные слоты, чтобы не класть дигл на занятый слот тазера
    //     3. При переносе всего тазера из BACK в INV переносим каждый стек
    //        отдельно в один и тот же целевой слот (сервер смёрджит стеки)
    // ══════════════════════════════════════════════════════════════════════
    async function swapTaserDeagle() {
        if (_swapBusy) { console.log('[SWAP] занят, пропускаем'); return; }
        _swapBusy = true;
        console.log('[SWAP] ══ ALT+H нажат ══');
        try {
            // 1. Открываем инвентарь
            openInventory();
            const ready = await waitInventory(3000);
            if (!ready) {
                snNotify("Ошибка", "Инвентарь не открылся", "FF0000");
                closeInventory();
                return;
            }
            // Дополнительная пауза для полной инициализации BACK
            await sleep(200);

            // 2. Логируем состояние инвентаря
            logInventory('ДО СВОПА');

            // 3. Читаем позиции (consolidate=true — суммируем стеки)
            const taserLoc  = findItem(ITEM_TASER,  true);
            const deagleLoc = findItem(ITEM_DEAGLE, false);

            if (!taserLoc && !deagleLoc) {
                snNotify("Своп", "Тазер и Дигл не найдены", "FF4444");
                closeInventory();
                return;
            }

            const taserInINV  = taserLoc  && taserLoc.cid  === CT.INV;
            const deagleInINV = deagleLoc && deagleLoc.cid === CT.INV;
            const bothInINV   = taserInINV && deagleInINV;

            console.log(`[SWAP] taserInINV=${taserInINV} deagleInINV=${deagleInINV} bothInINV=${bothInINV}`);

            // 4. Свободные слоты — считаем ДО закрытия
            //    При поиске свободного слота в BACK исключаем уже занятые тазером слоты,
            //    чтобы не попасть туда же снова
            const taserBackSlots = (taserLoc && taserLoc.cid === CT.BACK)
                ? taserLoc.allSlots.map(x => x.slot) : [];
            const deagleBackSlot = (deagleLoc && deagleLoc.cid === CT.BACK)
                ? deagleLoc.slot : -1;

            const backFreeSlot = findFreeSlot(CT.BACK, [...taserBackSlots, deagleBackSlot !== -1 ? deagleBackSlot : -999].filter(s => s >= 0));
            const invFreeSlot  = findFreeSlot(CT.INV);

            // 5. Закрываем инвентарь
            closeInventory();
            await sleep(120);

            // ── СЦЕНАРИИ ──

            if (bothInINV) {
                // Оба в INV: тазер целиком → рюкзак (дигл остаётся в руке)
                if (backFreeSlot >= 0) {
                    moveItem(CT.INV, taserLoc.slot, CT.BACK, backFreeSlot, taserLoc.count);
                    snNotify("Своп", "Тазер → рюкзак", "00FF88");
                } else {
                    snNotify("Своп", "Рюкзак полон!", "FF4444");
                }

            } else if (deagleInINV) {
                // Дигл в INV → переложить дигл в BACK, тазер из BACK → в слот дигла
                const taserInBack = taserLoc && taserLoc.cid === CT.BACK;
                if (taserInBack && backFreeSlot >= 0) {
                    // Шаг 1: дигл → свободный слот BACK
                    moveItem(CT.INV, deagleLoc.slot, CT.BACK, backFreeSlot, deagleLoc.count);
                    await sleep(600);
                    // Шаг 2: каждый стек тазера → в освободившийся слот дигла в INV
                    //         Сервер смёрджит стеки автоматически
                    for (const stk of taserLoc.allSlots) {
                        moveItem(CT.BACK, stk.slot, CT.INV, deagleLoc.slot, stk.count);
                        await sleep(500);
                    }
                    snNotify("Своп", "Дигл → рюкзак | Тазер → рука", "00FF88");
                } else if (backFreeSlot >= 0) {
                    // Тазер не найден — просто убираем дигл в рюкзак
                    moveItem(CT.INV, deagleLoc.slot, CT.BACK, backFreeSlot, deagleLoc.count);
                    snNotify("Своп", "Дигл → рюкзак (тазер не найден)", "FFA500");
                } else {
                    snNotify("Своп", "Рюкзак полон!", "FF4444");
                }

            } else if (taserInINV) {
                // Тазер в INV → переложить тазер в BACK, дигл из BACK → в слот тазера
                const deagleInBack = deagleLoc && deagleLoc.cid === CT.BACK;
                if (deagleInBack && backFreeSlot >= 0) {
                    // Шаг 1: тазер → свободный слот BACK
                    moveItem(CT.INV, taserLoc.slot, CT.BACK, backFreeSlot, taserLoc.count);
                    await sleep(600);
                    // Шаг 2: дигл → в освободившийся слот тазера в INV
                    moveItem(CT.BACK, deagleLoc.slot, CT.INV, taserLoc.slot, deagleLoc.count);
                    snNotify("Своп", "Тазер → рюкзак | Дигл → рука", "00FF88");
                } else if (backFreeSlot >= 0) {
                    // Дигл не найден — просто убираем тазер в рюкзак
                    moveItem(CT.INV, taserLoc.slot, CT.BACK, backFreeSlot, taserLoc.count);
                    snNotify("Своп", "Тазер → рюкзак (дигл не найден)", "FFA500");
                } else {
                    snNotify("Своп", "Рюкзак полон!", "FF4444");
                }

            } else {
                // Ни один не в INV: достать дигл (приоритет) или тазер в руку
                if (deagleLoc && deagleLoc.cid === CT.BACK) {
                    if (invFreeSlot >= 0) {
                        moveItem(CT.BACK, deagleLoc.slot, CT.INV, invFreeSlot, deagleLoc.count);
                        snNotify("Своп", "Дигл → рука", "00FF88");
                    } else {
                        snNotify("Своп", "Инвентарь полон!", "FF4444");
                    }
                } else if (taserLoc && taserLoc.cid === CT.BACK) {
                    if (invFreeSlot >= 0) {
                        // Берём только первый стек тазера (чаще всего одиночный)
                        moveItem(CT.BACK, taserLoc.allSlots[0].slot, CT.INV, invFreeSlot, taserLoc.allSlots[0].count);
                        snNotify("Своп", "Тазер → рука", "00FF88");
                    } else {
                        snNotify("Своп", "Инвентарь полон!", "FF4444");
                    }
                } else {
                    snNotify("Своп", "Нет предметов для свопа", "FF4444");
                }
            }

        } catch(err) {
            console.error('[SWAP] Критическая ошибка:', err);
            snNotify("Своп", "Ошибка: " + err.message, "FF0000");
        } finally {
            // Небольшая задержка перед сбросом флага чтобы избежать двойного нажатия
            await sleep(500);
            _swapBusy = false;
            console.log('[SWAP] ══ завершён, флаг сброшен ══');
        }
    }

    window._mvdSwapTaserDeagle = swapTaserDeagle;
    // Экспортируем logInventory для ручного вызова из консоли
    window._mvdLogInventory = () => {
        openInventory();
        setTimeout(() => { logInventory('РУЧНОЙ ЛОГ'); setTimeout(closeInventory, 300); }, 800);
    };
    console.log('[SWAP] Alt+H — своп тазер ↔ дигл v4 готов. window._mvdLogInventory() — посмотреть инвентарь');
})();
// ==================== END СВОП ТАЗЕР ↔ ДИГЛ ====================
