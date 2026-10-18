(()=>{
'use strict';
const ENDPOINT='https://script.google.com/macros/s/AKfycbzP1_ZQqNygM_MpKqC2G0zqxMOpM-IOGWE1HjW6TjS9ac9xf-ImVpN0oqg-U_6kg9bM/exec';
const q=s=>document.querySelector(s),form=q('#quote-form'),email=q('#email-quote');
if(!form||!email)return;
const btn=document.createElement('button');btn.type='button';btn.id='submit-lead';btn.className='btn btn-red btn-full';btn.style.marginTop='12px';email.insertAdjacentElement('afterend',btn);
const note=q('.quote-privacy'),lang=()=>document.documentElement.lang==='en'?'en':'ar';
const messages={
 ar:{button:'أرسل طلب رسمي إلى DRAGON ↗',privacy:'عند الضغط على «أرسل طلب رسمي»، سيتم حفظ بيانات طلبك في Google Sheets الخاص بـDRAGON وإرسال إشعار وتأكيد استلام بالبريد الإلكتروني. يمكنك أيضًا التواصل عبر واتساب دون تخزين الطلب في الجدول.',validate:'أكمل الاسم، وصف المشروع، البريد الصحيح، ووافق على استخدام بياناتك للرد على طلبك.',confirm:'سيُفتح نموذج تأكيد الطلب في نافذة جديدة. راجع رسالة الاستلام هناك؛ الطلب لا يؤكد موعد تصوير أو عقدًا.',popup:'لم نستطع فتح نافذة تأكيد الطلب. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.',consent:'أوافق على تخزين بيانات طلب المشروع لدى DRAGON والرد عبر البريد الإلكتروني أو الهاتف.'},
 en:{button:'Submit Formal Project Inquiry ↗',privacy:'Clicking Submit Formal Project Inquiry stores your details in DRAGON’s Google Sheets and triggers notification and acknowledgement emails. WhatsApp remains an alternative without saving to the lead sheet.',validate:'Enter your name, brief, valid email, and consent to storing your inquiry.',confirm:'A confirmation window will open. Read the server response there. This is not a confirmed production or shoot booking.',popup:'Could not open confirmation window. Allow pop-ups, then try again.',consent:'I consent to DRAGON storing my project inquiry and contacting me by email or phone.'}
};
function render(){
const m=messages[lang()];btn.textContent=m.button;
if(note)note.textContent=m.privacy;
const consent=q('#client-consent')?.parentElement?.querySelector('[data-extras="consent"]');if(consent)consent.textContent=m.consent;
}
function notify(msg){const el=q('#form-notice');if(el){el.textContent=msg;el.hidden=false}}
function payload(){
const pkgId=q('#package').value;
const pkgs={essentials:['Editing Essentials','2800'],production:['Content Production','5800'],partnership:['Creative Partnership','9500'],custom:['Custom quotation','To be quoted']};
const selected=pkgs[pkgId]||pkgs.custom;
return {
name:q('#client-name').value.trim(),
brand:q('#client-brand').value.trim(),
email:q('#client-email').value.trim(),
phone:q('#client-phone').value.trim(),
package:selected[0],
starting_price:selected[1],
platform:q('#client-platform').value,
videos:q('#client-quantity').value,
target_date:q('#client-deadline').value,
reference:q('#client-reference').value.trim(),
extras:[...document.querySelectorAll('.extras input:checked')].map(x=>x.value).join(' / '),
brief:q('#client-brief').value.trim(),
website:''
}
}
btn.addEventListener('click',()=>{
const m=messages[lang()],email=q('#client-email'),consent=q('#client-consent'),ref=q('#client-reference');
if(!q('#client-name').value.trim()||!q('#client-brief').value.trim()||!email.value.trim()||!email.validity.valid||!consent.checked){notify(m.validate);return}
if(ref.value&&!ref.validity.valid){ref.focus();return}
const newWindow=window.open('about:blank','_blank');
if(!newWindow){notify(m.popup);return}
const params=payload(),transfer=document.createElement('form');transfer.method='POST';transfer.action=ENDPOINT;transfer.target=newWindow.name||'dragon-lead-receipt';
if(!newWindow.name)newWindow.name='dragon-lead-receipt';
for(const [key,value] of Object.entries(params)){const el=document.createElement('input');el.type='hidden';el.name=key;el.value=value;transfer.appendChild(el)}
document.body.appendChild(transfer);transfer.submit();transfer.remove();
notify(m.confirm);
});
q('#language-toggle')?.addEventListener('click',()=>setTimeout(render,0));
render();
})();