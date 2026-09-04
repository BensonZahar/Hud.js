import{S as ScrollableContainer}from"./ScrollableContainer.js";
import{o as openBlock,c as createElementBlock,a as createBaseVNode,t as toDisplayString,F as Fragment,i as renderList,n as normalizeClass,f as createCommentVNode,v as withDirectives,x as vModelText,_ as _export_sfc,b as createVNode,w as withCtx}from"./index.js";

const _hoisted_1={key:0,class:"console__body"},
  _hoisted_2={class:"console__toolbar"},
  _hoisted_3={class:"console__message__content"},
  _hoisted_4={class:"console__message__value"},
  _hoisted_5=["onClick"],
  _hoisted_6={key:0,class:"console__stack"},
  _hoisted_7={class:"console__input"},
  _hoisted_8={class:"console__toolbar__button__icon",viewBox:"0 0 16 16",fill:"none"},
  _hoisted_9={d:"M4 4l4 4 4-4M4 8l4 4 4-4",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"};

function render(o,s,c,l,a,t){
  return openBlock(),createElementBlock("div",{class:normalizeClass(["console",{console_opened:o.isOpened}])},[
    createBaseVNode("div",{class:"console__head",onClick:s[0]||(s[0]=(...e)=>t.toggle&&t.toggle(...e))},toDisplayString(o.isOpened?"ЗАКРЫТЬ КОНСОЛЬ":"ОТКРЫТЬ КОНСОЛЬ"),1),
    o.isOpened?(openBlock(),createElementBlock("div",_hoisted_1,[
      createBaseVNode("div",_hoisted_2,[
        withDirectives(createBaseVNode("input",{class:"console__search",placeholder:"Поиск...","onUpdate:modelValue":s[1]||(s[1]=e=>o.search=e)},null,512),[[vModelText,o.search]]),
        createBaseVNode("div",{class:"console__toolbar__button",onClick:s[2]||(s[2]=e=>t.scrollBottom&&t.scrollBottom(!0))},[
          createBaseVNode("span",null,"ВНИЗ"),
          (openBlock(),createElementBlock("svg",_hoisted_8,[createBaseVNode("path",_hoisted_9)]))
        ])
      ]),
      createVNode(ScrollableContainer,{
        ref:"content",
        class:"console__content",
        onContentScroll:s[3]||(s[3]=e=>t.onContentScroll&&t.onContentScroll(e))
      },{
        default:withCtx(()=>[
          (openBlock(!0),createElementBlock(Fragment,null,renderList(o.filteredMessages,(e,n)=>(
            openBlock(),createElementBlock("div",{
              class:normalizeClass(["console__message",`console__message_${e.type}`]),
              key:n
            },[
              createBaseVNode("div",_hoisted_3,[
                createBaseVNode("div",_hoisted_4,toDisplayString(e.value),1),
                e.stack?(openBlock(),createElementBlock("div",{key:0,class:"console__message__button",onClick:i=>e.opened=!e.opened},toDisplayString(e.opened?"СВЕРНУТЬ":"РАЗВЕРНУТЬ"),9,_hoisted_5)):createCommentVNode("",!0)
              ]),
              e.stack&&e.opened?(openBlock(),createElementBlock("pre",_hoisted_6,toDisplayString(e.stack),1)):createCommentVNode("",!0)
            ],2)
          )),128))
        ])
      })
    ])):createCommentVNode("",!0),
    createBaseVNode("div",_hoisted_7,[
      withDirectives(createBaseVNode("input",{"onUpdate:modelValue":s[4]||(s[4]=e=>o.script=e)},null,512),[[vModelText,o.script]]),
      createBaseVNode("div",{class:"console__input__button",onClick:s[5]||(s[5]=(...e)=>t.executeScript&&t.executeScript(...e))},"Send")
    ])
  ],2)
}

const Console_vue_vue_type_style_index_0_scoped_aa469dc4_lang="";

const _sfc_main={
  components:{ScrollableContainer},
  data:()=>({
    isOpened:!1,
    messages:[],
    script:"",
    search:"",
    autoScroll:!0
  }),
  computed:{
    filteredMessages(){
      if(!this.search)return this.messages;
      const s=this.search.toLowerCase();
      return this.messages.filter(c=>(c.value||"").toLowerCase().includes(s)||(c.stack||"").toLowerCase().includes(s))
    }
  },
  methods:{
    executeScript(){eval(this.script),this.script=""},
    toggle(){this.isOpened=!this.isOpened,this.scrollBottom(!0)},
    error(...o){for(const s of o)this.messages.push({type:"error",value:s.message,stack:s.stack});this.scrollBottom()},
    log(...o){this.messages.push({type:"log",value:o.join(" ")}),this.scrollBottom()},
    onContentScroll({scrollableWrapper:o}){
      this.autoScroll=o.scrollHeight-o.scrollTop-o.clientHeight<4
    },
    scrollBottom(o){
      this.$nextTick(()=>{
        const e=this.$refs.content;
        if(!e)return;
        o&&(this.autoScroll=!0);
        if(this.autoScroll){
          const el=e.getScrollElement();
          el&&e.setScrollPosition({top:el.scrollHeight})
        }
      })
    }
  }
};

const Console=_export_sfc(_sfc_main,[["render",render],["__scopeId","data-v-aa469dc4"]]);
export{Console as default};
