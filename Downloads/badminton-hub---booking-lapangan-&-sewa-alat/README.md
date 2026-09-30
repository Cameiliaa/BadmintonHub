

## Struktur file

- `index.html`: kerangka utama, metadata, urutan CSS/JavaScript, dan penanda include HTML.
- `src/templates/layout/`: header, footer, navigasi mobile.
- `src/templates/customer/`: halaman pengunjung, keranjang, checkout, dan tiket.
- `src/templates/admin/`: form login dan modal pengelolaan admin.
- `public/css/site.css`: styling tambahan dan animasi.
- `public/js/state.js`: data demo dan state aplikasi.
- `public/js/utils.js`: format rupiah dan toast.
- `public/js/navigation.js`: navigasi dan pergantian tampilan setelah login.
- `public/js/schedule.js`, `store.js`, `cart.js`, `checkout.js`, `tickets.js`, `facilities.js`: perilaku masing-masing fitur.
- `public/js/admin/`: autentikasi di browser, dashboard, jadwal, booking manual, reschedule, pembatalan, lapangan, jam, produk, dan verifikasi pembayaran.
- `public/js/init.js`: inisialisasi halaman.
- `server/admin-auth.mjs`: pemeriksaan login dan sesi di server.
- `server/admin-panel.html`: dashboard yang hanya dikirim setelah login; jangan dipindahkan ke folder publik atau di-include ke halaman pengunjung.
- `tooling/html-partials.mjs`: menyatukan template HTML saat development dan build. Perubahan template memuat ulang halaman di development.

Edit file sesuai fitur di atas. HTML menggunakan event handler seperti `onclick`, sehingga JavaScript masih berupa script klasik dengan fungsi bersama dan `AppState`; urutan tag `defer` di `index.html` harus dipertahankan. Tidak ada fetch template tambahan di browser.

`src/App.tsx`, `src/main.tsx`, dan `src/index.css` merupakan scaffold React lama yang belum digunakan oleh halaman ini. Halaman aktif tetap memakai HTML dan JavaScript di struktur di atas.

Jalankan `npm.cmd run build` kemudian `npm.cmd run test:auth` untuk memeriksa hasil build, file fitur, dan proteksi admin. Perintah menjalankan web tetap `npm.cmd run dev`.

## Menyiapkan akun admin

1. Jalankan `npm.cmd install`.
2. Jalankan `npm.cmd run admin:setup`, lalu isi username dan password (minimal 12 karakter). Input password disembunyikan.
3. Jalankan atau restart `npm.cmd run dev`, lalu buka http://localhost:3000.
4. Klik logo **BadmintonHub di header 5 kali dalam 2,5 detik** untuk membuka login.
5. Gunakan **Keluar Admin** untuk mengakhiri sesi.

Kredensial tersimpan di `.env.local` yang diabaikan Git. Untuk mengganti password, ulangi setup dan restart server. Sesi memakai cookie HttpOnly, berlaku 8 jam, dan hilang ketika server restart. Lima percobaan gagal dibatasi selama 15 menit per alamat IP.

Panel admin diberikan oleh server hanya setelah login. Data booking dan perubahan pengelolaan tetap merupakan demo di memori browser, belum disimpan atau disinkronkan ke database. Refresh/logout mengembalikan data demo. Sebelum dipakai untuk transaksi nyata, pindahkan data dan operasi admin ke API dengan pemeriksaan sesi di setiap operasi.

Login membutuhkan server Node yang menjalankan plugin autentikasi; mengunggah folder `dist` saja ke hosting statis tidak cukup. Untuk mencoba hasil build secara lokal: `npm.cmd run build`, lalu `npm.cmd run preview`. Pada hosting HTTPS melalui reverse proxy, set `ADMIN_COOKIE_SECURE=true`. Jangan menaruh `.env.local` atau folder `server` pada direktori publik.

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


