
const btn=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
btn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));});
