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
                    try {
                        window.interface('ScreenNotification').add(
                            '[1, "Выдача штрафа", "У вас еще к/д на выдачу штрафа", "FF0000", 5000]'
                        );
                        console.log('[FINE] ScreenNotification: кулдаун штрафа');
                    } catch (err) {
                        console.error('[FINE] Ошибка ScreenNotification:', err);
                    }
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
let currentNotificationId = 0;
let isInActiveChase = false; // Флаг активной погони
const openTrackingNotification = (id) => {
    try {
        currentNotificationId++;
      
        const screenNotif = window.interface('ScreenNotification');
        if (screenNotif && typeof screenNotif.hideAll === 'function') {
            screenNotif.hideAll();
        }
      
        setTimeout(() => {
            try {
                window.interface('ScreenNotification').add(
                    `[1, "Идет отслеживание", "ID: ${id}", "FF0000", 36000000]`
                );
                trackingNotificationOpen = true;
                chaseNotificationOpen = false;
                console.log('[TRACKING] ScreenNotification открыт (красный)');
            } catch (err) {
                console.error('[TRACKING] Ошибка при добавлении уведомления:', err);
            }
        }, 100);
      
    } catch (err) {
        console.error('[TRACKING] Ошибка открытия ScreenNotification:', err);
    }
};
const openChaseNotification = (id) => {
    try {
        currentNotificationId++;
      
        const screenNotif = window.interface('ScreenNotification');
        if (screenNotif && typeof screenNotif.hideAll === 'function') {
            screenNotif.hideAll();
        }
      
        setTimeout(() => {
            try {
                window.interface('ScreenNotification').add(
                    `[1, "Начата погоня", "ID: ${id}", "0000FF", 36000000]`
                );
                trackingNotificationOpen = false;
                chaseNotificationOpen = true;
                console.log('[CHASE] ScreenNotification открыт (синий)');
            } catch (err) {
                console.error('[CHASE] Ошибка при добавлении уведомления:', err);
            }
        }, 100);
      
    } catch (err) {
        console.error('[CHASE] Ошибка открытия ScreenNotification:', err);
    }
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
            if (typeof window.autoGrab === 'function') window.autoGrab();
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
                    "/anim 1 7",
                    "/do Удостоверение в кармане.",
                    "/me засунул руку, затем резким движением достал удостоверение",
                    "/do Удостоверение в руке.",
                    "/me открыл удостоверение и показал человеку напротив",
                    `/doc ${targetId}`
                ], [0, 1000, 1000, 1000, 1000, 1000, 1000]);
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
                "У вас есть право на молчание, телефонный звонок",
                "Так же есть право на адвоката, если у вас нет средств его оплатить...",
                "Его предоставит государство",
                "Так-же все что вы скажете будет использовано против вас в суде"
            ], [0, 1500, 1500, 1500]);
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
    if (window.AUTO_GRAB) {
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
            try {
                window.interface('ScreenNotification').add(
                    '[0, "AHK by TG: ZaharKonst", "Меню фракции \'МВД\'", "0000FF", 5000]'
                );
            } catch (err) {
                console.error('[MVD] Ошибка ScreenNotification:', err);
            }
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
            try {
                window.interface('ScreenNotification').add(
                    '[0, "AHK by TG: ZaharKonst", "Не удалось определить фракцию попробуйте ещё раз", "FFFFFF", 5000]'
                );
            } catch (err) {
                console.error('[ERROR] Ошибка ScreenNotification:', err);
            }
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

// Флаг: ожидаем INPUT диалог розыска после выбора "ввести вручную"
let _awaitingRoziskInput = false;

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

            // ── Авто-розыск: LIST "Причина выдачи розыска" → выбрать "Ввести вручную" ──
            if (style === 2 && title.includes('Причина выдачи розыска')) {
                console.log('[AUTO-РОЗЫСК] Обнаружен диалог выбора причины — авто-выбор "Ввести в ручную"');
                _awaitingRoziskInput = true;
                setTimeout(() => {
                    // listitem=1 — второй пункт ("Ввести причину в ручную"), response=1
                    sendClientEvent(
                        (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                            ? window.gm.EVENT_EXECUTE_PUBLIC
                            : 'server',
                        'OnDialogResponse', dialogId, 1, 1, ''
                    );
                    console.log('[AUTO-РОЗЫСК] Отправлен выбор пункта 2 (ввести вручную)');
                }, 200);
            }

            // ── Авто-розыск: INPUT "Причина выдачи розыска" → вставить причину и закрыть диалог ──
            if (style === 1 && title.includes('Причина выдачи розыска') && _awaitingRoziskInput) {
                _awaitingRoziskInput = false;
                const reason = lastWantedCode || '1.1 УК';
                const _roziskDialogId = dialogId;
                console.log(`[AUTO-РОЗЫСК] Обнаружен INPUT диалог — авто-ввод причины "${reason}"`);
                setTimeout(() => {
                    // Отправляем ответ серверу напрямую через оригинальный обработчик
                    _origSendClientEventHandle.call(
                        window,
                        (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                            ? window.gm.EVENT_EXECUTE_PUBLIC
                            : 'server',
                        'OnDialogResponse', _roziskDialogId, 1, 0, reason
                    );
                    console.log(`[AUTO-РОЗЫСК] Причина "${reason}" отправлена`);
                    lastWantedCode = null;
                    // Закрываем UI диалога несколькими способами
                    setTimeout(() => {
                        try { if (typeof window.removeDialogFromQueue === 'function') window.removeDialogFromQueue(); } catch(e) {}
                        try { if (typeof window.closeDialog === 'function') window.closeDialog(); } catch(e) {}
                        try {
                            const dlgInterface = window.interface && window.interface('Dialog');
                            if (dlgInterface && typeof dlgInterface.close === 'function') dlgInterface.close();
                            if (dlgInterface && typeof dlgInterface.hide === 'function') dlgInterface.hide();
                        } catch(e) {}
                        // Эмулируем нажатие ESC для закрытия диалога
                        try {
                            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true });
                            document.dispatchEvent(escEvent);
                        } catch(e) {}
                        console.log('[AUTO-РОЗЫСК] Диалог закрыт');
                    }, 100);
                }, 300);
            }
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
if (AUTO_GRAB) {
(function() {
    console.log('[MVD-GRAB] 🔫 Загружен (AUTO_GRAB включён)');

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
        try { window.interface('ScreenNotification').add(`[1, "${title}", "${text}", "${color}", 2500]`); } catch(e) {}
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
        if (isProcessing) return;
        isProcessing = true;

        try {
            const armourVal = getArmourValue();
            closeMenu();
            await sleep(200);

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

            // ── Проверяем наличие предметов ──
            const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length) ? AUTO_GRAB_SKIP : ((typeof window._mvdGrabSkip !== 'undefined') ? window._mvdGrabSkip : []);
            const skip = (key) => skipList.includes(key);

            const has = {
                medkit:      skip('medkit')      ? 999 : (findItem(ITEM.MEDKIT)      ? 1 : 0),
                baton:       skip('baton')       ? 1   : (findItem(ITEM.BATON)       ? 1 : 0),
                vest:        armourVal,
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

            closeInventory();
            await sleep(100);

            if (!Object.values(need).some(Boolean)) {
                notify("МВД", "Всё снаряжение есть ✓", "00FF00");
                openMenu();
                isProcessing = false;
                return;
            }

            openMenu();
            await sleep(400);

            const toTake = [];
            if (need.painkillers) toTake.push({ name: "Обезболивающее",                          idx: MENU.PAINKILLERS });
            if (need.medkit)      toTake.push({ name: "Аптечка",                                 idx: MENU.MEDKIT });
            if (need.baton)       toTake.push({ name: "Дубинка",                                 idx: MENU.BATON });
            if (need.wand)        toTake.push({ name: "Жезл",                                    idx: MENU.WAND });
            if (need.vest)        toTake.push({ name: `Бронежилет (${armourVal}%)`,              idx: MENU.VEST });
            if (need.radarGun)    toTake.push({ name: "Тауметр",                                 idx: MENU.RADAR_GUN });
            if (need.diagnostics) toTake.push({ name: "Диагностика",                             idx: MENU.DIAGNOSTICS });
            if (need.taser)       toTake.push({ name: "Тазер",                                   idx: MENU.TASER });
            if (need.deagle)      toTake.push({ name: "Desert Eagle",                            idx: MENU.DEAGLE });
            if (need.magnum)      toTake.push({ name: `Патроны .44 (есть: ${has.magnum})`,       idx: MENU.AMMO_MAGNUM });
            if (need.akm)         toTake.push({ name: "АКМ",                                     idx: MENU.AKM });
            if (need.ammo762)     toTake.push({ name: `Патроны 7.62 (есть: ${has.ammo762})`,     idx: MENU.AMMO_762 });
            if (need.aks74u)      toTake.push({ name: "АКС-74У",                                 idx: MENU.AKS74U });
            if (need.ammo545)     toTake.push({ name: `Патроны 5.45 (есть: ${has.ammo545})`,     idx: MENU.AMMO_545 });
            if (need.remington)   toTake.push({ name: "Remington 870",                           idx: MENU.REMINGTON });
            if (need.ammo1270)    toTake.push({ name: `Патроны 12x70 (есть: ${has.ammo1270})`,   idx: MENU.AMMO_1270 });

            for (let i = 0; i < toTake.length; i++) {
                take(toTake[i].idx);
                await sleep(i < toTake.length - 1 ? 300 : 150);
            }

            const notifyNames = toTake.map(t => t.name.replace(/ \(есть: \d+\)/, ''));
            notify("МВД", notifyNames.join(", "), "00FF00");
            window.playSound("inventory/take_light.mp3");

        } catch (err) {
            console.error('[MVD-GRAB] Ошибка:', err);
            notify("Ошибка", err.message, "FF0000");
        } finally {
            isProcessing = false;
        }
    }

    // ==================== АВТО-ТРИГГЕР: открытие интерфейса полицейской службы ====================
    // Сервер открывает меню снаряжения через addDialogInQueue с id=0, style=2 (LIST).
    // Перехватываем именно этот момент — это НЕ срабатывает на Ctrl+G или другие кнопки.
    // isProcessing защищает от повторного запуска пока идёт взятие.
    const _origAddDlgGrab = window.addDialogInQueue;
    window.addDialogInQueue = function(params, content, priority) {
        // Сначала показываем меню
        const result = _origAddDlgGrab ? _origAddDlgGrab.call(this, params, content, priority) : undefined;
        // Затем проверяем — это диалог снаряжения МВД?
        try {
            const p = Array.isArray(params) ? params : JSON.parse(params);
            const dlgId = parseInt(p[0]);
            const style  = parseInt(p[1]);
            // id=0 style=2 — серверный LIST-диалог взятия снаряжения
            if (dlgId === DIALOG_ID && style === 2 && !isProcessing) {
                console.log(`[MVD-GRAB] 🎯 Меню снаряжения (dlgId=0) открылось — запускаем авто-снаряжение`);
                setTimeout(() => autoGrab(), 150);
            }
        } catch(e) {}
        return result;
    };

    window.autoGrab = autoGrab;
    console.log('[MVD-GRAB] ✅ Авто-снаряжение активно — срабатывает при открытии диалога службы МВД');
})();
} // end if (AUTO_GRAB)
// ==================== END АВТОБРАНИЕ МВД ====================
