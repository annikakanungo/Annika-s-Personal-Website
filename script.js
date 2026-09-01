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
