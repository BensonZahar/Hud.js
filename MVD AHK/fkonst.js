// ПРОВЕРКА НИКА — добавляй/убирай ники здесь.
const NICK_CHECK_ENABLED = true; // ← поменяй на false чтобы выключить проверку
const _ALLOWED_NICKS = [
"Zahar_Konstov",
//"Fura_Morales",
//"Casper_Sukhoi"
];
(function _nickCheck(callback) {
if (!NICK_CHECK_ENABLED) { callback(); return; }
function getNick() {
     try {
         var n = window.App && window.App.$store &&
                 window.App.$store.getters &&
                 window.App.$store.getters['player/nickName'];
         if (n && n !== "Name_Surname") return n;
         return null;
     } catch (e) { return null; }
 }
 var nick = getNick();
 if (nick) {
     if (_ALLOWED_NICKS.indexOf(nick) !== -1) callback();
     return;
 }
 var attempts = 0;
 var timer = setInterval(function() {
     attempts++;
     var n = getNick();
     if (n) {
         clearInterval(timer);
         if (_ALLOWED_NICKS.indexOf(n) !== -1) callback();
     } else if (attempts >= 60) {
         clearInterval(timer);
     }
 }, 500);
})(function() {
// Hud.js by Deni_Pels (tg:denipels)
const jskOptions = [
{ name:  "{nick} покинул организацию Мин. внутренних дел по собственному желанию <t >2026-07-18 13:22:47 <n > ", action:  "jsk_view " },
{ name:  "Ronnie_Coleman изменил должность {nick} на Подполковник [№8] в Мин. внутренних дел <t >2026-05-16 11:05:32 <n > ", action:  "jsk_view " },
{ name:  "Maksim_Forestry изменил должность {nick} на Майор [№7] в Мин. внутренних дел <t >2026-05-12 16:30:47 <n > ", action:  "jsk_view " },
{ name:  "Daria_Zubenko изменил должность {nick} на Капитан [№6] в Мин. внутренних дел <t >2026-05-07 14:55:08 <n > ", action:  "jsk_view " },
{ name:  "Ronnie_Coleman изменил должность {nick} на Лейтенант [№5] в Мин. внутренних дел <t >2026-05-03 17:35:21 <n > ", action:  "jsk_view " },
{ name:  "Maksim_Forestry изменил должность {nick} на Прапорщик [№4] в Мин. внутренних дел <t >2026-04-29 15:10:33 <n > ", action:  "jsk_view " },
{ name:  "Daria_Zubenko изменил должность {nick} на Старшина [№3] в Мин. внутренних дел <t >2026-04-25 18:20:44 <n > ", action:  "jsk_view " },
{ name:  "Ronnie_Coleman изменил должность {nick} на Сержант [№2] в Мин. внутренних дел <t >2026-04-22 16:45:12 <n > ", action:  "jsk_view " },
{ name:  "Maksim_Forestry принял {nick} в Мин. внутренних дел на должность Рядовой [№1] <t >2026-04-20 14:31:33 <n > ", action:  "jsk_view " }
];

const FAKE_WB = {
personalNumber: 1042290,
issueDate:      0,
jobs:           []
};
window.showFakeWorkBook = (playerId) => {
const EMPLOYMENT_HISTORY = 15;
const autoNick = window.App?.$store?.getters["player/nickName"] || 'Name_Surname';
const autoSkin = window.App?.$store?.getters["player/skinId"]  || 206;
const data = [
[autoNick, FAKE_WB.personalNumber, autoSkin, FAKE_WB.issueDate],
FAKE_WB.jobs.map(j => [
j.title, autoNick, j.post, j.status,
j.fireStatus, j.inviteDate, j.fireDate,
j.experience, j.reason, autoNick
])
];
try {
window.openInterface('Docs', JSON.stringify([[EMPLOYMENT_HISTORY, JSON.stringify(data)]]));
setTimeout(() => {
const nick = window.App?.$store?.getters["player/nickName"] || autoNick;
const fakeMsg = `{v:${nick}}${playerId ?`[${playerId}]`: ''} просматривает свою трудовую книгу`;
if (typeof window.onChatMessage === 'function') window.onChatMessage(fakeMsg, 'FFDD90FF');
}, 300);
} catch (e) { console.error('[WBoo] Ошибка:', e); }
};

const FAKE_WB2 = {
personalNumber: 1042290,
issueDate:      1773230400,
jobs: [
{
title:      "Мин. внутренних дел",
post:       "Подполковник",
status:     1,
fireStatus: 0,
inviteDate: 1776695493,
fireDate:   1784380967,
experience: "2 мес.",
reason:     "Не указана"
}
]
};
window.showFakeWorkBook2 = (playerId) => {
const EMPLOYMENT_HISTORY = 15;
const autoNick = window.App?.$store?.getters["player/nickName"] || 'Name_Surname';
const autoSkin = window.App?.$store?.getters["player/skinId"]  || 206;
const data = [
[autoNick, FAKE_WB2.personalNumber, autoSkin, FAKE_WB2.issueDate],
FAKE_WB2.jobs.map(j => [
j.title, autoNick, j.post, j.status,
j.fireStatus, j.inviteDate, j.fireDate,
j.experience, j.reason, autoNick
])
];
try {
window.openInterface('Docs', JSON.stringify([[EMPLOYMENT_HISTORY, JSON.stringify(data)]]));
setTimeout(() => {
const nick = window.App?.$store?.getters["player/nickName"] || autoNick;
const fakeMsg = `{v:${nick}}${playerId ?`[${playerId}]`: ''} просматривает свою трудовую книгу`;
if (typeof window.onChatMessage === 'function') window.onChatMessage(fakeMsg, 'FFDD90FF');
}, 300);
} catch (e) { console.error('[WBoo2] Ошибка:', e); }
};

const alisOptions = [];
window.showAlisMenu = (playerId) => {
giveLicenseTo = playerId;
const title = `{FFCD00}Последние 10 наказаний за 2 месяца`;
const header = `Тип наказания<t><t>Дата наказания<t>Ник администратора<t>Причина<n><n>`;
const body = alisOptions.length === 0
? `{FFFFFF}Список наказаний пуст`
: alisOptions.map(item => `{FFFFFF}${item.type}<t><t>${item.date}<t>${item.admin}<t>${item.reason}<n>`).join('');
window.addDialogInQueue(`[670,0,"${title}","","Закрыть","",0,0]`, header + body, 0);
};

let jskEnabled = false;
let _expectCmd   = null;
let _expectId    = -1;
let _expectTimer = null;
function _clearExpect() {
_expectCmd = null;
_expectId  = -1;
if (_expectTimer) { clearTimeout(_expectTimer); _expectTimer = null; }
}
function _setExpect(cmd, id) {
_clearExpect();
_expectCmd  = cmd;
_expectId   = id;
_expectTimer = setTimeout(_clearExpect, 5000);
}
function _notifyToggle() {
if (typeof window.onChatMessage !== 'function') return;
if (jskEnabled) {
window.onChatMessage('{999999}FKONST — {33DD77}Включён', '999999FF');
} else {
window.onChatMessage('{999999}FKONST — {EE4444}Выключен', '999999FF');
}
setTimeout(() => {
    try {
        const hud = window.interface('Hud');
        if (!hud || !hud.$refs || !hud.$refs.chat) return;
        const chat = hud.$refs.chat;
        if (!Array.isArray(chat.messages)) return;
        chat.messages = chat.messages.filter(m => {
            if (!m.content) return true;
            return !m.content.some(c => c.text && c.text.includes('FKONST'));
        });
    } catch (_) { /* тихо */ }
}, 3000);
}
document.addEventListener('keydown', (e) => {
if (e.altKey && (e.code === 'Digit9' || e.key === '9')) {
jskEnabled = !jskEnabled;
_notifyToggle();
console.log(`[JSK] jskEnabled = ${jskEnabled}`);
}
});

let giveLicenseTo = -1;
const init = () => {
 const _origOpenInterface = window.openInterface;
 window.openInterface = function(name, data, ...rest) {
     if (jskEnabled && name === 'Docs' && _expectCmd === 'wbook') {
         try {
             const parsed = JSON.parse(data);
             if (Array.isArray(parsed) && Array.isArray(parsed[0]) && parsed[0][0] === 15) {
                 const id = (_expectCmd === 'wbook') ? _expectId : -1;
                 _clearExpect();
                 console.log('[JSK] Перехват /wbook → showFakeWorkBook2', id);
                 window.showFakeWorkBook2(id);
                 return;
             }
         } catch (_) { /* не валидный JSON — пропускаем */ }
     }
     return _origOpenInterface && _origOpenInterface.call(this, name, data, ...rest);
 };

 const _origAddDialog = window.addDialogInQueue;
 window.addDialogInQueue = function(dialogData, body, type) {
     if (jskEnabled && _expectCmd) {
         const cmd = _expectCmd;
         const id  = _expectId;
         _clearExpect();
         if (cmd === 'team') {
             console.log('[JSK] Перехват /team_history → фейк фракционная история');
             const autoNick = window.App?.$store?.getters["player/nickName"] || 'Name_Surname';
             let list = '';
             jskOptions.forEach(item =>
                 list += item.name.replace(/\{nick\}/g, autoNick) + '<n>');
             _origAddDialog && _origAddDialog.call(window,
                 `[670,2,"Фракционная история","","Далее","Отмена",0,1]`,
                 list,
                 0
             );
             return;
         }
         if (cmd === 'alist') {
             console.log('[JSK] Перехват /alist → фейк список наказаний');
             showAlisMenu(id);
             return;
         }
     }
     return _origAddDialog && _origAddDialog.call(this, dialogData, body, type);
 };

 // ═══════════════════════════════════════════════════════════════
 // ФИКС КОНФЛИКТА С mvdF.js
 // Сохраняем обработчик, который был ДО нас (это mvdF.js).
 // Всё, что мы не обрабатываем сами, передаём ему, а не в engine.
 // Так /dahk и команды mvdF работают в любом порядке загрузки.
 // ═══════════════════════════════════════════════════════════════
 const _fkonstPrevSendChatInput = window.sendChatInput;

 const _fkonstForwardChat = (e) => {
     if (typeof _fkonstPrevSendChatInput === "function") {
         _fkonstPrevSendChatInput(e);
     } else {
         window.App.developmentMode || engine.trigger("SendChatInput", e);
     }
 };

 window.__fkonstSendChatInput = e => {
     const args = e.split(" ");
     if (args[0] === "/team_histor") {
         giveLicenseTo = args[1];
         const autoNick = window.App?.$store?.getters["player/nickName"] || 'Name_Surname';
         let list = '';
         jskOptions.forEach(item => list += item.name.replace(/\{nick\}/g, autoNick) + '<n>');
         window.addDialogInQueue(`[670,2,"Фракционная история","","Далее","Отмена",0,1]`, list, 0);
     } else if (args[0] === "/alis") {
         showAlisMenu(args[1]);
     } else if (args[0] === "/wboo") {
         showFakeWorkBook(args[1]);
     } else if (args[0] === "/wboo2") {
         showFakeWorkBook2(args[1]);
     } else if (jskEnabled && args[0] === "/wbook") {
         _setExpect('wbook', args[1]);
         _fkonstForwardChat(e);
     } else if (jskEnabled && (args[0] === "/team_history" || args[0] === "/teamhistory")) {
         _setExpect('team', args[1]);
         _fkonstForwardChat(e);
     } else if (jskEnabled && args[0] === "/alist") {
         _setExpect('alist', args[1]);
         _fkonstForwardChat(e);
     } else {
         _fkonstForwardChat(e);
     }
 };

 // ═══════════════════════════════════════════════════════════════
 // ФИКС КОНФЛИКТА: уникальное имя + цепочка обработчиков
 // ═══════════════════════════════════════════════════════════════
 const _fkonstPrevSendClientEvent = window.sendClientEvent;

 window.__fkonstSendClientEvent = (event, ...args) => {
     if (args[0] === "OnDialogResponse" && args[1] === 670) {
         if (args[2] === 1) {
             const idx = args[3] - 1;
             if (idx >= 0 && idx < jskOptions.length) {
                 sendMessagesWithDelay([
                     "/me открыл служебный КПК",
                     "/do На экране отображается фракционная история.",
                     "/me изучает информацию на экране"
                 ], [0, 700, 700]);
             }
         }
         return;
     }
     if (typeof _fkonstPrevSendClientEvent === "function") {
         _fkonstPrevSendClientEvent(event, ...args);
     } else {
         window.sendClientEventHandle?.(event, ...args);
     }
 };

 window.sendChatInput   = window.__fkonstSendChatInput;
 window.sendClientEvent = window.__fkonstSendClientEvent;

 console.log("════════════════════════════════════════════════");
 console.log("[JSK]   Alt+9            — включить/выключить перехват");
 console.log("[JSK]   /team_histor     — фракционная история (напрямую)");
 console.log("[JSK]   /wbook  [id]     — трудовая МВД (при вкл. перехватит сервер)");
 console.log("[JSK]   /team_history    — история фракции (при вкл. перехватит сервер)");
 console.log("[JSK]   /alist  [id]     — наказания (при вкл. перехватит сервер)");
 console.log("[ALIS]  /alis   [id]     — фейк наказания (напрямую)");
 console.log("[WBoo]  /wboo   [id]     — пустая трудовая (напрямую)");
 console.log("[WBoo2] /wboo2  [id]     — трудовая МВД (напрямую)");
 console.log("════════════════════════════════════════════════");
};
function sendMessagesWithDelay(messages, delays, index = 0) {
if (index >= messages.length) return;
setTimeout(() => {
sendChatInput(messages[index]);
sendMessagesWithDelay(messages, delays, index + 1);
}, delays[index]);
}
if (window.engine) {
init();
} else {
const check = setInterval(() => {
if (window.engine) { clearInterval(check); init(); }
}, 100);
}

const _origOnChatMsg = window.onChatMessage;
window.onChatMessage = function(text, color) {
if (/трудовую книгу/i.test(String(text))) {
console.log(`[WBOOK COLOR] raw color="${color}" | text="${text}"`);
}
 if (typeof text === 'string' && text.includes('стиль одежды')) {
     try {
         const _before = text;
         if (window._mvdClothingStyleLevel !== null && window._mvdClothingStyleLevel !== undefined) {
             const _lvl = window._mvdClothingStyleLevel;
             text = text.replace(
                 /(\{FFFFFF\})\d+(\{75A3D2\} из \{FFFFFF\}600)/g,
                 '$1' + _lvl + '$2'
             );
             if (text !== _before) {
                 window._mvdClothingStyleLevel = _lvl + 1;
                 console.log('[STYLE] Уровень стиля: ' + _lvl + ' / 600 → следующий: ' + window._mvdClothingStyleLevel);
             }
         }
     } catch (_e) {
         console.warn('[STYLE-FIX] Ошибка замены стиля:', _e);
     }
 }
 if (typeof _origOnChatMsg === 'function') _origOnChatMsg.call(this, text, color);
};

(function() {
function snAdd(payload) {
try {
const sn = window.ZkmScreenNotification;
if (sn && typeof sn.add === 'function') sn.add(payload);
} catch(e) {}
}
const originalSendChatInput = window.sendChatInput;
 if (window._mvdClothingStyleLevel === undefined) window._mvdClothingStyleLevel = null;
 let latestPlayerList = null;
 const originalOnUpdatePlayersList = window.onUpdatePlayersList;
 window.onUpdatePlayersList = function(e) {
     latestPlayerList = e;
     window._mvdPlayerList = e;
     if (originalOnUpdatePlayersList) {
         originalOnUpdatePlayersList.apply(this, arguments);
     }
 };
 function requestPlayerListUpdate() {
     try {
         window.updatePlayerList && window.updatePlayerList();
     } catch (e) {}
 }
 function getLeadingColor(text) {
     const match = text.match(/^\{([0-9A-Fa-f]{6})\}/);
     return match ? match[1] : 'FFFFFF';
 }
 function getRandomDelay() {
     return Math.floor(Math.random() * 2500) + 500;
 }
function getRandomCriminal() {
const criminals = [
'Dima_Bogrovin',
'Kayto_Kirishima',
'Sergey_Petrov',
'Alex_Smirnov',
'Ivan_Ivanov',
'Mihail_Sokolov'
];
return criminals[Math.floor(Math.random() * criminals.length)];
}
 function getRandomOfficer() {
     const officers = [
         'Zahar_Konstov',
         'Maxim_Vortex',
         'Ivan_Rorger',
         'Van_Rorger'
     ];
     return officers[Math.floor(Math.random() * officers.length)];
 }
 function getOwnNick() {
     try {
         return window.App && window.App.$store && window.App.$store.getters && window.App.$store.getters['player/nickName'];
     } catch (e) {
         return null;
     }
 }
 function getOwnId() {
     try {
         return latestPlayerList && latestPlayerList.local ? latestPlayerList.local.id : null;
     } catch (e) {
         return null;
     }
 }
 const FACTION_COLORS = new Set([
     'ccff00',
     '996633',
     'ff6666',
     'ff6600',
     '170000',
     '0000ff',
     '000000',
 ]);
 function playerColorToHex6(color) {
     if (color === null || color === undefined) return null;
     if (typeof color === 'number') {
         const rgb = (color >>> 8) & 0xFFFFFF;
         return rgb.toString(16).padStart(6, '0');
     }
     if (typeof color === 'string') {
         const c = color.replace(/^#/, '').toLowerCase();
         if (c.length === 8) return c.slice(0, 6);
         if (c.length === 6) return c;
     }
     return null;
 }
 function isFactionPlayer(player) {
     if (!player) return false;
     const hex = playerColorToHex6(player.color);
     if (hex === null) return false;
     const isFaction = FACTION_COLORS.has(hex);
     if (isFaction) {
         console.log(`[ARE] 🚫 Пропускаем фракционного игрока: ${player.name} (цвет: #${hex})`);
     }
     return isFaction;
 }
 function getRandomRealPlayer() {
     if (!latestPlayerList || !Array.isArray(latestPlayerList.players) || latestPlayerList.players.length === 0) {
         return null;
     }
     const myId = getOwnId();
     const civils = latestPlayerList.players.filter(p =>
         p.id !== myId &&
         !isFactionPlayer(p) &&
         !(p.name && p.name.startsWith('Mask_'))
     );
     if (civils.length > 0) {
         console.log(`[ARE] ✅ Пул гражданских: ${civils.length} чел. (из ${latestPlayerList.players.length} онлайн)`);
         return civils[Math.floor(Math.random() * civils.length)];
     }
     const others = latestPlayerList.players.filter(p =>
         p.id !== myId &&
         !(p.name && p.name.startsWith('Mask_'))
     );
     const pool = others.length ? others : latestPlayerList.players;
     console.log(`[ARE] ⚠️ Фракционный фильтр не сработал (нет color-данных?), берём случайного из ${pool.length}`);
     return pool[Math.floor(Math.random() * pool.length)];
 }
 window.sendChatInput = function(text) {
     if (text && text.startsWith('/are_s')) {
         const parts = text.split(' ');
         const num = parts.length > 1 ? parseInt(parts[1], 10) : NaN;
         if (isNaN(num) || num < 0 || num > 600) {
             console.log('[TEST] ⚠️ Используй: /are_s <число от 0 до 600>');
             return;
         }
         window._mvdClothingStyleLevel = num;
         snAdd(`[1, "Стиль одежды", "Уровень выставлен: ${num} / 600. Следующий арест покажет ${num}", "00FF00", 2500]`);
         console.log(`[TEST] 👕 Уровень стиля одежды выставлен: ${num} / 600 (следующий арест → ${num})`);
         return;
     }
     if (text && text.startsWith('/are')) {
         requestPlayerListUpdate();
         const parts = text.split(' ');
         let stars = 1;
         if (parts.length > 1) {
             const num = parseInt(parts[1]);
             if (!isNaN(num) && num >= 1 && num <= 6) {
                 stars = num;
             }
         }
         const settings = {
             1: { minutes: 20, bonus: 10000, exp: 5 },
             2: { minutes: 40, bonus: 20000, exp: 10 },
             3: { minutes: 60, bonus: 30000, exp: 15 },
             4: { minutes: 80, bonus: 40000, exp: 20 },
             5: { minutes: 100, bonus: 50000, exp: 25 },
             6: { minutes: 120, bonus: 60000, exp: 30 }
         };
         const config = settings[stars];
         const realCriminal = getRandomRealPlayer();
         const criminal = realCriminal ? realCriminal.name : getRandomCriminal();
         const officer = getOwnNick() || getRandomOfficer();
         const officerId = getOwnId();
         const officerIdDisplay = (officerId !== null && officerId !== undefined) ? officerId : 529;
         if (window._mvdClothingStyleLevel === null || window._mvdClothingStyleLevel === undefined) {
             window._mvdClothingStyleLevel = Math.floor(Math.random() * 20) + 1;
         }
         const newLevel = window._mvdClothingStyleLevel;
         window._mvdClothingStyleLevel = newLevel + 1;
         const previousLevel = newLevel - 1;
         const maxLevel = 600;
         console.log(`[TEST] ⭐ ${stars} звезд | ⏱ ${config.minutes} мин | 💰 ${config.bonus} руб | ✨ +${config.exp} опыта`);
         console.log(`[TEST] 👮 ${officer}[${officerIdDisplay}] задерживает ${criminal}${realCriminal ? ` (реальный игрок, ID ${realCriminal.id})` : ' (фолбэк-имя)'}`);
         const destination = stars >= 4 ? 'тюрьму' : 'полицейский участок';
         const messages = [
             { delay: 500, text: `{DD90FF}{v:${officer}}[${officerIdDisplay}] передаёт преступника ${criminal} в ${destination}` },
             { delay: getRandomDelay(), text: `{75A3D2}Вы успешно {FFFFFF}провели задержание{75A3D2} и прокачали новый () стиль одежды {FFFFFF}${newLevel}{75A3D2} из {FFFFFF}${maxLevel}{75A3D2}.` },
             { delay: getRandomDelay(), text: `{FFFFFF}${criminal} был доставлен в тюрьму для отбывания наказания` },
             { delay: getRandomDelay(), text: `{66CC00}Время заключения: ${config.minutes}:00` },
             { delay: getRandomDelay(), text: `{FFDF87}Вы получили премию к зарплате в размере {FFFFFF}${config.bonus} руб {FFDF87}за {FFFFFF}'Задержание преступника'` }
         ];
         let totalDelay = 0;
         messages.forEach((msg, index) => {
             totalDelay += msg.delay;
             setTimeout(() => {
                 window.onChatMessage(msg.text, [0, 0, getLeadingColor(msg.text)]);
                 const cleanText = msg.text.replace(/\{[0-9A-Fa-f]{6}\}/g, '').replace(/\{v:[^}]+\}/g, '').trim();
                 console.log(`[${index + 1}] ${cleanText}`);
             }, totalDelay);
         });
         setTimeout(() => {
             console.log(`[TEST] ✅ Готово!`);
             console.log(`[TEST] ⭐${stars} | ⏱${config.minutes} мин | 💰${config.bonus} руб | ✨+${config.exp} опыта`);
             console.log(`[TEST] 👕 Прокачка: ${previousLevel} → ${newLevel} / ${maxLevel}`);
         }, totalDelay + 500);
         return;
     }
     if (originalSendChatInput) {
         originalSendChatInput.apply(this, arguments);
     }
 };
 requestPlayerListUpdate();
 console.log('[TEST] ✅ /are загружен в fkonst.js');
 console.log('[TEST] 📋 /are [1-6] - симуляция ареста');
 console.log('[TEST] 📋 /are_s <0-600> - вручную выставить уровень стиля одежды');
})();
});
