// =========================================================
// KONFIGURASI FIREBASE UNTUK WEB
// =========================================================
// File ini WAJIB diisi dengan konfigurasi "Web App" dari project
// Firebase kamu (BEDA dengan konfigurasi Android yang dipakai di
// aplikasi FlutLab).
//
// Cara mendapatkannya:
// 1. Buka https://console.firebase.google.com
// 2. Pilih project "pengaduan-sarana-f7479"
// 3. Klik ikon gerigi ⚙️ -> Project settings
// 4. Scroll ke "Your apps" -> jika belum ada app Web (ikon "</>"),
//    klik "Add app" -> pilih ikon Web "</>" -> beri nama bebas,
//    misalnya "Admin Web" -> Register app
// 5. Firebase akan menampilkan kode seperti di bawah ini berisi
//    apiKey, authDomain, dst -> salin nilainya ke sini
// =========================================================

const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_WEB_ANDA",
  authDomain: "pengaduan-sarana-f7479.firebaseapp.com",
  projectId: "pengaduan-sarana-f7479",
  storageBucket: "pengaduan-sarana-f7479.firebasestorage.app",
  messagingSenderId: "GANTI_DENGAN_SENDER_ID_ANDA",
  appId: "GANTI_DENGAN_APP_ID_WEB_ANDA"
};

firebase.initializeApp(firebaseConfig);
