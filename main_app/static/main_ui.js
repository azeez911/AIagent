(function(){
  const root=document.documentElement;
  function onMove(e){
    const x=(e.clientX/window.innerWidth)*100;
    const y=(e.clientY/window.innerHeight)*100;
    root.style.setProperty('--mx',x.toFixed(2)+'%');
    root.style.setProperty('--my',y.toFixed(2)+'%');
  }
  window.addEventListener('mousemove', onMove, {passive:true});
})();
