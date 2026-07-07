import{r as resolveComponent,o as openBlock,c as createElementBlock,b as createVNode,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,e as createTextVNode,t as toDisplayString,f as createCommentVNode,w as withCtx,T as Transition,_ as _export_sfc}from"./index.js";
const _hoisted_1={class: "laws-helper iface-container "};
const _hoisted_2={class: "laws-helper__header "};
const _hoisted_3={class: "laws-helper__title "};
const _hoisted_4={class: "laws-helper__title-version "};
const _hoisted_5={class: "laws-helper__header-right "};
const _hoisted_6={class: "laws-helper__tabs "};
const _hoisted_7={class: "laws-helper__search "};
const _hoisted_8={class: "laws-helper__body "};
const SVG_SEARCH= `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(244,241,225,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(244,241,225,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SVG_STAR= `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 3l3.09 6.26L26 10.27l-5 4.87 1.18 6.88L16 18.77l-6.18 3.25L11 15.14 6 10.27l6.91-1.01L16 3z" fill="rgba(244,241,225,0.08)" stroke="rgba(244,241,225,0.15)" stroke-width="1"/></svg>`;
const SVG_BURGER= `<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/><rect y="4.25" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/><rect y="8.5" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/></svg>`;
const SVG_CHECK= `<svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4l3 3 5-6" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_RECEIPT= `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="2" width="20" height="24" rx="2" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.18)" stroke-width="1.2"/><line x1="8" y1="8" x2="20" y2="8" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="12" x2="20" y2="12" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="16" x2="16" y2="16" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="20" x2="14" y2="20" stroke="rgba(244,241,225,0.15)" stroke-width="1.2"/></svg>`;
const SVG_CHEVRON= `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 1l3 3-3 3" stroke="rgba(244,241,225,0.5)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_DOC= `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 1.5h5.5L11 4v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5z" stroke="rgba(249,183,1,0.6)" stroke-width="1.1" fill="rgba(249,183,1,0.06)"/><path d="M8.5 1.5V4H11" stroke="rgba(249,183,1,0.6)" stroke-width="1.1"/></svg>`;
const SVG_BOOK_EMPTY= `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 6a2 2 0 0 1 2-2h7v24H7a2 2 0 0 1-2-2V6z" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/><path d="M27 6a2 2 0 0 0-2-2h-7v24h7a2 2 0 0 0 2-2V6z" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/><line x1="16" y1="4" x2="16" y2="30" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/></svg>`;

// ══════════════════════════════════════════════════════════════════
//  Автоисправление раскладки клавиатуры для поиска (EN → RU)
//  ИСПРАВЛЕНО: убраны лишние пробелы в ключах/значениях,
//  из-за которых fixLayout раньше никогда не срабатывал.
// ══════════════════════════════════════════════════════════════════
const EN_TO_RU_LAYOUT = {
    "`":"ё","q":"й","w":"ц","e":"у","r":"к","t":"е","y":"н","u":"г","i":"ш","o":"щ","p":"з","[":"х","]":"ъ",
    "a":"ф","s":"ы","d":"в","f":"а","g":"п","h":"р","j":"о","k":"л","l":"д",";":"ж","'":"э",
    "z":"я","x":"ч","c":"с","v":"м","b":"и","n":"т","m":"ь",",":"б",".":"ю","/":"."
};
function fixLayout(str){
    let out="";
    for(const ch of str) out += (EN_TO_RU_LAYOUT[ch]!==undefined ? EN_TO_RU_LAYOUT[ch] : ch);
    return out;
}

