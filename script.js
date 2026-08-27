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
// ARTICLES PAGE — rendering, filtering, and the admin demo.
// Everything below is guarded on #article-list existing, so
// this file stays safe to include on every page.
// =========================================================
const articleList = document.getElementById('article-list');
if (articleList){

  const seedArticles = [
    { num:"06", tag:"both", title:"The Ethics of AI-Generated Homework", excerpt:"A debate-club presentation turned blog post: where the line actually sits between \u201cusing a tool\u201d and \u201coutsourcing the thinking.\u201d", date:"Aug 2026", read:"6 min read" },
    { num:"05", tag:"code", title:"Scratch to Swift: My Coding Journey So Far", excerpt:"From dragging blocks together in Grade 5 to shipping a real iOS app \u2014 a timeline of every language and dead end along the way.", date:"Jul 2026", read:"7 min read" },
    { num:"04", tag:"case", title:"Model UN Taught Me to Argue Like a Compiler", excerpt:"Every resolution has to compile \u2014 no undefined terms, no unresolved references. Committee sessions turned out to be the best syntax-checking practice I've had.", date:"Jun 2026", read:"4 min read" },
    { num:"03", tag:"both", title:"What Mock Trial Taught Me About Writing Clean Code", excerpt:"A closing argument and a function have more in common than you'd think \u2014 both fall apart the moment you can't explain, line by line, why each part is there.", date:"May 2026", read:"5 min read" },
    { num:"02", tag:"code", title:"Debugging My First Swift App: 5 Mistakes I Made", excerpt:"Byte Sized almost didn't ship \u2014 a running log of every dumb bug I hit going from Python's forgiving syntax to Swift's very insistent type system.", date:"Apr 2026", read:"6 min read" },
    { num:"01", tag:"case", title:"Why I Started Reading Copyright Law After CS50x", excerpt:"Finishing a problem set on a machine-learning library sent me down a rabbit hole of who actually owns AI-generated code \u2014 and I haven't come back up since.", date:"Mar 2026", read:"4 min read" },
  ];

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
    attachFilter();
  }

  function attachFilter(){
    const cards = articleList.querySelectorAll('.article-card');
    const activeBtn = document.querySelector('.filter-btn.active');
    const filter = activeBtn ? activeBtn.dataset.filter : 'all';
    cards.forEach(card => { card.hidden = !(filter === 'all' || card.dataset.tag === filter); });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
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
