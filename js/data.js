// Data Awal Sistem KANANTIN UNUSA (Disimpan & Disinkronkan ke localStorage)
const STORAGE_KEY = 'kanantin_unusa_db_v1';

const DEFAULT_DB = {
  users: [
    {
      id: 'u-1',
      username: 'irsyad.prasista',
      email: 'irsyad.prasista@student.unusa.ac.id',
      password: '123456',
      fullName: 'IRSYAD PRASISTA R.',
      role: 'pembeli'
    },
    {
      id: 'u-2',
      username: 'warungbusiti',
      email: 'siti.aminah@kantin.unusa.ac.id',
      password: '123456',
      fullName: 'Siti Aminah',
      role: 'penjual',
      tenantId: 't-a1'
    },
    {
      id: 'u-3',
      username: 'adminkantin',
      email: 'admin@unusa.ac.id',
      password: 'admin123',
      fullName: 'Admin Kantin UNUSA',
      role: 'admin'
    }
  ],

  tenants: [
    // ===== KAMPUS A (9 TENANT) =====
    { id: 't-a1', code: 'A-01', campus: 'Kampus A', name: 'Warung Bu Siti', category: 'Ayam & Nasi', owner: 'Siti Aminah', hours: 'Senin-Jumat, 07.00-16.00 WIB', status: 'Aktif', desc: 'Masakan rumahan akrab di lidah. Pilihan ayam geprek, nasi goreng, dan minuman segar.' },
    { id: 't-a2', code: 'A-02', campus: 'Kampus A', name: 'Soto Pak Hadi', category: 'Soto & Sup', owner: 'Hadi Santoso', hours: 'Senin-Jumat, 07.30-15.30 WIB', status: 'Aktif', desc: 'Soto ayam Lamongan kuah kuning gurih dengan taburan koya melimpah.' },
    { id: 't-a3', code: 'A-03', campus: 'Kampus A', name: 'Bakso Cak Dul', category: 'Bakso & Mi', owner: 'Abdul Rahman', hours: 'Senin-Sabtu, 08.00-16.30 WIB', status: 'Aktif', desc: 'Bakso daging sapi asli dengan pilihan bakso urat, pentol puyuh, dan gorengan renyah.' },
    { id: 't-a4', code: 'A-04', campus: 'Kampus A', name: 'Kopi Sudut Kampus', category: 'Kopi & Minuman', owner: 'Raka Pratama', hours: 'Senin-Jumat, 07.00-17.00 WIB', status: 'Aktif', desc: 'Kopi susu gula aren, matcha latte, dan minuman dingin teman mengerjakan tugas.' },
    { id: 't-a5', code: 'A-05', campus: 'Kampus A', name: 'Dapur Nusantara', category: 'Nasi & Lauk', owner: 'Dewi Lestari', hours: 'Senin-Jumat, 07.30-15.00 WIB', status: 'Aktif', desc: 'Aneka lauk prasmanan Nusantara mulai dari rendang, sayur asem, hingga telur balado.' },
    { id: 't-a6', code: 'A-06', campus: 'Kampus A', name: 'Mie Ayam Barokah', category: 'Bakso & Mi', owner: 'Agus Setiawan', hours: 'Senin-Jumat, 08.00-16.00 WIB', status: 'Aktif', desc: 'Mie ayam pangsit kenyal dengan topping ayam kecap manis gurih.' },
    { id: 't-a7', code: 'A-07', campus: 'Kampus A', name: 'Jus Segar Ceria', category: 'Jus & Minuman', owner: 'Citra Wulandari', hours: 'Senin-Jumat, 08.00-16.00 WIB', status: 'Aktif', desc: 'Aneka jus buah segar tanpa pemanis buatan, sop buah, dan es jeruk peras.' },
    { id: 't-a8', code: 'A-08', campus: 'Kampus A', name: 'Pojok Jajanan', category: 'Jajan & Camilan', owner: 'Lina Marlina', hours: 'Senin-Jumat, 07.00-16.00 WIB', status: 'Aktif', desc: 'Risol mayo, pastel, tahu walik, dimsum, dan jajanan pasar untuk jeda kuliah.' },
    { id: 't-a9', code: 'A-09', campus: 'Kampus A', name: 'Penyetan Mbak Rini', category: 'Ayam & Nasi', owner: 'Rini Handayani', hours: 'Senin-Jumat, 09.00-16.30 WIB', status: 'Aktif', desc: 'Penyetan lele, tempe, tahu, dan bebek goreng dengan sambal terasi dadakan.' },

    // ===== KAMPUS B (5 TENANT) =====
    { id: 't-b1', code: 'B-01', campus: 'Kampus B', name: 'Warung Mbak Yanti', category: 'Nasi & Lauk', owner: 'Yanti Rahayu', hours: 'Senin-Jumat, 07.00-16.00 WIB', status: 'Aktif', desc: 'Nasi campur, rawon, dan nasi pecel pincuk favorit mahasiswa Kampus B.' },
    { id: 't-b2', code: 'B-02', campus: 'Kampus B', name: 'Geprek Mas Bro', category: 'Ayam & Nasi', owner: 'Budi Santoso', hours: 'Senin-Jumat, 08.00-16.30 WIB', status: 'Aktif', desc: 'Ayam geprek level 1-5 dengan pilihan sambal bawang, sambal matah, dan keju.' },
    { id: 't-b3', code: 'B-03', campus: 'Kampus B', name: 'Kedai Kopi Kampus B', category: 'Kopi & Minuman', owner: 'Fajar Nugroho', hours: 'Senin-Sabtu, 07.30-17.00 WIB', status: 'Aktif', desc: 'Racikan kopi lokal, es cokelat, dan roti bakar hangat.' },
    { id: 't-b4', code: 'B-04', campus: 'Kampus B', name: 'Soto Ayam Lamongan B', category: 'Soto & Sup', owner: 'Slamet Riyadi', hours: 'Senin-Jumat, 07.30-15.30 WIB', status: 'Aktif', desc: 'Soto ayam kampung kuah bening dan kuning lengkap dengan sate telur puyuh.' },
    { id: 't-b5', code: 'B-05', campus: 'Kampus B', name: 'Jajanan & Gorengan B', category: 'Jajan & Camilan', owner: 'Nurul Hidayah', hours: 'Senin-Jumat, 07.00-16.00 WIB', status: 'Aktif', desc: 'Cireng bumbu rujak, pisang cokelat, sosis bakar, dan pentol pedas.' },

    // ===== KAMPUS C (3 TENANT) =====
    { id: 't-c1', code: 'C-01', campus: 'Kampus C', name: 'Kantin Sehat C', category: 'Nasi & Lauk', owner: 'Wulan Sari', hours: 'Senin-Jumat, 07.30-15.30 WIB', status: 'Aktif', desc: 'Menu sehat gizi seimbang, nasi merah, capcay, dan ayam panggang madu.' },
    { id: 't-c2', code: 'C-02', campus: 'Kampus C', name: 'Mie & Bakso Ceria', category: 'Bakso & Mi', owner: 'Hendra Wijaya', hours: 'Senin-Jumat, 08.00-16.00 WIB', status: 'Aktif', desc: 'Mie pangsit Jakarta, bakso komplit, dan mie pedas level kampus.' },
    { id: 't-c3', code: 'C-03', campus: 'Kampus C', name: 'Minuman Segar C', category: 'Jus & Minuman', owner: 'Dina Kartika', hours: 'Senin-Jumat, 08.00-16.00 WIB', status: 'Aktif', desc: 'Es teh jumbo, es jeruk, milkshake taro, dan aneka camilan ringan.' }
  ],

  menus: [
    // Warung Bu Siti (A-01)
    { id: 'm-001', tenantId: 't-a1', name: 'Nasi Ayam Geprek', category: 'Makanan', price: 15000, emoji: '🍗', status: 'Aktif', verified: true, desc: 'Ayam goreng renyah digeprek dengan sambal bawang, nasi hangat, mentimun, dan lalapan.' },
    { id: 'm-002', tenantId: 't-a1', name: 'Nasi Ayam Goreng', category: 'Makanan', price: 15000, emoji: '🍛', status: 'Aktif', verified: true, desc: 'Ayam ungkep bumbu kuning digoreng garing dengan sambal tomat segar.' },
    { id: 'm-003', tenantId: 't-a1', name: 'Nasi Goreng Spesial', category: 'Makanan', price: 17000, emoji: '🍳', status: 'Aktif', verified: true, desc: 'Nasi goreng kampung dengan telur mata sapi, suwiran ayam, dan kerupuk.' },
    { id: 'm-004', tenantId: 't-a1', name: 'Tahu Crispy', category: 'Jajan', price: 8000, emoji: '🥟', status: 'Aktif', verified: true, desc: 'Tahu goreng tepung renyah disajikan dengan cabai rawit dan saus sambal.' },
    { id: 'm-005', tenantId: 't-a1', name: 'Es Teh Manis', category: 'Minuman', price: 4000, emoji: '🧋', status: 'Aktif', verified: true, desc: 'Teh seduh wangi melati dengan es batu kristal menyegarkan.' },
    { id: 'm-006', tenantId: 't-a1', name: 'Jus Mangga', category: 'Minuman', price: 10000, emoji: '🥭', status: 'Aktif', verified: true, desc: 'Jus buah mangga harum manis segar, kental dan tidak terlalu manis.' },
    // Pending verification example for Admin
    { id: 'm-007', tenantId: 't-a1', name: 'Nasi Telur Barendo', category: 'Makanan', price: 12000, emoji: '🥚', status: 'Menunggu Verifikasi', verified: false, desc: 'Telur dadar crispy khas Padang dengan sambal ijo dan nasi pulen.' },

    // Soto Pak Hadi (A-02)
    { id: 'm-008', tenantId: 't-a2', name: 'Soto Ayam Koya', category: 'Makanan', price: 14000, emoji: '🍜', status: 'Aktif', verified: true, desc: 'Soto ayam kuah hangat dengan soun, kol, telur rebus, dan bubuk koya gurih.' },
    { id: 'm-009', tenantId: 't-a2', name: 'Es Jeruk Peras', category: 'Minuman', price: 6000, emoji: '🍊', status: 'Aktif', verified: true, desc: 'Perasan jeruk manis asli tanpa sirup buatan.' },

    // Bakso Cak Dul (A-03)
    { id: 'm-010', tenantId: 't-a3', name: 'Bakso Urat Komplit', category: 'Makanan', price: 16000, emoji: '🍲', status: 'Aktif', verified: true, desc: 'Bakso urat besar, 3 bakso halus, tahu isi, mie kuning, dan gorengan.' },
    { id: 'm-011', tenantId: 't-a3', name: 'Es Cao Gula Merah', category: 'Minuman', price: 5000, emoji: '🥤', status: 'Aktif', verified: true, desc: 'Cincau hitam lembut dengan santan ringan dan gula aren.' },

    // Kopi Sudut Kampus (A-04)
    { id: 'm-012', tenantId: 't-a4', name: 'Es Kopi Susu Aren', category: 'Minuman', price: 13000, emoji: '☕', status: 'Aktif', verified: true, desc: 'Espresso arabika-robusta berpadu susu segar dan gula aren organik.' },
    { id: 'm-013', tenantId: 't-a4', name: 'Croffle Cokelat', category: 'Jajan', price: 10000, emoji: '🥐', status: 'Aktif', verified: true, desc: 'Croissant waffle renyah dengan glazing cokelat belgia.' },

    // Dapur Nusantara (A-05)
    { id: 'm-014', tenantId: 't-a5', name: 'Nasi Rendang Sapi', category: 'Makanan', price: 20000, emoji: '🍛', status: 'Aktif', verified: true, desc: 'Daging sapi empuk bumbu rendang Minang dengan daun singkong.' },
    { id: 'm-015', tenantId: 't-a5', name: 'Nasi Sayur Asem', category: 'Makanan', price: 12000, emoji: '🥗', status: 'Aktif', verified: true, desc: 'Sayur asem segar lengkap dengan ikan asin dan sambal terasi.' },

    // Other Tenants sample menus
    { id: 'm-016', tenantId: 't-a6', name: 'Mie Ayam Pangsit', category: 'Makanan', price: 13000, emoji: '🍜', status: 'Aktif', verified: true, desc: 'Mie lembut dengan topping ayam manis dan 2 pangsit rebus.' },
    { id: 'm-017', tenantId: 't-a7', name: 'Jus Alpukat Cokelat', category: 'Minuman', price: 12000, emoji: '🥑', status: 'Aktif', verified: true, desc: 'Alpukat mentega segar diblender kental dengan susu cokelat.' },
    { id: 'm-018', tenantId: 't-a8', name: 'Risol Mayo Smoked Beef', category: 'Jajan', price: 5000, emoji: '🌯', status: 'Aktif', verified: true, desc: 'Risol isi daging asap, telur rebus, dan saus mayo creamy.' },
    { id: 'm-019', tenantId: 't-a9', name: 'Penyetan Lele Sambal Terasi', category: 'Makanan', price: 14000, emoji: '🐟', status: 'Aktif', verified: true, desc: 'Lele goreng garing, tahu tempe, lalapan segar, dan sambal ulek.' },

    // Kampus B Menus
    { id: 'm-020', tenantId: 't-b1', name: 'Nasi Pecel Madiun', category: 'Makanan', price: 12000, emoji: '🥗', status: 'Aktif', verified: true, desc: 'Sayuran rebus segar, sambal kacang gurih, rempeyek, dan telur ceplok.' },
    { id: 'm-021', tenantId: 't-b2', name: 'Ayam Geprek Sambal Matah', category: 'Makanan', price: 16000, emoji: '🍗', status: 'Aktif', verified: true, desc: 'Ayam geprek renyah dengan topping sambal matah wangi serai.' },
    { id: 'm-022', tenantId: 't-b3', name: 'Matcha Latte Ice', category: 'Minuman', price: 14000, emoji: '🍵', status: 'Aktif', verified: true, desc: 'Bubuk matcha Jepang premium dengan susu full cream.' },
    { id: 'm-023', tenantId: 't-b4', name: 'Soto Ayam Kampung', category: 'Makanan', price: 15000, emoji: '🍜', status: 'Aktif', verified: true, desc: 'Kuah kaldu ayam kampung asli lengkap dengan jeruk nipis.' },
    { id: 'm-024', tenantId: 't-b5', name: 'Cireng Bumbu Rujak', category: 'Jajan', price: 8000, emoji: '🥟', status: 'Aktif', verified: true, desc: 'Cireng renyah di luar kenyal di dalam dengan cocolan sambal rujak pedas manis.' },

    // Kampus C Menus
    { id: 'm-025', tenantId: 't-c1', name: 'Nasi Merah Ayam Madu', category: 'Makanan', price: 18000, emoji: '🍱', status: 'Aktif', verified: true, desc: 'Nasi merah pulen, dada ayam panggang madu, dan tumis brokoli.' },
    { id: 'm-026', tenantId: 't-c2', name: 'Mie Pedas Level 2', category: 'Makanan', price: 13000, emoji: '🍝', status: 'Aktif', verified: true, desc: 'Mie goreng pedas gurih dengan taburan ayam dan kerupuk pangsit.' },
    { id: 'm-027', tenantId: 't-c3', name: 'Es Teh Jumbo', category: 'Minuman', price: 5000, emoji: '🧊', status: 'Aktif', verified: true, desc: 'Es teh manis porsi jumbo dingin menyegarkan.' }
  ],

  reviews: [
    {
      id: 'r-1',
      tenantId: 't-a1',
      menuId: 'm-001',
      userName: 'Nadia Putri',
      date: '28 Oktober 2026',
      rating: 5,
      rasa: 'Enak',
      penyajian: 'Rapi',
      kebersihan: 'Bersih',
      porsi: 'Pas',
      harga: 'Sesuai',
      comment: 'Ayamnya renyah, sambalnya pas dan porsinya mengenyangkan. Pilihan favorit saat jeda kuliah!'
    },
    {
      id: 'r-2',
      tenantId: 't-a1',
      menuId: 'm-001',
      userName: 'Ahmad Rizki',
      date: '27 Oktober 2026',
      rating: 5,
      rasa: 'Enak',
      penyajian: 'Rapi',
      kebersihan: 'Bersih',
      porsi: 'Pas',
      harga: 'Sesuai',
      comment: 'Sambalnya mantap dan ayamnya tidak berminyak. Porsinya cukup, harganya juga bersahabat untuk mahasiswa.'
    },
    {
      id: 'r-3',
      tenantId: 't-a1',
      menuId: 'm-001',
      userName: 'Dinda Febriani',
      date: '26 Oktober 2026',
      rating: 4,
      rasa: 'Enak',
      penyajian: 'Rapi',
      kebersihan: 'Bersih',
      porsi: 'Pas',
      harga: 'Sesuai',
      comment: 'Rasanya enak dan lalapannya segar. Akan lebih nyaman kalau sambal disajikan terpisah agar pedasnya bisa disesuaikan.'
    },
    {
      id: 'r-4',
      tenantId: 't-a2',
      menuId: 'm-008',
      userName: 'Faisal Akbar',
      date: '25 Oktober 2026',
      rating: 5,
      rasa: 'Enak',
      penyajian: 'Rapi',
      kebersihan: 'Bersih',
      porsi: 'Banyak',
      harga: 'Sesuai',
      comment: 'Kuahnya hangat dan koyanya bisa tambah sendiri. Cocok banget buat sarapan pagi sebelum masuk kelas.'
    },
    {
      id: 'r-5',
      tenantId: 't-a5',
      menuId: 'm-014',
      userName: 'Rizal Pratama',
      date: '24 Oktober 2026',
      rating: 3,
      rasa: 'Cukup',
      penyajian: 'Cukup',
      kebersihan: 'Cukup',
      porsi: 'Kurang',
      harga: 'Kurang sesuai',
      comment: 'Rasa bumbu rendangnya lumayan, tapi saat jam makan siang antreannya cukup lama dan porsi daging agak kecil.'
    },
    {
      id: 'r-6',
      tenantId: 't-b1',
      menuId: 'm-020',
      userName: 'Salsa Bila',
      date: '27 Oktober 2026',
      rating: 5,
      rasa: 'Enak',
      penyajian: 'Rapi',
      kebersihan: 'Bersih',
      porsi: 'Pas',
      harga: 'Sesuai',
      comment: 'Sambal pecelnya medok dan peyeknya renyah. Pelayanannya cepat banget.'
    },
    {
      id: 'r-7',
      tenantId: 't-c1',
      menuId: 'm-025',
      userName: 'Bagus Saputra',
      date: '28 Oktober 2026',
      rating: 5,
      rasa: 'Enak',
      penyajian: 'Rapi',
      kebersihan: 'Bersih',
      porsi: 'Pas',
      harga: 'Sesuai',
      comment: 'Menu sehat favorit di Kampus C! Ayam madunya empuk dan sayurannya masih segar.'
    }
  ],

  surveys: [
    {
      id: 's-1',
      tenantId: 't-a1',
      userName: 'Nadia Putri',
      date: '28 Oktober 2026',
      penyajian: 5,
      layanan: 5,
      kebersihan: 5,
      kecepatan: 4,
      saran: 'Pertahankan kebersihan meja dan keramahan penjualnya.'
    },
    {
      id: 's-2',
      tenantId: 't-a5',
      userName: 'Rizal Pratama',
      date: '24 Oktober 2026',
      penyajian: 4,
      layanan: 3,
      kebersihan: 4,
      kecepatan: 3,
      saran: 'Mohon percepat pelayanan saat jam istirahat pukul 12.00 WIB.'
    }
  ]
};

function loadDB() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  return JSON.parse(raw);
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}
