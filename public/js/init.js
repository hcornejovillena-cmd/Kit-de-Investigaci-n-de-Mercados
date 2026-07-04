// INIT
// ══════════════════════════════════════════════════
window.addEventListener('load',()=>{loadCEx();loadMEx();initI18n();renderProblemList();});
window.addEventListener('resize',()=>{if(S.vw.res)drawVWChart('vw-canvas',S.vw.res,S.vw.res);if(S.nms.res){drawVWChart('nms-vw-canvas',S.nms.res,S.nms.res);drawNMSChart();}});
