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
				_cache[2] || (_cache[2] = createBaseVNode("span", {class:"laws-helper__title-sub"}, "AHK MVD", -1)),
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
			}, null, 40, ["value","onInput","placeholder"])
		]),
		createBaseVNode("div", _hoisted_8, [
			// ─── ТАБ: ЗАКОНЫ ──────────────────────────────────────────────
			currentTabKey === "laws"
				? (openBlock(), createElementBlock("div", {key:"laws", class:"laws-helper__laws-layout"}, [
					createBaseVNode("div", {class:"laws-helper__tree"}, [
						(openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredLawDocuments, (doc) => (
							openBlock(), createElementBlock("div", {key:doc.id, class:"laws-helper__tree-doc"}, [
								createBaseVNode("div", {
									class: normalizeClass(["laws-helper__tree-doc-row", {"laws-helper__tree-doc-row_open": $data.expandedDocs.includes(doc.id)}]),
									onClick: $event => $options.toggleDoc(doc.id)
								}, [
									createBaseVNode("span", {
										class: normalizeClass(["laws-helper__tree-chevron", {"laws-helper__tree-chevron_open": $data.expandedDocs.includes(doc.id)}]),
										innerHTML: SVG_CHEVRON
									}, null, 2),
									createBaseVNode("span", {class:"laws-helper__tree-doc-icon", innerHTML: SVG_DOC}),
									createBaseVNode("span", {class:"laws-helper__tree-doc-title"}, toDisplayString(doc.title), 1)
								], 10, ["onClick"]),
								$data.expandedDocs.includes(doc.id)
									? (openBlock(), createElementBlock("div", {key:"arts", class:"laws-helper__tree-articles"}, [
										(openBlock(true), createElementBlock(Fragment, null, renderList(doc.articles, (art) => (
											openBlock(), createElementBlock("div", {
												key: art.id,
												class: normalizeClass(["laws-helper__tree-article", {"laws-helper__tree-article_active": $data.selectedLawArticleId === art.id}]),
												onClick: $event => $options.selectLawArticle(art.id)
											}, [
												createBaseVNode("span", {class:"laws-helper__tree-article-num"}, toDisplayString(art.num), 1),
												createBaseVNode("span", {class:"laws-helper__tree-article-title"}, toDisplayString(art.title), 1)
											], 10, ["onClick"])
										)), 128))
									]))
									: createCommentVNode("", true)
							])
						)), 128))
					]),
					createBaseVNode("div", {class:"laws-helper__reader"}, [
						$options.selectedLawArticle
							? (openBlock(), createElementBlock("div", {key:"article", class:"laws-helper__reader-content"}, [
								createBaseVNode("div", {class:"laws-helper__reader-doc-label"}, toDisplayString($options.selectedLawArticle.docTitle), 1),
								createBaseVNode("div", {class:"laws-helper__reader-title"}, [
									createBaseVNode("span", {class:"laws-helper__reader-num"}, "Ст. " + toDisplayString($options.selectedLawArticle.num), 1),
									createTextVNode(" " + toDisplayString($options.selectedLawArticle.title))
								]),
								createBaseVNode("div", {class:"laws-helper__reader-divider"}),
								$options.selectedLawArticle.text
									? (openBlock(), createElementBlock("div", {key:"text", class:"laws-helper__reader-text", innerHTML: $options.selectedLawArticle.text}))
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
							createBaseVNode("span", {class:"laws-helper__wanted-stars-value"}, toDisplayString($options.totalTerm) + " лет", 1)
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
//  КоАП статьи — ШТРАФЫ (ДПС + ППС)
// ══════════════════════════════════════════════════════════════════
const KOAP_ARTICLES=[
	// ── ДПС ──────────────────────────────────────────────────────
	{id:"dps-1.1",    num:"1.1",    type:"ДПС", title:"Управление т/с без регистрационного знака",                        note:"Искл: разрешено без номеров если пробег не превысил 100 км",  fine:5000},
	{id:"dps-2.1",    num:"2.1",    type:"ДПС", title:"Управление т/с с неисправным двигателем (дымление)",               note:"",                                                              fine:10000},
	{id:"dps-3.1",    num:"3.1",    type:"ДПС", title:"Управление т/с в алкогольном/наркотическом опьянении",             note:"+ изъятие водительского удостоверения",                         fine:20000},
	{id:"dps-3.2",    num:"3.2",    type:"ДПС", title:"Разговор по телефону во время движения",                            note:"",                                                              fine:5500},
	{id:"dps-3.3",    num:"3.3",    type:"ДПС", title:"Нарушение правил пользования звуковыми сигналами",                 note:"использование не по назначению, троллинг",                      fine:6500},
	{id:"dps-3.4",    num:"3.4",    type:"ДПС", title:"Движение с выключенными габаритными огнями (21:00–06:00)",         note:"",                                                              fine:5000},
	{id:"dps-3.5",    num:"3.5",    type:"ДПС", title:"Нарушение ПДД пешеходом",                                          note:"Искл: сотрудник ПО при исполнении",                             fine:5000},
	{id:"dps-3.6",    num:"3.6",    type:"ДПС", title:"Управление т/с с тонировкой стекол ниже 50%",                     note:"Искл: ФСБ при исполнении",                                     fine:15000},
	{id:"dps-3.7",    num:"3.7",    type:"ДПС", title:"Движение без пристегнутого ремня или надетого шлема",              note:"",                                                              fine:5000},
	{id:"dps-3.8",    num:"3.8",    type:"ДПС", title:"Намеренное создание дорожных заторов, помех",                      note:"",                                                              fine:10000},
	{id:"dps-4.1",    num:"4.1",    type:"ДПС", title:"Пересечение ж/д пути вне переезда или при закрытом шлагбауме",    note:"+ лишение водительского удостоверения",                         fine:25000},
	{id:"dps-5.1",    num:"5.1",    type:"ДПС", title:"Разворот или движение задним ходом по автомагистрали",             note:"",                                                              fine:15000},
	{id:"dps-6.1",    num:"6.1",    type:"ДПС", title:"Проезд на красный сигнал светофора",                               note:"",                                                              fine:10000},
	{id:"dps-6.1.1",  num:"6.1.1",  type:"ДПС", title:"Проезд на жёлтый сигнал светофора",                               note:"",                                                              fine:5000},
	{id:"dps-6.1.2",  num:"6.1.2",  type:"ДПС", title:"Проезд на запрещающий сигнал + ДТП",                              note:"+ лишение ВУ",                                                 fine:20000},
	{id:"dps-7.1",    num:"7.1",    type:"ДПС", title:"Разворот/движение задним ходом в запрещённых местах",              note:"пешеходный переход, мост, ж/д переезд",                        fine:15000},
	{id:"dps-7.2",    num:"7.2",    type:"ДПС", title:"Агрессивное вождение (таран, подрезы, выезды на встречную)",       note:"+ изъятие лицензии на вождение",                               fine:20000},
	{id:"dps-7.3",    num:"7.3",    type:"ДПС", title:"Невыполнение требования уступить дорогу с преимуществом",          note:"",                                                              fine:10000},
	{id:"dps-8.1",    num:"8.1",    type:"ДПС", title:"Остановка/стоянка/парковка в неположенном месте",                  note:"+ эвакуация; с аварийкой можно стоять до 5 мин",               fine:8000},
	{id:"dps-8.2",    num:"8.2",    type:"ДПС", title:"Движение т/с по велосипедным/пешеходным дорожкам, газонам",       note:"",                                                              fine:6500},
	{id:"dps-8.3",    num:"8.3",    type:"ДПС", title:"Движение т/с по встречной полосе",                                 note:"+ изъятие лицензии на вождение",                               fine:10000},
	{id:"dps-8.3.1",  num:"8.3.1",  type:"ДПС", title:"Движение по встречной полосе + ДТП",                              note:"+ изъятие лицензии",                                           fine:20000},
	{id:"dps-9.1",    num:"9.1",    type:"ДПС", title:"Разворот/поворот через сплошную линию разметки",                   note:"",                                                              fine:12000},
	{id:"dps-9.2",    num:"9.2",    type:"ДПС", title:"Разворот/поворот через двойную сплошную",                          note:"",                                                              fine:15000},
	{id:"dps-9.3",    num:"9.3",    type:"ДПС", title:"Пересечение двойной сплошной линии",                               note:"",                                                              fine:13000},
	{id:"dps-9.4",    num:"9.4",    type:"ДПС", title:"Пересечение сплошной линии разметки",                              note:"при ДТП — также изымается лицензия",                           fine:15000},
	{id:"dps-10.1",   num:"10.1",   type:"ДПС", title:"Непредоставление преимущества маршрутному транспорту",             note:"",                                                              fine:5000},
	{id:"dps-10.2",   num:"10.2",   type:"ДПС", title:"Непредоставление преимущества спец. службам с маячком/сиреной",   note:"+ изъятие лицензии",                                           fine:15000},
	{id:"dps-10.3",   num:"10.3",   type:"ДПС", title:"Непредоставление преимущества колонне гос. служб",                note:"+ изъятие лицензии",                                           fine:20000},
	{id:"dps-10.4",   num:"10.4",   type:"ДПС", title:"Невыполнение требования уступить дорогу пешеходам/велосипедистам",note:"",                                                              fine:10000},
	{id:"dps-11.1",   num:"11.1",   type:"ДПС", title:"Виновник ДТП без вреда здоровью",                                  note:"",                                                              fine:10000},
	{id:"dps-11.1.1", num:"11.1.1", type:"ДПС", title:"Виновник ДТП с тяжким вредом здоровью/смертью",                  note:"+ изъятие лицензии на оружие",                                 fine:25000},
	{id:"dps-11.2",   num:"11.2",   type:"ДПС", title:"Оставление места ДТП",                                             note:"",                                                              fine:15000},
	{id:"dps-11.3",   num:"11.3",   type:"ДПС", title:"Создание аварийных ситуаций, провокация на ДТП, автоподставы",    note:"+ изъятие водительского удостоверения",                         fine:20000},
	{id:"dps-12.1",   num:"12.1",   type:"ДПС", title:"Превышение скорости более чем на 30 км/ч (80–90 км/ч)",           note:"",                                                              fine:5000},
	{id:"dps-12.2",   num:"12.2",   type:"ДПС", title:"Превышение скорости более чем на 50 км/ч (90–120 км/ч)",          note:"",                                                              fine:7000},
	{id:"dps-12.3",   num:"12.3",   type:"ДПС", title:"Превышение на 30+ км/ч + ДТП",                                    note:"также изымается лицензия",                                     fine:15000},
	{id:"dps-12.4",   num:"12.4",   type:"ДПС", title:"Превышение на 50+ км/ч + ДТП",                                    note:"+ изъятие водительского удостоверения + лицензия",             fine:25000},
	{id:"dps-13.1",   num:"13.1",   type:"ДПС", title:"Оскорбление гражданского лица / сотрудника гос. структур",        note:"",                                                              fine:10000},
	{id:"dps-13.1.1", num:"13.1.1", type:"ДПС", title:"Не грубое оскорбление сотрудника правоохранительных органов",     note:"",                                                              fine:10000},
	{id:"dps-13.2",   num:"13.2",   type:"ДПС", title:"Мелкое хулиганство",                                               note:"нецензурная брань, громкие крики в общественных местах",       fine:8000},
	{id:"dps-13.3",   num:"13.3",   type:"ДПС", title:"Курение в общественных местах",                                    note:"",                                                              fine:5000},
	{id:"dps-13.4",   num:"13.4",   type:"ДПС", title:"Распитие спиртных напитков в общественных местах",                note:"",                                                              fine:7000},
	{id:"dps-13.5",   num:"13.5",   type:"ДПС", title:"Громкая музыка в жилых зонах в ночное время (23:00–06:00)",       note:"",                                                              fine:4000},
	{id:"dps-13.6",   num:"13.6",   type:"ДПС", title:"Ношение отмычек или спец. приспособлений для проникновения",      note:"",                                                              fine:15000},
	// ── ППС ──────────────────────────────────────────────────────
	{id:"pps-20.1",   num:"20.1",   type:"ППС", title:"Оскорбление — унижение чести и достоинства",                       note:"",                                                              fine:5000},
	{id:"pps-20.2",   num:"20.2",   type:"ППС", title:"Дискриминация по полу, расе, национальности и т.д.",               note:"",                                                              fine:5000},
	{id:"pps-20.3",   num:"20.3",   type:"ППС", title:"Нанесение побоев или иных насильственных действий",                note:"или административный арест",                                   fine:30000},
	{id:"pps-20.4",   num:"20.4",   type:"ППС", title:"Занятие народной медициной без разрешения",                        note:"",                                                              fine:4000},
	{id:"pps-20.5",   num:"20.5",   type:"ППС", title:"Потребление наркотических средств без назначения врача",           note:"или административный арест",                                   fine:10000},
	{id:"pps-20.6",   num:"20.6",   type:"ППС", title:"Занятие проституцией",                                             note:"",                                                              fine:3000},
	{id:"pps-20.7",   num:"20.7",   type:"ППС", title:"Курение в общественных местах",                                    note:"",                                                              fine:3000},
	{id:"pps-20.8",   num:"20.8",   type:"ППС", title:"Распитие спиртных напитков в общественных местах",                note:"",                                                              fine:5000},
	{id:"pps-20.9",   num:"20.9",   type:"ППС", title:"Мелкое хулиганство",                                               note:"или административный арест",                                   fine:2000},
	{id:"pps-30.1",   num:"30.1",   type:"ППС", title:"Нарушение порядка проведения собрания/митинга/шествия",            note:"",                                                              fine:20000},
	{id:"pps-30.2",   num:"30.2",   type:"ППС", title:"Нарушение правил перевозки и транспортирования оружия",            note:"",                                                              fine:2000},
	{id:"pps-30.3",   num:"30.3",   type:"ППС", title:"Появление в общественном месте в состоянии опьянения",             note:"",                                                              fine:3000},
	{id:"pps-30.4",   num:"30.4",   type:"ППС", title:"Организация/участие в блокировании транспортных коммуникаций",     note:"",                                                              fine:100000},
	{id:"pps-40.1",   num:"40.1",   type:"ППС", title:"Подкуп избирателей",                                               note:"+ арест до 15 суток",                                         fine:120000},
	{id:"pps-40.2",   num:"40.2",   type:"ППС", title:"Агитация в день тишины",                                           note:"+ арест до 15 суток",                                         fine:200000},
];

// ══════════════════════════════════════════════════════════════════
//  УК РФ статьи — РОЗЫСК (без изменений)
// ══════════════════════════════════════════════════════════════════
const UK_ARTICLES=[
	{id:"1.1",    num:"1.1",    type:"УК", title:"Нападение на гражданское лицо без использования оружия",                          note:"", term:2},
	{id:"1.1.1",  num:"1.1.1",  type:"УК", title:"Побои",                                                                             note:"", term:1},
	{id:"1.1.2",  num:"1.1.2",  type:"УК", title:"Нападение на гражданское лицо с применением холодного оружия",                     note:"", term:3},
	{id:"1.1.3",  num:"1.1.3",  type:"УК", title:"Вооружённое нападение на гражданское лицо",                                        note:"", term:4},
	{id:"1.2",    num:"1.2",    type:"УК", title:"Причинение смерти по неосторожности без оружия",                                    note:"", term:1},
	{id:"1.2.1",  num:"1.2.1",  type:"УК", title:"Причинение смерти по неосторожности при управлении транспортом",                   note:"", term:2},
	{id:"1.3",    num:"1.3",    type:"УК", title:"Угроза причинения вреда здоровью (слова)",                                          note:"", term:1},
	{id:"1.3.1",  num:"1.3.1",  type:"УК", title:"Угроза причинения вреда здоровью с использованием оружия",                        note:"", term:2},
	{id:"1.4",    num:"1.4",    type:"УК", title:"Изнасилование",                                                                      note:"", term:2},
	{id:"1.5",    num:"1.5",    type:"УК", title:"Воспрепятствование оказанию медицинской помощи",                                    note:"", term:2},
	{id:"2.1",    num:"2.1",    type:"УК", title:"Похищение человека",                                                                 note:"", term:4},
	{id:"2.2",    num:"2.2",    type:"УК", title:"Клевета",                                                                            note:"", term:2},
	{id:"3.1",    num:"3.1",    type:"УК", title:"Кража",                                                                              note:"", term:2},
	{id:"3.1.1",  num:"3.1.1",  type:"УК", title:"Разбой",                                                                            note:"", term:3},
	{id:"3.2",    num:"3.2",    type:"УК", title:"Умышленное повреждение или порча частного имущества",                               note:"", term:2},
	{id:"3.2.1",  num:"3.2.1",  type:"УК", title:"Умышленное повреждение или порча государственного имущества",                      note:"", term:3},
	{id:"4.1",    num:"4.1",    type:"УК", title:"Террористический акт",                                                               note:"", term:6},
	{id:"4.1.1",  num:"4.1.1",  type:"УК", title:"Заведомо ложное сообщение об акте терроризма",                                     note:"", term:3},
	{id:"4.2",    num:"4.2",    type:"УК", title:"Несообщение о преступлении",                                                        note:"", term:2},
	{id:"4.3",    num:"4.3",    type:"УК", title:"Массовые беспорядки",                                                                note:"", term:5},
	{id:"4.4",    num:"4.4",    type:"УК", title:"Участие в несанкционированных митингах",                                            note:"", term:2},
	{id:"4.4.1",  num:"4.4.1",  type:"УК", title:"Организация несанкционированного митинга",                                         note:"", term:3},
	{id:"4.5",    num:"4.5",    type:"УК", title:"Ношение оружия в открытом виде",                                                    note:"", term:2},
	{id:"4.5.1",  num:"4.5.1",  type:"УК", title:"Ношение оружия в открытом виде в общественных местах",                            note:"", term:3},
	{id:"4.5.2",  num:"4.5.2",  type:"УК", title:"Ношение оружия и патронов без лицензии",                                          note:"", term:2},
	{id:"4.5.3",  num:"4.5.3",  type:"УК", title:"Ношение оружия в открытом виде без лицензии",                                     note:"", term:4},
	{id:"4.5.4",  num:"4.5.4",  type:"УК", title:"Ношение оружия в открытом виде в общественных местах без лицензии",               note:"", term:5},
	{id:"4.6",    num:"4.6",    type:"УК", title:"Незаконное приобретение/передача/изготовление оружия и боеприпасов",               note:"", term:2},
	{id:"4.7",    num:"4.7",    type:"УК", title:"Помеха проведению мероприятий гос. структур",                                       note:"", term:1},
	{id:"4.8",    num:"4.8",    type:"УК", title:"Проникновение на желтую зону",                                                      note:"", term:2},
	{id:"4.8.1",  num:"4.8.1",  type:"УК", title:"Проникновение на красную зону",                                                    note:"", term:4},
	{id:"4.8.2",  num:"4.8.2",  type:"УК", title:"Проникновение на частную территорию без разрешения",                              note:"", term:1},
	{id:"4.9",    num:"4.9",    type:"УК", title:"Соучастие в преступлении",                                                          note:"", term:3},
	{id:"5.1",    num:"5.1",    type:"УК", title:"Нападение на сотрудника гос. организации при исполнении",                          note:"", term:4},
	{id:"5.1.1",  num:"5.1.1",  type:"УК", title:"Нападение на сотрудника силовых структур при исполнении",                         note:"", term:5},
	{id:"5.1.2",  num:"5.1.2",  type:"УК", title:"Нападение на государственного деятеля при исполнении",                            note:"", term:6},
	{id:"5.2",    num:"5.2",    type:"УК", title:"Неподчинение законному требованию сотрудника ПО или МО",                           note:"", term:1},
	{id:"5.2.1",  num:"5.2.1",  type:"УК", title:"Побег от сотрудников ПО",                                                         note:"", term:2},
	{id:"5.3",    num:"5.3",    type:"УК", title:"Создание помехи сотруднику ПО при исполнении",                                     note:"", term:2},
	{id:"5.3.1",  num:"5.3.1",  type:"УК", title:"Провокация сотрудников правоохранительных органов",                               note:"", term:2},
	{id:"5.4",    num:"5.4",    type:"УК", title:"Оскорбление сотрудников ПО в грубой форме",                                        note:"", term:1},
	{id:"5.5",    num:"5.5",    type:"УК", title:"Ложный вызов",                                                                      note:"", term:2},
	{id:"5.6",    num:"5.6",    type:"УК", title:"Дача ложных показаний",                                                             note:"", term:2},
	{id:"5.7",    num:"5.7",    type:"УК", title:"Дача или попытка дачи взятки",                                                     note:"", term:3},
	{id:"5.8",    num:"5.8",    type:"УК", title:"Случайное разглашение государственной тайны",                                      note:"", term:1},
	{id:"5.8.1",  num:"5.8.1",  type:"УК", title:"Намеренное разглашение/передача гос. тайны",                                      note:"", term:3},
	{id:"5.9",    num:"5.9",    type:"УК", title:"Шпионаж",                                                                            note:"", term:4},
	{id:"5.10",   num:"5.10",   type:"УК", title:"Присвоение полномочий должностного лица",                                          note:"", term:3},
	{id:"6.1.1",  num:"6.1.1",  type:"УК", title:"Укрывательство преступлений",                                                     note:"", term:2},
	{id:"6.2",    num:"6.2",    type:"УК", title:"Превышение должностных полномочий",                                                 note:"", term:2},
	{id:"6.3",    num:"6.3",    type:"УК", title:"Халатность",                                                                        note:"", term:4},
	{id:"6.4",    num:"6.4",    type:"УК", title:"Разглашение сведений должностным лицом гос. тайны",                                note:"", term:4},
	{id:"6.5",    num:"6.5",    type:"УК", title:"Вооружённый мятеж",                                                                 note:"", term:6},
	{id:"6.6",    num:"6.6",    type:"УК", title:"Неоказание помощи больному",                                                        note:"", term:3},
	{id:"6.7",    num:"6.7",    type:"УК", title:"Дезертирство",                                                                      note:"", term:3},
	{id:"6.8",    num:"6.8",    type:"УК", title:"Получение взятки должностным лицом",                                               note:"", term:3},
	{id:"7.2",    num:"7.2",    type:"УК", title:"Хранение или перевозка наркотических веществ",                                     note:"", term:3},
	{id:"7.3",    num:"7.3",    type:"УК", title:"Приобретение, сбыт, распространение наркотических веществ",                       note:"", term:4},
	{id:"7.4",    num:"7.4",    type:"УК", title:"Производство, изготовление, выращивание наркотических веществ",                   note:"", term:3},
];

// ══════════════════════════════════════════════════════════════════
//  ЗАКОНЫ — дерево документов (заглушка структуры, текст добавляется позже)
//  Уровни: Документ → Статья (2 уровня)
// ══════════════════════════════════════════════════════════════════
const LAW_DOCUMENTS=[
	{
		id:"ustav",
		title:"Устав",
		articles:[
			{id:"ustav-1",  num:"1",  title:"Общие положения",            text:""},
			{id:"ustav-2",  num:"2",  title:"Структура и подчинённость",  text:""},
			{id:"ustav-3",  num:"3",  title:"Права сотрудника",           text:""},
			{id:"ustav-4",  num:"4",  title:"Обязанности сотрудника",     text:""},
			{id:"ustav-5",  num:"5",  title:"Дисциплинарная ответственность", text:""}
		]
	},
	{
		id:"koap",
		title:"КоАП",
		articles:[
			{id:"koap-1",  num:"1",  title:"Общие положения",                text:""},
			{id:"koap-2",  num:"2",  title:"Административные правонарушения", text:""},
			{id:"koap-3",  num:"3",  title:"Административные взыскания",     text:""},
			{id:"koap-4",  num:"4",  title:"Порядок производства по делам",  text:""}
		]
	},
	{
		id:"proc",
		title:"Процессуальный кодекс",
		articles:[
			{id:"proc-1",  num:"1",  title:"Общие положения",         text:""},
			{id:"proc-2",  num:"2",  title:"Возбуждение дела",        text:""},
			{id:"proc-3",  num:"3",  title:"Следственные действия",   text:""},
			{id:"proc-4",  num:"4",  title:"Судебное разбирательство",text:""},
			{id:"proc-5",  num:"5",  title:"Обжалование",             text:""}
		]
	},
	{
		id:"euss",
		title:"ЕУСС",
		articles:[
			{id:"euss-1",  num:"1",  title:"Общие положения",                text:""},
			{id:"euss-2",  num:"2",  title:"Взаимодействие силовых структур",text:""},
			{id:"euss-3",  num:"3",  title:"Координация и подчинённость",    text:""},
			{id:"euss-4",  num:"4",  title:"Особые условия и режимы",        text:""}
		]
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
			// ── ЗАКОНЫ: дерево документов ─────────────────────────────
			lawDocuments:LAW_DOCUMENTS,
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
			if(this.mode==="wanted")return this.tabs.filter(t=>t.key==="wanted");
			if(this.mode==="fine")  return this.tabs.filter(t=>t.key==="fines");
			return this.tabs;
		},
		// ── РОЗЫСК: фильтрация УК статей ─────────────────────────
		filteredArticles(){
			const q=this.search.trim().toLowerCase();
			if(!q)return UK_ARTICLES;
			return UK_ARTICLES.filter(a=>
				a.num.includes(q)||
				a.title.toLowerCase().includes(q)||
				(a.note&&a.note.toLowerCase().includes(q))
			);
		},
		selectedArticleObjects(){
			return UK_ARTICLES.filter(a=>this.selectedArticles.includes(a.id));
		},
		totalTerm(){
			return this.selectedArticleObjects.reduce((s,a)=>s+a.term,0);
		},
		// ── ШТРАФЫ: фильтрация КоАП статей ───────────────────────
		filteredKoapArticles(){
			let arts=KOAP_ARTICLES;
			if(this.fineKoapType!=="all")arts=arts.filter(a=>a.type===this.fineKoapType);
			const q=this.search.trim().toLowerCase();
			if(!q)return arts;
			return arts.filter(a=>
				a.num.includes(q)||
				a.title.toLowerCase().includes(q)||
				(a.note&&a.note.toLowerCase().includes(q))
			);
		},
		selectedFineArticleObjects(){
			return KOAP_ARTICLES.filter(a=>this.selectedFineArticles.includes(a.id));
		},
		totalFine(){
			return this.selectedFineArticleObjects.reduce((s,a)=>s+a.fine,0);
		},
		// ── ЗАКОНЫ: дерево с фильтрацией по поиску ───────────────
		filteredLawDocuments(){
			const q=this.search.trim().toLowerCase();
			if(!q)return this.lawDocuments;
			return this.lawDocuments
				.map(doc=>{
					const matchedArticles=doc.articles.filter(a=>
						a.num.toLowerCase().includes(q)||
						a.title.toLowerCase().includes(q)
					);
					if(doc.title.toLowerCase().includes(q))return doc;
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
			if(!tab)return"";
			return this.content[tab.key]||"";
		}
	},
	created(){this.$data.noAdaptation=!0},
	mounted(){
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
			// Открыт через пункт меню «Законы» — показываем все табы, дефолт на ЗАКОНЫ (индекс 0)
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
	},
	unmounted(){
		window.onKeyUp=this._prevOnKeyUp;
		const s=document.getElementById("laws-helper-style");
		if(s)s.remove()
	},
	methods:{
		selectTab(i){this.currentTab=i;this.search=""},
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
			const totalStars=this.totalTerm;
			const lastCode=this.selectedArticleObjects.map(a=>a.num+" УК").join(", ");
			if(window._mvdSetLastWantedCode)window._mvdSetLastWantedCode(lastCode);
			const cmd=`/su ${id} ${totalStars}`;
			if(typeof window.sendChatInput==="function")window.sendChatInput(cmd);
			else if(typeof window.sendChatMessage==="function")window.sendChatMessage(cmd);
			this.close()
		},
		// ── ШТРАФЫ ──────────────────────────────────────────────────
		toggleFineArticle(id){
			const idx=this.selectedFineArticles.indexOf(id);
			if(idx===-1)this.selectedFineArticles.push(id);
			else this.selectedFineArticles.splice(idx,1)
		},
		clearFine(){
			this.selectedFineArticles=[];
			this.fineId="";
			window._duranFineTargetId=null
		},
		issueFine(){
			const id=this.fineId.trim();
			if(!id||this.selectedFineArticles.length===0)return;
			const arts=this.selectedFineArticleObjects;
			// Отправляем отдельную команду /ticket на каждую выбранную статью
			// с задержкой 500мс между ними чтобы сервер не потерял
			arts.forEach((art,i)=>{
				setTimeout(()=>{
					const cmd=`/ticket ${id} ${art.fine} ${art.num} КоАП`;
					if(typeof window.sendChatInput==="function")window.sendChatInput(cmd);
					else if(typeof window.sendChatMessage==="function")window.sendChatMessage(cmd);
				},i*500);
			});
			this.close()
		},
		close(){window.closeInterface("Zkm")}
	}
};

const Zkm=_export_sfc(_sfc_main,[["render",render]]);
export{Zkm as default};
