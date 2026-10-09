// Blog (2026-10-09, Graham: a Blog link in the footer → an archive → each post). Two templates
// share this file: the archive (blog/index.html) and the post (blog-post/index.html?post=<slug>).
// Data = RRG_BLOG_POSTS (blog-data.js, the live blog's 105 posts). Spec: spec.md §20.4.

const BLOG_TOPICS = [
  // tile = the lifestyle photo (_shared/category-tiles/) used as a stand-in listing image — only 4
  // live posts have an image of their own. shop = where the post's "Shop" panel goes.
  { label: 'Roof Racks', key: 'roof-racks', tile: 'roof-racks', shop: 'vplp/index.html' },
  { label: 'Bike Racks', key: 'bike-racks', tile: 'bike-racks', shop: 'plp/index.html' },
  { label: 'Platforms', key: 'platforms', tile: 'roof-rack-accessories', shop: 'vplp/index.html' },
  { label: 'Roof Boxes & Cargo Bags', key: 'roof-boxes', tile: 'roof-boxes', shop: 'plp-roof-boxes/index.html' },
  { label: 'Roof Top Tents', key: 'roof-top-tents', tile: 'roof-top-tents', shop: 'plp-roof-top-tents/index.html' },
  { label: 'Awnings', key: 'awnings', tile: 'awnings', shop: 'plp-awnings/index.html' },
  { label: 'Water Sports', key: 'water-sports', tile: 'water-sports', shop: 'plp-water-carriers/index.html' },
  { label: 'Reviews', key: 'reviews', tile: 'roof-rack-accessories' },
  { label: 'Tips & Guides', key: 'tips', tile: 'tie-downs' },
  { label: 'Orders & Delivery', key: 'orders', tile: 'more-accessories' }
];
const blogTopic = label => BLOG_TOPICS.find(t => t.label === label) || BLOG_TOPICS[BLOG_TOPICS.length - 1];
const blogPostHref = p => `${RRG_PROTO}blog-post/index.html?post=${encodeURIComponent(p.slug)}`;
const BLOG_HOME = () => `${RRG_PROTO}blog/index.html`;
const blogTopicHref = t => `${BLOG_HOME()}?topic=${t.key}`;
const blogDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
// Listing image: the post's own, else its first topic's lifestyle photo (a stand-in — every post
// needs a listing image field in production; see the Search Results brief's listing-image rule).
function blogImage(p) {
  if (p.thumb) return { src: p.thumb, standIn: false };
  const t = blogTopic(p.cats.find(c => c !== 'Reviews') || p.cats[0]);
  return { src: `${RRG_PROTO}_shared/category-tiles/${t.tile}.webp`, standIn: true };
}
const blogEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function blogCardHTML(p, opts = {}) {
  const img = blogImage(p);
  const t = blogTopic(p.cats[0]);
  return `<article class="blog-card${opts.featured ? ' blog-card--featured' : ''}">
    <a class="blog-card-media" href="${blogPostHref(p)}" tabindex="-1" aria-hidden="true"><img src="${img.src}" alt="" loading="lazy"${img.standIn ? ' data-stand-in' : ''}></a>
    <div class="blog-card-body">
      <a class="blog-card-topic" href="${blogTopicHref(t)}">${t.label}</a>
      <h${opts.featured ? 2 : 3} class="blog-card-title"><a href="${blogPostHref(p)}">${blogEsc(p.title)}</a></h${opts.featured ? 2 : 3}>
      <p class="blog-card-desc">${blogEsc(p.desc)}</p>
      <p class="blog-meta"><span>${blogDate(p.date)}</span><span>${p.mins} min read</span></p>
    </div>
  </article>`;
}

// ---- Archive -----------------------------------------------------------------------------
const BLOG_PAGE_SIZE = 12;
function initBlogArchive() {
  const params = new URLSearchParams(location.search);
  const state = { topic: params.get('topic') || '', shown: BLOG_PAGE_SIZE };
  const tabsEl = document.getElementById('blogTopics');
  const gridEl = document.getElementById('blogGrid');
  const featuredEl = document.getElementById('blogFeatured');
  const moreBtn = document.getElementById('blogMore');
  const countEl = document.getElementById('blogCount');
  const crumbEl = document.getElementById('blogCrumbs');

  function render() {
    const topic = BLOG_TOPICS.find(t => t.key === state.topic);
    const list = topic ? RRG_BLOG_POSTS.filter(p => p.cats.includes(topic.label)) : RRG_BLOG_POSTS;
    const counts = Object.fromEntries(BLOG_TOPICS.map(t => [t.key, RRG_BLOG_POSTS.filter(p => p.cats.includes(t.label)).length]));
    tabsEl.innerHTML = [{ key: '', label: 'All' }, ...BLOG_TOPICS].map(t => `
      <a class="blog-topic${state.topic === t.key ? ' is-active' : ''}" href="${t.key ? blogTopicHref(t) : BLOG_HOME()}" data-topic="${t.key}"${state.topic === t.key ? ' aria-current="page"' : ''}>${t.label} <span>${t.key ? counts[t.key] : RRG_BLOG_POSTS.length}</span></a>`).join('');
    tabsEl.querySelectorAll('[data-topic]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      state.topic = a.dataset.topic; state.shown = BLOG_PAGE_SIZE;
      const url = new URL(location.href);
      if (state.topic) url.searchParams.set('topic', state.topic); else url.searchParams.delete('topic');
      history.replaceState(null, '', url);
      render();
    }));
    // Newest post leads, only on the unfiltered first view (a topic view is just its list).
    const featured = !topic ? list[0] : null;
    featuredEl.hidden = !featured;
    featuredEl.innerHTML = featured ? blogCardHTML(featured, { featured: true }) : '';
    const rest = featured ? list.slice(1) : list;
    gridEl.innerHTML = rest.slice(0, state.shown).map(p => blogCardHTML(p)).join('');
    const shown = Math.min(state.shown, rest.length) + (featured ? 1 : 0);
    countEl.textContent = `Showing ${shown} of ${list.length} posts`;
    moreBtn.hidden = state.shown >= rest.length;
    document.getElementById('blogHeading').textContent = topic ? topic.label : 'Blog';
    crumbEl.innerHTML = topic
      ? `<a href="../home/index.html">Home</a> &gt; <a href="${BLOG_HOME()}">Blog</a> &gt; <span>${topic.label}</span>`
      : `<a href="../home/index.html">Home</a> &gt; <span>Blog</span>`;
    document.title = `${topic ? topic.label + ' | ' : ''}Blog | Roof Racks Galore`;
  }
  moreBtn.addEventListener('click', () => { state.shown += BLOG_PAGE_SIZE; render(); });
  render();
}

