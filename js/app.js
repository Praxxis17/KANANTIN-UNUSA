// Logika Utama Aplikasi KANANTIN UNUSA
let DB = loadDB();

const STATE = {
  view: 'landing', // landing | login | register | tenant | menu | review-form | survey-form | admin | seller
  currentUser: null,
  selectedCampus: 'Kampus A',
  searchQuery: '',
  selectedCategory: 'Semua',
  selectedTenantId: 't-a1',
  selectedMenuId: 'm-001',
  reviewStarFilter: 0,
  loginRole: 'pembeli',
  adminTab: 'tenants', // tenants | menus | verify | monev
  adminCampusFilter: 'Kampus A',
  adminSelectedTenantId: 't-a1',
  editingMenuId: null,
  sellerTab: 'menus', // menus | add | reviews
  pendingRedirect: null
};

// ===== HELPERS =====
function formatRp(num) {
  return 'Rp' + Number(num || 0).toLocaleString('id-ID');
}

function getInitials(name) {
  return (name || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function showToast(msg) {
  const wrap = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

function getTenantReviews(tenantId) {
  return DB.reviews.filter(r => r.tenantId === tenantId);
}

function getMenuReviews(menuId) {
  return DB.reviews.filter(r => r.menuId === menuId);
}

function getTenantRating(tenantId) {
  const revs = getTenantReviews(tenantId);
  if (!revs.length) return { avg: 4.7, count: 0 };
  const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
  return { avg: Number(avg.toFixed(1)), count: revs.length };
}

function getMenuRating(menuId) {
  const revs = getMenuReviews(menuId);
  if (!revs.length) return { avg: 4.8, count: 0 };
  const avg = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
  return { avg: Number(avg.toFixed(1)), count: revs.length };
}

function getTenantMenus(tenantId, onlyVerified = true) {
  return DB.menus.filter(m => m.tenantId === tenantId && (!onlyVerified || m.verified));
}

function navigate(view, params = {}) {
  Object.assign(STATE, params);
  STATE.view = view;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function requireBuyerLogin(targetView, params = {}) {
  if (STATE.currentUser && STATE.currentUser.role === 'pembeli') {
    navigate(targetView, params);
    return;
  }
  STATE.pendingRedirect = { view: targetView, params };
  STATE.loginRole = 'pembeli';
  showToast('Silakan masuk sebagai Pembeli untuk melanjutkan.');
  navigate('login');
}

function logout() {
  STATE.currentUser = null;
  STATE.pendingRedirect = null;
  showToast('Anda telah keluar dari akun.');
  navigate('landing');
}

// ===== SHARED NAVBAR & FOOTER =====
function renderNavbar() {
  const u = STATE.currentUser;
  return `
    <header class="navbar">
      <div class="container navbar-inner">
        <div class="brand" onclick="navigate('landing')">
          <div class="brand-logo">KU</div>
          <div class="brand-text">
            <strong>KANANTIN UNUSA</strong>
            <span>Katalog Tenant Kantin UNUSA</span>
          </div>
        </div>
        <nav class="nav-links">
          <span class="nav-link ${STATE.view === 'landing' ? 'active' : ''}" onclick="navigate('landing')">Beranda</span>
          <span class="nav-link" onclick="navigate('landing'); setTimeout(() => document.getElementById('denah-section')?.scrollIntoView({behavior:'smooth'}), 60)">Denah & Tenant</span>
          <span class="nav-link" onclick="navigate('landing'); setTimeout(() => document.getElementById('faq-section')?.scrollIntoView({behavior:'smooth'}), 60)">Tentang Katalog</span>
          ${u && u.role === 'admin' ? `<span class="nav-link" onclick="navigate('admin')">Dashboard Admin</span>` : ''}
          ${u && u.role === 'penjual' ? `<span class="nav-link" onclick="navigate('seller')">Dashboard Penjual</span>` : ''}
        </nav>
        <div class="nav-actions">
          ${u ? `
            <div class="user-pill">
              <div class="avatar">${getInitials(u.fullName)}</div>
              <div style="font-size:12px; line-height:1.2;">
                <strong style="display:block; color:var(--green-900);">${u.fullName}</strong>
                <span style="color:var(--text-muted); text-transform:capitalize;">${u.role}</span>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="logout()">Keluar</button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="navigate('register')">Daftar Akun</button>
            <button class="btn btn-primary btn-sm" onclick="navigate('login')">Masuk &rarr;</button>
          `}
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h3 style="color:var(--white); margin-bottom:8px;">KANANTIN UNUSA</h3>
            <p style="font-size:14px; color:#a7f3d0; max-width:360px;">
              Sistem Katalog Tenant Kantin Universitas Nahdlatul Ulama Surabaya. Temukan tenant, lihat menu, isi survei kepuasan, dan bagikan ulasan jujur.
            </p>
          </div>
          <div>
            <strong style="color:var(--yellow-400); font-size:13px;">JELAJAHI KAMPUS</strong>
            <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px; font-size:14px;">
              <a style="cursor:pointer" onclick="STATE.selectedCampus='Kampus A'; navigate('landing')">Kampus A (9 Tenant)</a>
              <a style="cursor:pointer" onclick="STATE.selectedCampus='Kampus B'; navigate('landing')">Kampus B (5 Tenant)</a>
              <a style="cursor:pointer" onclick="STATE.selectedCampus='Kampus C'; navigate('landing')">Kampus C (3 Tenant)</a>
            </div>
          </div>
          <div>
            <strong style="color:var(--yellow-400); font-size:13px;">AKSES PENGGUNA</strong>
            <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px; font-size:14px;">
              <a style="cursor:pointer" onclick="STATE.loginRole='pembeli'; navigate('login')">Pembeli (Mahasiswa/Dosen/Karyawan)</a>
              <a style="cursor:pointer" onclick="STATE.loginRole='penjual'; navigate('login')">Penjual Kantin</a>
              <a style="cursor:pointer" onclick="STATE.loginRole='admin'; navigate('login')">Admin Kantin</a>
            </div>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:20px; font-size:12px; color:#a7f3d0;">
          <span>&copy; 2026 KANANTIN UNUSA — Katalog Tenant Kantin UNUSA</span>
          <span>Versi Demo Interaktif Desktop</span>
        </div>
      </div>
    </footer>
  `;
}

// ===== VIEW 1: LANDING PAGE & BUYER DASHBOARD =====
function renderLanding() {
  const isBuyer = STATE.currentUser && STATE.currentUser.role === 'pembeli';
  const campusCounts = {
    'Kampus A': DB.tenants.filter(t => t.campus === 'Kampus A').length,
    'Kampus B': DB.tenants.filter(t => t.campus === 'Kampus B').length,
    'Kampus C': DB.tenants.filter(t => t.campus === 'Kampus C').length
  };

  const campusTenants = DB.tenants.filter(t => t.campus === STATE.selectedCampus);
  const categories = ['Semua', ...new Set(campusTenants.map(t => t.category))];

  const filteredTenants = campusTenants.filter(t => {
    const q = STATE.searchQuery.toLowerCase();
    const matchText = t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchCat = STATE.selectedCategory === 'Semua' || t.category === STATE.selectedCategory;
    return matchText && matchCat;
  });

  // Denah split row
  const mid = Math.ceil(campusTenants.length / 2);
  const topStalls = campusTenants.slice(0, mid);
  const bottomStalls = campusTenants.slice(mid);

  const totalMenus = DB.menus.filter(m => m.verified).length;
  const totalReviews = DB.reviews.length;

  return `
    ${renderNavbar()}

    ${isBuyer ? `
      <section class="buyer-banner">
        <div class="container buyer-banner-inner">
          <div>
            <span class="badge badge-yellow" style="margin-bottom:10px;">DASHBOARD PEMBELI • SIAP MENULIS ULASAN & SURVEI</span>
            <h1>Halo ${STATE.currentUser.fullName}</h1>
            <p>Mau jelajahi rasa apa hari ini? Pilih stan di denah kantin untuk melihat menu, mengisi survei kepuasan, atau menulis ulasan.</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px; color:#d1fae5;">Akun Aktif</div>
            <strong style="font-size:16px;">@${STATE.currentUser.username}</strong>
          </div>
        </div>
      </section>
    ` : `
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <span class="hero-eyebrow">★ SISTEM KATALOG TENANT KANTIN UNUSA</span>
            <h1>Kenali tenantnya.<br><span>Temukan menu favoritmu.</span></h1>
            <p>Jelajahi cita rasa kantin Kampus A, B, dan C UNUSA dalam satu tempat. Lihat denah lokasi stan, daftar menu lengkap, survei kepuasan, dan ulasan jujur dari sivitas.</p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" onclick="document.getElementById('denah-section').scrollIntoView({behavior:'smooth'})">Jelajahi Denah Tenant &darr;</button>
              <button class="btn btn-yellow btn-lg" onclick="navigate('login')">Masuk &amp; Beri Ulasan</button>
            </div>
            <div class="stats-strip">
              <div class="stat-mini"><strong>3</strong><span>Kampus UNUSA</span></div>
              <div class="stat-mini"><strong>${DB.tenants.length}</strong><span>Tenant Aktif</span></div>
              <div class="stat-mini"><strong>${totalMenus}</strong><span>Menu Terverifikasi</span></div>
              <div class="stat-mini"><strong>${totalReviews}</strong><span>Ulasan Sivitas</span></div>
            </div>
          </div>

          <div class="hero-showcase">
            <span class="showcase-tag">★ Pilihan Komunitas Kampus A</span>
            <div class="showcase-visual">
              <div class="big-emoji">🍛🍗🧋</div>
              <div style="font-size:14px; color:#ecfdf5; max-width:300px;">
                Denah interaktif, harga transparan, rating ala Google Maps &amp; ulasan detail ala Shopee.
              </div>
            </div>
            <div class="showcase-card">
              <div>
                <small>FAVORIT DI KAMPUS A • STAN A-01</small>
                <h3>Warung Bu Siti</h3>
                <div style="font-size:13px; color:var(--text-muted);">
                  <span class="rating-star">★ ${getTenantRating('t-a1').avg}</span> &bull; Mulai Rp4.000
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="navigate('tenant', { selectedTenantId: 't-a1' })">Lihat Menu &rarr;</button>
            </div>
          </div>
        </div>
      </section>
    `}

    <!-- DENAH TATA LETAK TENANT -->
    <section class="section" id="denah-section">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>Denah Tata Letak Tenant Kantin</h2>
            <p>Pilih kampus di bawah ini, lalu klik langsung kotak stan pada denah untuk melihat menu dan survei kepuasan.</p>
          </div>
          <span class="badge badge-green">Klik stan pada denah untuk masuk</span>
        </div>

        <div class="campus-tabs">
          ${['Kampus A', 'Kampus B', 'Kampus C'].map((c, idx) => `
            <div class="campus-tab ${STATE.selectedCampus === c ? 'active' : ''}" onclick="STATE.selectedCampus='${c}'; STATE.selectedCategory='Semua'; render();">
              <div>
                <strong style="font-size:17px; display:block;">${c}</strong>
                <span class="campus-sub" style="font-size:13px;">${campusCounts[c]} Tenant Kantin</span>
              </div>
              <div class="campus-badge-letter">${['A','B','C'][idx]}</div>
            </div>
          `).join('')}
        </div>

        <div class="floorplan-box">
          <div class="floorplan-header">
            <div>
              <strong style="font-size:16px; color:var(--green-900);">Denah Interaktif — ${STATE.selectedCampus} (${campusTenants.length} Stan)</strong>
              <div style="font-size:12px; color:var(--text-muted);">Pintu Masuk Utama Area Kantin &bull; Klik salah satu stan untuk membuka menu</div>
            </div>
            <div class="floorplan-legend">
              <span><span class="legend-dot" style="background:var(--green-800);"></span>Stan Aktif</span>
              <span><span class="legend-dot" style="background:var(--yellow-400);"></span>Area Meja &amp; Koridor</span>
            </div>
          </div>

          <div class="floorplan-map">
            <div class="stall-row" style="grid-template-columns: repeat(${topStalls.length}, minmax(130px, 1fr));">
              ${topStalls.map(t => {
                const rt = getTenantRating(t.id);
                return `
                  <div class="stall-tile" onclick="navigate('tenant', { selectedTenantId: '${t.id}' })">
                    <span class="stall-code">${t.code}</span>
                    <div class="stall-name">${t.name}</div>
                    <div style="font-size:11px; color:var(--text-light);">${t.category}</div>
                    <div class="stall-meta">
                      <span class="rating-star">★ ${rt.avg}</span>
                      <span>${getTenantMenus(t.id).length} menu</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="floorplan-corridor">🍽️ AREA MEJA MAKAN &amp; KORIDOR PENGUNJUNG ${STATE.selectedCampus.toUpperCase()} 🍽️</div>

            ${bottomStalls.length ? `
              <div class="stall-row" style="grid-template-columns: repeat(${bottomStalls.length}, minmax(130px, 1fr));">
                ${bottomStalls.map(t => {
                  const rt = getTenantRating(t.id);
                  return `
                    <div class="stall-tile" onclick="navigate('tenant', { selectedTenantId: '${t.id}' })">
                      <span class="stall-code">${t.code}</span>
                      <div class="stall-name">${t.name}</div>
                      <div style="font-size:11px; color:var(--text-light);">${t.category}</div>
                      <div class="stall-meta">
                        <span class="rating-star">★ ${rt.avg}</span>
                        <span>${getTenantMenus(t.id).length} menu</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- FILTER & DAFTAR TENANT -->
        <div class="filter-bar">
          <input class="input search-input" placeholder="Cari nama tenant, kode stan (A-01), atau kategori..." value="${STATE.searchQuery}" oninput="STATE.searchQuery=this.value; render();" />
          <select class="select" onchange="STATE.selectedCategory=this.value; render();">
            ${categories.map(cat => `<option value="${cat}" ${STATE.selectedCategory === cat ? 'selected' : ''}>Kategori: ${cat}</option>`).join('')}
          </select>
        </div>

        <div class="tenant-grid">
          ${filteredTenants.map(t => {
            const rt = getTenantRating(t.id);
            const mCount = getTenantMenus(t.id).length;
            return `
              <div class="card tenant-card">
                <div class="tenant-card-top">
                  <span class="badge badge-green">${t.campus} &bull; ${t.code}</span>
                  <span class="badge badge-yellow">${t.status}</span>
                </div>
                <h3>${t.name}</h3>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">${t.category} &bull; Pengelola: ${t.owner}</div>
                <p style="font-size:13px; color:var(--text-light); min-height:40px;">${t.desc}</p>
                <div class="tenant-card-footer">
                  <div style="font-size:13px;">
                    <span class="rating-star">★ ${rt.avg}</span>
                    <span style="color:var(--text-muted);">(${rt.count} ulasan) &bull; ${mCount} menu</span>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="navigate('tenant', { selectedTenantId: '${t.id}' })">Lihat Tenant &rarr;</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- FAQ SECTION -->
    <section class="section" id="faq-section" style="background:var(--white); border-top:1px solid var(--border);">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>Yang Sering Ditanyakan</h2>
            <p>Kenali cara mengakses katalog tenant dan berkontribusi dalam evaluasi kantin UNUSA.</p>
          </div>
        </div>
        <div class="faq-grid">
          <div class="card">
            <h4 style="color:var(--green-900); margin-bottom:8px;">Apakah perlu masuk untuk melihat menu?</h4>
            <p style="font-size:14px; color:var(--text-muted);">Tidak perlu. Pengunjung dapat langsung menjelajahi denah tenant, melihat daftar menu, harga, dan membaca ulasan secara publik.</p>
          </div>
          <div class="card">
            <h4 style="color:var(--green-900); margin-bottom:8px;">Siapa yang dapat menulis ulasan &amp; survei?</h4>
            <p style="font-size:14px; color:var(--text-muted);">Pembeli (Mahasiswa, Karyawan, dan Dosen) yang telah mendaftar dan login menggunakan username serta password akun.</p>
          </div>
          <div class="card">
            <h4 style="color:var(--green-900); margin-bottom:8px;">Apakah bisa memesan makanan lewat katalog?</h4>
            <p style="font-size:14px; color:var(--text-muted);">Sistem ini berfokus pada informasi denah tenant, katalog menu, survei kepuasan, rating, dan ulasan tanpa fitur transaksi pembayaran.</p>
          </div>
        </div>
      </div>
    </section>

    ${renderFooter()}
  `;
}

// ===== VIEW 2: DETAIL TENANT =====
function renderTenantDetail() {
  const tenant = DB.tenants.find(t => t.id === STATE.selectedTenantId) || DB.tenants[0];
  const menus = getTenantMenus(tenant.id, true);
  const rt = getTenantRating(tenant.id);
  const surveys = DB.surveys.filter(s => s.tenantId === tenant.id);

  const filterCat = STATE.menuCatFilter || 'Semua';
  const shownMenus = filterCat === 'Semua' ? menus : menus.filter(m => m.category === filterCat);

  return `
    ${renderNavbar()}
    <div class="container section">
      <div class="breadcrumb">
        <a onclick="navigate('landing')">Beranda</a> /
        <span>${tenant.campus}</span> /
        <strong>${tenant.name}</strong>
      </div>

      <div class="tenant-hero">
        <div>
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            <span class="badge badge-green">${tenant.status}</span>
            <span class="badge badge-yellow">${tenant.category}</span>
            <span class="badge badge-gray">Stan ${tenant.code}</span>
          </div>
          <h1 style="font-size:32px; color:var(--green-900); margin-bottom:8px;">${tenant.name}</h1>
          <p style="color:var(--text-muted); margin-bottom:16px;">${tenant.desc}</p>
          <div style="display:flex; flex-wrap:wrap; gap:18px; font-size:13px; color:var(--text-muted);">
            <span>📍 ${tenant.campus} • Stan ${tenant.code}</span>
            <span>🕒 ${tenant.hours}</span>
            <span>👤 Pengelola: <strong>${tenant.owner}</strong></span>
          </div>
        </div>

        <div style="background:var(--green-50); border:1px solid var(--green-100); border-radius:16px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:12px; font-weight:700; color:var(--green-800);">PENILAIAN &amp; SURVEI TENANT</div>
            <div style="display:flex; align-items:baseline; gap:10px; margin:8px 0;">
              <span style="font-size:36px; font-weight:800; color:var(--green-900);">${rt.avg}</span>
              <span class="rating-star" style="font-size:18px;">★★★★★</span>
              <span style="font-size:13px; color:var(--text-muted);">(${rt.count} ulasan • ${surveys.length} survei)</span>
            </div>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">Bantu tingkatkan kualitas penyajian, kebersihan, dan layanan tenant ini melalui survei kepuasan.</p>
          </div>
          <button class="btn btn-yellow" onclick="requireBuyerLogin('survey-form', { selectedTenantId: '${tenant.id}' })">
            📋 Isi Survei Kepuasan Tenant
          </button>
        </div>
      </div>

      <div class="section-head">
        <div>
          <h2>Daftar Menu ${tenant.name}</h2>
          <p>Klik salah satu menu untuk melihat detail, rating bergaya Google Maps, dan ulasan terstruktur.</p>
        </div>
        <div class="chip-group">
          ${['Semua', 'Makanan', 'Minuman', 'Jajan'].map(c => `
            <button class="chip ${filterCat === c ? 'active' : ''}" onclick="STATE.menuCatFilter='${c}'; render();">${c}</button>
          `).join('')}
        </div>
      </div>

      <div class="menu-grid">
        ${shownMenus.length ? shownMenus.map(m => {
          const mr = getMenuRating(m.id);
          return `
            <div class="menu-card" onclick="navigate('menu', { selectedMenuId: '${m.id}', selectedTenantId: '${tenant.id}', reviewStarFilter: 0 })">
              <div>
                <div class="menu-thumb">${m.emoji || '🍽️'}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span class="badge badge-green">${m.category}</span>
                  <span style="font-size:13px;"><span class="rating-star">★ ${mr.avg}</span> (${mr.count})</span>
                </div>
                <h3 style="font-size:17px; color:var(--green-900); margin-bottom:4px;">${m.name}</h3>
                <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">${m.desc}</p>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid var(--border);">
                <span class="price">${formatRp(m.price)}</span>
                <span style="font-size:13px; font-weight:700; color:var(--green-700);">Lihat Ulasan &rarr;</span>
              </div>
            </div>
          `;
        }).join('') : `<div class="card" style="grid-column:1/-1; text-align:center; color:var(--text-muted);">Belum ada menu pada kategori ini.</div>`}
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ===== VIEW 3: DETAIL MENU (GOOGLE MAPS + SHOPEE STYLE REVIEWS) =====
function renderMenuDetail() {
  const menu = DB.menus.find(m => m.id === STATE.selectedMenuId) || DB.menus[0];
  const tenant = DB.tenants.find(t => t.id === menu.tenantId) || DB.tenants[0];
  const allReviews = getMenuReviews(menu.id);
  const mr = getMenuRating(menu.id);

  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviews.filter(r => r.rating === star).length
  }));

  const shownReviews = STATE.reviewStarFilter === 0
    ? allReviews
    : allReviews.filter(r => r.rating === STATE.reviewStarFilter);

  return `
    ${renderNavbar()}
    <div class="container section">
      <div class="breadcrumb">
        <a onclick="navigate('landing')">Beranda</a> /
        <a onclick="navigate('tenant', { selectedTenantId: '${tenant.id}' })">${tenant.name}</a> /
        <strong>${menu.name}</strong>
      </div>

      <div class="card" style="display:grid; grid-template-columns: 280px 1fr; gap:28px; margin-bottom:28px; align-items:center;">
        <div class="menu-thumb" style="height:210px; font-size:78px; margin-bottom:0;">${menu.emoji || '🍽️'}</div>
        <div>
          <div style="display:flex; gap:8px; margin-bottom:8px;">
            <span class="badge badge-green">${menu.category}</span>
            <span class="badge badge-yellow">Tersedia</span>
            <span class="badge badge-gray">${tenant.name} • ${tenant.code}</span>
          </div>
          <h1 style="font-size:32px; color:var(--green-900); margin-bottom:6px;">${menu.name}</h1>
          <div class="price" style="font-size:24px; margin-bottom:12px;">${formatRp(menu.price)}</div>
          <p style="color:var(--text-muted); margin-bottom:20px;">${menu.desc}</p>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="requireBuyerLogin('review-form', { selectedMenuId: '${menu.id}', selectedTenantId: '${tenant.id}' })">
              ✍️ Tulis Ulasan Menu Ini
            </button>
            <button class="btn btn-outline" onclick="requireBuyerLogin('survey-form', { selectedTenantId: '${tenant.id}' })">
              📋 Survei Kepuasan Tenant
            </button>
          </div>
        </div>
      </div>

      <!-- GOOGLE MAPS SUMMARY + SHOPEE REVIEWS -->
      <div class="review-layout">
        <div class="gmaps-summary">
          <div style="font-size:12px; font-weight:700; color:var(--green-800); margin-bottom:10px;">RINGKASAN RATING (ALA GOOGLE MAPS)</div>
          <div class="gmaps-score-row">
            <div class="gmaps-big-num">${mr.avg}</div>
            <div>
              <div class="rating-star" style="font-size:20px;">★★★★★</div>
              <div style="font-size:13px; color:var(--text-muted);">${allReviews.length} ulasan publik</div>
            </div>
          </div>

          ${dist.map(d => {
            const pct = allReviews.length ? Math.round((d.count / allReviews.length) * 100) : 0;
            return `
              <div class="bar-row">
                <span style="width:16px; font-weight:700;">${d.star}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                <span style="width:26px; text-align:right; color:var(--text-muted);">${d.count}</span>
              </div>
            `;
          }).join('')}

          <div style="margin-top:18px; padding-top:16px; border-top:1px solid var(--border); font-size:13px; color:var(--text-muted);">
            <strong>Indikator Kualitas:</strong>
            <div style="display:flex; justify-content:space-between; margin-top:8px;"><span>Rasa makanan</span><strong style="color:var(--green-800);">4,8 / 5</strong></div>
            <div style="display:flex; justify-content:space-between; margin-top:4px;"><span>Penyajian makanan</span><strong style="color:var(--green-800);">4,7 / 5</strong></div>
            <div style="display:flex; justify-content:space-between; margin-top:4px;"><span>Kebersihan</span><strong style="color:var(--green-800);">4,9 / 5</strong></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <h3 style="color:var(--green-900);">Ulasan Pembeli (${shownReviews.length})</h3>
            <div class="chip-group">
              <button class="chip ${STATE.reviewStarFilter === 0 ? 'active' : ''}" onclick="STATE.reviewStarFilter=0; render();">Semua</button>
              ${[5,4,3,2,1].map(s => `
                <button class="chip ${STATE.reviewStarFilter === s ? 'active' : ''}" onclick="STATE.reviewStarFilter=${s}; render();">${s} ★</button>
              `).join('')}
            </div>
          </div>

          ${shownReviews.length ? shownReviews.map(r => `
            <div class="shopee-review-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="avatar">${getInitials(r.userName)}</div>
                  <div>
                    <strong style="font-size:14px;">${r.userName}</strong>
                    <div style="font-size:12px; color:var(--text-muted);">Sivitas UNUSA &bull; ${r.date}</div>
                  </div>
                </div>
                <div class="rating-star">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
              </div>

              <!-- DETAIL PRODUK ALA SHOPEE -->
              <div class="shopee-tags">
                <span class="shopee-tag">Rasa makanan: <strong>${r.rasa}</strong></span> &bull;
                <span class="shopee-tag">Penyajian makanan: <strong>${r.penyajian}</strong></span> &bull;
                <span class="shopee-tag">Kebersihan: <strong>${r.kebersihan}</strong></span> &bull;
                <span class="shopee-tag">Porsi: <strong>${r.porsi}</strong></span> &bull;
                <span class="shopee-tag">Harga: <strong>${r.harga}</strong></span>
              </div>

              <p style="font-size:14px; color:var(--text-main);">${r.comment}</p>
            </div>
          `).join('') : `
            <div class="card" style="text-align:center; padding:36px; color:var(--text-muted);">
              Belum ada ulasan untuk filter ini. Jadilah yang pertama mengulas menu ini!
            </div>
          `}
        </div>
      </div>
    </div>
    ${renderFooter()}
  `;
}

// ===== VIEW 4: FORM TULIS ULASAN (PEMBELI) =====
function renderReviewForm() {
  const menu = DB.menus.find(m => m.id === STATE.selectedMenuId) || DB.menus[0];
  const tenant = DB.tenants.find(t => t.id === menu.tenantId) || DB.tenants[0];

  return `
    ${renderNavbar()}
    <div class="container section" style="max-width:820px;">
      <div class="breadcrumb">
        <a onclick="navigate('menu', { selectedMenuId: '${menu.id}' })">&larr; Kembali ke Detail Menu</a>
      </div>

      <div class="card" style="padding:30px;">
        <span class="badge badge-green" style="margin-bottom:10px;">FORMULIR ULASAN MENU</span>
        <h2 style="color:var(--green-900); margin-bottom:4px;">Ceritakan Pengalamanmu</h2>
        <p style="color:var(--text-muted); font-size:14px; margin-bottom:22px;">
          Mengulas: <strong>${menu.name}</strong> — ${tenant.name} (${tenant.campus})
        </p>

        <form id="review-form" onsubmit="submitReview(event)">
          <div class="form-group">
            <label>Rating Keseluruhan *</label>
            <input type="hidden" id="rev-rating" value="5" />
            <div class="star-picker" id="star-picker">
              ${[1,2,3,4,5].map(n => `<span class="lit" onclick="setReviewStar(${n})">★</span>`).join('')}
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div class="form-group">
              <label>Rasa Makanan</label>
              <select class="select" id="rev-rasa">
                <option value="Enak">Enak</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang enak">Kurang enak</option>
              </select>
            </div>
            <div class="form-group">
              <label>Penyajian Makanan</label>
              <select class="select" id="rev-penyajian">
                <option value="Rapi">Rapi</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang rapi">Kurang rapi</option>
              </select>
            </div>
            <div class="form-group">
              <label>Kebersihan Makanan</label>
              <select class="select" id="rev-kebersihan">
                <option value="Bersih">Bersih</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang bersih">Kurang bersih</option>
              </select>
            </div>
            <div class="form-group">
              <label>Porsi Makanan</label>
              <select class="select" id="rev-porsi">
                <option value="Pas">Pas</option>
                <option value="Banyak">Banyak</option>
                <option value="Kurang">Kurang</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Kesesuaian Harga</label>
            <select class="select" id="rev-harga">
              <option value="Sesuai">Sesuai</option>
              <option value="Cukup">Cukup</option>
              <option value="Kurang sesuai">Kurang sesuai</option>
            </select>
          </div>

          <div class="form-group">
            <label>Komentar Ulasan * (Minimal 15 karakter)</label>
            <textarea class="textarea" id="rev-comment" rows="4" required minlength="15" placeholder="Ceritakan rasa, porsi, atau saran untuk menu ini..."></textarea>
          </div>

          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button type="button" class="btn btn-outline" onclick="navigate('menu', { selectedMenuId: '${menu.id}' })">Batal</button>
            <button type="submit" class="btn btn-primary">✔ Kirim Ulasan</button>
          </div>
        </form>
      </div>
    </div>
    ${renderFooter()}
  `;
}

function setReviewStar(val) {
  document.getElementById('rev-rating').value = val;
  const spans = document.querySelectorAll('#star-picker span');
  spans.forEach((el, idx) => el.classList.toggle('lit', idx < val));
}

function submitReview(e) {
  e.preventDefault();
  const menu = DB.menus.find(m => m.id === STATE.selectedMenuId);
  const newRev = {
    id: 'r-' + Date.now(),
    tenantId: menu.tenantId,
    menuId: menu.id,
    userName: STATE.currentUser.fullName,
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    rating: Number(document.getElementById('rev-rating').value),
    rasa: document.getElementById('rev-rasa').value,
    penyajian: document.getElementById('rev-penyajian').value,
    kebersihan: document.getElementById('rev-kebersihan').value,
    porsi: document.getElementById('rev-porsi').value,
    harga: document.getElementById('rev-harga').value,
    comment: document.getElementById('rev-comment').value.trim()
  };
  DB.reviews.unshift(newRev);
  saveDB(DB);
  showToast('Terima kasih! Ulasan menu berhasil dikirim.');
  navigate('menu', { selectedMenuId: menu.id, reviewStarFilter: 0 });
}

// ===== VIEW 5: FORM SURVEI KEPUASAN TENANT (PEMBELI) =====
function renderSurveyForm() {
  const tenant = DB.tenants.find(t => t.id === STATE.selectedTenantId) || DB.tenants[0];
  return `
    ${renderNavbar()}
    <div class="container section" style="max-width:780px;">
      <div class="breadcrumb">
        <a onclick="navigate('tenant', { selectedTenantId: '${tenant.id}' })">&larr; Kembali ke ${tenant.name}</a>
      </div>

      <div class="card" style="padding:30px;">
        <span class="badge badge-yellow" style="margin-bottom:10px;">SURVEI KEPUASAN TENANT KANTIN</span>
        <h2 style="color:var(--green-900); margin-bottom:4px;">Evaluasi Layanan — ${tenant.name}</h2>
        <p style="color:var(--text-muted); font-size:14px; margin-bottom:22px;">
          ${tenant.campus} • Stan ${tenant.code}. Hasil survei digunakan tim Monev Kantin UNUSA untuk peningkatan layanan.
        </p>

        <form onsubmit="submitSurvey(event)">
          ${[
            ['srv-penyajian', 'Kualitas Penyajian Makanan (1-5)'],
            ['srv-layanan', 'Keramahan & Layanan Penjual (1-5)'],
            ['srv-kebersihan', 'Kebersihan Stan & Area Makan (1-5)'],
            ['srv-kecepatan', 'Kecepatan Pelayanan (1-5)']
          ].map(([id, label]) => `
            <div class="form-group">
              <label>${label}</label>
              <select class="select" id="${id}">
                <option value="5">5 — Sangat Baik</option>
                <option value="4">4 — Baik</option>
                <option value="3">3 — Cukup</option>
                <option value="2">2 — Kurang</option>
                <option value="1">1 — Sangat Kurang</option>
              </select>
            </div>
          `).join('')}

          <div class="form-group">
            <label>Saran &amp; Masukan untuk Tenant</label>
            <textarea class="textarea" id="srv-saran" rows="3" placeholder="Tulis saran membangun untuk penyajian atau layanan tenant..."></textarea>
          </div>

          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button type="button" class="btn btn-outline" onclick="navigate('tenant', { selectedTenantId: '${tenant.id}' })">Batal</button>
            <button type="submit" class="btn btn-primary">✔ Kirim Survei Kepuasan</button>
          </div>
        </form>
      </div>
    </div>
    ${renderFooter()}
  `;
}

function submitSurvey(e) {
  e.preventDefault();
  DB.surveys.unshift({
    id: 's-' + Date.now(),
    tenantId: STATE.selectedTenantId,
    userName: STATE.currentUser.fullName,
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    penyajian: Number(document.getElementById('srv-penyajian').value),
    layanan: Number(document.getElementById('srv-layanan').value),
    kebersihan: Number(document.getElementById('srv-kebersihan').value),
    kecepatan: Number(document.getElementById('srv-kecepatan').value),
    saran: document.getElementById('srv-saran').value.trim() || '-'
  });
  saveDB(DB);
  showToast('Survei kepuasan berhasil dikirim dan tercatat di Monev!');
  navigate('tenant', { selectedTenantId: STATE.selectedTenantId });
}

// ===== VIEW 6: LOGIN =====
function renderLogin() {
  return `
    <div class="auth-wrapper">
      <div class="auth-left">
        <div>
          <button class="btn btn-sm" style="background:rgba(255,255,255,0.14); color:white;" onclick="navigate('landing')">&larr; Kembali ke Beranda</button>
          <div style="margin-top:36px; font-size:12px; letter-spacing:1.2px; color:var(--yellow-400); font-weight:700;">RUANG RASA SIVITAS UNUSA</div>
          <h1>Satu akun.<br>Banyak cerita<br>di meja kantin.</h1>
          <p style="color:#d1fae5; max-width:400px;">Bagikan pengalaman, isi survei kepuasan, kelola menu tenant, dan bantu kantin kampus UNUSA terus berkembang.</p>
        </div>
        <div style="font-size:12px; color:#a7f3d0;">
          KANANTIN UNUSA &bull; Akses sesuai peran (Pembeli, Penjual Kantin, Admin).
        </div>
      </div>

      <div class="auth-right">
        <h2 style="font-size:28px; color:var(--green-900); margin-bottom:6px;">Selamat Datang Kembali</h2>
        <p style="font-size:14px; color:var(--text-muted);">Masuk ke KANANTIN UNUSA. Pilih peran Anda untuk melanjutkan.</p>

        <div class="role-selector">
          <button type="button" class="role-btn ${STATE.loginRole === 'pembeli' ? 'active' : ''}" onclick="STATE.loginRole='pembeli'; render();">Pembeli</button>
          <button type="button" class="role-btn ${STATE.loginRole === 'penjual' ? 'active' : ''}" onclick="STATE.loginRole='penjual'; render();">Penjual Kantin</button>
          <button type="button" class="role-btn ${STATE.loginRole === 'admin' ? 'active' : ''}" onclick="STATE.loginRole='admin'; render();">Admin</button>
        </div>

        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label>Username atau Email *</label>
            <input class="input" id="login-user" required placeholder="Masukkan username atau email" />
          </div>
          <div class="form-group">
            <label>Password *</label>
            <input class="input" type="password" id="login-pass" required placeholder="Masukkan password" />
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Masuk ke Katalog &rarr;</button>
        </form>

        <div style="text-align:center; margin-top:16px; font-size:14px; color:var(--text-muted);">
          Belum punya akun? <a style="color:var(--green-700); font-weight:700; cursor:pointer;" onclick="navigate('register')">Daftar Akun Sekarang</a>
        </div>

        <div class="demo-box">
          <h4>⚡ Akun Demo Cepat (Klik 1x untuk Masuk)</h4>
          <div class="demo-pills">
            <button class="btn btn-outline btn-sm" onclick="quickLogin('irsyad.prasista', '123456', 'pembeli')">Pembeli (Irsyad)</button>
            <button class="btn btn-outline btn-sm" onclick="quickLogin('warungbusiti', '123456', 'penjual')">Penjual (Bu Siti)</button>
            <button class="btn btn-outline btn-sm" onclick="quickLogin('adminkantin', 'admin123', 'admin')">Admin Kantin</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function quickLogin(username, password, role) {
  STATE.loginRole = role;
  const found = DB.users.find(u => u.username === username && u.password === password && u.role === role);
  completeLogin(found);
}

function handleLogin(e) {
  e.preventDefault();
  const ident = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;

  const found = DB.users.find(u =>
    (u.username.toLowerCase() === ident || u.email.toLowerCase() === ident) &&
    u.password === pass &&
    u.role === STATE.loginRole
  );

  if (!found) {
    showToast('Username/email, password, atau peran tidak sesuai.');
    return;
  }
  completeLogin(found);
}

function completeLogin(user) {
  STATE.currentUser = user;
  showToast(`Selamat datang, ${user.fullName}!`);
  if (user.role === 'admin') {
    navigate('admin');
  } else if (user.role === 'penjual') {
    navigate('seller');
  } else if (STATE.pendingRedirect) {
    const { view, params } = STATE.pendingRedirect;
    STATE.pendingRedirect = null;
    navigate(view, params);
  } else {
    navigate('landing');
  }
}

// ===== VIEW 7: REGISTRASI AKUN =====
function renderRegister() {
  return `
    <div class="auth-wrapper">
      <div class="auth-left">
        <div>
          <button class="btn btn-sm" style="background:rgba(255,255,255,0.14); color:white;" onclick="navigate('landing')">&larr; Kembali ke Beranda</button>
          <div style="margin-top:36px; font-size:12px; letter-spacing:1.2px; color:var(--yellow-400); font-weight:700;">DAFTAR AKUN BARU</div>
          <h1>Bergabung dengan<br>komunitas rasa<br>UNUSA.</h1>
          <p style="color:#d1fae5; max-width:400px;">Daftar sebagai Pembeli untuk memberi ulasan &amp; survei kepuasan, atau sebagai Penjual Kantin untuk mengelola menu stan Anda.</p>
        </div>
        <div style="font-size:12px; color:#a7f3d0;">Data akun langsung tersimpan ke database lokal demo.</div>
      </div>

      <div class="auth-right">
        <h2 style="font-size:26px; color:var(--green-900); margin-bottom:4px;">Daftar Akun KANANTIN UNUSA</h2>
        <p style="font-size:14px; color:var(--text-muted); margin-bottom:20px;">Lengkapi formulir berikut untuk membuat akun baru.</p>

        <form onsubmit="handleRegister(event)">
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input class="input" id="reg-name" required placeholder="Contoh: Irsyad Prasista R." />
          </div>
          <div class="form-group">
            <label>Email / Gmail Pribadi *</label>
            <input class="input" type="email" id="reg-email" required placeholder="nama@gmail.com" />
          </div>
          <div class="form-group">
            <label>Username *</label>
            <input class="input" id="reg-username" required placeholder="Contoh: irsyad.unusa" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Password Baru *</label>
              <input class="input" type="password" id="reg-pass" required minlength="6" placeholder="Min. 6 karakter" />
            </div>
            <div class="form-group">
              <label>Validasi Password *</label>
              <input class="input" type="password" id="reg-pass2" required minlength="6" placeholder="Ulangi password" />
            </div>
          </div>
          <div class="form-group">
            <label>Pilih Peran (Role) *</label>
            <select class="select" id="reg-role" onchange="document.getElementById('reg-tenant-box').style.display = this.value === 'penjual' ? 'block' : 'none'">
              <option value="pembeli">Pembeli (Mahasiswa / Karyawan / Dosen)</option>
              <option value="penjual">Penjual Kantin</option>
            </select>
          </div>
          <div class="form-group" id="reg-tenant-box" style="display:none;">
            <label>Pilih Tenant yang Dikelola</label>
            <select class="select" id="reg-tenant">
              ${DB.tenants.map(t => `<option value="${t.id}">${t.code} — ${t.name} (${t.campus})</option>`).join('')}
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Daftar Akun &rarr;</button>
        </form>

        <div style="text-align:center; margin-top:16px; font-size:14px; color:var(--text-muted);">
          Sudah punya akun? <a style="color:var(--green-700); font-weight:700; cursor:pointer;" onclick="navigate('login')">Masuk di sini</a>
        </div>
      </div>
    </div>
  `;
}

function handleRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const role = document.getElementById('reg-role').value;
  const tenantId = document.getElementById('reg-tenant').value;

  if (pass !== pass2) {
    showToast('Validasi password tidak cocok!');
    return;
  }
  if (DB.users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
    showToast('Username atau email sudah terdaftar.');
    return;
  }

  const newUser = {
    id: 'u-' + Date.now(),
    username,
    email,
    password: pass,
    fullName: fullName.toUpperCase(),
    role,
    ...(role === 'penjual' ? { tenantId } : {})
  };
  DB.users.push(newUser);
  saveDB(DB);
  STATE.loginRole = role;
  showToast('Registrasi berhasil! Silakan masuk dengan akun baru Anda.');
  navigate('login');
}

// ===== VIEW 8: DASHBOARD PENJUAL KANTIN =====
function renderSellerDashboard() {
  const u = STATE.currentUser;
  const tenant = DB.tenants.find(t => t.id === (u.tenantId || 't-a1')) || DB.tenants[0];
  const myMenus = DB.menus.filter(m => m.tenantId === tenant.id);
  const myReviews = getTenantReviews(tenant.id);
  const mySurveys = DB.surveys.filter(s => s.tenantId === tenant.id);

  return `
    <div class="dashboard-shell">
      <aside class="sidebar">
        <div>
          <div class="brand" onclick="navigate('landing')">
            <div class="brand-logo">KU</div>
            <div class="brand-text">
              <strong style="color:white;">KANANTIN UNUSA</strong>
              <span style="color:#a7f3d0;">Ruang Penjual Kantin</span>
            </div>
          </div>

          <div class="sidebar-nav">
            <div class="sidebar-item ${STATE.sellerTab === 'menus' ? 'active' : ''}" onclick="STATE.sellerTab='menus'; render();">🍽️ Menu Tenant Saya</div>
            <div class="sidebar-item ${STATE.sellerTab === 'add' ? 'active' : ''}" onclick="STATE.sellerTab='add'; render();">➕ Ajukan Menu Baru</div>
            <div class="sidebar-item ${STATE.sellerTab === 'reviews' ? 'active' : ''}" onclick="STATE.sellerTab='reviews'; render();">⭐ Ulasan &amp; Survei</div>
          </div>
        </div>
        <div>
          <button class="btn btn-sm" style="width:100%; background:rgba(255,255,255,0.1); color:white; margin-bottom:8px;" onclick="navigate('landing')">Lihat Katalog Publik</button>
          <button class="btn btn-sm btn-yellow" style="width:100%;" onclick="logout()">Keluar</button>
        </div>
      </aside>

      <main class="dash-main">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div>
            <span class="badge badge-green">${tenant.campus} • Stan ${tenant.code}</span>
            <h1 style="font-size:26px; color:var(--green-900); margin-top:4px;">${tenant.name}</h1>
            <p style="font-size:14px; color:var(--text-muted);">Pengelola: ${u.fullName} &bull; Perubahan menu baru akan diverifikasi Admin.</p>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card"><small>Total Menu</small><h3>${myMenus.length}</h3></div>
          <div class="kpi-card"><small>Menunggu Verifikasi</small><h3 style="color:var(--yellow-600);">${myMenus.filter(m => !m.verified).length}</h3></div>
          <div class="kpi-card"><small>Total Ulasan</small><h3>${myReviews.length}</h3></div>
          <div class="kpi-card"><small>Rating Tenant</small><h3>★ ${getTenantRating(tenant.id).avg}</h3></div>
        </div>

        ${STATE.sellerTab === 'menus' ? `
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Menu</th><th>Kategori</th><th>Harga</th><th>Status Verifikasi</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                ${myMenus.map(m => `
                  <tr>
                    <td><strong>${m.emoji || '🍽️'} ${m.name}</strong><div style="font-size:12px; color:var(--text-muted);">${m.desc}</div></td>
                    <td>${m.category}</td>
                    <td><strong>${formatRp(m.price)}</strong></td>
                    <td><span class="badge ${m.verified ? 'badge-green' : 'badge-yellow'}">${m.verified ? 'Terverifikasi (Aktif)' : 'Menunggu Verifikasi Admin'}</span></td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteMenu('${m.id}')">Hapus</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : STATE.sellerTab === 'add' ? `
          <div class="card" style="max-width:640px;">
            <h3 style="color:var(--green-900); margin-bottom:6px;">Formulir Pengajuan Menu Baru</h3>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:18px;">Menu baru akan masuk ke antrean verifikasi Admin sebelum tampil di katalog publik.</p>
            <form onsubmit="submitSellerMenu(event, '${tenant.id}')">
              <div class="form-group"><label>Nama Menu *</label><input class="input" id="sm-name" required placeholder="Contoh: Nasi Bebek Sinjay" /></div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group">
                  <label>Kategori *</label>
                  <select class="select" id="sm-cat"><option>Makanan</option><option>Minuman</option><option>Jajan</option></select>
                </div>
                <div class="form-group"><label>Harga (Rp) *</label><input class="input" type="number" id="sm-price" required placeholder="15000" /></div>
              </div>
              <div class="form-group"><label>Deskripsi Menu *</label><textarea class="textarea" id="sm-desc" rows="3" required placeholder="Jelaskan rasa, bahan utama, atau porsi..."></textarea></div>
              <button type="submit" class="btn btn-primary">Kirim ke Admin untuk Verifikasi</button>
            </form>
          </div>
        ` : `
          <div class="card">
            <h3 style="color:var(--green-900); margin-bottom:14px;">Ulasan &amp; Survei Terbaru (${myReviews.length} ulasan, ${mySurveys.length} survei)</h3>
            ${myReviews.map(r => `
              <div style="padding:12px 0; border-bottom:1px solid var(--border);">
                <strong>${r.userName}</strong> <span class="rating-star">★ ${r.rating}</span>
                <div style="font-size:12px; color:var(--text-muted);">Rasa: ${r.rasa} • Penyajian: ${r.penyajian} • Kebersihan: ${r.kebersihan}</div>
                <p style="font-size:14px; margin-top:4px;">${r.comment}</p>
              </div>
            `).join('') || '<p style="color:var(--text-muted);">Belum ada ulasan.</p>'}
          </div>
        `}
      </main>
    </div>
  `;
}

function submitSellerMenu(e, tenantId) {
  e.preventDefault();
  DB.menus.push({
    id: 'm-' + Date.now(),
    tenantId,
    name: document.getElementById('sm-name').value.trim(),
    category: document.getElementById('sm-cat').value,
    price: Number(document.getElementById('sm-price').value),
    emoji: '🍽️',
    status: 'Menunggu Verifikasi',
    verified: false,
    desc: document.getElementById('sm-desc').value.trim()
  });
  saveDB(DB);
  showToast('Menu baru berhasil diajukan dan menunggu verifikasi Admin!');
  STATE.sellerTab = 'menus';
  render();
}

// ===== VIEW 9: DASHBOARD ADMIN (CRUD TENANT, CRUD MENU, VERIFIKASI, MONEV) =====
function renderAdminDashboard() {
  const pendingMenus = DB.menus.filter(m => !m.verified);
  const allAvg = DB.reviews.length
    ? (DB.reviews.reduce((s, r) => s + r.rating, 0) / DB.reviews.length).toFixed(1)
    : '4.7';

  return `
    <div class="dashboard-shell">
      <aside class="sidebar">
        <div>
          <div class="brand" onclick="navigate('landing')">
            <div class="brand-logo">KU</div>
            <div class="brand-text">
              <strong style="color:white;">KANANTIN UNUSA</strong>
              <span style="color:#a7f3d0;">Ruang Admin Kantin</span>
            </div>
          </div>

          <div class="sidebar-nav">
            <div class="sidebar-item ${STATE.adminTab === 'tenants' ? 'active' : ''}" onclick="STATE.adminTab='tenants'; render();">🏪 Kelola Tenant</div>
            <div class="sidebar-item ${STATE.adminTab === 'menus' ? 'active' : ''}" onclick="STATE.adminTab='menus'; render();">🍽️ Kelola Menu</div>
            <div class="sidebar-item ${STATE.adminTab === 'verify' ? 'active' : ''}" onclick="STATE.adminTab='verify'; render();">
              <span>✅ Verifikasi Penjual</span>
              ${pendingMenus.length ? `<span class="badge badge-red">${pendingMenus.length}</span>` : ''}
            </div>
            <div class="sidebar-item ${STATE.adminTab === 'monev' ? 'active' : ''}" onclick="STATE.adminTab='monev'; render();">📊 Monev Ulasan</div>
          </div>
        </div>
        <div>
          <button class="btn btn-sm" style="width:100%; background:rgba(255,255,255,0.1); color:white; margin-bottom:8px;" onclick="navigate('landing')">Lihat Katalog Publik</button>
          <button class="btn btn-sm btn-yellow" style="width:100%;" onclick="logout()">Keluar</button>
        </div>
      </aside>

      <main class="dash-main">
        ${STATE.adminTab === 'tenants' ? renderAdminTenants(allAvg)
          : STATE.adminTab === 'menus' ? renderAdminMenus()
          : STATE.adminTab === 'verify' ? renderAdminVerify(pendingMenus)
          : renderAdminMonev()}
      </main>
    </div>
  `;
}

function renderAdminTenants(allAvg) {
  const list = STATE.adminCampusFilter === 'Semua'
    ? DB.tenants
    : DB.tenants.filter(t => t.campus === STATE.adminCampusFilter);

  return `
    <div class="section-head">
      <div>
        <span class="badge badge-green">PENGELOLAAN DATA</span>
        <h2>Kelola Tenant Kantin</h2>
        <p>Satu pusat data untuk seluruh tenant di Kampus A, B, dan C.</p>
      </div>
      <button class="btn btn-primary" onclick="openAddTenantModal()">+ Tambah Tenant</button>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card"><small>Total Tenant</small><h3>${DB.tenants.length}</h3><small>A: ${DB.tenants.filter(t=>t.campus==='Kampus A').length} • B: ${DB.tenants.filter(t=>t.campus==='Kampus B').length} • C: ${DB.tenants.filter(t=>t.campus==='Kampus C').length}</small></div>
      <div class="kpi-card"><small>Menu Terdaftar</small><h3>${DB.menus.length}</h3><small>Terhubung data penjual</small></div>
      <div class="kpi-card"><small>Ulasan Terkumpul</small><h3>${DB.reviews.length}</h3><small>Dari seluruh kampus</small></div>
      <div class="kpi-card"><small>Rating Keseluruhan</small><h3>${allAvg}/5</h3><small>Rata-rata seluruh ulasan</small></div>
    </div>

    <div class="filter-bar">
      <select class="select" onchange="STATE.adminCampusFilter=this.value; render();">
        <option value="Semua" ${STATE.adminCampusFilter==='Semua'?'selected':''}>Semua Kampus</option>
        <option value="Kampus A" ${STATE.adminCampusFilter==='Kampus A'?'selected':''}>Kampus A</option>
        <option value="Kampus B" ${STATE.adminCampusFilter==='Kampus B'?'selected':''}>Kampus B</option>
        <option value="Kampus C" ${STATE.adminCampusFilter==='Kampus C'?'selected':''}>Kampus C</option>
      </select>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Tenant / Stan</th><th>Pengelola</th><th>Kampus</th><th>Menu</th><th>Rating</th><th>Status</th><th>Aksi</th></tr>
        </thead>
        <tbody>
          ${list.map(t => `
            <tr>
              <td><strong>${t.name}</strong><div style="font-size:12px; color:var(--text-muted);">Stan ${t.code} • ${t.category}</div></td>
              <td>${t.owner}</td>
              <td>${t.campus}</td>
              <td>${getTenantMenus(t.id, false).length} menu</td>
              <td><span class="rating-star">★ ${getTenantRating(t.id).avg}</span></td>
              <td><span class="badge badge-green">${t.status}</span></td>
              <td>
                <button class="btn btn-outline btn-sm" onclick="STATE.adminSelectedTenantId='${t.id}'; STATE.adminTab='menus'; render();">Menu</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTenant('${t.id}')">Hapus</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminMenus() {
  const tenant = DB.tenants.find(t => t.id === STATE.adminSelectedTenantId) || DB.tenants[0];
  const menus = DB.menus.filter(m => m.tenantId === tenant.id);
  const editObj = menus.find(m => m.id === STATE.editingMenuId) || null;

  return `
    <div class="section-head">
      <div>
        <span class="badge badge-green">PENGELOLAAN DATA</span>
        <h2>Kelola Menu Tenant</h2>
        <p>Tambah, perbarui, dan hapus menu pada setiap tenant (sinkron dengan akun penjual).</p>
      </div>
      <select class="select" onchange="STATE.adminSelectedTenantId=this.value; STATE.editingMenuId=null; render();">
        ${DB.tenants.map(t => `<option value="${t.id}" ${t.id===tenant.id?'selected':''}>${t.code} — ${t.name} (${t.campus})</option>`).join('')}
      </select>
    </div>

    <div class="two-col-admin">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nama Menu</th><th>Kategori</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${menus.map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.category}</td>
                <td>${formatRp(m.price)}</td>
                <td><span class="badge ${m.verified ? 'badge-green' : 'badge-yellow'}">${m.status}</span></td>
                <td>
                  <button class="btn btn-outline btn-sm" onclick="STATE.editingMenuId='${m.id}'; render();">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteMenu('${m.id}')">Hapus</button>
                </td>
              </tr>
            `).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Belum ada menu.</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="color:var(--green-900);">${editObj ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
          ${editObj ? `<button class="btn btn-ghost btn-sm" onclick="STATE.editingMenuId=null; render();">+ Baru</button>` : ''}
        </div>
        <form onsubmit="saveAdminMenu(event, '${tenant.id}')">
          <div class="form-group"><label>Nama Menu *</label><input class="input" id="am-name" required value="${editObj ? editObj.name : ''}" /></div>
          <div class="form-group">
            <label>Kategori *</label>
            <select class="select" id="am-cat">
              ${['Makanan','Minuman','Jajan'].map(c => `<option ${editObj && editObj.category===c ? 'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Harga (Rp) *</label><input class="input" type="number" id="am-price" required value="${editObj ? editObj.price : ''}" /></div>
          <div class="form-group"><label>Deskripsi *</label><textarea class="textarea" id="am-desc" rows="3" required>${editObj ? editObj.desc : ''}</textarea></div>
          <button type="submit" class="btn btn-primary" style="width:100%;">✔ Simpan Perubahan</button>
        </form>
      </div>
    </div>
  `;
}

function renderAdminVerify(pendingMenus) {
  return `
    <div class="section-head">
      <div>
        <span class="badge badge-yellow">VERIFIKASI PENJUAL KANTIN</span>
        <h2>Antrean Verifikasi Menu Baru</h2>
        <p>Setujui atau tolak menu baru yang diajukan oleh Penjual Kantin sebelum tampil di katalog publik.</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>Tenant</th><th>Nama Menu</th><th>Kategori</th><th>Harga</th><th>Deskripsi</th><th>Aksi</th></tr></thead>
        <tbody>
          ${pendingMenus.length ? pendingMenus.map(m => {
            const t = DB.tenants.find(x => x.id === m.tenantId);
            return `
              <tr>
                <td><strong>${t ? t.name : '-'}</strong><div style="font-size:12px; color:var(--text-muted);">${t ? t.campus : ''}</div></td>
                <td><strong>${m.name}</strong></td>
                <td>${m.category}</td>
                <td>${formatRp(m.price)}</td>
                <td style="font-size:13px; color:var(--text-muted);">${m.desc}</td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="verifyMenu('${m.id}', true)">✔ Setujui</button>
                  <button class="btn btn-danger btn-sm" onclick="verifyMenu('${m.id}', false)">Tolak</button>
                </td>
              </tr>
            `;
          }).join('') : `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted);">Semua pengajuan menu dari penjual telah diverifikasi.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminMonev() {
  const list = STATE.adminCampusFilter === 'Semua'
    ? DB.tenants
    : DB.tenants.filter(t => t.campus === STATE.adminCampusFilter);

  const tenantRows = list.map(t => {
    const rt = getTenantRating(t.id);
    const srvs = DB.surveys.filter(s => s.tenantId === t.id);
    const srvAvg = srvs.length
      ? (srvs.reduce((acc, s) => acc + (s.penyajian + s.layanan + s.kebersihan + s.kecepatan) / 4, 0) / srvs.length).toFixed(1)
      : '-';
    const needReview = rt.avg < 4.6;
    return { t, rt, srvCount: srvs.length, srvAvg, needReview };
  });

  const priority = tenantRows.filter(x => x.needReview);

  return `
    <div class="section-head">
      <div>
        <span class="badge badge-green">MONITORING &amp; EVALUASI</span>
        <h2>Dengarkan Suara Sivitas</h2>
        <p>Ringkasan ulasan dan survei kepuasan per tenant sebagai dasar evaluasi layanan kantin.</p>
      </div>
      <div style="display:flex; gap:10px;">
        <select class="select" onchange="STATE.adminCampusFilter=this.value; render();">
          <option value="Semua" ${STATE.adminCampusFilter==='Semua'?'selected':''}>Semua Kampus</option>
          <option value="Kampus A" ${STATE.adminCampusFilter==='Kampus A'?'selected':''}>Kampus A</option>
          <option value="Kampus B" ${STATE.adminCampusFilter==='Kampus B'?'selected':''}>Kampus B</option>
          <option value="Kampus C" ${STATE.adminCampusFilter==='Kampus C'?'selected':''}>Kampus C</option>
        </select>
        <button class="btn btn-yellow" onclick="exportMonevCSV()">⬇ Ekspor Ringkasan (CSV)</button>
      </div>
    </div>

    ${priority.length ? `
      <div class="card" style="background:var(--yellow-50); border-color:var(--yellow-400); margin-bottom:20px;">
        <strong style="color:#92400e; font-size:12px;">⚠ PRIORITAS EVALUASI (RATING &lt; 4,6)</strong>
        <div style="margin-top:6px; font-size:14px;">
          ${priority.map(p => `<strong>${p.t.name} (${p.t.code})</strong>: rating <strong>${p.rt.avg}/5</strong> (${p.rt.count} ulasan)`).join(' &bull; ')}
        </div>
      </div>
    ` : ''}

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Tenant</th><th>Menu</th><th>Total Ulasan</th><th>Rating Agregat</th><th>Skor Survei</th><th>Evaluasi</th></tr>
        </thead>
        <tbody>
          ${tenantRows.map(x => `
            <tr>
              <td><strong>${x.t.name}</strong><div style="font-size:12px; color:var(--text-muted);">${x.t.campus} • Stan ${x.t.code}</div></td>
              <td>${getTenantMenus(x.t.id, true).length} menu</td>
              <td>${x.rt.count} ulasan</td>
              <td><strong>★ ${x.rt.avg}/5</strong></td>
              <td>${x.srvAvg === '-' ? '-' : `${x.srvAvg}/5 (${x.srvCount} survei)`}</td>
              <td><span class="badge ${x.needReview ? 'badge-red' : 'badge-green'}">${x.needReview ? 'Perlu Ditinjau' : 'Baik'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ===== ADMIN & CRUD ACTIONS =====
function openAddTenantModal() {
  document.getElementById('modal-root').innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal-card">
        <h3 style="color:var(--green-900); margin-bottom:16px;">Tambah Tenant Kantin Baru</h3>
        <form onsubmit="saveNewTenant(event)">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label>Kode Stan *</label><input class="input" id="nt-code" required placeholder="Contoh: A-10" /></div>
            <div class="form-group">
              <label>Kampus *</label>
              <select class="select" id="nt-campus"><option>Kampus A</option><option>Kampus B</option><option>Kampus C</option></select>
            </div>
          </div>
          <div class="form-group"><label>Nama Tenant *</label><input class="input" id="nt-name" required placeholder="Contoh: Warung Soto Madura" /></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group"><label>Kategori *</label><input class="input" id="nt-cat" required placeholder="Ayam & Nasi" /></div>
            <div class="form-group"><label>Nama Pengelola *</label><input class="input" id="nt-owner" required placeholder="Nama Pemilik" /></div>
          </div>
          <div class="form-group"><label>Deskripsi *</label><textarea class="textarea" id="nt-desc" rows="2" required></textarea></div>
          <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan Tenant</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

function saveNewTenant(e) {
  e.preventDefault();
  DB.tenants.push({
    id: 't-' + Date.now(),
    code: document.getElementById('nt-code').value.trim(),
    campus: document.getElementById('nt-campus').value,
    name: document.getElementById('nt-name').value.trim(),
    category: document.getElementById('nt-cat').value.trim(),
    owner: document.getElementById('nt-owner').value.trim(),
    hours: 'Senin-Jumat, 07.30-16.00 WIB',
    status: 'Aktif',
    desc: document.getElementById('nt-desc').value.trim()
  });
  saveDB(DB);
  closeModal();
  showToast('Tenant baru berhasil ditambahkan!');
  render();
}

function deleteTenant(id) {
  if (!confirm('Hapus tenant ini beserta seluruh menunya?')) return;
  DB.tenants = DB.tenants.filter(t => t.id !== id);
  DB.menus = DB.menus.filter(m => m.tenantId !== id);
  saveDB(DB);
  showToast('Tenant berhasil dihapus.');
  render();
}

function saveAdminMenu(e, tenantId) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('am-name').value.trim(),
    category: document.getElementById('am-cat').value,
    price: Number(document.getElementById('am-price').value),
    desc: document.getElementById('am-desc').value.trim()
  };
  if (STATE.editingMenuId) {
    const idx = DB.menus.findIndex(m => m.id === STATE.editingMenuId);
    if (idx >= 0) DB.menus[idx] = { ...DB.menus[idx], ...payload };
    STATE.editingMenuId = null;
    showToast('Menu berhasil diperbarui!');
  } else {
    DB.menus.push({
      id: 'm-' + Date.now(),
      tenantId,
      emoji: '🍽️',
      status: 'Aktif',
      verified: true,
      ...payload
    });
    showToast('Menu baru berhasil ditambahkan!');
  }
  saveDB(DB);
  render();
}

function deleteMenu(id) {
  if (!confirm('Hapus menu ini?')) return;
  DB.menus = DB.menus.filter(m => m.id !== id);
  saveDB(DB);
  showToast('Menu berhasil dihapus.');
  render();
}

function verifyMenu(id, approved) {
  if (approved) {
    const m = DB.menus.find(x => x.id === id);
    if (m) { m.verified = true; m.status = 'Aktif'; }
    showToast('Menu disetujui dan kini tampil di katalog publik!');
  } else {
    DB.menus = DB.menus.filter(x => x.id !== id);
    showToast('Pengajuan menu ditolak dan dihapus.');
  }
  saveDB(DB);
  render();
}

function exportMonevCSV() {
  const rows = [['Kode Stan', 'Nama Tenant', 'Kampus', 'Jumlah Menu', 'Total Ulasan', 'Rating Agregat', 'Evaluasi']];
  DB.tenants.forEach(t => {
    const rt = getTenantRating(t.id);
    rows.push([t.code, t.name, t.campus, getTenantMenus(t.id, true).length, rt.count, rt.avg, rt.avg < 4.6 ? 'Perlu Ditinjau' : 'Baik']);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'monev-kanantin-unusa.csv';
  a.click();
  showToast('Laporan Monev berhasil diunduh (CSV).');
}

// ===== MAIN RENDER =====
function render() {
  const app = document.getElementById('app');
  switch (STATE.view) {
    case 'login': app.innerHTML = renderLogin(); break;
    case 'register': app.innerHTML = renderRegister(); break;
    case 'tenant': app.innerHTML = renderTenantDetail(); break;
    case 'menu': app.innerHTML = renderMenuDetail(); break;
    case 'review-form': app.innerHTML = renderReviewForm(); break;
    case 'survey-form': app.innerHTML = renderSurveyForm(); break;
    case 'admin': app.innerHTML = renderAdminDashboard(); break;
    case 'seller': app.innerHTML = renderSellerDashboard(); break;
    default: app.innerHTML = renderLanding();
  }
}

render();
