import{n as s}from"./index.browser.esm-BZmtMS8Q.js";function u(t){let e="0.";for(;--t;)e+="0";return parseFloat(e+"1")}function f(t,e=3,a={}){const{roundingFunction:n=Math.floor,defaultPlaceholder:o="-",...i}=a;if(t===0)return"0";if(!t)return o;if(t<0)return"< 0";const r=u(e);return t<r?`< ${r}`:s(t).format({average:t>1e3,totalLength:t<1e3?0:3,mantissa:e,optionalMantissa:!0,trimMantissa:!0,thousandSeparated:!0,roundingFunction:n,...i})}export{f as g};
