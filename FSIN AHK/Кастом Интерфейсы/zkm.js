import{r as resolveComponent,o as openBlock,c as createElementBlock,b as createVNode,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,e as createTextVNode,t as toDisplayString,f as createCommentVNode,w as withCtx,T as Transition,_ as _export_sfc}from"./index.js";
import{M as ModalComponent,a as MODAL_TYPES,b as MODAL_COLOR_TYPES}from"./Modal.js";

// ── Безопасное разрешение Modal-биндингов ──────────────────────────────────
// import-строки ВЫШЕ стрипаются загрузчиком перед eval().
// Пробуем взять через замыкание eval; если CEF не пробрасывает module-scope —
// берём из window.__zkm_ns, который загрузчик выставляет строго ДО eval().
const _ZKM_MC  = (typeof ModalComponent    !=="undefined"?ModalComponent    :null)||(window.__zkm_ns||{}).ModalComponent;
const _ZKM_MT  = (typeof MODAL_TYPES       !=="undefined"?MODAL_TYPES       :null)||(window.__zkm_ns||{}).MODAL_TYPES;
const _ZKM_MCT = (typeof MODAL_COLOR_TYPES !=="undefined"?MODAL_COLOR_TYPES :null)||(window.__zkm_ns||{}).MODAL_COLOR_TYPES;
if(!_ZKM_MC)console.error("[zkm] ModalComponent не разрешён — render упадёт!");


