// =========================================================
// Aplikasi Admin Pengaduan Sarana Sekolah (Web)
// =========================================================

const auth = firebase.auth();
const db = firebase.firestore();

// ---------- Elemen ----------
const viewLogin = document.getElementById('viewLogin');
const viewDashboard = document.getElementById('viewDashboard');

const formLogin = document.getElementById('formLogin');
const inputUsername = document.getElementById('inputUsername');
const inputPassword = document.getElementById('inputPassword');
const loginError = document.getElementById('loginError');
const btnLogin = document.getElementById('btnLogin');

const btnLogout = document.getElementById('btnLogout');

const filterNis = document.getElementById('filterNis');
const filterKategori = document.getElementById('filterKategori');
const filterStatus = document.getElementById('filterStatus');
const filterTanggal = document.getElementById('filterTanggal');
const btnResetFilter = document.getElementById('btnResetFilter');

const listAspirasiEl = document.getElementById('listAspirasi');
const emptyState = document.getElementById('emptyState');

const countMenunggu = document.getElementById('countMenunggu');
const countProses = document.getElementById('countProses');
const countSelesai = document.getElementById('countSelesai');
const countTotal = document.getElementById('countTotal');

const modalOverlay = document.getElementById('modalOverlay');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnBatalModal = document.getElementById('btnBatalModal');
const btnSimpanModal = document.getElementById('btnSimpanModal');
const modalError = document.getElementById('modalError');

const detailKategori = document.getElementById('detailKategori');
const detailNis = document.getElementById('detailNis');
const detailLokasi = document.getElementById('detailLokasi');
const detailTanggal = document.getElementById('detailTanggal');
const detailKet = document.getElementById('detailKet');
const detailFotoWrap = document.getElementById('detailFotoWrap');
const detailFoto = document.getElementById('detailFoto');
const editStatus = document.getElementById('editStatus');
const editFeedback = document.getElementById('editFeedback');

// ---------- State ----------
let semuaAspirasi = [];   // cache seluruh data dari Firestore (realtime)
let idSedangDiedit = null;

// =========================================================
// AUTENTIKASI
// =========================================================

function usernameToEmail(username) {
  return `${username.trim()}@admin.sekolah.id`;
}

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  btnLogin.disabled = true;
  btnLogin.querySelector('.btn-label').textContent = 'Memproses...';

  const username = inputUsername.value.trim();
  const password = inputPassword.value.trim();

  try {
    const email = usernameToEmail(username);
    const cred = await auth.signInWithEmailAndPassword(email, password);

    // Pastikan akun ini benar-benar terdaftar sebagai admin di Firestore
    const doc = await db.collection('admin').doc(username).get();
    if (!doc.exists) {
      await auth.signOut();
      throw new Error('Akun admin tidak ditemukan di database.');
    }
  } catch (err) {
    loginError.textContent = pesanErrorLogin(err);
    loginError.hidden = false;
  } finally {
    btnLogin.disabled = false;
    btnLogin.querySelector('.btn-label').textContent = 'Masuk';
  }
});

function pesanErrorLogin(err) {
  const code = err.code || '';
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Username atau password salah.';
  }
  if (code.includes('invalid-email')) {
    return 'Format username tidak valid.';
  }
  return err.message || 'Login gagal, coba lagi.';
}

btnLogout.addEventListener('click', () => auth.signOut());

// Auto-login: kalau sesi masih tersimpan di browser, langsung ke dashboard
auth.onAuthStateChanged((user) => {
  const isAdmin = user && user.email && user.email.endsWith('@admin.sekolah.id');
  if (isAdmin) {
    tampilkanDashboard();
  } else {
    tampilkanLogin();
  }
});

function tampilkanLogin() {
  viewLogin.hidden = false;
  viewDashboard.hidden = true;
  lepasListener();
}

function tampilkanDashboard() {
  viewLogin.hidden = true;
  viewDashboard.hidden = false;
  pasangListener();
  muatKategoriFilter();
}

// =========================================================
// DATA: KATEGORI (untuk dropdown filter)
// =========================================================

function muatKategoriFilter() {
  db.collection('kategori').orderBy('ket_kategori').onSnapshot((snap) => {
    filterKategori.innerHTML = '<option value="">Semua Kategori</option>';
    snap.forEach((doc) => {
      const opt = document.createElement('option');
      opt.value = doc.data().ket_kategori;
      opt.textContent = doc.data().ket_kategori;
      filterKategori.appendChild(opt);
    });
  });
}

// =========================================================
// DATA: ASPIRASI (realtime)
// =========================================================

let unsubscribeAspirasi = null;

function pasangListener() {
  unsubscribeAspirasi = db.collection('aspirasi')
    .orderBy('tanggal', 'desc')
    .onSnapshot((snap) => {
      semuaAspirasi = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderRingkasan();
      renderList();
    }, (err) => {
      listAspirasiEl.innerHTML = `<p class="form-error">Gagal memuat data: ${err.message}</p>`;
    });
}

function lepasListener() {
  if (unsubscribeAspirasi) unsubscribeAspirasi();
}

// ---------- Ringkasan status ----------
function renderRingkasan() {
  const jumlah = { Menunggu: 0, Proses: 0, Selesai: 0 };
  semuaAspirasi.forEach((a) => { if (jumlah[a.status] !== undefined) jumlah[a.status]++; });
  countMenunggu.textContent = jumlah.Menunggu;
  countProses.textContent = jumlah.Proses;
  countSelesai.textContent = jumlah.Selesai;
  countTotal.textContent = semuaAspirasi.length;
}

