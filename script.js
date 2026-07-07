// ===== Internationalization =====
var translations = {
  ar: {
    name: 'B5t alanzi',
    bio: 'مطور برمجيات وذكاء اصطناعي — بايثون • C++ • Flutter — أعمل حاليًا على مشروع مسك AI ولدي مشاريع مفتوحة المصدر على GitHub',
    github_title: 'قيت هوب',
    twitter_title: 'تويتر / إكس',
    novadl_tagline: '1,000+ موقع · CLI · تحميل فيديو وصوت',
    novadl_desc: 'محرك تحميل متكامل بواجهة أوامر يدعم YouTube وTikTok وInstagram وFacebook وX وVimeo وReddit وTwitch وSoundCloud وأكثر من 1,000 موقع. يستخرج الفيديو والصوت بجودة عالية مع تشغيل متعدد المنصات.',
    focus_title: 'مجالات التركيز',
    projects_title: 'المشاريع',
    loading: 'جلب المشاريع من GitHub…',
    no_projects: 'لا توجد مشاريع عامة بعد.',
    mask_ai_title: 'مسك AI',
    mask_ai_desc: 'الذكاء الاصطناعي — أعمل حاليًا على مشروع مسك AI.',
    opensource_desc: 'مشاريع مفتوحة المصدر متاحة على GitHub.',
    software_title: 'تطوير البرمجيات',
    software_desc: 'Python · C++ · Flutter — حلول عملية وأدوات تخدم المستخدم.',
    support_title: 'دعم مادي',
    support_sub: 'creators.sa',
    footer: '© 2026 B5T ALANZI'
  },
  en: {
    name: 'B5t alanzi',
    bio: 'Software & AI Developer — Python • C++ • Flutter — Currently working on Misk AI project with open source contributions on GitHub',
    github_title: 'GitHub',
    twitter_title: 'X / Twitter',
    novadl_tagline: '1,000+ sites · CLI · Video & Audio Downloader',
    novadl_desc: 'A powerful CLI download engine supporting YouTube, TikTok, Instagram, Facebook, X, Vimeo, Reddit, Twitch, SoundCloud, and 1,000+ sites. Extracts high-quality video and audio with cross-platform support.',
    focus_title: 'Focus Areas',
    projects_title: 'Projects',
    loading: 'Fetching projects from GitHub…',
    no_projects: 'No public repositories yet.',
    mask_ai_title: 'Misk AI',
    mask_ai_desc: 'Artificial Intelligence — currently working on Misk AI project.',
    opensource_desc: 'Open source projects available on GitHub.',
    software_title: 'Software Development',
    software_desc: 'Python · C++ · Flutter — practical tools built for real-world use.',
    support_title: 'Support Me',
    support_sub: 'creators.sa',
    footer: '© 2026 B5T ALANZI'
  }
};

var currentLang = 'ar';

var langToggle = document.getElementById('langToggle');
var langLabel = document.getElementById('langLabel');

function applyLang(lang) {
  currentLang = lang;
  var dict = translations[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  langLabel.textContent = lang === 'ar' ? 'EN' : 'AR';
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
}

  langToggle.addEventListener('click', function () {
    applyLang(currentLang === 'ar' ? 'en' : 'ar');
    // Re-render repos with new language
    if (typeof renderRepos === 'function') renderRepos(currentLang);
  });

applyLang('ar');

// ===== Auto-sync Avatar & Favicon from X/Twitter =====
(function syncTwitterAvatar() {
  var img = document.getElementById('profileImg');
  if (!img) return;

  var handle = img.getAttribute('data-tw');
  if (!handle) return;

  var GITHUB_FALLBACK = 'https://avatars.githubusercontent.com/u/250705836?v=4';
  var TWIMG_CACHE_KEY = 'x_avatar_' + handle;
  var CACHE_AGE = 3600000; // 1 hour
  var favicon = document.getElementById('favicon');
  var ogImage = document.querySelector('meta[property="og:image"]');

  function setImg(src) {
    img.src = src;
    if (favicon) favicon.href = src;
    if (ogImage) ogImage.content = src;
    localStorage.setItem(TWIMG_CACHE_KEY, src);
    localStorage.setItem(TWIMG_CACHE_KEY + '_ts', Date.now());
  }

  var cachedUrl = localStorage.getItem(TWIMG_CACHE_KEY);
  var cachedTs = localStorage.getItem(TWIMG_CACHE_KEY + '_ts');
  var cacheValid = cachedTs && (Date.now() - Number(cachedTs) < CACHE_AGE);

  if (cachedUrl && cacheValid) {
    img.src = cachedUrl;
    if (favicon) favicon.href = cachedUrl;
    if (ogImage) ogImage.content = cachedUrl;
  } else if (cachedUrl) {
    img.src = cachedUrl;
  }

  // --- Primary: Twitter Syndication API (no token needed) ---
  function trySyndication() {
    fetch('https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=' + handle)
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (data) {
        if (data && data[0] && data[0].profile_image_url) {
          setImg(data[0].profile_image_url.replace(/_normal\./, '_400x400.'));
        } else { tryUnavatar(); }
      })
      .catch(tryUnavatar);
  }

  // --- Fallback: unavatar.io ---
  function tryUnavatar() {
    var u = 'https://unavatar.io/twitter/' + handle + '?t=' + Date.now();
    var probe = new Image();
    probe.onload = function () { setImg(u); };
    probe.onerror = function () { if (img.src.indexOf('githubusercontent') === -1) setImg(GITHUB_FALLBACK); };
    probe.src = u;
  }

  img.addEventListener('error', function () {
    if (img.src.indexOf('githubusercontent') === -1) setImg(GITHUB_FALLBACK);
  });

  setTimeout(trySyndication, 100);
  setInterval(trySyndication, 300000);
})();

