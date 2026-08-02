import{r as resolveComponent,o as openBlock,c as createElementBlock,b as createVNode,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,e as createTextVNode,t as toDisplayString,f as createCommentVNode,w as withCtx,T as Transition,_ as _export_sfc}from"./index.js";

// Базовый путь до данных на GitHub — тот же репозиторий, что и у загрузчика zkm.js
const _GH_BASE_LAWS = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/' + encodeURIComponent('Кастом Интерфейсы') + '/';

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
						$data.lawsLoading
							? (openBlock(), createElementBlock("div", {key:"loading", class:"laws-helper__reader-empty-text"}, "Загрузка законов..."))
							: $data.lawsLoadError
								? (openBlock(), createElementBlock("div", {key:"error", class:"laws-helper__reader-empty-text"}, "Не удалось загрузить законы. Проверьте соединение."))
								: $options.flatLawArticles.length === 0
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
						$data.articlesLoading
							? (openBlock(), createElementBlock("div", {key:"loading", class:"laws-helper__reader-empty-text"}, "Загрузка статей..."))
							: $data.articlesLoadError
								? (openBlock(), createElementBlock("div", {key:"error", class:"laws-helper__reader-empty-text"}, "Не удалось загрузить статьи. Проверьте соединение."))
								: (openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredArticles, (art) => (
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
						$data.articlesLoading
							? (openBlock(), createElementBlock("div", {key:"loading", class:"laws-helper__reader-empty-text"}, "Загрузка статей..."))
							: $data.articlesLoadError
								? (openBlock(), createElementBlock("div", {key:"error", class:"laws-helper__reader-empty-text"}, "Не удалось загрузить статьи. Проверьте соединение."))
								: (openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredKoapArticles, (art) => (
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
//  Статьи КоАП (штрафы) и УК (розыск) — тоже больше НЕ хранятся здесь,
//  грузятся асинхронно из articles.json (см. loadFineWantedArticles()
//  и mounted()), в data() лежат как реактивные this.koapArticles /
//  this.ukArticles, чтобы Vue видел изменение и перерисовал списки.
// ══════════════════════════════════════════════════════════════════
const ARTICLES_JSON_URL = _GH_BASE_LAWS + 'articles.json';
let _articlesLoadPromise = null;
function loadFineWantedArticles(){
	if (_articlesLoadPromise) return _articlesLoadPromise;
	_articlesLoadPromise = (async () => {
		let raw = window.__prefetch_zkm_articles;
		if (!raw && window.__prefetch_zkm_articles_promise) {
			try { await window.__prefetch_zkm_articles_promise; raw = window.__prefetch_zkm_articles; }
			catch (e) { /* игнор — попробуем XHR ниже */ }
		}
		if (!raw) raw = await _xhrGetLaws(ARTICLES_JSON_URL, 0);
		return JSON.parse(raw); // { koap: [...], uk: [...] }
	})();
	return _articlesLoadPromise;
}


// ══════════════════════════════════════════════════════════════════
//  Тексты законов (КоАП, УК и т.д.) больше НЕ хранятся в этом файле —
//  они грузятся асинхронно из laws.json (см. loadLawDocuments() и
//  mounted()). Это сделано, чтобы не раздувать zkm.js текстом статей.
// ══════════════════════════════════════════════════════════════════
const LAWS_JSON_URL = _GH_BASE_LAWS + 'laws.json';
let LAW_DOCUMENTS = [];

// Кэшируем промис загрузки между открытиями окна за сессию,
// чтобы не дёргать сеть повторно при каждом открытии /laws
let _lawsLoadPromise = null;
function loadLawDocuments(){
	if (_lawsLoadPromise) return _lawsLoadPromise;
	_lawsLoadPromise = (async () => {
		// 1) пробуем то, что уже успел прогрузить префетчер загрузчика (zkm.js-загрузчик)
		let raw = window.__prefetch_zkm_laws;
		if (!raw && window.__prefetch_zkm_laws_promise) {
			try { await window.__prefetch_zkm_laws_promise; raw = window.__prefetch_zkm_laws; }
			catch (e) { /* игнор — попробуем XHR ниже */ }
		}
		// 2) фоллбек — тянем сами
		if (!raw) raw = await _xhrGetLaws(LAWS_JSON_URL, 0);
		LAW_DOCUMENTS = JSON.parse(raw);
		return LAW_DOCUMENTS;
	})();
	return _lawsLoadPromise;
}

function _xhrGetLaws(url, attempt){
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url + '?_=' + Date.now(), true);
		xhr.onload = function(){
			if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
			else if (attempt < 8) setTimeout(function(){ _xhrGetLaws(url, attempt+1).then(resolve, reject); }, Math.min(1000*Math.pow(2, attempt), 16000));
			else reject(new Error('HTTP ' + xhr.status));
		};
		xhr.onerror = function(){
			if (attempt < 8) setTimeout(function(){ _xhrGetLaws(url, attempt+1).then(resolve, reject); }, Math.min(1000*Math.pow(2, attempt), 16000));
			else reject(new Error('Network'));
		};
		xhr.send();
	});
}


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
			ukArticles:[],        // грузится асинхронно из articles.json
			// ── ШТРАФЫ ───────────────────────────────────────────────
			fineId:"",
			fineKoapType:"all", // 'all' | 'ДПС' | 'ППС'
			selectedFineArticles:[],
			fineWithRevoke:false, // чекбокс "с изъятием вод. удостоверения"
			koapArticles:[],      // грузится асинхронно из articles.json
			articlesLoading:true,
			articlesLoadError:false,
			// ── ЗАКОНЫ: дерево документов (грузится асинхронно из laws.json) ──
			lawDocuments:[],
			lawsLoading:true,
			lawsLoadError:false,
			lawDocType:"all", // 'all' | doc.id (koap | uk | proc | kto | euss | zot | euvs)
			expandedDocs:[], // раскрывается на первый документ после загрузки
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
		// Стили теперь не встраиваются здесь — их подключает загрузчик zkm.js
		// (см. "zkm (загрузчик).js": _xhrGet(... 'zkm.css') → <style id="zkm-style-remote">).
		// Раньше тут был полный дубль этого CSS в виде текстового литерала — вынесли в zkm.css.

		// ── Асинхронная загрузка текстов законов (КоАП/УК/...) из laws.json ──
		loadLawDocuments().then(docs => {
			this.lawDocuments = docs;
			this.expandedDocs = [docs[0]?.id].filter(Boolean);
			this.lawsLoading = false;
		}).catch(e => {
			console.error('[zkm] не удалось загрузить laws.json:', e);
			this.lawsLoading = false;
			this.lawsLoadError = true;
		});

		// ── Асинхронная загрузка статей КоАП (штрафы) и УК (розыск) из articles.json ──
		loadFineWantedArticles().then(({koap, uk}) => {
			this.koapArticles = koap;
			this.ukArticles = uk;
			this.articlesLoading = false;
		}).catch(e => {
			console.error('[zkm] не удалось загрузить articles.json:', e);
			this.articlesLoading = false;
			this.articlesLoadError = true;
		});
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
				// Сохраняем для цитирования в mvdF.js — строка «Аннулирование ВУ по: ...»
				window._mvdLastFineRevokeCodes = revokeCodes ? revokeCodes + " КоАП" : null;
				setTimeout(()=>{
					// Передаём статьи КоАП как причину изъятия — авто-подстановка в серверный диалог /takelic
					if(typeof window._mvdSetTakeLicReason==="function")window._mvdSetTakeLicReason(revokeCodes+" КоАП");
					// НЕ вызываем _mvdExecuteAction здесь — /takelic запустится из mvdF.js
					// ПОСЛЕ подтверждения штрафа в чате (диалог закрыт)
					window._mvdPendingTakeLicId = id;
					console.log("[ZKM] _mvdPendingTakeLicId = "+id+" — ждём подтверждения штрафа");
				},100);
			} else {
				// Лишение не включено — очищаем, чтобы цитата не добавляла строку ВУ
				window._mvdLastFineRevokeCodes = null;
			}
			this.close()
		},
		close(){window.closeInterface("Zkm")}
	}
};

const Zkm=_export_sfc(_sfc_main,[["render",render]]);
export{Zkm as default};
