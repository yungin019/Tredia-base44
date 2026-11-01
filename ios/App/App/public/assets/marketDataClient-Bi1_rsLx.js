import{c as a,i}from"./index-CD99-seK.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M5 12h14",key:"1ays0h"}]],M=a("Minus",u),l=e=>i("marketCore",e),o=new Map,f=6e4;function h(e){const t=o.get(e);return t?Date.now()-t.ts>f?(o.delete(e),null):t.data:null}function C(e,t){o.set(e,{data:t,ts:Date.now()})}const r=new Map;async function g(){const e=h("core");if(e)return e;const t=r.get("core");if(t)return t;const s=(async()=>{try{const n=await l({action:"core"}),c=(n==null?void 0:n.assets)||[];return c.length>0&&C("core",c),c}catch{return[]}finally{r.delete("core")}})();return r.set("core",s),s}export{M,g as f};