// ===== GitHub Repos Loader (cached, language-aware) =====
var reposCache = null;
var GITHUB_USER = 'B5d2z';

var langColors = {
  'Python': '#3fb3ff',
  'C++': '#9b4dff',
  'C': '#a0a0a0',
  'Dart': '#00d4ff',
  'JavaScript': '#f7df1e',
  'TypeScript': '#3178c6',
  'Rust': '#ff7043',
  'Go': '#00add4',
  'Java': '#e76f00',
  'HTML': '#e34f26',
  'Shell': '#89e051',
  'Batchfile': '#c1c1c1'
};

var proDescriptions = {
  'NovaDL': {
    ar: 'أداة تحميل مقاطع من YouTube، TikTok، Instagram، Facebook، X (Twitter)، Vimeo، Reddit، Twitch، SoundCloud وأكثر من 1,000 منصة. تدعم صيغ متعددة (MP3، M4A، Opus، FLAC، WAV)، اختيار الجودة، قوائم تشغيل، ترجمة، استكمال التحميل، بروكسي، وواجهة تفاعلية. مفتوحة المصدر (MIT).',
    en: 'A download tool for YouTube, TikTok, Instagram, Facebook, X (Twitter), Vimeo, Reddit, Twitch, SoundCloud and 1,000+ platforms. Supports multiple formats (MP3, M4A, Opus, FLAC, WAV), quality selection, playlists, subtitles, resume downloads, proxy, and interactive UI. Open source (MIT).'
  }
};

function esc(str) {
  var d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function renderRepos(lang) {
  var container = document.getElementById('projectsList');
  if (!container) return;

  if (!reposCache || reposCache.length === 0) {
    container.innerHTML = '<div class="empty-card">' + (lang === 'ar' ? 'لا توجد مشاريع عامة بعد.' : 'No public repositories yet.') + '</div>';
    return;
  }

  container.innerHTML = '';

  reposCache.forEach(function (repo, i) {
    var color = langColors[repo.language] || '#c8a96e';
    var desc = repo.description || '';

    var pd = proDescriptions[repo.name];
    if (pd) desc = pd[lang === 'ar' ? 'ar' : 'en'] || pd.en;

    if (!desc) desc = lang === 'ar' ? 'مشروع مفتوح المصدر.' : 'Open source project.';

    var stars = repo.stargazers_count || 0;

    var card = document.createElement('a');
    card.className = 'link-card project-card';
    card.href = repo.html_url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.style.animationDelay = (0.35 + i * 0.07) + 's';

    var langHtml = '';
    if (repo.language) {
      langHtml = '<span class="project-stars" style="margin-top:6px"><span style="background:' + color + ';width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0;vertical-align:middle"></span> ' + esc(repo.language) + (stars > 0 ? ' · ★ ' + stars : '') + '</span>';
    } else if (stars > 0) {
      langHtml = '<span class="project-stars" style="margin-top:6px">★ ' + stars + '</span>';
    }

    card.innerHTML =
      '<div class="link-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>' +
      '<div class="link-card-content">' +
        '<span class="link-card-title">' + esc(repo.name) + '</span>' +
        '<span class="link-card-subtitle">' + esc(desc) + '</span>' +
        langHtml +
      '</div>' +
      '<svg class="link-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

    container.appendChild(card);
  });
}

// Initial fetch
(function loadRepos() {
  var container = document.getElementById('projectsList');
  if (!container) return;

  fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&direction=desc&per_page=100')
    .then(function (res) {
      if (!res.ok) throw new Error('GitHub API error: ' + res.status);
      return res.json();
    })
    .then(function (repos) {
      if (!repos || repos.length === 0) {
        container.innerHTML = '<div class="empty-card">' + (currentLang === 'ar' ? 'لا توجد مشاريع عامة بعد.' : 'No public repositories yet.') + '</div>';
        return;
      }

      reposCache = repos.filter(function (r) { return !r.fork && r.name !== 'B5d2z.github.io'; })
        .sort(function (a, b) {
          var s = (b.stargazers_count || 0) - (a.stargazers_count || 0);
          return s !== 0 ? s : new Date(b.updated_at) - new Date(a.updated_at);
        });

      renderRepos(currentLang);
    })
    .catch(function (err) {
      console.error('GitHub repos failed:', err);
      container.innerHTML = '<div class="empty-card">' + (currentLang === 'ar' ? 'تعذّر جلب المشاريع حاليًا.' : 'Could not load projects right now.') + '</div>';
    });
})();
