(()=>{
'use strict';
const config=window.DRAGON_CONFIG||{};
const quote=document.querySelector('#quote-form'), work=document.querySelector('#work'), copy=document.querySelector('#copy-quote');
if(!quote||!work||!copy)return;
const q=(s,root=document)=>root.querySelector(s);
const language=()=>document.documentElement.lang==='en'?'en':'ar';
const TXT={
ar:{samples:'مختارات فيديو من ملف أعمالنا',vid1:'عينة فيديو 01',vid2:'عينة فيديو 02',view:'شاهد الفيديو على Google Drive ↗',note:'روابط الملفات من مجلد الأعمال الذي أتاحه المؤسس. بعض الفيديوهات قد تحتاج صلاحية مشاهدة؛ لا ننسبها لعميل محدد دون توثيق.',details:'تفاصيل الطلب',email:'بريدك الإلكتروني',mobile:'رقم موبايلك (اختياري)',platform:'المنصة الأساسية',quantity:'عدد الفيديوهات المتوقع',deadline:'الموعد المستهدف (اختياري)',reference:'رابط مرجعي أو ملاحظات إضافية (اختياري)',consent:'أوافق على استخدام بياناتي للرد على طلب المشروع فقط. الموقع لا يخزنها في قاعدة بيانات في هذه النسخة.',sendemail:'أرسل الطلب بالبريد الإلكتروني ↗',notes:'يمكنك اختيار واتساب أو البريد الإلكتروني. تجهيز الرسالة لا يعني إرسالها إلا عندما تؤكدها في التطبيق.',required:'من فضلك اكتب الاسم ووصف المشروع وبريدًا إلكترونيًا صحيحًا ووافق على استخدام بياناتك للرد.',copied:'تم نسخ جميع تفاصيل الطلب.',copyfailed:'تعذّر النسخ، حاول مرة أخرى.'},
en:{samples:'Selected videos from the work archive',vid1:'Video sample 01',vid2:'Video sample 02',view:'Watch on Google Drive ↗',note:'These files were selected from the founder’s shared work folder. Viewing may require access; no specific client attribution is claimed.',details:'Project details',email:'Your email address',mobile:'Phone number (optional)',platform:'Primary platform',quantity:'Estimated number of videos',deadline:'Target delivery date (optional)',reference:'Reference link or additional notes (optional)',consent:'I agree to have my details used only to respond to my project inquiry. This version does not store details in an online database.',sendemail:'Send inquiry by email ↗',notes:'Choose WhatsApp or email. The draft is sent only after you confirm in the selected app.',required:'Please enter your name, project brief, a valid email, and consent to follow-up.',copied:'All inquiry details copied.',copyfailed:'Copy failed. Please try again.'}
};
const videos=[
'https://drive.google.com/file/d/14sitUFUQSpUcZCUqHxdvv5JyHfznMAx4/view',
'https://drive.google.com/file/d/1wiJ3CjYSavmc0fVaN7TrvlIRHjvHjJo-/view'
];
function setupPortfolio(){
const grid=q('.work-grid',work);if(!grid)return;
const wrap=document.createElement('div');wrap.id='portfolio-video-extras';
wrap.innerHTML='<h3 class="intake-heading" data-extras="samples"></h3><div class="portfolio-video-grid">'+videos.map((url,i)=>'<a class="portfolio-video-card" href="'+url+'" target="_blank" rel="noopener noreferrer"><span class="pv-thumb" aria-hidden="true">▶</span><span class="pv-body"><strong data-extras="vid'+(i+1)+'"></strong><span data-extras="view"></span><span class="pv-label">PORTFOLIO / VIDEO</span></span></a>').join('')+'</div><p class="pv-advisory" data-extras="note"></p>';
grid.insertAdjacentElement('afterend',wrap);
}
function setupIntake(){
const block=document.createElement('div');
block.id='intake-extra-fields';
block.innerHTML='<h3 class="intake-heading" data-extras="details"></h3>'+
'<div class="intake-input-grid">'+
'<div class="intake-field"><label for="client-email" data-extras="email"></label><input id="client-email" type="email" maxlength="160" autocomplete="email" required placeholder="name@example.com"></div>'+
'<div class="intake-field"><label for="client-phone" data-extras="mobile"></label><input id="client-phone" type="tel" maxlength="30" autocomplete="tel" placeholder="+20"></div>'+
'<div class="intake-field"><label for="client-platform" data-extras="platform"></label><select id="client-platform"><option value="Instagram">Instagram</option><option value="TikTok">TikTok</option><option value="Facebook">Facebook</option><option value="YouTube">YouTube</option><option value="Multiple platforms">Multiple platforms</option><option value="Other / To be discussed">Other / To be discussed</option></select></div>'+
'<div class="intake-field"><label for="client-quantity" data-extras="quantity"></label><select id="client-quantity"><option value="1">1</option><option value="4" selected>4</option><option value="8">8</option><option value="12">12</option><option value="More / Not sure">More / Not sure</option></select></div>'+
'<div class="intake-field"><label for="client-deadline" data-extras="deadline"></label><input id="client-deadline" type="date"></div>'+
'<div class="intake-field"><label for="client-reference" data-extras="reference"></label><input id="client-reference" type="url" maxlength="500" placeholder="https://"></div>'+
'</div><label class="consent-line"><input type="checkbox" id="client-consent" required><span data-extras="consent"></span></label>';
const oldEstimate=q('.estimate',quote);if(!oldEstimate)return;oldEstimate.insertAdjacentElement('beforebegin',block);
const email=document.createElement('button');email.type='button';email.id='email-quote';email.className='btn btn-neutral btn-full';email.innerHTML='<span data-extras="sendemail"></span>';copy.insertAdjacentElement('afterend',email);
const note=document.createElement('p');note.className='intake-actions-note';note.dataset.extras='notes';email.insertAdjacentElement('afterend',note);
email.addEventListener('click',()=>{
if(!valid())return;
const subject=encodeURIComponent('DRAGON STUDIO — Project inquiry');
window.location.href='mailto:'+encodeURIComponent(config.CONTACT_EMAIL||'dragon.media.cerator@gmail.com')+'?subject='+subject+'&body='+encodeURIComponent(message());
});
quote.addEventListener('submit',event=>{
event.preventDefault();event.stopImmediatePropagation();
if(!valid())return;
const phone=String(config.WHATSAPP_NUMBER||'').replace(/\D/g,'');if(!/^\d{10,15}$/.test(phone)){notice('WhatsApp number is not configured.');return;}
window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(message()),'_blank','noopener,noreferrer');
},true);
copy.addEventListener('click',async event=>{
event.preventDefault();event.stopImmediatePropagation();if(!valid())return;
try{await navigator.clipboard.writeText(message());notice(TXT[language()].copied)}catch(e){notice(TXT[language()].copyfailed)}
},true);
}
function valid(){
const name=q('#client-name')?.value.trim(),brief=q('#client-brief')?.value.trim(),email=q('#client-email'),consent=q('#client-consent');
if(!name||!brief||!email?.validity.valid||!email.value.trim()||!consent?.checked){notice(TXT[language()].required);return false}
const ref=q('#client-reference');if(ref?.value&&!ref.validity.valid){ref.focus();return false}
const note=q('#form-notice');if(note)note.hidden=true;return true;
}
function notice(msg){const e=q('#form-notice');if(e){e.textContent=msg;e.hidden=false}}
function message(){
const id=q('#package').value,prices={essentials:2800,production:5800,partnership:9500};
const pkg={essentials:'Editing Essentials',production:'Content Production',partnership:'Creative Partnership'};
const extras=[...quote.querySelectorAll('.extras input:checked')].map(x=>x.value);
return ['DRAGON STUDIO | PROJECT INQUIRY','',
'Name: '+q('#client-name').value.trim(),
'Business / brand: '+q('#client-brand').value.trim(),
'Email: '+q('#client-email').value.trim(),
'Phone: '+(q('#client-phone').value.trim()||'Not provided'),
'Package: '+(pkg[id]||'Custom quotation'),
'Starting price: '+(prices[id]?'EGP '+prices[id].toLocaleString('en-US'):'To be quoted'),
'Platform: '+q('#client-platform').value,
'Estimated videos: '+q('#client-quantity').value,
'Target date: '+(q('#client-deadline').value||'To be discussed'),
'Reference: '+(q('#client-reference').value.trim()||'None'),
'Extras: '+(extras.join(', ')||'None'),
'Project brief: '+q('#client-brief').value.trim(),'',
'This is an inquiry, not a confirmed production booking. Final scope, fees and timelines require agreement.'].join('\n');
}
function translate(){for(const n of document.querySelectorAll('[data-extras]')){const key=n.dataset.extras;n.textContent=TXT[language()][key]||''}}
setupPortfolio();setupIntake();translate();
q('#language-toggle')?.addEventListener('click',()=>setTimeout(translate,0));
})();