// ── ПРЕФЕТЧ ВСЕХ КАСТОМНЫХ ИНТЕРФЕЙСОВ С GITHUB ──────────────────
// Грузим 5 файлов параллельно при старте игры. Локальные загрузчики
// (assets/MvdMenu.js, zkm.js, AdvMenu.js, ZkmScreenNotification.js)
// возьмут готовый текст из window.__prefetch_* и не будут делать XHR.
//
// Критично для ZkmScreenNotification (sideEffect): он должен
// выполниться ДО первого snAdd(), иначе уведомления молча теряются.
//
// Promise.allSettled — падение одного файла не убивает остальные.
(function prefetchAllCustomUI() {
    var BASE = 'https://cdn.jsdelivr.net/gh/BensonZahar/Hud.js@main/MVD%20AHK/'
             + encodeURIComponent('Кастом Интерфейсы') + '/';
    var FILES = {
        mvdmenu_js:  BASE + 'MvdMenu.js',
        advmenu_js:  BASE + 'AdvMenu.js',
        zkm_js:      BASE + 'zkm.js',
        zkm_css:     BASE + 'zkm.css',
        zkmsn_js:    BASE + 'ZkmScreenNotification.js',
        zkmsn_css:   BASE + 'ZkmScreenNotification.css'
    };
    var RETRIES = 5, BASE_DELAY = 1000;

    function xhrGet(url, attempt) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url + '?_=' + Date.now(), true);
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else if (attempt < RETRIES) {
                    var d = Math.min(BASE_DELAY * Math.pow(2, attempt), 16000);
                    setTimeout(function() { xhrGet(url, attempt + 1).then(resolve, reject); }, d);
                } else reject(new Error('HTTP ' + xhr.status));
            };
            xhr.onerror = function() {
                if (attempt < RETRIES) {
                    var d = Math.min(BASE_DELAY * Math.pow(2, attempt), 16000);
                    setTimeout(function() { xhrGet(url, attempt + 1).then(resolve, reject); }, d);
                } else reject(new Error('Network'));
            };
            xhr.send();
        });
    }

    var promises = {};
    for (var key in FILES) {
        (function(k) {
            promises[k] = xhrGet(FILES[k], 0)
                .then(function(text) {
                    window['__prefetch_' + k] = text;
                    console.log('[mvdF] ✅ префетч ' + k + ' (' + text.length + ' байт)');
                    return text;
                })
                .catch(function(e) {
                    console.warn('[mvdF] ⚠️ префетч ' + k + ' не удался:', e.message);
                    window['__prefetch_' + k + '_failed'] = true;
                });
        })(key);
    }

    // Сохраняем общий Promise чтобы локальные загрузчики могли await-нуть
    window.__prefetch_promise = Promise.allSettled(Object.values(promises))
        .then(function() {
            console.log('[mvdF] 🎯 все префетчи завершены');
        });
})();
// ── END ПРЕФЕТЧ ──────────────────────────────────────────────────
// ── Загрузчик startup-интерфейсов ────────────────────────────────────
// Вставить в НАЧАЛО mvdF.js.
// Файлы берутся из assets (рядом с ScreenNotification.js / index.js).
;(function loadStartupInterfaces() {
    var ifaces = window._duranCustomInterfaces;
    if (!ifaces || !ifaces.length) return;

    ifaces.forEach(function (iface) {
        if (!iface.startup) return;
        (iface.files || []).forEach(function (filename) {
            var ext = filename.split('.').pop().toLowerCase();
            if (ext === 'css') {
                var link  = document.createElement('link');
                link.rel  = 'stylesheet';
                link.href = './' + filename;
                document.head.appendChild(link);
            } else if (ext === 'js') {
                var script = document.createElement('script');
                script.src = './' + filename;
                document.head.appendChild(script);
            }
        });
    });
})();
// ── конец загрузчика ──────────────────────────────────────────────────
// MVD AHK VERSION: 2.3 (NAPARNICK)
console.log("[INIT] === MVD AHK v4.4 ЗАГРУЖЕН ===");
// ── Авто-обновление собственного ID (каждые 30 секунд) ──
// Гарантирует что hud.info.id всегда актуальный, даже без /has
setInterval(function() {
    try {
        if (window.updatePlayerList) window.updatePlayerList();
    } catch(e) {}
}, 30000);
// Первый запрос — через 3 секунды после загрузки
setTimeout(function() {
    try { if (window.updatePlayerList) window.updatePlayerList(); } catch(e) {}
}, 3000);
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
        console.log(`[SKIN] Ошибка при получении Skin ID: ${e.message}`);
        return null;
    }
}
// 4. Функция отслеживания скина (ИСПРАВЛЕНА)
function trackSkinId() {
    const currentSkin = getSkinIdFromStore();
    if (currentSkin !== null) {
        const numericSkin = Number(currentSkin);
        // ВАЖНО: сравниваем уже приведённые к числу значения,
        // иначе store иногда отдаёт строку и проверка ложно
        // считает это "изменением" скина каждый цикл опроса
        if (numericSkin !== skinId) {
            skinId = numericSkin;
            window._mvdSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js (проверка исключения СОБР для greeting)

            console.log(`[SKIN] 🔍 Новый Skin ID обнаружен: ${skinId}`);

            // Проверяем, является ли скин МВД
            if (mvdSkins.includes(skinId)) {
                console.log(`[SKIN] ✅ Скин ${skinId} - это МВД скин!`);
            } else {
                console.log(`[SKIN] ❌ Скин ${skinId} НЕ входит в список МВД`);
            }
        }
    }
    setTimeout(trackSkinId, 5000);
}
// 5. ЗАПУСК после загрузки
setTimeout(() => {
    console.log('[SKIN] 🚀 Запуск отслеживания скина МВД...');
    const initialSkin = getSkinIdFromStore();
    if (initialSkin !== null) {
        // Приводим к числу сразу
        skinId = Number(initialSkin);
        window._mvdSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js
        console.log(`[SKIN] 📌 Начальный Skin ID: ${skinId}`);
    
        if (mvdSkins.includes(skinId)) {
            console.log(`[SKIN] ✅ Скин ${skinId} в списке МВД - меню /dahk доступно`);
        } else {
            console.log(`[SKIN] ⚠️ Скин ${skinId} не является МВД скином`);
        }
    } else {
        console.log('[SKIN] ❌ Не удалось получить начальный Skin ID');
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
let lastFineTimerOpenAt = 0; // защита от повторного открытия таймера на радио-дубль сообщения
let fineTimerSnId = null;    // id текущего ZKM-таймера КД штрафа (для возможной ручной отмены)
const FINE_CD_TIMER_ENABLED = false; // [ВЫКЛ] таймер КД штрафа временно отключён (убрали КД)
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
let _autoWantedActive = false; // флаг: /su отправлен через меню авторозыска — только тогда авто-причина работает
let lastTakeLicCode = null;    // статья КоАП для авто-подстановки в серверный диалог изъятия прав
let _autoTakeLicActive = false; // флаг: /takelic отправлен через наш диалог → авто-выбор "Водительские права"
let _awaitingTakeLicInput = false; // флаг: ожидаем INPUT диалог "Укажите причину" после выбора лицензии
// Публичный API для LawsHelper — устанавливает причину и активирует авто-розыск
window._mvdSetLastWantedCode = function(code) {
    lastWantedCode = code;
    _autoWantedActive = true;
    // Страховочный сброс — если сервер не открыл диалог за 5 секунд
    setTimeout(function() { _autoWantedActive = false; }, 5000);
    console.log('[AUTO-РОЗЫСК] lastWantedCode="' + code + '", _autoWantedActive=true (через LawsHelper)');
};
// ==================== НАПАРНИК ====================
let partnerNick = null;            // Ник напарника (из ответа /id)
let partnerId = null;              // ID напарника
let partnerTrackingEnabled = false; // "Следить за напарником" включено
let partnerMessageEnabled = false;  // "Сообщение для напарника" включено
let _awaitingPartnerId = false;    // Ждём ответ /id для установки напарника
let partnerMessageName = `Сообщение для напарника | {FF0000}Выкл`;
function getPartnerTrackingLabel() {
    if (partnerTrackingEnabled && partnerNick && partnerId) {
        return `Следить: {00FF00}${partnerNick}[${partnerId}]`;
    }
    return `Следить за напарником | {FF0000}Выкл`;
}
function getPartnerMenuLabel() {
    if (partnerTrackingEnabled && partnerNick && partnerId) {
        return `Напарник | {00FF00}${partnerNick}[${partnerId}]`;
    }
    return `Напарник | {FF0000}Выкл`;
}
// ==================== КОНЕЦ НАПАРНИК STATE ====================
// ── Обновление ID напарника по нику (/id ник) ────────────────────────────────
// При открытии меню отправляем /id partnerNick вместо /id partnerId.
// Так корректно находим нового ID напарника если он перезашёл и сменил слот.
// Если "Совпадений не найдено" — напарник не в игре, показываем уведомление.
let _partnerNickSearch = false;       // идёт поиск напарника по нику
let _partnerNickSearchTarget = null;  // ник, который ищём сейчас
function refreshPartnerNickSilent() {
    if (!partnerTrackingEnabled || !partnerNick) return; // нужен ник для поиска
    if (_partnerNickSearch) return; // уже ищем
    _partnerNickSearch = true;
    _partnerNickSearchTarget = partnerNick;
    sendChatInput(`/id ${partnerNick}`);
    // Страховочный сброс — если ответ не пришёл за 5с
    setTimeout(() => {
        if (_partnerNickSearch && _partnerNickSearchTarget === partnerNick) {
            _partnerNickSearch = false;
            _partnerNickSearchTarget = null;
        }
    }, 5000);
    console.log(`[PARTNER] 🔍 Поиск напарника по нику: /id ${partnerNick}`);
}
// ── END обновление по нику ────────────────────────────────────────────────────
// Хоткей открытия меню МВД — настраивается установщиком через MENU_KEY (по умолчанию Alt+0)
var MENU_KEY = "Alt+0";
// Скрытые пункты меню «Повседневная» — настраивается установщиком
var MENU_HIDDEN_ITEMS = [];
// Биндинги прямого вызова пунктов меню — настраивается установщиком
// Формат: { "greeting": "Alt+G", "cuffing": "Alt+C", ... }
var MENU_BINDS = {};
// Порядок пунктов меню «Повседневная» — настраивается установщиком
// Формат: ["greeting","cuffing","checkDocuments",...] (пусто = по умолчанию)
var MENU_ORDER = [];
// Пункты меню, после которых шлём "/c 60" и закрываем диалог "Точное время" через 1.5с
// Формат: ["greeting","fine","wantedFine",...] (пусто = выключено везде) — настраивается установщиком
var MENU_TIMER_ITEMS = [];

// ── Таймер после отыгровки: "/c 60" (латинская C, слитно) + автозакрытие диалога "Точное время" ──
// Если для конкретного пункта включено в установщике (MENU_TIMER_ITEMS), после
// завершения отыгровки шлём эту команду. Сервер в ответ показывает диалог
// "Точное время" — он закрывается автоматически через 1.5с (см. перехватчик
// window.addDialogInQueue ниже), чтобы не мешал на экране.
function runPostActionTimer(actionKey) {
    if (!Array.isArray(MENU_TIMER_ITEMS) || !MENU_TIMER_ITEMS.includes(actionKey)) return;
    sendChatInput("/c 60");
    console.log(`[AHK-TIMER] "${actionKey}": отправлена команда /c 60`);
}

// Применяем порядок пунктов если задан
(function() {
    if (!MENU_ORDER || !MENU_ORDER.length) return;
    var ordered = [];
    // Сначала — пункты в заданном порядке
    MENU_ORDER.forEach(function(action) {
        var found = povsednevOptions.find(function(o) { return o.action === action; });
        if (found) ordered.push(found);
    });
    // Затем — любые пункты которых не было в MENU_ORDER (новые, добавленные позже)
    povsednevOptions.forEach(function(o) {
        if (!ordered.find(function(x) { return x.action === o.action; })) {
            ordered.push(o);
        }
    });
    // Переписываем массив на месте чтобы все ссылки на povsednevOptions остались валидны
    povsednevOptions.length = 0;
    ordered.forEach(function(o) { povsednevOptions.push(o); });
})();

// Вспомогательная функция: проверяет совпадение e с комбо-строкой вида "Alt+G"
function _matchesCombo(e, combo) {
    if (!combo) return false;
    var parts = combo.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey   = mainParts[0] || '';
    var modOk = (!needAlt   || e.altKey)   &&
                (!needCtrl  || e.ctrlKey)  &&
                (!needShift || e.shiftKey) &&
                (needAlt   || !e.altKey)   &&
                (needCtrl  || !e.ctrlKey)  &&
                (needShift || !e.shiftKey);
    return modOk && (e.key.toLowerCase() === mainKey || e.code.toLowerCase() === mainKey);
}

// Обработчик горячих клавиш
window.addEventListener('keydown', function(e) {
    if (MENU_KEY) {
        var parts = MENU_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
        var needAlt   = parts.indexOf('alt')   !== -1;
        var needCtrl  = parts.indexOf('ctrl')  !== -1;
        var needShift = parts.indexOf('shift') !== -1;
        var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
        var mainKey   = mainParts[0] || '';
        var modOk = (!needAlt || e.altKey) && (!needCtrl || e.ctrlKey) && (!needShift || e.shiftKey);
        var keyOk = e.key.toLowerCase() === mainKey || e.code.toLowerCase() === mainKey;
        if (modOk && keyOk) {
            sendChatInput('/dahk');
        }
    }
    // Прямые биндинги пунктов меню «Повседневная»
    if (MENU_BINDS && typeof MENU_BINDS === 'object') {
        for (var _action in MENU_BINDS) {
            if (!_matchesCombo(e, MENU_BINDS[_action])) continue;
            e.preventDefault && e.preventDefault();
            var _opt = povsednevOptions.find(function(o){ return o.action === _action; });
            if (!_opt) break;
            currentAction = _action;
            currentMenu = "povsednev"; // FIX: устанавливаем currentMenu чтобы диалог 668 сработал
            // FIX: СОБР-скин (15340) для greeting не требует ID — как в HandlePovsednevCommand
            var _isOmonSkin = skinId === 15340;
            var _needsIdForThis = _opt.needsId && !(_action === 'greeting' && _isOmonSkin);
            if (_needsIdForThis) {
                // FIX: открываем кастомный экран ввода ID внутри MvdMenu (а не нативный
                // диалог 668), чтобы хоткей вёл себя так же, как обычный клик по пункту меню.
                window._mvdMenuTargetId = null;
                window._mvdMenuDirectAction = _action;
                setTimeout(function(){ window.openInterface('MvdMenu'); }, 50);
            } else if (_action === 'fine') {
                setTimeout(function(){ showKoapTypeMenu(giveLicenseTo || -1); }, 50);
            } else if (_action === 'wantedFine') {
                currentUkLines = [...ukLines]; ukPage = 0;
                setTimeout(function(){ showUkInputDialog(giveLicenseTo || -1); }, 50);
            } else {
                executePovsednevAction(_action, giveLicenseTo || -1);
            }
            break;
        }
    }
    // Хоткей свапа тазер ↔ дигл теперь регистрируется в LoadAhk.js
    // на основе настройки SWAP_KEY из установщика.
    // Прямые хоткеи здесь убраны — не дублируем.

    // ==================== ALT — ПОКАЗАТЬ/СКРЫТЬ КУРСОР ПРИ ОТКРЫТОЙ КОНСОЛИ ====================
    if (e.keyCode === window.KEY_CODE_ALT) {
        const consoleRef = window.App && window.App.$refs && window.App.$refs.console;
        if (consoleRef && consoleRef.isOpened) {
            window.cursorStatus = !window.cursorStatus;
            window.setCursorStatus('Console', window.cursorStatus);
        }
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

// ==================== CHAT LOGGING HELPERS ====================
function normalizeColor(color) {
    let normalized = String(color).toUpperCase();
    if (normalized.startsWith('#')) normalized = normalized.slice(1);
    if (normalized.length === 8) normalized = normalized.slice(0, 6);
    return '0x' + normalized;
}
const CHAT_RADIUS = { SELF: 0, CLOSE: 1, MEDIUM: 2, FAR: 3, RADIO: 4, UNKNOWN: -1 };
function getChatRadius(color) {
    switch (normalizeColor(color)) {
        case '0xEEEEEE': return CHAT_RADIUS.SELF;
        case '0xCECECE': return CHAT_RADIUS.CLOSE;
        case '0x999999': return CHAT_RADIUS.MEDIUM;
        case '0x6B6B6B': return CHAT_RADIUS.FAR;
        case '0x33CC66': return CHAT_RADIUS.RADIO;
        default:         return CHAT_RADIUS.UNKNOWN;
    }
}
function normalizeToCyrillic(text) {
    const map = {
        'A':'А','a':'а','B':'В','b':'в','C':'С','c':'с','E':'Е','e':'е',
        'H':'Н','h':'н','K':'К','k':'к','M':'М','m':'м','O':'О','o':'о',
        'P':'Р','p':'р','T':'Т','x':'х','X':'Х','y':'у','Y':'У'
    };
    return String(text).replace(/[A-Za-z]/g, ch => map[ch] || ch);
}
const RADIUS_LABELS = {
    [CHAT_RADIUS.SELF]:    { label: 'SELF',   color: '#EEEEEE' },
    [CHAT_RADIUS.CLOSE]:   { label: 'CLOSE',  color: '#CECECE' },
    [CHAT_RADIUS.MEDIUM]:  { label: 'MEDIUM', color: '#999999' },
    [CHAT_RADIUS.FAR]:     { label: 'FAR',    color: '#6B6B6B' },
    [CHAT_RADIUS.RADIO]:   { label: 'RADIO',  color: '#33CC66' },
    [CHAT_RADIUS.UNKNOWN]: { label: '?',      color: '#AAAAAA' },
};
// Извлекает первый встроенный цветовой код {RRGGBB} из текста сообщения
function getInlineColor(text) {
    const m = String(text).match(/\{([0-9A-Fa-f]{6})\}/);
    return m ? m[1].toUpperCase() : null;
}
// Экранирует спецсимволы regex (на случай нестандартных ников)
function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// ==================== END CHAT LOGGING HELPERS ====================

let _mainChatHandlerReady = false;


const setupChatHandler = () => {
    if (window.interface && window.interface('Hud')?.$refs?.chat?.add) {
        const originalAddFunction = window.interface('Hud').$refs.chat.add;
 
        window.interface('Hud').$refs.chat.add = function(message, ...args) {
            // ========== ЛОГИРОВАНИЕ ЧАТА (как в Code.js) ==========
            try {
                const _msg    = String(message);
                const _color  = args[0];          // первый arg — цвет (если есть)
                const _now    = new Date();
                const _ts     = `${String(_now.getHours()).padStart(2,'0')}:${String(_now.getMinutes()).padStart(2,'0')}:${String(_now.getSeconds()).padStart(2,'0')}`;
                const _actualColor = normalizeColor(_color).replace('0x', '');
                const _colorTag = `[#${_actualColor}]`;
                console.log(`[${_ts}]${_colorTag} ${_msg}`);
            } catch (_e) { /* тихо игнорируем */ }
            // ========== КОНЕЦ ЛОГИРОВАНИЯ ==========
            // ==================== ОТМЕНА ПОДТВЕРЖДЕНИЯ ПРОВЕРКИ ДОКУМЕНТОВ ====================
            // Если игрок явно отказался показать документы ("Vlad_Giovanni отказался
            // от Вашего предложения", {FF6600}) либо слишком далеко ("* Игрок слишком
            // далеко") — сразу прячем уведомление-выбор Alt×1/Alt×2, не дожидаясь
            // истечения таймера. Проверяем ДО shouldBlockMessage(), т.к. "слишком
            // далеко" в любом случае блокируется и до неё код иначе бы не дошёл.
            if (typeof message === 'string') {
                if (message.includes('отказался от Вашего предложения') ||
                    message.includes('Игрок слишком далеко') ||
                    message.includes('Такого игрока нет')) {

                    if (_docCheckActive) {
                        console.log('[MVD] 🚫 Проверка документов отменена (отказ/далеко/нет игрока)');
                        _docCheckCleanup();
                        _docCheckHideNotif();
                    }

                    // Гонка: сервер может ответить "слишком далеко" / "такого игрока
                    // нет" РАНЬШЕ, чем showDocCheckPrompt() успеет выставить
                    // _docCheckActive = true (он вызывается с задержкой 1300мс после
                    // отправки /doc). В этом случае проверка выше не сработает, и
                    // уведомление всё равно откроется следом — уже без сообщения,
                    // которое могло бы его закрыть. Поэтому запоминаем сам факт
                    // отмены с меткой времени/целью — showDocCheckPrompt() сверится
                    // с ней перед показом и просто не откроет уведомление.
                    _docCheckAbortedTargetId = (_docCheckTargetId !== -1)
                        ? _docCheckTargetId
                        : (giveLicenseTo || -1);
                    _docCheckAbortedAt = Date.now();
                }
            }
            // ==================== КОНЕЦ ОТМЕНЫ ПОДТВЕРЖДЕНИЯ ====================
            // ==================== ОБНОВЛЕНИЕ ID НАПАРНИКА ПО НИКУ (/id ник) ====================
            // Ловим ответ /id partnerNick при авто-обновлении, скрываем из чата.
            // Если ник совпал — обновляем partnerId (после рекоша мог смениться).
            // Если "Совпадений не найдено" — напарник не в игре, показываем предупреждение.
            if (_partnerNickSearch && _partnerNickSearchTarget && typeof message === 'string') {
                // Формат: "1. {COLOR}Nick{COLOR}, ID: X, ..." или "1. Nick, ID: X, ..."
                const _pNickMatch = message.match(
                    /^\d+\.\s*(?:\{[A-Fa-f0-9]{6,8}\})*([A-Za-z0-9_]+)(?:\{[A-Fa-f0-9]{6,8}\})?,\s*ID:\s*(\d+),/
                );
                if (_pNickMatch) {
                    const _foundNick = _pNickMatch[1];
                    const _foundId   = _pNickMatch[2];
                    if (_foundNick === _partnerNickSearchTarget) {
                        // Это наш напарник — обновляем ID если изменился после рекоша
                        _partnerNickSearch = false;
                        _partnerNickSearchTarget = null;
                        if (String(_foundId) !== String(partnerId)) {
                            const _oldId = partnerId;
                            partnerId = _foundId;
                            console.log(`[PARTNER] 🔄 ID напарника обновлён: ${_oldId} → ${_foundId} (${partnerNick})`);
                            snAdd(`[1, "Напарник", "${partnerNick}: ID ${_oldId}→${_foundId}", "00FF00", 3000]`);
                        } else {
                            console.log(`[PARTNER] ✅ Напарник в сети: ${partnerNick}[${partnerId}]`);
                        }
                    } else {
                        // Другой игрок с похожим ником — ждём дальше (может прийти несколько строк)
                        console.log(`[PARTNER] /id ник — пропуск: ${_foundNick} ≠ ${_partnerNickSearchTarget}`);
                    }
                    return; // Блокируем строку numbered-list из чата (любую, пока ищем)
                }
                // "Совпадений не найдено" — напарник вышел из игры
                if (message.includes('Совпадений не найдено')) {
                    _partnerNickSearch = false;
                    _partnerNickSearchTarget = null;
                    console.log(`[PARTNER] ⚠️ Не удалось определить напарника: "${partnerNick}" не найден`);
                    snAdd('[1, "Напарник", "Не удалось определить напарника", "FF4400", 5000]');
                    return; // Блокируем "Совпадений не найдено" из чата
                }
            }
            // ==================== КОНЕЦ ОБНОВЛЕНИЯ ID ПО НИКУ ====================
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

                // ── Игрок вышел из игры во время погони: показываем обратный отсчёт ──
                // Сообщение сервера: "Игрок за которым Вы вели погоню вышел из игры.
                //                    У него есть X секунд, чтобы вернуться в игру."
                const exitChaseMatch = message.match(
                    /Игрок за которым Вы вели погоню вышел из игры[^.]*\.\s*У него есть (\d+) секунд/
                );
                if (exitChaseMatch) {
                    const returnSecs = parseInt(exitChaseMatch[1]);
                    const exitLabel  = trackingNickname
                        ? `${trackingNickname} — вернётся через`
                        : `Подозреваемый — вернётся через`;
                    console.log(`[CHASE] ⚠️ Игрок вышел из игры — ${returnSecs} сек на возвращение`);
                    try {
                        const _snExit = getZkmSN();
                        if (_snExit && typeof _snExit.addTimer === 'function') {
                            _snExit.addTimer(`[1, "Вышел из игры", "${exitLabel}", "FF6729", ${returnSecs}]`);
                        }
                    } catch(_e) {}
                }
            }
            // ==================== КОНЕЦ ОТСЛЕЖИВАНИЯ ПОГОНИ ====================

            // ==================== ПИК НИКА ИЗ /id ====================
            // Ловим ответ сервера на /id: "Ник, ID: 43, уровень: 44, PING: 59, клиент: RADMIR (PC)"
            // Поддержка CLEO-префикса времени: "[17:59:42:606]: Ник, ID: ..."
            if (typeof message === 'string' && currentScanId) {
                const idInfoMatch = message.match(/(?:^\[\d{2}:\d{2}:\d{2}(?::\d+)?\]:\s*)?([A-Za-z0-9_]+),\s*ID:\s*(\d+),/);
                if (idInfoMatch && idInfoMatch[2] === String(currentScanId)) {
                    const nick = idInfoMatch[1];
                    if (nick !== trackingNickname) {
                        trackingNickname = nick;
                        trackingName = `Отслеживание | {00FF00}${nick}[${currentScanId}]`;
                        console.log(`[TRACKING] 👤 Ник получен: ${nick}`);
                        // Если уведомление уже открыто без ника — обновляем
                        if (trackingNotificationOpen || chaseNotificationOpen) {
                            openTrackingNotification(currentScanId);
                        }
                    }
                }
            }
            // ==================== КОНЕЦ ПИКА НИКА ====================

            // ==================== ПИК НИКА НАПАРНИКА ИЗ /id ====================
            if (typeof message === 'string' && _awaitingPartnerId && window._pendingPartnerId) {
                const idPartnerMatch = message.match(/(?:^\[\d{2}:\d{2}:\d{2}(?::\d+)?\]:\s*)?([A-Za-z0-9_]+),\s*ID:\s*(\d+),/);
                if (idPartnerMatch && idPartnerMatch[2] === String(window._pendingPartnerId)) {
                    const nick = idPartnerMatch[1];
                    partnerNick = nick;
                    partnerTrackingEnabled = true;
                    _awaitingPartnerId = false;
                    window._pendingPartnerId = null;
                    snAdd(`[1, "Напарник", "Напарник: ${nick}[${partnerId}]", "00FF00", 3000]`);
                    console.log(`[PARTNER] ✅ Напарник установлен: ${nick}[${partnerId}]`);
                }
            }
            // ==================== КОНЕЦ ПИКА НИКА НАПАРНИКА ====================

            // ==================== ОБНАРУЖЕНИЕ СООБЩЕНИЯ НАПАРНИКА ====================
            // Реальный формат в консоли:
            // [CLOSE|#CECECE] - Отслеживаю 395 {0000FF}({v:Calvin_Miller})[294]
            // Сервер сам добавляет {COLOR}({v:NICK})[ID] (или NICK[ID] в радио) в конец
            // любого локального сообщения игрока.
            //
            // ВАЖНО: матчим ТОЛЬКО по нику напарника (ID — любой), а не по нику+ID
            // одновременно. Если напарник перезашёл на сервер и получил новый игровой
            // ID (слот), его ник в сообщениях не меняется — меняется только число в [].
            // Поэтому каждое такое сообщение само несёт актуальный ID напарника:
            //   1) ищем нужный ник в сообщении (с любым ID рядом);
            //   2) если найден — считаем сообщение напарниковым;
            //   3) если ID в сообщении отличается от сохранённого partnerId — тихо
            //      синхронизируем partnerId на актуальный. Никакого /id и открытия
            //      меню МВД для этого больше не нужно.
            if (typeof message === 'string' && partnerTrackingEnabled && partnerNick) {
                const msgStr = String(message);
                const _escNick = escapeRegex(partnerNick);

                // Ник напарника + любой ID рядом: ({v:NICK})[ID] / {v:NICK}[ID] / NICK[ID]
                const partnerTagRe = new RegExp(
                    `(?:\\(\\{v:${_escNick}\\}\\)|\\{v:${_escNick}\\}|\\b${_escNick})\\[(\\d+)\\]`
                );
                const partnerTagMatch = msgStr.match(partnerTagRe);

                // Маска: ник скрыт (Mask_XXXXX), но ID в [] совпадает с последним
                // известным partnerId — такие сообщения тоже считаем напарниковыми
                // (по нику в этом случае сматчить нельзя, т.к. ника не видно).
                const hasMaskedPartner = !!partnerId && (
                    (new RegExp(`\\{v:Mask_[^}]+\\}\\s*\\[${partnerId}\\]`)).test(msgStr) ||
                    (new RegExp(`\\bMask_[A-Za-z0-9_]+\\s*\\[${partnerId}\\]`)).test(msgStr)
                );

                const hasPartnerTag = !!partnerTagMatch || hasMaskedPartner;

                if (hasPartnerTag) {
                    // ── Тихая синхронизация ID напарника прямо из сообщения чата ──
                    // (без /id-запроса и без открытия меню МВД)
                    if (partnerTagMatch) {
                        const seenId = partnerTagMatch[1];
                        if (String(seenId) !== String(partnerId)) {
                            const _oldId = partnerId;
                            partnerId = seenId;
                            console.log(`[PARTNER] 🔄 ID напарника обновлён из чата: ${_oldId} → ${seenId} (${partnerNick})`);
                            snAdd(`[1, "Напарник", "${partnerNick}: ID ${_oldId == null ? '?' : _oldId}→${seenId}", "00FF00", 3000]`);
                        }
                    }

                    const trackMatch = msgStr.match(/Отслеживаю жетон\s+(\d+)/);
                    if (trackMatch) {
                        const suspectId = trackMatch[1];
                        console.log(`[PARTNER] 🔔 Напарник ${partnerNick}[${partnerId}] начал отслеживание ID: ${suspectId}`);
                        snAdd(`[1, "Напарник", "${partnerNick}: отслеживает ID ${suspectId}", "00AAFF", 3000]`);
                        // Если мы УЖЕ отслеживаем именно этого подозреваемого (например, сами
                        // выбрали его из /WANTED и ник уже известен) — НЕ перезапускаем
                        // startTracking(). Раньше перезапуск всегда сбрасывал trackingNickname
                        // в null и заново гонял асинхронный /id, из-за чего уже показанный ник
                        // пропадал из уведомления именно в момент, когда напарник (в маске или
                        // без неё) присоединялся к той же цели. Перезапускаем ТОЛЬКО при смене
                        // цели на другую.
                        if (currentScanId === suspectId || currentScanId === String(suspectId)) {
                            console.log('[PARTNER] ⏭️ Уже отслеживаем эту же цель — перезапуск пропущен (ник сохранён)');
                        } else {
                            setTimeout(() => startTracking(suspectId), 600);
                        }
                    }
                    const stopMatch = msgStr.match(/Закончил отслеживание за жетоном\s+(\d+)/);
                    if (stopMatch) {
                        const suspectId = stopMatch[1];
                        console.log(`[PARTNER] 🔔 Напарник ${partnerNick}[${partnerId}] закончил отслеживание ID: ${suspectId}`);
                        snAdd(`[1, "Напарник", "${partnerNick}: закончил отслеживание ${suspectId}", "FF4444", 3000]`);
                        if (currentScanId === suspectId || currentScanId === String(suspectId)) {
                            stopTracking();
                        }
                    }
                }
            }
            // ==================== КОНЕЦ ОБНАРУЖЕНИЯ СООБЩЕНИЯ НАПАРНИКА ====================

            // ==================== АВТО-СТОП: НЕВОЗМОЖНО ОПРЕДЕЛИТЬ / ТАКОГО ИГРОКА НЕТ ====================
            if (typeof message === 'string' && currentScanId && !window._trackingStopPending) {
                const isNoLocation = message.includes('Невозможно определить местоположение игрока');
                const isNoPlayer   = message.includes('Такого игрока нет');

                if (isNoLocation || isNoPlayer) {
                    const reason = isNoPlayer
                        ? 'Такого игрока нет'
                        : 'Невозможно определить местоположение';
                    console.log(`[TRACKING] ⚠️ ${reason} — стоп немедленно`);
                    window._trackingStopPending = true;

                    // Останавливаем всё сразу (интервалы, флаги) — но БЕЗ hideAll
                    // чтобы серое уведомление успело показаться и догореть само
                    if (scanInterval)    { clearInterval(scanInterval);    scanInterval    = null; }
                    if (setmarkInterval) { clearTimeout(setmarkInterval);  setmarkInterval = null; } // setTimeout-цепочка
                    if (pgInterval)      { clearInterval(pgInterval);      pgInterval      = null; }
                    _cdTimerActive = false;
                    trackingNotificationOpen = false;
                    chaseNotificationOpen    = false;
                    currentScanId            = null;
                    trackingNickname         = null;
                    trackingName             = `Отслеживание | {FF0000}Выкл`;
                    isInActiveChase          = false;
                    lastSetmarkSentAt        = 0;

                    // Показываем серое уведомление синхронно — без setTimeout,
                    // чтобы никакой другой snAdd не успел сделать hideAll между hideAll и add
                    try {
                        const sn = getZkmSN();
                        if (sn) {
                            if (typeof sn.hideAll === 'function') sn.hideAll();
                            hideTrackingTimer();   // гасим таймер-уведомление отслеживания (timerQueue)
                            clearSetmarkCdTimer(); // и КД-таймер, если он был активен
                            sn.add(`[1, "Отслеживание", "${reason}", "CECECE", 5000]`);
                        }
                    } catch(e) {}

                    setTimeout(() => { window._trackingStopPending = false; }, 3000);
                    console.log(`[TRACKING] 🛑 Авто-стоп: ${reason}`);
                }
            }
            // ==================== КОНЕЦ АВТО-СТОП ====================

            // ==================== АВТО-СТОП: ИГРОК НЕ В РОЗЫСКЕ ====================
            // "Этот игрок не в розыске" с цветом #CECECE (CLOSE) — отменяем погоню и закрываем меню
            if (typeof message === 'string' && currentScanId &&
                message.includes('Этот игрок не в розыске')) {
                const _wantedColor = normalizeColor(args[0]);
                if (_wantedColor === '0xCECECE') {
                    console.log('[TRACKING] ⚠️ Игрок не в розыске (#CECECE) — стоп отслеживания + закрытие меню');
                    stopTracking();
                    // Закрываем открытые МВД интерфейсы
                    try { window.closeInterface('MvdMenu'); } catch(e) {}
                    try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                    snAdd('[1, "Погоня", "Игрок не в розыске — погоня отменена", "FF4400", 5000]');
                }
            }
            // ==================== КОНЕЦ АВТО-СТОП: ИГРОК НЕ В РОЗЫСКЕ ====================

            // ==================== КД /setmark: ПОВТОР ЧЕРЕЗ N СЕКУНД ====================
            if (typeof message === 'string' && currentScanId) {
                // Сервер пишет на /setmark: "Система отслеживания ещё загружает актуальное местоположение подозреваемого. Подождите X сек."
                const cdMatch = message.match(/[Пп]одождите\s+(\d+)\s*сек/);
                if (cdMatch) {
                    const waitSec = parseInt(cdMatch[1]);
                    console.log(`[TRACKING] ⏳ КД /setmark: ${waitSec} сек`);
                    // Блокируем восстановление красного таймера пока идёт жёлтый КД
                    _cdTimerActive = true;
                    // Прячем таймер обычного отслеживания и показываем жёлтый
                    // таймер-уведомление с реальным обратным отсчётом КД
                    hideTrackingTimer();
                    try {
                        const sn = getZkmSN();
                        if (sn && typeof sn.hideAll === 'function') sn.hideAll();
                    } catch(e) {}
                    setTimeout(() => {
                        try {
                            clearSetmarkCdTimer();
                            setmarkCdTimerId = getZkmSN()?.addTimer(
                                `[1, "Система загружает", "Обновление /setmark через", "FFAA00", ${waitSec}]`
                            );
                        } catch(e) {}
                    }, 100);
                    // Приостанавливаем setmarkInterval на время КД чтобы не спамить
                    if (setmarkInterval) {
                        clearTimeout(setmarkInterval); // setTimeout-цепочка → clearTimeout
                        setmarkInterval = null;
                        console.log('[TRACKING] setmarkInterval приостановлен на время КД');
                    }
                    // Через waitSec секунд повторяем /setmark, прячем КД-таймер
                    // и возвращаем обычный таймер отслеживания (31с)
                    setTimeout(() => {
                        _cdTimerActive = false; // разрешаем восстановление красного таймера
                        clearSetmarkCdTimer();
                        if (currentScanId) {
                            console.log(`[TRACKING] 🔄 Повтор /setmark после КД (${waitSec}с)`);
                            sendSetmarkCommand(currentScanId);
                            // Возобновляем цепочку /setmark
                            if (!setmarkInterval) {
                                scheduleSetmark();
                            }
                        }
                    }, waitSec * 1000);
                }
            }
            // ==================== КОНЕЦ КД /setmark ====================

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
                            `/cuff ${id}`,
                            `/escort ${id}`
                        ], [0, 700]);
                    }, 1000);
                }
            }
            // ==================== ОТСЛЕЖИВАНИЕ ШТРАФОВ ====================
            if (typeof message === 'string') {
                if (message.includes('выписал штраф')) {
                    console.log('[FINE-LOG] ✅ Нашли "выписал штраф"!');
                    try {
                        const ownNick = window.App?.$store?.getters?.['player/nickName'];

                        // Извлекаем НИК ИМЕННО ТОГО, КТО ВЫПИСАЛ штраф — он стоит
                        // в формате {v:НИК}[ID] выписал штраф ПОЛУЧАТЕЛЬ.
                        // Раньше проверялось message.includes(ownNick), из-за чего
                        // таймер К/Д ложно срабатывал и когда штраф выписывали НАМ
                        // (наш ник встречается в строке как получатель, а не как issuer).
                        const issuerMatch = message.match(/\{v:([^}]+)\}\s*\[\d+\]\s*выписал штраф/);
                        const issuerNick = issuerMatch ? issuerMatch[1] : null;

                        console.log(`[FINE-LOG] ownNick из store: "${ownNick}"`);
                        console.log(`[FINE-LOG] issuerNick из сообщения: "${issuerNick}"`);

                        if (ownNick && issuerNick && issuerNick === ownNick) {
                            const now = Date.now();
                            if (now - lastFineTimerOpenAt < 3000) {
                                // Это дубль того же события (например, радио-эхо "{v:...}"),
                                // пришедший в течение 3с после первого срабатывания — пропускаем
                                console.log('[FINE-LOG] ⏭ Пропускаем дубль сообщения о штрафе (повтор < 3с)');
                            } else {
                                lastFineTimerOpenAt = now;
                                runPostActionTimer('fine');
                                if (FINE_CD_TIMER_ENABLED) {
                                    console.log('[FINE-LOG] 🚀 Показываем таймер-уведомление КД штрафа...');
                                    try {
                                        const sn = getZkmSN();
                                        if (sn && typeof sn.addTimer === 'function') {
                                            fineTimerSnId = sn.addTimer('[2, "ШТРАФ К/Д", "Повторная выдача будет доступна через", "f9b701", 300]');
                                            console.log(`[FINE] ZKM-таймер запущен ✅ (id=${fineTimerSnId})`);
                                        } else {
                                            console.warn('[FINE] ZKM ScreenNotification.addTimer ещё не загружен — fallback на InformationTimer');
                                            window.openInterface('InformationTimer', ['К/Д Выдача штрафа', 300, false]);
                                        }
                                    } catch (snErr) {
                                        console.error('[FINE] Ошибка ZKM addTimer:', snErr);
                                    }
                                } else {
                                    console.log('[FINE-LOG] ⏭ Таймер КД штрафа отключён (FINE_CD_TIMER_ENABLED=false)');
                                }
                            }
                            // ── Авто-изъятие прав: если ZKM выставил pending ID — запускаем /takelic
                            // сразу после подтверждения штрафа (диалог уже закрыт)
                            if (window._mvdPendingTakeLicId) {
                                const _pendingId = window._mvdPendingTakeLicId;
                                window._mvdPendingTakeLicId = null;
                                console.log(`[AUTO-TAKELIC] ✅ Штраф подтверждён — запускаем /takelic для ID ${_pendingId}`);
                                setTimeout(() => { executePovsednevAction('takeLicense', _pendingId); }, 600);
                            }
                        } else {
                            console.log(`[FINE-LOG] ⏭ Штраф выписан не нами (issuer="${issuerNick}", ownNick="${ownNick}") — таймер не запускаем`);
                        }
                    } catch (err) {
                        console.error('[FINE] Ошибка InformationTimer:', err);
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
        _mainChatHandlerReady = true;
    } else {
        setTimeout(setupChatHandler, 100);
    }
};
setupChatHandler();

// ==================== РАННЕЕ ЛОГИРОВАНИЕ ВСЕХ ЧАТ-СООБЩЕНИЙ ====================
// window.onChatMessage вызывается движком для КАЖДОГО сообщения с сервера,
// доступен с самого старта (не зависит от монтирования Vue/Hud), поэтому
// здесь не теряются сообщения, пришедшие до setupChatHandler.
(() => {
    const originalOnChatMessage = window.onChatMessage;
    if (typeof originalOnChatMessage !== 'function') {
        console.log('[MVD-CHAT] window.onChatMessage не найден — раннее логирование не установлено');
        return;
    }
    window.onChatMessage = function(message, args) {
        if (!_mainChatHandlerReady) {
            try {
                const _msg    = String(message);
                // args приходит как массив, args[2] (после .slice(2) внутри оригинала) — цвет
                const _color  = Array.isArray(args) ? args[2] : undefined;
                const _now    = new Date();
                const _ts     = `${String(_now.getHours()).padStart(2,'0')}:${String(_now.getMinutes()).padStart(2,'0')}:${String(_now.getSeconds()).padStart(2,'0')}`;
                const _actualColor = normalizeColor(_color).replace('0x', '');
                const _colorTag = `[#${_actualColor}]`;
                console.log(`[${_ts}]${_colorTag} ${_msg}`);
            } catch (_e) { /* тихо игнорируем */ }
        }
        return originalOnChatMessage.apply(this, arguments);
    };
    console.log('[MVD-CHAT] Раннее логирование чата установлено (onChatMessage)');
})();
// ==================== КОНЕЦ РАННЕГО ЛОГИРОВАНИЯ ====================

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
// ВАЖНО: используем ТОЛЬКО изолированный window.ZkmScreenNotification
// (см. ZkmScreenNotification.js), а НЕ window.interface('ScreenNotification').
// Раньше код шёл через window.interface('ScreenNotification'), а сам
// ZkmScreenNotification.js подменял этот геттер ГЛОБАЛЬНО — из-за чего
// родные игровые уведомления (не от МВД) тоже улетали в наш кастомный UI
// и часть нативных интерфейсов пропадала/ломалась.
// Теперь подмена убрана, и МВД явно берёт именно свой namespace —
// родной ScreenNotification движка для всей остальной игры не трогается.
const getZkmSN = () => window.ZkmScreenNotification || null;

// ==================== ТАЙМЕР-УВЕДОМЛЕНИЕ ОТСЛЕЖИВАНИЯ ====================
// Основное уведомление "Идет отслеживание/Начата погоня" теперь живёт как
// addTimer() (timerQueue), а не как обычное add() (queue). Это даёт видимый
// обратный отсчёт до следующего /setmark (31с) и — важно — НЕ убивается
// через hideAll(), который дёргается на каждое мелкое snAdd().
//
// Фикс бага "напарник закончил — уведомление не закрылось":
// раньше восстановление шло через setTimeout(..., 150), который слепо
// пересоздавал уведомление, даже если за эти 150мс отслеживание уже
// остановили. Теперь showTrackingTimer() при каждом вызове (в т.ч. из
// отложенного restoreTrackingTimer) заново проверяет currentScanId и
// trackingNotificationOpen/chaseNotificationOpen НА МОМЕНТ СРАБАТЫВАНИЯ,
// а не на момент постановки в очередь — если отслеживание уже остановлено,
// уведомление просто не пересоздаётся.
const SETMARK_INTERVAL_SEC = 31;
let trackingTimerId   = null;  // id addTimer() для "Идет отслеживание/Начата погоня"
let setmarkCdTimerId  = null;  // id addTimer() для жёлтого КД /setmark
let lastSetmarkSentAt = 0;     // Date.now() последней реальной отправки /setmark
let _cdTimerActive    = false; // true пока активен жёлтый КД-таймер — блокирует восстановление красного таймера

const getSetmarkRemainingSec = () => {
    if (!lastSetmarkSentAt) return SETMARK_INTERVAL_SEC;
    const elapsed   = Math.floor((Date.now() - lastSetmarkSentAt) / 1000);
    const remaining = SETMARK_INTERVAL_SEC - elapsed;
    return remaining > 0 ? remaining : SETMARK_INTERVAL_SEC;
};

const hideTrackingTimer = () => {
    if (trackingTimerId !== null) {
        try { getZkmSN()?.hideTimer(trackingTimerId); } catch(e) {}
        trackingTimerId = null;
    }
};

const clearSetmarkCdTimer = () => {
    if (setmarkCdTimerId !== null) {
        try { getZkmSN()?.hideTimer(setmarkCdTimerId); } catch(e) {}
        setmarkCdTimerId = null;
    }
};

// Показывает/обновляет таймер-уведомление, используя АКТУАЛЬНОЕ состояние
// на момент вызова (а не закэшированное на момент постановки в setTimeout)
const showTrackingTimer = () => {
    if (!currentScanId) return;
    if (!(trackingNotificationOpen || chaseNotificationOpen)) return;
    if (_cdTimerActive) return; // жёлтый КД-таймер активен — не перекрываем его

    // Без <br>: одна строка с ником и ID + суффикс "через" чтобы
    // ZkmScreenNotification выводил "Nickname [ID] — метка через MM:SS"
    const label   = trackingNickname
        ? `${trackingNickname} [${currentScanId}] — метка через`
        : `[${currentScanId}] — метка через`;
    const isChase = chaseNotificationOpen;
    const title   = isChase ? 'Начата погоня' : 'Идет отслеживание';
    const accent  = isChase ? '0000FF' : 'FF0000';
    const secs    = Math.max(2, getSetmarkRemainingSec());
    // 6-й параметр — полная длительность цикла /setmark (31с). Именно от
    // неё считается заполнение прогресс-бара в ZkmScreenNotification, а
    // не от secs (текущего остатка на этот конкретный вызов) — иначе при
    // каждом обновлении (после snAdd, восстановления и т.п.) бар прыгал
    // бы на 100% и заново отсчитывал вниз, хотя реальное время не
    // сбрасывалось. С total бар просто продолжает идти с той же точки.
    const payload = `[1, "${title}", "${label}", "${accent}", ${secs}, ${SETMARK_INTERVAL_SEC}]`;

    try {
        const sn = getZkmSN();

        // Если уведомление уже висит на экране — просто обновляем текст/
        // таймер в существующем DOM-узле, БЕЗ leave+enter анимации.
        if (trackingTimerId !== null && sn?.updateTimer(trackingTimerId, payload) !== null) {
            return;
        }

        // Узла ещё нет (или он уже был закрыт) — создаём заново, тут
        // анимация появления оправдана.
        hideTrackingTimer();
        trackingTimerId = sn?.addTimer(payload);
    } catch(e) {}
};

// Отложенное восстановление таймер-уведомления после показа мелкого snAdd
const restoreTrackingTimer = (delay = 150) => {
    setTimeout(showTrackingTimer, delay);
};

const snAdd = (payload) => {
    try {
        // Если показывается финальное уведомление (серое) — не трогаем его через hideAll
        if (window._trackingStopPending) return;
        const sn = getZkmSN();
        if (sn && typeof sn.hideAll === 'function') sn.hideAll();

        // ZkmScreenNotification.js теперь сам стекует уведомления в одной
        // точке экрана (см. restack() там) — новое уведомление занимает
        // "точку привязки" и появляется НАД уже открытым таймером
        // отслеживания, а тот плавно отъезжает вниз, освобождая место.
        // Поэтому прятать/пересоздавать таймер отслеживания здесь больше
        // не нужно ни для каких позиций — раньше это вызывало его лишнюю
        // пере-анимацию при каждом мелком тосте (даже не связанном с ним).
        setTimeout(() => {
            try { getZkmSN()?.add(payload); } catch(e) {}
        }, 100);
    } catch(e) {}
};
let currentNotificationId = 0;
let isInActiveChase = false; // Флаг активной погони
const openTrackingNotification = (id) => {
    currentNotificationId++;
    trackingNotificationOpen = true;
    chaseNotificationOpen = false;
    if (!lastSetmarkSentAt) lastSetmarkSentAt = Date.now();
    // Скрываем любые временные уведомления (например "Напарник: отслеживает")
    // чтобы они не перекрывали таймер-уведомление отслеживания
    try { getZkmSN()?.hideAll(); } catch(e) {}
    showTrackingTimer();
    console.log('[TRACKING] Таймер-уведомление открыто (красное)');
};
const openChaseNotification = (id) => {
    currentNotificationId++;
    trackingNotificationOpen = false;
    chaseNotificationOpen = true;
    if (!lastSetmarkSentAt) lastSetmarkSentAt = Date.now();
    try { getZkmSN()?.hideAll(); } catch(e) {}
    showTrackingTimer();
    console.log('[CHASE] Таймер-уведомление открыто (синее)');
};
const closeTrackingNotifications = () => {
    try {
        const screenNotif = getZkmSN();
        if (screenNotif && typeof screenNotif.hideAll === 'function') {
            screenNotif.hideAll();
        }
        hideTrackingTimer();
        clearSetmarkCdTimer();
        trackingNotificationOpen = false;
        chaseNotificationOpen = false;
        console.log('[TRACKING] Все уведомления закрыты (включая таймер)');
    } catch (err) {
        console.error('[TRACKING] Ошибка закрытия ScreenNotification:', err);
    }
};

// Обёртка над отправкой /setmark: фиксирует момент отправки (для точного
// обратного отсчёта в showTrackingTimer) и, если сейчас не идёт КД-таймер,
// сразу обновляет таймер-уведомление на свежие 31с
const sendSetmarkCommand = (id) => {
    if (!id) return; // защита от гонки: отслеживание уже остановлено к моменту вызова
    lastSetmarkSentAt = Date.now();
    sendChatInput(`/setmark ${id}`);
    if (setmarkCdTimerId === null) {
        showTrackingTimer();
    }
};

// scheduleSetmark: цепочка setTimeout вместо setInterval.
// Каждый следующий /setmark запускается ровно через SETMARK_INTERVAL_SEC секунд
// ПОСЛЕ предыдущего — таймер-уведомление обновляется строго синхронно
// с истечением его обратного отсчёта, визуального мигания нет.
const scheduleSetmark = () => {
    setmarkInterval = setTimeout(() => {
        if (!currentScanId) return;
        sendSetmarkCommand(currentScanId);
        scheduleSetmark(); // следующий через 31с
    }, SETMARK_INTERVAL_SEC * 1000);
};

const startTracking = (id, knownNick = null) => {
    // Очищаем старые таймеры
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (setmarkInterval) {
        clearTimeout(setmarkInterval); // setTimeout-цепочка → clearTimeout
        setmarkInterval = null;
    }
    if (pgInterval) {
        clearInterval(pgInterval);
        pgInterval = null;
    }
    _cdTimerActive = false; // сброс флага КД при перезапуске отслеживания
 
    // ── Немедленно гасим старое уведомление погони ─────────────────────────
    // openTrackingNotification сбросит chaseNotificationOpen только через 800мс,
    // из-за чего синий таймер старой погони мог зависать при смене цели.
    // Сбрасываем флаги и прячем таймер здесь — сразу, без задержки.
    if (chaseNotificationOpen || trackingNotificationOpen) {
        chaseNotificationOpen    = false;
        trackingNotificationOpen = false;
        isInActiveChase          = false;
        hideTrackingTimer();
        clearSetmarkCdTimer();
        console.log('[TRACKING] 🔄 Старое уведомление погони закрыто (смена цели)');
    }
 
    currentScanId = id;
    // Если ник уже известен на момент вызова (например, выбран из /WANTED-списка,
    // где ник был распарсен из самого диалога) — используем его сразу, без ожидания
    // ответа на /id. Раньше trackingNickname всегда обнулялся здесь, и при выборе
    // из /WANTED первое же открытие уведомления (через 800мс ниже) могло произойти
    // ДО того, как успевал прийти и распарситься ответ сервера на /id — из-за этой
    // гонки в уведомлении навсегда оставался только [ID] без ника подозреваемого.
    trackingNickname = knownNick || null;
    trackingName = knownNick
        ? `Отслеживание | {00FF00}${knownNick}[${id}]`
        : `Отслеживание | {00FF00}ID: ${id}`;
    isInActiveChase = false; // Сброс флага погони
    lastSetmarkSentAt = 0;
 
    // Сначала отправляем /id — ждём 800мс ответа, потом открываем уведомление с ником
    sendChatInput(`/id ${currentScanId}`);
    setTimeout(() => {
        openTrackingNotification(id);
    }, 800);

    // ==================== СООБЩЕНИЕ НАПАРНИКУ ====================
    // Если включено "Сообщение для напарника" — отправляем в радио чтобы напарник
    // получил событие и тоже начал отслеживание этого же ID
    if (partnerMessageEnabled) {
        setTimeout(() => {
            if (!currentScanId) {
                console.log(`[PARTNER] ⛔ Сообщение не отправлено — отслеживание уже остановлено`);
                return;
            }
            sendChatInput(`Отслеживаю жетон ${id}`);
            console.log(`[PARTNER] 📡 Отправлено сообщение напарнику: Отслеживаю жетон ${id}`);
        }, 1200);
    }
    // ==================== КОНЕЦ СООБЩЕНИЯ НАПАРНИКУ ====================
 
    // Начальные команды (без /id — уже отправлен выше)
    // /setmark идёт через sendSetmarkCommand, чтобы зафиксировать время отправки.
    // После отправки сразу запускаем цепочку scheduleSetmark — она сработает ровно
    // через 31с, когда таймер-уведомление дойдёт до нуля → мигания не будет.
    setTimeout(() => {
        if (!currentScanId) return; // защита от гонки: отслеживание уже остановлено (например "невозможно определить местоположение")
        sendSetmarkCommand(currentScanId);
        scheduleSetmark(); // следующий /setmark ровно через 31с (синхронно с таймером)
        setTimeout(() => {
            if (currentScanId) {                 // повторная проверка — стоп мог произойти за эту секунду
                sendChatInput(`/pg ${currentScanId}`);
            }
        }, 1000);
    }, 500);
 
    // Интервал /pg каждые 2 секунды (только если НЕ в активной погоне)
    pgInterval = setInterval(() => {
        if (currentScanId && !isInActiveChase) {
            sendChatInput(`/pg ${currentScanId}`);
        }
    }, 2000);
 
};
const stopTracking = () => {
    // Очищаем все таймеры
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (setmarkInterval) {
        clearTimeout(setmarkInterval); // setTimeout-цепочка → clearTimeout
        setmarkInterval = null;
    }
    if (pgInterval) {
        clearInterval(pgInterval);
        pgInterval = null;
    }
    _cdTimerActive = false; // сброс флага КД
 
    // Закрываем все уведомления (включая таймер-уведомление и КД-таймер)
    closeTrackingNotifications();

    // ==================== СООБЩЕНИЕ НАПАРНИКУ О КОНЦЕ ОТСЛЕЖИВАНИЯ ====================
    if (partnerMessageEnabled && currentScanId) {
        const stoppedId = currentScanId;
        sendChatInput(`Закончил отслеживание за жетоном ${stoppedId}`);
        console.log(`[PARTNER] 📡 Отправлено: Закончил отслеживание за жетоном ${stoppedId}`);
    }
    // ==================== КОНЕЦ СООБЩЕНИЯ О КОНЦЕ ОТСЛЕЖИВАНИЯ ====================
 
    currentScanId = null;
    trackingNickname = null;
    trackingName = `Отслеживание | {FF0000}Выкл`;
    isInActiveChase = false;
    lastSetmarkSentAt = 0;
 
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
// ── Публичные флаги состояния для MvdMenu ─────────────────────────────────────
// MvdMenu читает эти свойства при каждом открытии mainMenuItems
Object.defineProperty(window, '_mvdCurrentScanId',   { get: () => currentScanId,   configurable: true });
Object.defineProperty(window, '_mvdTrackingNick',    { get: () => trackingNickname, configurable: true });
Object.defineProperty(window, '_mvdAutoCuffEnabled', { get: () => autoCuffEnabled, configurable: true });
Object.defineProperty(window, '_mvdAutoGrabEnabled', { get: () => autoGrabEnabled, configurable: true });
// Геттер метки напарника
window._mvdGetPartnerLabel = function() {
    if (partnerTrackingEnabled && partnerNick && partnerId) {
        return 'Напарник: ' + partnerNick + '[' + partnerId + ']';
    }
    return 'Напарник | Выкл';
};
// Toggle-обёртки для MvdMenu
window._mvdToggleAutoCuff = () => { toggleAutoCuff(); };
window._mvdToggleAutoGrab = () => { toggleAutoGrab(); };
// Отслеживание: если активно — останавливает; иначе открывает диалог ввода
window._mvdToggleTracking = () => {
    if (currentScanId) {
        stopTracking();
    } else {
        setTimeout(() => showTrackingInputDialog(giveLicenseTo), 50);
    }
};
// Запуск отслеживания по ID напрямую (для кастомного экрана MvdMenu)
window._mvdStartTracking = (id) => { startTracking(id); };

// ── Публичные API напарника для MvdMenu (кастомный интерфейс) ────────────────
window._mvdPartnerGetState = function() {
    return {
        tracking: partnerTrackingEnabled,
        message:  partnerMessageEnabled,
        nick:     partnerNick,
        id:       partnerId,
    };
};
window._mvdPartnerDisable = function() {
    partnerNick = null;
    partnerId = null;
    partnerTrackingEnabled = false;
    _awaitingPartnerId = false;
    snAdd('[1, "Напарник", "Слежка за напарником отключена", "FF0000", 2500]');
};
window._mvdPartnerSetId = function(rawId) {
    partnerId = rawId;
    partnerNick = null;
    partnerTrackingEnabled = true;
    _awaitingPartnerId = true;
    window._pendingPartnerId = rawId;
    snAdd(`[1, "Напарник", "Ищу игрока ID: ${rawId}...", "FFAA00", 3000]`);
    sendChatInput(`/id ${rawId}`);
};
window._mvdPartnerSetMessage = function(val) {
    partnerMessageEnabled = val;
    partnerMessageName = `Сообщение для напарника | ${val ? '{00FF00}Вкл' : '{FF0000}Выкл'}`;
    snAdd(`[1, "Напарник", "Сообщение: ${val ? 'Вкл' : 'Выкл'}", "${val ? '00FF00' : 'FF0000'}", 2500]`);
};
// ── END публичные флаги ───────────────────────────────────────────────────────

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
    const _visible = povsednevOptions.filter(o => !MENU_HIDDEN_ITEMS.includes(o.action));
    const adjustedIndex = currentPage * ITEMS_PER_PAGE + optionIndex;
    if (adjustedIndex >= 0 && adjustedIndex < _visible.length) {
        const option = _visible[adjustedIndex];
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
        case "naparnick":
            setTimeout(() => showPartnerMenu(giveLicenseTo), 50);
            break;
        case "laws":
            window._duranOpenMode = 'laws';
            window.openInterface('Zkm');
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
            _autoWantedActive = true; // авто-причина только через наш диалог
            sendChatInput(`/su ${id} ${stars}`);
            // Страховочный сброс — если сервер не открыл диалог за 5 секунд
            setTimeout(() => { _autoWantedActive = false; }, 5000);
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
// ==================== ПОДТВЕРЖДЕНИЕ ПРОВЕРКИ ДОКУМЕНТОВ (Alt x1 / Alt x2) ====================
// После "Приветствия" снизу экрана показывается фирменное ZKM-уведомление
// с двумя карточками "ALT×1 — Нет" / "ALT×2 — Да" и живым таймером
// обратного отсчёта (7 секунд, с прогресс-баром и тревожной подсветкой
// на последних секундах) — см. ZkmScreenNotification.addChoice().
//
// Если второй Alt прилетает не позже DOC_CHECK_DBLTAP_MS после первого —
// это "Да", и сразу запускается "checkDocuments". Если второй Alt не
// пришёл вовремя (либо истёк весь таймер) — это "Нет", ничего не делаем.
const DOC_CHECK_PROMPT_SEC = 10;  // длительность таймера уведомления, сек
const DOC_CHECK_DBLTAP_MS  = 400; // макс. интервал между двумя Alt для "Да"

let _docCheckActive       = false;
let _docCheckAltPressedAt = 0;
let _docCheckSingleTimer  = null;
let _docCheckExpireTimer  = null; // fallback-таймер, см. ниже
let _docCheckTargetId     = -1;
let _docCheckSnId         = null; // id уведомления addChoice() в ZKM (timerQueue)
let _docCheckAbortedTargetId = null; // цель, по которой недавно пришла отмена
let _docCheckAbortedAt       = 0;    // Date.now() момента отмены
const DOC_CHECK_ABORT_WINDOW_MS = 3000; // окно, в течение которого отмена ещё "свежая"

function _docCheckCleanup() {
    _docCheckActive = false;
    if (_docCheckSingleTimer) { clearTimeout(_docCheckSingleTimer); _docCheckSingleTimer = null; }
    if (_docCheckExpireTimer) { clearTimeout(_docCheckExpireTimer); _docCheckExpireTimer = null; }
    _docCheckAltPressedAt = 0;
}

// Убирает ZKM-уведомление вручную (решение принято раньше, чем истёк таймер)
function _docCheckHideNotif() {
    if (_docCheckSnId !== null) {
        try { getZkmSN()?.hideTimer(_docCheckSnId); } catch (err) {}
        _docCheckSnId = null;
    }
}

function showDocCheckPrompt(targetId) {
    _docCheckCleanup();
    _docCheckHideNotif();

    const _resolvedTarget = (targetId != null && targetId !== -1) ? targetId : (giveLicenseTo || -1);

    // Если по этой же цели только что (в пределах окна) уже пришло "слишком
    // далеко" / "такого игрока нет" / отказ — это гонка: ответ сервера обогнал
    // открытие уведомления. Не показываем уведомление вовсе.
    if (_docCheckAbortedTargetId !== null &&
        String(_docCheckAbortedTargetId) === String(_resolvedTarget) &&
        (Date.now() - _docCheckAbortedAt) < DOC_CHECK_ABORT_WINDOW_MS) {
        console.log('[MVD] 🚫 Проверка документов пропущена (недавняя отмена по этой цели)');
        _docCheckAbortedTargetId = null;
        return;
    }

    _docCheckActive   = true;
    _docCheckTargetId = _resolvedTarget;

    const sn = getZkmSN();
    if (sn && typeof sn.addChoice === 'function') {
        _docCheckSnId = sn.addChoice(
            `[2, "Проверка документов", "Нет", "Да", "f9b701", ${DOC_CHECK_PROMPT_SEC}]`,
            function () {
                // Таймер естественно истёк, второго Alt не было — трактуем как "Нет"
                _docCheckSnId = null;
                _docCheckCleanup();
            }
        );
    } else {
        // Fallback на случай, если ZKM ещё не подгружен или это старая версия без addChoice
        console.warn('[MVD] ZkmScreenNotification.addChoice недоступен — fallback на обычное уведомление');
        snAdd(`[2, "Проверка документов", "Alt (1 раз) — Нет<br>Alt (2 раза) — Да", "f9b701", ${DOC_CHECK_PROMPT_SEC * 1000}]`);
        _docCheckExpireTimer = setTimeout(_docCheckCleanup, DOC_CHECK_PROMPT_SEC * 1000);
    }
}

// Отдельный слушатель Alt — реагирует ТОЛЬКО пока активно окно решения
// (_docCheckActive), поэтому не пересекается с существующей логикой
// курсора в консоли (см. KEY_CODE_ALT выше) и с MENU_BINDS.
window.addEventListener('keydown', function (e) {
    if (!_docCheckActive) return;
    if (e.keyCode !== window.KEY_CODE_ALT) return;

    const now = Date.now();
    if (_docCheckAltPressedAt && (now - _docCheckAltPressedAt) <= DOC_CHECK_DBLTAP_MS) {
        // Двойное нажатие Alt — "Да": запускаем проверку документов
        const tId = _docCheckTargetId;
        _docCheckCleanup();
        _docCheckHideNotif();
        executePovsednevAction('checkDocuments', tId);
        return;
    }

    _docCheckAltPressedAt = now;
    if (_docCheckSingleTimer) clearTimeout(_docCheckSingleTimer);
    _docCheckSingleTimer = setTimeout(function () {
        // Второй Alt не пришёл вовремя — одиночное нажатие = "Нет"
        _docCheckCleanup();
        _docCheckHideNotif();
    }, DOC_CHECK_DBLTAP_MS);
});
// ==================== КОНЕЦ ПОДТВЕРЖДЕНИЯ ПРОВЕРКИ ДОКУМЕНТОВ ====================

const executePovsednevAction = (action, targetId) => {
    if (!targetId) targetId = giveLicenseTo;
    const isOmonSkin = skinId === 15340;
    switch (action) {
	case "greeting":
		const _rank = window._mvdRank || '';
		const _firstName = window._mvdFirstName || '';
		const _lastName = window._mvdLastName || '';
		const _callsign = CALLSIGN || window._mvdCallsign || '';

		if (isOmonSkin) {
			sendMessagesWithDelay([
				`Работает сотрудник СОБР | Мой позывной ${_callsign}`,
				"Предъявите, пожалуйста, Ваши документы, удостоверяющие Вашу личность.",
				"Если Вы в течение 30 секунд не предъявите мне документы я сочту это за 5.2 УК.",
				"Если Вы убежите или попробуете это сделать я сочту это за 5.2.1 УК."
			], [0, 500, 500, 500]);
			setTimeout(() => showDocCheckPrompt(targetId), 1800);
			setTimeout(() => runPostActionTimer('greeting'), 1800);
		} else {
			sendMessagesWithDelay([
				`Здравия желаю, Вас беспокоит ${_rank} - ${_firstName} ${_lastName}.`,
				`/doc ${targetId}` 
			], [0, 1000]);
			setTimeout(() => showDocCheckPrompt(targetId), 1300);
			setTimeout(() => runPostActionTimer('greeting'), 1300);
		}
		break;
      
     case "checkDocuments":
         if (isOmonSkin) {
             sendMessagesWithDelay([
                 "/s Работает СОБР, руки за голову!",
                 "/s Если Вы убежите или попробуете это сделать я сочту это за 5.2.1 УК",
                 "/s Готовим свои документы!"
             ], [750, 1000, 1000]);
         } else {
             // ── Определяем скины ГУВД ──
             const guvdSkins = [190, 148, 15341, 15342, 15343, 15344, 15348, 15351];
             const isGuvdSkin = guvdSkins.includes(skinId);
             
             // ── Получаем свой ID (как в HASSLE HUD) ──
             let myId = 0;
             try {
                 const hud = window.interface && window.interface("Hud");
                 if (hud && hud.info && hud.info.id) {
                     myId = parseInt(hud.info.id, 10) || 0;
                 }
             } catch(e) {
                 console.warn('[MVD] Ошибка получения ID из Hud:', e);
             }
             
             if (isGuvdSkin) {
                 // ── ГУВД: только паспорт, без прав и ремня ──
                 sendMessagesWithDelay([
                     "Будьте добры предъявить Ваши документы, а именно:",
                     "Паспорт.",
                     `/n /pass ${myId}`
                 ], [0, 1000, 1000]);
             } else {
                 // ── Остальные скины: полный комплект (паспорт + права + документы на т/с + ремень) ──
                 sendMessagesWithDelay([
                     "Будьте добры предъявить Ваши документы, а именно:",
                     "Паспорт, вод.права и документы на т/с.",
                     `/n /pass ${myId}, /carpass ${myId}`,
                     "А также, отстегните пожалуйста ремень безопасности.",
                     "/n /rem"
                 ], [0, 1000, 1000, 1000, 1000]);
             }
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
            runPostActionTimer('wantedFine');
            break;

        case "wanted":
            sendMessagesWithDelay([
                "/me взял рацию в руки",
                "/me сообщил данные о нарушителе диспетчеру",
                "/do Данные сообщены.",
                "/do Нарушитель объявлен в розыск.",
                `/su ${targetId}`
            ], [0, 1000, 1000, 1000, 1000]);
            setTimeout(() => runPostActionTimer('wanted'), 4000);
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
                /* Отыгровка изъятия прав — временно отключена
                "/me взял права, затем переложил их в левую руку",
                "/me взял блокнот и ручку в правую руку",
                "/do Блокнот и ручка в руке.",
                "/me записал данные о нарушении и нарушителе в блокнот",
                "/do Данные заполнены.",
                "/me забрал водительские права",
                "/do Водительские права изъяты.",
                */
                `/takelic ${targetId}`
            ], [0]);
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
    const _rank = window._mvdRank || '';
    const _lastName = window._mvdLastName || '';
    const tag = rankTags[_rank] || `[${_rank}]`;
    
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
			`/s Здравия. Я ${_rank} ${_lastName}.`,
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
    currentPage = 0;
    // Передаём targetId и стартовый экран компоненту через глобальные переменные
    window._mvdMenuTargetId = (e !== undefined && e !== null) ? e : null;
    window._mvdMenuStartScreen = 'povsednev';
    window.openInterface('MvdMenu');
};

// Открыть главное меню МВД (экран "main") — для общего хоткея MENU_KEY
window.showMvdMainMenuPage = (e) => {
    giveLicenseTo = e;
    currentMenu = "main";
    currentPage = 0;
    window._mvdMenuTargetId = (e !== undefined && e !== null) ? e : null;
    window._mvdMenuStartScreen = 'main';
    window.openInterface('MvdMenu');
};

// Публичный API для MvdMenu — выполнить действие Повседневной напрямую
window._mvdExecuteAction = function(action, id) {
    giveLicenseTo = (id !== undefined && id !== null && id !== -1) ? id : giveLicenseTo;
    currentAction = action;
    currentMenu = "povsednev";
    executePovsednevAction(action, giveLicenseTo);
};
// Публичный API для LawsHelper — передаёт статью КоАП и активирует авто-подстановку в серверный диалог /takelic
window._mvdSetTakeLicReason = function(reason) {
    lastTakeLicCode = reason;
    _autoTakeLicActive = true;
    setTimeout(() => { _autoTakeLicActive = false; }, 10000);
    console.log(`[AUTO-TAKELIC] Причина установлена через LawsHelper: "${reason}"`);
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
    if (stroyRanks.includes(window._mvdRank)) {
        availableSub.push({ name: "Строй", id: "stroy" });
    }
    availableSub.push({ name: trackingName, id: "tracking" });
    availableSub.push({ name: autoCuffName, id: "autocuff" });
    if (window.AUTO_GRAB === true) {
        availableSub.push({ name: autoGrabName, id: "autograb" });
    }
    availableSub.push({ name: getPartnerMenuLabel(), id: "naparnick" });
    availableSub.push({ name: "Законы", id: "laws" });
    shownMvdSubTypes = availableSub;
    let licenseList = '';
    availableSub.forEach((license, index) => {
        licenseList += `${index + 1}. ${license.name}<n>`;
    });
    window.addDialogInQueue(`[677,2,"МВД","","Выбрать","Отмена",0,0]`, licenseList, 0);
};
// ==================== МЕНЮ НАПАРНИКА ====================
window.showPartnerMenu = (e) => {
    giveLicenseTo = e;
    // Тихо обновляем ник напарника каждый раз при открытии раздела
    refreshPartnerNickSilent();
    const trackLabel = getPartnerTrackingLabel();
    const menuList =
        `1. ${trackLabel}<n>` +
        `2. ${partnerMessageName}`;
    window.addDialogInQueue(`[682,2,"Напарник","","Выбрать","Назад",0,0]`, menuList, 0);
};
window.showPartnerIdInputDialog = (e) => {
    giveLicenseTo = e;
    const cur = (partnerNick && partnerId) ? `Текущий: ${partnerNick}[${partnerId}]` : `Не задан`;
    window.addDialogInQueue(
        `[683,1,"Напарник — Ввод ID","Введите ID напарника (${cur}):","Подтвердить","Отмена",0,0]`,
        "", 0
    );
};
// ==================== КОНЕЦ МЕНЮ НАПАРНИКА ====================
window.showKoapTypeMenu = (e) => {
    giveLicenseTo = e;
    window._duranOpenMode = 'fine';
    window._duranFineTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('LawsHelper');
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
    window._duranOpenMode = 'wanted';
    window._duranWantedTargetId = (e !== undefined && e !== null) ? e : -1;
    window.openInterface('LawsHelper');
};
window.showTakeLicReasonDialog = (e) => {
    giveLicenseTo = e;
    window.addDialogInQueue(`[684,1,"Причина изъятия прав","Введите статью КоАП (пр.: 3.1):","Подтвердить","Отмена",0,0]`, "", 0);
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
    console.log(`[EVENT] Событие: ${event}, Аргументы:`, args);

    // Alt+Q — авто-тазер (своп тазер ↔ дигл) перехватывается через keydown (браузерный уровень)

    if (args[0] === "OnDialogResponse" && (args[1] >= 666 && args[1] <= 684)) {
        if (args[1] === 666) { // Главное меню
            const listitem = args[3];
            if (args[2] === 1 && giveLicenseTo !== -1) {
                SendGiveLicenseCommand(giveLicenseTo, listitem);
            } else {
                lastMenuType = null;
                currentMenu = null;
                restoreTrackingTimer();
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
                restoreTrackingTimer();
                return;
            }
        }
        else if (args[1] === 668) { // Диалог ввода ID
            const inputId = args[4];
            // Читаем action из currentAction (биндинги) или window._mvdMenuPendingAction (MvdMenu — fallback)
            const resolvedAction = currentAction || window._mvdMenuPendingAction || null;
            if (args[2] === 1 && resolvedAction) {
                giveLicenseTo = inputId;
                if (resolvedAction === 'takeLicense') {
                    // Перед выполнением изъятия — запросить статью КоАП (причина для серверного диалога)
                    currentAction = null;
                    window._mvdMenuPendingAction = null;
                    setTimeout(() => showTakeLicReasonDialog(giveLicenseTo), 50);
                    return;
                }
                executePovsednevAction(resolvedAction, inputId);
            }
            currentAction = null;
            window._mvdMenuPendingAction = null;
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
                restoreTrackingTimer();
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
            } else if (args[2] === 0) {
                // Отмена / ESC — закрываем меню, восстанавливаем уведомление
                restoreTrackingTimer();
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
        // ==================== НАПАРНИК ДИАЛОГИ ====================
        else if (args[1] === 682) { // Меню Напарник
            const listitem = args[3];
            if (args[2] === 1) {
                if (listitem === 0) {
                    // "Следить за напарником" — если уже включено, отключаем; иначе запрашиваем ID
                    if (partnerTrackingEnabled) {
                        partnerNick = null;
                        partnerId = null;
                        partnerTrackingEnabled = false;
                        _awaitingPartnerId = false;
                        snAdd('[1, "Напарник", "Слежка за напарником отключена", "FF0000", 2500]');
                        console.log('[PARTNER] Слежка отключена');
                        setTimeout(() => showPartnerMenu(giveLicenseTo), 50);
                    } else {
                        setTimeout(() => showPartnerIdInputDialog(giveLicenseTo), 50);
                    }
                } else if (listitem === 1) {
                    // "Сообщение для напарника" — переключатель
                    partnerMessageEnabled = !partnerMessageEnabled;
                    partnerMessageName = `Сообщение для напарника | ${partnerMessageEnabled ? '{00FF00}Вкл' : '{FF0000}Выкл'}`;
                    snAdd(`[1, "Напарник", "Сообщение: ${partnerMessageEnabled ? 'Вкл' : 'Выкл'}", "${partnerMessageEnabled ? '00FF00' : 'FF0000'}", 2500]`);
                    console.log(`[PARTNER] Сообщение для напарника: ${partnerMessageEnabled ? 'вкл' : 'выкл'}`);
                    setTimeout(() => showPartnerMenu(giveLicenseTo), 50);
                }
            } else if (args[2] === 0) {
                // Назад — в МВД подменю
                setTimeout(() => showMvdSubMenu(giveLicenseTo), 50);
            }
        }
        else if (args[1] === 683) { // Ввод ID напарника
            const inputId = args[4];
            if (args[2] === 1 && inputId && inputId.trim()) {
                const rawId = inputId.trim();
                // Сохраняем ID предварительно и запускаем /id для получения ника
                partnerId = rawId;
                partnerNick = null;
                partnerTrackingEnabled = true;
                _awaitingPartnerId = true;
                window._pendingPartnerId = rawId;
                sendChatInput(`/id ${rawId}`);
                snAdd(`[1, "Напарник", "Ищу игрока ID: ${rawId}...", "FFAA00", 3000]`);
                console.log(`[PARTNER] Установка напарника: /id ${rawId}`);
            } else {
                // Отмена — возврат в меню напарника
                setTimeout(() => showPartnerMenu(giveLicenseTo), 50);
            }
        }
        // ==================== КОНЕЦ НАПАРНИК ДИАЛОГИ ====================
        else if (args[1] === 684) { // Причина изъятия прав (статья КоАП)
            const reason = args[4];
            if (args[2] === 1 && reason && reason.trim()) {
                const trimmed = reason.trim();
                // Добавить " КоАП" если ещё не указан тип
                lastTakeLicCode = /КоАП|УК/i.test(trimmed) ? trimmed : trimmed + ' КоАП';
                _autoTakeLicActive = true;
                setTimeout(() => { _autoTakeLicActive = false; }, 10000);
                console.log(`[AUTO-TAKELIC] Причина установлена: "${lastTakeLicCode}" — запускаем изъятие`);
                executePovsednevAction('takeLicense', giveLicenseTo);
            }
            // Отмена — ничего не делаем (закрываем без действия)
        }
    } else if (args[0] === "OnDialogResponse" && _wantedDialogId !== null && args[1] === _wantedDialogId) {
        // ==================== /WANTED: ВЫБОР ИГРОКА → АВТО-ОТСЛЕЖИВАНИЕ ====================
        if (args[2] === 1) {
            const listitem = parseInt(args[3]);
            const player = _wantedPlayers[listitem];
            if (player) {
                console.log(`[WANTED] ✅ Выбран: ${player.nick}[${player.id}] — запускаем отслеживание`);
                _wantedDialogId = null;
                setTimeout(() => startTracking(player.id, player.nick), 100);
            } else {
                console.log(`[WANTED] ⚠️ Не найден игрок с listitem=${listitem}, всего=${_wantedPlayers.length}`);
                _wantedDialogId = null;
            }
        } else {
            _wantedDialogId = null;
        }
        window.sendClientEventHandle(event, ...args);
        // ==================== КОНЕЦ /WANTED ====================
    } else {
        window.sendClientEventHandle(event, ...args);
    }
};
var __mvdPrevSendChatInput = window.sendChatInput; // сохраняем хук /has, /has_s, чтобы не потерять его при замене ниже
window.sendChatInputCustom = e => {
    const args = e.split(" ");
    if (args[0] == "/dahk") {
    targetId = args[1];
    const freshSkin = getSkinIdFromStore();
    if (freshSkin !== null) skinId = Number(freshSkin);
    window._mvdSkinId = skinId; // FIX: прокидываем наружу для MvdMenu.js
    if (mvdSkins.includes(skinId)) {
        
        const openMenu = () => {
            snAdd('[0, "AHK by TG: ZaharKonst", "Меню фракции \'МВД\'", "0000FF", 5000]');
            restoreTrackingTimer();
            refreshPartnerNickSilent();
            if (lastMenuType === "stroy") {
                showStroyMenuPage(args[1]);
            } else {
                showMvdMainMenuPage(args[1]);
            }
        };

        // Если данные уже загружены — открываем меню МГНОВЕННО
        if (window._mvdFirstName && window._mvdLastName && window._mvdRank) {
            openMenu();
        } else if (typeof window._mvdLoadPlayerProfile === 'function') {
            // Первый раз — загружаем профиль, потом открываем
            window._mvdLoadPlayerProfile(openMenu);
        } else {
            openMenu();
        }
    } else {
        snAdd('[0, "AHK by TG: ZaharKonst", "Не удалось определить фракцию попробуйте ещё раз", "FFFFFF", 5000]');
    }
    } else if (args[0] == "/console") {
        try {
            const consoleRef = window.App && window.App.$refs && window.App.$refs.console;
            const willOpen = !consoleRef || !consoleRef.isOpened;
            if (willOpen && window.App) {
                if (!window.App.isDevelopment) {
                    window.App.isDevelopment = true;
                    if (window.App.engine != "legacy" && typeof engine !== "undefined") {
                        engine.trigger("ActivateDevelopmentMode");
                    }
                }
                if (typeof window.App.setConsoleActive === "function") {
                    window.App.setConsoleActive(true);
                }
            }
            if (consoleRef && typeof consoleRef.toggle === 'function') {
                consoleRef.toggle();
            } else {
                console.log('[CONSOLE] Интерфейс console не найден');
            }
            if (!willOpen && window.App && typeof window.App.setConsoleActive === "function") {
                // Было открыто — теперь закрываем не просто сворачивая, а полностью прячем виджет
                window.App.setConsoleActive(false);
            }
            if (!willOpen && typeof window.setCursorStatus === "function") {
                // Курсор мог быть включён через Alt пока консоль была открыта — гасим его при закрытии
                window.cursorStatus = false;
                window.setCursorStatus('Console', false);
            }
        } catch (e) {
            console.log('[CONSOLE] Ошибка переключения консоли:', e.message);
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
        // Сброс напарника
        partnerNick = null;
        partnerId = null;
        partnerTrackingEnabled = false;
        partnerMessageEnabled = false;
        _awaitingPartnerId = false;
        partnerMessageName = `Сообщение для напарника | {FF0000}Выкл`;
        sendChatInput("Настройки МВД сброшены. Следующее /mvd откроет главное меню.");
    } else if (args[0] == "/int") {
        // Просмотрщик интерфейсов (см. блок [ZK-INTERFACE-VIEWER] ниже в файле).
        // window.zkInterfaceViewer регистрируется в самом конце скрипта, но т.к.
        // эта ветка реально выполняется только когда игрок ЧТО-ТО вводит в чат
        // (т.е. уже после полной загрузки файла) — к этому моменту объект
        // гарантированно существует. Доступ (ник Zahar_Loidov) проверяется
        // внутри самого toggle()/start(), здесь просто передаём вызов дальше.
        try {
            if (window.zkInterfaceViewer && typeof window.zkInterfaceViewer.toggle === "function") {
                window.zkInterfaceViewer.toggle();
            } else {
                console.warn('[ZK-VIEW] window.zkInterfaceViewer ещё не готов (интерфейс не успел загрузиться)');
            }
        } catch (err) {
            console.warn('[ZK-VIEW] /int toggle error:', err);
        }
    } else if (typeof __mvdPrevSendChatInput === "function") {
        // отдаём команду предыдущему обработчику (там живут /has, /has_s),
        // а он сам решит, обработать её самому или прокинуть в движок дальше
        __mvdPrevSendChatInput(e);
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

// ── /wanted список: сохраняем ID игроков при открытии диалога ──
let _wantedDialogId = null;      // ID серверного диалога /wanted
let _wantedPlayers = [];         // [ { nick, id }, ... ] — в порядке строк

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

            // ── Авто-закрытие диалога "Точное время" (открывается после команды /c 60) ──
            // Команду шлёт runPostActionTimer() если для действия включена опция
            // в установщике (MENU_TIMER_ITEMS). Сервер в ответ на "/c 60" всегда
            // показывает этот MSGBOX — закрываем его через 1.5с, чтобы не мешал.
            if (style === 0 && title.includes('Точное время')) {
                const _timeDlgId = dialogId;
                setTimeout(() => {
                    try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                    console.log('[AHK-TIMER] Диалог "Точное время" закрыт');
                }, 1500);
            }

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
                    console.log('[MVD-GRAB] === v2.1 🎯 ТРИГГЕР СРАБОТАЛ — Полицейская служба ===');
                    setTimeout(() => window.autoGrab(), 150);
                }
            }

            // ── /wanted: TABLIST_HEADERS "Список разыскиваемых" — сохраняем игроков ──
            if ((style === 4 || style === 5) && title.includes('разыскиваемых')) {
                _wantedDialogId = dialogId;
                _wantedPlayers = [];
                if (content) {
                    const raw = Array.isArray(content) ? content.join('') : String(content);
                    // Строки разделены <n>, каждая строка: "Ник[ID]<t>Дистанция" или "Ник[ID]	Дистанция"
                    const rows = raw.split('<n>');
                    rows.forEach(row => {
                        // Извлекаем Ник[ID] из строки — формат "Nick_Name[123]"
                        const m = row.match(/([A-Za-z0-9_]+)\[(\d+)\]/);
                        if (m) _wantedPlayers.push({ nick: m[1], id: m[2] });
                    });
                }
                console.log(`[WANTED] Диалог id=${dialogId}, игроков: ${_wantedPlayers.length}`, _wantedPlayers.map(p => p.nick + '[' + p.id + ']').join(', '));
            }

            // ── Авто-"Да" при смене цели погони: MSGBOX "Подтверждение → хотите окончить погоню за X?" ──
            // Если ник в диалоге НЕ совпадает с текущим trackingNickname → авто-подтверждаем смену
            if (style === 0 && title.includes('Подтверждение') && contentText.includes('хотите окончить погоню за')) {
                const _chaseMsgNickM = contentText.match(/погоню за ([A-Za-z0-9_]+)/);
                if (_chaseMsgNickM && currentScanId) {
                    const _chaseMsgNick = _chaseMsgNickM[1];
                    const _isCurrentNick = trackingNickname && _chaseMsgNick === trackingNickname;
                    if (!_isCurrentNick) {
                        console.log(`[CHASE-MSGBOX] ✅ Авто-"Да": диалог для "${_chaseMsgNick}", наш ник="${trackingNickname||'ещё нет'}" (id=${currentScanId}) — подтверждаем`);
                        const _chaseMsgDlgId = dialogId;
                        setTimeout(() => {
                            sendClientEvent(
                                (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined) ? window.gm.EVENT_EXECUTE_PUBLIC : 0,
                                'OnDialogResponse', _chaseMsgDlgId, 1, -1, ''
                            );
                            console.log('[CHASE-MSGBOX] "Да" отправлен — старая погоня прекращена');
                            try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                        }, 150);
                    } else {
                        console.log(`[CHASE-MSGBOX] Ник совпадает (${_chaseMsgNick}) — не трогаем`);
                    }
                }
            }

            // ── Авто-розыск: LIST "Причина выдачи розыска" → выбрать "Ввести вручную" ──
            // Срабатывает ТОЛЬКО если /su был отправлен через наш диалог (пункт 14 меню)
            if (style === 2 && title.includes('Причина выдачи розыска') && _autoWantedActive) {
                _autoWantedActive = false; // сбрасываем — чтоб следующий ручной /su не сработал
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

            // ── Авто-изъятие: LIST "Выберите лицензию" → авто-выбор "Водительские права" (listitem=1) ──
            if (style === 2 && title.includes('Выберите лицензию') && _autoTakeLicActive) {
                _autoTakeLicActive = false;
                _awaitingTakeLicInput = true;
                const _takeLicListDlgId = dialogId;
                console.log('[AUTO-TAKELIC] Обнаружен диалог выбора лицензии — авто-выбор "Водительские права"');
                setTimeout(() => {
                    sendClientEvent(
                        (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                            ? window.gm.EVENT_EXECUTE_PUBLIC
                            : 'server',
                        'OnDialogResponse', _takeLicListDlgId, 1, 1, ''
                    );
                    console.log('[AUTO-TAKELIC] Отправлен выбор "Водительские права" (listitem=1)');
                }, 200);
            }

            // ── Авто-изъятие: INPUT "Укажите причину" → авто-ввод статьи КоАП ──
            if (style === 1 && title.includes('Укажите причину') && _awaitingTakeLicInput) {
                _awaitingTakeLicInput = false;
                const reason = lastTakeLicCode || '3.1 КоАП';
                const _takeLicInputDlgId = dialogId;
                console.log(`[AUTO-TAKELIC] Обнаружен диалог ввода причины — авто-ввод "${reason}"`);
                setTimeout(() => {
                    _origSendClientEventHandle.call(
                        window,
                        (window.gm && window.gm.EVENT_EXECUTE_PUBLIC !== undefined)
                            ? window.gm.EVENT_EXECUTE_PUBLIC
                            : 'server',
                        'OnDialogResponse', _takeLicInputDlgId, 1, 0, reason
                    );
                    console.log(`[AUTO-TAKELIC] Причина "${reason}" отправлена`);
                    lastTakeLicCode = null;
                    setTimeout(() => {
                        try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                        console.log('[AUTO-TAKELIC] Диалог закрыт');
                    }, 100);
                }, 300);
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
                    // Закрываем UI диалога
                    setTimeout(() => {
                        try { window.App && typeof window.App.closeLastDialog === 'function' && window.App.closeLastDialog(); } catch(e) {}
                        console.log('[AUTO-РОЗЫСК] Диалог закрыт');
                        runPostActionTimer('wantedFine');
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
// Проверяем и локальную переменную и window (на случай если патч LoadAhk сработал через window)
if (AUTO_GRAB || window.AUTO_GRAB === true) {
(function() {
console.log('[MVD-GRAB] === v2.2 🔫 БЛОК AUTO_GRAB ЗАПУЩЕН (МОМЕНТАЛЬНЫЙ) ===');
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
 const CT_NAMES_GRAB = { 0: 'ACC', 1: 'INV', 2: 'BACK', 3: 'EXTRA' };

 function logInventoryGrab(label) {
     try {
         const inv = window.interface("InventoryNew");
         if (!inv?.items) { console.log(`[GRAB-LOG] ${label}: items недоступны`); return; }
         const lines = [`[GRAB-LOG] ── ${label} ──`];
         for (const cid of [0, 1, 2, 3]) {
             const c = inv.items[cid];
             if (!c) { lines.push(`  ${CT_NAMES_GRAB[cid]}(${cid}): нет контейнера`); continue; }
             const entries = Object.entries(c);
             if (entries.length === 0) { lines.push(`  ${CT_NAMES_GRAB[cid]}(${cid}): пусто`); continue; }
             for (const [slot, item] of entries) {
                 if (!item) continue;
                 lines.push(`  ${CT_NAMES_GRAB[cid]}(${cid}) slot${slot}: id=${item.id} x${item.count||1} w=${item.weight}`);
             }
         }
         console.log(lines.join('\n'));
     } catch(e) { console.log(`[GRAB-LOG] ${label}: ошибка`, e); }
 }

 function findItem(itemId) {
     try {
         const inv = window.interface("InventoryNew");
         if (!inv?.items) return null;
         for (const cid of [CT.INV, CT.BACK, CT.ACC]) {
             const c = inv.items[cid];
             if (!c) continue;
             for (const [slot, item] of Object.entries(c)) {
                 if (item?.id === itemId) {
                     console.log(`[GRAB] findItem(id=${itemId}): найден в ${CT_NAMES_GRAB[cid]} slot${slot} x${item.count||1}`);
                     return { cid, slot: parseInt(slot), count: item.count || 1 };
                 }
             }
         }
     } catch(e) {}
     console.log(`[GRAB] findItem(id=${itemId}): НЕ НАЙДЕН`);
     return null;
 }

 function findItemInInv(itemId) {
     try {
         const inv = window.interface("InventoryNew");
         if (!inv?.items) return null;
         const c = inv.items[CT.INV];
         if (!c) return null;
         for (const [slot, item] of Object.entries(c)) {
             if (item?.id === itemId) {
                 console.log(`[GRAB] findItemInInv(id=${itemId}): найден в INV slot${slot} x${item.count||1}`);
                 return { cid: CT.INV, slot: parseInt(slot), count: item.count || 1 };
             }
         }
     } catch(e) {}
     console.log(`[GRAB] findItemInInv(id=${itemId}): НЕ НАЙДЕН (в поясе)`);
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
         console.log(`[GRAB] countItem(id=${itemId}): итого x${total}`);
         return total;
     } catch(e) { return 0; }
 }

 function openInventory() {
     console.log('[GRAB] openInventory()');
     sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnInventoryDisplayChange");
 }

 function closeInventory() {
 	console.log('[GRAB] closeInventory() — через сервер (синхронизация)');
 	sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnInventoryDisplayChange");
 }

 async function waitInventory(maxMs = 1000) {
     console.log(`[GRAB] waitInventory(${maxMs}ms)...`);
     for (let i = 0; i < maxMs; i += 50) {
         try {
             const inv = window.interface("InventoryNew");
             if (inv?.items?.[CT.INV] !== undefined) {
                 console.log(`[GRAB] waitInventory: готов за ${i}мс`);
                 return true;
             }
         } catch(e) {}
         await sleep(50);
     }
     console.error(`[GRAB] waitInventory: таймаут!`);
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

     // ── ПАТЧИ: скрываем визуал инвентаря на ВЕСЬ авто-граб ──
     const _grabOrigPlaySound         = window.playSound;
     const _grabOrigSetHudStatus      = window.setHudStatus;
     const _grabOrigSetDrawLabel      = window.setDrawLabelStatus;
     let _grabPatchesActive = true;

     function applyGrabPatches() {
         _grabPatchesActive = true;
         window.playSound = function(path, ...rest) {
             if (_grabPatchesActive && typeof path === 'string' && path.includes('inventory')) {
                 return;
             }
             return _grabOrigPlaySound.apply(this, [path, ...rest]);
         };
         window.setHudStatus = function(status) {
             if (_grabPatchesActive) return;
             return _grabOrigSetHudStatus.apply(this, arguments);
         };
         window.setDrawLabelStatus = function(status) {
             if (_grabPatchesActive) return;
             return _grabOrigSetDrawLabel.apply(this, arguments);
         };
     }

     function restoreGrabPatches() {
         _grabPatchesActive = false;
         window.playSound          = _grabOrigPlaySound;
         window.setHudStatus       = _grabOrigSetHudStatus;
         window.setDrawLabelStatus = _grabOrigSetDrawLabel;
     }

     function hideInventoryUI() {
         const id = setInterval(() => {
             const el = document.querySelector('.iface-container.inventory')
                     || document.querySelector('.inventory')
                     || document.querySelector('[class*="InventoryNew"]')
                     || document.querySelector('.iface-container');
             if (el && el.style.visibility !== 'hidden') {
                 el.style.visibility = 'hidden';
                 el.style.pointerEvents = 'none';
                 el.style.opacity = '0';
             }
             const dlg = document.querySelector('.dialog-container')
                      || document.querySelector('[class*="Dialog"]');
             if (dlg && dlg.style.visibility !== 'hidden') {
                 dlg.style.visibility = 'hidden';
                 dlg.style.pointerEvents = 'none';
                 dlg.style.opacity = '0';
             }
         }, 10);
         return id;
     }

     applyGrabPatches();
     const hideInterval = hideInventoryUI();

     try {
         const armourVal = getArmourValue();

         // ── Шаг 1: открываем инвентарь (невидимо благодаря патчам выше) ──
         let ready = false;
         for (let attempt = 0; attempt < 2 && !ready; attempt++) {
             if (attempt > 0) await sleep(300);
             openInventory();
             ready = await waitInventory(1500);
         }
         if (!ready) {
             notify("Ошибка", "Инвентарь не открылся", "FF0000");
             return; 
         }

         // ── Шаг 2: читаем что нужно ──
         logInventoryGrab('GRAB ДО ВЗЯТИЯ');
         const skipList = (typeof AUTO_GRAB_SKIP !== 'undefined' && AUTO_GRAB_SKIP.length) ? AUTO_GRAB_SKIP : ((typeof window._mvdGrabSkip !== 'undefined') ? window._mvdGrabSkip : []);
         const skip = (key) => skipList.includes(key);

         const has = {
             medkit:      skip('medkit')      ? 999 : (findItemInInv(ITEM.MEDKIT)  ? 1 : 0),
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
             wand:        skip('baton2')      ? 1   : 0,
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

         console.log('[GRAB] has:', JSON.stringify(has));
         console.log('[GRAB] need:', JSON.stringify(need));

         // ── Шаг 3: запоминаем слоты и закрываем инвентарь (невидимо) ──
         const freeInvSlots = [];
         const freeBACKSlots = [];
         try {
             const inv0 = window.interface("InventoryNew");
             if (inv0?.items) {
                 const invMap  = inv0.items[CT.INV]  || {};
                 const backMap = inv0.items[CT.BACK] || {};
                 for (let s = 0; s < 20; s++) if (!invMap[s])  freeInvSlots.push(s);
                 for (let s = 0; s < 50; s++) if (!backMap[s]) freeBACKSlots.push(s);
             }
         } catch(e) {}
         
         closeInventory();
         await sleep(50);

         // ── ВСЁ ЕСТЬ: выходим, инвентарь уже закрыт и невидим ──
         if (!Object.values(need).some(Boolean)) {
             notify("МВД", "Всё снаряжение есть ✓", "00FF00");
             return; 
         }

         // ── Шаг 4: МОМЕНТАЛЬНО берём предметы из меню ──
         const toTake = [];
         if (need.painkillers) toTake.push({ name: "Обезболивающее",                          idx: MENU.PAINKILLERS });
         if (need.medkit)      toTake.push({ name: "Аптечка",                                 idx: MENU.MEDKIT });
         if (need.baton)       toTake.push({ name: "Дубинка",                                 idx: MENU.BATON });
         if (need.wand)        toTake.push({ name: "Жезл",                                    idx: MENU.WAND });
         if (need.vest)        toTake.push({ name: `Бронежилет (${armourVal}%)`,              idx: MENU.VEST });
         if (need.radarGun)    toTake.push({ name: "Тауметр",                                 idx: MENU.RADAR_GUN });
         if (need.diagnostics) toTake.push({ name: "Диагностика",                             idx: MENU.DIAGNOSTICS });
         if (need.deagle)      toTake.push({ name: "Desert Eagle",                            idx: MENU.DEAGLE });
         if (need.taser)       toTake.push({ name: "Тазер",                                   idx: MENU.TASER });
         if (need.magnum)      toTake.push({ name: `Патроны .44 (есть: ${has.magnum})`,       idx: MENU.AMMO_MAGNUM });
         if (need.akm)         toTake.push({ name: "АКМ",                                     idx: MENU.AKM });
         if (need.ammo762)     toTake.push({ name: `Патроны 7.62 (есть: ${has.ammo762})`,     idx: MENU.AMMO_762 });
         if (need.aks74u)      toTake.push({ name: "АКС-74У",                                 idx: MENU.AKS74U });
         if (need.ammo545)     toTake.push({ name: `Патроны 5.45 (есть: ${has.ammo545})`,     idx: MENU.AMMO_545 });
         if (need.remington)   toTake.push({ name: "Remington 870",                           idx: MENU.REMINGTON });
         if (need.ammo1270)    toTake.push({ name: `Патроны 12x70 (есть: ${has.ammo1270})`,   idx: MENU.AMMO_1270 });

         for (let i = 0; i < toTake.length; i++) {
             console.log(`[MVD-GRAB] → беру: ${toTake[i].name} (idx=${toTake[i].idx}) [МОМЕНТАЛЬНО]`);
             take(toTake[i].idx);
             // Микро-задержка 20мс на случай жесткого анти-флуда на сервере.
             // Для глаза это выглядит как мгновенное выполнение.
             await sleep(20); 
         }

         // ⚠️ ВАЖНО: Закрываем меню принудительно, чтобы сервер не переоткрывал диалог
         closeMenu();

         const notifyNames = toTake.map(t => t.name.replace(/ \(есть: \d+\)/, ''));
         notify("МВД", notifyNames.join(", "), "00FF00");
         window.playSound("inventory/take_light.mp3");

     } catch (err) {
         console.error('[MVD-GRAB] Ошибка:', err);
         notify("Ошибка", err.message, "FF0000");
     } finally {
         // ── Гарантированное восстановление при ЛЮБОМ выходе ──
         clearInterval(hideInterval);
         try {
             document.querySelectorAll('.iface-container.inventory, .inventory, [class*="InventoryNew"], .dialog-container, [class*="Dialog"]').forEach(el => {
                 el.style.visibility = '';
                 el.style.pointerEvents = '';
                 el.style.opacity = '';
             });
         } catch(e) {}
         restoreGrabPatches();
         isProcessing = false;
         console.log('[MVD-GRAB] готов (моментальный + закрытие меню)');
     }
 }

 // ==================== ТРИГГЕР ====================
 window.autoGrab = autoGrab;
 Object.defineProperty(window, '_mvdGrabProcessing', {
     get: () => isProcessing,
     configurable: true
 });
 console.log('[MVD-GRAB] === v2.2 ✅ ГОТОВ — жду диалог Полицейская служба ===');
})();
} // end if (AUTO_GRAB)
// ==================== END АВТОБРАНИЕ МВД ====================

// ==================== АВТО-ТАЗЕР: СВОП ТАЗЕР ↔ ДИГЛ (v18 — sync + no-freeze) ====================
(function() {
    const ITEM_DEAGLE = 19;
    const CT = { ACC: 0, INV: 1, BACK: 2, EXTRA: 3 };
    const CT_NAMES = { 0: 'ACC', 1: 'INV', 2: 'BACK', 3: 'EXTRA' };

    let _busy = false;
    let _busyTimer = null;
    let _swapActive = false;

    // Сохраняем оригинал для восстановления
    const _origSetCursorStatus = window.setCursorStatus;

    function applyPatches() {
        _swapActive = true;
        // Патчим setCursorStatus: для InventoryNew курсор НЕ показываем,
        // но allowMovement=true — персонаж продолжает двигаться
        window.setCursorStatus = function(name, status, allowMovement) {
            if (_swapActive && name === 'InventoryNew') {
                try {
                    if (typeof engine !== 'undefined' && engine.trigger) {
                        engine.trigger("SetCursorStatus", false, true);
                    }
                } catch(e) {}
                return;
            }
            return _origSetCursorStatus.apply(this, arguments);
        };
    }

    function restoreOriginals() {
        window.setCursorStatus = _origSetCursorStatus;
    }

    function clearBusy() {
        clearTimeout(_busyTimer);
        _busy = false;
        _swapActive = false;
        restoreOriginals();
        console.log('[АВТО-ТАЗЕР] готов');
    }

    function findItem(items, itemId) {
        for (const cid of [CT.INV, CT.BACK, CT.ACC, CT.EXTRA]) {
            const c = items[cid];
            if (!c) continue;
            for (const [slot, item] of Object.entries(c)) {
                if (item?.id === itemId) {
                    const loc = { cid, slot: parseInt(slot), count: item.count || 1 };
                    console.log(`[АВТО-ТАЗЕР] findItem(Дигл): ${CT_NAMES[cid]} slot${loc.slot} x${loc.count}`);
                    return loc;
                }
            }
        }
        return null;
    }

	function hasBackpack() {
		try {
			const inv = window.interface('InventoryNew');
			const containers = inv?.containers || inv?.$data?.containers || {};
			const back = containers[CT.BACK];

			if (!back) {
				return false;
			}

			const slots = back.countSlots ?? back.capacity?.max;

			if (slots !== undefined && Number(slots) <= 0) {
				return false;
			}

			return true;
		} catch (e) {
			return false;
		}
	}

	function findFreeSlot(items, targetCid) {
		const container = items[targetCid];

		if (!container) {
			if (targetCid === CT.BACK && hasBackpack()) {
				return 0;
			}

			return -1;
		}

		for (let s = 0; s < 50; s++) {
			if (!container[s]) {
				console.log(`[АВТО-ТАЗЕР] freeSlot(${CT_NAMES[targetCid]}): ${s}`);
				return s;
			}
		}

		return -1;
	}

	function tryGetItems() {
		try {
			const inv = window.interface('InventoryNew');
			const items = inv?.items;

			if (!items) {
				return null;
			}

			if (items[CT.INV] !== undefined || items[CT.BACK] !== undefined) {
				return items;
			}
		} catch(e) {}

		return null;
	}

    function swapTaserDeagle() {
        if (!mvdSkins.includes(skinId)) {
            console.log('[АВТО-ТАЗЕР] не МВД форма, пропуск');
            return;
        }
        if (_busy) {
            console.log('[АВТО-ТАЗЕР] занят, пропуск');
            return;
        }
        _busy = true;
        _busyTimer = setTimeout(() => {
            if (_busy) {
                _busy = false;
                _swapActive = false;
                restoreOriginals();
                console.log('[АВТО-ТАЗЕР] таймаут сброса');
            }
        }, 5000);

        // ── ГЛАВНАЯ ЛОГИКА С УЧЁТОМ РАССИНХРОНИЗАЦИИ ──
        // Проверяем: считает ли КЛИЕНТ инвентарь открытым?
        // Это бывает после:
        //   - диалогов Window (склад, /id и т.д.)
        //   - авто-граба (если closeInventory закрыл только локально)
        //   - любых интерфейсов которые дергают closeInterface без сервера
        const clientThinksOpen = !!(
            window.getInterfaceStatus &&
            window.getInterfaceStatus('InventoryNew')
        );

        function doOpenAndSwap() {
            // Активируем патч курсора ПЕРЕД открытием
            applyPatches();

            console.log('[АВТО-ТАЗЕР] открываем инвентарь (no-freeze)...');
            sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');

            let attempts = 0;
            const maxAttempts = 40;
            const poll = setInterval(() => {
                attempts++;
                const items = tryGetItems();

                if (!items) {
                    if (attempts >= maxAttempts) {
                        clearInterval(poll);
                        console.log('[АВТО-ТАЗЕР] items не появились, отмена');
                        sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                        snAdd('[1, "АВТО-ТАЗЕР", "Ошибка: инвентарь не открылся", "FF0000", 3000]');
                        clearBusy();
                    }
                    return;
                }

                clearInterval(poll);
                console.log(`[АВТО-ТАЗЕР] items получены (попытка ${attempts})`);

                const deagleLoc = findItem(items, ITEM_DEAGLE);
                if (!deagleLoc) {
                    console.log('[АВТО-ТАЗЕР] дигл не найден');
                    sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                    snAdd('[1, "АВТО-ТАЗЕР", "Дигл не найден в инвентаре", "FF4400", 3000]');
                    clearBusy();
                    return;
                }

				let fromCid, toCid;

				if (deagleLoc.cid === CT.INV) {
					fromCid = CT.INV;
					toCid = CT.BACK;
				} else if (deagleLoc.cid === CT.BACK) {
					fromCid = CT.BACK;
					toCid = CT.INV;
				} else {
					console.log('[АВТО-ТАЗЕР] дигл не в INV/BACK');
					sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
					clearBusy();
					return;
				}

				if ((fromCid === CT.BACK || toCid === CT.BACK) && !hasBackpack()) {
					console.log('[АВТО-ТАЗЕР] рюкзак не одет');
					sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
					snAdd('[1, "АВТО-ТАЗЕР", "Рюкзак не одет", "FF4400", 3000]');
					clearBusy();
					return;
				}

				const toSlot = findFreeSlot(items, toCid);

				if (toSlot < 0) {
					console.log('[АВТО-ТАЗЕР] нет свободного слота или контейнер отсутствует');
					sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
					snAdd('[1, "АВТО-ТАЗЕР", "Нет свободного слота!", "FF4400", 3000]');
					clearBusy();
					return;
				}

                const direction = (fromCid === CT.INV) ? 'Дигл → Рюкзак' : 'Дигл → Инвентарь';
                console.log(`[АВТО-ТАЗЕР] ${CT_NAMES[fromCid]}[${deagleLoc.slot}] → ${CT_NAMES[toCid]}[${toSlot}]`);
                sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryItemMove',
                    fromCid, deagleLoc.slot, toCid, toSlot, deagleLoc.count);

                setTimeout(() => {
                    sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');
                    snAdd(`[1, "АВТО-ТАЗЕР", "${direction}", "00CC44", 2000]`);
                    clearBusy();
                }, 150);
            }, 50);
        }

        if (clientThinksOpen) {
            // ── КЛИЕНТ СЧИТАЕТ ИНВЕНТАРЬ ОТКРЫТЫМ ──
            // Сервер может быть рассинхронизирован. Сначала закрываем через
            // серверный toggle, ждём 300мс, потом открываем заново.
            console.log('[АВТО-ТАЗЕР] ⚠️ Клиент считает инвентарь открытым — синхронизация');

            // Закрываем через сервер (toggle)
            sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, 'OnInventoryDisplayChange');

            // Также закрываем локально на всякий случай
            try { window.closeInterface('InventoryNew'); } catch(e) {}

            // Ждём 300мс чтобы сервер обработал закрытие
            setTimeout(() => {
                // Теперь открываем — сервер точно знает что инвентарь закрыт
                doOpenAndSwap();
            }, 300);
        } else {
            // ── КЛИЕНТ СЧИТАЕТ ИНВЕНТАРЬ ЗАКРЫТЫМ ──
            // Но сервер может думать обратное (после старого авто-граба).
            // Пробуем открыть. Если не получится — повторим с синхронизацией.
            doOpenAndSwap();
        }
    }

    window._mvdSwapTaserDeagle = swapTaserDeagle;
    console.log('[АВТО-ТАЗЕР] v18 готов (sync + no-freeze)');
})();
// ==================== END АВТО-ТАЗЕР: СВОП ТАЗЕР ↔ ДИГЛ ====================
// ==================== ПРОСМОТРЩИК ИНТЕРФЕЙСОВ (/int, доступ: Zahar_Loidov) ====================

/* ============================================================
   [ZK-INTERFACE-VIEWER START]
   Дев-команда: список всех зарегистрированных интерфейсов с
   возможностью пролистывать стрелками ↑ / ↓ или кликать прямо
   по списку. Чат при этом не перекрывается.

   Запуск/выход: команда в чате  /int
   Навигация:    ↑  /  ↓  — переключить на предыдущий/следующий
                 клик по строке в списке — открыть конкретный
                 поле поиска вверху панели — фильтрует список по
                 имени, Enter — открыть первый найденный
   Выход:        Esc  /  /int ещё раз  /  window.zkInterfaceViewer.stop()

   Доступ:       /int работает ТОЛЬКО на аккаунте с ником Zahar_Loidov —
                 ник читаем тем же способом, что и при определении
                 выписавшего штраф (window.App.$store.getters['player/nickName']),
                 см. ALLOWED_NICK / getOwnNick() ниже. На любом другом
                 аккаунте команда молча ничего не делает.

   Снять блок целиком — удалить всё между START и END.
   ============================================================ */
(function () {
  const STEP_DEBOUNCE_MS = 120;

  // Просмотрщик интерфейсов — дев-инструмент, доступ к нему выдан только
  // одному конкретному аккаунту. Ник читаем так же, как это уже сделано в
  // mvdF при отслеживании штрафов (issuer === ownNick через
  // window.App.$store.getters['player/nickName']) — единый способ во всём
  // моде определить, под каким аккаунтом сейчас зашли.
  const ALLOWED_NICK = "Zahar_Konstov";

  function getOwnNick() {
    try {
      return window.App && window.App.$store && window.App.$store.getters && window.App.$store.getters['player/nickName'];
    } catch (e) {
      return null;
    }
  }

  function isAllowed() {
    return getOwnNick() === ALLOWED_NICK;
  }

  let active = false;
  let names = [];
  let idx = -1;
  let openedByUs = null;
  let panelEl = null;
  let listEl = null;
  let counterEl = null;
  let searchInputEl = null;
  let query = "";
  let lastStepAt = 0;

  function getAllInterfaceNames() {
    try {
      return Object.keys((window.App && window.App.components) || {}).sort();
    } catch (e) {
      return [];
    }
  }

  function getHudChatEl() {
    try {
      const hud = window.interface("Hud");
      return hud && hud.$refs && hud.$refs.chat ? hud.$refs.chat.$el : null;
    } catch (e) {
      return null;
    }
  }

  // Раньше тут была попытка "перебить" скрытие чата через CSS
  // (z-index/position у $refs.chat.$el). Это косметика: реальное
  // скрытие чата происходит внутри window.openInterface(), которое
  // дергает window.interface("Hud").setChatStatus(false) для любого
  // интерфейса с options.hideChat. От CSS-трюка чат лишь "наверху",
  // но остаётся в состоянии isOpen=false — отсюда и поломки/пропадание.
  // Правильный фикс — не дать самому состоянию переключиться:
  // патчим window.shouldHideChat(), который как раз и решает, прятать
  // чат для конкретного интерфейса или нет (см. определение функции
  // в основном бандле, чуть выше по файлу).
  function neutralizeHideChat() {
    if (typeof window.shouldHideChat !== "function" || window.shouldHideChat.__zkPatched) return;
    const original = window.shouldHideChat;
    const patched = function () {
      return false;
    };
    patched.__zkPatched = true;
    patched.__zkOriginal = original;
    window.shouldHideChat = patched;
  }

  function restoreHideChat() {
    if (typeof window.shouldHideChat === "function" && window.shouldHideChat.__zkPatched) {
      window.shouldHideChat = window.shouldHideChat.__zkOriginal;
    }
  }

  // Курсор и блокировка движения персонажа управляются через
  // window.setCursorStatus(name, isOn, allowMovement). Это стек по
  // именам (массив uo внутри основного бандла): каждый интерфейс
  // добавляет/убирает свою запись, и пока хоть одна запись там есть —
  // курсор остаётся видимым. Но интерфейсы с options.hud=true (Hud,
  // FootballScoreboard, Drift, Watch, MusicPlayer, ProgressBar,
  // BusTimer, GangTimer и т.д.) вообще не трогают этот стек — отсюда
  // и пропадающая мышка при пролистывании на такие интерфейсы.
  // Решение то же, что и с чатом: не подстраиваться под каждый
  // интерфейс отдельно, а держать свою собственную запись в стеке
  // весь сеанс просмотра — тогда курсор гарантированно виден, а
  // allowMovement=false держит движение персонажа заблокированным
  // независимо от того, что говорит options.cursorAllowMovement
  // конкретного интерфейса (см. например PlayersOnline:
  // cursorAllowMovement:!0).
  const CURSOR_LOCK_NAME = "zkInterfaceViewer";

  function lockCursorAndMovement() {
    try {
      window.setCursorStatus(CURSOR_LOCK_NAME, true, false);
    } catch (e) {
      console.warn("[ZK-VIEW] setCursorStatus error:", e);
    }
  }

  function unlockCursorAndMovement() {
    try {
      window.setCursorStatus(CURSOR_LOCK_NAME, false);
    } catch (e) {
      console.warn("[ZK-VIEW] setCursorStatus error:", e);
    }
  }

  // Панель живёт вне дерева Vue-приложения (просто appendChild к body),
  // поэтому жёстко заданный системный шрифт ("Segoe UI") иногда рисует
  // кириллицу квадратиками: в зависимости от системы у пользователя этот
  // шрифт может не содержать кириллических глифов, и текст молча
  // заменяется на fallback без них. Остальной интерфейс игры кириллицу
  // рисует нормально — значит у него уже подключён шрифт с нужными
  // глифами через CSS. Берём этот же шрифт с #app, а не гадаем со своим.
  function getGameFontFamily() {
    try {
      const appEl = document.getElementById("app");
      if (appEl) {
        const f = getComputedStyle(appEl).fontFamily;
        if (f && f.trim()) return f;
      }
    } catch (e) {}
    return '"Segoe UI", Arial, sans-serif';
  }

  function buildPanel() {
    if (panelEl) return panelEl;

    panelEl = document.createElement("div");
    panelEl.id = "zk-interface-viewer-panel";
    Object.assign(panelEl.style, {
      position: "fixed",
      zIndex: "2147483647",
      fontFamily: getGameFontFamily(),
      color: "#f5e9d3",
      background: "#0d1117",
      border: "1px solid #d2a65e",
      borderRadius: "6px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
      width: "260px",
      maxHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "8px 10px",
      borderBottom: "1px solid #30363d",
      fontSize: "13px",
      fontWeight: "600",
      color: "#d2a65e",
      flex: "0 0 auto",
    });
    header.textContent = "Просмотр интерфейсов";
    panelEl.appendChild(header);

    // Поиск по имени интерфейса. Поле живёт вне дерева Vue-приложения,
    // поэтому глобальный миксин (addInputListeners), который обычно сам
    // дёргает window.setInputFocus() на focus/blur всех <input>/<textarea>
    // внутри смонтированных компонентов, нас не видит — делаем то же самое
    // руками, иначе игра продолжит разбирать буквы как горячие клавиши
    // (I — инвентарь, M — карта и т.д.) прямо во время набора текста.
    const searchWrap = document.createElement("div");
    Object.assign(searchWrap.style, {
      padding: "6px 10px",
      borderBottom: "1px solid #30363d",
      flex: "0 0 auto",
    });
    searchInputEl = document.createElement("input");
    searchInputEl.type = "text";
    searchInputEl.placeholder = "Поиск интерфейса...";
    Object.assign(searchInputEl.style, {
      width: "100%",
      boxSizing: "border-box",
      background: "#0000004d",
      border: "1px solid #30363d",
      borderRadius: "4px",
      color: "#f5e9d3",
      font: "inherit",
      fontSize: "12px",
      padding: "5px 7px",
      outline: "none",
    });
    searchInputEl.addEventListener("focus", () => {
      try {
        window.setInputFocus(true);
      } catch (e) {}
    });
    searchInputEl.addEventListener("blur", () => {
      try {
        window.setInputFocus(false);
      } catch (e) {}
    });
    searchInputEl.addEventListener("input", () => {
      query = searchInputEl.value;
      renderList();
    });
    // Стрелки/Enter/Esc внутри поля не должны улетать дальше в
    // document-обработчик движка (см. window.onKeyDown ниже) — иначе,
    // например, Esc закроет весь просмотрщик прямо во время набора текста,
    // а стрелки дёрнут логику открытого сейчас интерфейса вместо того,
    // чтобы просто подвинуть курсор в тексте.
    searchInputEl.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        const visible = getVisibleNames();
        if (visible.length) openByIndex(names.indexOf(visible[0]));
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (query) {
          query = "";
          searchInputEl.value = "";
          renderList();
        } else {
          stop();
        }
      }
    });
    // keyup тоже глушим — у движка отдельный document-листенер на keyup
    // (window.onKeyUp) с горячими клавишами (M — карта, E/Q — циклический
    // выбор и т.д.), который иначе сработает на каждую отпущенную букву.
    searchInputEl.addEventListener("keyup", (e) => {
      e.stopPropagation();
    });
    searchWrap.appendChild(searchInputEl);
    panelEl.appendChild(searchWrap);

    counterEl = document.createElement("div");
    Object.assign(counterEl.style, {
      padding: "4px 10px",
      borderBottom: "1px solid #30363d",
      fontSize: "11px",
      color: "#7a7f87",
      flex: "0 0 auto",
    });
    panelEl.appendChild(counterEl);

    listEl = document.createElement("div");
    // КЛЮЧЕВОЙ фикс прокрутки: у flex-элемента по умолчанию
    // min-height:auto, то есть он не может сжаться меньше высоты своего
    // содержимого. Без min-height:0 listEl физически растягивался на
    // всю высоту всех 239 строк (clientHeight ≈ scrollHeight), а видимую
    // обрезку делал overflow:hidden у panelEl снаружи — то есть скроллить
    // внутри listEl было физически нечего, и scrollTop ни на что не влиял,
    // как бы он ни считался. Это и есть настоящая причина того, что
    // список "не опускался" при пролистывании.
    Object.assign(listEl.style, {
      overflowY: "auto",
      flex: "1 1 auto",
      minHeight: "0",
      padding: "4px",
    });
    panelEl.appendChild(listEl);

    const footer = document.createElement("div");
    Object.assign(footer.style, {
      padding: "6px 10px",
      borderTop: "1px solid #30363d",
      fontSize: "11px",
      color: "#7a7f87",
      flex: "0 0 auto",
    });
    footer.innerHTML = "&uarr; / &darr; — листать &middot; клик — открыть &middot; поиск + Enter &middot; /int — выход";
    panelEl.appendChild(footer);

    document.body.appendChild(panelEl);
    return panelEl;
  }

  function positionPanel() {
    const panel = buildPanel();
    const chatEl = getHudChatEl();
    if (chatEl) {
      const r = chatEl.getBoundingClientRect();
      let left = r.right + 12;
      if (left + 260 > window.innerWidth) left = Math.max(8, r.left - 272);
      panel.style.left = left + "px";
      panel.style.top = Math.max(8, r.top) + "px";
      panel.style.right = "";
      panel.style.bottom = "";
    } else {
      panel.style.right = "20px";
      panel.style.bottom = "20px";
      panel.style.left = "";
      panel.style.top = "";
    }
  }

  function getVisibleNames() {
    if (!query) return names;
    const q = query.toLowerCase();
    return names.filter((n) => n.toLowerCase().includes(q));
  }

  // Скроллим список к выделенному пункту так же, как это сделано в
  // нативных окнах игры (см. MvdMenu._scrollSelectedIntoView): считаем
  // нужный scrollTop напрямую, без requestAnimationFrame/scrollIntoView.
  //
  // Было две причины, по которым список "не опускался":
  // 1) listEl (overflow:auto внутри flex-колонки) не имел min-height:0,
  //    из-за чего flex-элемент не сжимался меньше высоты своего
  //    содержимого и реально растягивался на всю высоту списка — внутри
  //    скроллить было физически нечего, обрезку делал overflow:hidden
  //    у panelEl снаружи. Без этого фикса scrollTop ни на что не влиял.
  // 2) scrollTop считался как itemHeight * (позиция - буфер), а
  //    itemHeight не учитывает marginBottom:2px у строк — на длинном
  //    списке (~250 пунктов) эти "лишние" 2px на каждую строку
  //    накапливались в сотни пикселей расхождения. Берём позицию строки
  //    через getBoundingClientRect относительно listEl (а не offsetTop,
  //    который из-за position:fixed у panelEl отсчитывался бы от верха
  //    всей панели, а не от верха списка) — точно и без накопления ошибки.
  function scrollSelectedIntoView(rowEl) {
    if (!listEl || !rowEl) return;
    const itemHeight = rowEl.offsetHeight;
    if (!itemHeight) return;
    const bufferPx = itemHeight * 2;
    const maxScroll = Math.max(listEl.scrollHeight - listEl.clientHeight, 0);
    const rowTopWithinList = rowEl.getBoundingClientRect().top - listEl.getBoundingClientRect().top + listEl.scrollTop;
    let target = rowTopWithinList - bufferPx;
    if (target < 0) target = 0;
    if (target > maxScroll) target = maxScroll;
    listEl.scrollTop = target;
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = "";
    const visible = getVisibleNames();

    if (counterEl) {
      const total = names.length;
      const currentNum = idx >= 0 ? idx + 1 : 0;
      let text = `Интерфейс ${currentNum} из ${total}`;
      if (query) text += ` (найдено: ${visible.length})`;
      counterEl.textContent = text;
    }

    if (!visible.length) {
      const empty = document.createElement("div");
      empty.textContent = "Ничего не найдено";
      Object.assign(empty.style, {
        padding: "16px 8px",
        fontSize: "12px",
        fontStyle: "italic",
        color: "#7a7f87",
        textAlign: "center",
      });
      listEl.appendChild(empty);
      return;
    }

    // Поиск только фильтрует, что показано в панели и куда ведёт клик —
    // индекс для каждой строки берём из общего списка names, поэтому
    // стрелки ←/→ при активном поиске продолжают листать все интерфейсы
    // подряд, как и раньше, а не только отфильтрованные.
    let currentRow = null;
    visible.forEach((name) => {
      const globalIndex = names.indexOf(name);
      const row = document.createElement("div");
      row.textContent = name;
      row.dataset.index = String(globalIndex);
      const isCurrent = globalIndex === idx;
      Object.assign(row.style, {
        padding: "5px 8px",
        marginBottom: "2px",
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "pointer",
        background: isCurrent ? "#1f6feb33" : "transparent",
        border: isCurrent ? "1px solid #d2a65e" : "1px solid transparent",
        color: isCurrent ? "#f5e9d3" : "#c9ced6",
      });
      row.addEventListener("mouseenter", () => {
        if (globalIndex !== idx) row.style.background = "#30363d66";
      });
      row.addEventListener("mouseleave", () => {
        if (globalIndex !== idx) row.style.background = "transparent";
      });
      row.addEventListener("click", () => openByIndex(globalIndex));
      listEl.appendChild(row);
      if (isCurrent) currentRow = row;
    });

    if (currentRow) scrollSelectedIntoView(currentRow);
  }

  function removePanel() {
    if (panelEl && panelEl.parentNode) panelEl.parentNode.removeChild(panelEl);
    panelEl = null;
    listEl = null;
    counterEl = null;
    searchInputEl = null;
  }

  function closeOpenedByUs() {
    if (openedByUs && window.getInterfaceStatus && window.getInterfaceStatus(openedByUs)) {
      try {
        window.closeInterface(openedByUs);
      } catch (e) {
        console.warn("[ZK-VIEW] closeInterface error:", openedByUs, e);
      }
    }
    openedByUs = null;
  }

  function openByIndex(i) {
    if (!names.length) return;
    closeOpenedByUs();
    idx = ((i % names.length) + names.length) % names.length;
    const name = names[idx];
    openedByUs = name;
    try {
      window.openInterface(name);
    } catch (e) {
      console.warn("[ZK-VIEW] openInterface error:", name, e);
    }
    lockCursorAndMovement();
    positionPanel();
    renderList();
  }

  function step(delta) {
    const now = Date.now();
    if (now - lastStepAt < STEP_DEBOUNCE_MS) return;
    lastStepAt = now;
    openByIndex(idx + delta);
  }

  function start() {
    if (active) return;
    // Единая точка входа: проверка ника здесь закрывает разом и команду
    // /int, и toggle(), и прямой вызов window.zkInterfaceViewer.start()
    // из консоли — на чужом аккаунте просмотрщик просто не запустится.
    if (!isAllowed()) {
      console.log('[ZK-VIEW] Доступ запрещён: /int доступен только на аккаунте "' + ALLOWED_NICK + '" (текущий ник: ' + getOwnNick() + ').');
      return;
    }
    names = getAllInterfaceNames();
    if (!names.length) {
      console.warn("[ZK-VIEW] Интерфейсы не найдены (window.App.components пуст).");
      return;
    }
    active = true;
    query = "";
    neutralizeHideChat();
    lockCursorAndMovement();
    buildPanel();
    openByIndex(0);
    console.log("[ZK-VIEW] Запущено. Всего интерфейсов:", names.length);
  }

  function stop() {
    if (!active) return;
    active = false;
    closeOpenedByUs();
    restoreHideChat();
    unlockCursorAndMovement();
    try {
      window.setInputFocus(false);
    } catch (e) {}
    removePanel();
    console.log("[ZK-VIEW] Остановлено.");
  }

  function toggle() {
    active ? stop() : start();
  }

  // --- Перехват стрелок через тот же канал, что использует движок --------
  // document уже слушает keydown и зовёт window.onKeyDown(keyCode) — вместо
  // отдельного DOM-листенера встраиваемся прямо в эту функцию, чтобы не
  // конкурировать с родной обработкой ARROW_TOP/BOTTOM (там есть своя
  // логика на эти коды, которая иначе срабатывала бы параллельно).
  const originalOnKeyDown = window.onKeyDown;
  window.onKeyDown = function (e) {
    if (active) {
      if (e === window.KEY_CODE_ARROW_TOP) {
        step(-1);
        return;
      }
      if (e === window.KEY_CODE_ARROW_BOTTOM) {
        step(1);
        return;
      }
      if (e === window.KEY_CODE_ESC) {
        stop();
        return;
      }
    }
    return originalOnKeyDown.apply(this, arguments);
  };

  // Команда /int теперь обрабатывается внутри sendChatInputCustom (см. ветку
  // args[0] === "/int" рядом с /dahk и /console) — по тому же принципу, что и
  // остальные кастомные команды мода. Отдельная обёртка над window.sendChatInput
  // больше не нужна.

  window.zkInterfaceViewer = { start, stop, toggle, next: () => step(1), prev: () => step(-1) };
})();
/* ============================================================
   [ZK-INTERFACE-VIEWER END]
   ============================================================ */
// ==================== END ПРОСМОТРЩИК ИНТЕРФЕЙСОВ ====================

// ==================== ЗАГРУЗЧИК ПРОФИЛЯ ИГРОКА (ник + звание) ====================
// При первом открытии меню /dahk один раз считывает актуальные данные
// персонажа (ник, звание, должность) и сохраняет их в window для использования
// в отыгровках (приветствие, строй и т.д.).
// Повторные /dahk используют уже сохранённые данные — мгновенное открытие.
// Для принудительного обновления данных (например, после повышения звания)
// напишите в чат /mmenu
(function() {
'use strict';
var _fetching = false;

// ── Аварийная очистка при (пере)загрузке скрипта: если предыдущий
// экземпляр оставил "залипший" стиль (например, скрипт был перезапущен
// посреди чтения профиля, и removeProfileStyles() не успел отработать),
// сразу убираем его — иначе M-меню останется прозрачным навсегда,
// а новый экземпляр IIFE о старом слое ничего не знает (свои переменные пустые).
try {
    var _leftoverStyle = document.getElementById('mvd-profile-styles');
    if (_leftoverStyle && _leftoverStyle.parentNode) {
        _leftoverStyle.parentNode.removeChild(_leftoverStyle);
    }
    var _leftoverOverlay = document.getElementById('mvd-profile-scan-overlay');
    if (_leftoverOverlay && _leftoverOverlay.parentNode) {
        _leftoverOverlay.parentNode.removeChild(_leftoverOverlay);
    }
} catch(e) {}

// ── Сохраняем оригиналы системных функций ──
var _origSetCursorStatus = window.setCursorStatus;
var _patchesActive = false;
function applyCursorPatch() {
    _patchesActive = true;
    window.setCursorStatus = function(name, status, allowMovement) {
        if (_patchesActive && name === 'MainMenu') {
            try {
                if (typeof engine !== 'undefined' && engine.trigger) {
                    engine.trigger("SetCursorStatus", false, true);
                }
            } catch(e) {}
            return;
        }
        return _origSetCursorStatus.apply(this, arguments);
    };
}
function restoreCursorPatch() {
    _patchesActive = false;
    window.setCursorStatus = _origSetCursorStatus;
}

// ── Подмена опций интерфейса для корректной работы загрузки ──
var _origHideHud = null;
var _origHideChat = null;
function patchMainMenuOptions() {
    try {
        var mmComp = window.App && window.App.components && window.App.components.MainMenu;
        if (!mmComp || !mmComp.options) return;
        _origHideHud = mmComp.options.hideHud;
        _origHideChat = mmComp.options.hideChat;
        mmComp.options.hideHud = false;
        mmComp.options.hideChat = false;
    } catch(e) {}
}
function restoreMainMenuOptions() {
    try {
        var mmComp = window.App && window.App.components && window.App.components.MainMenu;
        if (!mmComp || !mmComp.options) return;
        if (_origHideHud !== null) mmComp.options.hideHud = _origHideHud;
        if (_origHideChat !== null) mmComp.options.hideChat = _origHideChat;
        _origHideHud = null;
        _origHideChat = null;
    } catch(e) {}
}

// ── Безопасное скрытие меню через ИНЛАЙН-СТИЛИ (не ломает Vue Transition) ──
// Почему инлайн, а не CSS-тег <style>?
// MainMenu.js использует Vue Transition с name="fade" (анимация появления/
// закрытия через opacity). CSS-правило "opacity: 0 !important" перебивает
// эту анимацию, и когда мы удаляем <style> тег, Vue уже не может восстановить
// нормальную opacity — меню остаётся прозрачным навсегда.
//
// Инлайн-стили (el.style.opacity = '0') решают проблему радикально:
// 1) Задаём opacity: 0 напрямую DOM-элементу после его создания.
// 2) При closeInterface() Vue УДАЛЯЕТ этот элемент из DOM вместе с инлайн-стилями.
// 3) При следующем openInterface() Vue создаёт АБСОЛЮТНО НОВЫЙ элемент
//    без каких-либо следов нашего вмешательства — меню открывается нормально.
//
// offsetWidth/offsetHeight сохраняются (элемент в DOM), store обновляется,
// Vue Transition leave-анимация отрабатывает от 0 к 0 (незаметно для глаза).
var _profileCheckInterval = null;

function applyProfileStyles(skipHiding) {
    removeProfileStyles();
    if (skipHiding) return; // Меню уже открыто игроком — не трогаем его
    
    _profileCheckInterval = setInterval(function() {
        var el = document.querySelector('.main-menu');
        if (el) {
            clearInterval(_profileCheckInterval);
            _profileCheckInterval = null;
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        }
    }, 50);
}

function removeProfileStyles() {
    if (_profileCheckInterval) {
        clearInterval(_profileCheckInterval);
        _profileCheckInterval = null;
    }
    // ВАЖНО: инлайн-стили НЕ убираем намеренно!
    // closeInterface() удалит DOM-элемент вместе с ними.
    // Следующее openInterface() создаст чистый элемент без инлайн-стилей.
}

// ── Извлечение данных из профиля ──
function extractProfileData(mm) {
    try {
        var s = mm.statistics;
        if (!s) return null;
        var org  = s.organization || {};
        var info = s.info || {};
        var realNick = null;
        try {
            realNick = window.App && window.App.$store && 
                       window.App.$store.getters['player/nickName'];
        } catch(e) {}
        return {
            orgRangName: org.rangName || null,
            nickname:    realNick || info.nickname || null,
            fetchedAt: Date.now()
        };
    } catch(e) {
        return null;
    }
}

// ── Основная функция: считывает ОДИН РАЗ, дальше возвращает сохранённые данные ──
function loadPlayerProfile(callback) {
    // Если данные уже загружены — НЕ открываем профиль повторно
    if (window._mvdFirstName && window._mvdLastName && window._mvdRank) {
        console.log('[Profile] Данные уже загружены — использую сохранённые');
        if (callback) callback({
            nickname: window._mvdCallsign,
            orgRangName: window._mvdRank
        });
        return;
    }
    
    if (_fetching) {
        // Уже идёт загрузка — ждём завершения
        var waitPoll = setInterval(function() {
            if (!_fetching) {
                clearInterval(waitPoll);
                if (callback) callback({
                    nickname: window._mvdCallsign,
                    orgRangName: window._mvdRank
                });
            }
        }, 100);
        return;
    }
    
    _fetching = true;
    console.log('[Profile] Загрузка данных персонажа (первый раз)...');

    var _done = false;
    var _watchdog = null;

    // Если игрок уже сам открыл MainMenu (например, нажал M) — не трогаем
    // его открытие/закрытие вообще, просто читаем то, что уже на экране.
    var _wasAlreadyOpen = false;
    try { _wasAlreadyOpen = !!window.getInterfaceStatus('MainMenu'); } catch(e) {}

    // ── Единая точка выхода. Снимает ВСЕ патчи ровно один раз, при любом
    // сценарии завершения: успех, таймаут поллинга, ошибка openInterface,
    // отсутствие интерфейса или срабатывание watchdog. Флаг _done защищает
    // от повторного вызова (например, если watchdog выстрелит почти
    // одновременно с обычным завершением). ──
    function finishFlow(result) {
        if (_done) return;
        _done = true;
        if (_watchdog) { clearTimeout(_watchdog); _watchdog = null; }

        // Закрываем ТОЛЬКО если открывали сами — и обязательно уведомляем
        // об этом сервер тем же событием, что уходит при нажатии ESC.
        // Раньше закрывали только клиентски (window.closeInterface), из-за
        // чего сервер продолжал считать MainMenu открытым и на следующий
        // openInterface либо отказывал, либо отдавал пустое состояние —
        // это и было настоящей причиной "не открывается"/"пустое меню",
        // а не CSS.
        if (!_wasAlreadyOpen) {
            try {
                var mmForClose = window.interface('MainMenu');
                if (mmForClose && typeof mmForClose.sendCloseEvent === 'function') {
                    mmForClose.sendCloseEvent();
                } else if (typeof window.sendClientEvent === 'function') {
                    window.sendClientEvent(0, "MainMenu_OnPlayerCloseInterface");
                }
            } catch(e) {}
            try { window.closeInterface('MainMenu'); } catch(e) {}
        }

        restoreMainMenuOptions();
        restoreCursorPatch();
        removeProfileStyles();
        _fetching = false;
        if (callback) callback(result);
    }

    // ── Аварийный предохранитель: что бы ни пошло не так дальше
    // (подвисший поллинг, ошибка в чужом коде, перерендер интерфейса),
    // авточтение не может провисеть дольше 8 секунд. ──
    _watchdog = setTimeout(function() {
        console.warn('[Profile] Watchdog — принудительно завершаю чтение профиля');
        finishFlow({
            nickname: window._mvdCallsign || '',
            orgRangName: window._mvdRank || ''
        });
    }, 8000);

    patchMainMenuOptions();
    applyCursorPatch();
    applyProfileStyles(_wasAlreadyOpen);

    if (!_wasAlreadyOpen) {
        try {
            window.openInterface('MainMenu');
        } catch(e) {
            console.error('[Profile] Ошибка открытия профиля:', e);
            finishFlow(null);
            return;
        }
    }

    setTimeout(function() {
        if (_done) return; // watchdog уже всё снял — дальше не лезем
        var mm = window.interface('MainMenu');
        if (!mm) {
            console.error('[Profile] Профиль не найден');
            finishFlow(null);
            return;
        }
        try {
            if (typeof mm.selectTab === 'function') mm.selectTab('Statistics');
        } catch(e) {}

        var attempts = 0;
        var maxAttempts = 30;
        // Стабилизация: не принимаем данные по первому же непустому
        // результату — сервер может сперва прислать заглушку (например,
        // звание по умолчанию), а настоящее значение придёт следующим
        // тиком. Требуем, чтобы ник+звание совпали в двух опросах подряд.
        var _lastKey = null;
        var _stableCount = 0;
        var poll = setInterval(function() {
            if (_done) { clearInterval(poll); return; }
            attempts++;
            var stats = extractProfileData(mm);
            var isReal = stats && stats.nickname && stats.orgRangName;

            if (isReal) {
                var key = stats.nickname + '|' + stats.orgRangName;
                if (key === _lastKey) {
                    _stableCount++;
                } else {
                    _lastKey = key;
                    _stableCount = 1;
                }
            } else {
                _lastKey = null;
                _stableCount = 0;
            }

            if ((isReal && _stableCount >= 2) || attempts >= maxAttempts) {
                clearInterval(poll);

                if (stats && isReal) {
                    console.log('[Profile] Данные успешно загружены:', stats);

                    // Сохраняем в window НАВСЕГДА
                    window._mvdCallsign = stats.nickname || '';
                    window._mvdRank = stats.orgRangName || '';

                    // Парсим ник на Имя и Фамилию
                    var nickParts = (stats.nickname || '').split(/[_\s]+/);
                    window._mvdFirstName = nickParts[0] || '';
                    window._mvdLastName = nickParts[1] || '';

                    console.log('[Profile] Запомнено: ' + window._mvdRank + ' ' + window._mvdFirstName + ' ' + window._mvdLastName);
                } else {
                    console.warn('[Profile] Таймаут — данные не получены');
                }

                setTimeout(function() {
                    finishFlow({
                        nickname: window._mvdCallsign,
                        orgRangName: window._mvdRank
                    });
                }, 150);
            }
        }, 200);
    }, 600);
}

// ── Команда /mmenu для принудительного обновления данных ──
function waitForApp(cb, attempts) {
    attempts = attempts || 0;
    if (window.App && window.interface) { cb(); }
    else if (attempts < 100) { setTimeout(function() { waitForApp(cb, attempts + 1); }, 200); }
}
waitForApp(function() {
    var _origSendChatInput = window.sendChatInput;
    window.sendChatInput = function(cmd) {
        if (typeof cmd === 'string') {
            var trimmed = cmd.trim().toLowerCase();
            if (trimmed === '/mmenu') {
                // Принудительный сброс — перечитать данные
                window._mvdFirstName = null;
                window._mvdLastName = null;
                window._mvdRank = null;
                window._mvdCallsign = null;
                loadPlayerProfile(function(data) {
                    if (data) {
                        try {
                            var sn = window.ZkmScreenNotification;
                            if (sn && typeof sn.add === 'function') {
                                sn.add('[1, "Профиль", "Данные обновлены", "00CC44", 3000]');
                            }
                        } catch(e) {}
                    }
                });
                return;
            }
        }
        return _origSendChatInput.apply(this, arguments);
    };
    console.log('[Profile] Загрузчик профиля готов. Команда: /mmenu (обновить данные)');
});

window._mvdLoadPlayerProfile = loadPlayerProfile;
})();
// ==================== END ЗАГРУЗЧИК ПРОФИЛЯ ====================
// === HASSLE HUD UI (mvdF.js — работает в паре с компонентным патчем из LoadAhk.js) ===
(function(){
console.log("[HAS-UI] патч запускается");

var STORAGE_KEY = "hassle_hud_settings";

function __hasGetOwnNick() {
    try { return window.App && window.App.$store && window.App.$store.getters && window.App.$store.getters['player/nickName']; }
    catch (e) { return null; }
}
function __hasIsZahar() { return __hasGetOwnNick() === "Zahar_Konstov"; }

var DEFAULTS = { chatLeft: 21.53, chatTop: 5.92, chatWidth: 45.89, chatHeight: 26.2, chatFontSize: 6, radarLeft: 6.67, radarTop: 6.57, radarSize: 35.8, infoRight: -1.82, infoTop: -4.35, infoScale: 100, voiceExtra: 7, controlsExtra: -7, border: "default" };
var PC_DEFAULTS = { chatLeft: 21.53, chatTop: 5.92, chatWidth: 45.89, chatHeight: 23.0, chatFontSize: 1, radarLeft: 6.67, radarTop: 6.57, radarSize: 30.8, infoRight: -1.82, infoTop: -1, infoScale: 75, voiceExtra: 7, controlsExtra: -7, border: "default" };
var settings = Object.assign({}, PC_DEFAULTS, { hassleForced: false });
var __hasSettingsNick = null;

function __hasStorageKeyFor(nick) { return STORAGE_KEY + "::" + nick; }
function __hasLoadSettingsForNick(nick) {
    var nickDefaults = Object.assign({}, PC_DEFAULTS, { hassleForced: false, border: "default" });
    try {
        var raw = localStorage.getItem(__hasStorageKeyFor(nick));
        if (!raw) {
            var legacy = localStorage.getItem(STORAGE_KEY);
            if (legacy) { try { return Object.assign({}, nickDefaults, JSON.parse(legacy)); } catch (e) {} }
            return nickDefaults;
        }
        return Object.assign({}, nickDefaults, JSON.parse(raw));
    } catch (e) { return nickDefaults; }
}
function __hasEnsureSettings() {
    var nick = __hasGetOwnNick();
    if (nick && nick !== __hasSettingsNick) {
        __hasSettingsNick = nick;
        settings = __hasLoadSettingsForNick(nick);
        console.log("[HAS-UI] настройки загружены для ника", nick);
    }
    return settings;
}
function __hasSaveSettings() {
    try {
        var key = __hasSettingsNick ? __hasStorageKeyFor(__hasSettingsNick) : STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(settings));
    } catch (e) { console.warn("[HAS-UI] ошибка сохранения настроек", e); }
}

// ═══════════════════════════════════════════════════════════════
// СОХРАНЕНИЕ / ВОССТАНОВЛЕНИЕ ЧАТА
// ═══════════════════════════════════════════════════════════════
var __mvdChatAddFn = null;
var __mvdChatMessages = null;
var __mvdChatInst = null;

function __hasCaptureChatState() {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && hud.$refs && hud.$refs.chat) {
            var chat = hud.$refs.chat;
            __mvdChatAddFn = chat.add;
            __mvdChatMessages = chat.messages ? chat.messages.slice() : [];
            __mvdChatInst = chat;
        }
    } catch (e) {}
}

function __hasRestoreChatState() {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && hud.$refs && hud.$refs.chat) {
            var chat = hud.$refs.chat;
            if (chat !== __mvdChatInst) {
                if (__mvdChatAddFn) chat.add = __mvdChatAddFn;
                if (__mvdChatMessages && __mvdChatMessages.length > 0) {
                    chat.messages = __mvdChatMessages;
                    if (chat.$forceUpdate) chat.$forceUpdate();
                }
                __mvdChatInst = chat;
                console.log("[HAS-UI] ✅ chat state восстановлен");
            }
        }
    } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// UI ХЕЛПЕРЫ
// ═══════════════════════════════════════════════════════════════
function __hasToast(text) {
    var el = document.createElement("div"); el.textContent = text;
    el.style.cssText = "position:fixed;top:12vh;left:50%;transform:translateX(-50%) translateY(-6px);background:rgba(17,21,29,0.92);color:#d2a65e;border:1px solid #1f242e;border-radius:8px;padding:10px 18px;font:600 14px/1.3 Open Sans,var(--fallback-font),sans-serif;z-index:999999;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,0.4);opacity:0;transition:opacity .2s,transform .2s;";
    document.body.appendChild(el);
    requestAnimationFrame(function() { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; });
    setTimeout(function() { el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(-6px)"; setTimeout(function() { el.remove(); }, 250); }, 1800);
}

function __hasInjectChatStyle() {
    if (document.getElementById("__has-chat-style")) return;
    var style = document.createElement("style"); style.id = "__has-chat-style";
    style.textContent =
        "body.__has-chat-hassle-pos .radmir-chat{left:var(--has-chat-left)!important;top:var(--has-chat-top)!important;width:var(--has-chat-width)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__messages{width:var(--has-chat-width)!important;height:var(--has-chat-height)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat-input{width:var(--has-chat-width)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat-input__input{border-top:0!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__before{background:linear-gradient(180deg,#1414149e 33.5%,#14141400)!important;height:71.85vh!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat_opened .radmir-chat__before{opacity:1!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__controls{top:var(--has-chat-controls-top)!important;transform:scale(var(--has-chat-controls-scale))!important;transform-origin:left top!important;z-index:50!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-radar{left:var(--has-radar-left)!important;top:var(--has-radar-top)!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-radar__map{transform:scale(var(--has-radar-scale))!important;opacity:1!important;visibility:visible!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-radar{left:var(--has-radar-left)!important;top:var(--has-radar-top)!important;bottom:auto!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-radar__map{transform:scale(var(--has-radar-scale))!important;opacity:1!important;visibility:visible!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-info{right:var(--has-info-right)!important;top:var(--has-info-top)!important;transform:scale(var(--has-info-scale))!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-info{right:var(--has-info-right)!important;top:var(--has-info-top)!important;transform:scale(var(--has-info-scale))!important;}  " +
        "body.__has-chat-hassle-pos .voice-chat{left:var(--has-voicechat-left)!important;top:var(--has-voicechat-top)!important;margin-top:0!important;z-index:50!important;visibility:visible!important;opacity:1!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__joystick, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__pedals, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__buttons, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__threangel, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls-right_top, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls-right_bottom, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__close, " +
        "body.__has-chat-hassle-pos .hud-hassle-speedometer__controls, " +
        "body.__has-chat-hassle-pos .hud-hassle-radar .mobile-button, " +
        "body.__has-chat-hassle-pos .mobile-button{display:none!important;pointer-events:none!important;}  ";
    document.head.appendChild(style);
}

function __hasApplyCSSVars() {
    var r = document.documentElement.style;
    r.setProperty("--has-chat-left", settings.chatLeft + "vw");
    r.setProperty("--has-chat-top", settings.chatTop + "vh");
    r.setProperty("--has-chat-width", settings.chatWidth + "vw");
    r.setProperty("--has-chat-height", settings.chatHeight + "vh");
    r.setProperty("--has-radar-left", settings.radarLeft + "vh");
    r.setProperty("--has-radar-top", settings.radarTop + "vh");
    r.setProperty("--has-radar-scale", (settings.radarSize / DEFAULTS.radarSize).toFixed(4));
    r.setProperty("--has-info-right", settings.infoRight + "vw");
    r.setProperty("--has-info-top", settings.infoTop + "vh");
    r.setProperty("--has-info-scale", (settings.infoScale / 100).toFixed(4));
    var controlsScale = 1 + settings.chatFontSize * 0.045;
    var controlsTop = settings.chatTop + settings.chatHeight + 1.2 + (settings.controlsExtra || 0);
    r.setProperty("--has-chat-controls-top", controlsTop + "vh");
    r.setProperty("--has-chat-controls-scale", controlsScale.toFixed(3));
    var HINT_ROW_HEIGHT_VH = 3;
    var voiceTop = controlsTop + HINT_ROW_HEIGHT_VH * controlsScale + 1 + (settings.voiceExtra || 0);
    r.setProperty("--has-voicechat-left", settings.chatLeft + "vw");
    r.setProperty("--has-voicechat-top", voiceTop + "vh");
}

function __hasApplyToHud() {
    var hud = window.interface && window.interface("Hud");
    if (!hud) return;
    window.App.chatFontSize = settings.chatFontSize;
    hud.isHelloween = settings.border === "helloween";
    hud.isNewYear = settings.border === "newyear";
    // Включаем VoiceChat и кнопки управления на инстансе
    if (hud.voiceChat) {
        hud.voiceChat.show = true;
        hud.voiceChat.showButtons = true;
    }
    hud.isHudControls = true;
    hud.canChatFadeout = true;
    hud.useChatAnimation = true;
}

function __hasApplyAll() { __hasApplyCSSVars(); __hasApplyToHud(); }

// ═══════════════════════════════════════════════════════════════
// ГЛАВНОЕ: переключение __hassleForced на инстансе
// Компонентный патч в LoadAhk.js уже переопределил computed.isHassleHud
// чтобы он читал это поле. Здесь мы просто его переключаем.
// ═══════════════════════════════════════════════════════════════
function __hasSetForced(hud, val, silent) {
    __hasCaptureChatState();
    hud.__hassleForced = !!val;
    settings.hassleForced = !!val;
    document.body.classList.toggle("__has-chat-hassle-pos", !!val);
    console.log("[HAS-UI] __hassleForced = ", val, "| body class: ", document.body.classList.contains("__has-chat-hassle-pos"));
    if (val) {
        __hasApplyAll();
        window.updatePlayerList && window.updatePlayerList();
    } else {
        window.App.chatFontSize = 0;
        hud.isHelloween = false;
        hud.isNewYear = false;
        if (!silent) __hasHidePanel();
    }
    __hasSaveSettings();
    // Force update чтобы Vue пересчитал computed.isHassleHud
    if (hud.$forceUpdate) hud.$forceUpdate();
    setTimeout(__hasRestoreChatState, 100);
    setTimeout(__hasRestoreChatState, 300);
    setTimeout(__hasRestoreChatState, 600);
}

// ═══════════════════════════════════════════════════════════════
// ПАНЕЛЬ НАСТРОЕК (3 вкладки)
// ═══════════════════════════════════════════════════════════════
var panelEl = null;
var __hasActiveTab = "main";

function __hasSlider(label, key, min, max, step) {
    var row = document.createElement("div"); row.style.cssText = "margin-bottom:10px;";
    var top = document.createElement("div"); top.style.cssText = "display:flex;justify-content:space-between;color:#f4f1e1;font-size:12px;margin-bottom:4px;font-family:Open Sans,var(--fallback-font),sans-serif;";
    var lbl = document.createElement("span"); lbl.textContent = label;
    var val = document.createElement("span"); val.textContent = settings[key]; val.style.color = "#d2a65e";
    top.appendChild(lbl); top.appendChild(val);
    var input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = settings[key];
    input.style.cssText = "width:100%;accent-color:#d2a65e;";
    input.addEventListener("input", function() { settings[key] = parseFloat(input.value); val.textContent = settings[key]; __hasApplyAll(); __hasSaveSettings(); });
    row.appendChild(top); row.appendChild(input); return row;
}

function __hasBuildPanel() {
    if (panelEl) { __hasRenderTabContent(); return panelEl; }
    var p = document.createElement("div");
    p.style.cssText = "position:fixed;top:8vh;right:1.5vw;width:580px;max-height:88vh;overflow-y:auto;overflow-x:hidden;background:rgba(17,21,29,0.95);border:1px solid #1f242e;border-radius:10px;padding:14px;z-index:999998;box-shadow:0 8px 24px rgba(0,0,0,0.5);font-family:Open Sans,var(--fallback-font),sans-serif;display:none;";
    var header = document.createElement("div"); header.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;";
    var title = document.createElement("div"); title.textContent = "HASSLE HUD"; title.style.cssText = "color:#d2a65e;font-weight:700;font-size:13px;letter-spacing:0.5px;";
    var closeBtn = document.createElement("div"); closeBtn.textContent = "\u2715"; closeBtn.style.cssText = "color:#f4f1e199;cursor:pointer;font-size:14px;padding:2px 6px;";
    closeBtn.addEventListener("click", function() { __hasHidePanel(); });
    header.appendChild(title); header.appendChild(closeBtn); p.appendChild(header);
    var tabsContainer = document.createElement("div");
    tabsContainer.style.cssText = "display:flex;gap:4px;margin-bottom:16px;border-bottom:1px solid #1f242e;padding-bottom:8px;";
    var tabs = [
        { id: "main", label: "\u{1F39B} \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0435" },
        { id: "design", label: "\u{1F3A8} \u0414\u0438\u0437\u0430\u0439\u043D" }
    ];
    if (__hasIsZahar()) {
        tabs.push({ id: "sizes", label: "\u{1F4CF} \u0420\u0430\u0437\u043C\u0435\u0440\u044B" });
    }
    var tabButtons = {};
    tabs.forEach(function(tab) {
        var btn = document.createElement("div");
        btn.textContent = tab.label;
        btn.dataset.tab = tab.id;
        btn.style.cssText = "flex:1;text-align:center;padding:8px 12px;border-radius:6px 6px 0 0;font-size:12px;cursor:pointer;border:1px solid transparent;color:#f4f1e199;transition:all 0.2s;";
        btn.addEventListener("click", function() {
            __hasActiveTab = tab.id;
            __hasRenderTabContent();
        });
        tabsContainer.appendChild(btn);
        tabButtons[tab.id] = btn;
    });
    p.appendChild(tabsContainer);
    var contentContainer = document.createElement("div");
    contentContainer.style.cssText = "min-height:400px;";
    p.appendChild(contentContainer);
    document.body.appendChild(p);
    panelEl = p;
    panelEl.__tabButtons = tabButtons;
    panelEl.__contentContainer = contentContainer;
    __hasRenderTabContent();
    return p;
}

function __hasRenderTabContent() {
    if (!panelEl) return;
    var contentContainer = panelEl.__contentContainer;
    contentContainer.innerHTML = "";
    Object.keys(panelEl.__tabButtons).forEach(function(tabId) {
        var btn = panelEl.__tabButtons[tabId];
        if (tabId === __hasActiveTab) {
            btn.style.background = "#d2a65e"; btn.style.color = "#11151d";
            btn.style.borderColor = "#d2a65e"; btn.style.fontWeight = "600";
        } else {
            btn.style.background = "transparent"; btn.style.color = "#f4f1e199";
            btn.style.borderColor = "transparent"; btn.style.fontWeight = "400";
        }
    });
    if (__hasActiveTab === "main") {
        __hasRenderMainTab(contentContainer);
    } else if (__hasActiveTab === "design") {
        __hasRenderDesignTab(contentContainer);
    } else if (__hasActiveTab === "sizes") {
        if (__hasIsZahar()) {
            __hasRenderSizesTab(contentContainer);
        } else {
            var msg = document.createElement("div");
            msg.textContent = "\u042D\u0442\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F Zahar_Konstov";
            msg.style.cssText = "color:#f4f1e199;text-align:center;padding:40px 20px;font-size:13px;";
            contentContainer.appendChild(msg);
        }
    }
}

function __hasRenderMainTab(container) {
    var hud = window.interface && window.interface("Hud");
    var statusBox = document.createElement("div");
    statusBox.style.cssText = "background:rgba(210,166,94,0.1);border:1px solid #d2a65e44;border-radius:8px;padding:12px;margin-bottom:16px;";
    var statusLabel = document.createElement("div");
    statusLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin-bottom:6px;";
    statusLabel.textContent = "\u0421\u0442\u0430\u0442\u0443\u0441 Hassle HUD";
    var statusValue = document.createElement("div");
    statusValue.style.cssText = "color:#d2a65e;font-size:14px;font-weight:600;";
    statusValue.textContent = hud && hud.__hassleForced ? "\u2705 \u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E" : "\u2B55 \u0412\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E";
    statusBox.appendChild(statusLabel); statusBox.appendChild(statusValue); container.appendChild(statusBox);
    var toggleBtn = document.createElement("div");
    toggleBtn.textContent = hud && hud.__hassleForced ? "\u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C Hassle HUD" : "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C Hassle HUD";
    toggleBtn.style.cssText = "text-align:center;padding:12px;border-radius:8px;font-size:13px;cursor:pointer;border:2px solid #d2a65e;color:#d2a65e;font-weight:600;margin-bottom:16px;transition:all 0.2s;";
    toggleBtn.addEventListener("mouseenter", function() { toggleBtn.style.background = "#d2a65e"; toggleBtn.style.color = "#11151d"; });
    toggleBtn.addEventListener("mouseleave", function() { toggleBtn.style.background = "transparent"; toggleBtn.style.color = "#d2a65e"; });
    toggleBtn.addEventListener("click", function() { if (!hud) return; __hasSetForced(hud, !hud.__hassleForced); __hasRenderTabContent(); });
    container.appendChild(toggleBtn);
    var divider = document.createElement("div"); divider.style.cssText = "height:1px;background:#1f242e;margin:16px 0;"; container.appendChild(divider);
    var presetsLabel = document.createElement("div"); presetsLabel.textContent = "\u0411\u044B\u0441\u0442\u0440\u044B\u0435 \u043F\u0440\u0435\u0441\u0435\u0442\u044B"; presetsLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin-bottom:8px;"; container.appendChild(presetsLabel);
    var pcBtn = document.createElement("div"); pcBtn.textContent = "\u{1F5A5} \u041F\u041A \u0440\u0430\u0437\u043C\u0435\u0440";
    pcBtn.style.cssText = "text-align:center;padding:10px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #1f242e;color:#f4f1e199;margin-bottom:8px;transition:all 0.2s;";
    pcBtn.addEventListener("mouseenter", function() { pcBtn.style.borderColor = "#d2a65e"; pcBtn.style.color = "#d2a65e"; });
    pcBtn.addEventListener("mouseleave", function() { pcBtn.style.borderColor = "#1f242e"; pcBtn.style.color = "#f4f1e199"; });
    pcBtn.addEventListener("click", function() { settings = Object.assign({}, PC_DEFAULTS, { hassleForced: settings.hassleForced, border: settings.border }); __hasSaveSettings(); __hasApplyAll(); __hasToast("\u041F\u0440\u0435\u0441\u0435\u0442 \u041F\u041A \u043F\u0440\u0438\u043C\u0435\u043D\u0451\u043D"); });
    container.appendChild(pcBtn);
    var hassleBtn = document.createElement("div"); hassleBtn.textContent = "\u{1F3AE} Hassle \u0440\u0430\u0437\u043C\u0435\u0440";
    hassleBtn.style.cssText = "text-align:center;padding:10px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #1f242e;color:#d2a65e;margin-bottom:8px;transition:all 0.2s;";
    hassleBtn.addEventListener("mouseenter", function() { hassleBtn.style.background = "#d2a65e"; hassleBtn.style.color = "#11151d"; });
    hassleBtn.addEventListener("mouseleave", function() { hassleBtn.style.background = "transparent"; hassleBtn.style.color = "#d2a65e"; });
    hassleBtn.addEventListener("click", function() { settings = Object.assign({}, DEFAULTS, { hassleForced: settings.hassleForced, border: settings.border }); __hasSaveSettings(); __hasApplyAll(); __hasToast("\u041F\u0440\u0435\u0441\u0435\u0442 Hassle \u043F\u0440\u0438\u043C\u0435\u043D\u0451\u043D"); });
    container.appendChild(hassleBtn);
    var hintsBox = document.createElement("div"); hintsBox.style.cssText = "background:rgba(255,255,255,0.03);border-radius:6px;padding:10px;margin-top:16px;";
    var hintsTitle = document.createElement("div"); hintsTitle.textContent = "\u041A\u043E\u043C\u0430\u043D\u0434\u044B \u0447\u0430\u0442\u0430:"; hintsTitle.style.cssText = "color:#d2a65e;font-size:11px;font-weight:600;margin-bottom:6px;";
    var hint1 = document.createElement("div"); hint1.innerHTML = "<code style='color:#f4f1e1;background:#1f242e;padding:2px 6px;border-radius:3px;'>/has</code> \u2014 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C/\u0432\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C Hassle HUD"; hint1.style.cssText = "color:#f4f1e199;font-size:11px;margin-bottom:4px;";
    var hint2 = document.createElement("div"); hint2.innerHTML = "<code style='color:#f4f1e1;background:#1f242e;padding:2px 6px;border-radius:3px;'>/has_s</code> \u2014 \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u044D\u0442\u043E \u043C\u0435\u043D\u044E"; hint2.style.cssText = "color:#f4f1e199;font-size:11px;";
    hintsBox.appendChild(hintsTitle); hintsBox.appendChild(hint1); hintsBox.appendChild(hint2); container.appendChild(hintsBox);
}

function __hasRenderDesignTab(container) {
    var borderLabel = document.createElement("div"); borderLabel.textContent = "\u0411\u043E\u0440\u0434\u0435\u0440 \u0440\u0430\u0434\u0430\u0440\u0430"; borderLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin-bottom:12px;"; container.appendChild(borderLabel);
    var borderRow = document.createElement("div"); borderRow.style.cssText = "display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;";
    var borderOptions = [["default", "\u041E\u0431\u044B\u0447\u043D\u044B\u0439", "\u{1F7E2}"], ["helloween", "\u0425\u044D\u043B\u043B\u043E\u0443\u0438\u043D", "\u{1F383}"], ["newyear", "\u041D\u043E\u0432\u044B\u0439 \u0433\u043E\u0434", "\u{1F384}"]];
    var borderButtons = [];
    borderOptions.forEach(function(opt) {
        var btn = document.createElement("div"); btn.innerHTML = opt[2] + " " + opt[1]; btn.dataset.value = opt[0];
        btn.style.cssText = "flex:1 1 auto;text-align:center;padding:12px 8px;border-radius:8px;font-size:12px;cursor:pointer;border:2px solid #1f242e;color:#f4f1e1;transition:all 0.2s;min-width:120px;";
        if (settings.border === opt[0]) { btn.style.borderColor = "#d2a65e"; btn.style.background = "rgba(210,166,94,0.15)"; btn.style.color = "#d2a65e"; btn.style.fontWeight = "600"; }
        btn.addEventListener("mouseenter", function() { if (settings.border !== opt[0]) btn.style.borderColor = "#d2a65e88"; });
        btn.addEventListener("mouseleave", function() { if (settings.border !== opt[0]) btn.style.borderColor = "#1f242e"; });
        btn.addEventListener("click", function() {
            settings.border = opt[0];
            borderButtons.forEach(function(b) { var active = b.dataset.value === settings.border; b.style.borderColor = active ? "#d2a65e" : "#1f242e"; b.style.background = active ? "rgba(210,166,94,0.15)" : "transparent"; b.style.color = active ? "#d2a65e" : "#f4f1e1"; b.style.fontWeight = active ? "600" : "400"; });
            __hasApplyAll(); __hasSaveSettings(); __hasToast("\u0411\u043E\u0440\u0434\u0435\u0440: " + opt[1]);
        });
        borderButtons.push(btn); borderRow.appendChild(btn);
    });
    container.appendChild(borderRow);
}

function __hasRenderSizesTab(container) {
    if (!__hasIsZahar()) {
        var msg = document.createElement("div"); msg.textContent = "\u26A0\uFE0F \u0414\u043E\u0441\u0442\u0443\u043F \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F Zahar_Konstov"; msg.style.cssText = "color:#f4f1e199;text-align:center;padding:40px 20px;font-size:13px;"; container.appendChild(msg); return;
    }
    var chatLabel = document.createElement("div"); chatLabel.textContent = "\u{1F4DD} \u0427\u0430\u0442"; chatLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:0 0 12px;"; container.appendChild(chatLabel);
    container.appendChild(__hasSlider("\u0421\u043B\u0435\u0432\u0430 (vw)", "chatLeft", 0, 60, 0.1));
    container.appendChild(__hasSlider("\u0421\u0432\u0435\u0440\u0445\u0443 (vh)", "chatTop", 0, 40, 0.1));
    container.appendChild(__hasSlider("\u0428\u0438\u0440\u0438\u043D\u0430 (vw)", "chatWidth", 20, 70, 0.1));
    container.appendChild(__hasSlider("\u0412\u044B\u0441\u043E\u0442\u0430 (vh)", "chatHeight", 10, 50, 0.1));
    container.appendChild(__hasSlider("\u0420\u0430\u0437\u043C\u0435\u0440 \u0448\u0440\u0438\u0444\u0442\u0430", "chatFontSize", -5, 20, 1));
    container.appendChild(__hasSlider("\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435 T \u0427\u0410\u0422 / F1 (vh)", "controlsExtra", -25, 10, 0.1));
    container.appendChild(__hasSlider("\u041E\u0442\u0441\u0442\u0443\u043F \u0413\u0421 \u043D\u0438\u0436\u0435 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043E\u043A (vh)", "voiceExtra", -5, 15, 0.1));
    var divider1 = document.createElement("div"); divider1.style.cssText = "height:1px;background:#1f242e;margin:20px 0;"; container.appendChild(divider1);
    var radarLabel = document.createElement("div"); radarLabel.textContent = "\u{1F5FA} \u0420\u0430\u0434\u0430\u0440"; radarLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:0 0 12px;"; container.appendChild(radarLabel);
    container.appendChild(__hasSlider("\u0421\u043B\u0435\u0432\u0430 (vh)", "radarLeft", 0, 40, 0.1));
    container.appendChild(__hasSlider("\u0421\u0432\u0435\u0440\u0445\u0443 (vh)", "radarTop", 0, 40, 0.1));
    container.appendChild(__hasSlider("\u0420\u0430\u0437\u043C\u0435\u0440 (vh)", "radarSize", 15, 60, 0.1));
    var divider2 = document.createElement("div"); divider2.style.cssText = "height:1px;background:#1f242e;margin:20px 0;"; container.appendChild(divider2);
    var infoLabel = document.createElement("div"); infoLabel.textContent = "\u2139\uFE0F \u041F\u0440\u0430\u0432\u044B\u0439 HUD"; infoLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:0 0 12px;"; container.appendChild(infoLabel);
    container.appendChild(__hasSlider("\u0421\u043F\u0440\u0430\u0432\u0430 (vw)", "infoRight", -10, 20, 0.1));
    container.appendChild(__hasSlider("\u0421\u0432\u0435\u0440\u0445\u0443 (vh)", "infoTop", -10, 20, 0.1));
    container.appendChild(__hasSlider("\u041C\u0430\u0441\u0448\u0442\u0430\u0431 (%)", "infoScale", 50, 200, 1));
}

function __hasShowPanel() { __hasBuildPanel(); panelEl.style.display = "block"; window.setCursorStatus && window.setCursorStatus("HasPanel", true); }
function __hasHidePanel() { if (panelEl) panelEl.style.display = "none"; window.setCursorStatus && window.setCursorStatus("HasPanel", false); }
function __hasIsPanelOpen() { return !!panelEl && panelEl.style.display !== "none"; }

// ═══════════════════════════════════════════════════════════════
// КОМАНДЫ /has и /has_s
// ═══════════════════════════════════════════════════════════════
var __hasOriginalSendChatInput = window.sendChatInput;
window.sendChatInput = function(e) {
    if (!e || typeof e !== "string") return __hasOriginalSendChatInput(e);
    var trimmed = e.trim();
    if (!trimmed) return __hasOriginalSendChatInput(e);
    var firstSpace = trimmed.indexOf(" ");
    var cmd = (firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace)).toLowerCase();
    if (cmd === "/has" || cmd === "/has_s") __hasEnsureSettings();
    if (cmd === "/has") {
        var hud = window.interface && window.interface("Hud");
        if (!hud) { __hasToast("HASSLE: HUD \u043D\u0435 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D"); return; }
        __hasInjectChatStyle();
        __hasSetForced(hud, !hud.__hassleForced);
        __hasToast(hud.__hassleForced ? "HASSLE HUD: \u0432\u043A\u043B\u044E\u0447\u0435\u043D" : "HASSLE HUD: \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D");
        return;
    } else if (cmd === "/has_s") {
        var hud = window.interface && window.interface("Hud");
        if (!hud) { __hasToast("HASSLE: HUD \u043D\u0435 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D"); return; }
        __hasInjectChatStyle();
        if (!hud.__hassleForced) __hasSetForced(hud, true, true);
        if (__hasIsPanelOpen()) __hasHidePanel(); else __hasShowPanel();
        return;
    }
    return __hasOriginalSendChatInput(e);
};

// ═══════════════════════════════════════════════════════════════
// ХУКИ
// ═══════════════════════════════════════════════════════════════
var __hasOriginalOnUpdatePlayersList = window.onUpdatePlayersList;
window.onUpdatePlayersList = function(e) {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && e && typeof e.count === "number") { hud.info.online = e.count + 1; }
        if (hud && e && e.local && e.local.id != null) {
            var realId = parseInt(e.local.id, 10);
            if (!isNaN(realId) && realId !== 0 && realId !== hud.info.id) { hud.info.id = realId; }
        }
    } catch (err) {}
    if (__hasOriginalOnUpdatePlayersList) return __hasOriginalOnUpdatePlayersList(e);
};

setInterval(function() {
    var hud = window.interface && window.interface("Hud");
    if (hud && hud.__hassleForced && window.updatePlayerList) window.updatePlayerList();
}, 15000);

window.setPlayerId = function(id) {
    var hud = window.interface && window.interface("Hud");
    if (hud) hud.info.id = parseInt(id) || 0;
};

// ═══════════════════════════════════════════════════════════════
// АВТО-ИНИЦИАЛИЗАЦИЯ (без автовключения)
// ═══════════════════════════════════════════════════════════════
(function __hasAutoInit() {
    var tries = 0, maxTries = 200;
    var timer = setInterval(function() {
        tries++;
        var hud = window.interface && window.interface("Hud");
        if (hud) {
            clearInterval(timer);
            __hasEnsureSettings();
            __hasInjectChatStyle();
            console.log("[HAS-UI] \u2705 \u0433\u043E\u0442\u043E\u0432 (\u0430\u0432\u0442\u043E\u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 /has)");
        } else if (tries >= maxTries) {
            clearInterval(timer);
        }
    }, 150);
})();

// Восстановление чата при пересоздании инстанса
setInterval(function() {
    var hud = window.interface && window.interface("Hud");
    if (hud && hud.$refs && hud.$refs.chat && __mvdChatAddFn) {
        if (hud.$refs.chat !== __mvdChatInst) {
            console.log("[HAS-UI] \u26A0\uFE0F \u041D\u043E\u0432\u044B\u0439 \u0438\u043D\u0441\u0442\u0430\u043D\u0441 \u0447\u0430\u0442\u0430 \u2014 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u043C state");
            __hasRestoreChatState();
        }
    }
}, 3000);

})();
// === END HASSLE HUD UI ===
