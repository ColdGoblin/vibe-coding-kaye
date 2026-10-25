(function () {
  'use strict';
  function init() {
    var panels = Array.from(document.querySelectorAll('main article.session, main article.unit'));
    if (panels.length < 2) return;
    var parent = panels[0].parentElement;
    if (!panels.every(function (p) { return p.parentElement === parent; })) return;
    var stages = Array.from(parent.querySelectorAll(':scope > .stage-head'));
    var stageFor = panels.map(function (p) {
      var before = p.previousElementSibling;
      while (before && !before.classList.contains('stage-head')) before = before.previousElementSibling;
      return before;
    });
    var isSession = panels[0].classList.contains('session');
    var bar = document.createElement('div');
    bar.className = 'lesson-tabs';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', isSession ? 'בחירת מפגש' : 'בחירת יחידת לימוד');
    bar.setAttribute('dir', 'rtl');
    var tabs = panels.map(function (panel, index) {
      var tab = document.createElement('button');
      var title = panel.querySelector('.unit-title, h2, h3');
      tab.type = 'button'; tab.id = 'lesson-tab-' + panel.id;
      tab.className = 'lesson-tab'; tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      var number = document.createElement('span'); number.className = 'lesson-tab-number';
      number.textContent = panel.id === 'proj' ? 'לאורך הקורס' : (isSession ? 'מפגש ' : 'יחידה ') + (index + 1);
      var label = document.createElement('span'); label.textContent = title ? title.textContent : panel.id;
      tab.append(number, label); bar.appendChild(tab);
      panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', tab.id); panel.tabIndex = 0;
      return tab;
    });
    parent.insertBefore(bar, stages[0] || panels[0]);
    var nav = document.createElement('nav'); nav.className = 'lesson-pager'; nav.setAttribute('aria-label', 'מעבר בין שיעורים');
    var previous = document.createElement('button'), next = document.createElement('button'), status = document.createElement('span');
    previous.type = next.type = 'button'; previous.className = next.className = 'btn btn-ghost';
    previous.textContent = 'לשיעור הקודם'; next.textContent = 'לשיעור הבא';
    status.className = 'lesson-position'; status.setAttribute('aria-live', 'polite');
    nav.append(previous, status, next); panels[panels.length - 1].after(nav);
    var active = 0;
    function activate(index, updateUrl, focus) {
      active = index;
      panels.forEach(function (p, i) {
        p.hidden = i !== index; tabs[i].setAttribute('aria-selected', String(i === index)); tabs[i].tabIndex = i === index ? 0 : -1;
      });
      stages.forEach(function (s) { s.hidden = s !== stageFor[index]; });
      previous.disabled = index === 0; next.disabled = index === panels.length - 1;
      status.textContent = (isSession ? 'מפגש ' : 'יחידה ') + (index + 1) + ' מתוך ' + panels.length;
      if (updateUrl) history.pushState(null, '', '#' + panels[index].id);
      if (focus) { tabs[index].focus({preventScroll:true}); tabs[index].scrollIntoView({block:'nearest',inline:'nearest'}); }
    }
    function fromHash() {
      var id; try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
      var target = document.getElementById(id);
      var index = panels.findIndex(function (p) { return p === target || (target && p.contains(target)); });
      if (index < 0 && target && target.classList.contains('stage-head')) index = stageFor.indexOf(target);
      if (index >= 0) {
        activate(index, false, false);
        for (var node = target; node && node !== panels[index]; node = node.parentElement) if (node.tagName === 'DETAILS') node.open = true;
      }
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i, true, false); });
      tab.addEventListener('keydown', function (event) {
        var index;
        if (event.key === 'ArrowLeft') index = (i + 1) % tabs.length;
        else if (event.key === 'ArrowRight') index = (i + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = tabs.length - 1;
        else return;
        event.preventDefault(); activate(index, true, true);
      });
    });
    function step(delta) { activate(active + delta, true, true); bar.scrollIntoView({block:'start',behavior:'instant'}); }
    previous.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    window.addEventListener('hashchange', fromHash); window.addEventListener('popstate', fromHash);
    activate(0, false, false); fromHash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
