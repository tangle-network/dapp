import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{T as t}from"./TxProgressor-CKrN9PVh.js";import{P as o}from"./ChainId-BdsD6Wmj.js";import{I as r}from"./index.esm-CCUshKp6.js";import{D as s}from"./decimal-A899wnYr.js";import"./index-C6mWTJJr.js";import"./_commonjsHelpers-BosuxZz1.js";import"./react-icons.esm-Bsp6uUW8.js";import"./chain-config-ChLUb0m2.js";import"./index-BEGbV5ZM.js";import"./tangle-DQ1MxYgI.js";import"./isHex-DRjArRUf.js";import"./ProposalBadge-aTrZS74o.js";import"./create-icon-BPUPqOkJ.js";import"./bundle-mjs-D696Ktp4.js";import"./index-BpvXyOxN.js";import"./ChainIcon-MpKHrVma.js";import"./Spinner-C8gHa2rr.js";import"./StatusIndicator-BMH2ux_C.js";import"./iframe-CzYK-pcq.js";import"./InformationLine-D6uBLwmF.js";import"./Alert-CUeVEtwL.js";import"./Typography-BXoXAd7x.js";import"./AddressChip-DtrHZX5v.js";import"./Chip-CU1xpYxs.js";import"./SkeletonLoader-CAIZ8TWK.js";import"./isSubstrateAddress-Bz2nwvvb.js";import"./asU8a-CbhOG0Ur.js";import"./index-C-EFqv7j.js";import"./___vite-browser-external_commonjs-proxy-DRaEfepn.js";import"./index.browser.esm-BZmtMS8Q.js";import"./index-VMVr2VZz.js";import"./shortenHex-B699xSHv.js";import"./shortenString-JLwGCdNy.js";import"./ChainChip-CLA7S5MZ.js";import"./SteppedProgress-CT562l7T.js";import"./TitleWithInfo-TkXT9seP.js";import"./Tooltip-BHOFDjF6.js";import"./index-DBTS1piU.js";import"./index-CLAazc5K.js";import"./index-D-pqSeBO.js";import"./index-D0XHPngQ.js";import"./index-SK0NaOuZ.js";import"./index-v-BSH-Rc.js";import"./index-D5RmOefV.js";import"./index-MLLxzWXI.js";import"./index-CrkKVscG.js";import"./isPrimitive-wBktTf-i.js";const le={title:"Design System/Molecules/TxProgressor"},n={render:()=>e.jsxs(t.Root,{children:[e.jsx(t.Header,{name:"Deposit",createdAt:Date.now()}),e.jsx(t.Body,{txSourceInfo:{typedChainId:o.Goerli,amount:new s(-1.45),tokenSymbol:"WETH",walletAddress:r()},txDestinationInfo:{typedChainId:o.PolygonTestnet,amount:new s(1.45),tokenSymbol:"webbETH",tokenType:"shielded",accountType:"note",walletAddress:r()}}),e.jsx(t.Footer,{status:"info",statusMessage:"Fetching Leaves (15%)",steppedProgressProps:{steps:8,activeStep:3},externalUrl:new URL("https://webb.tools")})]})},a={render:()=>e.jsxs(t.Root,{children:[e.jsx(t.Header,{name:"Withdraw",createdAt:Date.now()}),e.jsx(t.Body,{txSourceInfo:{typedChainId:o.Goerli,amount:new s(-1),tokenSymbol:"webbETH",tokenType:"shielded",accountType:"note",walletAddress:r()},txDestinationInfo:{typedChainId:o.PolygonTestnet,amount:new s(.96),tokenSymbol:"ETH",walletAddress:r()}}),e.jsx(t.Footer,{status:"warning",statusMessage:"Connection issue (0%)",steppedProgressProps:{steps:8},externalUrl:new URL("https://webb.tools")})]})},d={render:()=>e.jsxs(t.Root,{children:[e.jsx(t.Header,{name:"Transfer",createdAt:Date.now()}),e.jsx(t.Body,{txSourceInfo:{typedChainId:o.Goerli,amount:new s(-1),tokenSymbol:"webbETH",tokenType:"shielded",accountType:"note",walletAddress:r()},txDestinationInfo:{typedChainId:o.PolygonTestnet,amount:new s(1),tokenSymbol:"webbETH",tokenType:"shielded",accountType:"note",walletAddress:r()}}),e.jsx(t.Footer,{status:"error",statusMessage:"Transaciton Failed",steppedProgressProps:{steps:8,activeStep:9},externalUrl:new URL("https://webb.tools")})]})};var i,p,m;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <TxProgressor.Root>
      <TxProgressor.Header name="Deposit" createdAt={Date.now()} />
      <TxProgressor.Body txSourceInfo={{
      typedChainId: PresetTypedChainId.Goerli,
      amount: new Decimal(-1.45),
      tokenSymbol: 'WETH',
      walletAddress: randEthereumAddress()
    }} txDestinationInfo={{
      typedChainId: PresetTypedChainId.PolygonTestnet,
      amount: new Decimal(1.45),
      tokenSymbol: 'webbETH',
      tokenType: 'shielded',
      accountType: 'note',
      walletAddress: randEthereumAddress()
    }} />
      <TxProgressor.Footer status="info" statusMessage="Fetching Leaves (15%)" steppedProgressProps={{
      steps: 8,
      activeStep: 3
    }} externalUrl={new URL('https://webb.tools')} />
    </TxProgressor.Root>
}`,...(m=(p=n.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var l,c,T;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <TxProgressor.Root>
      <TxProgressor.Header name="Withdraw" createdAt={Date.now()} />
      <TxProgressor.Body txSourceInfo={{
      typedChainId: PresetTypedChainId.Goerli,
      amount: new Decimal(-1),
      tokenSymbol: 'webbETH',
      tokenType: 'shielded',
      accountType: 'note',
      walletAddress: randEthereumAddress()
    }} txDestinationInfo={{
      typedChainId: PresetTypedChainId.PolygonTestnet,
      amount: new Decimal(0.96),
      tokenSymbol: 'ETH',
      walletAddress: randEthereumAddress()
    }} />
      <TxProgressor.Footer status="warning" statusMessage="Connection issue (0%)" steppedProgressProps={{
      steps: 8
    }} externalUrl={new URL('https://webb.tools')} />
    </TxProgressor.Root>
}`,...(T=(c=a.parameters)==null?void 0:c.docs)==null?void 0:T.source}}};var y,u,w;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <TxProgressor.Root>
      <TxProgressor.Header name="Transfer" createdAt={Date.now()} />
      <TxProgressor.Body txSourceInfo={{
      typedChainId: PresetTypedChainId.Goerli,
      amount: new Decimal(-1),
      tokenSymbol: 'webbETH',
      tokenType: 'shielded',
      accountType: 'note',
      walletAddress: randEthereumAddress()
    }} txDestinationInfo={{
      typedChainId: PresetTypedChainId.PolygonTestnet,
      amount: new Decimal(1),
      tokenSymbol: 'webbETH',
      tokenType: 'shielded',
      accountType: 'note',
      walletAddress: randEthereumAddress()
    }} />
      <TxProgressor.Footer status="error" statusMessage="Transaciton Failed" steppedProgressProps={{
      steps: 8,
      activeStep: 9
    }} externalUrl={new URL('https://webb.tools')} />
    </TxProgressor.Root>
}`,...(w=(u=d.parameters)==null?void 0:u.docs)==null?void 0:w.source}}};const ce=["Deposit","Withdraw","Transfer"];export{n as Deposit,d as Transfer,a as Withdraw,ce as __namedExportsOrder,le as default};
