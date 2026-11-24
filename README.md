# KANANTIN UNUSA — Demo Sistem Katalog Tenant Kantin

Proyek demo web interaktif untuk **KANANTIN UNUSA (Katalog Tenant Kantin UNUSA)** dengan palet warna putih, hijau UNUSA, dan kuning aksen.

## Struktur Folder
```text
kanantin-unusa/
├── index.html                 # Entry point aplikasi web
├── css/
│   └── style.css              # Stylesheet utama (desktop-first)
├── js/
│   ├── data.js                # Data awal (17 tenant, menu, ulasan, survei, akun) + localStorage
│   └── app.js                 # Logika interaktif (routing, auth, denah, CRUD, verifikasi, monev)
├── database/
│   └── kanantin_unusa.sql     # Skema SQL siap import ke phpMyAdmin (XAMPP)
└── README.md
```

## Cara Menjalankan di VS Code / Antigravity
1. Ekstrak file `kanantin-unusa.zip`.
2. Buka folder `kanantin-unusa` di **VS Code** atau **Antigravity**.
3. Jalankan dengan salah satu cara berikut:
   - **Cara 1 (Live Server — Disarankan):** Klik kanan pada `index.html` → pilih **Open with Live Server**.
   - **Cara 2 (Terminal lokal):** Jalankan perintah `npx serve .` atau `python -m http.server 8000`, lalu buka `http://localhost:8000`.
   - **Cara 3 (Langsung):** Klik dua kali file `index.html` di browser.

## Akun Demo Tersedia
| Peran | Username | Password |
| :--- | :--- | :--- |
| **Pembeli** | `irsyad.prasista` | `123456` |
| **Penjual Kantin** | `warungbusiti` | `123456` |
| **Admin** | `adminkantin` | `admin123` |

> **Catatan:** Data perubahan (registrasi akun, ulasan, survei, CRUD tenant/menu, dan verifikasi) disimpan otomatis di `localStorage` browser. Untuk mereset ke data awal, hapus key `kanantin_unusa_db_v1` pada DevTools → Application → Local Storage.
