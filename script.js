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
}

// =========================================================
// COMMAND PALETTE — press "/" anywhere (outside a text field)
// to jump to a page. Site-wide: the markup is identical on
// every page, so this just needs the matching elements present.
// =========================================================
const cmdkOverlay = document.getElementById('cmdk-overlay');
if (cmdkOverlay){
  const cmdkInput = document.getElementById('cmdk-input');
  const cmdkTrigger = document.getElementById('cmdk-trigger');
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
}

// =========================================================
// HERO TYPING EFFECT (index page only) — the code block types
// itself out on load instead of just fading in. Syntax-
// highlighted spans are swapped back in the moment each line
// finishes, rather than trying to type through nested tags.
// =========================================================
const heroCodeLines = document.querySelectorAll('.hero .code .code-line');
if (heroCodeLines.length && !prefersReducedMotion){
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
}

// =========================================================
// CURSOR TILT — a small Watermelon-UI-style micro-interaction:
// cards tilt toward the cursor instead of just lifting flatly.
// Reused for both project cards (static) and article cards
// (built dynamically, so this gets called per-card as each one
// is created rather than queried once on page load).
// =========================================================
function applyTilt(card){
  card.style.transformStyle = 'preserve-3d';
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
}
document.querySelectorAll('.card').forEach(applyTilt);

