import{r}from"./index-C6mWTJJr.js";import{t as h}from"./bundle-mjs-D696Ktp4.js";function i(e){switch(e){case"center":return"text-center";case"justify":return"text-justify";case"left":return"text-left";case"right":return"text-right";default:return"text-left"}}function c(e,t){if(u(e)&&t==="semibold")return"font-bold";if(e==="label"||e==="utility")return"";switch(t){case"normal":return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black";default:return"font-normal"}}function u(e){return["mono1","mono2","mkt-monospace"].indexOf(e)!==-1}function d(e){return e.startsWith("h")||e.startsWith("mkt-h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}const f={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},y=({children:e,className:t,component:s,fw:n="normal",ta:a="left",variant:o,...m})=>{const p=s??f[o],l=r.useMemo(()=>h(`${o}`,i(a),c(o,n),d(o),t),[t,n,a,o]);return r.createElement(p,{...m,className:l},e)};y.__docgenInfo={description:'The Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{fw:{defaultValue:{value:"'normal'",computed:!1},required:!1},ta:{defaultValue:{value:"'left'",computed:!1},required:!1}}};export{y as T,c as g};
