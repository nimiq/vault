class RandomUtils{static generateRandomId(){const e=new Uint32Array(1);return crypto.getRandomValues(e),e[0]}}var ResponseStatus;!function(e){e.OK="ok",e.ERROR="error"}(ResponseStatus||(ResponseStatus={}));const POSTMESSAGE_RETURN_URL="<postMessage>";class Base64{static byteLength(e){const[t,s]=Base64._getLengths(e);return Base64._byteLength(t,s)}static decode(e){Base64._initRevLookup();const[t,s]=Base64._getLengths(e),r=new Uint8Array(Base64._byteLength(t,s));let i=0;const n=s>0?t-4:t;let o=0;for(;o<n;o+=4){const t=Base64._revLookup[e.charCodeAt(o)]<<18|Base64._revLookup[e.charCodeAt(o+1)]<<12|Base64._revLookup[e.charCodeAt(o+2)]<<6|Base64._revLookup[e.charCodeAt(o+3)];r[i++]=t>>16&255,r[i++]=t>>8&255,r[i++]=255&t}if(2===s){const t=Base64._revLookup[e.charCodeAt(o)]<<2|Base64._revLookup[e.charCodeAt(o+1)]>>4;r[i++]=255&t}if(1===s){const t=Base64._revLookup[e.charCodeAt(o)]<<10|Base64._revLookup[e.charCodeAt(o+1)]<<4|Base64._revLookup[e.charCodeAt(o+2)]>>2;r[i++]=t>>8&255,r[i]=255&t}return r}static encode(e){const t=e.length,s=t%3,r=[];for(let i=0,n=t-s;i<n;i+=16383)r.push(Base64._encodeChunk(e,i,i+16383>n?n:i+16383));if(1===s){const s=e[t-1];r.push(Base64._lookup[s>>2]+Base64._lookup[s<<4&63]+"==")}else if(2===s){const s=(e[t-2]<<8)+e[t-1];r.push(Base64._lookup[s>>10]+Base64._lookup[s>>4&63]+Base64._lookup[s<<2&63]+"=")}return r.join("")}static encodeUrl(e){return Base64.encode(e).replace(/\//g,"_").replace(/\+/g,"-").replace(/=/g,".")}static decodeUrl(e){return Base64.decode(e.replace(/_/g,"/").replace(/-/g,"+").replace(/\./g,"="))}static _initRevLookup(){if(0===Base64._revLookup.length){Base64._revLookup=[];for(let e=0,t=Base64._lookup.length;e<t;e++)Base64._revLookup[Base64._lookup.charCodeAt(e)]=e;Base64._revLookup["-".charCodeAt(0)]=62,Base64._revLookup["_".charCodeAt(0)]=63}}static _getLengths(e){const t=e.length;if(t%4>0)throw new Error("Invalid string. Length must be a multiple of 4");let s=e.indexOf("=");return-1===s&&(s=t),[s,s===t?0:4-s%4]}static _byteLength(e,t){return 3*(e+t)/4-t}static _tripletToBase64(e){return Base64._lookup[e>>18&63]+Base64._lookup[e>>12&63]+Base64._lookup[e>>6&63]+Base64._lookup[63&e]}static _encodeChunk(e,t,s){const r=[];for(let i=t;i<s;i+=3){const t=(e[i]<<16&16711680)+(e[i+1]<<8&65280)+(255&e[i+2]);r.push(Base64._tripletToBase64(t))}return r.join("")}}var ExtraJSONTypes,BehaviorType,RequestType;Base64._lookup="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Base64._revLookup=[],function(e){e[e.UINT8_ARRAY=0]="UINT8_ARRAY"}(ExtraJSONTypes||(ExtraJSONTypes={}));class JSONUtils{static stringify(e){return JSON.stringify(e,JSONUtils._jsonifyType)}static parse(e){return JSON.parse(e,JSONUtils._parseType)}static _parseType(e,t){if(t&&t.hasOwnProperty&&t.hasOwnProperty(JSONUtils.TYPE_SYMBOL)&&t.hasOwnProperty(JSONUtils.VALUE_SYMBOL))switch(t[JSONUtils.TYPE_SYMBOL]){case ExtraJSONTypes.UINT8_ARRAY:return Base64.decode(t[JSONUtils.VALUE_SYMBOL])}return t}static _jsonifyType(e,t){return t instanceof Uint8Array?JSONUtils._typedObject(ExtraJSONTypes.UINT8_ARRAY,Base64.encode(t)):t}static _typedObject(e,t){const s={};return s[JSONUtils.TYPE_SYMBOL]=e,s[JSONUtils.VALUE_SYMBOL]=t,s}}JSONUtils.TYPE_SYMBOL="__",JSONUtils.VALUE_SYMBOL="v";class RequestIdStorage{constructor(e=!0){this._store=e?window.sessionStorage:null,this._validIds=new Map,e&&this._restoreIds()}static _decodeIds(e){const t=JSONUtils.parse(e),s=new Map;for(const e of Object.keys(t)){const r=parseInt(e,10);s.set(isNaN(r)?e:r,t[e])}return s}has(e){return this._validIds.has(e)}getCommand(e){const t=this._validIds.get(e);return t?t[0]:null}getState(e){const t=this._validIds.get(e);return t?t[1]:null}add(e,t,s=null){this._validIds.set(e,[t,s]),this._storeIds()}remove(e){this._validIds.delete(e),this._storeIds()}clear(){this._validIds.clear(),this._store&&this._store.removeItem(RequestIdStorage.KEY)}_encodeIds(){const e=Object.create(null);for(const[t,s]of this._validIds)e[t]=s;return JSONUtils.stringify(e)}_restoreIds(){const e=this._store.getItem(RequestIdStorage.KEY);e&&(this._validIds=RequestIdStorage._decodeIds(e))}_storeIds(){this._store&&this._store.setItem(RequestIdStorage.KEY,this._encodeIds())}}RequestIdStorage.KEY="rpcRequests";class UrlRpcEncoder{static receiveRedirectCommand(e){if(!document.referrer)return null;const t=new URLSearchParams(e.search),s=new URL(document.referrer);if(!t.has("command"))return null;if(!t.has("id"))return null;if(!t.has("returnURL"))return null;const r=t.get("returnURL")===POSTMESSAGE_RETURN_URL&&(window.opener||window.parent);if(!r){if(new URL(t.get("returnURL")).origin!==s.origin)return null}let i=[];if(t.has("args"))try{i=JSONUtils.parse(t.get("args"))}catch(e){}return i=Array.isArray(i)?i:[],{origin:s.origin,data:{id:parseInt(t.get("id"),10),command:t.get("command"),args:i},returnURL:t.get("returnURL"),source:r?window.opener||window.parent:null}}static receiveRedirectResponse(e){if(!document.referrer)return null;const t=new URLSearchParams(e.search),s=new URL(document.referrer);if(!t.has("status"))return null;if(!t.has("id"))return null;if(!t.has("result"))return null;const r=JSONUtils.parse(t.get("result")),i=t.get("status")===ResponseStatus.OK?ResponseStatus.OK:ResponseStatus.ERROR;return{origin:s.origin,data:{id:parseInt(t.get("id"),10),status:i,result:r}}}static prepareRedirectReply(e,t,s){const r=new URL(e.returnURL),i=r.searchParams;return i.set("status",t),i.set("result",JSONUtils.stringify(s)),i.set("id",e.id.toString()),r.href}static prepareRedirectInvocation(e,t,s,r,i){const n=new URL(e),o=n.searchParams;return o.set("id",t.toString()),o.set("returnURL",s),o.set("command",r),Array.isArray(i)&&o.set("args",JSONUtils.stringify(i)),n.href}}class RpcClient{constructor(e,t=!1){this._allowedOrigin=e,this._waitingRequests=new RequestIdStorage(t),this._responseHandlers=new Map,this._preserveRequests=!1}onResponse(e,t,s){this._responseHandlers.set(e,{resolve:t,reject:s})}_receive(e){if(!e.data||!e.data.status||!e.data.id||"*"!==this._allowedOrigin&&e.origin!==this._allowedOrigin)return;const t=e.data,s=this._getCallback(t.id),r=this._waitingRequests.getState(t.id);if(s){if(this._preserveRequests||(this._waitingRequests.remove(t.id),this._responseHandlers.delete(t.id)),console.debug("RpcClient RECEIVE",t),t.status===ResponseStatus.OK)s.resolve(t.result,t.id,r);else if(t.status===ResponseStatus.ERROR){const e=new Error(t.result.message);t.result.stack&&(e.stack=t.result.stack),t.result.name&&(e.name=t.result.name),s.reject(e,t.id,r)}}else console.warn("Unknown RPC response:",t)}_getCallback(e){if(this._responseHandlers.has(e))return this._responseHandlers.get(e);{const t=this._waitingRequests.getCommand(e);if(t)return this._responseHandlers.get(t)}}}class PostMessageRpcClient extends RpcClient{constructor(e,t){super(t),this._target=e,this._connected=!1,this._receiveListener=this._receive.bind(this)}async init(){await this._connect(),window.addEventListener("message",this._receiveListener)}async call(e,...t){return this._call({command:e,args:t,id:RandomUtils.generateRandomId()})}async callAndPersist(e,...t){return this._call({command:e,args:t,id:RandomUtils.generateRandomId(),persistInUrl:!0})}async _call(e){if(!this._connected)throw new Error("Client is not connected, call init first");return new Promise((t,s)=>{this._responseHandlers.set(e.id,{resolve:t,reject:s}),this._waitingRequests.add(e.id,e.command);const r=()=>{this._target.closed?s(new Error("Window was closed")):setTimeout(r,500)};setTimeout(r,500),console.debug("RpcClient REQUEST",e.command,e.args),this._target.postMessage(e,this._allowedOrigin)})}close(){window.removeEventListener("message",this._receiveListener),this._connected=!1}_connect(){return new Promise((e,t)=>{const s=t=>{const{source:r,origin:i,data:n}=t;if(r===this._target&&n.status===ResponseStatus.OK&&"pong"===n.result&&1===n.id&&("*"===this._allowedOrigin||i===this._allowedOrigin)){if(n.result.stack){const e=new Error(n.result.message);e.stack=n.result.stack,n.result.name&&(e.name=n.result.name),console.error(e)}window.removeEventListener("message",s),this._connected=!0,console.log("RpcClient: Connection established"),window.addEventListener("message",this._receiveListener),e(!0)}};window.addEventListener("message",s);let r=0;const i=setTimeout(()=>{window.removeEventListener("message",s),clearTimeout(r),t(new Error("Connection timeout"))},1e4),n=()=>{if(this._connected)clearTimeout(i);else{try{this._target.postMessage({command:"ping",id:1},this._allowedOrigin)}catch(e){console.error(`postMessage failed: ${e}`)}r=window.setTimeout(n,100)}};r=window.setTimeout(n,100)})}}class RedirectRpcClient extends RpcClient{constructor(e,t,s=!0){super(t,!0),this._target=e,this._preserveRequests=s}async init(){const e=UrlRpcEncoder.receiveRedirectResponse(window.location);e?this._receive(e):UrlRpcEncoder.receiveRedirectCommand(window.location)||this._rejectOnBack()}close(){}call(e,t,...s){this.callAndSaveLocalState(e,null,t,...s)}callAndSaveLocalState(e,t,s,...r){const i=RandomUtils.generateRandomId(),n=UrlRpcEncoder.prepareRedirectInvocation(this._target,i,e,s,r);this._waitingRequests.add(i,s,t),history.replaceState({rpcRequestId:i},document.title),console.debug("RpcClient REQUEST",s,r),window.location.href=n}_rejectOnBack(){if(history.state&&history.state.rpcRequestId){const e=history.state.rpcRequestId,t=this._getCallback(e),s=this._waitingRequests.getState(e);if(t){this._preserveRequests||(this._waitingRequests.remove(e),this._responseHandlers.delete(e)),console.debug("RpcClient BACK");const r=new Error("Request aborted");t.reject(r,e,s)}}}}class RequestBehavior{static getAllowedOrigin(e){return new URL(e).origin}constructor(e){this._type=e}async request(e,t,s){throw new Error("Not implemented")}get type(){return this._type}}!function(e){e[e.REDIRECT=0]="REDIRECT",e[e.POPUP=1]="POPUP",e[e.IFRAME=2]="IFRAME"}(BehaviorType||(BehaviorType={}));class RedirectRequestBehavior extends RequestBehavior{static withLocalState(e){return new RedirectRequestBehavior(void 0,e)}constructor(e,t){super(BehaviorType.REDIRECT);const s=window.location;if(this._returnUrl=e||`${s.origin}${s.pathname}`,this._localState=t||{},void 0!==this._localState.__command)throw new Error("Invalid localState: Property '__command' is reserved")}async request(e,t,s){const r=RequestBehavior.getAllowedOrigin(e),i=new RedirectRpcClient(e,r);await i.init();const n=Object.assign({},this._localState,{__command:t});console.log("state",n),i.callAndSaveLocalState(this._returnUrl,JSON.stringify(n),t,...s)}}class PopupRequestBehavior extends RequestBehavior{constructor(e=PopupRequestBehavior.DEFAULT_OPTIONS){super(BehaviorType.POPUP),this._options=e}async request(e,t,s){const r=RequestBehavior.getAllowedOrigin(e),i=this.createPopup(e),n=new PostMessageRpcClient(i,r);await n.init();try{return await n.callAndPersist(t,...s)}catch(e){throw e}finally{n.close(),i.close()}}createPopup(e){const t=window.open(e,"NimiqAccounts",this._options);if(!t)throw new Error("Failed to open popup");return t}}PopupRequestBehavior.DEFAULT_OPTIONS="";class IFrameRequestBehavior extends RequestBehavior{constructor(){super(BehaviorType.IFRAME),this._iframe=null,this._client=null}async request(e,t,s){if(this._iframe&&this._iframe.src!==`${e}${IFrameRequestBehavior.IFRAME_PATH_SUFFIX}`)throw new Error("Accounts Manager iframe is already opened with another endpoint");const r=RequestBehavior.getAllowedOrigin(e);if(this._iframe||(this._iframe=await this.createIFrame(e)),!this._iframe.contentWindow)throw new Error(`IFrame contentWindow is ${typeof this._iframe.contentWindow}`);return this._client||(this._client=new PostMessageRpcClient(this._iframe.contentWindow,r),await this._client.init()),await this._client.call(t,...s)}async createIFrame(e){return new Promise((t,s)=>{const r=document.createElement("iframe");r.name="NimiqAccountsIFrame",r.style.display="none",document.body.appendChild(r),r.src=`${e}${IFrameRequestBehavior.IFRAME_PATH_SUFFIX}`,r.onload=(()=>t(r)),r.onerror=s})}}IFrameRequestBehavior.IFRAME_PATH_SUFFIX="/iframe.html",function(e){e.LIST="list",e.MIGRATE="migrate",e.CHECKOUT="checkout",e.SIGN_MESSAGE="sign-message",e.SIGN_TRANSACTION="sign-transaction",e.ONBOARD="onboard",e.SIGNUP="signup",e.LOGIN="login",e.EXPORT="export",e.CHANGE_PASSWORD="change-password",e.LOGOUT="logout",e.ADD_ACCOUNT="add-account",e.RENAME="rename"}(RequestType||(RequestType={}));class AccountsClient{constructor(e=AccountsClient.DEFAULT_ENDPOINT,t){this._endpoint=e,this._defaultBehavior=t||new PopupRequestBehavior(`left=${window.innerWidth/2-500},top=50,width=1000,height=900,location=yes,dependent=yes`),this._iframeBehavior=new IFrameRequestBehavior,this._redirectClient=new RedirectRpcClient("",RequestBehavior.getAllowedOrigin(this._endpoint))}static get DEFAULT_ENDPOINT(){const e=location.origin.split(".");switch(e.shift(),e.join(".")){case"nimiq.com":return"https://accounts.nimiq.com";case"nimiq-testnet.com":return"https://accounts.nimiq-testnet.com";default:return"http://localhost:8080"}}checkRedirectResponse(){return this._redirectClient.init()}on(e,t,s){this._redirectClient.onResponse(e,(e,s,r)=>t(e,JSON.parse(r)),(e,t,r)=>s&&s(e,JSON.parse(r)))}onboard(e,t=this._defaultBehavior){return this._request(t,RequestType.ONBOARD,[e])}signup(e,t=this._defaultBehavior){return this._request(t,RequestType.SIGNUP,[e])}login(e,t=this._defaultBehavior){return this._request(t,RequestType.LOGIN,[e])}signTransaction(e,t=this._defaultBehavior){return this._request(t,RequestType.SIGN_TRANSACTION,[e])}checkout(e,t=this._defaultBehavior){return this._request(t,RequestType.CHECKOUT,[e])}logout(e,t=this._defaultBehavior){return this._request(t,RequestType.LOGOUT,[e])}export(e,t=this._defaultBehavior){return this._request(t,RequestType.EXPORT,[e])}changePassword(e,t=this._defaultBehavior){return this._request(t,RequestType.CHANGE_PASSWORD,[e])}addAccount(e,t=this._defaultBehavior){return this._request(t,RequestType.ADD_ACCOUNT,[e])}rename(e,t=this._defaultBehavior){return this._request(t,RequestType.RENAME,[e])}signMessage(e,t=this._defaultBehavior){return this._request(t,RequestType.SIGN_MESSAGE,[e])}migrate(e=this._defaultBehavior){return this._request(e,RequestType.MIGRATE,[{}])}list(e=this._iframeBehavior){return this._request(e,RequestType.LIST,[])}_request(e,t,s){return e.request(this._endpoint,t,s)}}AccountsClient.RequestType=RequestType,AccountsClient.RedirectRequestBehavior=RedirectRequestBehavior;export default AccountsClient;
