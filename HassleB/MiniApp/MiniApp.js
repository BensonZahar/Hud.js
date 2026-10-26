// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MiniApp/MiniApp.js — общий загрузчик мини-аппов (Telegram Mini App) ║
// ║                                                                      ║
// ║  Load.js подтягивает ТОЛЬКО этот файл (один раз и навсегда), а он    ║
// ║  уже сам качает все мини-аппы из списка FILES ниже. Новый мини-апп:  ║
// ║  положили файл в HassleB/MiniApp/ и дописали его имя в FILES —       ║
// ║  Load.js и установщик трогать не нужно, хватит /reload.              ║
// ║                                                                      ║
// ║  • имя без http — файл из HassleB/MiniApp/ (например 'Stats.js');    ║
// ║    полная ссылка https://… тоже подойдёт                             ║
// ║  • строка закомментирована (//) — мини-апп выключен                  ║
// ║  • файлы качаются параллельно, выполняются по порядку списка в       ║
// ║    области видимости Code.js (видят config, processUpdates, tgApi…)  ║
// ║  • нет файла (404) / синтаксическая ошибка — пропускается, остальные ║
// ║    работают; про синтаксическую ошибку приходит сообщение в Telegram ║
// ╚══════════════════════════════════════════════════════════════════════╝
try { (function () {
    // ▼▼▼ СПИСОК МИНИ-АППОВ — добавляйте новые сюда ▼▼▼
    var __maFILES = [
        'Stats.js',         // статистика персонажа: «💰 Инфо об аккаунте» и /statapp
        'ChatApp.js'        // игровой чат: кнопка «💬 Чат» и /chatapp
        // , 'Another.js'
    ];
    // ▲▲▲
    var __maBASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/HassleB/MiniApp/';

    // Имена здесь с префиксом __ma специально: файлы мини-аппов выполняются через eval внутри этого замыкания
    // и не должны видеть здесь переменных, которые перекрывают переменные Code.js (config, text, url…).
    function __maLog(m) { try { console.log('[MINIAPP] ' + m); } catch (e) {} }
    function __maWarn(m) { try { console.warn('[MINIAPP] ' + m); } catch (e) {} }
    function __maStale() { try { return typeof __hassleStale === 'function' && !!__hassleStale(); } catch (e) { return false; } }
    function __maNotify(t) { try { if (typeof loaderNotify === 'function') loaderNotify(t); } catch (e) {} }
    function __maEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function __maUrl(name) {
        var u = /^https?:\/\//i.test(name) ? name : __maBASE + name;
        return u + (u.indexOf('?') === -1 ? '?' : '&') + 't=' + Date.now();   // без кэша: raw.githubusercontent держит файл 5 минут
    }

    // cb(ошибка | null, текст). 404 не повторяем — файла просто нет
    function __maFetch(name, retries, cb) {
        var x = new XMLHttpRequest();
        x.open('GET', __maUrl(name), true);
        x.timeout = 20000;
        var again = function (why, permanent) {
            if (!permanent && retries > 0) setTimeout(function () { __maFetch(name, retries - 1, cb); }, 1500);
            else cb(why, null);
        };
        x.onload = function () {
            if (x.status >= 200 && x.status < 300) cb(null, x.responseText);
            else again('HTTP ' + x.status, x.status === 404);
        };
        x.onerror = function () { again('ошибка сети', false); };
        x.ontimeout = function () { again('таймаут', false); };
        x.send();
    }

    // Выполнение мини-аппа: прямой eval — файл видит переменные Code.js, как будто вставлен в него
    function __maRun(__maName, __maText) {
        try { eval(__maText); __maLog('✅ ' + __maName + ' запущен'); return true; }
        catch (e) { __maWarn('❌ ' + __maName + ' упал при запуске: ' + (e && e.message)); return false; }
    }

    var __maNames = [], __maI;
    for (__maI = 0; __maI < __maFILES.length; __maI++) {
        var __maN = String(__maFILES[__maI] || '').replace(/^\s+|\s+$/g, '');
        if (__maN) __maNames.push(__maN);
    }
    if (!__maNames.length) { __maLog('список пуст — запускать нечего'); return; }

    var __maRes = new Array(__maNames.length), __maLeft = __maNames.length;
    function __maDone() {
        if (__maStale()) { __maLog('скрипты уже перезагружены — старый запуск отменён'); return; }   // /reload успел раньше, чем докачались файлы
        var ok = 0, bad = [];
        for (var i = 0; i < __maNames.length; i++) {
            var r = __maRes[i];
            if (r.err) { __maWarn(r.name + ' не загружен: ' + r.err); bad.push(r.name + ' (' + r.err + ')'); continue; }
            var synErr = null;
            try { new Function(r.text); } catch (e) { if (e instanceof SyntaxError) synErr = e; }
            if (synErr) {
                __maWarn(r.name + ' с синтаксической ошибкой — пропущен: ' + synErr.message);
                __maNotify('⚠️ <b>MiniApp/' + __maEsc(r.name) + '</b> с синтаксической ошибкой — пропущен\n<code>' + __maEsc(synErr.message) + '</code>');
                bad.push(r.name + ' (синтаксис)');
                continue;
            }
            if (__maRun(r.name, r.text)) ok++; else bad.push(r.name + ' (ошибка запуска)');
        }
        __maLog('готово: запущено ' + ok + ' из ' + __maNames.length + (bad.length ? ' · не запущены: ' + bad.join(', ') : ''));
    }
    __maNames.forEach(function (name, idx) {
        __maFetch(name, 2, function (err, text) {
            __maRes[idx] = { name: name, err: err, text: text };
            if (--__maLeft === 0) __maDone();
        });
    });
})(); } catch (e) { try { console.error('[MINIAPP] ошибка загрузчика мини-аппов:', e); } catch (e2) {} }
// END MiniApp.js //