function render(_ctx,_cache,$props,$setup,$data,$options){
const currentTabKey=$options.visibleTabs[$data.currentTab]?.key;
return (openBlock(), createElementBlock("div", _hoisted_1, [
_cache[0] || (_cache[0] = createBaseVNode("div", {class: "laws-helper__graffiti"}, [
createBaseVNode("div", {class: "laws-helper__pattern"})
		], -1)),
createBaseVNode("div", _hoisted_2, [
createBaseVNode("div", _hoisted_3, [
_cache[1] || (_cache[1] = createBaseVNode("span", {class: "laws-helper__title-main"}, "KONST", -1)),
_cache[2] || (_cache[2] = createBaseVNode("span", {class: "laws-helper__title-sub"}, "AHK MVD", -1)),
createBaseVNode("span", _hoisted_4, toDisplayString($data.version), 1)
]),
createBaseVNode("div", _hoisted_6, [
(openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleTabs, (tab, i) => (
openBlock(), createElementBlock("div", {
class: normalizeClass(["laws-helper__tab", { "laws-helper__tab_active": i===$data.currentTab}]),
key: tab.key,
onClick: $event => $options.selectTab(i)
}, toDisplayString(tab.title), 11, ["onClick"])
)), 128))
]),
createBaseVNode("div", _hoisted_5, [
createBaseVNode("div", {class: "laws-helper__icon-btn", innerHTML: SVG_BURGER}),
createBaseVNode("div", {
class: "laws-helper__icon-btn laws-helper__close-btn",
onClick: $options.close
}, "X", 8, ["onClick"])
])
]),
createBaseVNode("div", _hoisted_7, [
createBaseVNode("span", {class: "laws-helper__search-icon", innerHTML: SVG_SEARCH}),
createBaseVNode("input", {
type: "text",
placeholder: currentTabKey === "fines" ? "Поиск статьи КоАП..." : currentTabKey === "laws" ? "Поиск по статьям и документам..." : "Поиск нарушения...",
value: $data.search,
onInput: $event => { $data.search = $event.target.value }
}, null, 40, ["value","onInput","placeholder"])
]),
createBaseVNode("div", _hoisted_8, [
// ─── ТАБ: ЗАКОНЫ ──────────────────────────────────────────────
currentTabKey === "laws"
? (openBlock(), createElementBlock("div", {key: "laws", class: "laws-helper__laws-layout"}, [
createBaseVNode("div", {class: "laws-helper__laws-list laws-helper__laws-flat"}, [
createBaseVNode("div", {class: "laws-helper__fine-filter laws-helper__law-filter"}, [
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn", { "laws-helper__fine-filter-btn_active": $data.lawDocType === "all"}]),
onClick: $event => { $data.lawDocType = "all"; }
}, "Все", 10, ["onClick"]),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_koap", { "laws-helper__fine-filter-btn_active": $data.lawDocType === "koap"}]),
onClick: $event => { $data.lawDocType = "koap"; }
}, "КоАП", 10, ["onClick"]),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_uk", { "laws-helper__fine-filter-btn_active": $data.lawDocType === "uk"}]),
onClick: $event => { $data.lawDocType = "uk"; }
}, "УК", 10, ["onClick"]),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_proc", { "laws-helper__fine-filter-btn_active": $data.lawDocType === "proc"}]),
onClick: $event => { $data.lawDocType = "proc"; }
}, "Проц.", 10, ["onClick"]),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_kto", { "laws-helper__fine-filter-btn_active": $data.lawDocType === "kto"}]),
onClick: $event => { $data.lawDocType = "kto"; }
}, "КТО", 10, ["onClick"]),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_euss", { "laws-helper__fine-filter-btn_active": $data.lawDocType === "euss"}]),
onClick: $event => { $data.lawDocType = "euss"; }
}, "ЕУСС", 10, ["onClick"])
]),
(openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredLawDocuments, (doc) => (
openBlock(), createElementBlock("div", {key:doc.id, class: "laws-helper__laws-section"}, [
createBaseVNode("div", {class: "laws-helper__laws-section-hdr"}, [
createBaseVNode("span", {class: "laws-helper__laws-section-icon", innerHTML: SVG_DOC}),
// 🟡 ПОДСВЕТКА: название документа (КоАП, ЕУСС, ...)
createBaseVNode("span", {class: "laws-helper__laws-section-title", innerHTML: $options.highlight(doc.title)})
								]),
(openBlock(true), createElementBlock(Fragment, null, renderList(doc.articles, (art) => (
openBlock(), createElementBlock("div", {
key: art.id,
class: normalizeClass(["laws-helper__article-row", { "laws-helper__article-row_checked": $data.selectedLawArticleId === art.id}]),
onClick: $event => $options.selectLawArticle(art.id)
}, [
// 🟡 ПОДСВЕТКА: номер статьи
createBaseVNode("div", {class: "laws-helper__article-num", innerHTML: $options.highlight(art.num)}),
createBaseVNode("div", {class: "laws-helper__article-info"}, [
// 🟡 ПОДСВЕТКА: название статьи
createBaseVNode("div", {class: "laws-helper__article-title", innerHTML: $options.highlight(art.title)})
										])
], 10, ["onClick"])
)), 128))
])
)), 128))
]),
createBaseVNode("div", {class: "laws-helper__reader"}, [
$options.selectedLawArticle
? (openBlock(), createElementBlock("div", {key:$options.selectedLawArticle.id, class: "laws-helper__reader-content"}, [
// 🟡 ПОДСВЕТКА: название документа в reader
createBaseVNode("div", {class: "laws-helper__reader-doc-label", innerHTML: $options.highlight($options.selectedLawArticle.docTitle)}),
createBaseVNode("div", {class: "laws-helper__reader-title"}, [
// 🟡 ПОДСВЕТКА: "Ст. X" + название
createBaseVNode("span", {class: "laws-helper__reader-num", innerHTML: "Ст. " + $options.highlight($options.selectedLawArticle.num)}),
createTextVNode(" "),
createBaseVNode("span", {innerHTML: $options.highlight($options.selectedLawArticle.title)})
								]),
createBaseVNode("div", {class: "laws-helper__reader-divider"}),
$options.selectedLawArticle.text
// 🟡 ПОДСВЕТКА: полный текст статьи (isHtml=true — чтобы не ломать <b>, <span> теги)
? (openBlock(), createElementBlock("div", {key:$options.selectedLawArticle.id+"-text", class: "laws-helper__reader-text", innerHTML: $options.highlight($options.selectedLawArticle.text, true)}))
: (openBlock(), createElementBlock("div", {key: "empty", class: "laws-helper__reader-empty-text"}, "Текст статьи пока не добавлен."))
]))
: (openBlock(), createElementBlock("div", {key: "empty", class: "laws-helper__reader-empty"}, [
createBaseVNode("div", {class: "laws-helper__reader-empty-icon", innerHTML: SVG_BOOK_EMPTY}),
createBaseVNode("div", {class: "laws-helper__reader-empty-text-block"}, [
createBaseVNode("span", null, "Выберите статью слева, "),
createBaseVNode("span", null, "чтобы прочитать её текст.")
								])
]))
])
]))
// ─── ТАБ: РОЗЫСК ──────────────────────────────────────────────
: currentTabKey === "wanted"
? (openBlock(), createElementBlock("div", {key: "wanted", class: "laws-helper__wanted-layout"}, [
createBaseVNode("div", {class: "laws-helper__laws-list"}, [
(openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredArticles, (art) => (
openBlock(), createElementBlock("div", {
key: art.id,
class: normalizeClass(["laws-helper__article-row", { "laws-helper__article-row_checked": $data.selectedArticles.includes(art.id)}]),
onClick: $event => $options.toggleArticle(art.id)
}, [
createBaseVNode("div", {class: "laws-helper__article-check"}, [
createBaseVNode("div", {
class: normalizeClass(["laws-helper__checkbox", { "laws-helper__checkbox_checked": $data.selectedArticles.includes(art.id)}])
}, [
$data.selectedArticles.includes(art.id)
? (openBlock(), createElementBlock("span", {key: "chk", class: "laws-helper__checkbox-svg", innerHTML: SVG_CHECK}))
: createCommentVNode("", true)
									], 2)
]),
// 🟡 ПОДСВЕТКА: номер
createBaseVNode("div", {class: "laws-helper__article-num", innerHTML: $options.highlight(art.num)}),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__article-type", "laws-helper__article-type_" + art.type.toLowerCase()])
}, toDisplayString(art.type), 2),
createBaseVNode("div", {class: "laws-helper__article-info"}, [
// 🟡 ПОДСВЕТКА: название
createBaseVNode("div", {class: "laws-helper__article-title", innerHTML: $options.highlight(art.title)}),
// 🟡 ПОДСВЕТКА: примечание
art.note ? (openBlock(), createElementBlock("div", {key: "note", class: "laws-helper__article-note", innerHTML: "Примечание: " + $options.highlight(art.note)})) : createCommentVNode("", true)
								]),
createBaseVNode("div", {class: "laws-helper__article-term"}, toDisplayString(art.term), 1)
], 10, ["onClick"])
)), 128))
]),
createBaseVNode("div", {class: "laws-helper__wanted-panel"}, [
createBaseVNode("div", {class: "laws-helper__wanted-title"}, "ВЫДАЧА РОЗЫСКА"),
createBaseVNode("div", {class: "laws-helper__wanted-title-line"}),
$data.selectedArticles.length === 0
? (openBlock(), createElementBlock("div", {key: "empty", class: "laws-helper__wanted-empty"}, [
createBaseVNode("div", {class: "laws-helper__wanted-star-icon", innerHTML: SVG_STAR}),
createBaseVNode("div", {class: "laws-helper__wanted-empty-text"}, [
createBaseVNode("span", null, "Список нарушений пуст."),
createBaseVNode("span", null, "Кликните по статье слева,"),
createBaseVNode("span", null, "чтобы добавить в розыск.")
								])
]))
: (openBlock(), createElementBlock("div", {key: "list", class: "laws-helper__wanted-selected-list"}, [
(openBlock(true), createElementBlock(Fragment, null, renderList($options.selectedArticleObjects, (art) => (
openBlock(), createElementBlock("div", {key:art.id, class: "laws-helper__wanted-sel-item"}, [
createBaseVNode("span", {class: "laws-helper__wanted-sel-num"}, toDisplayString(art.num), 1),
createBaseVNode("span", {class: "laws-helper__wanted-sel-title"}, toDisplayString(art.title), 1),
createBaseVNode("span", {class: "laws-helper__wanted-sel-term"}, toDisplayString(art.term), 1)
									])
)), 128))
])),
createBaseVNode("div", {class: "laws-helper__wanted-stars-row"}, [
createBaseVNode("span", {class: "laws-helper__wanted-stars-label"}, "ЗВЕЗДЫ РОЗЫСКА:"),
createBaseVNode("span", {
class: normalizeClass(["laws-helper__wanted-stars-value", { "laws-helper__wanted-stars-value_capped": $options.isTermOverCap}])
}, toDisplayString($options.cappedTerm) + " лет", 3)
]),
createBaseVNode("div", {class: "laws-helper__wanted-id-label"}, "ID НАРУШИТЕЛЯ"),
createBaseVNode("input", {
class: "laws-helper__wanted-id-input",
type: "text",
placeholder: "Введите ID нарушителя",
value: $data.wantedId,
onInput: $event => { $data.wantedId = $event.target.value }
}, null, 40, ["value","onInput"]),
createBaseVNode("div", {class: "laws-helper__wanted-btns"}, [
createBaseVNode("button", {
class: "laws-helper__wanted-btn laws-helper__wanted-btn_clear",
onClick: $options.clearWanted
}, "ОЧИСТИТЬ", 8, ["onClick"]),
createBaseVNode("button", {
class: "laws-helper__wanted-btn laws-helper__wanted-btn_issue",
onClick: $options.issueWanted
}, "ОБЪЯВИТЬ В РОЗЫСК", 8, ["onClick"])
])
])
]))
// ─── ТАБ: ШТРАФЫ ──────────────────────────────────────────────
: currentTabKey === "fines"
? (openBlock(), createElementBlock("div", {key: "fines", class: "laws-helper__wanted-layout"}, [
createBaseVNode("div", {class: "laws-helper__laws-list"}, [
createBaseVNode("div", {class: "laws-helper__fine-filter"}, [
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn", { "laws-helper__fine-filter-btn_active": $data.fineKoapType === "all"}]),
onClick: $event => { $data.fineKoapType = "all"; }
}, "Все", 10, ["onClick"]),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__fine-filter-btn_dps", { "laws-helper__fine-filter-btn_active": $data.fineKoapType === "ДПС"}]),
onClick: $event => { $data.fineKoapType = "ДПС"; }
}, "ДПС", 10, ["onClick"]),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__fine-filter-btn_pps", { "laws-helper__fine-filter-btn_active": $data.fineKoapType === "ППС"}]),
onClick: $event => { $data.fineKoapType = "ППС"; }
}, "ППС", 10, ["onClick"])
]),
(openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredKoapArticles, (art) => (
openBlock(), createElementBlock("div", {
key: art.id,
class: normalizeClass(["laws-helper__article-row", { "laws-helper__article-row_checked": $data.selectedFineArticles.includes(art.id)}]),
onClick: $event => $options.toggleFineArticle(art.id)
}, [
createBaseVNode("div", {class: "laws-helper__article-check"}, [
createBaseVNode("div", {
class: normalizeClass(["laws-helper__checkbox", { "laws-helper__checkbox_checked": $data.selectedFineArticles.includes(art.id)}])
}, [
$data.selectedFineArticles.includes(art.id)
? (openBlock(), createElementBlock("span", {key: "chk", class: "laws-helper__checkbox-svg", innerHTML: SVG_CHECK}))
: createCommentVNode("", true)
], 2)
]),
// 🟡 ПОДСВЕТКА: номер
createBaseVNode("div", {class: "laws-helper__article-num", innerHTML: $options.highlight(art.num)}),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__article-type", "laws-helper__article-type_" + art.type.toLowerCase()])
}, toDisplayString(art.type), 2),
createBaseVNode("div", {class: "laws-helper__article-info"}, [
// 🟡 ПОДСВЕТКА: название + примечание
createBaseVNode("div", {class: "laws-helper__article-title", innerHTML: $options.highlight(art.title)}),
art.note ? (openBlock(), createElementBlock("div", {key: "note", class: "laws-helper__article-note", innerHTML: $options.highlight(art.note)})) : createCommentVNode("", true)
]),
art.revoke ? (openBlock(), createElementBlock("div", {key: "revoke-badge", class: "laws-helper__article-revoke-badge"}, "ВУ")) : createCommentVNode("", true),
createBaseVNode("div", {class: "laws-helper__article-term"}, toDisplayString(art.fine.toLocaleString("ru-RU")) + " ₽", 1)
], 10, ["onClick"])
)), 128))
]),
createBaseVNode("div", {class: "laws-helper__wanted-panel"}, [
createBaseVNode("div", {class: "laws-helper__wanted-title"}, "ВЫДАЧА ШТРАФА"),
createBaseVNode("div", {class: "laws-helper__wanted-title-line laws-helper__fine-title-line"}),
$data.selectedFineArticles.length === 0
? (openBlock(), createElementBlock("div", {key: "empty", class: "laws-helper__wanted-empty"}, [
createBaseVNode("div", {class: "laws-helper__wanted-star-icon", innerHTML: SVG_RECEIPT}),
createBaseVNode("div", {class: "laws-helper__wanted-empty-text"}, [
createBaseVNode("span", null, "Список нарушений пуст."),
createBaseVNode("span", null, "Кликните по статье слева,"),
createBaseVNode("span", null, "чтобы добавить в штраф.")
								])
]))
: (openBlock(), createElementBlock("div", {key: "list", class: "laws-helper__wanted-selected-list"}, [
(openBlock(true), createElementBlock(Fragment, null, renderList($options.selectedFineArticleObjects, (art) => (
openBlock(), createElementBlock("div", {key:art.id, class: "laws-helper__wanted-sel-item"}, [
createBaseVNode("span", {class: "laws-helper__wanted-sel-num"}, toDisplayString(art.num), 1),
createBaseVNode("span", {class: "laws-helper__wanted-sel-title"}, toDisplayString(art.title), 1),
createBaseVNode("span", {class: "laws-helper__fine-sel-amount"}, toDisplayString(art.fine.toLocaleString("ru-RU")) + " ₽", 1)
									])
)), 128))
])),
createBaseVNode("div", {class: "laws-helper__wanted-stars-row"}, [
createBaseVNode("span", {class: "laws-helper__wanted-stars-label"}, "СУММА ШТРАФА:"),
createBaseVNode("span", {class: "laws-helper__fine-total"}, toDisplayString($options.totalFine.toLocaleString("ru-RU")) + " ₽", 1)
						]),
createBaseVNode("div", {
class: normalizeClass(["laws-helper__fine-revoke", {
 "laws-helper__fine-revoke_active": $options.fineCanRevoke && $data.fineWithRevoke,
 "laws-helper__fine-revoke_disabled": !$options.fineCanRevoke
}]),
onClick: $options.toggleFineRevoke
}, [
createBaseVNode("div", {
class: normalizeClass(["laws-helper__checkbox", "laws-helper__fine-revoke-checkbox", { "laws-helper__checkbox_checked": $options.fineCanRevoke && $data.fineWithRevoke}])
}, [
($options.fineCanRevoke && $data.fineWithRevoke)
? (openBlock(), createElementBlock("span", {key: "chk", class: "laws-helper__checkbox-svg", innerHTML: SVG_CHECK}))
: createCommentVNode("", true)
							], 2),
createBaseVNode("span", {class: "laws-helper__fine-revoke-label"}, "С ИЗЪЯТИЕМ ВОД. УДОСТ.")
], 10, ["onClick"]),
createBaseVNode("div", {class: "laws-helper__wanted-id-label"}, "ID НАРУШИТЕЛЯ"),
createBaseVNode("input", {
class: "laws-helper__wanted-id-input",
type: "text",
placeholder: "Введите ID нарушителя",
value: $data.fineId,
onInput: $event => { $data.fineId = $event.target.value }
}, null, 40, ["value","onInput"]),
createBaseVNode("div", {class: "laws-helper__wanted-btns"}, [
createBaseVNode("button", {
class: "laws-helper__wanted-btn laws-helper__wanted-btn_clear",
onClick: $options.clearFine
}, "ОЧИСТИТЬ", 8, ["onClick"]),
createBaseVNode("button", {
class: "laws-helper__wanted-btn laws-helper__fine-btn_issue",
onClick: $options.issueFine
}, "ВЫДАТЬ ШТРАФ", 8, ["onClick"])
])
])
]))
// ─── ОСТАЛЬНЫЕ ТАБЫ ──────────────────────────────────
: (openBlock(), createElementBlock("div", {key: "other", class: "laws-helper__content"}, [
createBaseVNode("div", {innerHTML: $options.currentContent})
			]))
])
]));
}

