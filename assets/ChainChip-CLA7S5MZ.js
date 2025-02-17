import{j as r}from"./jsx-runtime-BbjHj44Y.js";import{C as b}from"./ChainIcon-MpKHrVma.js";import{r as a}from"./index-C6mWTJJr.js";import{t as x}from"./bundle-mjs-D696Ktp4.js";const h={polygon:{default:"text-mono-0 dark:text-mono-0 bg-[#8247E5]"},ethereum:{default:"text-mono-200 dark:text-mono-200 bg-[#EDF0F4]"},optimism:{default:"text-mono-0 dark:text-mono-0 bg-[#FF0420]"},kusama:{default:"text-mono-0 dark:text-mono-0 bg-[#000000]"},athena:{default:"text-mono-0 dark:text-mono-0 bg-[#D9780E]"},cosmos:{default:"text-mono-0 dark:text-mono-0 bg-[#2E3148]"},moonbeam:{default:"text-mono-0 dark:text-mono-0 bg-[#1D1336]"},polkadot:{default:"text-mono-0 dark:text-mono-0 bg-[#E6007A]"},arbitrum:{default:"text-mono-0 dark:text-mono-0 bg-[#2C374B]"},avalanche:{default:"text-mono-0 dark:text-mono-0 bg-[#E84142]"},tangle:{default:"text-mono-0 dark:text-mono-0 bg-[#221C41]"},scroll:{default:"text-mono-200 dark:text-mono-200 bg-[#FFF6EB]"},orbit:{default:"text-mono-0 bg-[#323653]"},"webb-dev":{default:"text-mono-0 dark:text-mono-0 bg-[#D9780F]"},phala:{default:"text-mono-200 dark:text-mono-200 bg-[#D1FF51]"},base:{default:"text-mono-0 dark:text-mono-0 bg-[#0052FF]"},linea:{default:"text-mono-200 dark:text-mono-200 bg-[#ffffff]"},bsc:{default:"text-mono-0 dark:text-mono-0 bg-[#F0B90B]"},solana:{default:"text-mono-0 dark:text-mono-0 bg-[#000000]"},bitlayer:{default:"text-mono-0 dark:text-mono-0 bg-[#000000]"}};function f(t){const{default:n}=h[t];return n}const g=a.forwardRef((t,n)=>{const{className:o,chainType:l,chainName:e,title:s,...i}=t,m=a.useMemo(()=>"box-border inline-flex items-center gap-1 pl-2 pr-3 py-1.5 rounded-md uppercase text-[12px] leading-[15px] font-bold text-mono-200 w-fit",[]),d=a.useMemo(()=>e.toLowerCase().includes("tangle")?"tangle transparent":e.toLowerCase().includes("linea")?"linea":e.toLowerCase().includes("bnb")?"bsc":e.toLowerCase().includes("op")?"optimism":e.toLowerCase().includes("arbitrum")?"arbitrum":e.toLowerCase().includes("solana")?"solana":e,[e]),u=a.useMemo(()=>{const c=f(l);return x(m,c,o)},[m,l,o]),p=a.useMemo(()=>e.toLowerCase().includes("bnb")?"BSC":e.toLowerCase().includes("linea")?"Linea":e.toLowerCase().includes("op")?"Optimism":e.toLowerCase().includes("arbitrum")?"Arbitrum":e.toLowerCase().includes("solana")?"Solana":e.split(" ").pop(),[e]);return r.jsxs("span",{className:u,...i,ref:n,children:[r.jsx(b,{name:d,size:"md"}),s??p]})});g.__docgenInfo={description:`\`ChainChip\` component

Props:

- \`type\`: \`ChainType\` -
polygon
  | ethereum
  | optimism
  | kusama
  | moonbeam
  | polkadot
  | arbitrum
  | avalanche
  | tangle
  | cosmos
  | scroll
  | webb-dev
- \`name\`: \`string\` -
Chain name to display. e.g. Ethereum, Polygon, Kusama, Optimism Goerli etc.
@example

\`\`\`jsx
 <ChainChip type="optimism" name="optimism goerli" />
 <ChainChip type="moonbeam" name="moonbeam alpha" />
\`\`\``,methods:[],displayName:"ChainChip",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"ReactNode"},description:""},chainType:{required:!0,tsType:{name:"union",raw:`| 'arbitrum'
| 'athena'
| 'avalanche'
| 'cosmos'
| 'ethereum'
| 'kusama'
| 'moonbeam'
| 'optimism'
| 'orbit'
| 'phala'
| 'polkadot'
| 'polygon'
| 'scroll'
| 'tangle'
| 'bsc'
| 'base'
| 'linea'
| 'webb-dev'
| 'solana'
| 'bitlayer'`,elements:[{name:"literal",value:"'arbitrum'"},{name:"literal",value:"'athena'"},{name:"literal",value:"'avalanche'"},{name:"literal",value:"'cosmos'"},{name:"literal",value:"'ethereum'"},{name:"literal",value:"'kusama'"},{name:"literal",value:"'moonbeam'"},{name:"literal",value:"'optimism'"},{name:"literal",value:"'orbit'"},{name:"literal",value:"'phala'"},{name:"literal",value:"'polkadot'"},{name:"literal",value:"'polygon'"},{name:"literal",value:"'scroll'"},{name:"literal",value:"'tangle'"},{name:"literal",value:"'bsc'"},{name:"literal",value:"'base'"},{name:"literal",value:"'linea'"},{name:"literal",value:"'webb-dev'"},{name:"literal",value:"'solana'"},{name:"literal",value:"'bitlayer'"}]},description:""},chainName:{required:!0,tsType:{name:"string"},description:""},title:{required:!1,tsType:{name:"string"},description:""}}};export{g as C};
