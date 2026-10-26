(function(){
 'use strict';
 var q=document.getElementById('brand-search'),d=document.getElementById('brand-device');
 if(!q||!d)return;
 var cards=Array.from(document.querySelectorAll('[data-brand-name]'));
 function norm(s){return s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');}
 cards.forEach(function(card){var link=card.querySelector('.ds-card-link');link.dataset.hub=link.getAttribute('href');});
 function update(){
  var needle=norm(q.value.trim()),n=0;
  cards.forEach(function(card){
   var show=norm(card.dataset.brandName).includes(needle)&&(!d.value||card.dataset.brandDevices.split(' ').includes(d.value));
   card.hidden=!show;if(show)n++;
   var link=card.querySelector('.ds-card-link'),routes=JSON.parse(card.dataset.deviceRoutes||'{}'),route=routes[d.value];
   link.setAttribute('href',route||link.dataset.hub);
   link.textContent=route?card.dataset.brandName+' '+d.options[d.selectedIndex].text+' servisi ↗':'Cihazınızı seçin ↗';
  });
  document.getElementById('brand-count').textContent=n+' marka listeleniyor.';
  document.getElementById('brand-empty').hidden=n>0;
 }
 q.addEventListener('input',update);d.addEventListener('change',update);update();
})();
