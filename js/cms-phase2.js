/* Phase 2 공개 콘텐츠. 조회 실패나 빈 데이터이면 기존 HTML fallback을 유지합니다. */
(function () {
  'use strict';
  function fetchItems(resource, query) {
    var controller = new AbortController(); var timer = setTimeout(function(){ controller.abort(); }, 3000);
    return fetch('/api/cms/' + resource + (query || ''), { signal:controller.signal, headers:{Accept:'application/json'} })
      .then(function(response){ if(!response.ok) throw new Error('fallback'); return response.json(); })
      .then(function(data){ return data.items || []; }).finally(function(){ clearTimeout(timer); });
  }
  function text(tag, className, value) { var node=document.createElement(tag); if(className)node.className=className; node.textContent=value||''; return node; }
  function renderWorks(items) {
    var grid=document.getElementById('poemsGrid'); if(!grid || !items.length)return;
    grid.replaceChildren(); items.forEach(function(item,index){
      var card=document.createElement('article'); card.className='poem-card fade-up'; card.dataset.title=item.title||''; card.dataset.date=item.published_date||''; card.dataset.poem=item.body||''; card.dataset.delay=String((index%3)*80);
      if(item.image_url){var image=document.createElement('img');image.src=item.image_url;image.alt=item.title||'';card.appendChild(image);}
      card.appendChild(text('span','poem-category',item.category)); card.appendChild(text('h2','poem-card-title',item.title));
      var excerpt=text('p','poem-card-excerpt',item.excerpt); excerpt.style.whiteSpace='pre-line'; card.appendChild(excerpt); card.appendChild(text('span','poem-card-date',item.published_date)); grid.appendChild(card);
    });
  }
  function renderPerformances(items) {
    var grid=document.querySelector('.concert-grid'); if(!grid || !items.length)return;
    grid.replaceChildren(); items.forEach(function(item){
      var article=document.createElement('article'); article.className='concert-card fade-up';
      if(item.image_url){var image=document.createElement('img');image.src=item.image_url;image.alt=item.title||'';image.style.cssText='width:100%;height:260px;object-fit:cover';article.appendChild(image);}
      article.appendChild(text('p','concert-number',(item.edition?'제'+item.edition+'회 · ':'')+(item.event_date||''))); article.appendChild(text('h3','concert-title',item.subtitle||item.title)); article.appendChild(text('p','concert-desc',item.description));
      if(item.page_slug){var link=text('a','btn btn-outline','자세히 보기');link.href=item.page_slug;article.appendChild(link);} grid.appendChild(article);
    });
  }
  function renderProfile(resource, sectionIndex) {
    return fetchItems(resource).then(function(items){ var lists=document.querySelectorAll('.career-list'); var list=lists[sectionIndex]; if(!list||!items.length)return; list.replaceChildren(); items.forEach(function(item){var li=document.createElement('li');li.appendChild(text('span','year',item.date_label||item.published_date));li.appendChild(text('span','',item.title||((item.publisher||'')+' '+(item.description||''))));list.appendChild(li);}); });
  }
  function renderFields(items) {
    var grid=document.querySelector('.activity-cards'); if(!grid||!items.length)return; grid.replaceChildren(); items.forEach(function(item){var card=document.createElement('a');card.className='activity-card fade-up';card.href=item.link_url||'#';if(item.image_url){var img=document.createElement('img');img.className='activity-card-img';img.src=item.image_url;img.alt=item.title||'';card.appendChild(img);}var body=document.createElement('div');body.className='activity-card-body';body.appendChild(text('h3','activity-card-title',item.title));body.appendChild(text('p','activity-card-desc',item.short_description||item.description));card.appendChild(body);grid.appendChild(card);});
  }
  function renderPerformanceDetail(items) {
    var match=location.pathname.match(/concert(\d+)\.html$/); if(!match||!items.length)return; var item=items.find(function(entry){return Number(entry.edition)===Number(match[1]);}); if(!item)return;
    var title=document.querySelector('.c3-hero-title'); if(title)title.textContent=item.subtitle||item.title;
    var c4Subtitle=document.querySelector('.c4-invitation-subtitle'); if(c4Subtitle)c4Subtitle.textContent='— '+(item.subtitle||item.title)+' —';
    var poster=document.querySelector('.c3-poster-card img'); if(poster&&item.poster_url)poster.src=item.poster_url;
    document.querySelectorAll('[data-performance-date]').forEach(function(el){el.textContent=item.event_date||'';});
    fetchItems('programs','?performance_id='+item.id).then(renderPrograms).catch(function(){});
    fetchItems('performers','?performance_id='+item.id).then(renderPerformers).catch(function(){});
  }
  function renderPrograms(items) {
    var body=document.querySelector('.c4-program-table tbody'); if(!body||!items.length)return; body.replaceChildren(); items.forEach(function(item){var row=document.createElement('tr');[item.item_order,item.title,item.work_title,item.performer,item.role].forEach(function(value,index){var cell=text('td',index===0?'td-num':index===1?'td-type':index===2?'td-poem':index===3?'td-reciter':'',value);row.appendChild(cell);});body.appendChild(row);});
  }
  function renderPerformers(items) {
    var grid=document.querySelector('.c4-cast-grid'); if(!grid||!items.length)return; grid.replaceChildren(); items.forEach(function(item){var card=document.createElement('div');card.className='c4-cast-card fade-up';if(item.photo_url){var photo=document.createElement('div');photo.className='c4-cast-photo';var img=document.createElement('img');img.className='c4-cast-img';img.src=item.photo_url;img.alt=item.name||'';photo.appendChild(img);card.appendChild(photo);}var body=document.createElement('div');body.className='c4-cast-body';body.appendChild(text('h3','c4-cast-name',item.name));body.appendChild(text('p','c4-cast-title',item.position_title||item.role));var poem=document.createElement('div');poem.className='c4-cast-poem';poem.appendChild(text('div','c4-cast-poem-title',item.work_title));poem.appendChild(text('div','c4-cast-poem-poet',item.bio));body.appendChild(poem);card.appendChild(body);grid.appendChild(card);});
  }
  var path=location.pathname;
  if(/poems\.html$/.test(path)) fetchItems('works').then(renderWorks).catch(function(){});
  if(/concert\.html$/.test(path)) fetchItems('performances').then(renderPerformances).catch(function(){});
  if(/concert[34]\.html$/.test(path)) fetchItems('performances').then(renderPerformanceDetail).catch(function(){});
  if(/about\.html$/.test(path)) {
    Promise.all([renderProfile('careers',0),renderProfile('awards',1),renderProfile('activities',2),renderProfile('press',3),fetchItems('fields').then(renderFields)]).catch(function(){});
  }
})();
