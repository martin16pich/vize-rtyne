(function(){
  if(!['localhost','127.0.0.1'].includes(location.hostname)) return;
  const a=document.createElement('a');a.href='hotspot-editor.html';a.textContent='Editor webu';
  Object.assign(a.style,{position:'fixed',right:'16px',bottom:'16px',zIndex:'9998',padding:'12px 18px',borderRadius:'999px',background:'#111',color:'#fff',font:'800 14px system-ui,sans-serif',textDecoration:'none',boxShadow:'0 10px 30px rgba(0,0,0,.25)'});
  document.body.appendChild(a);
})();
