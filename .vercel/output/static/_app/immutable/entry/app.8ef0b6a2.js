import{_ as m}from"../chunks/preload-helper.a4192956.js";import{s as q,a as J,e as d,c as S,i as w,d as h,b as j,o as C,f as M,g as U,h as B,j as R,k as p,l as F,m as G,n as H,t as K,p as A,q as k}from"../chunks/scheduler.b8cd85ff.js";import{S as Q,i as W,t as b,c as I,a as g,g as P,b as v,d as L,m as V,e as D}from"../chunks/index.35665f17.js";const X=s=>/^naddr1[a-z0-9]{6,}$/i.test(s),Y=s=>/^(note|nevent)1[a-z0-9]{6,}$/i.test(s),Z=s=>/^nprofile1[a-z0-9]{6,}$/i.test(s),$=s=>/^npub1[a-z0-9]{6,}$/i.test(s),at={naddr:X,note:Y,nprofile:Z,npub:$};function x(s){let t,n,i;var r=s[1][0];function c(e,o){return{props:{data:e[3],form:e[2]}}}return r&&(t=k(r,c(s)),s[12](t)),{c(){t&&v(t.$$.fragment),n=d()},l(e){t&&L(t.$$.fragment,e),n=d()},m(e,o){t&&V(t,e,o),w(e,n,o),i=!0},p(e,o){if(o&2&&r!==(r=e[1][0])){if(t){P();const a=t;b(a.$$.fragment,1,0,()=>{D(a,1)}),I()}r?(t=k(r,c(e)),e[12](t),v(t.$$.fragment),g(t.$$.fragment,1),V(t,n.parentNode,n)):t=null}else if(r){const a={};o&8&&(a.data=e[3]),o&4&&(a.form=e[2]),t.$set(a)}},i(e){i||(t&&g(t.$$.fragment,e),i=!0)},o(e){t&&b(t.$$.fragment,e),i=!1},d(e){e&&h(n),s[12](null),t&&D(t,e)}}}function tt(s){let t,n,i;var r=s[1][0];function c(e,o){return{props:{data:e[3],$$slots:{default:[et]},$$scope:{ctx:e}}}}return r&&(t=k(r,c(s)),s[11](t)),{c(){t&&v(t.$$.fragment),n=d()},l(e){t&&L(t.$$.fragment,e),n=d()},m(e,o){t&&V(t,e,o),w(e,n,o),i=!0},p(e,o){if(o&2&&r!==(r=e[1][0])){if(t){P();const a=t;b(a.$$.fragment,1,0,()=>{D(a,1)}),I()}r?(t=k(r,c(e)),e[11](t),v(t.$$.fragment),g(t.$$.fragment,1),V(t,n.parentNode,n)):t=null}else if(r){const a={};o&8&&(a.data=e[3]),o&8215&&(a.$$scope={dirty:o,ctx:e}),t.$set(a)}},i(e){i||(t&&g(t.$$.fragment,e),i=!0)},o(e){t&&b(t.$$.fragment,e),i=!1},d(e){e&&h(n),s[11](null),t&&D(t,e)}}}function et(s){let t,n,i;var r=s[1][1];function c(e,o){return{props:{data:e[4],form:e[2]}}}return r&&(t=k(r,c(s)),s[10](t)),{c(){t&&v(t.$$.fragment),n=d()},l(e){t&&L(t.$$.fragment,e),n=d()},m(e,o){t&&V(t,e,o),w(e,n,o),i=!0},p(e,o){if(o&2&&r!==(r=e[1][1])){if(t){P();const a=t;b(a.$$.fragment,1,0,()=>{D(a,1)}),I()}r?(t=k(r,c(e)),e[10](t),v(t.$$.fragment),g(t.$$.fragment,1),V(t,n.parentNode,n)):t=null}else if(r){const a={};o&16&&(a.data=e[4]),o&4&&(a.form=e[2]),t.$set(a)}},i(e){i||(t&&g(t.$$.fragment,e),i=!0)},o(e){t&&b(t.$$.fragment,e),i=!1},d(e){e&&h(n),s[10](null),t&&D(t,e)}}}function O(s){let t,n=s[6]&&T(s);return{c(){t=M("div"),n&&n.c(),this.h()},l(i){t=U(i,"DIV",{id:!0,"aria-live":!0,"aria-atomic":!0,style:!0});var r=B(t);n&&n.l(r),r.forEach(h),this.h()},h(){R(t,"id","svelte-announcer"),R(t,"aria-live","assertive"),R(t,"aria-atomic","true"),p(t,"position","absolute"),p(t,"left","0"),p(t,"top","0"),p(t,"clip","rect(0 0 0 0)"),p(t,"clip-path","inset(50%)"),p(t,"overflow","hidden"),p(t,"white-space","nowrap"),p(t,"width","1px"),p(t,"height","1px")},m(i,r){w(i,t,r),n&&n.m(t,null)},p(i,r){i[6]?n?n.p(i,r):(n=T(i),n.c(),n.m(t,null)):n&&(n.d(1),n=null)},d(i){i&&h(t),n&&n.d()}}}function T(s){let t;return{c(){t=F(s[7])},l(n){t=G(n,s[7])},m(n,i){w(n,t,i)},p(n,i){i&128&&H(t,n[7])},d(n){n&&h(t)}}}function nt(s){let t,n,i,r,c;const e=[tt,x],o=[];function a(f,u){return f[1][1]?0:1}t=a(s),n=o[t]=e[t](s);let l=s[5]&&O(s);return{c(){n.c(),i=J(),l&&l.c(),r=d()},l(f){n.l(f),i=S(f),l&&l.l(f),r=d()},m(f,u){o[t].m(f,u),w(f,i,u),l&&l.m(f,u),w(f,r,u),c=!0},p(f,[u]){let E=t;t=a(f),t===E?o[t].p(f,u):(P(),b(o[E],1,1,()=>{o[E]=null}),I(),n=o[t],n?n.p(f,u):(n=o[t]=e[t](f),n.c()),g(n,1),n.m(i.parentNode,i)),f[5]?l?l.p(f,u):(l=O(f),l.c(),l.m(r.parentNode,r)):l&&(l.d(1),l=null)},i(f){c||(g(n),c=!0)},o(f){b(n),c=!1},d(f){f&&(h(i),h(r)),o[t].d(f),l&&l.d(f)}}}function it(s,t,n){let{stores:i}=t,{page:r}=t,{constructors:c}=t,{components:e=[]}=t,{form:o}=t,{data_0:a=null}=t,{data_1:l=null}=t;j(i.page.notify);let f=!1,u=!1,E=null;C(()=>{const _=i.page.subscribe(()=>{f&&(n(6,u=!0),K().then(()=>{n(7,E=document.title||"untitled page")}))});return n(5,f=!0),_});function y(_){A[_?"unshift":"push"](()=>{e[1]=_,n(0,e)})}function N(_){A[_?"unshift":"push"](()=>{e[0]=_,n(0,e)})}function z(_){A[_?"unshift":"push"](()=>{e[0]=_,n(0,e)})}return s.$$set=_=>{"stores"in _&&n(8,i=_.stores),"page"in _&&n(9,r=_.page),"constructors"in _&&n(1,c=_.constructors),"components"in _&&n(0,e=_.components),"form"in _&&n(2,o=_.form),"data_0"in _&&n(3,a=_.data_0),"data_1"in _&&n(4,l=_.data_1)},s.$$.update=()=>{s.$$.dirty&768&&i.page.set(r)},[e,c,o,a,l,f,u,E,i,r,y,N,z]}class ft extends Q{constructor(t){super(),W(this,t,it,nt,q,{stores:8,page:9,constructors:1,components:0,form:2,data_0:3,data_1:4})}}const _t=[()=>m(()=>import("../nodes/0.1a86d64c.js"),["..\\nodes\\0.1a86d64c.js","..\\chunks\\preload-helper.a4192956.js","..\\chunks\\settings.88550f80.js","..\\chunks\\index.ffcfcb07.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\transitions.44c8ee36.js","..\\chunks\\store.967fbeb2.js","..\\assets\\store.4f1e9ba5.css","..\\chunks\\spread.8a54911c.js","..\\chunks\\each.a1a4b9c9.js","..\\assets\\0.8ed47200.css"],import.meta.url),()=>m(()=>import("../nodes/1.2a20a73c.js"),["..\\nodes\\1.2a20a73c.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\singletons.a535b0e5.js","..\\chunks\\index.ffcfcb07.js"],import.meta.url),()=>m(()=>import("../nodes/2.975e59da.js"),["..\\nodes\\2.975e59da.js","..\\chunks\\kind.df02593b.js","..\\chunks\\control.f5b05b5f.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\each.a1a4b9c9.js","..\\chunks\\store.967fbeb2.js","..\\chunks\\index.ffcfcb07.js","..\\assets\\store.4f1e9ba5.css","..\\chunks\\Settings.ed552a17.js","..\\chunks\\settings.88550f80.js","..\\chunks\\index.ee7fcb47.js","..\\chunks\\navigation.3f69098d.js","..\\chunks\\singletons.a535b0e5.js"],import.meta.url),()=>m(()=>import("../nodes/3.76ffaf25.js"),["..\\nodes\\3.76ffaf25.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\store.967fbeb2.js","..\\chunks\\index.ffcfcb07.js","..\\assets\\store.4f1e9ba5.css","..\\chunks\\spread.8a54911c.js","..\\chunks\\navigation.3f69098d.js","..\\chunks\\singletons.a535b0e5.js","..\\chunks\\settings.88550f80.js","..\\chunks\\bookmarkEvents.1341752b.js"],import.meta.url),()=>m(()=>import("../nodes/4.772066db.js"),["..\\nodes\\4.772066db.js","..\\chunks\\kind.df02593b.js","..\\chunks\\control.f5b05b5f.js","..\\chunks\\bookmarkEvents.1341752b.js","..\\chunks\\index.ffcfcb07.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\settings.88550f80.js","..\\chunks\\FooterMenu.1197af10.js","..\\chunks\\each.a1a4b9c9.js","..\\chunks\\store.967fbeb2.js","..\\assets\\store.4f1e9ba5.css","..\\chunks\\index.ee7fcb47.js","..\\chunks\\navigation.3f69098d.js","..\\chunks\\singletons.a535b0e5.js","..\\chunks\\transitions.44c8ee36.js","..\\chunks\\spread.8a54911c.js","..\\assets\\FooterMenu.5264c61d.css","..\\assets\\4.3bacad65.css"],import.meta.url),()=>m(()=>import("../nodes/5.6b64c724.js"),["..\\nodes\\5.6b64c724.js","..\\chunks\\index.ee7fcb47.js","..\\chunks\\kind.df02593b.js","..\\chunks\\control.f5b05b5f.js","..\\chunks\\FooterMenu.1197af10.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\settings.88550f80.js","..\\chunks\\index.ffcfcb07.js","..\\chunks\\each.a1a4b9c9.js","..\\chunks\\store.967fbeb2.js","..\\assets\\store.4f1e9ba5.css","..\\chunks\\navigation.3f69098d.js","..\\chunks\\singletons.a535b0e5.js","..\\chunks\\bookmarkEvents.1341752b.js","..\\chunks\\transitions.44c8ee36.js","..\\chunks\\spread.8a54911c.js","..\\assets\\FooterMenu.5264c61d.css","..\\chunks\\ListedEventList.afa0c082.js","..\\assets\\ListedEventList.1837caf9.css","..\\chunks\\Settings.ed552a17.js"],import.meta.url),()=>m(()=>import("../nodes/6.cff8b6d7.js"),["..\\nodes\\6.cff8b6d7.js","..\\chunks\\index.ee7fcb47.js","..\\chunks\\kind.df02593b.js","..\\chunks\\control.f5b05b5f.js","..\\chunks\\FooterMenu.1197af10.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\settings.88550f80.js","..\\chunks\\index.ffcfcb07.js","..\\chunks\\each.a1a4b9c9.js","..\\chunks\\store.967fbeb2.js","..\\assets\\store.4f1e9ba5.css","..\\chunks\\navigation.3f69098d.js","..\\chunks\\singletons.a535b0e5.js","..\\chunks\\bookmarkEvents.1341752b.js","..\\chunks\\transitions.44c8ee36.js","..\\chunks\\spread.8a54911c.js","..\\assets\\FooterMenu.5264c61d.css","..\\chunks\\ListedEventList.afa0c082.js","..\\assets\\ListedEventList.1837caf9.css"],import.meta.url),()=>m(()=>import("../nodes/7.7bab79ae.js"),["..\\nodes\\7.7bab79ae.js","..\\chunks\\kind.df02593b.js","..\\chunks\\control.f5b05b5f.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\each.a1a4b9c9.js","..\\chunks\\settings.88550f80.js","..\\chunks\\index.ffcfcb07.js","..\\chunks\\Settings.ed552a17.js","..\\chunks\\navigation.3f69098d.js","..\\chunks\\singletons.a535b0e5.js"],import.meta.url),()=>m(()=>import("../nodes/8.2cd218f3.js"),["..\\nodes\\8.2cd218f3.js","..\\chunks\\index.ee7fcb47.js","..\\chunks\\kind.df02593b.js","..\\chunks\\control.f5b05b5f.js","..\\chunks\\scheduler.b8cd85ff.js","..\\chunks\\index.35665f17.js","..\\chunks\\settings.88550f80.js","..\\chunks\\index.ffcfcb07.js","..\\chunks\\ListedEventList.afa0c082.js","..\\chunks\\each.a1a4b9c9.js","..\\chunks\\FooterMenu.1197af10.js","..\\chunks\\store.967fbeb2.js","..\\assets\\store.4f1e9ba5.css","..\\chunks\\navigation.3f69098d.js","..\\chunks\\singletons.a535b0e5.js","..\\chunks\\bookmarkEvents.1341752b.js","..\\chunks\\transitions.44c8ee36.js","..\\chunks\\spread.8a54911c.js","..\\assets\\FooterMenu.5264c61d.css","..\\assets\\ListedEventList.1837caf9.css","..\\chunks\\Settings.ed552a17.js"],import.meta.url)],lt=[],ct={"/":[2],"/Json":[3],"/Json/View":[4],"/[npub=npub]":[7],"/[nprofile=nprofile]":[6],"/[naddr=naddr]":[5],"/[npub=npub]/[kind]":[8]},ut={handleError:({error:s})=>{console.error(s)}};export{ct as dictionary,ut as hooks,at as matchers,_t as nodes,ft as root,lt as server_loads};
