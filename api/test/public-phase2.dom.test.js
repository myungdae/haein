'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../..');

async function eventually(assertion,timeoutMs=1000){const started=Date.now();while(Date.now()-started<timeoutMs){try{assertion();return;}catch{await new Promise(resolve=>setTimeout(resolve,10));}}assertion();}

test('효 콘서트 소개는 미확인 통계 없이 planner와 반응형 한 열 구조를 유지한다',()=>{
  const html=fs.readFileSync(path.join(root,'pages/concert.html'),'utf8');
  const dom=new JSDOM(html); const document=dom.window.document;
  for(const value of ['10+','3천+','50+','20+','정기 공연 횟수','누적 관객 수','낭송 작품 수','참여 낭송가 수'])assert.equal(document.body.textContent.includes(value),false,value+' 통계가 남아 있습니다.');
  assert.ok(document.querySelector('.concert-planner-card'));
  assert.ok(document.querySelector('.concert-intro-layout'));
  assert.ok(document.querySelector('.concert-grid'));
  const styles=[...document.querySelectorAll('style')].map(node=>node.textContent).join('\n');
  assert.match(styles,/@media\s*\(max-width:\s*768px\)[\s\S]*?\.concert-intro-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(styles,/\.concert-intro-copy,\.concert-intro-photo,\.concert-planner-card\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%/);
  assert.doesNotMatch(html,/class="fade-in"[^>]*class=/,'중복 class 속성이 없어야 합니다.');
  dom.window.close();
});

test('CMS 작품 9편은 화면에 보이고 검색 및 카드 모달이 동작한다',async()=>{
  const html=fs.readFileSync(path.join(root,'pages/poems.html'),'utf8');
  const cms=fs.readFileSync(path.join(root,'js/cms-phase2.js'),'utf8');
  const main=fs.readFileSync(path.join(root,'js/main.js'),'utf8');
  const dom=new JSDOM(html,{url:'https://kanghaein.com/pages/poems.html',runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom;const {document}=window;
  window.IntersectionObserver=class{observe(element){element.classList.add('visible');}unobserve(){}};
  const titles=['어머니의 봄','효(孝)','낙엽 위의 시','빛의 낭송','강은 흐른다','아버지의 등','치유의 시','고향의 봄','봄비'];
  const items=titles.map((title,index)=>({id:index+1,title,body:`${title} 전문 전체`,excerpt:`${title} 발췌`,published_date:`202${index}.01`,category:'시',is_visible:true,verification_status:'needs_review'}));
  window.fetch=async()=>({ok:true,async json(){return{ok:true,items};}});
  window.eval(main); document.dispatchEvent(new window.Event('DOMContentLoaded'));
  window.eval(cms);
  await eventually(()=>{
    const rendered=[...document.querySelectorAll('#poemsGrid .poem-card')];
    assert.equal(rendered.length,9);
    assert.equal(rendered.find(card=>card.dataset.title==='봄비').dataset.poem,'봄비 전문 전체');
  });
  const cards=[...document.querySelectorAll('#poemsGrid .poem-card')];
  assert.ok(cards.every(card=>card.classList.contains('visible')),'동적 작품 카드가 숨김 애니메이션 상태에 남으면 안 됩니다.');
  document.getElementById('poemSearch').value='봄비';
  document.getElementById('poemSearch').dispatchEvent(new window.Event('input',{bubbles:true}));
  assert.equal(cards.filter(card=>card.style.display!=='none').length,1);
  const springRain=cards.find(card=>card.dataset.title==='봄비');
  springRain.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
  assert.ok(document.getElementById('poemModal').classList.contains('open'));
  assert.equal(document.querySelector('.modal-poem-text').textContent,'봄비 전문 전체');
  dom.window.close();
});

test('003 보정 migration은 기존 작품을 중복 삽입하지 않고 공개·검토 상태를 분리한다',()=>{
  const sql=fs.readFileSync(path.join(root,'api/migrations/003_phase2_public_content_fix.sql'),'utf8');
  assert.match(sql,/ADD COLUMN IF NOT EXISTS verification_status/);
  assert.match(sql,/is_visible = TRUE/);
  assert.match(sql,/verification_status = 'needs_review'/);
  assert.match(sql,/WHERE NOT EXISTS \(SELECT 1 FROM works w WHERE w\.title = source\.title\)/);
  for(const title of ['어머니의 봄','효(孝)','낙엽 위의 시','빛의 낭송','강은 흐른다','아버지의 등','치유의 시','고향의 봄','봄비'])assert.ok(sql.includes(title));
});
