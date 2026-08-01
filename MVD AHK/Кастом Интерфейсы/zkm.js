import{r as resolveComponent,o as openBlock,c as createElementBlock,b as createVNode,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,e as createTextVNode,t as toDisplayString,f as createCommentVNode,w as withCtx,T as Transition,_ as _export_sfc}from"./index.js";

const _hoisted_1={class:"laws-helper iface-container"};
const _hoisted_2={class:"laws-helper__header"};
const _hoisted_3={class:"laws-helper__title"};
const _hoisted_4={class:"laws-helper__title-version"};
const _hoisted_5={class:"laws-helper__header-right"};
const _hoisted_6={class:"laws-helper__tabs"};
const _hoisted_7={class:"laws-helper__search"};
const _hoisted_8={class:"laws-helper__body"};

// SVG иконки — вместо Unicode-символов которые не работают в CEF
const SVG_SEARCH=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(244,241,225,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(244,241,225,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SVG_STAR=`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 3l3.09 6.26L26 10.27l-5 4.87 1.18 6.88L16 18.77l-6.18 3.25L11 15.14 6 10.27l6.91-1.01L16 3z" fill="rgba(244,241,225,0.08)" stroke="rgba(244,241,225,0.15)" stroke-width="1"/></svg>`;
const SVG_BURGER=`<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/><rect y="4.25" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/><rect y="8.5" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/></svg>`;
const SVG_CHECK=`<svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4l3 3 5-6" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_RECEIPT=`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="2" width="20" height="24" rx="2" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.18)" stroke-width="1.2"/><line x1="8" y1="8" x2="20" y2="8" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="12" x2="20" y2="12" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="16" x2="16" y2="16" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="20" x2="14" y2="20" stroke="rgba(244,241,225,0.15)" stroke-width="1.2"/></svg>`;
const SVG_CHEVRON=`<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 1l3 3-3 3" stroke="rgba(244,241,225,0.5)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_DOC=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 1.5h5.5L11 4v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5z" stroke="rgba(249,183,1,0.6)" stroke-width="1.1" fill="rgba(249,183,1,0.06)"/><path d="M8.5 1.5V4H11" stroke="rgba(249,183,1,0.6)" stroke-width="1.1"/></svg>`;
const SVG_BOOK_EMPTY=`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 6a2 2 0 0 1 2-2h7v24H7a2 2 0 0 1-2-2V6z" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/><path d="M27 6a2 2 0 0 0-2-2h-7v24h7a2 2 0 0 0 2-2V6z" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/><line x1="16" y1="4" x2="16" y2="30" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/></svg>`;

// ══════════════════════════════════════════════════════════════════
//  Автоисправление раскладки клавиатуры для поиска (EN → RU)
//  Если раскладка оказалась английской, а искали на русском — символы,
//  введённые латиницей, соответствуют русским буквам по позиции на
//  клавиатуре (ЙЦУКЕН). Конвертируем и ищем совпадение по обоим вариантам.
// ══════════════════════════════════════════════════════════════════
const EN_TO_RU_LAYOUT={
	"`":"ё","q":"й","w":"ц","e":"у","r":"к","t":"е","y":"н","u":"г","i":"ш","o":"щ","p":"з","[":"х","]":"ъ",
	"a":"ф","s":"ы","d":"в","f":"а","g":"п","h":"р","j":"о","k":"л","l":"д",";":"ж","'":"э",
	"z":"я","x":"ч","c":"с","v":"м","b":"и","n":"т","m":"ь",",":"б",".":"ю","/":"."
};
function fixLayout(str){
	let out="";
	for(const ch of str)out+=EN_TO_RU_LAYOUT[ch]!==undefined?EN_TO_RU_LAYOUT[ch]:ch;
	return out;
}
// ══════════════════════════════════════════════════════════════════
//  Унификация букв "ё" и "е" для поиска
//  В JS toLowerCase() не превращает "Ё" в "Е", поэтому при поиске
//  "желтый" не находится в тексте "жёлтый". Эта функция приводит
//  всё к единому виду (заменяет ё -> е и переводит в нижний регистр).
// ══════════════════════════════════════════════════════════════════
function normalizeText(str) {
    return str ? str.toLowerCase().replace(/ё/g, 'е') : '';
}
// ══════════════════════════════════════════════════════════════════
//  Точный поиск по номеру статьи ("1.5" не должно находить "11.5")
//  Если запрос выглядит как номер статьи (цифры и точки) — ищем
//  либо точное совпадение, либо "родственные" номера (1 → 1.1, 1.2…),
//  но не подстроку где попало.
// ══════════════════════════════════════════════════════════════════
function isNumericQuery(q){
	return /^[0-9]+(\.[0-9]+)*$/.test(q);
}
function numMatch(num,q){
	return num===q||num.startsWith(q+".");
}

// ══════════════════════════════════════════════════════════════════
//  Разбор текста главы на отдельные статьи/пункты — чтобы при точном
//  поиске номера ("1.5") показывать только её, а не всю главу целиком.
//  Поддерживает 2 формата нумерации, встречающиеся в LAW_DOCUMENTS:
//   1) "<span...><b>Статья X.Y</b></span> - ..." (КоАП, УК)
//   2) "<b>X.Y</b> ..." без слова "Статья" (ЕУСС, пункты устава)
//  Если в тексте главы нет ни одного из форматов — возвращает [].
// ══════════════════════════════════════════════════════════════════
const STATYA_START_RE=/<span style="color:#00b300"><b>Статья ([0-9]+(?:\.[0-9]+)*)<\/b><\/span>/g;
const PUNKT_START_RE=/<b>([0-9]+(?:\.[0-9]+)+)<\/b>/g;
function parseSubArticles(text){
	if(!text)return[];
	let matches=[...text.matchAll(STATYA_START_RE)];
	if(matches.length===0)matches=[...text.matchAll(PUNKT_START_RE)];
	if(matches.length===0)return[];
	const result=[];
	for(let i=0;i<matches.length;i++){
		const num=matches[i][1];
		const start=matches[i].index;
		const end=i+1<matches.length?matches[i+1].index:text.length;
		const html=text.slice(start,end).trim().replace(/\n+$/,"");
		let plain=html.replace(/<[^>]+>/g,"").trim();
		plain=plain.replace(/^Статья\s*[0-9.]+\s*-\s*/,"").replace(/^[0-9.]+\s*/,"");
		let title=plain.split(/\n|\|/)[0].trim();
		if(title.length>90)title=title.slice(0,87)+"…";
		result.push({num,title,html});
	}
	return result;
}

function render(_ctx,_cache,$props,$setup,$data,$options){
	const currentTabKey=$options.visibleTabs[$data.currentTab]?.key;
	// Граффити-паттерн — вставляется один раз в верхнюю часть окна
	return (openBlock(), createElementBlock("div", _hoisted_1, [
		_cache[0] || (_cache[0] = createBaseVNode("div", {class:"laws-helper__graffiti"}, [
			createBaseVNode("div", {class:"laws-helper__pattern"})
		], -1)),
		createBaseVNode("div", _hoisted_2, [
			createBaseVNode("div", _hoisted_3, [
				_cache[1] || (_cache[1] = createBaseVNode("span", {class:"laws-helper__title-main"}, "KONST", -1)),
				_cache[2] || (_cache[2] = createBaseVNode("span", {class:"laws-helper__title-sub"}, "AHK", -1)),
				createBaseVNode("span", _hoisted_4, toDisplayString($data.version), 1)
			]),
			createBaseVNode("div", _hoisted_6, [
				(openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleTabs, (tab, i) => (
					openBlock(), createElementBlock("div", {
						class: normalizeClass(["laws-helper__tab", {"laws-helper__tab_active": i===$data.currentTab}]),
						key: tab.key,
						onClick: $event => $options.selectTab(i)
					}, toDisplayString(tab.title), 11, ["onClick"])
				)), 128))
			]),
			createBaseVNode("div", _hoisted_5, [
				createBaseVNode("div", {class:"laws-helper__icon-btn", innerHTML: SVG_BURGER}),
				createBaseVNode("div", {
					class: "laws-helper__icon-btn laws-helper__close-btn",
					onClick: $options.close
				}, "X", 8, ["onClick"])
			])
		]),
		createBaseVNode("div", _hoisted_7, [
			createBaseVNode("span", {class:"laws-helper__search-icon", innerHTML: SVG_SEARCH}),
			createBaseVNode("input", {
				type: "text",
				placeholder: currentTabKey === "fines" ? "Поиск статьи КоАП..." : currentTabKey === "laws" ? "Поиск по статьям и документам..." : "Поиск нарушения...",
				value: $data.search,
				onInput: $event => { $data.search = $event.target.value }
			}, null, 40, ["value","onInput","placeholder"]),
			// Фильтр по документу (Все/КоАП/УК/...) — справа от поиска, только для таба ЗАКОНЫ
			currentTabKey === "laws"
				? (openBlock(), createElementBlock("div", {key:"law-filters", class:"laws-helper__search-filters"}, [
					createBaseVNode("div", {
						class: normalizeClass(["laws-helper__fine-filter-btn", {"laws-helper__fine-filter-btn_active": $data.lawDocType === "all"}]),
						onClick: $event => { $data.lawDocType = "all"; }
					}, "Все", 10, ["onClick"]),
					createBaseVNode("div", {
						class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_koap", {"laws-helper__fine-filter-btn_active": $data.lawDocType === "koap"}]),
						onClick: $event => { $data.lawDocType = "koap"; }
					}, "КоАП", 10, ["onClick"]),
					createBaseVNode("div", {
						class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_uk", {"laws-helper__fine-filter-btn_active": $data.lawDocType === "uk"}]),
						onClick: $event => { $data.lawDocType = "uk"; }
					}, "УК", 10, ["onClick"]),
					createBaseVNode("div", {
						class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_proc", {"laws-helper__fine-filter-btn_active": $data.lawDocType === "proc"}]),
						onClick: $event => { $data.lawDocType = "proc"; }
					}, "Проц.", 10, ["onClick"]),
					createBaseVNode("div", {
						class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_kto", {"laws-helper__fine-filter-btn_active": $data.lawDocType === "kto"}]),
						onClick: $event => { $data.lawDocType = "kto"; }
					}, "КТО", 10, ["onClick"]),
					createBaseVNode("div", {
						class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_euss", {"laws-helper__fine-filter-btn_active": $data.lawDocType === "euss"}]),
						onClick: $event => { $data.lawDocType = "euss"; }
					}, "ЕУСС", 10, ["onClick"]),
					createBaseVNode("div", {
						class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_zot", {"laws-helper__fine-filter-btn_active": $data.lawDocType === "zot"}]),
						onClick: $event => { $data.lawDocType = "zot"; }
					}, "ЗОТ", 10, ["onClick"]),
					createBaseVNode("div", {
						class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_euvs", {"laws-helper__fine-filter-btn_active": $data.lawDocType === "euvs"}]),
						onClick: $event => { $data.lawDocType = "euvs"; }
					}, "ЕУВС", 10, ["onClick"])
				]))
				: createCommentVNode("", true)
		]),
		createBaseVNode("div", _hoisted_8, [
			// ─── ТАБ: ЗАКОНЫ ──────────────────────────────────────────────
			currentTabKey === "laws"
				? (openBlock(), createElementBlock("div", {key:"laws", class:"laws-helper__laws-layout"}, [
					createBaseVNode("div", {class:"laws-helper__laws-list laws-helper__laws-flat"}, [
						$options.flatLawArticles.length === 0
							? (openBlock(), createElementBlock("div", {key:"empty", class:"laws-helper__reader-empty-text"}, "Ничего не найдено."))
							: (openBlock(true), createElementBlock(Fragment, null, renderList($options.flatLawArticles, (art) => (
								openBlock(), createElementBlock("div", {
									key: art.id,
									class: normalizeClass(["laws-helper__article-row", {"laws-helper__article-row_checked": $data.selectedLawArticleId === art.id}]),
									onClick: $event => $options.selectLawArticle(art.id)
								}, [
									createBaseVNode("div", {class:"laws-helper__article-num"}, toDisplayString(art.num), 1),
									createBaseVNode("div", {class:"laws-helper__article-info"}, [
										createBaseVNode("div", {class:"laws-helper__article-title"}, toDisplayString(art.title), 1)
									]),
									createBaseVNode("div", {
										class: normalizeClass(["laws-helper__article-doc-tag", "laws-helper__article-doc-tag_"+art.docId])
									}, toDisplayString(art.docTitle), 3)
								], 10, ["onClick"])
							)), 128))
					]),
					createBaseVNode("div", {class:"laws-helper__reader"}, [
						$options.selectedLawArticle
							? (openBlock(), createElementBlock("div", {key:$options.selectedLawArticle.id, class:"laws-helper__reader-content"}, [
								createBaseVNode("div", {class:"laws-helper__reader-doc-label"}, toDisplayString($options.selectedLawArticle.docTitle), 1),
								createBaseVNode("div", {class:"laws-helper__reader-title"}, [
									createBaseVNode("span", {class:"laws-helper__reader-num"}, "Ст. " + toDisplayString($options.selectedLawArticle.num), 1),
									createTextVNode(" " + toDisplayString($options.selectedLawArticle.title))
								]),
								createBaseVNode("div", {class:"laws-helper__reader-divider"}),
								$options.selectedLawArticle.text
									? (openBlock(), createElementBlock("div", {key:$options.selectedLawArticle.id+"-text", class:"laws-helper__reader-text", innerHTML: $options.selectedLawArticle.text}))
									: (openBlock(), createElementBlock("div", {key:"empty", class:"laws-helper__reader-empty-text"}, "Текст статьи пока не добавлен."))
							]))
							: (openBlock(), createElementBlock("div", {key:"empty", class:"laws-helper__reader-empty"}, [
								createBaseVNode("div", {class:"laws-helper__reader-empty-icon", innerHTML: SVG_BOOK_EMPTY}),
								createBaseVNode("div", {class:"laws-helper__reader-empty-text-block"}, [
									createBaseVNode("span", null, "Выберите статью слева,"),
									createBaseVNode("span", null, "чтобы прочитать её текст.")
								])
							]))
					])
				]))
			// ─── ТАБ: РОЗЫСК ──────────────────────────────────────────────
			: currentTabKey === "wanted"
				? (openBlock(), createElementBlock("div", {key:"wanted", class:"laws-helper__wanted-layout"}, [
					createBaseVNode("div", {class:"laws-helper__laws-list"}, [
						(openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredArticles, (art) => (
							openBlock(), createElementBlock("div", {
								key: art.id,
								class: normalizeClass(["laws-helper__article-row", {"laws-helper__article-row_checked": $data.selectedArticles.includes(art.id)}]),
								onClick: $event => $options.toggleArticle(art.id)
							}, [
								createBaseVNode("div", {class:"laws-helper__article-check"}, [
									createBaseVNode("div", {
										class: normalizeClass(["laws-helper__checkbox", {"laws-helper__checkbox_checked": $data.selectedArticles.includes(art.id)}])
									}, [
										$data.selectedArticles.includes(art.id)
											? (openBlock(), createElementBlock("span", {key:"chk", class:"laws-helper__checkbox-svg", innerHTML: SVG_CHECK}))
											: createCommentVNode("", true)
									], 2)
								]),
								createBaseVNode("div", {class:"laws-helper__article-num"}, toDisplayString(art.num), 1),
								createBaseVNode("div", {
									class: normalizeClass(["laws-helper__article-type", "laws-helper__article-type_" + art.type.toLowerCase()])
								}, toDisplayString(art.type), 2),
								createBaseVNode("div", {class:"laws-helper__article-info"}, [
									createBaseVNode("div", {class:"laws-helper__article-title"}, toDisplayString(art.title), 1),
									art.note ? (openBlock(), createElementBlock("div", {key:"note", class:"laws-helper__article-note"}, "Примечание: " + toDisplayString(art.note), 1)) : createCommentVNode("", true)
								]),
								createBaseVNode("div", {class:"laws-helper__article-term"}, toDisplayString(art.term), 1)
							], 10, ["onClick"])
						)), 128))
					]),
					createBaseVNode("div", {class:"laws-helper__wanted-panel"}, [
						createBaseVNode("div", {class:"laws-helper__wanted-title"}, "ВЫДАЧА РОЗЫСКА"),
						createBaseVNode("div", {class:"laws-helper__wanted-title-line"}),
						$data.selectedArticles.length === 0
							? (openBlock(), createElementBlock("div", {key:"empty", class:"laws-helper__wanted-empty"}, [
								createBaseVNode("div", {class:"laws-helper__wanted-star-icon", innerHTML: SVG_STAR}),
								createBaseVNode("div", {class:"laws-helper__wanted-empty-text"}, [
									createBaseVNode("span", null, "Список нарушений пуст."),
									createBaseVNode("span", null, "Кликните по статье слева,"),
									createBaseVNode("span", null, "чтобы добавить в розыск.")
								])
							]))
							: (openBlock(), createElementBlock("div", {key:"list", class:"laws-helper__wanted-selected-list"}, [
								(openBlock(true), createElementBlock(Fragment, null, renderList($options.selectedArticleObjects, (art) => (
									openBlock(), createElementBlock("div", {key:art.id, class:"laws-helper__wanted-sel-item"}, [
										createBaseVNode("span", {class:"laws-helper__wanted-sel-num"}, toDisplayString(art.num), 1),
										createBaseVNode("span", {class:"laws-helper__wanted-sel-title"}, toDisplayString(art.title), 1),
										createBaseVNode("span", {class:"laws-helper__wanted-sel-term"}, toDisplayString(art.term), 1)
									])
								)), 128))
							])),
						createBaseVNode("div", {class:"laws-helper__wanted-stars-row"}, [
							createBaseVNode("span", {class:"laws-helper__wanted-stars-label"}, "ЗВЕЗДЫ РОЗЫСКА:"),
							createBaseVNode("span", {
								class: normalizeClass(["laws-helper__wanted-stars-value", {"laws-helper__wanted-stars-value_capped": $options.isTermOverCap}])
							}, toDisplayString($options.cappedTerm) + " лет", 3)
						]),
						createBaseVNode("div", {class:"laws-helper__wanted-id-label"}, "ID НАРУШИТЕЛЯ"),
						createBaseVNode("input", {
							class: "laws-helper__wanted-id-input",
							type: "text",
							placeholder: "Введите ID нарушителя",
							value: $data.wantedId,
							onInput: $event => { $data.wantedId = $event.target.value }
						}, null, 40, ["value","onInput"]),
						createBaseVNode("div", {class:"laws-helper__wanted-btns"}, [
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
				? (openBlock(), createElementBlock("div", {key:"fines", class:"laws-helper__wanted-layout"}, [
					// Левая колонка — список КоАП статей
					createBaseVNode("div", {class:"laws-helper__laws-list"}, [
						// Фильтр по типу КоАП
						createBaseVNode("div", {class:"laws-helper__fine-filter"}, [
							createBaseVNode("div", {
								class: normalizeClass(["laws-helper__fine-filter-btn", {"laws-helper__fine-filter-btn_active": $data.fineKoapType === "all"}]),
								onClick: $event => { $data.fineKoapType = "all"; }
							}, "Все", 10, ["onClick"]),
							createBaseVNode("div", {
								class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__fine-filter-btn_dps", {"laws-helper__fine-filter-btn_active": $data.fineKoapType === "ДПС"}]),
								onClick: $event => { $data.fineKoapType = "ДПС"; }
							}, "ДПС", 10, ["onClick"]),
							createBaseVNode("div", {
								class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__fine-filter-btn_pps", {"laws-helper__fine-filter-btn_active": $data.fineKoapType === "ППС"}]),
								onClick: $event => { $data.fineKoapType = "ППС"; }
							}, "ППС", 10, ["onClick"])
						]),
						// Список статей КоАП
						(openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredKoapArticles, (art) => (
							openBlock(), createElementBlock("div", {
								key: art.id,
								class: normalizeClass(["laws-helper__article-row", {"laws-helper__article-row_checked": $data.selectedFineArticles.includes(art.id)}]),
								onClick: $event => $options.toggleFineArticle(art.id)
							}, [
								createBaseVNode("div", {class:"laws-helper__article-check"}, [
									createBaseVNode("div", {
										class: normalizeClass(["laws-helper__checkbox", {"laws-helper__checkbox_checked": $data.selectedFineArticles.includes(art.id)}])
									}, [
										$data.selectedFineArticles.includes(art.id)
											? (openBlock(), createElementBlock("span", {key:"chk", class:"laws-helper__checkbox-svg", innerHTML: SVG_CHECK}))
											: createCommentVNode("", true)
									], 2)
								]),
								createBaseVNode("div", {class:"laws-helper__article-num"}, toDisplayString(art.num), 1),
								createBaseVNode("div", {
									class: normalizeClass(["laws-helper__article-type", "laws-helper__article-type_" + art.type.toLowerCase()])
								}, toDisplayString(art.type), 2),
								createBaseVNode("div", {class:"laws-helper__article-info"}, [
									createBaseVNode("div", {class:"laws-helper__article-title"}, toDisplayString(art.title), 1),
									art.note ? (openBlock(), createElementBlock("div", {key:"note", class:"laws-helper__article-note"}, toDisplayString(art.note), 1)) : createCommentVNode("", true)
								]),
								art.revoke ? (openBlock(), createElementBlock("div", {key:"revoke-badge", class:"laws-helper__article-revoke-badge"}, "ВУ")) : createCommentVNode("", true),
								createBaseVNode("div", {class:"laws-helper__article-term"}, toDisplayString(art.fine.toLocaleString("ru-RU")) + " ₽", 1)
							], 10, ["onClick"])
						)), 128))
					]),
					// Правая колонка — панель штрафа
					createBaseVNode("div", {class:"laws-helper__wanted-panel"}, [
						createBaseVNode("div", {class:"laws-helper__wanted-title"}, "ВЫДАЧА ШТРАФА"),
						createBaseVNode("div", {class:"laws-helper__wanted-title-line laws-helper__fine-title-line"}),
						$data.selectedFineArticles.length === 0
							? (openBlock(), createElementBlock("div", {key:"empty", class:"laws-helper__wanted-empty"}, [
								createBaseVNode("div", {class:"laws-helper__wanted-star-icon", innerHTML: SVG_RECEIPT}),
								createBaseVNode("div", {class:"laws-helper__wanted-empty-text"}, [
									createBaseVNode("span", null, "Список нарушений пуст."),
									createBaseVNode("span", null, "Кликните по статье слева,"),
									createBaseVNode("span", null, "чтобы добавить в штраф.")
								])
							]))
							: (openBlock(), createElementBlock("div", {key:"list", class:"laws-helper__wanted-selected-list"}, [
								(openBlock(true), createElementBlock(Fragment, null, renderList($options.selectedFineArticleObjects, (art) => (
									openBlock(), createElementBlock("div", {key:art.id, class:"laws-helper__wanted-sel-item"}, [
										createBaseVNode("span", {class:"laws-helper__wanted-sel-num"}, toDisplayString(art.num), 1),
										createBaseVNode("span", {class:"laws-helper__wanted-sel-title"}, toDisplayString(art.title), 1),
										createBaseVNode("span", {class:"laws-helper__fine-sel-amount"}, toDisplayString(art.fine.toLocaleString("ru-RU")) + " ₽", 1)
									])
								)), 128))
							])),
						createBaseVNode("div", {class:"laws-helper__wanted-stars-row"}, [
							createBaseVNode("span", {class:"laws-helper__wanted-stars-label"}, "СУММА ШТРАФА:"),
							createBaseVNode("span", {class:"laws-helper__fine-total"}, toDisplayString($options.totalFine.toLocaleString("ru-RU")) + " ₽", 1)
						]),
						createBaseVNode("div", {
							class: normalizeClass(["laws-helper__fine-revoke", {
								"laws-helper__fine-revoke_active": $options.fineCanRevoke && $data.fineWithRevoke,
								"laws-helper__fine-revoke_disabled": !$options.fineCanRevoke
							}]),
							onClick: $options.toggleFineRevoke
						}, [
							createBaseVNode("div", {
								class: normalizeClass(["laws-helper__checkbox", "laws-helper__fine-revoke-checkbox", {"laws-helper__checkbox_checked": $options.fineCanRevoke && $data.fineWithRevoke}])
							}, [
								($options.fineCanRevoke && $data.fineWithRevoke)
									? (openBlock(), createElementBlock("span", {key:"chk", class:"laws-helper__checkbox-svg", innerHTML: SVG_CHECK}))
									: createCommentVNode("", true)
							], 2),
							createBaseVNode("span", {class:"laws-helper__fine-revoke-label"}, "С ИЗЪЯТИЕМ ВОД. УДОСТ.")
						], 10, ["onClick"]),
						createBaseVNode("div", {class:"laws-helper__wanted-id-label"}, "ID НАРУШИТЕЛЯ"),
						createBaseVNode("input", {
							class: "laws-helper__wanted-id-input",
							type: "text",
							placeholder: "Введите ID нарушителя",
							value: $data.fineId,
							onInput: $event => { $data.fineId = $event.target.value }
						}, null, 40, ["value","onInput"]),
						createBaseVNode("div", {class:"laws-helper__wanted-btns"}, [
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
			// ─── ОСТАЛЬНЫЕ ТАБЫ (БИНДЕР) ──────────────────────────────────
			: (openBlock(), createElementBlock("div", {key:"other", class:"laws-helper__content"}, [
				createBaseVNode("div", {innerHTML: $options.currentContent})
			]))
		])
	]));
}

// ══════════════════════════════════════════════════════════════════
//  ЗАКОНЫ — дерево документов (заглушка структуры, текст добавляется позже)
//  Уровни: Документ → Статья (2 уровня)
// ══════════════════════════════════════════════════════════════════
const LAW_DOCUMENTS=[
	{
		id:"koap",
		title:"КоАП",
		articles:[]
	},
	{
		id:"uk",
		title:"УК",
		articles:[]
	},
	{
		id:"proc",
		title:"Процессуальный кодекс",
		articles:[]
	},
	{
		id:"kto",
		title:"Закон о КТО",
		articles:[]
	},
	{
	id:"euss",
	title:"ЕУСС",
	articles:[]
},
{
	id:"euvs",
	title:"ЕУВС",
	articles:[]
},
{
	id:"zot",
	title:"Закон о ЗОТ",
	articles:[]
}
];

const _sfc_main={
	name:"LawsHelper",
	data(){
		return{
			version:"V4.1.0",
			search:"",
			// ── режим открытия: 'wanted' | 'fine' | null (все табы) ──
			mode:null,
			// currentTab = индекс в visibleTabs (не в полном tabs)
			currentTab:2, // дефолт: индекс 2 = РОЗЫСК в полном списке
			// ── РОЗЫСК ───────────────────────────────────────────────
			wantedId:"",
			selectedArticles:[],
			// ── ШТРАФЫ ───────────────────────────────────────────────
			fineId:"",
			fineKoapType:"all", // 'all' | 'ДПС' | 'ППС'
			selectedFineArticles:[],
			fineWithRevoke:false, // чекбокс "с изъятием вод. удостоверения"
			// ── ЗАКОНЫ: дерево документов ─────────────────────────────
			koapArticles:[],
				ukArticles:[],
				lawDocuments:LAW_DOCUMENTS,
			lawDocType:"all", // 'all' | doc.id (koap | uk | proc | kto | euss | zot | euvs)
			expandedDocs:[LAW_DOCUMENTS[0]?.id].filter(Boolean), // первый документ раскрыт по умолчанию
			selectedLawArticleId:null,
			tabs:[
				{key:"laws",   title:"ЗАКОНЫ"},
				{key:"fines",  title:"ШТРАФЫ"},
				{key:"wanted", title:"РОЗЫСК"},
				{key:"binder", title:"БИНДЕР"}
			],
			content:{
				binder:`<div class="laws-helper__placeholder">Раздел "Биндер" — в разработке</div>`
			}
		}
	},
	computed:{
		// ── Список табов с учётом режима ─────────────────────────
		visibleTabs(){
			if(this.mode === "wanted") return this.tabs.filter(t => t.key === "wanted");
			if(this.mode === "fine")   return this.tabs.filter(t => t.key === "fines");
			if(this.mode === "laws")   return this.tabs.filter(t => t.key === "laws");
			return this.tabs;
		},
		
		// ── РОЗЫСК: фильтрация УК статей ─────────────────────────
		filteredArticles(){
			const q = normalizeText(this.search.trim());
			if(!q) return this.ukArticles;
			const qAlt = fixLayout(q);
			const isNum = isNumericQuery(q);
			return this.ukArticles.filter(a => {
				const title = normalizeText(a.title);
				const note = normalizeText(a.note);
				return (isNum ? numMatch(a.num, q) : a.num.includes(q)) ||
					   title.includes(q) ||
					   note.includes(q) ||
					   (qAlt !== q && (title.includes(qAlt) || note.includes(qAlt)));
			});
		},
		
		selectedArticleObjects(){
			return this.ukArticles.filter(a => this.selectedArticles.includes(a.id));
		},
		
		totalTerm(){
			return this.selectedArticleObjects.reduce((s, a) => s + a.term, 0);
		},
		
		// ── РОЗЫСК: реальный срок ограничен максимум 6 годами розыска ──
		cappedTerm(){
			return Math.min(this.totalTerm, 6);
		},
		
		isTermOverCap(){
			return this.totalTerm > 6;
		},
		
		// ── ШТРАФЫ: фильтрация КоАП статей ───────────────────────
		filteredKoapArticles(){
			let arts = this.koapArticles;
			if(this.fineKoapType !== "all") arts = arts.filter(a => a.type === this.fineKoapType);
			
			const q = normalizeText(this.search.trim());
			if(!q) return arts;
			const qAlt = fixLayout(q);
			const isNum = isNumericQuery(q);
			
			return arts.filter(a => {
				const title = normalizeText(a.title);
				const note = normalizeText(a.note);
				return (isNum ? numMatch(a.num, q) : a.num.includes(q)) ||
					   title.includes(q) ||
					   note.includes(q) ||
					   (qAlt !== q && (title.includes(qAlt) || note.includes(qAlt)));
			});
		},
		
		selectedFineArticleObjects(){
			return this.koapArticles.filter(a => this.selectedFineArticles.includes(a.id));
		},
		
		totalFine(){
			return this.selectedFineArticleObjects.reduce((s, a) => s + a.fine, 0);
		},
		
		fineCanRevoke(){
			return this.selectedFineArticleObjects.some(a => a.revoke === true);
		},
		
		// ── ЗАКОНЫ: дерево с фильтрацией по поиску ───────────────
		filteredLawDocuments(){
			const q = normalizeText(this.search.trim());
			let docs = this.lawDocuments;
			if(this.lawDocType !== "all") docs = docs.filter(d => d.id === this.lawDocType);
			if(!q) return docs;
			
			const qAlt = fixLayout(q);
			// Умный поиск с учётом "ё/е"
			const matchQ = (text) => {
				const norm = normalizeText(text);
				return norm.includes(q) || (qAlt !== q && norm.includes(qAlt));
			};
			
			const isNum = isNumericQuery(q);
			return docs
			.map(doc => {
				const resultArticles = [];
				for(const a of doc.articles){
					const subArts = parseSubArticles(a.text);
					if(isNum){
						// ── Точный поиск номера статьи внутри главы ──
						const exact = subArts.filter(s => s.num === q);
						if(exact.length){
							for(const s of exact) resultArticles.push({id:a.id+"__"+s.num, num:s.num, title:s.title, text:s.html});
							continue;
						}
					} else if(subArts.length){
						// ── Текстовый поиск: показываем только те статьи главы, где реально встретилось совпадение ──
						const found = subArts.filter(s => {
							const subPlain = normalizeText(s.html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
							return matchQ(s.title) || matchQ(subPlain);
						});
						if(found.length){
							for(const s of found) resultArticles.push({id:a.id+"__"+s.num, num:s.num, title:s.title, text:s.html});
							continue;
						}
					}
					// ── Запасной вариант: глава без разбивки на статьи ──
					const plainText = a.text ? normalizeText(a.text.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')) : '';
					const numMatched = isNum ? numMatch(a.num.toLowerCase(), q) : a.num.toLowerCase().includes(q);
					if(numMatched || matchQ(a.title) || matchQ(plainText)) resultArticles.push(a);
				}
				if(resultArticles.length === 0 && matchQ(doc.title)) return doc;
				if(resultArticles.length === 0) return null;
				return {...doc, articles:resultArticles};
			})
			.filter(Boolean);
		},
		
		// ── ЗАКОНЫ: плоский список статей (без деления на блоки по документам) ──
		flatLawArticles(){
			const arr = [];
			for(const doc of this.filteredLawDocuments){
				for(const a of doc.articles){
					arr.push({...a, docId:doc.id, docTitle:doc.title});
				}
			}
			return arr;
		},
		
		selectedLawArticle(){
			if(!this.selectedLawArticleId) return null;
			const sepIdx = this.selectedLawArticleId.indexOf("__");
			if(sepIdx !== -1){
				const baseId = this.selectedLawArticleId.slice(0, sepIdx);
				const subNum = this.selectedLawArticleId.slice(sepIdx + 2);
				for(const doc of this.lawDocuments){
					const found = doc.articles.find(a => a.id === baseId);
					if(found){
						const sub = parseSubArticles(found.text).find(s => s.num === subNum);
						if(sub) return {id:this.selectedLawArticleId, num:sub.num, title:sub.title, text:sub.html, docTitle:doc.title};
					}
				}
				return null;
			}
			for(const doc of this.lawDocuments){
				const found = doc.articles.find(a => a.id === this.selectedLawArticleId);
				if(found) return {...found, docTitle:doc.title};
			}
			return null;
		},
		
		currentContent(){
			const vtabs = this.visibleTabs;
			const tab = vtabs[this.currentTab];
			if(!tab) return "";
			return this.content[tab.key] || "";
		}
	},
	created(){this.$data.noAdaptation=!0},
	mounted(){
		// ── Данные из загрузчика ────────────────────────────────────
		if(window.__zkm_koap){this.koapArticles=window.__zkm_koap;delete window.__zkm_koap;}
		if(window.__zkm_uk){this.ukArticles=window.__zkm_uk;delete window.__zkm_uk;}
		for(const _id of ['proc','kto','euss','euvs','zot','law_koap','law_uk']){
			const _k='__zkm_'+_id;
			if(window[_k]){const _d=this.lawDocuments.find(x=>x.id===_id);if(_d)_d.articles=window[_k];delete window[_k];}
		}
		// ─────────────────────────────────────────────────────────────
		const _style=document.createElement("style");
		_style.id="laws-helper-style";
		_style.textContent=`
/* ══ Laws Helper — Modal/Window style ══════════════════════════ */
.laws-helper{background:#141419eb;border:0.19vh solid #ffffff0d;border-radius:0.74vh;box-shadow:inset 0vh 3.89vh 4.81vh -2.96vh #f9b70133;color:#f4f1e1;display:flex;flex-direction:column;font-family:"Open Sans",var(--fallback-font);font-style:normal;height:46vh;left:50%;overflow:hidden;padding:0.37vh;position:absolute;text-transform:none;top:50%;transform:translate(-50%,-50%);width:48vw;z-index:11;}
.laws-helper__graffiti{height:0;left:0;pointer-events:none;position:absolute;top:0;width:100%;z-index:0;}
.laws-helper__pattern-wrapper{height:23.61vh;left:0;mask-image:linear-gradient(180deg,#d9d9d9,#73737300 70%);overflow:hidden;pointer-events:none;position:absolute;top:0;width:100%;}
.laws-helper__pattern{background:url(./graffiti-pattern_dark.png) 50%/cover no-repeat;height:71.94vh;opacity:0.05;transform:rotate(148deg) scale3d(-1,1,1);width:115.65vh;}
.laws-helper__header{align-items:center;background:transparent;border-bottom:0.19vh solid #f4f1e11a;display:flex;justify-content:space-between;padding:1.2vh 1.67vh;position:relative;z-index:1;}
.laws-helper__title{align-items:baseline;display:flex;font-family:"Open Sans Condensed","Open Sans",var(--fallback-font);font-style:italic;font-weight:700;gap:0.56vh;text-transform:uppercase;}
.laws-helper__title-main{color:#f4f1e1;font-size:2.59vh;letter-spacing:0.1vh;line-height:normal;}
.laws-helper__title-sub{color:#f9b701;font-size:2.59vh;letter-spacing:0.1vh;line-height:normal;}
.laws-helper__title-version{color:#f4f1e166;font-family:"Open Sans",var(--fallback-font);font-size:1.2vh;font-style:normal;font-weight:400;margin-left:0.74vh;text-transform:none;}
.laws-helper__tabs{display:flex;gap:0.37vh;}
.laws-helper__tab{background:transparent;border-bottom:0.19vh solid transparent;color:#f4f1e166;cursor:pointer;font-family:"Open Sans",var(--fallback-font);font-size:1.3vh;font-style:normal;font-weight:700;letter-spacing:0.07vh;padding:0.74vh 1.3vh;text-transform:none;transition:all 0.15s ease;}
@media (platform:pc){.laws-helper__tab:hover{color:#f4f1e1cc;}}
.laws-helper__tab_active{border-bottom:0.19vh solid #f9b701;color:#f9b701;}
.laws-helper__header-right{align-items:center;display:flex;gap:0.74vh;margin-left:1.48vh;}
.laws-helper__icon-btn{align-items:center;background:#ffffff0d;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;box-shadow:inset 0vh 0.93vh 1.48vh 0vh #ffffff0d;color:#f4f1e199;cursor:pointer;display:flex;flex-direction:column;font-family:"Open Sans",var(--fallback-font);font-size:1.3vh;font-style:normal;font-weight:700;gap:0.28vh;height:3.15vh;justify-content:center;transition:all 0.15s ease;width:3.15vh;}
@media (platform:pc){.laws-helper__icon-btn:hover{background:#ffffff1a;color:#f4f1e1;}}
.laws-helper__close-btn{font-size:1.48vh;font-weight:700;letter-spacing:0;}
@media (platform:pc){.laws-helper__close-btn:hover{background:#e25544;border-color:#e25544;color:#fff;}}
.laws-helper__search{align-items:center;background:#ffffff05;border-bottom:0.19vh solid #f4f1e11a;display:flex;gap:0.93vh;padding:0.93vh 1.67vh;position:relative;z-index:1;}
.laws-helper__search-icon{align-items:center;display:flex;flex-shrink:0;height:1.67vh;justify-content:center;width:1.67vh;}
.laws-helper__search-icon svg{height:100%;width:100%;}
.laws-helper__search input{-webkit-appearance:none;background:transparent;border:none;color:#f4f1e1;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;font-weight:600;outline:none;}
.laws-helper__search input::placeholder{color:#f4f1e166;font-weight:400;}
.laws-helper__body{display:flex;flex:1 1 auto;overflow:hidden;position:relative;z-index:1;}
.laws-helper__content{color:#f4f1e1cc;flex:1 1 auto;font-size:1.67vh;font-weight:600;line-height:2.78vh;overflow-y:scroll;padding:1.85vh 2.22vh;width:100%;}
.laws-helper__content::-webkit-scrollbar{width:1.11vh;}
.laws-helper__content::-webkit-scrollbar-track{background:#ffffff1a;border-radius:0.19vh;}
.laws-helper__content::-webkit-scrollbar-thumb{background:linear-gradient(0deg,#bcbcbd,#fff 75%);border-radius:0.19vh;}
.laws-helper__placeholder{color:#f4f1e166;font-size:1.48vh;font-style:italic;font-weight:400;margin-top:2.96vh;text-align:center;}
.laws-helper__wanted-layout{display:flex;flex:1 1 auto;overflow:hidden;width:100%;}
.laws-helper__laws-list{border-right:0.19vh solid #f4f1e11a;display:flex;flex-direction:column;flex:1 1 auto;overflow-y:scroll;}
.laws-helper__laws-list::-webkit-scrollbar{width:1.11vh;}
.laws-helper__laws-list::-webkit-scrollbar-track{background:#ffffff1a;border-radius:0.19vh;}
.laws-helper__laws-list::-webkit-scrollbar-thumb{background:linear-gradient(0deg,#bcbcbd,#fff 75%);border-radius:0.19vh;}
.laws-helper__article-row{align-items:flex-start;background:#ffffff0d;border:0.19vh solid;border-color:transparent transparent #f4f1e11a;border-radius:0.37vh;box-shadow:inset 0vh 0.93vh 1.48vh 0vh #ffffff0d;cursor:pointer;display:flex;gap:1.11vh;margin:0.37vh 0.74vh;padding:1.11vh;transition:background 0.15s ease;}
.laws-helper__article-row:first-child{margin-top:0.74vh;}
@media (platform:pc){.laws-helper__article-row:hover{background:#ffffff14;}}
.laws-helper__article-row_checked{background:#f9b70133;border-color:#f9b701;box-shadow:inset 0vh 0.93vh 1.48vh 0vh #ffffff0d;}
.laws-helper__article-check{flex-shrink:0;margin-top:0.19vh;padding-top:0.1vh;}
.laws-helper__checkbox{align-items:center;background:transparent;border:0.15vh solid #f4f1e133;border-radius:0.22vh;display:flex;height:1.48vh;justify-content:center;overflow:hidden;transition:all 0.12s ease;width:1.48vh;}
.laws-helper__checkbox_checked{background:#f9b701;border-color:#f9b701;}
.laws-helper__checkbox-svg{align-items:center;display:flex;height:100%;justify-content:center;width:100%;}
.laws-helper__checkbox-svg svg{height:0.93vh;width:0.93vh;}
.laws-helper__article-num{color:#f4f1e166;flex-shrink:0;font-size:1.3vh;font-weight:600;margin-top:0.09vh;min-width:3.5vh;}
.laws-helper__article-type{border-radius:0.22vh;flex-shrink:0;font-size:1.11vh;font-weight:700;letter-spacing:0.04vh;margin-top:0.15vh;padding:0.19vh 0.56vh;}
.laws-helper__article-type_ук{background:rgba(226,85,68,.13);color:#e25544;}
.laws-helper__article-type_коап{background:rgba(249,183,1,.13);color:#f9b701;}
.laws-helper__article-type_дпс{background:rgba(10,153,71,.13);color:#0a9947;}
.laws-helper__article-type_ппс{background:rgba(249,183,1,.1);color:#f9b701cc;}
.laws-helper__article-info{flex:1 1 auto;}
.laws-helper__article-title{color:#f4f1e1cc;font-size:1.3vh;font-weight:600;line-height:1.4;}
.laws-helper__article-note{color:#f4f1e199;font-size:1.2vh;line-height:1.4;margin-top:0.28vh;}
.laws-helper__article-term{color:#f4f1e166;flex-shrink:0;font-size:1.2vh;font-weight:600;margin-top:0.09vh;white-space:nowrap;}
.laws-helper__article-revoke-badge{background:rgba(226,85,68,.15);border-radius:0.22vh;color:#e25544;flex-shrink:0;font-size:1.02vh;font-weight:700;letter-spacing:0.02vh;margin-top:0.15vh;padding:0.19vh 0.46vh;white-space:nowrap;}
.laws-helper__wanted-panel{background:#141419;border-left:0.19vh solid #f4f1e11a;display:flex;flex-direction:column;flex-shrink:0;padding:1.48vh 1.67vh;width:22vh;}
.laws-helper__wanted-title{color:#f4f1e1cc;font-family:"Open Sans Condensed","Open Sans",var(--fallback-font);font-size:1.3vh;font-style:italic;font-weight:700;letter-spacing:0.09vh;margin-bottom:0.56vh;text-transform:uppercase;}
.laws-helper__wanted-title-line{background:#e25544;border-radius:0.19vh;height:0.19vh;margin-bottom:1.11vh;width:100%;}
.laws-helper__fine-title-line{background:#0a9947!important;}
.laws-helper__wanted-empty{align-items:center;display:flex;flex-direction:column;flex:1 1 auto;gap:0.74vh;justify-content:flex-start;padding-top:1.85vh;}
.laws-helper__wanted-star-icon{align-items:center;display:flex;justify-content:center;}
.laws-helper__wanted-star-icon svg{height:3.7vh;width:3.7vh;}
.laws-helper__wanted-empty-text{display:flex;flex-direction:column;gap:0.19vh;text-align:center;}
.laws-helper__wanted-empty-text span{color:#f4f1e166;font-size:1.11vh;line-height:1.5;}
.laws-helper__wanted-selected-list{display:flex;flex:1 1 auto;flex-direction:column;gap:0.37vh;margin-bottom:0.74vh;overflow-y:auto;}
.laws-helper__wanted-selected-list::-webkit-scrollbar{width:0.28vh;}
.laws-helper__wanted-selected-list::-webkit-scrollbar-thumb{background:#f4f1e11a;border-radius:0.19vh;}
.laws-helper__wanted-sel-item{align-items:center;border-bottom:0.09vh solid #f4f1e10d;display:flex;gap:0.56vh;padding:0.37vh 0;}
.laws-helper__wanted-sel-num{color:#f9b701;font-size:1.11vh;font-weight:700;}
.laws-helper__wanted-sel-title{color:#f4f1e1cc;flex:1 1 auto;font-size:1.11vh;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.laws-helper__wanted-sel-term{color:#f4f1e166;font-size:1.11vh;font-weight:600;white-space:nowrap;}
.laws-helper__fine-sel-amount{color:#0a9947;font-size:1.11vh;font-weight:600;white-space:nowrap;}
.laws-helper__wanted-stars-row{align-items:baseline;display:flex;gap:0.56vh;justify-content:space-between;margin-top:auto;padding-top:1.11vh;}
.laws-helper__wanted-stars-label{color:#f4f1e166;font-size:1.11vh;font-weight:600;letter-spacing:0.04vh;}
.laws-helper__wanted-stars-value{color:#f9b701;font-size:1.67vh;font-weight:700;}
.laws-helper__wanted-stars-value_capped{color:#e25544;}
.laws-helper__fine-total{color:#0a9947;font-size:1.48vh;font-weight:700;}
.laws-helper__wanted-id-label{color:#f4f1e166;font-size:1.11vh;font-weight:700;letter-spacing:0.07vh;margin-bottom:0.56vh;margin-top:1.11vh;text-transform:uppercase;}
.laws-helper__wanted-id-input{-webkit-appearance:none;background:#ffffff0d;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;box-shadow:inset 0vh 0.93vh 1.48vh 0vh #ffffff0d;box-sizing:border-box;color:#f4f1e1;font-family:"Open Sans",Arial,sans-serif;font-size:1.3vh;font-weight:600;outline:none;padding:0.74vh 0.93vh;transition:border-color 0.15s ease;width:100%;}
.laws-helper__wanted-id-input::placeholder{color:#f4f1e166;font-weight:400;}
.laws-helper__wanted-btns{display:flex;gap:0.56vh;margin-top:0.93vh;}
.laws-helper__wanted-btn{border:0.19vh solid;border-radius:0.37vh;cursor:pointer;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.11vh;font-weight:700;letter-spacing:0.04vh;padding:0.93vh 0.37vh;transition:opacity 0.15s ease;}
@media (platform:pc){.laws-helper__wanted-btn:hover{opacity:0.8;}}
.laws-helper__wanted-btn_clear{background:#ffffff0d;border-color:#f4f1e11a;color:#f4f1e1cc;}
.laws-helper__wanted-btn_issue{background:rgba(226,85,68,.15);border-color:rgba(226,85,68,.5);color:#e25544;}
@media (platform:pc){.laws-helper__wanted-btn_issue:hover{background:rgba(226,85,68,.25);opacity:1;}}
.laws-helper__fine-btn_issue{background:rgba(10,153,71,.15);border:0.19vh solid rgba(10,153,71,.5);border-radius:0.37vh;color:#0a9947;cursor:pointer;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.11vh;font-weight:700;letter-spacing:0.04vh;padding:0.93vh 0.37vh;transition:opacity 0.15s ease;}
@media (platform:pc){.laws-helper__fine-btn_issue:hover{background:rgba(10,153,71,.25);opacity:1;}}
.laws-helper__fine-filter{align-items:center;background:#141419;border-bottom:0.19vh solid #f4f1e11a;display:flex;flex-shrink:0;gap:0.46vh;padding:0.74vh 1.11vh;}
.laws-helper__fine-filter-btn{background:transparent;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e166;cursor:pointer;font-family:"Open Sans",var(--fallback-font);font-size:1.2vh;font-weight:700;padding:0.37vh 0.93vh;transition:all 0.12s ease;}
@media (platform:pc){.laws-helper__fine-filter-btn:hover{border-color:#f4f1e133;color:#f4f1e1cc;}}
.laws-helper__fine-filter-btn_active{border-color:#f4f1e133;color:#f4f1e1;}
.laws-helper__fine-filter-btn_dps.laws-helper__fine-filter-btn_active{background:rgba(10,153,71,.1);border-color:rgba(10,153,71,.4);color:#0a9947;}
.laws-helper__fine-filter-btn_pps.laws-helper__fine-filter-btn_active{background:rgba(249,183,1,.1);border-color:rgba(249,183,1,.4);color:#f9b701;}
.laws-helper__fine-revoke{align-items:center;border:0.15vh solid #f4f1e11a;border-radius:0.37vh;cursor:pointer;display:flex;gap:0.56vh;margin-top:0.93vh;padding:0.74vh 0.93vh;transition:all 0.12s ease;}
@media (platform:pc){.laws-helper__fine-revoke:not(.laws-helper__fine-revoke_disabled):hover{border-color:#f4f1e133;}}
.laws-helper__fine-revoke_active{background:rgba(226,85,68,.12);border-color:rgba(226,85,68,.5);}
.laws-helper__fine-revoke_disabled{cursor:not-allowed;opacity:0.4;}
.laws-helper__fine-revoke .laws-helper__checkbox_checked{background:#e25544;border-color:#e25544;}
.laws-helper__fine-revoke-label{color:#f4f1e1cc;font-size:1.11vh;font-weight:700;letter-spacing:0.02vh;text-transform:uppercase;}
.laws-helper__fine-revoke_active .laws-helper__fine-revoke-label{color:#e25544;}

/* ══ ЗАКОНЫ: дерево + читалка ═══════════════════════════════════ */
.laws-helper__laws-layout{display:flex;flex:1 1 auto;min-height:0;overflow:hidden;}
.laws-helper__tree{border-right:0.19vh solid #f4f1e11a;flex:0 0 38%;max-width:38%;overflow-y:auto;padding:0.74vh 0;}
.laws-helper__tree::-webkit-scrollbar{width:0.56vh;}
.laws-helper__tree::-webkit-scrollbar-thumb{background:#f4f1e11a;border-radius:0.28vh;}
.laws-helper__tree-doc{border-bottom:0.09vh solid #f4f1e10d;}
.laws-helper__tree-doc-row{align-items:center;cursor:pointer;display:flex;gap:0.56vh;padding:0.93vh 1.11vh;transition:background 0.12s ease;}
@media (platform:pc){.laws-helper__tree-doc-row:hover{background:#f4f1e108;}}
.laws-helper__tree-doc-row_open{background:#f9b7010d;}
.laws-helper__tree-chevron{align-items:center;display:flex;flex-shrink:0;height:1.48vh;justify-content:center;transform:rotate(0deg);transition:transform 0.15s ease;width:1.48vh;}
.laws-helper__tree-chevron_open{transform:rotate(90deg);}
.laws-helper__tree-doc-icon{align-items:center;display:flex;flex-shrink:0;}
.laws-helper__tree-doc-title{color:#f4f1e1;font-family:"Open Sans",var(--fallback-font);font-size:1.2vh;font-weight:700;letter-spacing:0.02vh;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.laws-helper__tree-articles{display:flex;flex-direction:column;padding-bottom:0.37vh;}
.laws-helper__tree-article{align-items:baseline;cursor:pointer;display:flex;gap:0.56vh;padding:0.65vh 1.11vh 0.65vh 3.15vh;transition:background 0.12s ease;}
@media (platform:pc){.laws-helper__tree-article:hover{background:#f4f1e108;}}
.laws-helper__tree-article_active{background:rgba(249,183,1,.1);box-shadow:inset 0.28vh 0 0 0 #f9b701;}
.laws-helper__tree-article-num{color:#f9b701cc;flex-shrink:0;font-family:"Open Sans",var(--fallback-font);font-size:1.02vh;font-weight:700;}
.laws-helper__tree-article_active .laws-helper__tree-article-num{color:#f9b701;}
.laws-helper__tree-article-title{color:#f4f1e1a8;font-family:"Open Sans",var(--fallback-font);font-size:1.02vh;line-height:1.4;}
.laws-helper__tree-article_active .laws-helper__tree-article-title{color:#f4f1e1e8;}
.laws-helper__reader{flex:1 1 auto;min-height:0;overflow-y:auto;padding:1.85vh 2.22vh;}
.laws-helper__reader::-webkit-scrollbar{width:0.56vh;}
.laws-helper__reader::-webkit-scrollbar-thumb{background:#f4f1e11a;border-radius:0.28vh;}
.laws-helper__reader-doc-label{color:#f9b701;font-family:"Open Sans",var(--fallback-font);font-size:1.02vh;font-weight:700;letter-spacing:0.09vh;text-transform:uppercase;}
.laws-helper__reader-title{color:#f4f1e1;font-family:"Open Sans",var(--fallback-font);font-size:1.57vh;font-weight:700;line-height:1.4;margin-top:0.56vh;}
.laws-helper__reader-num{color:#f4f1e1cc;}
.laws-helper__reader-divider{background:#f4f1e11a;height:0.09vh;margin:1.11vh 0;width:100%;}
.laws-helper__reader-text{color:#f4f1e1cc;font-family:"Open Sans",var(--fallback-font);font-size:1.2vh;line-height:1.7;white-space:pre-wrap;}
.laws-helper__reader-empty-text{color:#f4f1e166;font-family:"Open Sans",var(--fallback-font);font-size:1.11vh;font-style:italic;}
.laws-helper__reader-empty{align-items:center;display:flex;flex-direction:column;gap:1.11vh;height:100%;justify-content:center;opacity:0.6;}
.laws-helper__reader-empty-icon{opacity:0.5;}
.laws-helper__reader-empty-text-block{color:#f4f1e166;display:flex;flex-direction:column;font-family:"Open Sans",var(--fallback-font);font-size:1.11vh;line-height:1.5;text-align:center;}

/* ══ ЗАКОНЫ flat list (просто текст, без блоков по документам) ══ */
.laws-helper__laws-flat{border-right:0.19vh solid #f4f1e11a;flex:0 0 40%!important;max-width:40%!important;}
/* ── Бейдж документа в строке статьи (КоАП/УК/ЕУСС и т.д.) ──── */
.laws-helper__article-doc-tag{border-radius:0.22vh;flex-shrink:0;font-family:"Open Sans",var(--fallback-font);font-size:1.02vh;font-weight:700;letter-spacing:0.02vh;margin-top:0.15vh;padding:0.19vh 0.56vh;text-transform:uppercase;white-space:nowrap;}
.laws-helper__article-doc-tag_koap{background:rgba(10,153,71,.15);color:#0a9947;}
.laws-helper__article-doc-tag_uk{background:rgba(226,85,68,.15);color:#e25544;}
.laws-helper__article-doc-tag_proc{background:rgba(100,149,237,.15);color:#6495ed;}
.laws-helper__article-doc-tag_kto{background:rgba(255,140,0,.15);color:#ff8c00;}
.laws-helper__article-doc-tag_euss{background:rgba(153,50,204,.15);color:#9932cc;}
.laws-helper__article-doc-tag_zot{background:rgba(217,164,6,.15);color:#d9a406;}
.laws-helper__article-doc-tag_euvs{background:rgba(43,168,160,.15);color:#2ba8a0;}
/* ── Фильтр документов в строке поиска (справа от инпута) ───── */
.laws-helper__search-filters{display:flex;flex-shrink:0;gap:0.37vh;overflow-x:auto;scrollbar-width:none;}
.laws-helper__search-filters::-webkit-scrollbar{display:none;}
/* ── Цвета кнопок фильтра документов ────────────────────────── */
.laws-helper__law-filter-btn_koap.laws-helper__fine-filter-btn_active{background:rgba(10,153,71,.1);border-color:rgba(10,153,71,.4);color:#0a9947;}
.laws-helper__law-filter-btn_uk.laws-helper__fine-filter-btn_active{background:rgba(226,85,68,.1);border-color:rgba(226,85,68,.4);color:#e25544;}
.laws-helper__law-filter-btn_proc.laws-helper__fine-filter-btn_active{background:rgba(100,149,237,.1);border-color:rgba(100,149,237,.4);color:#6495ed;}
.laws-helper__law-filter-btn_kto.laws-helper__fine-filter-btn_active{background:rgba(255,140,0,.1);border-color:rgba(255,140,0,.4);color:#ff8c00;}
.laws-helper__law-filter-btn_euss.laws-helper__fine-filter-btn_active{background:rgba(153,50,204,.1);border-color:rgba(153,50,204,.4);color:#9932cc;}
.laws-helper__law-filter-btn_zot.laws-helper__fine-filter-btn_active{background:rgba(217,164,6,.1);border-color:rgba(217,164,6,.4);color:#d9a406;}
.laws-helper__law-filter-btn_euvs.laws-helper__fine-filter-btn_active{background:rgba(43,168,160,.1);border-color:rgba(43,168,160,.4);color:#2ba8a0;}
`
		document.head.appendChild(_style);
		// ── Режим открытия: 'wanted' | 'fine' | null ────────────────
		const openMode=window._duranOpenMode||null;
		window._duranOpenMode=null; // потребляем — не оставляем для следующего открытия
		this.mode=openMode;
		if(openMode==="fine"){
			// Открыт через штраф — показываем только ШТРАФЫ, индекс 0 в visibleTabs
			this.currentTab=0;
			if(window._duranFineTargetId&&window._duranFineTargetId!==-1){
				this.fineId=String(window._duranFineTargetId);
			}
		} else if(openMode==="wanted"){
			// Открыт через розыск — показываем только РОЗЫСК, индекс 0 в visibleTabs
			this.currentTab=0;
			if(window._duranWantedTargetId&&window._duranWantedTargetId!==-1){
				this.wantedId=String(window._duranWantedTargetId);
			}
		} else if(openMode==="laws"){
			// Открыт через пункт меню «Законы» — показываем только ЗАКОНЫ, индекс 0 в visibleTabs
			this.currentTab=0;
		} else {
			// Открыт без режима (все табы) — дефолт на РОЗЫСК (индекс 2)
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

		// showInterface → setCursorStatus(true) → setDrawLabelStatus(false) скрыл метки;
		// восстанавливаем явно, чтобы ники над игроками оставались видны
		if(!window.App?.developmentMode) window.setDrawLabelStatus(true);

		// Автофокус на поле поиска — можно сразу печатать при открытии окна
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
		// Ищем инпут поиска внутри корня компонента и ставим фокус
		focusSearchInput(){
			const inp=this.$el?.querySelector?.(".laws-helper__search input");
			if(inp)inp.focus();
		},
		// ── ЗАКОНЫ ──────────────────────────────────────────────────
		toggleDoc(id){
			const idx=this.expandedDocs.indexOf(id);
			if(idx===-1)this.expandedDocs.push(id);
			else this.expandedDocs.splice(idx,1)
		},
		selectLawArticle(id){this.selectedLawArticleId=id},
		// ── РОЗЫСК ──────────────────────────────────────────────────
		toggleArticle(id){
			const idx=this.selectedArticles.indexOf(id);
			if(idx===-1)this.selectedArticles.push(id);
			else this.selectedArticles.splice(idx,1)
		},
		clearWanted(){this.selectedArticles=[];this.wantedId="";window._duranWantedTargetId=null},
		issueWanted(){
			const id=this.wantedId.trim();
			if(!id||this.selectedArticles.length===0)return;
			// Срок розыска ограничен максимум 6 годами, но причина (статьи)
			// в /su всегда указывает ВСЕ выбранные статьи целиком
			const totalStars=this.cappedTerm;
			const lastCode=this.selectedArticleObjects.map(a=>a.num+" УК").join(", ");
			if(window._mvdSetLastWantedCode)window._mvdSetLastWantedCode(lastCode);
			// ── Сохраняем данные розыска в глобал — mvdF.js отправит цитирование ТОЛЬКО
			//    при успешном подтверждении сервером ("объявил в розыск" в чате) ──
			window._mvdLastWantedArts = this.selectedArticleObjects.map(a=>({num:a.num, title:a.title, term:a.term}));
			const cmd=`/su ${id} ${totalStars}`;
			if(typeof window.sendChatInput==="function")window.sendChatInput(cmd);
			else if(typeof window.sendChatMessage==="function")window.sendChatMessage(cmd);
			this.close()
		},
		// ── ШТРАФЫ ──────────────────────────────────────────────────
		toggleFineArticle(id){
			const idx=this.selectedFineArticles.indexOf(id);
			if(idx===-1)this.selectedFineArticles.push(id);
			else this.selectedFineArticles.splice(idx,1);
			// Если среди оставшихся выбранных статей больше нет ни одной,
			// разрешающей изъятие ВУ — снимаем галочку автоматически
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
			// Суммируем штрафы и перечисляем статьи через запятую — одна команда как в розыске
			const totalFine=this.totalFine;
			const codes=arts.map(a=>a.num).join(", ");
			const cmd=`/ticket ${id} ${totalFine} ${codes} КоАП`;
			if(typeof window.sendChatInput==="function")window.sendChatInput(cmd);
			else if(typeof window.sendChatMessage==="function")window.sendChatMessage(cmd);
			// ── Сохраняем данные штрафа в глобал — mvdF.js отправит разъяснение ТОЛЬКО
			//    при успешном подтверждении сервером ("выписал штраф" в чате) ──
			window._mvdLastFineArts = arts.map(a=>({num:a.num, title:a.title, fine:a.fine}));
			window._mvdLastFineTotal = totalFine;
			// Если отмечена галочка изъятия — небольшая задержка после команды штрафа
			if(withRevoke){
				// В причину изъятия идут ТОЛЬКО статьи, которые реально дают основание для изъятия (revoke===true),
				// а не все выбранные статьи штрафа
				const revokeCodes=arts.filter(a=>a.revoke===true).map(a=>a.num).join(", ");
				setTimeout(()=>{
					// Передаём статьи КоАП как причину изъятия — авто-подстановка в серверный диалог /takelic
					if(typeof window._mvdSetTakeLicReason==="function")window._mvdSetTakeLicReason(revokeCodes+" КоАП");
					// НЕ вызываем _mvdExecuteAction здесь — /takelic запустится из mvdF.js
					// ПОСЛЕ подтверждения штрафа в чате (диалог закрыт)
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