// ... (KOAP_ARTICLES, UK_ARTICLES, LAW_DOCUMENTS без изменений — они уже есть в knowledge base)

// ══════════════════════════════════════════════════════════════════
//  КоАП статьи — ШТРАФЫ (ДПС + ППС)
// ══════════════════════════════════════════════════════════════════
const KOAP_ARTICLES=[
{id:"dps-1.1", num:"1.1", type:"ДПС", title:"Управление т/с без регистрационного знака", note:"Искл: разрешено без номеров если пробег не превысил 100 км", fine:5000},
{id:"dps-2.1", num:"2.1", type:"ДПС", title:"Управление т/с с неисправным двигателем (дымление)", note:"", fine:10000},
{id:"dps-3.1", num:"3.1", type:"ДПС", title:"Управление т/с в алкогольном/наркотическом опьянении", note:"+ изъятие водительского удостоверения", fine:20000, revoke:true},
{id:"dps-3.2", num:"3.2", type:"ДПС", title:"Разговор по телефону во время движения", note:"", fine:5500},
{id:"dps-3.3", num:"3.3", type:"ДПС", title:"Нарушение правил пользования звуковыми сигналами", note:"использование не по назначению, троллинг", fine:6500},
{id:"dps-3.4", num:"3.4", type:"ДПС", title:"Движение с выключенными габаритными огнями (21:00–06:00)", note:"", fine:5000},
{id:"dps-3.5", num:"3.5", type:"ДПС", title:"Нарушение ПДД пешеходом", note:"Искл: сотрудник ПО при исполнении", fine:5000},
{id:"dps-3.6", num:"3.6", type:"ДПС", title:"Управление т/с с тонировкой стекол ниже 50%", note:"Искл: ФСБ при исполнении", fine:15000},
{id:"dps-3.7", num:"3.7", type:"ДПС", title:"Движение без пристегнутого ремня или надетого шлема", note:"", fine:5000},
{id:"dps-3.8", num:"3.8", type:"ДПС", title:"Намеренное создание дорожных заторов, помех", note:"", fine:10000},
{id:"dps-4.1", num:"4.1", type:"ДПС", title:"Пересечение ж/д пути вне переезда или при закрытом шлагбауме", note:"+ лишение водительского удостоверения", fine:25000, revoke:true},
{id:"dps-5.1", num:"5.1", type:"ДПС", title:"Разворот или движение задним ходом по автомагистрали", note:"", fine:15000},
{id:"dps-6.1", num:"6.1", type:"ДПС", title:"Проезд на красный сигнал светофора", note:"", fine:10000},
{id:"dps-6.1.1", num:"6.1.1", type:"ДПС", title:"Проезд на жёлтый сигнал светофора", note:"", fine:5000},
{id:"dps-6.1.2", num:"6.1.2", type:"ДПС", title:"Проезд на запрещающий сигнал + ДТП", note:"+ лишение ВУ", fine:20000, revoke:true},
{id:"dps-7.1", num:"7.1", type:"ДПС", title:"Разворот/движение задним ходом в запрещённых местах", note:"пешеходный переход, мост, ж/д переезд", fine:15000},
{id:"dps-7.2", num:"7.2", type:"ДПС", title:"Агрессивное вождение (таран, подрезы, выезды на встречную)", note:"+ изъятие лицензии на вождение", fine:20000, revoke:true},
{id:"dps-7.3", num:"7.3", type:"ДПС", title:"Невыполнение требования уступить дорогу с преимуществом", note:"", fine:10000},
{id:"dps-8.1", num:"8.1", type:"ДПС", title:"Остановка/стоянка/парковка в неположенном месте", note:"+ эвакуация; с аварийкой можно стоять до 5 мин", fine:8000},
{id:"dps-8.2", num:"8.2", type:"ДПС", title:"Движение т/с по велосипедным/пешеходным дорожкам, газонам", note:"", fine:6500},
{id:"dps-8.3", num:"8.3", type:"ДПС", title:"Движение т/с по встречной полосе", note:"+ изъятие лицензии на вождение", fine:10000, revoke:true},
{id:"dps-8.3.1", num:"8.3.1", type:"ДПС", title:"Движение по встречной полосе + ДТП", note:"+ изъятие лицензии", fine:20000, revoke:true},
{id:"dps-9.1", num:"9.1", type:"ДПС", title:"Разворот/поворот через сплошную линию разметки", note:"", fine:12000},
{id:"dps-9.2", num:"9.2", type:"ДПС", title:"Разворот/поворот через двойную сплошную", note:"", fine:15000},
{id:"dps-9.3", num:"9.3", type:"ДПС", title:"Пересечение двойной сплошной линии", note:"", fine:13000},
{id:"dps-9.4", num:"9.4", type:"ДПС", title:"Пересечение сплошной линии разметки", note:"при ДТП — также изымается лицензия", fine:15000, revoke:true},
{id:"dps-10.1", num:"10.1", type:"ДПС", title:"Непредоставление преимущества маршрутному транспорту", note:"", fine:5000},
{id:"dps-10.2", num:"10.2", type:"ДПС", title:"Непредоставление преимущества спец. службам с маячком/сиреной", note:"+ изъятие лицензии", fine:15000, revoke:true},
{id:"dps-10.3", num:"10.3", type:"ДПС", title:"Непредоставление преимущества колонне гос. служб", note:"+ изъятие лицензии", fine:20000, revoke:true},
{id:"dps-10.4", num:"10.4", type:"ДПС", title:"Невыполнение требования уступить дорогу пешеходам/велосипедистам", note:"", fine:10000},
{id:"dps-11.1", num:"11.1", type:"ДПС", title:"Виновник ДТП без вреда здоровью", note:"", fine:10000},
{id:"dps-11.1.1", num:"11.1.1", type:"ДПС", title:"Виновник ДТП с тяжким вредом здоровью/смертью", note:"+ изъятие лицензии на оружие", fine:25000, revoke:true},
{id:"dps-11.2", num:"11.2", type:"ДПС", title:"Оставление места ДТП", note:"", fine:15000},
{id:"dps-11.3", num:"11.3", type:"ДПС", title:"Создание аварийных ситуаций, провокация на ДТП, автоподставы", note:"+ изъятие водительского удостоверения", fine:20000, revoke:true},
{id:"dps-12.1", num:"12.1", type:"ДПС", title:"Превышение скорости более чем на 30 км/ч (80–90 км/ч)", note:"", fine:5000},
{id:"dps-12.2", num:"12.2", type:"ДПС", title:"Превышение скорости более чем на 50 км/ч (90–120 км/ч)", note:"", fine:7000},
{id:"dps-12.3", num:"12.3", type:"ДПС", title:"Превышение на 30+ км/ч + ДТП", note:"также изымается лицензия", fine:15000, revoke:true},
{id:"dps-12.4", num:"12.4", type:"ДПС", title:"Превышение на 50+ км/ч + ДТП", note:"+ изъятие водительского удостоверения + лицензия", fine:25000, revoke:true},
{id:"dps-13.1", num:"13.1", type:"ДПС", title:"Оскорбление гражданского лица / сотрудника гос. структур", note:"", fine:10000},
{id:"dps-13.1.1", num:"13.1.1", type:"ДПС", title:"Не грубое оскорбление сотрудника правоохранительных органов", note:"", fine:10000},
{id:"dps-13.2", num:"13.2", type:"ДПС", title:"Мелкое хулиганство", note:"нецензурная брань, громкие крики в общественных местах", fine:8000},
{id:"dps-13.3", num:"13.3", type:"ДПС", title:"Курение в общественных местах", note:"", fine:5000},
{id:"dps-13.4", num:"13.4", type:"ДПС", title:"Распитие спиртных напитков в общественных местах", note:"", fine:7000},
{id:"dps-13.5", num:"13.5", type:"ДПС", title:"Громкая музыка в жилых зонах в ночное время (23:00–06:00)", note:"", fine:4000},
{id:"dps-13.6", num:"13.6", type:"ДПС", title:"Ношение отмычек или спец. приспособлений для проникновения", note:"", fine:15000},
{id:"pps-20.1", num:"20.1", type:"ППС", title:"Оскорбление — унижение чести и достоинства", note:"", fine:5000},
{id:"pps-20.2", num:"20.2", type:"ППС", title:"Дискриминация по полу, расе, национальности и т.д.", note:"", fine:5000},
{id:"pps-20.3", num:"20.3", type:"ППС", title:"Нанесение побоев или иных насильственных действий", note:"или административный арест", fine:30000},
{id:"pps-20.4", num:"20.4", type:"ППС", title:"Занятие народной медициной без разрешения", note:"", fine:4000},
{id:"pps-20.5", num:"20.5", type:"ППС", title:"Потребление наркотических средств без назначения врача", note:"или административный арест", fine:10000},
{id:"pps-20.6", num:"20.6", type:"ППС", title:"Занятие проституцией", note:"", fine:3000},
{id:"pps-20.7", num:"20.7", type:"ППС", title:"Курение в общественных местах", note:"", fine:3000},
{id:"pps-20.8", num:"20.8", type:"ППС", title:"Распитие спиртных напитков в общественных местах", note:"", fine:5000},
{id:"pps-20.9", num:"20.9", type:"ППС", title:"Мелкое хулиганство", note:"или административный арест", fine:2000},
{id:"pps-30.1", num:"30.1", type:"ППС", title:"Нарушение порядка проведения собрания/митинга/шествия", note:"", fine:20000},
{id:"pps-30.2", num:"30.2", type:"ППС", title:"Нарушение правил перевозки и транспортирования оружия", note:"", fine:2000},
{id:"pps-30.3", num:"30.3", type:"ППС", title:"Появление в общественном месте в состоянии опьянения", note:"", fine:3000},
{id:"pps-30.4", num:"30.4", type:"ППС", title:"Организация/участие в блокировании транспортных коммуникаций", note:"", fine:100000},
{id:"pps-40.1", num:"40.1", type:"ППС", title:"Подкуп избирателей", note:"+ арест до 15 суток", fine:120000},
{id:"pps-40.2", num:"40.2", type:"ППС", title:"Агитация в день тишины", note:"+ арест до 15 суток", fine:200000},
];