// ---- Post --------------------------------------------------------------------------------
function initBlogPost() {
  const slug = new URLSearchParams(location.search).get('post');
  const post = RRG_BLOG_POSTS.find(p => p.slug === slug) || RRG_BLOG_POSTS.find(p => p.slug === 'how-to-choose-a-roof-rack-platform');
  const topic = blogTopic(post.cats[0]);
  document.title = `${post.title} | Roof Racks Galore`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = post.desc;
  document.getElementById('blogCrumbs').innerHTML =
    `<a href="../home/index.html">Home</a> &gt; <a href="${BLOG_HOME()}">Blog</a> &gt; <a href="${blogTopicHref(topic)}">${topic.label}</a> &gt; <span>${blogEsc(post.title)}</span>`;
  document.getElementById('postTopics').innerHTML = post.cats.map(c => `<a class="blog-card-topic" href="${blogTopicHref(blogTopic(c))}">${c}</a>`).join('');
  document.getElementById('postTitle').textContent = post.title;
  document.getElementById('postMeta').innerHTML = `<span>${blogDate(post.date)}</span><span>Roof Racks Galore Team</span><span>${post.mins} min read</span>`;
  const hero = document.getElementById('postHero');
  if (post.image) { hero.hidden = false; hero.innerHTML = `<img src="${post.image}" alt="">`; }

  const body = document.getElementById('postBody');
  body.innerHTML = post.body;
  body.querySelectorAll('a[href^="http"]').forEach(a => { if (!a.href.startsWith(location.origin)) { a.target = '_blank'; a.rel = 'noopener'; } });
  body.querySelectorAll('table').forEach(t => { const w = document.createElement('div'); w.className = 'blog-table-scroll'; t.before(w); w.append(t); });
  body.querySelectorAll('iframe').forEach(f => { const w = document.createElement('div'); w.className = 'blog-video'; f.before(w); w.append(f); });
  body.querySelectorAll('img').forEach(i => { i.loading = 'lazy'; });

  // On this page: the post's H2s, only when there are enough to need one (long guides).
  const h2s = [...body.querySelectorAll('h2')];
  const toc = document.getElementById('postToc');
  if (h2s.length >= 3) {
    h2s.forEach((h, i) => { h.id = h.id || `section-${i + 1}`; });
    toc.hidden = false;
    toc.querySelector('ol').innerHTML = h2s.map(h => `<li><a href="#${h.id}">${blogEsc(h.textContent)}</a></li>`).join('');
  }

  // Shop panel: the post's first topic with a listing page, else Fit My Vehicle.
  const shopTopic = post.cats.map(blogTopic).find(t => t.shop);
  document.getElementById('postShop').innerHTML = shopTopic
    ? `<p class="blog-side-eyebrow">Shop the range</p><img src="${RRG_PROTO}_shared/category-tiles/${shopTopic.tile}.webp" alt=""><h3>${shopTopic.label}</h3><a class="btn btn-primary btn-block" href="${RRG_PROTO}${shopTopic.shop}">Shop ${shopTopic.label}</a>`
    : `<p class="blog-side-eyebrow">Find what fits</p><h3>Roof racks and accessories for your vehicle</h3><a class="btn btn-primary btn-block" href="${RRG_PROTO}fit-my-vehicle/index.html">Fit My Vehicle</a>`;

  // Related: same first topic, newest first, then fill from the rest.
  const related = [...RRG_BLOG_POSTS.filter(p => p !== post && p.cats.includes(post.cats[0])), ...RRG_BLOG_POSTS.filter(p => p !== post && !p.cats.includes(post.cats[0]))].slice(0, 3);
  document.getElementById('postRelated').innerHTML = related.map(p => blogCardHTML(p)).join('');
  document.getElementById('postRelatedMore').href = blogTopicHref(topic);
  document.getElementById('postRelatedMore').textContent = `More ${topic.label} posts ›`;

  document.getElementById('postLd').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BlogPosting', headline: post.title, datePublished: post.date, description: post.desc,
        author: { '@type': 'Organization', name: 'Roof Racks Galore' }, image: post.image || undefined,
        mainEntityOfPage: `${RRG_LIVE_URL}/blog/post/${post.slug}.html` },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: RRG_LIVE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: RRG_LIVE_URL + '/blog.html' },
        { '@type': 'ListItem', position: 3, name: post.title } ] }
    ]
  });
}
