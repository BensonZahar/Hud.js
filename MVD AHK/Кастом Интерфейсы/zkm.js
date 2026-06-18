\import{r as resolveComponent,o as openBlock,c as createElementBlock,b as createVNode,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,e as createTextVNode,t as toDisplayString,f as createCommentVNode,w as withCtx,T as Transition,_ as _export_sfc}from"./index.js";

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
		id:"koap",
		title:"КоАП",
		articles:[
			{id:"koap-1", num:"1", title:"Нарушения, касаемо регистрации т/с", text:"<span style=\"color:#00b300\"><b>Статья 1.1</b></span> - Управление транспортным средством без регистрационного знака | Штраф 5.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Разрешено управление т/c без регистрационных знаков (номеров) в случае, если пробег не превысил 100 км."},
			{id:"koap-2", num:"2", title:"Нарушения касаемо технического состояния т/с", text:"<span style=\"color:#00b300\"><b>Статья 2.1</b></span> - Управление т/с с неисправным двигателем | Штраф 10.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Движение с дымлением машины без аварийных сигналов"},
			{id:"koap-3", num:"3", title:"Безопасность движения", text:"<span style=\"color:#00b300\"><b>Статья 3.1</b></span> - Управление т/с, находясь в алкогольном/наркотическом опьянении | Штраф 20.000 рублей с изъятием водительского удостоверения.\n<span style=\"color:#b30000\">Примечание:</span> Перед выдачей штрафа необходимо иметь доказательства, что игрок принимал наркотики/алкоголь перед началом движения.\n\n<span style=\"color:#00b300\"><b>Статья 3.2</b></span> - Разговор по телефону во время движения т/с | Штраф 5.500 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 3.3</b></span> - Нарушение правил пользования звуковыми сигналами, аварийной сигнализацией или знаком аварийной остановки | Штраф 6.500 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Использование звукового сигнала не по назначению/без причины, беспрерывная подача звукового сигнала в целях шуток, \"троллинга\".\n\n<span style=\"color:#00b300\"><b>Статья 3.4</b></span> - Движение транспортного средства с выключенными габаритными огнями в ночное/вечернее время суток (с 21:00 по 6:00) | Штраф 5.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 3.5</b></span> - Нарушение правил дорожного движения пешеходом | Штраф 10.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Переход в неположенном месте, бег по дороге (искл. в жилых зонах) и т.д. Искл. Сотрудник ПО при исполнении должностных обязанностей (Погоня и т.д).\n\n<span style=\"color:#00b300\"><b>Статья 3.6</b></span> - Управление транспортным средством, на котором установлены лобовое и/или боковые передние стекла, светопропускаемость которых ниже 50% | Штраф 15.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Искл. ФСБ при исполнении должностных обязанностей.\n\n<span style=\"color:#00b300\"><b>Статья 3.7</b></span> - Движение без пристегнутого ремня безопасности или надетого шлема | Штраф 5.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 3.8</b></span> - Намеренное создание дорожных заторов, помех | Штраф 10.000 рублей."},
			{id:"koap-4", num:"4", title:"Железная дорога", text:"<span style=\"color:#00b300\"><b>Статья 4.1</b></span> - Пересечение железнодорожного пути вне железнодорожного переезда, выезд на железнодорожный переезд при закрытом или закрывающемся шлагбауме | Штраф 25.000 рублей с лишением водительского удостоверения."},
			{id:"koap-5", num:"5", title:"Автомагистраль", text:"<span style=\"color:#00b300\"><b>Статья 5.1</b></span> - Разворот транспортного средства либо движение задним ходом по автомагистрали | Штраф 15.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Автомагистраль - дорога для скоростного движения автомобилей, не имеющая одноуровневых пересечений с другими дорогами, железнодорожными или трамвайными путями, пешеходными или велосипедными дорожками."},
			{id:"koap-6", num:"6", title:"Перекресток", text:"<span style=\"color:#00b300\"><b>Статья 6.1</b></span> - Проезд на запрещающий (красный) сигнал светофора | Штраф 10.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Гражданские лица, получившие штраф от радара за проезд на красный сигнал светофора, не могут быть повторно наказаны за данное нарушение сотрудником полиции (К примеру, за объезд красного сигнала светофора полагается штраф от сотрудника). Сотрудники полиции в праве потребовать доказательства выдачи штрафа радаром.\n\n<span style=\"color:#00b300\"><b>Статья 6.1.1</b></span> - Проезд на предупреждающий (желтый) сигнал светофора | Штраф 5.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 6.1.2</b></span> - Проезд на запрещающий/предупреждающий сигнал светофора, в следствии чего произошло ДТП | Штраф 20.000 рублей с лишением водительского удостоверения.\n\n<span style=\"color:#b30000\">Примечание: В случае, если после действий, указанных в статье 6.1.1 и 6.1.2, было совершено ДТП - также изымается лицензия на вождение.</span>"},
			{id:"koap-7", num:"7", title:"Маневрирование", text:"<span style=\"color:#00b300\"><b>Статья 7.1</b></span> - Разворот или движение задним ходом в местах, где такие маневры запрещены | Штраф 15.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> На пешеходных переходах и ближе 10 метров от них с обеих сторон: на мостах, путепроводах, эстакадах и под ними; на железнодорожных переездах; в местах расположения остановочных пунктов маршрутных транспортных средств.\n\n<span style=\"color:#00b300\"><b>Статья 7.2</b></span> - Агрессивное вождение | Штраф 20.000 рублей с изъятием лицензии на вождение.\n<span style=\"color:#b30000\">Примечание:</span> Создание опасной ситуации для других участников движения: Сильное столкновение = таран, неоднократный подрез, периодические выезды на встречную полосу с интервалом в пару секунд)\n\n<span style=\"color:#00b300\"><b>Статья 7.3</b></span> - Невыполнение требования уступить дорогу транспортному средству, пользующемуся преимущественным правом проезда | Штраф 10.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Помеха справа | При перестроении водитель должен уступить дорогу транспортным средствам, движущимся попутно | При выезде на дорогу с прилегающей территории водитель должен уступить дорогу транспортным средствам и пешеходам, движущимся по ней"},
			{id:"koap-8", num:"8", title:"Парковка, движение т/с", text:"<span style=\"color:#00b300\"><b>Статья 8.1</b></span> - Остановка, стоянка, парковка т/с в неположенном месте | Штраф 8.000 рублей с эвакуацией т/с.\n<span style=\"color:#b30000\">Примечание:</span> Что является нарушением: Искл. При включённой аварийке можно стоять в течение 5 минут, при условии, что т/с не создаёт аварийной ситуации и/или помеху другим участникам движения.\n\n<span style=\"color:#00b300\"><b>Статья 8.2</b></span> - Движение на т/с по велосипедным, пешеходным дорожкам, газонам или тротуарам | Штраф 6.500 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 8.3</b></span> - Движение т/с по встречной полосе | Штраф 10.000 рублей с изъятием лицензии на вождение.\n\n<span style=\"color:#00b300\"><b>Статья 8.3.1</b></span> - Движение т/с по встречной полосе, в следствии чего произошло ДТП | Штраф 20.000 рублей с изъятием лицензии на вождение."},
			{id:"koap-9", num:"9", title:"Знаки и разметка", text:"<span style=\"color:#00b300\"><b>Статья 9.1</b></span> - Разворот/поворот через сплошную линию разметки | Штраф 12.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 9.2</b></span> - Разворот/поворот через двойную сплошную линию разметки | Штраф 15.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 9.3</b></span> - Пересечение двойной сплошной линии разметки | Штраф 13.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 9.4</b></span> - Пересечение сплошной линии разметки | Штраф 15.000 рублей.\n\n<span style=\"color:#b30000\">Примечание: В случае, если после действий, указанных в 9 главе, было совершено ДТП - также изымается лицензия на вождение.</span>"},
			{id:"koap-10", num:"10", title:"Преимущество на дороге", text:"<span style=\"color:#00b300\"><b>Статья 10.1</b></span> - Непредоставление преимущества в движении маршрутному транспорту на остановках | Штраф 5.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 10.2</b></span> - Непредоставление преимущества в движении транспортному средству спец. служб с одновременно включенными проблесковым маячком синего цвета и специальным звуковым сигналом или игнорирование предупреждений сотрудников ФСБ в громкоговоритель | Штраф 15.000 рублей с изъятием лицензии на вождение.\n\n<span style=\"color:#00b300\"><b>Статья 10.3</b></span> - Непредоставление преимущества в движении колонны в сопровождении государственных служб | Штраф 20.000 рублей с изъятием лицензии на вождение.\n\n<span style=\"color:#00b300\"><b>Статья 10.4</b></span> - Невыполнение требования уступить дорогу пешеходам и  велосипедистам (в случае перехода дороги в положенном месте) | Штраф 10.000 рублей."},
			{id:"koap-11", num:"11", title:"ДТП", text:"<span style=\"color:#00b300\"><b>Статья 11.1</b></span> - Виновник дорожно-транспортного происшествия без вреда здоровью и жизни граждан | Штраф 10.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 11.1.1</b></span> - Виновник дорожно-транспортного происшествия повлекшее тяжкий вред здоровью/смерть | Штраф 25.000 рублей с изъятием лицензии на оружие.\n\n<span style=\"color:#00b300\"><b>Статья 11.2</b></span> - Оставление водителем места дорожно-транспортного происшествия | Штраф 15.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 11.3</b></span> - Создание аварийных ситуаций, провокация на ДТП, автоподставы | Штраф 20.000 рублей с изъятием водительского удостоверения."},
			{id:"koap-12", num:"12", title:"Скоростной режим", text:"<span style=\"color:#00b300\"><b>Статья 12.1</b></span> - Нарушение скоростного режима более чем на 30 километров в час | Штраф 5.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Скорость нарушителя от 80 до 90 км/ч\n\n<span style=\"color:#00b300\"><b>Статья 12.2</b></span> - Нарушение скоростного режима более чем на 50 километров в час | Штраф 7.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Скорость нарушителя от 90 до 120 км/ч\n\n<span style=\"color:#00b300\"><b>Статья 12.3</b></span> - Нарушение скоростного режима на величину более 30 километров в час, в следствии чего произошло ДТП (наезд на пешехода, порча автомобильного транспорта) | Штраф 15.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 12.4</b></span> - Нарушение скоростного режима на величину более 50 километров в час, в следствии чего произошло ДТП (наезд на пешехода, порча автомобильного транспорта) | Штраф 25.000 рублей и изъятием водительского удостоверения.\n\n<span style=\"color:#b30000\">Примечание: В случае, если после действий, указанных в 12 главе, было совершено ДТП - также изымается лицензия на вождение.</span>"},
			{id:"koap-13", num:"13", title:"Административные правонарушения, касающие общественного порядка", text:"<span style=\"color:#00b300\"><b>Статья 13.1</b></span> - Оскорбление, унижение чести в отношении гражданского лица/сотрудника гос. структур (МЗ, ТРК, МЧС, Пра-во, МО) | Штраф 10.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 13.1.1</b></span> - Не грубое оскорбление сотрудника правоохранительных органов | Штраф 10.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 13.2</b></span> - Мелкое хулиганство | Штраф 8.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Нецензурная брань, громкие крики в общественных местах\n\n<span style=\"color:#00b300\"><b>Статья 13.3</b></span> - Курение в общественных местах | Штраф 5.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 13.4</b></span> - Распитие спиртных напитков в общественных местах | Штраф 7.000 рублей.\n\n<span style=\"color:#00b300\"><b>Статья 13.5</b></span> - Громкая музыка в жилых зонах в ночное время суток (с 23:00 - 06:00) | Штраф 4.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Музыка из бумбокса/сабвуфер.\n\n<span style=\"color:#00b300\"><b>Статья 13.6</b></span> - Ношение отмычек или других специально приспособленных для незаконного проникновения предметов | Штраф 15.000 рублей.\n<span style=\"color:#b30000\">Примечание:</span> Искл: Сотрудники силовых структур, с целью взлома дверей в подвале особняка\n\n<span style=\"color:#b30000\">Общие примечания к Кодексу:</span>\n• После изъятия водительского удостоверения за любую статью в которой есть подобная санкция, сотрудник вправе эвакуировать транспорт гражданского.\n• Перед выдачей штрафа сотрудник обязан проверить документы, на нарушение гражданского у сотрудника обязательно должно быть опровержение.\n• В случае погонь и вызовов, конвоев, сотрудники государственных организаций в праве нарушать КоАП."}
		]
	},
	{
		id:"uk",
		title:"УК",
		articles:[
			{id:"uk-1", num:"1", title:"Преступления против жизни и здоровья человека", text:"<span style=\"color:#00b300\"><b>Статья 1.1</b></span> - Нападение на гражданское лицо без использования оружия | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Умышленное применение физической силы без использования оружия.\n\n<span style=\"color:#00b300\"><b>Статья 1.1.1</b></span> - Побои | Лишение свободы сроком на 1 год.\n<span style=\"color:#b30000\">Примечание:</span> Умышленное нанесение одному гражданскому лицу одного или двух ударов без использования предметов, способных причинить вред здоровью.\n\n<span style=\"color:#00b300\"><b>Статья 1.1.2</b></span> - Нападение на гражданское лицо с применением холодного оружия | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Умышленное нападение с использованием предметов, способных причинить вред здоровью (ножи, биты, кастеты и др.).\n\n<span style=\"color:#00b300\"><b>Статья 1.1.3</b></span> - Вооружённое нападение на гражданское лицо | Лишение свободы сроком на 4 года.\n<span style=\"color:#b30000\">Примечание:</span> Нападение с применением огнестрельного оружия либо с явной угрозой его применения.\n\n<span style=\"color:#00b300\"><b>Статья 1.2</b></span> - Причинение смерти по неосторожности без использования оружия | Лишение свободы сроком на 1 года.\n<span style=\"color:#b30000\">Примечание:</span> Причинение смерти (в т.ч нока) в результате небрежных или неосторожных действий, без умысла на убийство.\n\n<span style=\"color:#00b300\"><b>Статья 1.2.1</b></span> - Причинение смерти по неосторожности при управлении транспортом | Лишение свободы сроком на 2 года.\n\n<span style=\"color:#00b300\"><b>Статья 1.3</b></span> - Угроза причинения вреда здоровью человеку с использованием слов | Лишение свободы сроком на 1 год.\n\n<span style=\"color:#00b300\"><b>Статья 1.3.1</b></span> - Угроза причинения вреда здоровью человеку с использованием оружия | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Наведение огнестрельного оружия на человека\n\n<span style=\"color:#00b300\"><b>Статья 1.4</b></span> - Изнасилование | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Использование РП отыгровок сексуального характера; /anim 6 18 по отношению к человеку (в том числе, когда он в ноке).\n\n<span style=\"color:#00b300\"><b>Статья 1.5</b></span> - Воспрепятствование оказанию медицинской помощи | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Воспрепятствование в какой бы то ни было форме законной деятельности медицинского работника по оказанию медицинской помощи\n\n<span style=\"color:#b30000\">Важно:</span> при нанесении трёх и более ударов деяние квалифицируется как нападение. Менее трёх ударов — 1.1.1 УК. 1.2 УК. При самообороне наказать за нападение нельзя (Если тот, кто самооборонялся, использовал оружие без лицензии, то его разрешено наказать по соответствующей статье)."},
			{id:"uk-2", num:"2", title:"Преступления против свободы и чести личности", text:"<span style=\"color:#00b300\"><b>Статья 2.1</b></span> - Похищение человека | Лишение свободы сроком на 4 года.\n\n<span style=\"color:#00b300\"><b>Статья 2.2</b></span> - Клевета | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Распространение заведомо ложных сведений, порочащих честь и достоинство другого лица или подрывающих его репутацию"},
			{id:"uk-3", num:"3", title:"Преступление против собственности", text:"<span style=\"color:#00b300\"><b>Статья 3.1</b></span> - Кража | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Кража/попытка кражи ТС (включая попытка сесть за руль т/с гос. структур) | Недавно выброшенных вещей для передачи | Украденные вещи из дома | Кража вещей с открытого багажника игрока\n\n<span style=\"color:#00b300\"><b>Статья 3.1.1</b></span> - Разбой | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Нападение в целях хищения чужого имущества, совершенное с применением/угрозой насилия/убийства (ограбление)\n\n<span style=\"color:#00b300\"><b>Статья 3.2</b></span> - Умышленное повреждение или порча частного имущества | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Порча личного транспорта (от трех ударов кулаками или с использованием другого т/с) и т.д\n\n<span style=\"color:#00b300\"><b>Статья 3.2.1</b></span> - Умышленное повреждение или порча государственного имущества | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Порча гос. транспорта (от трех ударов кулаками или с использованием другого т/с) и т.д"},
			{id:"uk-4", num:"4", title:"Преступления против общественной безопасности", text:"<span style=\"color:#00b300\"><b>Статья 4.1</b></span> - Террористический акт | Лишение свободы сроком на 6 лет.\n<span style=\"color:#b30000\">Примечание:</span> Совершение взрыва, поджога или иных действий, создающих опасность гибели человека, причинения значительного имущественного ущерба либо наступления иных тяжких последствий. Пример: Нападение на воинскую часть; нападение на конвой гос. организаций; взятие заложников, намеренный подрыв с помощью т/с  (включая летного) и т.д.\n\n<span style=\"color:#00b300\"><b>Статья 4.1.1</b></span> - Заведомо ложное сообщение об акте терроризма | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Заведомо ложное сообщение в органы полиции или в органы государственной безопасности о готовящихся взрыве, поджоге или иных действиях, создающих опасность гибели людей, причинения значительного имущественного ущерба либо наступления иных общественно опасных последствий\n\n<span style=\"color:#00b300\"><b>Статья 4.2</b></span> - Несообщение о преступлении | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Несообщение в органы власти, уполномоченные рассматривать сообщения о преступлении, о лице (лицах), которое по достоверно известным сведениям готовит, совершает или совершило хотя бы одно из преступлений, укрывательство человека\n\n<span style=\"color:#00b300\"><b>Статья 4.3</b></span> - Массовые беспорядки | Лишение свободы сроком на 5 лет.\n<span style=\"color:#b30000\">Примечание:</span> Организация и участие в массовых беспорядков, то есть грубого нарушения общественного порядка, сопровождавшегося насилием, погромами, поджогами, уничтожением имущества, применением оружия, взрывных устройств, взрывчатых веществ и предметов, представляющих опасность для окружающих, а также оказанием вооруженного сопротивления представителям власти, подготовка лица для организации таких массовых беспорядков или участия в них, а также участие в массовых беспорядках\n\n<span style=\"color:#00b300\"><b>Статья 4.4</b></span> - Участие в несанкционированных митингов | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Участие в несанкционированном митинге, направленном на демонстративное свержение действующего конституционного строя, Правительства Нижегородской области, упразднению состава \"Нижегородского областного Совета\", либо же Начальника государственной структуры\n\n<span style=\"color:#00b300\"><b>Статья 4.4.1</b></span> - Организация несанкционированного митинга | Лишение свободы сроком на 3 года.\n\n<span style=\"color:#00b300\"><b>Статья 4.5</b></span> - Ношение оружия в открытом виде | Лишение свободы сроком на 2 года с лишением лицензии на оружие, а также с изъятием оружия и патрон к нему.\n\n<span style=\"color:#00b300\"><b>Статья 4.5.1</b></span> - Ношение оружия в открытом виде в общественных местах | Лишение свободы сроком на 3 года с изъятием лицензии и самого оружия и патрон к нему.\n<span style=\"color:#b30000\">Примечание:</span> В городе; местах большого скопления людей; частных предприятий и территорий государственных организаций.\n\n<span style=\"color:#00b300\"><b>Статья 4.5.2</b></span> - Ношение оружия и патронов без лицензии | Лишение свободы сроком на 2 года с изъятием оружия и патрон к нему.\n\n<span style=\"color:#00b300\"><b>Статья 4.5.3</b></span> - Ношение оружия в открытом виде без лицензии | Лишение свободы сроком на 4 года с изъятием оружия и патрон к нему.\n\n<span style=\"color:#00b300\"><b>Статья 4.5.4</b></span> - Ношение оружия в открытом виде в общественных местах без лицензии | Лишение свободы сроком на 5 года, а также с изъятием оружия и патрон к нему.\n\n<span style=\"color:#00b300\"><b>Статья 4.6</b></span> - Незаконное приобретение, передача, изготовления оружия и боеприпасов к нему | Лишение свободы сроком на 2 года с изъятием оружия и патрон.\n\n<span style=\"color:#00b300\"><b>Статья 4.7</b></span> - Помеха проведению мероприятий, созданных лицами гос. структур | Лишение свободы сроком на 1 год.\n<span style=\"color:#b30000\">Примечание:</span> Помеха проведению собеседований; Строев и иных RolePlay ситуаций.\n\n<span style=\"color:#00b300\"><b>Статья 4.8</b></span> - Проникновение на территорию, которая является желтой зоной, описанную в Законе “О закрытых охраняемых территориях и объектах” | Лишение свободы сроком на 2 год.\n\n<span style=\"color:#00b300\"><b>Статья 4.8.1</b></span> - Проникновение на территорию, которая является красной зоной, описанную в Законе “О закрытых охраняемых территориях и объектах” | Лишение свободы сроком на 4 года.\n\n<span style=\"color:#00b300\"><b>Статья 4.8.2</b></span> - Проникновение на частную территорию без разрешения владельца | Лишение свободы сроком на 1 год.\n<span style=\"color:#b30000\">Примечание:</span> Арест возможен только после жалобы владельца дома\n\n<span style=\"color:#00b300\"><b>Статья 4.9</b></span> - Соучастие в преступлении | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Умышленная помощь преступнику, подстрекательство, укрывательство преступника, действия, способствующее реализации преступного намерения.\n\n<span style=\"color:#00b300\"><b>Статья 4.9.1</b></span> - Принуждение к совершению нарушения законодательства | Лишение свободы на срок, предусмотренный статьёй, нарушенной человеком, которого принудили.\n\n<span style=\"color:#b30000\">Примечание:</span> Наказание за открытое ношение оружия применяется только при условии, что оружие находилось в руках у лица на протяжении 5 и более секунд, либо же, когда лицо неоднократно прокручивает оружие в руках."},
			{id:"uk-5", num:"5", title:"Преступления против сотрудников гос. организаций", text:"<span style=\"color:#00b300\"><b>Статья 5.1</b></span> - Нападение на сотрудника гос. организации при исполнении | Лишение свободы сроком на 4 года.\n<span style=\"color:#b30000\">Примечание:</span> Нападение на сотрудника МЗ, МЧС, ТРК, Пра-во (от 3-ех ударов, нападение с использованием оружия/транспорта).\n\n<span style=\"color:#00b300\"><b>Статья 5.1.1</b></span> - Нападение на сотрудника силовых структур при исполнении | Лишение свободы сроком на 5 лет.\n<span style=\"color:#b30000\">Примечание:</span> Нападение на сотрудника МО, МВД, ФСИН, ФСБ (от 3-ех ударов, нападение с использованием оружия/транспорта).\n\n<span style=\"color:#00b300\"><b>Статья 5.1.2</b></span> - Нападение на государственного деятеля при исполнении | Лишение свободы сроком на 6 лет.\n<span style=\"color:#b30000\">Примечание:</span> Нападение на лидера/заместителя гос. организации; Депутата/Министра правительства (от 3-ех ударов, нападение с использованием оружия/транспорта).\n\n<span style=\"color:#00b300\"><b>Статья 5.2</b></span> - Неподчинение законному требованию сотрудника Правоохранительных органов или Министерства обороны | Лишение свободы сроком на 1 год.\n<span style=\"color:#b30000\">Примечание:</span> Отказ от выполнения просьб «выйти с авто», «покинуть помещение», дать паспорт, покинуть охраняемую территорию и т.д. Для задержания по этому пункту требуется дать 10 секунд на выполнение законного требования\n\n<span style=\"color:#00b300\"><b>Статья 5.2.1</b></span> - Побег от сотрудников ПО | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Побег при слете наручников во время ареста | Побег при погоне (с получением хотя-бы одной просьбы о остановке).\n\n<span style=\"color:#00b300\"><b>Статья 5.3</b></span> - Создание помехи сотруднику Правоохранительных органов при исполнении своих обязанностей | Лишение свободы на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Умышленное воспрепятствование исполнению служебных обязанностей сотрудника. Примеры: блокирование служебного транспорта, перекрытие проезда, создание препятствий передвижению сотрудника.\n\n<span style=\"color:#00b300\"><b>Статья 5.3.1</b></span> - Провокация сотрудников правоохранительных органов при исполнении | Лишение свободы сроком на 2 год.\n<span style=\"color:#b30000\">Примечание:</span> Использование /anim 6 18 в отношении сотрудника, 1-2 удара по ТС, словесные провокации (признание в ношении оружия/нарк средств, когда его нет и прочая дизинформация сотрудника).\n\n<span style=\"color:#00b300\"><b>Статья 5.4</b></span> - Оскорбление сотрудников правоохранительных органов в грубой форме | Лишение свободы сроком на 1 год.\n<span style=\"color:#b30000\">Примечание:</span> - Лёгкое оскорбление (нецензурная лексика без адресных унижений. Пр: \"Мусора ...., сотрудники полиции ....) квалифицируется по КоАП и влечёт наложение штрафа. - Грубое оскорбление (унижение чести и достоинства, оскорбления с использованием нецензурной лексики, направленные непосредственно на определенного сотрудника) квалифицируется по УК.\n\n<span style=\"color:#00b300\"><b>Статья 5.5</b></span> - Ложный вызов | Лишение свободы сроком на 2 год.\n<span style=\"color:#b30000\">Примечание:</span> Ложный вызов сотрудников правоохранительных органов (Сотрудник Правоохранительных органов имеет право объявить преступника в розыск, после того, как по RP была установлена личность человека, который сделал ложный вызов).\n\n<span style=\"color:#00b300\"><b>Статья 5.6</b></span> - Дача ложных показаний | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Ложный донос, сообщение ложной информации сотрудникам ПО во время допроса.\n\n<span style=\"color:#00b300\"><b>Статья 5.7</b></span> - За дачу или попытку дачи взятки | Лишение свободы сроком на 3 года.\n\n<span style=\"color:#00b300\"><b>Статья 5.8</b></span> - Случайное разглашение государственной тайны | Лишение свободы сроком на 1 год.\n<span style=\"color:#b30000\">Примечание:</span> «Государственной тайной» следует подразумевать: - место хранения ящиков Минобороны; - количество сотрудников МВД и Минобороны на территории отдела/ВЧ/области; - план проведения облавы/КТО. - раскрытие личности сотрудника ФСБ под маскировкой - разглашение правил вербовки в ФСБ\n\n<span style=\"color:#00b300\"><b>Статья 5.8.1</b></span> - Намеренное разглашение/передачи гос. тайны другим лицам или преступным организациям | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Распространение пунктов, указанных в 5.8\n\n<span style=\"color:#00b300\"><b>Статья 5.9</b></span> - Шпионаж | Лишение свободы сроком на 4 года.\n<span style=\"color:#b30000\">Примечание:</span> Под шпионажем подразумевается: а) слежка за группой опечатки Правительства, передвижение за ними на ТС, пешком. Выпрашивание или фотографирование информации о квартирах/подъездах, или передача в рацию сообщений; б) слежка за конвоем МО/МЗ, передвижение за ними на ТС, пешком. Выпрашивание продажи ящиков или фотографирование процесса погрузки ящиков, или передача в рацию сообщений.\n\n<span style=\"color:#00b300\"><b>Статья 5.10</b></span> - Присвоение полномочий должностного лица | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Присвоение гражданским лицом, не являющимся должностным лицом, полномочий должностного лица и совершение им, в связи с этим действий от лица должностного лица"},
			{id:"uk-6", num:"6", title:"Преступления сотрудниками Гос. Организаций", text:"<span style=\"color:#00b300\"><b>Статья 6.1</b></span> - Незаконное освобождение от уголовной ответственности | Лишение свободы сроком на 4 года.\n<span style=\"color:#b30000\">Примечание:</span> Пр: освобождение сотрудником ФСИН преступника за взятку | Освобождение преступника сотрудником МВД/ФСБ и т.д).\n\n<span style=\"color:#00b300\"><b>Статья 6.1.1</b></span> - Укрывательство преступлений | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Укрывательство преступления, орудий преступления или иных улик; сокрытие лица, совершившего преступление или помощь такому лицу в сокрытии от сотрудников правоохранительных органов\n\n<span style=\"color:#00b300\"><b>Статья 6.2</b></span> - Превышение должностных полномочий | Лишение свободы сроком на 2 года.\n<span style=\"color:#b30000\">Примечание:</span> Совершение должностным лицом действий, явно выходящих за пределы его полномочий и повлекших серъезные последствия (смерть человека, освобождение особо опасного преступника и т.д).\n\n<span style=\"color:#00b300\"><b>Статья 6.3</b></span> - Халатность | Лишение свободы сроком на 4 года.\n<span style=\"color:#b30000\">Примечание:</span> Халатность, то есть неисполнение или ненадлежащее исполнение должностным лицом своих обязанностей вследствие недобросовестного или небрежного отношения к службе либо обязанностей по должности Пример: • игнорировании очевидных правонарушений; • неприменении предусмотренных мер наказания к нарушителям; • игнорировании поступивших сообщений о правонарушениях от граждан или организаций.\n\n<span style=\"color:#00b300\"><b>Статья 6.4</b></span> - Разглашение сведений должностным лицом, составляющих государственную тайну | Лишение свободы сроком на 4 лет с увольнением из организации и занесением в ЧС.\n<span style=\"color:#b30000\">Примечание:</span> Разглашение пунктов, указанных в статье 5.8; Пример: распространение сотрудником МО информации о времени поставках боеприпасов и т.д.\n\n<span style=\"color:#00b300\"><b>Статья 6.5</b></span> - Вооружённый мятеж | Лишение свободы сроком на 6 лет.\n<span style=\"color:#b30000\">Примечание:</span> Организация вооруженного мятежа либо активное участие в нем в целях свержения или насильственного изменения конституционного строя государства, либо нарушения территориальной целостности, либо с целью свержения представителя регионального органа исполнительной власти (губернатора)\n\n<span style=\"color:#00b300\"><b>Статья 6.6</b></span> - Неоказание помощи больному | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Неоказание помощи больному без уважительных причин лицом, обязанным ее оказывать (сотрудник МЗ)\n\n<span style=\"color:#00b300\"><b>Статья 6.7</b></span> - Дезертирство | Лишение свободы сроком на 3 года.\n<span style=\"color:#b30000\">Примечание:</span> Дезертирство, то есть самовольное оставление воинской части в радиусе до 50 метров\n\n<span style=\"color:#00b300\"><b>Статья 6.8</b></span> - Получение взятки должностным лицом | Лишение свободы сроком на 3 года."},
			{id:"uk-7", num:"7", title:"Преступления, касаемо наркотических веществ", text:"<span style=\"color:#00b300\"><b>Статья 7.1</b></span> - Употребление наркотических веществ | Лишение свободы сроком на 2 года.\n\n<span style=\"color:#00b300\"><b>Статья 7.2</b></span> - Хранение или перевозка наркотических веществ, в том числе семян марихуаны | Лишение свободы сроком на 3 года.\n\n<span style=\"color:#00b300\"><b>Статья 7.3</b></span> - Приобретение, сбыт, распространение наркотических веществ | Лишение свободы сроком на 4 года.\n\n<span style=\"color:#00b300\"><b>Статья 7.4</b></span> - Производство, изготовление, выращивание наркотических веществ | Лишение свободы сроком на 3 года."}
		]
	},
	{
		id:"proc",
		title:"Процессуальный кодекс",
		articles:[
			{id:"proc-1", num:"1", title:". Цели процессуального кодекса", text:"ч.1 Защита прав и законных интересов лиц и организаций, потерпевших от правонарушений\n\nч.2 Защита личности от незаконного и необоснованного обвинения, осуждения, ограничения ее прав и свобод."},
			{id:"proc-2", num:"2", title:". Основания. Процессуальные действия", text:"<b style=\"color:#f9b701\">Статья 1. Основания для Задержания</b>\nСотрудник силовой структуры имеет право задержать лицо при наличии одного или нескольких следующих оснований:\n\nч.1 Совершение преступления: Лицо совершает преступление в присутствии сотрудника силовой структуры.\n\nч.2 Объявление в розыск: Лицо объявлено в розыск правоохранительными органами.\n\nч.3 Неповиновение законным требованиям сотрудника силовой структуры: Лицо отказывается выполнять законные требования сотрудника силовой структуры, находящегося при исполнении служебных обязанностей.\n\n<b style=\"color:#f9b701\">Статья 2</b>\n2.1 Порядок Задержания гражданских лиц, которые не являются особо опасными преступниками (1-4 уровень розыска включительно).\n\nч.1 Представление: Сотрудник силовой структуры обязан представиться задержанному, назвав свою должность, звание и фамилию, и предъявить служебное удостоверение по требованию задержанного. Сотрудники ФСБ и СОБР при исполнении служебных обязанностей вправе использовать исключительно позывной без раскрытия персональных данных.\n\nч.2 Видеофиксация: Сотрудник силовой структуры обязан вести видеофиксацию всего процесса задержания. Видеозапись может быть использована в качестве доказательства в случае обжалования действий сотрудника. Видеофиксация должна храниться в течение <span style=\"color:#8000ff\">72 часов</span>. После получения доказательств на нарушение, сотрудник в праве начать задержание в течение <span style=\"color:#8000ff\">24 часов</span>.\n\nч.3 Установление личности задержанного: Сотрудник силовой структуры обязан установить личность задержанного путем проверки документов, составлением фоторобота, пробиванием номеров личного т/с или номера телефона гражданского лица по базе данных.\n\nч.4 Ограничение свободы передвижения: Сотрудник силовой структуры имеет право ограничить свободу передвижения, задержанного путем применения физической силы, специальных средств (наручники, и т.п.) или оружия, в соответствии с законом.\n\nч.5 Объяснение причины задержания: Сотрудник силовой структуры обязан объяснить задержанному причину задержания и основания для него и так же если задержанный требует номер статьи требуется назвать её.\n\nч.6 Осмотр и изъятие: Сотрудник силовой структуры имеет право провести личный осмотр задержанного и осмотр находящихся при нем вещей, а также изъять предметы, которые могут быть использованы для совершения преступления, либо являться вещественными доказательствами. Изъятые предметы должны быть надлежащим образом оформлены и задокументированы.\n\nч.7 Права задержанного: Сотрудник силовой структуры обязан разъяснить задержанному его права, в том числе:\n\nПраво на молчание.\n\nПраво на получения адвокатской помощи. (Уточнив требуется ли ему адвокат)\n\nПраво на обжалование действий сотрудника силовой структуры.\n\nПримечание: Если задержанный отказался от адвоката задержание продолжается дальше, если задержанный потребовал адвоката сотрудник обязан вызвать адвоката через рацию департамента при этом озвучив время вызова для задержанного (Искл. Отсутствие адвоката в области/адвокат без формы. В данном случае сотрудник в праве продолжить задержание, зафиксировав отсутствие адвокатов в /adlist).\n\nВремя на принятие вызова адвокатом - <span style=\"color:#8000ff\">5 минут</span>.\n\nВремя на приезд адвоката - <span style=\"color:#8000ff\">10 минут</span>.\n\nВремя на беседу адвоката с задержанным - <span style=\"color:#8000ff\">10 минут</span>.\n\nЕсли сотрудник не может обратиться в чат департамента, он должен попросить старшего по рангу сделать запрос об адвокате.\n\nВ случае если адвокат не принял вызов в установленное время, т.е <span style=\"color:#8000ff\">5 минут</span> права на адвоката считаются реализованными и процесс задержания может продолжаться.\n\nч.8 Доставление в участок/отделение: Задержанный должен быть доставлен в участок/отделение силовой структуры в кратчайшие сроки для проведения дальнейших процессуальных действий.\n\n2.2 Порядок Задержания гражданских лиц, которые являются особо опасными преступниками (5+ звезд включительно) | совершили преступление на глазах сотрудников силовых структур:\n\nч.1 Ограничение свободы передвижения: Сотрудник силовой структуры имеет право ограничить свободу передвижения, задержанного путем применения физической силы, специальных средств (наручники, и т.п.) или оружия, в соответствии с законом.\n\nч.2 Видеофиксация: Сотрудник силовой структуры обязан вести видеофиксацию всего процесса задержания. Видеозапись может быть использована в качестве доказательства в случае обжалования действий сотрудника. Видеофиксация должна храниться в течение <span style=\"color:#8000ff\">72 часов</span>. После получения доказательств на нарушение, сотрудник в праве начать задержание в течение <span style=\"color:#8000ff\">24 часов</span>.\n\nч.3 Представление: Сотрудник силовой структуры обязан представиться задержанному, назвав свою должность, звание и фамилию, и предъявить служебное удостоверение по требованию задержанного. Сотрудники ФСБ и СОБР при исполнении служебных обязанностей вправе использовать исключительно позывной без раскрытия персональных данных.\n\nч.4 Установление личности задержанного: Сотрудник силовой структуры обязан установить личность задержанного путем проверки документов, составлением фоторобота, пробиванием номеров личного т/с или номера телефона гражданского лица по базе данных.\n\nч.5 Объяснение причины задержания: Сотрудник силовой структуры обязан объяснить задержанному причину задержания и основания для него и так же если задержанный требует номер статьи требуется назвать её.\n\nч.6 Осмотр и изъятие: Сотрудник силовой структуры имеет право провести личный осмотр задержанного и осмотр находящихся при нем вещей, а также изъять предметы, которые могут быть использованы для совершения преступления, либо являться вещественными доказательствами. Изъятые предметы должны быть надлежащим образом оформлены и задокументированы.\n\nч.7 Права задержанного: Сотрудник силовой структуры обязан разъяснить задержанному его права, в том числе:\n\nПраво на молчание.\n\nПраво на получения адвокатской помощи. (Уточнив требуется ли ему адвокат)\n\nПраво на обжалование действий сотрудника силовой структуры.\n\nПримечание: Если задержанный отказался от адвоката задержание продолжается дальше, если задержанный потребовал адвоката, сотрудник обязан вызвать адвоката через рацию департамента, при этом озвучив время вызова для задержанного. (Искл. Отсутствие адвоката в области/Адвокат без формы. В данном случае сотрудник в праве продолжить задержание, зафиксировав отсутствие адвокатов в /adlist).\n\nВремя на принятие вызова адвокатом - <span style=\"color:#8000ff\">5 минут</span>.\n\nВремя на приезд адвоката - <span style=\"color:#8000ff\">10 минут</span>.\n\nВремя на беседу адвоката с задержанным - <span style=\"color:#8000ff\">10 минут</span>.\n\nЕсли сотрудник не может обратиться в чат департамента, он должен попросить старшего по рангу сделать запрос об адвокате.\n\nВ случае если адвокат не принял вызов в установленное время, т.е <span style=\"color:#8000ff\">5 минут</span> права на адвоката считаются реализованными и процесс задержания может продолжаться.\n\nч.8 Доставление в участок/отделение: Задержанный должен быть доставлен в участок/отделение силовой структуры в кратчайшие сроки для проведения дальнейших процессуальных действий.\n\nПримечание к разделу II:\n\nВ случае, если в процессе задержания сотруднику угрожает опасность, тот в праве прервать процессуальные действия до перехода в безопасное место.\n\nПередача процессуальных действий:\n\nСотрудник, осуществляющий процессуальные действия в отношении лица, вправе передать дальнейшее процессуальное сопровождение другому сотруднику при наличии служебной необходимости.\n\nПередача допускается при соблюдении следующих условий:\n\n1) Задержанное лицо находится под фактическим контролем сотрудников\n\n2) Новый сотрудник ознакомлен с обстоятельствами задержания, имеет материалы и видеофиксацию всего процесса задержания для подачи опровержения (В случае, если гражданский подаст жалобу на рассмотрение администрации в данный раздел, в котором будет запрошено опровержение на полный процесс ареста и если сотрудник предоставит отрезок видеозаписи лишь после передачи ему заключенного, без начало ареста, то наказание за неполное опровержение будет нести тот, кто в конечном итоге посадил в тюрьму гражданское лицо).\n\n3) Факт передачи зафиксирован (видеозаписью и докладом)\n\n4) Новый сотрудник согласен с продолжением дальнейших процессуальных действий\n\n5) С момента принятия процессуального сопровождения новый сотрудник несёт ответственность за дальнейшие процессуальные действия. Сотрудник, осуществивший первоначальные действия, несёт ответственность за законность проведённых им ранее процессуальных действий.\n\nСотрудник может не запрашивать документы в случаях:\n\n- Если имеется возможность идентифицировать личность, путем проверки фоторобота, если на игроке не надета системная маска (<span style=\"color:#8000ff\">/mask</span>). Аксессуары не являются скрытием личности.\n\n- Если гражданский находился на личном транспортном средстве и был отыгран планшет, с проверкой гос. номеров.\n\n- Прямой отказ от гражданского лица, с дальнейшим задержанием, до установления личности, через государственный планшет/диспетчера.\n\n<b style=\"color:#f9b701\">Статья 3. Основания для Освобождения</b>\nЗадержанный подлежит немедленному освобождению, если:\n\nч.1 Истек срок задержания: Срок задержания истек, и в отношении задержанного не принято решение о применении меры пресечения. (<span style=\"color:#8000ff\">45 минут</span>) (время на принятие адвоката, время на его приезд, время на конфиденциальную беседу адвоката с задержанным, также и время на показ доказательств о проведении задержания Адвокату в спец. связи не будет входить в эти <span style=\"color:#8000ff\">45 минут</span>)\n\nч.2 Отсутствие оснований для задержания: Выяснилось, что основания для задержания отсутствуют или были неправомерными.\n\nч.3 Решение вышестоящего должностного лица или адвоката: Вышестоящее должностное лицо или адвокат приняли решение об освобождении задержанного (Причина должна быть обоснована, корректна и разъяснена сотрудникам, ведущим процессуальные действия. Сотрудники в праве продолжать процессуальные действия, в случае, если по их мнению причина по освобождению не корректна, однако, сотрудники будут нести ответственность, если их суждение было неправильным. Если адвокат или вышестоящее лицо ввели сотрудников в заблуждение, то ответственность будут нести они, а не сотрудники).\n\nч.4 Нарушение законодательства в ходе ареста: Сотрудник силовой структуры нарушил законодательную базу в процессе задержания (порядок задержания, отсутствие видеофиксации, серьезные нарушения ЕУСС (действия, за которые выдается один выговор - нарушения субординации и так далее не являются серьезным нарушением)).\n\nч.5 Истек срок нарушения: Если с момента нарушения прошло более <span style=\"color:#8000ff\">72 часов</span>, сотрудник не имеет право привлекать гражданского к уголовной и иной ответственности.\n\n<b style=\"color:#f9b701\">Статья 4. Установление личности гражданского лица</b>\nОснованиями для запроса документа являются:\n\n1) Человек находится в федеральном розыске.\n\n2) Оформление документа о нарушении административного кодекса;\n\n3) Объявление гражданского лица в федеральный розыск за нарушение Уголовного кодекса;\n\n4) Проверка грузового транспорта на возможную перевозку контрабандных товаров;\n\n5) Проведение мероприятия, направленного на поддержание и соблюдение общественного порядка, подтверждённого соответствующим приказом (рейд, КТО).\n\n6) Наличие данных, позволяющих подозревать человека в совершении правонарушения (Донос от другого гражданина, признание самого гражданина в совершении правонарушения (включая \"шутку\"), наличие маски на лице гражданского и отказ её снимать, и тому подобное. Необходимы точные данные с наличием доказательств, а не выдуманные причины.\n\n<b style=\"color:#f9b701\">Статья 5. Обыск и личный досмотр</b>\n5.1 Основаниями для проведения обыска являются:\n\n1) Нахождение лица в федеральном розыске\n\n2) Совершение преступления гражданским лицом на глазах силовых структур\n\n3) Проведение мероприятия, направленного на поддержание и соблюдение общественного порядка, подтверждённого соответствующим приказом с указанием проведения места и времени (рейд КТО).\n\n4) Данные, позволяющие подозревать гражданское лицо в наличие запрещенного оружия/наркотических веществ (Признание самого гражданина в наличие у него наркотических веществ, оружия с отсутствием лицензии (включая \"шутку\") и так далее.\n\nЛичный досмотр может производиться на добровольной основе при проходе на закрытую территорию. При отказе от добровольного личного досмотра, лицу вправе отказать в допуске к закрытой территории.\n\n5.2 Основаниями для проведения досмотра багажника являются:\n\n1) Визуально зафиксированные подозрительные действия от гражданского лица (перекладывание предметов, попытка скрыть запрещенные предметы и т.д).\n\n2) Характер совершённого правонарушения, предполагающий наличие запрещенных предметов в ТС (оружие, наркотические вещества, украденные вещи и т.п.)\n\n3) Прямое заявление лица о наличии запрещённых предметов (Включая \"шутку\")\n\n4) Оперативная информация, донос или ориентировка (Требуются прямые доказательства для совершения досмотра по данному пункту (Ордер от руководства, видеодоказательста, наличие приказа о проведении Рейда, проведение КТО).\n\nВ случае отказа гражданского лица в законном досмотре багажника личного автомобиля, сотрудник силовой структуры в праве задержать подозреваемого по статье 5.2 уголовного кодекса.\n\nРазрешается конфискация всех видов холодного и огнестрельного оружия, наркосодержащие препараты и вещества, компоненты для производства наркосодержащих препаратов и веществ, компоненты которые могут быть использованы для производства оружия или боеприпасов."},
			{id:"proc-3", num:"3", title:". Остановка транспортных средств. Надзор над безопасностью дорожного движения", text:"<b style=\"color:#f9b701\">Статья 6. Основания для остановки транспортного средства:</b>\n1) Нарушение уголовного или административного кодекса.\n\n2) Проверка документов и груза транспортных компаний.\n\n3) Проведение мероприятия, направленного на поддержание и соблюдение общественного порядка, подтверждённого соответствующим приказом с указанием проведения места и времени (Дорожный рейд / КТО).\n\n<b style=\"color:#f9b701\">Статья 7. Порядок остановки транспортного средства гражданских лиц:</b>\n1) Включение проблесковых световых сигналов на служебном транспорте;\n\n2) Просьба об остановке транспортного средства гражданского в громкоговоритель служебного транспорта;\n\n3) В случае остановки транспортного средства, продолжить процессуальные действия, согласно настоящему Кодексу;\n\n4) В случае игнорирования водителем транспортного средства требований, сообщенных в мегафон, продолжить процессуальные действия в отношении водителя и его транспортного средства, применить все имеющиеся в наличии силы и средства для остановки преступника.\n\nРазрешается применение огнестрельного оружия по колесам для остановки транспортного средства в случае если водитель не останавливается после сообщения с требованием в мегафон и предупредительного выстрела в воздух.\n\n<b style=\"color:#f9b701\">Статья 8. Порядок действий после остановки транспортного средства гражданских лиц:</b>\n1) Подойти к транспортному средству гражданского, идентифицировать себя, назвав свою должность, звание и фамилию, и предъявить служебное удостоверение по требованию гражданина.\n\n2) Объяснить гражданину причину остановки и основания для неё, так же если гражданин требует номер статьи - требуется назвать её;\n\n3) Запросить документы, позволяющие установить личность гражданского лица и разрешающие управление транспортным средством;\n\n4) Подтвердить владение автомобилем, или нахождение в списке лиц, которым позволено управлять остановленным транспортным средством;\n\n5) В случае наличия уголовного правонарушения, продолжить процессуальные действия, согласно настоящему Кодексу;\n\n6) В случае наличия административного правонарушения, продолжить процессуальные действия, согласно настоящему Кодексу.\n\nСотрудник правоохранительных органов, проводящий процессуальные действия, в праве потребовать от гражданина покинуть транспортное средство в ходе совершения процессуальных действий\n\n<b style=\"color:#f9b701\">Статья 9. Порядок действий эвакуации транспортного средства:</b>\n1) Зафиксировать правонарушение;\n\n2) Прицепить транспортное средство к эвакуатору (/at);\n\n3) Доставить транспортное средство на штрафстоянку.\n\nСотрудник правоохранительных органов в праве эвакуировать транспорт в случае, если гражданский был лишен водительского удостоверения за административные нарушения или транспортное средство было замечено в неправильной парковке.\n\nСотруднику правоохранительных органов запрещается эвакуация т/с в случае если:\n\n- Транспортное средство не мешает проезду другим транспортным средствам или проходу пешеходов (Искл. моменты, указанные в пункте 8.1 административного кодекса);\n\n- Транспортное средство полностью стоит на обочине проезжей части (не на тратуаре), не создаёт препятствие движению как другому транспорту, так и пешеходам;\n\n- Транспортное средство стоит травяном покрытии (в поле).\n\nСотрудник правоохранительных органов обязан иметь полные доказательства на нарушение перед эвакуацией т/с (включая момент, как сотрудник заметил транспортное средство и подъехал к нему для совершения процессуальных действий)."},
			{id:"proc-4", num:"4", title:". Доказательства и их Допустимость", text:"<b style=\"color:#f9b701\">Статья 10. Доказательства</b>\nДоказательствами по делу являются любые фактические данные, на основе которых, определенном законом, устанавливают наличие или отсутствие обстоятельств, имеющих значение для правильного разрешения дела.\n\n<b style=\"color:#f9b701\">Статья 11. Недопустимые Доказательства</b>\nНедопустимыми являются доказательства, полученные с нарушением требований закона. К недопустимым доказательствам относятся:\n\nПризнательные показания, полученные под давлением, угрозами или обманом.\n\nВещественные доказательства, полученные в ходе незаконного обыска или осмотра.\n\nИные доказательства, полученные с грубыми нарушениями закона, нарушающими права и свободы граждан."},
			{id:"proc-5", num:"5", title:". Стадия применения силы и правила использования табельного оружия", text:"<b style=\"color:#f9b701\">Статья 12. Стадии применения силы</b>\nч.1 Присутствие — стадия предполагает физическое присутствие сотрудника органов внутренних дел в форме или иной служебной одежде. Целью является установление контроля над ситуацией, предотвращение дальнейших правонарушений посредством демонстрации присутствия и авторитета сотрудников правоохранительных органов.\n\nч.2 Устные требования — стадия предусматривает, что сотрудник уполномоченного органа выдвигает четкие и понятные устные требования или распоряжения лицу, с целью достижения законных целей: обеспечение общественного порядка, безопасность, предотвращение правонарушений, требование предъявить документы и т.д.\n\nч.3 Применение спец средств — в случаях, когда устные команды оказываются недостаточными для пресечения угрозы или лицо пытается скрыться, сотрудник правоохранительных органов может использовать такие средства, как наручники, электрошокеры, дубинки и другие средства физического воздействия, не наносящие смертельных повреждений, с целью остановить правонарушителя.\n\nч.4 Применение летальных средств — является крайней мерой и допускается только в случае непосредственной угрозы жизни сотрудников или иных лиц. Использование огнестрельного оружия допускается исключительно при наличии реальной и неминуемой угрозы для жизни, например, при вооруженном нападении, попытке захвата заложников, или намеренном использовании оружия для сопротивления сотруднику. Перед применением оружия должны быть исчерпаны все возможные меры предотвращения и предупреждения."},
			{id:"proc-6", num:"6", title:"I. Право на Обжалование Процессуальных Действий", text:"<b style=\"color:#f9b701\">Статья 13. Право на Обжалование</b>\nКаждый задержанный имеет право на обжалование действий сотрудника силовой структуры в течение <span style=\"color:#8000ff\">72 часов</span>, если считает, что его права и свободы были нарушены.\n\n<b style=\"color:#f9b701\">Статья 14. Порядок Обжалования</b>\nЖалоба вышестоящему должностному лицу: Задержанный может подать жалобу руководителю соответствующей силовой структуры. Жалоба должна быть рассмотрена в установленный законом срок."}
		]
	},
	{
		id:"kto",
		title:"Закон о КТО",
		articles:[
			{id:"kto-1", num:"1", title:"Общие положения", text:"Настоящий закон устанавливает порядок введения и отмены режима Контртеррористической Операции (КТО) на территории Нижегородской области, а также определяет полномочия сотрудников Федеральной Службы Безопасности (ФСБ) и других правоохранительных органов в период действия режима КТО.\n\nРежим КТО вводится в целях пресечения террористической деятельности, освобождения заложников, ликвидации угроз жизни и здоровью граждан, а также обеспечения безопасности и правопорядка.\n\nРежим КТО является временной мерой и вводится только в случае, если иными способами невозможно обеспечить безопасность.\n\nПри введении и проведении КТО должны соблюдаться принципы законности, гуманизма, уважения прав и свобод граждан.\n\nРежим КТО объявляется и отменяется совместным решением Генерала ФСБ и Губернатора Нижегородской области."},
			{id:"kto-2", num:"2", title:"Основания для введения режима КТО", text:"Режим КТО может быть введен при наличии одного или нескольких следующих оснований:\n\nПолучение достоверной информации о подготовке или совершении террористического акта.\n\nЗахват заложников.\n\nОбнаружение взрывных устройств или других предметов, представляющих угрозу для жизни и здоровья граждан.\n\nСовершение террористического акта.\n\nНаличие вооруженного сопротивления со стороны террористов.\n\nУгроза совершения террористического акта.\n\nНаличие достаточного криминального рейтинга среди нелегальных структур."},
			{id:"kto-3", num:"3", title:"Порядок введения режима КТО", text:"Решение о введении режима КТО принимается Генералом ФСБ совместно с Губернатором Нижегородской области.\n\nВ решении об объявлении режима КТО должны быть указаны:\n\nОснования для введения режима КТО.\n\nТерритория, на которой вводится режим КТО (с указанием границ).\n\nВремя, на которое вводится режим КТО.\n\nСилы и средства, привлекаемые к проведению КТО.\n\nДолжностные лица, ответственные за проведение КТО.\n\nРешение об объявлении режима КТО незамедлительно доводится до сведения населения через средства массовой информации, систему оповещения и другие доступные способы.\n\nНа территории, где введен режим КТО, устанавливается штаб оперативного управления, который осуществляет координацию действий всех сил и средств, привлеченных к проведению КТО."},
			{id:"kto-4", num:"4", title:"Полномочия сотрудников правоохранительных органов в период действия режима КТО", text:"В период действия режима КТО сотрудники правоохранительных органов, в том числе сотрудники ФСБ, наделяются следующими полномочиями:\n\nОграничение свободы передвижения: Ограничивать или запрещать доступ граждан на территорию, где проводится КТО, а также временно эвакуировать граждан из опасных зон.\n\nПроверка документов: Проверять у граждан документы, удостоверяющие личность, а также документы, подтверждающие право на нахождение в определенной зоне.\n\nДосмотр: Осуществлять досмотр граждан, их вещей, транспортных средств и помещений.\n\nЗадержание: Задерживать лиц, подозреваемых в причастности к террористической деятельности, а также лиц, препятствующих проведению КТО или нарушающих общественный порядок.\n\nПрименение силы и оружия: Применять физическую силу, специальные средства и оружие в случаях и порядке, предусмотренных законодательством и правилами.\n\nИспользование транспорта: Использовать транспортные средства, принадлежащие гражданам и организациям (с возмещением причиненного ущерба).\n\nПриостановление деятельности: Приостанавливать деятельность организаций и предприятий, находящихся на территории КТО, если это необходимо для обеспечения безопасности.\n\nВскрытие помещений: Вскрывать помещения, в том числе жилые, в случае, если это необходимо для спасения жизни граждан или пресечения террористической деятельности (с соблюдением установленного порядка).\n\nБлокирование связи: Временно ограничивать или блокировать связь (мобильную, интернет и т.д.) на территории КТО (при необходимости).\n\nДругие полномочия: Осуществлять иные действия, необходимые для обеспечения безопасности и пресечения террористической деятельности, в соответствии с законодательством и правилами."},
			{id:"kto-5", num:"5", title:"Порядок проведения КТО", text:"Проведение КТО осуществляется в соответствии с планом, утвержденным штабом оперативного управления.\n\nПлан КТО должен предусматривать:\n\nОпределение целей и задач КТО.\n\nОпределение сил и средств, привлекаемых к КТО.\n\nПорядок взаимодействия между различными подразделениями и службами.\n\nМеры по обеспечению безопасности граждан.\n\nПорядок эвакуации населения.\n\nПорядок задержания и обезвреживания террористов.\n\nМеры по оказанию медицинской помощи пострадавшим.\n\nМеры по обеспечению связи и информированию населения.\n\nПри проведении КТО приоритетом является спасение жизни и здоровья граждан.\n\nПри проведении КТО запрещается:\n\nПрименение пыток и других жестоких, бесчеловечных или унижающих достоинство видов обращения.\n\nОграничение прав и свобод граждан, не связанных с обеспечением безопасности.\n\nРазглашение сведений, составляющих государственную тайну.\n\nО проведенных мероприятиях в рамках КТО составляется отчет, который представляется Генералу ФСБ и Губернатору Нижегородской области."},
			{id:"kto-6", num:"6", title:"Отмена режима КТО", text:"Режим КТО отменяется совместным решением Генерала ФСБ и Губернатора Нижегородской области.\n\nРежим КТО отменяется после ликвидации угрозы терроризма, освобождения заложников, стабилизации обстановки и восстановления правопорядка.\n\nО факте отмены режима КТО незамедлительно доводится до сведения населения через средства массовой информации и другие доступные способы."},
			{id:"kto-7", num:"7", title:"Ответственность", text:"За нарушение настоящего закона виновные лица несут ответственность в соответствии с законодательством и правилами.\n\nЗлоупотребление полномочиями сотрудниками правоохранительных органов в период действия режима КТО влечет за собой дисциплинарную, административную или уголовную ответственность."}
		]
	},
	{
	id:"euss",
	title:"ЕУСС",
	articles:[
		{id:"euss-1", num:"1", title:"Общие положения", text:"Единый Устав — основной документ, которым руководствуются все силовые структуры Нижегородской Области: МВД | ФСБ | Мин. Обороны | ФСИН. Устав определяет основные права и обязанности всех гос. сотрудников и помогает вычислять нарушителей. Распространяется на всех сотрудников без исключений.\n\nВиды взысканий: устное предупреждение (только по жалобам на офф. портале, при лёгком нарушении без вреда другим и без прежних взысканий — максимум один раз за всё время в организации) → выговор → строгий выговор (2 выговора) → понижение → увольнение → занесение в чёрный список организации → уголовная ответственность.\n\nРаздел №1 распространяется на все силовые структуры (МВД, ФСБ, Мин. Обороны, ФСИН) и включает 3 подраздела с разным уровнем наказания — от выговора до увольнения с заключением под стражу.\n\n<b>Подраздел №1</b> — наказание: От устного предупреждения до строгого выговора. Сюда также входят: Общие Правила Гос. Организаций | Законодательная База.\n\n<b>1.1</b> Запрещено покидать территорию Вашей организации без разрешения старшего состава (8-10 ранга, исключение ФСИН 4-6 ранга) [Исключением является работа по вызовам, патруль, задержание, посты, допросы] | Также запрещено снимать форму в рабочее время и находится без нее.\n\n<b>1.2</b> Запрещено спать в неположенном месте более 10-ти минут [Афк разрешен только в раздевалке] (Исключение: Генерал/Полковник/Начальник Тюрьмы/Зам Начальника Тюрьмы)\n\n<b>1.3</b> Запрещено использование запрещенных аксессуаров (Под запрещенными имеются в виду аксессуары, которые запрещено надевать системно. Запрещено багоюзить аксессуары. Надевать аксессуары не по теме (К примеру, если на скине уже есть головной убор - запрещено надевать второй в качестве аксессуара)).\n\n<b>1.4</b> За игнорирование приказа старшего по званию при условии того, что приказ был адекватным.\n\n<b>1.5</b> Запрещено несоблюдение субординации по отношению к коллегам, оскорбление жителей области, коллег, нецензурная лексика, неуважительное общение с гражданскими лицами. Исключение: В случае задержания/штурма или оскорбительного поведения в сторону силовика СОБР или ФСБ, сотрудники в праве нарушить данный пункт устава без грубых оскорблений и перехода на личность. (Примечание: в иных ситуациях обращение к гражданским должно быть только на \"Вы\" | Старший по должности/званию имеет право обращаться к младшему на \"Ты\" с использованием нецензурной лексики, но не переходя на оскорбления. Сотрудники ФСИН могут использовать нецензурную лексику при общении с заключенными, без перехода на оскорбления).\n\n<b>1.6</b> Запрещено использование личного транспорта во время рабочего дня (исключение сотрудники ФСБ на транспорте который был зарегистрирован)\n\n<b>1.7</b> Запрещено использование транспорта организации в личных целях. Запрещено использование стробоскопов и звукового сопровождения без весомой на то причины, а также запрещен проезд на Красный сигнал светофора без уважительной причины. Запрещено нарушение правил дорожного движения без использования стробоскопов и звукового сопровождения (Исключение: в патруле разрешено использование стробоскопов без звукового сопровождения)\n\n<b>1.8</b> Запрещено игнорирование просьб, поручений и приказов в рацию от старшего состава (8-10 ранг, исключение ФСИН/ФСБ 4-6 ранга)\n\n<b>1.9</b> Запрещено неадекватное/деструктивное поведение.\n\n<b>1.10</b> Запрещено создание конфликтных ситуаций.\n\n<b>1.11</b> Запрещена неявка на общее построение состава без разрешения проводящего.\n\n<b>1.12</b> Запрещено использование сторонних предметов (телефон, оружие и пр.) во время построения.\n\n<b>1.13</b> Запрещено разговаривать во время построения.\n\n<b>1.14</b> Запрещено покидать строй без разрешения проводящего.\n\n<b>1.15</b> Запрещено намерено уходить в сон ((AFK и выход из игры)) для неявки на всеобщее построение. Запрещено уходить в сон во время строя (более 1 минуты).\n\n<b>1.16</b> Запрещено постоянное выпрашивание проверки отчётов, повышения. (1-2 раза не считается)\n\n<b>1.17</b> Запрещена подделка отчётов на оф. портале.\n\n<b>1.18</b> Запрещено нарушение Законодательной Базы (при условии, что тяжесть нарушения менее 3-х уровней розыска).\n\n<b>1.18.2</b> Запрещено нарушение правил гос. структур (Не правил проекта. Правила, касающиеся РП процесса).-\n\n<b>1.19</b> Каждый сотрудник обязан состоять в определенном отделе и исполнять должностные обязанности, исходя из деятельности данного отдела (ГИБДД - штрафы, ГУВД - преступники и т.д).\n\n<b>1.20</b> Запрещено не соответствовать минимальным критериям для вступления во фракцию (Понижение законопослушности ниже минимальных критериев после вступления, просрок мед. карты и т.д).\n\n<b>1.21</b> Запрещено использование личного оружия. Разрешено использовать только то, что выдается на складе (Искл. созданные лидером отдельные отряды, выполняющие род деятельности, в котором есть необходимость использовать иное оружие. Отряд должен быть ограничен в количестве людей). После окончания рабочего дня необходимо сдать все служебное обмундирование обратно на склад (Оружие, бронижелет).\n\n<b>1.22</b> Запрещено превышение должностных полномочий, которое не привело к серьезным последствиям (взятие в /escort сотрудника мвд/фсб без причины, проезд на охраняемую территорию без пропуска, \"кража\" преступников у своих коллег, когда те уже провели процессуальные действия по отношению к преступнику и не передали его другому сотруднику добровольно, и так далее)\n\n<b>1.23</b> Запрещено намекать на взятки\n\n<b>1.24</b> Запрещено оставлять КПП организаций открытыми/шлагбаумы на постах закрытыми без необходимости.\n\n<b>Подраздел №2</b> — наказание: Увольнение с занесением в Чёрный список организации.\n\n<b>1.25</b> Запрещено употребление алкогольных/психотропных/наркотических веществ\n\n<b>1.26</b> Запрещено иметь любые связи с криминальными структурами( обсуждение/совершение с  кем-либо действий, запрещённых установленными УК и КоАП )\n\n<b>Подраздел №3</b> — наказание: От строгого выговора до увольнения с заключением под стражу — зависит от нарушения.\n\n<b>1.27</b> Запрещено давать или же брать взятки.\n\n<b>1.28</b> Запрещено халатно относиться к своему посту. Использование оружия без необходимости (стрельба в интерьере, стрельба по стене, стрельба по людям, стрельба по проезжающим автомобилям, выдача розыска игрокам без причины).\n\n<b>1.29</b> Запрещено нарушение УК  (3+ уровень розыска)."},
		{id:"euss-2", num:"2", title:"Положение Устава МВД | ФСБ", text:"За нарушение Устава сотрудники, которые используют свои полномочия в личных целях, наказываются увольнением с заключением под стражу по ст. 6.3 УК. За нарушения, наказуемые выговором, ставится метка [В]; в остальных случаях — статья 6.3 УК.\n\n<b>2.1</b> Запрещено находится одному на посту (Исключение: с 00:00 до 06:00, патруль на мотоцикле, сотрудники ФСБ) - [Выговор]\n\n<b>2.2</b> Запрещено выезжать в патруль, выдавать штрафы или задерживать граждан, имея звание Рядовой или Сержант (исключение сотрудники ФСБ) - Выговор\n\n<b>2.3</b> Запрещено заезжать на территорию ФСИН с заключенным без разрешения сотрудников ФСИН (исключение: если нет сотрудников у главных ворот, сотрудники ФСБ при исполнении только в форме ФСБ) - [Выговор]\n\n<b>2.4</b> Запрещено возбуждение уголовного дела к гражданину, не совершившему преступление. - статья 6.3 УК\n\n<b>2.5</b> Запрещено выставлять ограждения без весомой на то причины, а также оставлять их без присмотра - Выговор\n\n<b>2.6</b> Запрещено использование средств экстренной остановки транспортного средства ( шипы ) без весомой причины ( используется только при погоне за преступником и дальнейшим его перехвате) - Выговор\n\n<b>2.7</b> Запрещено проводить обыск лиц, которые не находятся в розыске, либо же не вызывают подозрение (пример: оружие в руках, разговоры о запрещенных веществах) без ордера - [Выговор]\n\n<b>2.8</b> Находясь в Организации ФСБ - Использование различного транспорта других организаций без причины (личные дела, катание по парковкам и тд)  [Запрещено брать т/c другой организации, если их количество меньше 5 штук на парковке | В случае взятия т/с другой организации, необходимо иметь опровержение на то, что для этого была необходимость] - Наказание выговор.\n\n<b>2.9</b> Использование своих полномочий для насмехательства над остальными фракциями, приезжать на проверки без причины, заставлять сотрудников делать вещи которые не относятся к RP-процессу. статья 6.2 УК\n\n<b>2.10</b> Во время работы под прикрытием у сотрудника МВД обязана быть видеозапись всего процесса с момента выдачи (отпуска для начала работы и до момента ареста игрока при передаче нарушителя в КПЗ/Тюрьму. - Выговор\n\n<b>2.11</b> Сотрудник МВД, который работает под прикрытием, обязан иметь транспорт, который соответствует минимальным критериям, что указаны в специальном разделе - Выговор\n\n<b>2.12</b> Сотруднику МВД под прикрытием запрещены любые нарушения УК, КоАП, ФЗоП, УПК от [выговора] до статьи 6.3\n\n<b>2.13</b> Сотруднику МВД во время работы под прикрытием, запрещено занимается личными делами/кататься на личном транспорте, и находиться в различных местах для личной выгоды с целью прогула рабочего дня, то сотрудник будет [Уволен]\n\n<b>2.14</b> Запрещено нарушение закона о \"Неприкосновенности лиц\" [от Выговора до статьи 6.3 УК\n\n<b>2.15</b> Запрещено нарушение закона о \"Адвокатуре\" [строгий выговор]\n\n<b>2.16</b> Использование маскировки в Личных Целях [от строгого выговора до увольнения]\n\n<b>2.17</b> Использование глушилки без причины (в личных целях) [Выговор]\n\n<b>2.18</b> Запрещено участие в КТО для сотрудников МВД без формы и подразделении [СОБР] - строгий выговор\n\n<b>2.19</b> Запрещено выезжать за нарушителями по /wanted если у них 3 и менее звезд розыска, разрешено только от 4+ - строгий выговор [Пункт только для ФСБ]\n\n<b>2.20</b> Запрещено заниматься своими делами во время процесса задержания (езда с заключенным просто так, вместо того, чтобы доставить его в отдел/кпз/фсин) - строгий выговор\n\n<b>2.21</b> Запрещено нарушение \"Процессуального Кодекса\" - от выговора до строгого выговора\n\n<b>2.22</b> Запрещено выдавать выговор/увольнять сотрудников других фракций без имеющихся доказательств - от строгого выговора до увольнения, со снятием выговоров/восстановлением игрока в отношении которого было совершено нарушение. [Пункт только для ФСБ]\n\n<b>2.23</b> Запрещено выдавать выговор/увольнять сотрудников других организаций без причины - от строгого выговора до увольнения, со снятием выговоров/восстановлением игрока в отношении которого было совершено нарушение. [Пункт только для ФСБ]\n\nВажно: серьёзность наказания соответствует занимаемой должности/званию сотрудника. Сотрудники МВД и ФСБ обязаны соблюдать все законы, относящиеся к их фракции. Незнание правил не освобождает от ответственности."},
		{id:"euss-3", num:"3", title:"Положение Устава ФСИН", text:"За нарушение Устава сотрудники, которые используют свои полномочия в личных целях, наказываются увольнением с заключением под стражу по статье 6.3 УК.\n\n<b>3.1</b> Запрещено намеренно уводить заключенных из камер в карцер или медицинский блок, чтобы адвокат не смог их выпустить - [Выговор]\n\n<b>3.2</b> Запрещено использование кнопки экстренного открытия всех дверей/нажимать на кнопку тревоги без причины. [строгий выговор]\n\n<b>3.3</b> Запрещено избивать и убивать заключенных без весомой на то причины [от строгого выговора до статьи 6.3 УК]\n\n<b>3.4</b> Запрещено выпускать заключенных, находящихся в карцере. - [Выговор]\n\n<b>3.5</b> Запрещено оставлять открытыми двери камер - [Выговор]\n\n<b>3.6</b> Запрещено использовать преимущества сотрудника ФСИН для корыстных целей (блат заключенных и т.д) - статья 6.3 УК.\n\n<b>3.7</b> Запрещено нарушение правил по УДО [Статья 6.1 УК]"},
		{id:"euss-4", num:"4", title:"Положение Устава Мин. Обороны", text:"За нарушение Устава сотрудники, которые используют свои полномочия в личных целях, наказываются увольнением с заключением под стражу по статье 6.3 УК.\n\n<b>4.1</b> Запрещено сливать склад, продавать материалы, впускать посторонних на территорию воинской части не имея на то причины или приказа от старшего состава, впускать посторонних на территорию секретной базы - статья 6.3  УК + добавление в чёрный список организации.\n\n<b>4.2</b> Запрещено открывать огонь на КПП без весомой на то причины - статья 6.3 УК\n\n<b>4.3</b> Запрещено парковать личные автомобили на территории военной части - [Выговор]\n\n<b>4.4</b> Запрещено стоять на крыше КПП, на заборах воинской части - [Выговор]\n\n<b>4.5</b> Военнослужащим запрещено передвигаться одному в машине за материалами - [строгий выговор]\n\n<b>4.6</b> Использование БТР на военной части для обороны разрешено военнослужащим начиная со звания Подполковника (8 ранг) - [строгий выговор]\n\n<b>4.7</b> Использовать БТР для обороны военной части с 13:00 до 17:00 по МСК и при условии состояния склада менее 35.000 - [Выговор]\n\n<b>4.8</b> Военнослужащим запрещено использовать БТР в случае пробития его колес - [Выговор]\n\n<b>4.9</b> Запрещено передвигаться на БТР по населенным пунктам без причины - [Выговор]\n\n<b>4.10</b> Военнослужащим/Руководству армии (5+ранг) разрешено передвигаться одному до военкомата в целях обеспечения транспорта и дальнейшей доставки новобранцев до территории военной части."}
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
			if(this.mode==="laws")  return this.tabs.filter(t=>t.key==="laws");
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
