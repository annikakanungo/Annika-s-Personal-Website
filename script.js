// Shared across all pages: reveal ".reveal" elements once they enter
// the viewport, then stop watching them so the animation plays once.
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in-view');
      entry.target.querySelectorAll('.bar i').forEach(bar => { bar.style.width = bar.dataset.width; });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealEls.forEach(el => observer.observe(el));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =========================================================
// PUBLISH CELEBRATION — a small burst of code/case-themed
// pieces on successful publish or update. Purely decorative,
// so it's skipped entirely for reduced-motion users.
// =========================================================
function celebrate(){
  if (prefersReducedMotion) return;
  const pieces = ['🔨', '{ }', '⚖️', '✓'];
  for (let i = 0; i < 16; i++){
    const el = document.createElement('span');
    el.className = 'confetti-piece';
    el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    el.style.left = (45 + Math.random() * 10) + 'vw';
    el.style.setProperty('--x', (Math.random() * 200 - 100) + 'px');
    el.style.setProperty('--r', (Math.random() * 360) + 'deg');
    el.style.animationDelay = (Math.random() * 0.15) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
}

// =========================================================
// DARK MODE TOGGLE — site-wide. Preference remembered in
// localStorage; a tiny inline script in each page's <head>
// applies it before paint to avoid a flash of the wrong theme.
// =========================================================
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle){
  try {
  function updateThemeIcon(){
    themeToggle.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀' : '◐';
  }
  updateThemeIcon();
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark){
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('site-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('site-theme', 'dark');
    }
    updateThemeIcon();
  });
  } catch (err) { console.error('Dark mode toggle failed to initialize:', err); }
}

// =========================================================
// COMMAND PALETTE — press "/" anywhere (outside a text field)
// to jump to a page. Site-wide: the markup is identical on
// every page, so this just needs the matching elements present.
// =========================================================
const cmdkOverlay = document.getElementById('cmdk-overlay');
if (cmdkOverlay){
  try {
  const cmdkInput = document.getElementById('cmdk-input');
  const cmdkTrigger = document.getElementById('cmdk-trigger');
  const cmdkClose = document.getElementById('cmdk-close');
  const cmdkItems = Array.from(cmdkOverlay.querySelectorAll('.cmdk-item'));

  function openPalette(){
    cmdkOverlay.hidden = false;
    cmdkInput.value = '';
    cmdkItems.forEach(item => { item.hidden = false; });
    cmdkInput.focus();
  }
  function closePalette(){
    cmdkOverlay.hidden = true;
  }
    
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (e.key === '/' && !typing && cmdkOverlay.hidden){
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape' && !cmdkOverlay.hidden){
      closePalette();
    }
  });

  if (cmdkTrigger) cmdkTrigger.addEventListener('click', openPalette);
  if (cmdkClose) cmdkClose.addEventListener('click', closePalette);
  cmdkOverlay.addEventListener('click', (e) => { if (e.target === cmdkOverlay) closePalette(); });

  cmdkInput.addEventListener('input', () => {
    const q = cmdkInput.value.toLowerCase();
    cmdkItems.forEach(item => {
      item.hidden = !item.textContent.toLowerCase().includes(q);
    });
  });

  cmdkInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      const firstVisible = cmdkItems.find(item => !item.hidden);
      if (firstVisible) window.location.href = firstVisible.dataset.href;
    }
  });

  cmdkItems.forEach(item => {
    item.addEventListener('click', () => { window.location.href = item.dataset.href; });
  });
  } catch (err) { console.error('Command palette failed to initialize:', err); }
}

// =========================================================
// HERO TYPING EFFECT (index page only) — the code block types
// itself out on load instead of just fading in. Syntax-
// highlighted spans are swapped back in the moment each line
// finishes, rather than trying to type through nested tags.
// =========================================================
const heroCodeLines = document.querySelectorAll('.hero .code .code-line');
if (heroCodeLines.length && !prefersReducedMotion){
  try {
  const originals = Array.from(heroCodeLines).map(l => l.innerHTML);
  heroCodeLines.forEach(l => { l.innerHTML = '&nbsp;'; });

  let li = 0;
  function typeLine(){
    if (li >= heroCodeLines.length) return;
    const line = heroCodeLines[li];
    const holder = document.createElement('div');
    holder.innerHTML = originals[li];
    const text = holder.textContent;
    let ci = 0;
    line.innerHTML = '<span class="cursor">&nbsp;</span>';

    const interval = setInterval(() => {
      ci++;
      line.textContent = text.slice(0, ci);
      if (ci >= text.length){
        clearInterval(interval);
        line.innerHTML = originals[li];
        li++;
        if (li < heroCodeLines.length){
          setTimeout(typeLine, 120);
        } else {
          line.innerHTML += '<span class="cursor">&nbsp;</span>';
        }
      }
    }, 22);
  }
  setTimeout(typeLine, 900);
  } catch (err) { console.error('Hero typing effect failed to initialize:', err); }
}

// =========================================================
// CURSOR TILT — a small Watermelon-UI-style micro-interaction:
// cards tilt toward the cursor instead of just lifting flatly.
// Reused for both project cards (static) and article cards
// (built dynamically, so this gets called per-card as each one
// is created rather than queried once on page load).
// =========================================================
function applyTilt(card){
