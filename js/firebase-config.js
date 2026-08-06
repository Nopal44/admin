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
 const firebaseConfig = {
  apiKey: "AIzaSyDMHdeZ_MxLpsXvAv3I2wG6c2Lwts10J_0",
  authDomain: "pengaduan-sarana-f7479.firebaseapp.com",
  databaseURL: "https://pengaduan-sarana-f7479-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pengaduan-sarana-f7479",
  storageBucket: "pengaduan-sarana-f7479.firebasestorage.app",
  messagingSenderId: "122902024930",
  appId: "1:122902024930:web:e2a728b6efaf2d6806c4bb"
};

firebase.initializeApp(firebaseConfig);