// SVG иконки — вместо Unicode-символов которые не работают в CEF
const SVG_SEARCH=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(244,241,225,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(244,241,225,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SVG_BURGER=`<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/><rect y="4.25" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/><rect y="8.5" width="14" height="1.5" rx="0.75" fill="rgba(244,241,225,0.6)"/></svg>`;
const SVG_CHECK=`<svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4l3 3 5-6" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_RECEIPT=`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="2" width="20" height="24" rx="2" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.18)" stroke-width="1.2"/><line x1="8" y1="8" x2="20" y2="8" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="12" x2="20" y2="12" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="16" x2="16" y2="16" stroke="rgba(244,241,225,0.25)" stroke-width="1.2"/><line x1="8" y1="20" x2="14" y2="20" stroke="rgba(244,241,225,0.15)" stroke-width="1.2"/></svg>`;
const SVG_CHEVRON=`<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 1l3 3-3 3" stroke="rgba(244,241,225,0.5)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_DOC=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 1.5h5.5L11 4v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5z" stroke="rgba(249,183,1,0.6)" stroke-width="1.1" fill="rgba(249,183,1,0.06)"/><path d="M8.5 1.5V4H11" stroke="rgba(249,183,1,0.6)" stroke-width="1.1"/></svg>`;
const SVG_BOOK_EMPTY=`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 6a2 2 0 0 1 2-2h7v24H7a2 2 0 0 1-2-2V6z" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/><path d="M27 6a2 2 0 0 0-2-2h-7v24h7a2 2 0 0 0 2-2V6z" fill="rgba(244,241,225,0.06)" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/><line x1="16" y1="4" x2="16" y2="30" stroke="rgba(244,241,225,0.15)" stroke-width="1.1"/></svg>`;

// ══════════════════════════════════════════════════════════════════
//  Автоисправление раскладки клавиатуры для поиска (EN → RU)
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
//  Унификация «ё» и «е» при поиске
// ══════════════════════════════════════════════════════════════════
function normalizeText(str){
	return str?str.toLowerCase().replace(/ё/g,"е"):"";
}

// ══════════════════════════════════════════════════════════════════
//  Точный поиск по номеру статьи
// ══════════════════════════════════════════════════════════════════
function isNumericQuery(q){return /^[0-9]+(\.[0-9]+)*$/.test(q);}
function numMatch(num,q){return num===q||num.startsWith(q+".");}

// ══════════════════════════════════════════════════════════════════
//  Разбор текста главы на отдельные статьи/пункты
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

// ── Статические узлы ──────────────────────────────────────────────
const _hoisted_search={class:"laws-helper__search"};
const _hoisted_body={class:"laws-helper__body"};

// ══════════════════════════════════════════════════════════════════
//  render — корневой элемент теперь <Modal>, как в Window.js /
//  SideMenu.js. Фон, рамка, свечение и граффити рисует Modal.
//  В слоте: строка табов + кнопок, строка поиска, тело с законами.
// ══════════════════════════════════════════════════════════════════
function render(_ctx,_cache,$props,$setup,$data,$options){
	// Guard: без ModalComponent рендер упадёт → показываем пустой комментарий
	if(!_ZKM_MC)return createCommentVNode("zkm-no-modal",true);
	const currentTabKey=$options.visibleTabs[$data.currentTab]?.key;
	return createVNode(_ZKM_MC,{
		class:"zkm window",
		isOpened:$data.zkmIsOpened,
		colorType:_ZKM_MCT?.ORANGE,
		type:_ZKM_MT?.NO_OVERLAY,
		titleIsHtml:true,
		title:$options.titleHtml
	},{
		default:withCtx(()=>[
			// ─── Подзаголовок: табы + кнопки ─────────────────────────────
			createBaseVNode("div",{class:"zkm__subheader"},[
				createBaseVNode("div",{class:"laws-helper__tabs"},[
					(openBlock(true),createElementBlock(Fragment,null,renderList($options.visibleTabs,(tab,i)=>(
						openBlock(),createElementBlock("div",{
							class:normalizeClass(["laws-helper__tab",{"laws-helper__tab_active":i===$data.currentTab}]),
							key:tab.key,
							onClick:$event=>$options.selectTab(i)
						},toDisplayString(tab.title),11,["onClick"])
					)),128))
				]),
				createBaseVNode("div",{class:"zkm__header-actions"},[
					createBaseVNode("div",{class:"laws-helper__icon-btn",innerHTML:SVG_BURGER}),
					createBaseVNode("div",{
						class:"laws-helper__icon-btn laws-helper__close-btn",
						onClick:$options.close
					},"X",8,["onClick"])
				])
			]),
			// ─── Строка поиска ────────────────────────────────────────────
			createBaseVNode("div",_hoisted_search,[
				createBaseVNode("span",{class:"laws-helper__search-icon",innerHTML:SVG_SEARCH}),
				createBaseVNode("input",{
					type:"text",
					placeholder:currentTabKey==="laws"?"Поиск по статьям и документам...":"Поиск нарушения...",
					value:$data.search,
					onInput:$event=>{$data.search=$event.target.value}
				},null,40,["value","onInput","placeholder"]),
				// Фильтр по документу — только для таба ЗАКОНЫ
				currentTabKey==="laws"
					?(openBlock(),createElementBlock("div",{key:"law-filters",class:"laws-helper__search-filters"},[
						createBaseVNode("div",{
							class:normalizeClass(["laws-helper__fine-filter-btn",{"laws-helper__fine-filter-btn_active":$data.lawDocType==="all"}]),
							onClick:$event=>{$data.lawDocType="all";}
						},"Все",10,["onClick"]),
						createBaseVNode("div",{
							class:normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_koap",{"laws-helper__fine-filter-btn_active":$data.lawDocType==="koap"}]),
							onClick:$event=>{$data.lawDocType="koap";}
						},"КоАП",10,["onClick"]),
						createBaseVNode("div",{
							class:normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_uk",{"laws-helper__fine-filter-btn_active":$data.lawDocType==="uk"}]),
							onClick:$event=>{$data.lawDocType="uk";}
						},"УК",10,["onClick"]),
						createBaseVNode("div",{
							class:normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_proc",{"laws-helper__fine-filter-btn_active":$data.lawDocType==="proc"}]),
							onClick:$event=>{$data.lawDocType="proc";}
						},"Проц.",10,["onClick"]),
						createBaseVNode("div",{
							class:normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_kto",{"laws-helper__fine-filter-btn_active":$data.lawDocType==="kto"}]),
							onClick:$event=>{$data.lawDocType="kto";}
						},"КТО",10,["onClick"]),
						createBaseVNode("div",{
							class:normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_euss",{"laws-helper__fine-filter-btn_active":$data.lawDocType==="euss"}]),
							onClick:$event=>{$data.lawDocType="euss";}
						},"ЕУСС",10,["onClick"]),
						createBaseVNode("div",{
							class:normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_zot",{"laws-helper__fine-filter-btn_active":$data.lawDocType==="zot"}]),
							onClick:$event=>{$data.lawDocType="zot";}
						},"ЗОТ",10,["onClick"]),
						createBaseVNode("div",{
							class:normalizeClass(["laws-helper__fine-filter-btn laws-helper__law-filter-btn_euvs",{"laws-helper__fine-filter-btn_active":$data.lawDocType==="euvs"}]),
							onClick:$event=>{$data.lawDocType="euvs";}
						},"ЕУВС",10,["onClick"])
					]))
					:createCommentVNode("",true)
			]),
			// ─── Тело ─────────────────────────────────────────────────────
			createBaseVNode("div",_hoisted_body,[
				currentTabKey==="laws"
					?(openBlock(),createElementBlock("div",{key:"laws",class:"laws-helper__laws-inline-wrap"},[
						$data.lawsLoading
							?(openBlock(),createElementBlock("div",{key:"loading",class:"laws-helper__inline-empty"},"Загрузка законов..."))
							:$data.lawsLoadError
								?(openBlock(),createElementBlock("div",{key:"error",class:"laws-helper__inline-empty"},"Не удалось загрузить законы. Проверьте соединение."))
								:$options.filteredLawDocuments.length===0
									?(openBlock(),createElementBlock("div",{key:"empty",class:"laws-helper__inline-empty"},"Ничего не найдено."))
									:(openBlock(true),createElementBlock(Fragment,null,renderList($options.filteredLawDocuments,(doc)=>(
										openBlock(),createElementBlock("div",{key:doc.id,class:"laws-helper__inline-doc"},[
											createBaseVNode("div",{class:"laws-helper__inline-doc-header"},[
												createBaseVNode("div",{
													class:normalizeClass(["laws-helper__article-doc-tag","laws-helper__article-doc-tag_"+doc.id])
												},toDisplayString(doc.title),3),
												createBaseVNode("span",{class:"laws-helper__inline-doc-title"},toDisplayString(
													doc.title==="КоАП"?"Кодекс об административных правонарушениях":
													doc.title==="УК"?"Уголовный кодекс":
													doc.title==="Процессуальный кодекс"?"Процессуальный кодекс":
													doc.title==="Закон о КТО"?"Закон о контртеррористической операции":
													doc.title==="ЕУСС"?"Единый устав силовых структур":
													doc.title==="Закон о ЗОТ"?"Закон о закрытых и охраняемых территориях":
													doc.title==="ЕУВС"?"Единый устав военных структур":
													doc.title
												),1)
											]),
											(openBlock(true),createElementBlock(Fragment,null,renderList(doc.articles,(art)=>(
												openBlock(),createElementBlock("div",{key:art.id,class:"laws-helper__inline-article"},[
													createBaseVNode("div",{class:"laws-helper__inline-article-head"},[
														createBaseVNode("span",{class:"laws-helper__inline-article-num"},"Ст. "+toDisplayString(art.num)+". "),
														createTextVNode(toDisplayString(art.title))
													]),
													createBaseVNode("div",{class:"laws-helper__inline-article-divider"}),
													art.text
														?(openBlock(),createElementBlock("div",{key:"text",class:"laws-helper__inline-article-text",innerHTML:art.text}))
														:(openBlock(),createElementBlock("div",{key:"no-text",class:"laws-helper__inline-empty"},"Текст статьи пока не добавлен."))
												])
											)),128))
										])
									)),128))
					]))
					:(openBlock(),createElementBlock("div",{key:"other",class:"laws-helper__content"},[
						createBaseVNode("div",{innerHTML:$options.currentContent})
					]))
			])
		]),
		_:1
	},8,["isOpened","title"]);
}

// ══════════════════════════════════════════════════════════════════
//  Данные законов грузятся с GitHub (см. loadAllLawData)
// ══════════════════════════════════════════════════════════════════
const _GH_BASE_LAWS_12="https://raw.githubusercontent.com/BensonZahar/Hud.js/main/"+encodeURIComponent("Законы AHK")+"/12/";

const LAW_DOC_META=[
	{id:"koap",title:"КоАП"},
	{id:"uk",  title:"УК"},
	{id:"proc",title:"Процессуальный кодекс"},
	{id:"kto", title:"Закон о КТО"},
	{id:"euss",title:"ЕУСС"},
	{id:"euvs",title:"ЕУВС"},
	{id:"zot", title:"Закон о ЗОТ"}
];

let _lawDataLoadPromise=null;
function loadAllLawData(){
	if(_lawDataLoadPromise)return _lawDataLoadPromise;
	_lawDataLoadPromise=(async()=>{
		let prefetched=window.__prefetch_zkm_lawdocs;
		if(!prefetched&&window.__prefetch_zkm_lawdocs_promise){
			try{prefetched=await window.__prefetch_zkm_lawdocs_promise;}
			catch(e){}
		}
		prefetched=prefetched||{};
		const parsedDocs=await Promise.all(LAW_DOC_META.map(async(meta)=>{
			let raw=prefetched[meta.id];
			if(!raw)raw=await _xhrGetLaws(_GH_BASE_LAWS_12+meta.id+".json",0);
			return JSON.parse(raw);
		}));
		const lawDocuments=parsedDocs.map((doc,i)=>({
			id:LAW_DOC_META[i].id,
			title:LAW_DOC_META[i].title,
			articles:doc.articles||[]
		}));
		return{lawDocuments};
	})();
	return _lawDataLoadPromise;
}

function _xhrGetLaws(url,attempt){
	return new Promise(function(resolve,reject){
		var xhr=new XMLHttpRequest();
		xhr.open("GET",url+"?_="+Date.now(),true);
		xhr.onload=function(){
			if(xhr.status>=200&&xhr.status<300)resolve(xhr.responseText);
			else if(attempt<8)setTimeout(function(){_xhrGetLaws(url,attempt+1).then(resolve,reject);},Math.min(1000*Math.pow(2,attempt),16000));
			else reject(new Error("HTTP "+xhr.status));
		};
		xhr.onerror=function(){
			if(attempt<8)setTimeout(function(){_xhrGetLaws(url,attempt+1).then(resolve,reject);},Math.min(1000*Math.pow(2,attempt),16000));
			else reject(new Error("Network"));
		};
		xhr.send();
	});
}

const _sfc_main={
	name:"LawsHelper",
	// ── Modal подключён как компонент — рисует фон, рамку, свечение,
	//    граффити-паттерн и заголовок, как в Window.js / SideMenu.js.
	components:{Modal:_ZKM_MC},
	data(){
		return{
			version:"V4.1.0",
			search:"",
			mode:null,
			currentTab:0,
			// zkmIsOpened стартует false; в mounted() переводим в true —
			// Modal проигрывает анимацию появления (modal-scale).
			zkmIsOpened:false,
			lawDocuments:[],
			lawsLoading:true,
			lawsLoadError:false,
			lawDocType:"all",
			expandedDocs:[],
			selectedLawArticleId:null,
			tabs:[
				{key:"laws",  title:"ЗАКОНЫ"},
				{key:"binder",title:"БИНДЕР"}
			],
			content:{
				binder:`<div class="laws-helper__placeholder">Раздел "Биндер" — в разработке</div>`
			}
		}
	},
	computed:{
		// ── Заголовок для Modal (titleIsHtml:true) ────────────────────
		titleHtml(){
			return `KONST <span style="color:#f9b701">AHK</span>`
				+`<span class="laws-helper__title-version"> ${this.version}</span>`;
		},
		// ── Список табов с учётом режима ──────────────────────────────
		visibleTabs(){
			if(this.mode==="laws")return this.tabs.filter(t=>t.key==="laws");
			return this.tabs;
		},
		// ── ЗАКОНЫ: фильтрация по поиску ──────────────────────────────
		filteredLawDocuments(){
			const q=normalizeText(this.search.trim());
			let docs=this.lawDocuments;
			if(this.lawDocType!=="all")docs=docs.filter(d=>d.id===this.lawDocType);
			if(!q)return docs;
			const qAlt=fixLayout(q);
			const matchQ=(text)=>{
				const norm=normalizeText(text);
				return norm.includes(q)||(qAlt!==q&&norm.includes(qAlt));
			};
			const isNum=isNumericQuery(q);
			return docs.map(doc=>{
				const resultArticles=[];
				for(const a of doc.articles){
					const subArts=parseSubArticles(a.text);
					if(isNum){
						const exact=subArts.filter(s=>s.num===q);
						if(exact.length){
							for(const s of exact)resultArticles.push({id:a.id+"__"+s.num,num:s.num,title:s.title,text:s.html});
							continue;
						}
					}else if(subArts.length){
						const found=subArts.filter(s=>{
							const subPlain=normalizeText(s.html.replace(/<[^>]+>/g," ").replace(/\s+/g," "));
							return matchQ(s.title)||matchQ(subPlain);
						});
						if(found.length){
							for(const s of found)resultArticles.push({id:a.id+"__"+s.num,num:s.num,title:s.title,text:s.html});
							continue;
						}
					}
					const plainText=a.text?normalizeText(a.text.replace(/<[^>]+>/g," ").replace(/\s+/g," ")):"";
					const numMatched=isNum?numMatch(a.num.toLowerCase(),q):a.num.toLowerCase().includes(q);
					if(numMatched||matchQ(a.title)||matchQ(plainText))resultArticles.push(a);
				}
				if(resultArticles.length===0&&matchQ(doc.title))return doc;
				if(resultArticles.length===0)return null;
				return{...doc,articles:resultArticles};
			}).filter(Boolean);
		},
		flatLawArticles(){
			const arr=[];
			for(const doc of this.filteredLawDocuments){
				for(const a of doc.articles){arr.push({...a,docId:doc.id,docTitle:doc.title});}
			}
			return arr;
		},
		selectedLawArticle(){
			if(!this.selectedLawArticleId)return null;
			const sepIdx=this.selectedLawArticleId.indexOf("__");
			if(sepIdx!==-1){
				const baseId=this.selectedLawArticleId.slice(0,sepIdx);
				const subNum=this.selectedLawArticleId.slice(sepIdx+2);
				for(const doc of this.lawDocuments){
					const found=doc.articles.find(a=>a.id===baseId);
					if(found){
						const sub=parseSubArticles(found.text).find(s=>s.num===subNum);
						if(sub)return{id:this.selectedLawArticleId,num:sub.num,title:sub.title,text:sub.html,docTitle:doc.title};
					}
				}
				return null;
			}
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
		// ── Активируем Modal — он проиграет анимацию modal-scale ──────
		this.zkmIsOpened=true;

		// ── Загрузка законов (7 файлов с GitHub) ──────────────────────
		loadAllLawData().then(({lawDocuments})=>{
			this.lawDocuments=lawDocuments;
			this.expandedDocs=[lawDocuments[0]?.id].filter(Boolean);
			this.lawsLoading=false;
		}).catch(e=>{
			console.error("[zkm] не удалось загрузить данные законов:",e);
			this.lawsLoading=false;
			this.lawsLoadError=true;
		});

		// ── Режим открытия: "laws" | null ─────────────────────────────
		const openMode=window._duranOpenMode||null;
		window._duranOpenMode=null;
		this.mode=openMode;
		this.currentTab=0;

		// ── Alt-key: курсор и скрытие меню ───────────────────────────
		this._menuHidden=false;
		this._altHoldTimer=null;
		this._altHoldFired=false;
		this._blurredInput=null;
		const _ZKM_ALT_HOLD_MS=500;
		this._prevOnKeyUp=window.onKeyUp;
		this._prevOnKeyDown=window.onKeyDown;
		window.onKeyDown=(e)=>{
			if(e===window.KEY_CODE_ALT){
				if(!this._altHoldTimer&&!this._altHoldFired){
					this._altHoldTimer=setTimeout(()=>{
						this._altHoldTimer=null;
						this._altHoldFired=true;
						this._menuHidden=!this._menuHidden;
						if(this._menuHidden){
							// this.$el — это корневой .modal.zkm
							this.$el.classList.add("laws-helper_hidden");
							this.hideCursor();
						}else{
							this.$el.classList.remove("laws-helper_hidden");
							this.showCursor();
						}
					},_ZKM_ALT_HOLD_MS);
				}
				return;
			}
			if(typeof this._prevOnKeyDown==="function")this._prevOnKeyDown(e);
		};
		window.onKeyUp=(e)=>{
			if(e===window.KEY_CODE_ESC){this.close();return}
			if(e===window.KEY_CODE_ALT){
				if(this._altHoldTimer){
					clearTimeout(this._altHoldTimer);
					this._altHoldTimer=null;
					if(!this._menuHidden){
						const _curActive=window.isCursorActive("Zkm");
						if(_curActive){this.hideCursor();}
						else{this.showCursor();}
					}
				}
				this._altHoldFired=false;
				return;
			}
			if(typeof this._prevOnKeyUp==="function")this._prevOnKeyUp(e);
		};

		// Метки над игроками оставляем видимыми
		if(!window.App?.developmentMode)window.setDrawLabelStatus(true);

		// ── setTimeout(0): ждём пока Modal полностью отрисует карточку.
		//    Modal имеет два вложенных nextTick до появления контента
		//    (isOpened→modalIsOpened→contentIsOpened), поэтому простого
		//    $nextTick недостаточно — нужно выйти из микротасков.
		setTimeout(()=>{
			// Фокус на поле поиска
			this.focusSearchInput();

			// ── Перетаскивание карточки за заголовок и строку табов ──
			const el=this.$el; // .modal.zkm
			const card=el&&el.querySelector(".modal-container-wrapper");
			if(!card)return;
			const titleEl=card.querySelector(".modal__title");
			const subheader=card.querySelector(".zkm__subheader");
			let dragging=false,sx=0,sy=0,startOffX=0,startOffY=0;
			let offsetX=0,offsetY=0;
			let _dragRaf=null,_dragPx=0,_dragPy=0;
			const onDown=(e)=>{
				// Клики по интерактивным элементам — не тащим
				if(e.target.closest(".laws-helper__icon-btn,.laws-helper__tab"))return;
				dragging=true;
				sx=e.clientX;sy=e.clientY;
				startOffX=offsetX;startOffY=offsetY;
				card.classList.add("laws-helper_dragging");
				document.body.style.cursor="grabbing";
				document.body.style.userSelect="none";
				e.preventDefault();
			};
			const onMove=(e)=>{
				if(!dragging)return;
				_dragPx=startOffX+(e.clientX-sx);
				_dragPy=startOffY+(e.clientY-sy);
				// Обновляем через RAF — строго раз в кадр
				if(!_dragRaf){
					_dragRaf=requestAnimationFrame(()=>{
						_dragRaf=null;
						offsetX=_dragPx;
						offsetY=_dragPy;
						card.style.transform=`translate(${offsetX}px,${offsetY}px)`;
					});
				}
			};
			const onUp=()=>{
				if(!dragging)return;
				dragging=false;
				if(_dragRaf){cancelAnimationFrame(_dragRaf);_dragRaf=null;}
				card.classList.remove("laws-helper_dragging");
				document.body.style.cursor="";
				document.body.style.userSelect="";
				// Сохраняем в глобал (localStorage недоступен в CEF)
				window._zkmPos={x:offsetX,y:offsetY};
			};
			if(titleEl)titleEl.addEventListener("mousedown",onDown);
			if(subheader)subheader.addEventListener("mousedown",onDown);
			document.addEventListener("mousemove",onMove);
			document.addEventListener("mouseup",onUp);
			this._dragCleanup=()=>{
				if(titleEl)titleEl.removeEventListener("mousedown",onDown);
				if(subheader)subheader.removeEventListener("mousedown",onDown);
				document.removeEventListener("mousemove",onMove);
				document.removeEventListener("mouseup",onUp);
			};
			// Восстанавливаем позицию если окно уже перемещали
			if(window._zkmPos){
				offsetX=window._zkmPos.x||0;
				offsetY=window._zkmPos.y||0;
				card.style.transform=`translate(${offsetX}px,${offsetY}px)`;
			}
		},0);
	},
	unmounted(){
		window.onKeyUp=this._prevOnKeyUp;
		window.onKeyDown=this._prevOnKeyDown;
		if(typeof this._dragCleanup==="function")this._dragCleanup();
		if(this._altHoldTimer)clearTimeout(this._altHoldTimer);
	},
	methods:{
		hideCursor(){
			const ae=document.activeElement;
			if(ae&&this.$el&&this.$el.contains(ae)&&(ae.tagName==="INPUT"||ae.tagName==="TEXTAREA")){
				this._blurredInput=ae;
				ae.blur();
			}else{
				this._blurredInput=null;
			}
			window.setCursorStatus("Zkm",false);
		},
		showCursor(){
			window.setCursorStatus("Zkm",true);
			if(!window.App?.developmentMode)window.setDrawLabelStatus(true);
			const el=this._blurredInput;
			this._blurredInput=null;
			if(el){this.$nextTick(()=>{if(el.isConnected)el.focus();});}
		},
		selectTab(i){
			this.currentTab=i;
			this.search="";
			this.$nextTick(()=>this.focusSearchInput());
		},
		focusSearchInput(){
			const inp=this.$el?.querySelector?.(".laws-helper__search input");
			if(inp)inp.focus();
		},
		toggleDoc(id){
			const idx=this.expandedDocs.indexOf(id);
			if(idx===-1)this.expandedDocs.push(id);
			else this.expandedDocs.splice(idx,1);
		},
		selectLawArticle(id){this.selectedLawArticleId=id;},
		close(){window.closeInterface("Zkm");}
	}
};

const Zkm=_export_sfc(_sfc_main,[["render",render]]);
export{Zkm as default};
