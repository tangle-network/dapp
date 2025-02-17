import{j as a}from"./jsx-runtime-BbjHj44Y.js";import{r as o}from"./index-C6mWTJJr.js";import{t as f}from"./bundle-mjs-D696Ktp4.js";import{d as p}from"./index-VMVr2VZz.js";const A={start:"justify-start",center:"justify-center",end:"justify-end"},S=o.forwardRef(({className:s,iconClassName:i="text-mono-180 dark:text-mono-0 hover:text-mono-140 dark:hover:text-mono-100",iconPlacement:l="start",socialConfigs:r=p,linkOverrides:n,...m},c)=>{const d=o.useMemo(()=>n===void 0?r:r.map(e=>{const t=n[e.name];return t!==void 0?{...e,href:t}:e}),[n,r]);return a.jsx("div",{...m,ref:c,className:f("flex items-center space-x-4",A[l],s),children:d.map(({Icon:e,name:t,...u})=>a.jsx("a",{...u,className:i,children:a.jsx(e,{className:"w-6 h-6 sm:w-8 sm:h-8 !fill-current"})},t))})});S.__docgenInfo={description:"",methods:[],displayName:"Socials",props:{iconPlacement:{required:!1,tsType:{name:"union",raw:"'start' | 'end' | 'center'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'end'"},{name:"literal",value:"'center'"}]},description:"The flex box placement of the icons (horizontal)",defaultValue:{value:"'start'",computed:!1}},iconClassName:{required:!1,tsType:{name:"string"},description:"The icon class name (use to override the icon style by tailwind classes)",defaultValue:{value:"'text-mono-180 dark:text-mono-0 hover:text-mono-140 dark:hover:text-mono-100'",computed:!1}},socialConfigs:{required:!1,tsType:{name:"Array",elements:[{name:"SocialConfigsType"}],raw:"Array<SocialConfigsType>"},description:"The list of all social configs to render",defaultValue:{value:`TANGLE_AVAILABLE_SOCIALS.map(
  (name) =>
    ({
      name,
      href: SOCIAL_URLS_RECORD[name],
      Icon: SOCIAL_ICONS_RECORD[name],
      target: '_blank',
      rel: 'noopener noreferrer',
    }) as const satisfies SocialConfigsType,
)`,computed:!0}},linkOverrides:{required:!1,tsType:{name:"Partial",elements:[{name:"Record",elements:[{name:"unknown[number]",raw:"(typeof TANGLE_AVAILABLE_SOCIALS)[number]"},{name:"string"}],raw:"Record<(typeof TANGLE_AVAILABLE_SOCIALS)[number], string>"}],raw:`Partial<
  Record<(typeof TANGLE_AVAILABLE_SOCIALS)[number], string>
>`},description:""}}};export{S};
