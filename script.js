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
// ARTICLES PAGE — rendering, filtering, and the admin demo.
// Everything below is guarded on #article-list existing, so
// this file stays safe to include on every page.
// =========================================================
const articleList = document.getElementById('article-list');
if (articleList){

  const seedArticles = [];

  const STORAGE_KEY = 'annika-articles-demo';
  const getPosted = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e){ return []; }
  };
  const savePosted = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  const template = document.getElementById('article-template');
  const tagLabel = { code:'Code', case:'Case', both:'Both', new:'New' };

  function buildCard(article, isNew){
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.article-card');
    card.dataset.tag = article.tag;
    if (isNew) card.classList.add('is-new');
    node.querySelector('.article-num').textContent = 'No. ' + article.num;
    node.querySelector('h3').textContent = article.title;
    node.querySelector('p').textContent = article.excerpt;
    const pill = node.querySelector('.pill');
    pill.textContent = isNew ? 'New' : tagLabel[article.tag];
    pill.classList.add(isNew ? 'new' : article.tag);
    node.querySelector('.date').textContent = article.date;
    node.querySelector('.read').textContent = article.read;
    return node;
  }

  function renderArticles(){
    articleList.innerHTML = '';
    const posted = getPosted();
    posted.forEach(a => articleList.appendChild(buildCard(a, true)));
    seedArticles.forEach(a => articleList.appendChild(buildCard(a, false)));
    if (posted.length === 0 && seedArticles.length === 0){
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No articles filed yet — check back soon.';
      articleList.appendChild(empty);
    }
    attachFilter();
  }

  function attachFilter(){
    const cards = articleList.querySelectorAll('.article-card');
    const activeBtn = document.querySelector('.filter-bar .filter-btn.active');
    const filter = activeBtn ? activeBtn.dataset.filter : 'all';
    cards.forEach(card => { card.hidden = !(filter === 'all' || card.dataset.tag === filter); });
  }

  document.querySelectorAll('.filter-bar .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      attachFilter();
    });
  });

  renderArticles();

  // ---- Admin demo (client-side only — see note in the HTML) ----
  const ADMIN_PASSWORD = 'annika-admin'; // demo only, visible in page source on purpose
  const toggleBtn = document.getElementById('admin-toggle');
  const loginPanel = document.getElementById('admin-login');
  const formPanel = document.getElementById('admin-form-panel');
  const passwordInput = document.getElementById('admin-password');
  const submitBtn = document.getElementById('admin-submit');
  const errorMsg = document.getElementById('admin-error');
  const publishBtn = document.getElementById('publish-article');

  toggleBtn.addEventListener('click', () => {
    const isOpen = !loginPanel.hidden || !formPanel.hidden;
    if (isOpen){
      loginPanel.hidden = true;
      formPanel.hidden = true;
    } else if (formPanel.dataset.unlocked === 'true'){
      formPanel.hidden = false;
    } else {
      loginPanel.hidden = false;
    }
  });

  submitBtn.addEventListener('click', () => {
    if (passwordInput.value === ADMIN_PASSWORD){
      loginPanel.hidden = true;
      formPanel.hidden = false;
      formPanel.dataset.unlocked = 'true';
      errorMsg.hidden = true;
      passwordInput.value = '';
    } else {
      errorMsg.hidden = false;
    }
  });

  publishBtn.addEventListener('click', () => {
    const title = document.getElementById('new-title').value.trim();
    const excerpt = document.getElementById('new-excerpt').value.trim();
    const tag = document.getElementById('new-tag').value;
    const date = document.getElementById('new-date').value.trim() || 'Just now';
    const read = document.getElementById('new-read').value.trim() || '\u2014';
    if (!title || !excerpt) return;

    const posted = getPosted();
    posted.unshift({ num: String(posted.length + seedArticles.length + 1).padStart(2,'0'), tag, title, excerpt, date, read });
    savePosted(posted);
    renderArticles();

    document.getElementById('new-title').value = '';
    document.getElementById('new-excerpt').value = '';
    document.getElementById('new-date').value = '';
    document.getElementById('new-read').value = '';
  });
}
