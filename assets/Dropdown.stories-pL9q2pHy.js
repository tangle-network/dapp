import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{D as a,a as D,b as x,c as b,A as f}from"./AccountDropdownBody-BtkIwlri.js";import"./Typography-BXoXAd7x.js";import"./index-C6mWTJJr.js";import"./Label-DpPnCd0G.js";import{D as s}from"./DropdownMenuItem-CysMNRwX.js";import"./index-BpvXyOxN.js";import"./_commonjsHelpers-BosuxZz1.js";import"./bundle-mjs-D696Ktp4.js";import"./ProposalBadge-aTrZS74o.js";import"./create-icon-BPUPqOkJ.js";import"./ChainIcon-MpKHrVma.js";import"./Spinner-C8gHa2rr.js";import"./StatusIndicator-BMH2ux_C.js";import"./iframe-CzYK-pcq.js";import"./InformationLine-D6uBLwmF.js";import"./Alert-CUeVEtwL.js";import"./Avatar-BFvCMqwp.js";import"./index-D0XHPngQ.js";import"./index-DBTS1piU.js";import"./index-CLAazc5K.js";import"./index-D-pqSeBO.js";import"./asU8a-CbhOG0Ur.js";import"./index-C-EFqv7j.js";import"./___vite-browser-external_commonjs-proxy-DRaEfepn.js";import"./index-Cz5JA_-m.js";import"./Tooltip-BHOFDjF6.js";import"./index-SK0NaOuZ.js";import"./index-v-BSH-Rc.js";import"./index-D5RmOefV.js";import"./index-MLLxzWXI.js";import"./index-CrkKVscG.js";import"./isSubstrateAddress-Bz2nwvvb.js";import"./index.browser.esm-BZmtMS8Q.js";import"./index-VMVr2VZz.js";import"./tangle-DQ1MxYgI.js";import"./index-C6Rh8DRz.js";import"./index-ucBY_b0w.js";import"./index-D7_bW5-g.js";import"./index-BsRll5Wv.js";const ae={title:"Design System/Molecules/Dropdown",component:a},o={render:()=>e.jsxs(a,{className:"w-full",children:[e.jsx(D,{size:"sm",className:"w-full px-4 py-4",label:"Click Me"}),e.jsx(x,{className:"radix-side-top:mb-2 radix-side-bottom:mt-2 w-[var(--radix-dropdown-menu-trigger-width)]",children:e.jsxs("ul",{children:[e.jsx(s,{children:"Item 1"}),e.jsx(s,{children:"Item 2"}),e.jsx(s,{disabled:!0,children:"Disabled"})]})})]})},r={render:()=>e.jsx(b,{className:"mr-3",size:"sm",label:"Chain",menuOptions:[{value:"Day"},{value:"Week"},{value:"Year"}],value:"Ethereum"})},t={render:()=>e.jsxs(a,{className:"w-full",children:[e.jsx(D,{size:"sm",className:"w-full px-4 py-4",label:"Click Me"}),e.jsx(f,{accountItems:[{address:"0x1234567890abcdef1234567890abcdef12345678",name:"Account 1",onClick:()=>{}},{address:"0x1234567890abcdef1234567890abcdef12345678",name:"Account 2",onClick:()=>{}}]})]})};var m,n,p;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <Dropdown className="w-full">
      <DropdownButton size="sm" className="w-full px-4 py-4" label="Click Me" />

      <DropdownBody className="radix-side-top:mb-2 radix-side-bottom:mt-2 w-[var(--radix-dropdown-menu-trigger-width)]">
        <ul>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
        </ul>
      </DropdownBody>
    </Dropdown>
}`,...(p=(n=o.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};var d,i,c;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <DropdownCmp className="mr-3" size="sm" label="Chain" menuOptions={[{
    value: 'Day'
  }, {
    value: 'Week'
  }, {
    value: 'Year'
  }]} value="Ethereum" />
}`,...(c=(i=r.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var l,u,w;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <Dropdown className="w-full">
      <DropdownButton size="sm" className="w-full px-4 py-4" label="Click Me" />

      <AccountDropdownBody accountItems={[{
      address: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Account 1',
      onClick: () => {
        return;
      }
    }, {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      name: 'Account 2',
      onClick: () => {
        return;
      }
    }]} />
    </Dropdown>
}`,...(w=(u=t.parameters)==null?void 0:u.docs)==null?void 0:w.source}}};const me=["Default","DropdownMenu","AccountDropdown"];export{t as AccountDropdown,o as Default,r as DropdownMenu,me as __namedExportsOrder,ae as default};
