"use client";

export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return <html lang="en"><body style={{margin:0,fontFamily:"system-ui,sans-serif",background:"#fff7ed",color:"#35152f"}}><main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}><section style={{maxWidth:440,textAlign:"center",background:"white",borderRadius:28,padding:32}}><p style={{color:"#ef6548",fontWeight:700}}>sauti.</p><h1>We missed a beat.</h1><p>Your account and activity are safe. Try loading Sauti again.</p><button onClick={reset} style={{border:0,borderRadius:999,padding:"12px 20px",background:"#35152f",color:"white",fontWeight:700,cursor:"pointer"}}>Try again</button></section></main></body></html>;
}
