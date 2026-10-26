/* Static request builder. Nothing is submitted or stored automatically. */
(function(){
 'use strict';
 var search=document.getElementById('neighborhood-search');
 if(search){search.addEventListener('input',function(){var q=search.value.trim().toLocaleLowerCase('tr-TR');var count=0;document.querySelectorAll('#neighborhood-list a').forEach(function(a){var show=a.textContent.toLocaleLowerCase('tr-TR').includes(q);a.hidden=!show;a.style.display=show?'':'none';if(show)count++;});document.getElementById('neighborhood-empty').hidden=count>0;});}
 var form=document.getElementById('appointment-form');
 if(!form)return;
 var started=false,draftTracked=false;
 function trackAppointment(name){
  if(window.DR_ANALYTICS_DISABLED||typeof window.gtag!=='function')return;
  window.gtag('event',name,{form_id:'appointment-form',contact_page:window.location.pathname});
 }
 form.addEventListener('input',function(){if(!started){started=true;trackAppointment('appointment_start');}});
 var params=new URLSearchParams(location.search);
 ['marka','mahalle','ilce','cihaz'].forEach(function(key){
  var value=params.get(key),field=form.elements[key];if(!value||!field)return;
  if(field.tagName==='SELECT'){
   var match=Array.from(field.options).find(function(option){return option.value.toLocaleLowerCase('tr-TR')===value.toLocaleLowerCase('tr-TR');});
   if(match)field.value=match.value;
  }else field.value=value.slice(0,100);
 });
 var today=new Date();var localDate=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
 form.elements.tarih.min=localDate;
 var result=document.getElementById('appointment-result');var message=document.getElementById('appointment-message');var send=document.getElementById('appointment-send');
 function update(){send.href='https://wa.me/905428912225?text='+encodeURIComponent(message.value);}
 message.addEventListener('input',update);
 form.addEventListener('submit',function(event){event.preventDefault();if(!form.reportValidity())return;var f=new FormData(form);message.value='Merhaba, servis randevusu için uygunluk bilgisi almak istiyorum.\n\nCihaz: '+f.get('cihaz')+'\nMarka-model: '+(f.get('marka')||'Görüşmede paylaşacağım')+'\nİlçe: '+f.get('ilce')+'\nMahalle: '+f.get('mahalle')+'\nArıza: '+f.get('sorun')+'\nTercih edilen tarih: '+(f.get('tarih')||'Görüşmede belirleyelim')+'\nSaat tercihi: '+f.get('saat')+'\n\nRandevu gün ve saatini birlikte kesinleştirebilir miyiz?';update();result.hidden=false;if(!draftTracked){draftTracked=true;trackAppointment("appointment_draft_ready");}message.focus();});
 form.addEventListener('input',function(event){if(event.target!==message&&!result.hidden){result.hidden=true;}});
})();