// =========================================================
// CONTACT FORM — built with JS instead of a raw form-mailto
// action. Form-level mailto (action="mailto:..." enctype=
// "text/plain") is unreliable across browsers, especially on
// machines with no default mail app configured, and can fail
// silently. Building the mailto: URL ourselves and opening it
// on submit is the more dependable version of the same trick.
// A real contact form that sends mail without opening the
// visitor's email client needs a backend or a service like
// Formspree — this is still a front-end-only simulation.
// =========================================================
const contactForm = document.getElementById('contact-form');
if (contactForm){
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    if (!name || !email || !message) return;

    const subject = encodeURIComponent(`Message from ${name} (via website)`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:annika.kanungo@example.edu?subject=${subject}&body=${body}`;
  });
}

// =========================================================
// ARTICLES PAGE — rendering, filtering, and REAL admin auth.
// Everything below is guarded on #article-list existing, so
// this file stays safe to include on every page.
//
// TEACHING NOTE: articles now live in Firestore (a real shared
// database), not localStorage. Anyone can read them (public
// blog). Only the account whose UID is hardcoded in
// firestore.rules can write — that check happens on Google's
// servers, so a student cannot post even by opening dev tools
// and calling these functions directly, because Firestore will
// reject the write without a matching authenticated UID.
// =========================================================
const articleList = document.getElementById('article-list');
if (articleList && typeof db !== 'undefined'){

  const template = document.getElementById('article-template');
  const tagLabel = { code:'Code', case:'Case', both:'Both' };

  function buildCard(id, article){
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.article-card');
    card.dataset.tag = article.tag;
    card.dataset.id = id;
    node.querySelector('.article-num').textContent = article.num ? 'No. ' + article.num : '';
    node.querySelector('h3').textContent = article.title;
    node.querySelector('p').textContent = article.excerpt;
    const pill = node.querySelector('.pill');
    pill.textContent = tagLabel[article.tag] || article.tag;
    pill.classList.add(article.tag);
    node.querySelector('.date').textContent = article.date || '';
    node.querySelector('.read').textContent = article.read || '';
    applyTilt(card);
    return node;
  }

  function renderArticles(docs){
    articleList.innerHTML = '';
    if (docs.length === 0){
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No articles filed yet — check back soon.';
      articleList.appendChild(empty);
    } else {
      docs.forEach(doc => articleList.appendChild(buildCard(doc.id, doc.data())));
    }
    attachFilter();
  }

  function loadArticles(){
    db.collection('articles').orderBy('createdAt', 'desc').get()
      .then(snapshot => renderArticles(snapshot.docs))
      .catch(err => {
        console.error('Could not load articles:', err);
        articleList.innerHTML = '<p class="empty-state">Could not load articles right now.</p>';
      });
  }

  function attachFilter(){
    const cards = articleList.querySelectorAll('.article-card');
    const activeBtn = document.querySelector('.filter-bar .filter-btn.active');
    const filter = activeBtn ? activeBtn.dataset.filter : 'all';
    cards.forEach(card => { card.hidden = !(filter === 'all' || card.dataset.tag === filter); });
  }

  // Sliding pill indicator behind the active filter button.
  const filterPill = document.getElementById('filter-pill');
  function movePill(){
    const activeBtn = document.querySelector('.filter-bar .filter-btn.active');
    if (!filterPill || !activeBtn) return;
    filterPill.style.width = activeBtn.offsetWidth + 'px';
    filterPill.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  }
  window.addEventListener('resize', movePill);
  movePill();

  document.querySelectorAll('.filter-bar .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      attachFilter();
      movePill();
    });
  });

  loadArticles();

  // ---- REAL admin login (Firebase Authentication) ----
  const toggleBtn = document.getElementById('admin-toggle');
  const loginPanel = document.getElementById('admin-login');
  const formPanel = document.getElementById('admin-form-panel');
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const submitBtn = document.getElementById('admin-submit');
  const errorMsg = document.getElementById('admin-error');
  const publishBtn = document.getElementById('publish-article');
  const logoutBtn = document.getElementById('admin-logout');

  // Reflects the real, server-verified login state — not a
  // client-side flag like the old demo used. Also toggles a
  // body class so edit/delete buttons only show while logged in.
  let editingId = null;
  auth.onAuthStateChanged(user => {
    if (user){
      loginPanel.hidden = true;
      formPanel.hidden = false;
      document.body.classList.add('is-admin');
    } else {
      formPanel.hidden = true;
      document.body.classList.remove('is-admin');
      editingId = null;
    }
      });

  toggleBtn.addEventListener('click', () => {
    const isOpen = !loginPanel.hidden || !formPanel.hidden;
    if (isOpen){
      loginPanel.hidden = true;
      formPanel.hidden = true;
    } else if (auth.currentUser){
      formPanel.hidden = false;
    } else {
      loginPanel.hidden = false;
    }
  });

  submitBtn.addEventListener('click', () => {
    errorMsg.hidden = true;
    auth.signInWithEmailAndPassword(emailInput.value.trim(), passwordInput.value)
      .then(() => {
        passwordInput.value = '';
      })
      .catch((err) => {
        errorMsg.textContent = err.code + ': ' + err.message;
        errorMsg.hidden = false;
      });
  });

  logoutBtn.addEventListener('click', () => {
    auth.signOut();
    formPanel.hidden = true;
  });

  function clearArticleForm(){
    document.getElementById('new-title').value = '';
    document.getElementById('new-excerpt').value = '';
    document.getElementById('new-date').value = '';
    document.getElementById('new-read').value = '';
    document.getElementById('new-tag').value = 'code';
    editingId = null;
    publishBtn.textContent = '$ publish --article';
  }

  publishBtn.addEventListener('click', () => {
    const title = document.getElementById('new-title').value.trim();
    const excerpt = document.getElementById('new-excerpt').value.trim();
    const tag = document.getElementById('new-tag').value;
    const date = document.getElementById('new-date').value.trim() || 'Just now';
    const read = document.getElementById('new-read').value.trim() || '—';
    if (!title || !excerpt) return;

    const data = { title, excerpt, tag, date, read };

    const request = editingId
      ? db.collection('articles').doc(editingId).update(data)
      : db.collection('articles').add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });

    request.then(() => {
      clearArticleForm();
      loadArticles();
      celebrate();
    }).catch(err => {
      // Firestore rejects this if the logged-in user's UID doesn't
      // match the one in firestore.rules — the real enforcement.
      alert('Could not save: ' + err.message);
    });
  });

  // Edit / Delete — event delegation so it works for every card,
  // including ones added after the page first loads.
  articleList.addEventListener('click', (e) => {
    const card = e.target.closest('.article-card');
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.classList.contains('delete-btn')){
      const title = card.querySelector('h3').textContent;
      if (confirm(`Delete "${title}"? This can't be undone.`)){
        db.collection('articles').doc(id).delete()
          .then(loadArticles)
          .catch(err => alert('Could not delete: ' + err.message));
      }
    }

    if (e.target.classList.contains('edit-btn')){
      db.collection('articles').doc(id).get().then(doc => {
        const a = doc.data();
        document.getElementById('new-title').value = a.title || '';
        document.getElementById('new-excerpt').value = a.excerpt || '';
        document.getElementById('new-tag').value = a.tag || 'code';
        document.getElementById('new-date').value = a.date || '';
        document.getElementById('new-read').value = a.read || '';
        editingId = id;
        publishBtn.textContent = '$ update --article';
        loginPanel.hidden = true;
        formPanel.hidden = false;
        formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });
}