const UK_ARTICLES=[
{id:"1.1", num:"1.1", type:"УК", title:"Нападение на гражданское лицо без использования оружия", note:"", term:2},
{id:"1.1.1", num:"1.1.1", type:"УК", title:"Побои", note:"", term:1},
{id:"1.1.2", num:"1.1.2", type:"УК", title:"Нападение на гражданское лицо с применением холодного оружия", note:"", term:3},
{id:"1.1.3", num:"1.1.3", type:"УК", title:"Вооружённое нападение на гражданское лицо", note:"", term:4},
{id:"1.2", num:"1.2", type:"УК", title:"Причинение смерти по неосторожности без оружия", note:"", term:1},
{id:"1.2.1", num:"1.2.1", type:"УК", title:"Причинение смерти по неосторожности при управлении транспортом", note:"", term:2},
{id:"1.3", num:"1.3", type:"УК", title:"Угроза причинения вреда здоровью (слова)", note:"", term:1},
{id:"1.3.1", num:"1.3.1", type:"УК", title:"Угроза причинения вреда здоровью с использованием оружия", note:"", term:2},
{id:"1.4", num:"1.4", type:"УК", title:"Изнасилование", note:"", term:2},
{id:"1.5", num:"1.5", type:"УК", title:"Воспрепятствование оказанию медицинской помощи", note:"", term:2},
{id:"2.1", num:"2.1", type:"УК", title:"Похищение человека", note:"", term:4},
{id:"2.2", num:"2.2", type:"УК", title:"Клевета", note:"", term:2},
{id:"3.1", num:"3.1", type:"УК", title:"Кража", note:"", term:2},
{id:"3.1.1", num:"3.1.1", type:"УК", title:"Разбой", note:"", term:3},
{id:"3.2", num:"3.2", type:"УК", title:"Умышленное повреждение или порча частного имущества", note:"", term:2},
{id:"3.2.1", num:"3.2.1", type:"УК", title:"Умышленное повреждение или порча государственного имущества", note:"", term:3},
{id:"4.1", num:"4.1", type:"УК", title:"Террористический акт", note:"", term:6},
{id:"4.1.1", num:"4.1.1", type:"УК", title:"Заведомо ложное сообщение об акте терроризма", note:"", term:3},
{id:"4.2", num:"4.2", type:"УК", title:"Несообщение о преступлении", note:"", term:2},
{id:"4.3", num:"4.3", type:"УК", title:"Массовые беспорядки", note:"", term:5},
{id:"4.4", num:"4.4", type:"УК", title:"Участие в несанкционированных митингах", note:"", term:2},
{id:"4.4.1", num:"4.4.1", type:"УК", title:"Организация несанкционированного митинга", note:"", term:3},
{id:"4.5", num:"4.5", type:"УК", title:"Ношение оружия в открытом виде", note:"", term:2},
{id:"4.5.1", num:"4.5.1", type:"УК", title:"Ношение оружия в открытом виде в общественных местах", note:"", term:3},
{id:"4.5.2", num:"4.5.2", type:"УК", title:"Ношение оружия и патронов без лицензии", note:"", term:2},
{id:"4.5.3", num:"4.5.3", type:"УК", title:"Ношение оружия в открытом виде без лицензии", note:"", term:4},
{id:"4.5.4", num:"4.5.4", type:"УК", title:"Ношение оружия в открытом виде в общественных местах без лицензии", note:"", term:5},
{id:"4.6", num:"4.6", type:"УК", title:"Незаконное приобретение/передача/изготовление оружия и боеприпасов", note:"", term:2},
{id:"4.7", num:"4.7", type:"УК", title:"Помеха проведению мероприятий гос. структур", note:"", term:1},
{id:"4.8", num:"4.8", type:"УК", title:"Проникновение на желтую зону", note:"", term:2},
{id:"4.8.1", num:"4.8.1", type:"УК", title:"Проникновение на красную зону", note:"", term:4},
{id:"4.8.2", num:"4.8.2", type:"УК", title:"Проникновение на частную территорию без разрешения", note:"", term:1},
{id:"4.9", num:"4.9", type:"УК", title:"Соучастие в преступлении", note:"", term:3},
{id:"5.1", num:"5.1", type:"УК", title:"Нападение на сотрудника гос. организации при исполнении", note:"", term:4},
{id:"5.1.1", num:"5.1.1", type:"УК", title:"Нападение на сотрудника силовых структур при исполнении", note:"", term:5},
{id:"5.1.2", num:"5.1.2", type:"УК", title:"Нападение на государственного деятеля при исполнении", note:"", term:6},
{id:"5.2", num:"5.2", type:"УК", title:"Неподчинение законному требованию сотрудника ПО или МО", note:"", term:1},
{id:"5.2.1", num:"5.2.1", type:"УК", title:"Побег от сотрудников ПО", note:"", term:2},
{id:"5.3", num:"5.3", type:"УК", title:"Создание помехи сотруднику ПО при исполнении", note:"", term:2},
{id:"5.3.1", num:"5.3.1", type:"УК", title:"Провокация сотрудников правоохранительных органов", note:"", term:2},
{id:"5.4", num:"5.4", type:"УК", title:"Оскорбление сотрудников ПО в грубой форме", note:"", term:1},
{id:"5.5", num:"5.5", type:"УК", title:"Ложный вызов", note:"", term:2},
{id:"5.6", num:"5.6", type:"УК", title:"Дача ложных показаний", note:"", term:2},
{id:"5.7", num:"5.7", type:"УК", title:"Дача или попытка дачи взятки", note:"", term:3},
{id:"5.8", num:"5.8", type:"УК", title:"Случайное разглашение государственной тайны", note:"", term:1},
{id:"5.8.1", num:"5.8.1", type:"УК", title:"Намеренное разглашение/передача гос. тайны", note:"", term:3},
{id:"5.9", num:"5.9", type:"УК", title:"Шпионаж", note:"", term:4},
{id:"5.10", num:"5.10", type:"УК", title:"Присвоение полномочий должностного лица", note:"", term:3},
{id:"6.1.1", num:"6.1.1", type:"УК", title:"Укрывательство преступлений", note:"", term:2},
{id:"6.2", num:"6.2", type:"УК", title:"Превышение должностных полномочий", note:"", term:2},
{id:"6.3", num:"6.3", type:"УК", title:"Халатность", note:"", term:4},
{id:"6.4", num:"6.4", type:"УК", title:"Разглашение сведений должностным лицом гос. тайны", note:"", term:4},
{id:"6.5", num:"6.5", type:"УК", title:"Вооружённый мятеж", note:"", term:6},
{id:"6.6", num:"6.6", type:"УК", title:"Неоказание помощи больному", note:"", term:3},
{id:"6.7", num:"6.7", type:"УК", title:"Дезертирство", note:"", term:3},
{id:"6.8", num:"6.8", type:"УК", title:"Получение взятки должностным лицом", note:"", term:3},
{id:"7.2", num:"7.2", type:"УК", title:"Хранение или перевозка наркотических веществ", note:"", term:3},
{id:"7.3", num:"7.3", type:"УК", title:"Приобретение, сбыт, распространение наркотических веществ", note:"", term:4},
{id:"7.4", num:"7.4", type:"УК", title:"Производство, изготовление, выращивание наркотических веществ", note:"", term:3},
];