// ---------- Filter + render list ----------
[filterNis, filterKategori, filterStatus, filterTanggal].forEach((el) =>
  el.addEventListener('input', renderList)
);
btnResetFilter.addEventListener('click', () => {
  filterNis.value = '';
  filterKategori.value = '';
  filterStatus.value = '';
  filterTanggal.value = '';
  renderList();
});

function renderList() {
  const nisQuery = filterNis.value.trim();
  const kategoriQuery = filterKategori.value;
  const statusQuery = filterStatus.value;
  const tanggalQuery = filterTanggal.value; // format YYYY-MM-DD

  const hasil = semuaAspirasi.filter((a) => {
    if (nisQuery && !String(a.nis || '').includes(nisQuery)) return false;
    if (kategoriQuery && a.nama_kategori !== kategoriQuery) return false;
    if (statusQuery && a.status !== statusQuery) return false;
    if (tanggalQuery) {
      const tgl = a.tanggal && a.tanggal.toDate ? a.tanggal.toDate() : null;
      if (!tgl) return false;
      const tglStr = tgl.toISOString().slice(0, 10);
      if (tglStr !== tanggalQuery) return false;
    }
    return true;
  });

  listAspirasiEl.innerHTML = '';

  if (hasil.length === 0) {
    emptyState.hidden = false;
    listAspirasiEl.appendChild(emptyState);
    return;
  }
  emptyState.hidden = true;

  hasil.forEach((a) => listAspirasiEl.appendChild(buatKartuAspirasi(a)));
}

function buatKartuAspirasi(a) {
  const tgl = a.tanggal && a.tanggal.toDate ? a.tanggal.toDate() : new Date();
  const tglFormat = tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const jamFormat = tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const card = document.createElement('div');
  card.className = 'aspirasi-card';
  card.innerHTML = `
    <div class="aspirasi-accent status-accent-${a.status}"></div>
    <div class="aspirasi-body">
      <div class="aspirasi-top-row">
        <div class="aspirasi-kategori">${escapeHtml(a.nama_kategori || '-')}</div>
        <span class="status-badge status-${a.status}">${labelStatus(a.status)}</span>
      </div>
      <div class="aspirasi-meta">NIS ${escapeHtml(a.nis || '-')} · ${escapeHtml(a.lokasi || '-')}</div>
      <div class="aspirasi-ket">${escapeHtml(a.ket || '')}</div>
      <div class="aspirasi-footer">
        <span>📅 ${tglFormat}</span>
        <span>🕒 ${jamFormat}</span>
      </div>
    </div>
  `;
  card.addEventListener('click', () => bukaModal(a));
  return card;
}

function labelStatus(s) {
  if (s === 'Proses') return 'Diproses';
  if (s === 'Selesai') return 'Selesai';
  return 'Menunggu';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Warna aksen kiri kartu sesuai status (dipetakan lewat CSS var inline)
const styleAksen = document.createElement('style');
styleAksen.textContent = `
  .status-accent-Menunggu { background: var(--status-menunggu); }
  .status-accent-Proses { background: var(--status-proses); }
  .status-accent-Selesai { background: var(--status-selesai); }
`;
document.head.appendChild(styleAksen);

// =========================================================
// MODAL DETAIL & UMPAN BALIK
// =========================================================

function bukaModal(a) {
  idSedangDiedit = a.id;
  modalError.hidden = true;

  detailKategori.textContent = a.nama_kategori || '-';
  detailNis.textContent = a.nis || '-';
  detailLokasi.textContent = a.lokasi || '-';

  const tgl = a.tanggal && a.tanggal.toDate ? a.tanggal.toDate() : new Date();
  detailTanggal.textContent = tgl.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  detailKet.textContent = a.ket || '';

  if (a.foto_base64) {
    detailFoto.src = `data:image/jpeg;base64,${a.foto_base64}`;
    detailFotoWrap.hidden = false;
  } else {
    detailFotoWrap.hidden = true;
  }

  editStatus.value = a.status || 'Menunggu';
  editFeedback.value = a.feedback || '';

  modalOverlay.hidden = false;
}

function tutupModal() {
  modalOverlay.hidden = true;
  idSedangDiedit = null;
}

btnCloseModal.addEventListener('click', tutupModal);
btnBatalModal.addEventListener('click', tutupModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) tutupModal();
});

btnSimpanModal.addEventListener('click', async () => {
  if (!idSedangDiedit) return;

  btnSimpanModal.disabled = true;
  btnSimpanModal.querySelector('.btn-label').textContent = 'Menyimpan...';
  modalError.hidden = true;

  try {
    await db.collection('aspirasi').doc(idSedangDiedit).update({
      status: editStatus.value,
      feedback: editFeedback.value.trim(),
      sudah_dibaca: false, // supaya siswa dapat notifikasi di aplikasi Android
    });
    tutupModal();
  } catch (err) {
    modalError.textContent = 'Gagal menyimpan: ' + err.message;
    modalError.hidden = false;
  } finally {
    btnSimpanModal.disabled = false;
    btnSimpanModal.querySelector('.btn-label').textContent = 'Simpan Perubahan';
  }
});
