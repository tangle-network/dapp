const o=(t,n=4)=>{if(t.length<=n*2)return t;const i=t.split("").slice(0,n).join(""),s=t.split("").slice(-n).join("");return`${i}...${s}`};export{o as s};