// LAW_DOCUMENTS — оставляем как есть из knowledge base (очень большой, не дублирую)
const LAW_DOCUMENTS = (typeof window !== 'undefined' && window.__LAW_DOCUMENTS__) || [];

const _sfc_main={
name: "LawsHelper",
data(){
return{
version: "V4.2.0",
search: "",
mode:null,
currentTab:2,
wantedId: "",
selectedArticles:[],
fineId: "",
fineKoapType: "all",
selectedFineArticles:[],
fineWithRevoke:false,
lawDocuments: (typeof LAW_DOCUMENTS !== 'undefined' ? LAW_DOCUMENTS : []),
lawDocType: "all",
expandedDocs:[],
selectedLawArticleId:null,
tabs:[
 {key:"laws",   title:"ЗАКОНЫ"},
{key:"fines",  title:"ШТРАФЫ"},
{key:"wanted", title:"РОЗЫСК"},
{key:"binder", title:"БИНДЕР"}
			],
content:{
binder: `<div class="laws-helper__placeholder">Раздел "Биндер" — в разработке</div>`
}
}
},
computed:{
visibleTabs(){
if(this.mode==="wanted")return this.tabs.filter(t=>t.key==="wanted");
if(this.mode==="fine")  return this.tabs.filter(t=>t.key==="fines");
if(this.mode==="laws")  return this.tabs.filter(t=>t.key==="laws");
return this.tabs;
},
filteredArticles(){
const q=this.search.trim().toLowerCase();
if(!q)return UK_ARTICLES;
const qAlt=fixLayout(q);
return UK_ARTICLES.filter(a=>
a.num.toLowerCase().includes(q)||
a.title.toLowerCase().includes(q)||
(a.note&&a.note.toLowerCase().includes(q))||
(qAlt!==q&&(a.num.toLowerCase().includes(qAlt)||a.title.toLowerCase().includes(qAlt)||(a.note&&a.note.toLowerCase().includes(qAlt))))
);
},
selectedArticleObjects(){
return UK_ARTICLES.filter(a=>this.selectedArticles.includes(a.id));
},
totalTerm(){
return this.selectedArticleObjects.reduce((s,a)=>s+a.term,0);
},
cappedTerm(){
return Math.min(this.totalTerm, 6);
},
isTermOverCap(){
return this.totalTerm > 6;
},
filteredKoapArticles(){
let arts=KOAP_ARTICLES;
if(this.fineKoapType!=="all")arts=arts.filter(a=>a.type===this.fineKoapType);
const q=this.search.trim().toLowerCase();
if(!q)return arts;
const qAlt=fixLayout(q);
return arts.filter(a=>
a.num.toLowerCase().includes(q)||
a.title.toLowerCase().includes(q)||
(a.note&&a.note.toLowerCase().includes(q))||
(qAlt!==q&&(a.num.toLowerCase().includes(qAlt)||a.title.toLowerCase().includes(qAlt)||(a.note&&a.note.toLowerCase().includes(qAlt))))
);
},
selectedFineArticleObjects(){
return KOAP_ARTICLES.filter(a=>this.selectedFineArticles.includes(a.id));
},
totalFine(){
return this.selectedFineArticleObjects.reduce((s,a)=>s+a.fine,0);
},
fineCanRevoke(){
return this.selectedFineArticleObjects.some(a=>a.revoke===true);
},
filteredLawDocuments(){
const q=this.search.trim().toLowerCase();
let docs=this.lawDocuments;
if( this.lawDocType!=="all")docs=docs.filter(d=>d.id===this.lawDocType);
if(!q)return docs;
const qAlt=fixLayout(q);
const matchQ=(text)=>text.toLowerCase().includes(q)||(qAlt!==q&&text.toLowerCase().includes(qAlt));
return docs
.map(doc=>{
const matchedArticles=doc.articles.filter(a=>{
const plainText=a.text?a.text.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '):'';
return matchQ(a.num)||matchQ(a.title)||matchQ(plainText);
});
if(matchQ(doc.title))return doc;
if(matchedArticles.length===0)return null;
return{...doc,articles:matchedArticles};
})
.filter(Boolean);
},
selectedLawArticle(){
if(!this.selectedLawArticleId)return null;
for(const doc of this.lawDocuments){
const found=doc.articles.find(a=>a.id===this.selectedLawArticleId);
if(found)return{...found,docTitle:doc.title};
}
return null;
},
currentContent(){
const vtabs=this.visibleTabs;
const tab=vtabs[this.currentTab];
if(!tab)return "";
return this.content[tab.key]||"";
}
},
created(){this.$data.noAdaptation=!0},
mounted(){
const _style=document.createElement("style");
_style.id="laws-helper-style";
// Стили вынесены в отдельный файл zkm (26).css — тут пусто
document.head.appendChild(_style);

const openMode=window._duranOpenMode||null;
window._duranOpenMode=null;
this.mode=openMode;
if(openMode==="fine"){
this.currentTab=0;
if(window._duranFineTargetId&&window._duranFineTargetId!==-1){
this.fineId=String(window._duranFineTargetId);
}
} else if(openMode==="wanted"){
this.currentTab=0;
if(window._duranWantedTargetId&&window._duranWantedTargetId!==-1){
this.wantedId=String(window._duranWantedTargetId);
}
} else if(openMode==="laws"){
this.currentTab=0;
} else {
this.currentTab=2;
if(window._duranWantedTargetId&&window._duranWantedTargetId!==-1){
this.wantedId=String(window._duranWantedTargetId);
}
}
this._prevOnKeyUp=window.onKeyUp;
window.onKeyUp=(e)=>{
if(e===window.KEY_CODE_ESC){this.close();return}
if(typeof this._prevOnKeyUp==="function")this._prevOnKeyUp(e)
}
 	if(!window.App?.developmentMode) window.setDrawLabelStatus(true);
 	this.$nextTick(()=>this.focusSearchInput());
 },
 unmounted(){
 	window.onKeyUp=this._prevOnKeyUp;
 	const s=document.getElementById("laws-helper-style");
 	if(s)s.remove()
 },
 methods:{
 	selectTab(i){
 		this.currentTab=i;
 		this.search="";
 		this.$nextTick(()=>this.focusSearchInput());
 	},
 	focusSearchInput(){
 		const inp=this.$el?.querySelector?.(".laws-helper__search input");
 		if(inp)inp.focus();
 	},
 	// ══════════════════════════════════════════════════════════
 	//  ПОДСВЕТКА СОВПАДЕНИЙ ПОИСКА
 	//  Оборачивает найденные фрагменты в <mark class="search-hl">.
 	//  - isHtml=false: для обычного текста (num, title, note).
 	//    Экранирует < > & " ', чтобы не сломать вёрстку.
 	//  - isHtml=true: для reader-text (в законах), где уже есть
 	//    теги <b>, <span style> и т.п. Вставляет подсветку только
 	//    в текстовые узлы, не трогая существующие теги.
 	//  Учитывает автоисправление раскладки (qAlt).
 	// ══════════════════════════════════════════════════════════
 	highlight(raw, isHtml = false){
 		const q = (this.search || "").trim();
 		const text = raw == null ? "" : String(raw);
 		if (!q || !text) return isHtml ? text : this._escapeHtml(text);

 		const qAlt = fixLayout(q);
 		const terms = [q];
 		if (qAlt !== q) terms.push(qAlt);

 		// Экранируем спец. символы regex
 		const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 		// Сортируем по длине (длинные сначала), чтобы "соб" не съел часть "собр"
 		terms.sort((a,b)=>b.length-a.length);
 		const pattern = terms.map(esc).join('|');
 		if (!pattern) return isHtml ? text : this._escapeHtml(text);

 		let re;
 		try { re = new RegExp(pattern, 'gi'); }
 		catch(e) { return isHtml ? text : this._escapeHtml(text); }

 		const wrap = (match) => `<mark class="search-hl">${isHtml ? match : this._escapeHtml(match)}</mark>`;

 		if (!isHtml) {
 			// Простой текст: экранируем и оборачиваем
 			return this._escapeHtml(text).replace(
 				new RegExp(terms.map(t=>esc(this._escapeHtml(t))).join('|'), 'gi'),
 				wrap
 			);
 		} else {
 			// HTML: разделяем на теги и текст. Теги оставляем как есть,
 			// в тексте ищем совпадения и оборачиваем.
 			return text.replace(/(<[^>]*>)|([^<]+)/g, (full, tag, txt) => {
 				if (tag) return tag;
 				return txt.replace(re, wrap);
 			});
 		}
 	},
 	_escapeHtml(s){
 		return String(s).replace(/[&<>"']/g, m => ({
 			'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 		}[m]));
 	},

 	toggleDoc(id){
 		const idx=this.expandedDocs.indexOf(id);
 		if(idx===-1)this.expandedDocs.push(id);
 		else this.expandedDocs.splice(idx,1)
 	},
 	selectLawArticle(id){this.selectedLawArticleId=id},
 	toggleArticle(id){
 		const idx=this.selectedArticles.indexOf(id);
 		if(idx===-1)this.selectedArticles.push(id);
 		else this.selectedArticles.splice(idx,1)
 	},
 	clearWanted(){this.selectedArticles=[];this.wantedId="";window._duranWantedTargetId=null},
 	issueWanted(){
 		const id=this.wantedId.trim();
 		if(!id||this.selectedArticles.length===0)return;
 		const totalStars=this.cappedTerm;
 		const lastCode=this.selectedArticleObjects.map(a=>a.num+" УК").join(", ");
 		if(window._mvdSetLastWantedCode)window._mvdSetLastWantedCode(lastCode);
 		const cmd=`/su ${id} ${totalStars}`;
 		if(typeof window.sendChatInput==="function")window.sendChatInput(cmd);
 		else if(typeof window.sendChatMessage==="function")window.sendChatMessage(cmd);
 		this.close()
 	},
 	toggleFineArticle(id){
 		const idx=this.selectedFineArticles.indexOf(id);
 		if(idx===-1)this.selectedFineArticles.push(id);
 		else this.selectedFineArticles.splice(idx,1);
 		if(!this.fineCanRevoke)this.fineWithRevoke=false;
 	},
 	toggleFineRevoke(){
 		if(!this.fineCanRevoke)return;
 		this.fineWithRevoke=!this.fineWithRevoke;
 	},
 	clearFine(){
 		this.selectedFineArticles=[];
 		this.fineId="";
 		this.fineWithRevoke=false;
 		window._duranFineTargetId=null
 	},
 	issueFine(){
 		const id=this.fineId.trim();
 		if(!id||this.selectedFineArticles.length===0)return;
 		const arts=this.selectedFineArticleObjects;
 		const withRevoke=this.fineCanRevoke&&this.fineWithRevoke;
 		const totalFine=this.totalFine;
 		const codes=arts.map(a=>a.num).join(", ");
 		const cmd=`/ticket ${id} ${totalFine} ${codes} КоАП`;
 		if(typeof window.sendChatInput==="function")window.sendChatInput(cmd);
 		else if(typeof window.sendChatMessage==="function")window.sendChatMessage(cmd);
 		if(withRevoke){
 			const revokeCodes=arts.filter(a=>a.revoke===true).map(a=>a.num).join(", ");
 			setTimeout(()=>{
 				if(typeof window._mvdSetTakeLicReason==="function")window._mvdSetTakeLicReason(revokeCodes+" КоАП");
 				window._mvdPendingTakeLicId = id;
 				console.log("[ZKM] _mvdPendingTakeLicId = "+id+" — ждём подтверждения штрафа");
 			},100);
 		}
 		this.close()
 	},
 	close(){window.closeInterface("Zkm")}
 }
};
const Zkm=_export_sfc(_sfc_main,[["render",render]]);
export{Zkm as default};
