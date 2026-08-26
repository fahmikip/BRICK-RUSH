# BRICK RUSH -- Break & Upgrade

**BREAK. UPGRADE. DOMINATE.**

Game brick breaker klasik dengan sentuhan roguelike upgrade, sistem boss battle, dan progressions yang mendalam. Dibangun dengan vanilla JavaScript + Canvas 2D, mendukung PWA (Progressive Web App) untuk bermain secara offline.

**Author:** [fahmikip](https://github.com/fahmikip)

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Mode Permainan](#mode-permainan)
- [Jenis Bata (Brick)](#jenis-bata-brick)
- [Sistem Power-Up](#sistem-power-up)
- [Sistem Boss](#sistem-boss)
- [Sistem Elite](#sistem-elite)
- [Sistem Upgrade](#sistem-upgrade)
- [Sistem Combo](#sistem-combo)
- [Dunia / Area](#dunia--area)
- [Sistem Misi](#sistem-misi)
- [Tantangan Harian (Daily Challenge)](#tantangan-harian-daily-challenge)
- [Sistem Pencapaian (Achievement)](#sistem-pencapaian-achievement)
- [Koleksi Kozmetik](#koleksi-kozmetik)
- [Sistem Meta Progression](#sistem-meta-progression)
- [Event Kemarahan (Rage Events)](#event-kemarahan-rage-events)
- [Mata Uang](#mata-uang)
- [Cara Bermain](#cara-bermain)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Lisensi](#lisensi)

---

## Fitur Utama

- **3 Mode Permainan** -- Normal, Hardcore, dan Endurance
- **9 Jenis Bata** -- Normal, Strong, Armored, Explosive, Chain, Coin, Mystery, Regen, Turret
- **10 Power-Up** -- Multiball, Fireball, Bomb, Lightning, Magnet, Shield, Giant, Slow, 2x Coin, Berserk
- **6 Boss Unik** -- Masing-masing dengan fase, serangan, dan mekanik berbeda
- **4 Jenis Elite** -- Bata elite dengan HP dan reward tinggi
- **21 Upgrade Roguelike** -- 4 rarity (Common, Rare, Epic, Legendary) + 5 synergy
- **12 Upgrade Permanen** -- Meningkatkan statistik secara persisten antar run
- **7 Pola Level** -- Grid, Pyramid, Diamond, Checker, Fortress, Random, Ring
- **6 Dunia/Area** -- NEON CITY hingga GALAXY dengan boss unik masing-masing
- **Sistem Combo** -- Multiplier skor dan koin hingga x3 / x2
- **30 Pencapaian** -- 7 kategori pencapaian untuk diselesaikan
- **Misi Harian & Mingguan** -- 10 jenis misi dengan hadiah XP dan koin
- **Tantangan Harian** -- 10 modifier acak setiap hari dengan streak rewards
- **Koleksi Kozmetik** -- 6 skin bola + 6 skin paddle yang bisa dibuka
- **Meta Progression** -- Sistem XP, level pemain, dan title
- **Rage Events** -- 6 event acak di mode Hardcore yang mengganggu permainan
- **PWA** -- Dapat dimainkan secara offline
- **Audio Sintesis** -- 35+ efek suara menggunakan Web Audio API tanpa file audio eksternal

---

## Mode Permainan

### NORMAL
Mode permainan standar. Hanya 1 nyawa -- jika bola jatuh, permainan berakhir.

| Stat | Nilai |
|------|-------|
| Kecepatan Bola | x1.0 |
| Lebar Paddle | x1.0 |
| HP Musuh | x1.0 |
| Durasi Combo | x1.0 |
| Chance Power-Up | x1.0 |
| Score Multiplier | x1.0 |
| Nyawa | 1 |

### HARDCORE
Mode keras dengan tantangan ekstrem. Kecepatan bola lebih cepat, paddle lebih kecil, musuh lebih kuat, dan event kemarahan aktif.

| Stat | Nilai |
|------|-------|
| Kecepatan Bola | x1.6 |
| Lebar Paddle | x0.6 |
| HP Musuh | x2.0 |
| Durasi Combo | x0.4 |
| Chance Power-Up | x0.4 |
| Score Multiplier | x2.0 |
| Nyawa | 3 |
| Acak Sudut Bola | +8 derajat |
| Penalty Koin | -40% |
| Penalty Skor | -15% |
| Rage Events | Aktif |

### ENDURANCE
Mode ketahanan tanpa batas. Semakin jauh kamu melangkah, semakin sulit permainannya.

| Stat | Nilai |
|------|-------|
| Boss Setiap | 5 level |
| Elite Setiap | 3 wave |
| Difficulty Scale | +50% per level |
| Special Brick Cap | 60% |
| Score Multiplier | x1.5 |
| Coin Multiplier | x1.3 |

---

## Jenis Bata (Brick)

| Jenis | HP | Armor | Skor | Koin | Keterangan |
|-------|----|----|------|------|------------|
| **Normal** | 1 | 0 | 10 | 1 | Bata standar |
| **Strong** | 3 | 0 | 25 | 2 | Menampilkan angka HP |
| **Armored** | 3 | 2 | 30 | 2 | Armor menyerap damage terlebih dahulu |
| **Explosive** | 1 | 0 | 15 | 1 | Ledakan area saat hancur |
| **Chain** | 1 | 0 | 15 | 1 | Reaksi rantai mengenai bata terdekat |
| **Coin** | 1 | 0 | 10 | 5 | Jatuhkan 5 koin |
| **Mystery** | 1 | 0 | 20 | 3 | Efek acak saat hancur |
| **Regen** | 2 | 0 | 20 | 2 | Regenerasi +1 HP setiap 12 detik (Hardcore lv5+) |
| **Turret** | 2 | 0 | 30 | 3 | Tembak proyektil ke bawah setiap 4 detik (Hardcore lv8+) |

**Status Bata:**
- **HEALTHY** -- HP > 60%
- **DAMAGED** -- HP 30-60%
- **CRITICAL** -- HP < 30%
- **DESTROYING** -- Animasi kematian
- **DESTROYED** -- Hancur total

---

## Sistem Power-Up

| Power-Up | Durasi | Spawn % | Efek |
|----------|--------|---------|------|
| MULTIBALL | Instan | 8% | +2 bola (maks 5) |
| FIREBALL | 8 detik | 7% | Bola menembus bata |
| BOMB | Instan | 8% | Ledakan damage area |
| LIGHTNING | Instan | 6% | Serangan rantai ke 5 bata acak |
| MAGNET | 8 detik | 8% | Tarik bola ke arah paddle |
| SHIELD | Instan | 7% | Selamatkan bola dari jatuh sekali |
| GIANT | 10 detik | 7% | Lebar paddle +80% |
| SLOW | 6 detik | 7% | Kecepatan bola -40% |
| 2x COIN | 15 detik | 7% | Koin ganda |
| BERSERK | 8 detik | 5% | +100% damage, +20% crit chance |

---

## Sistem Boss

Setiap area memiliki boss unik dengan fase-fase berbeda.

| Boss | Area | HP Dasar | Shield | Kecepatan | Serangan CD | Weak Point | Fase |
|------|------|----------|--------|-----------|-------------|------------|------|
| THE CORE | NEON CITY | 5.000 | 1.500 | 80 | 3000ms | x2.0 | 4 |
| HEX GUARDIAN | CYBER CORE | 8.000 | 2.000 | 90 | 2800ms | x2.0 | 3 |
| VOID WALKER | VOID SPACE | 12.000 | 3.000 | 100 | 2500ms | x2.5 | 2 |
| MOLTEN LORD | LAVA ZONE | 18.000 | 4.000 | 95 | 2200ms | x2.0 | 2 |
| FROST QUEEN | ICE PLANET | 25.000 | 5.000 | 110 | 2000ms | x2.5 | 2 |
| GALACTIC CORE | GALAXY | 35.000 | 7.000 | 120 | 1800ms | x3.0 | 2 |

**Mekanik Boss:**
- **Shield** menyerap 50% damage, regenerasi setelah 5 detik tidak diserang
- **Weak Point** mengorbit boss, aktif 4 detik lalu cooldown 8 detik
- **Tipe Serangan:** Projectile, Spawn Minions, Laser, Shockwave
- **Pola Pergerakan:** Lurus, Sinusoidal, Centering

**Hadiah Boss (First Clear):**
- THE CORE: 1.000 koin, 1 token, 500 skor
- GALACTIC CORE: 5.000 koin, 10 token, 10.000 skor

---

## Sistem Elite

| Elite | HP Multiplier | Score | Koin | Keterangan |
|-------|---------------|-------|------|------------|
| Elite Strong | x5 | x3 | x3 | HP tinggi |
| Elite Explosive | x2 | x2 | x2 | Ledakan radius besar (200px) |
| Elite Chain | x2 | x2 | x2 | Serangan rantai (5 hit) |
| Elite Shield | x3 (+3 armor) | x3 | x3 | Armor berat |

**Bonus Elite Wave:** x2 reward multiplier, +15% power-up chance

---

## Sistem Upgrade

### Upgrade Roguelike (Sementara)

21 upgrade yang didapat selama bermain, dengan 4 tingkat rarity:

| Rarity | Bobot | Contoh |
|--------|-------|--------|
| COMMON | 60 | DAMAGE CORE, PADDLE WIDTH, COIN BONUS |
| RARE | 25 | CRITICAL DAMAGE, SHIELD GENERATOR, CHAIN CORE |
| EPIC | 10 | PIERCING SHOT, BALL SAVE, FROZEN SHARD |
| LEGENDARY | 5 | BERSERK, MULTIBALL+ |

**Kategori Upgrade:**
- **Attack:** Damage, Crit Chance, Crit Damage, Ball Speed, Piercing, Fire Damage, Berserk
- **Defense:** Paddle Width, Paddle Speed, Shield, Ball Save
- **Economy:** Coin Bonus, Score Bonus, Reward Bonus
- **Special:** Magnet, Explosion Radius, Lightning, Chain, Power-Up Luck, Power-Up Duration, Multiball+, Frozen Shard

**Diminishing Returns:** Setiap level mengurangi efektivitas sebesar 8% (minimum 50%).

### Synergy (5 Total)

| Synergy | Kombinasi | Efek |
|---------|-----------|------|
| INFERNO | Fire Damage + Piercing + Explosion Radius | +25% Damage |
| EXECUTIONER | Critical Core + Critical Damage + Berserk | +15% Crit Damage |
| CHAIN REACTION | Chain Chance + Lightning + Explosion Radius | +20% Chain + Explosion |
| TREASURE HUNTER | Coin Bonus + Score Bonus + Reward Bonus | +30% Coin Gain |
| FORTRESS | Shield + Paddle Width + Ball Save | Auto Shield + Width |

### Upgrade Permanen (12 Total)

| Upgrade | Kategori | Biaya Awal | Efek/Level |
|---------|----------|------------|------------|
| STARTING DAMAGE | Attack | 100 | +5% base damage |
| STARTING CRITICAL | Attack | 120 | +2% crit chance |
| CRITICAL DAMAGE | Attack | 150 | +8% crit damage |
| STARTING WIDTH | Defense | 80 | +5% paddle width |
| PADDLE SPEED | Defense | 100 | +5% paddle speed |
| STARTING SHIELD | Defense | 500 | Mulai dengan shield |
| COIN BOOST | Economy | 100 | +5% coin gain |
| SCORE BOOST | Economy | 100 | +5% score |
| REWARD MULTIPLIER | Economy | 200 | +8% all rewards |
| POWER-UP LUCK | Special | 150 | +3% power-up chance |
| POWER-UP TIME | Special | 120 | +8% duration |
| STARTING SPEED | Special | 120 | +3% ball speed |

**Rumus Biaya:** `baseCost x growthRate ^ currentLevel`

---

## Sistem Combo

- **Timer:** 3 detik (reset saat bola menyentuh paddle)
- **Score Multiplier:** x1 (0-1) -> x1.1 (2-3) -> x1.35-1.65 (4-5) -> x1.6-2.1 (6-10) -> x3 (10+)
- **Coin Multiplier:** x1 -> x1.05-1.2 (2-5) -> x2 (5+)
- **Milestone:** 5 (GOOD!), 10 (GREAT!), 25 (AMAZING!), 50 (INSANE!), 100 (UNSTOPPABLE!)

---

## Dunia / Area

| # | Nama | Warna Aksen | Boss |
|---|------|-------------|------|
| 0 | NEON CITY | #00f0ff | THE CORE |
| 1 | CYBER CORE | #00ff44 | HEX GUARDIAN |
| 2 | VOID SPACE | #aa00ff | VOID WALKER |
| 3 | LAVA ZONE | #ff4400 | MOLTEN LORD |
| 4 | ICE PLANET | #00ccff | FROST QUEEN |
| 5 | GALAXY | #ff00aa | GALACTIC CORE |

**Progression:** Area berubah setiap 5 level (normal) atau 3 level (endurance).

**7 Pola Level:**
1. **Grid** -- Grid penuh
2. **Pyramid** -- Bentuk segitiga
3. **Diamond** -- Bentuk berlian
4. **Checker** -- Pola catur
5. **Fortress** -- Border + blok dalam
6. **Random** -- Isi 75% acak
7. **Ring** -- Cincin melingkar

---

## Sistem Misi

### 10 Jenis Misi

| Jenis | Target Harian | Target Mingguan | Hadiah XP | Hadiah Koin |
|-------|--------------|-----------------|-----------|-------------|
| Hancurkan Bata | 50-200 | 500-2.000 | 100 | 100 |
| Capai Combo | x10-x40 | x50-x150 | 80 | 80 |
| Kumpulkan Koin | 200-800 | 2.000-8.000 | 80 | 60 |
| Gunakan Power-Up | 3-12 | 15-50 | 75 | 75 |
| Critical Hit | 10-40 | 50-200 | 80 | 70 |
| Selesaikan Level | 2-8 | 10-30 | 120 | 100 |
| Kalahkan Elite | 1-5 | 3-15 | 100 | 90 |
| Kalahkan Boss | 1-2 | 1-5 | 200 | 200 |
| Raih Skor | 10K-50K | 100K-500K | 100 | 100 |
| Waktu Bermain | 10-30 mnt | 30-120 mnt | 60 | 50 |

- **3 Misi harian** dihasilkan setiap hari (seeded RNG, deterministik)
- **3 Misi mingguan** dihasilkan setiap minggu
- Hadiah mingguan: 3x koin dan 3x XP dibandingkan harian

---

## Tantangan Harian (Daily Challenge)

10 modifier yang dipilih secara acak setiap hari:

| Modifier | Efek |
|----------|------|
| FIRE ONLY | Fireball lebih sering (+30% power-up chance) |
| SPEED RUN | Kecepatan bola +50% |
| GIANT BRICKS | HP bata x2 (damage +50% untuk kompensasi) |
| ONE BALL | Tidak ada power-up multiball |
| CHAOS | Pola bata acak setiap wave |
| CRITICAL | Crit chance +50% |
| LOW GRAVITY | Bola memantul lebih tinggi (-15% speed, +15% paddle) |
| DOUBLE COINS | Koin x2 |
| ELITE | Lebih banyak bata elite (+30%) |
| BERSERK | Damage +100% |

**Streak Rewards:**
- 3 hari: +300 koin, +100 XP
- 7 hari: +1.000 koin, +200 XP
- 14 hari: +2.500 koin, +300 XP
- 30 hari: +5.000 koin, +500 XP + **Skin Kozmetik**

---

## Sistem Pencapaian (Achievement)

### Combat (5)
- FIRST BREAK -- Hancurkan 1 bata (50 koin, 25 XP)
- BRICK BREAKER -- Hancurkan 100 bata (200, 50)
- DEMOLITION -- Hancurkan 1.000 bata (500, 100)
- BRICK DESTROYER -- Hancurkan 10.000 bata (2.000, 250)
- BRICK ANNIHILATOR -- Hancurkan 50.000 bata (5.000, 500)

### Combo (5)
- COMBO STARTER -- Combo x10 (100, 50)
- COMBO KING -- Combo x25 (300, 75)
- INSANE -- Combo x50 (500, 100)
- UNSTOPPABLE -- Combo x100 (1.000, 200)
- COMBO GOD -- Combo x250 (2.500, 400)

### Economy (4)
- SAVER -- 1.000 koin (100, 30)
- RICH -- 10.000 koin (500, 75)
- MILLIONAIRE -- 100.000 koin (2.000, 200)
- TYCOON -- 1.000.000 koin (5.000, 500)

### Boss (5)
- BOSS HUNTER -- Kalahkan 1 boss (300, 75)
- BOSS SLAYER -- Kalahkan 5 boss (1.000, 150)
- BOSS MASTER -- Kalahkan 10 boss (2.000, 300)
- BOSS DESTROYER -- Kalahkan 25 boss (5.000, 500)
- BOSS CONQUEROR -- Kalahkan semua 6 boss (10.000, 1.000)

### Power-Up (3)
- POWER UP -- Gunakan 1 power-up (50, 25)
- POWER COLLECTOR -- Gunakan 50 power-up (300, 75)
- POWER ADDICT -- Gunakan 200 power-up (1.000, 200)

### Progression (5)
- RISING STAR -- Level 5 (200, 50)
- VETERAN -- Level 10 (500, 100)
- ELITE -- Level 25 (2.000, 300)
- LEGENDARY -- Level 50 (5.000, 500)
- BRICK GOD -- Level 100 (10.000, 1.000)

### Special (3)
- MILLIONAIRE SCORE -- Skor 1.000.000 (2.000, 300)
- ENDURANCE -- Capai wave 50 (1.000, 200)
- DEDICATED -- Selesaikan 100 run (3.000, 400)

---

## Koleksi Kozmetik

### Skin Bola

| Nama | Warna | Keterangan | Cara Buka |
|------|-------|------------|-----------|
| CLASSIC | #00f0ff | Default | Selalu tersedia |
| NEON | #00ff88 | Hijau neon | Combo x25 |
| PLASMA | #aa44ff | Energi plasma ungu | Hancurkan 1.000 bata |
| FIRE | #ff4400 | Bola api | Kumpulkan 5.000 koin |
| ICE | #88ddff | Kristal es | Capai Level 15 |
| GALAXY | #ff00aa | Energi galaksi | Capai Level 25 |

### Skin Paddle

| Nama | Warna | Keterangan | Cara Buka |
|------|-------|------------|-----------|
| CLASSIC | #00f0ff | Default | Selalu tersedia |
| NEON | #00ff88 | Hijau neon | Main 50 run |
| CYBER | #00ff44 | Krom hijau cyber | Combo x50 |
| FIRE | #ff4400 | Paddle api | Hancurkan 5.000 bata |
| ICE | #00ccff | Paddle es | Capai Level 20 |
| VOID | #aa44ff | Energi void | Kumpulkan 25.000 koin |

---

## Sistem Meta Progression

### XP per Aksi

| Aksi | XP |
|------|----|
| Bata hancur | 1 |
| Critical hit | 2 |
| Elite wave selesai | 10 |
| Boss dikalahkan | 100 |
| Level selesai | 25 |
| Misi selesai | 100 |
| Pencapaian terbuka | 50 |
| Daily challenge selesai | 50 |
| Combo x5 | 5 |
| Combo x10 | 10 |
| Combo x25 | 25 |
| Combo x50 | 50 |
| Combo x100 | 100 |

### Level-Up

- **Rumus XP:** `50 x level x (level - 1)`
- **Hadiah per level:** `level x 50` koin
- **Setiap 5 level:** Core Tokens
- **Setiap 10 level:** +1 Perm Upgrade Token

### Title

| Level | Title |
|-------|-------|
| 5 | Brick Breaker |
| 10 | Destroyer |
| 25 | Combo Master |
| 50 | Neon Legend |
| 100 | Brick God |

---

## Event Kemarahan (Rage Events)

**Hanya di Mode Hardcore.** Trigger setiap 15-30 detik.

| Event | Durasi | Efek |
|-------|--------|------|
| PADDLE SHRINK | 5 detik | Lebar paddle dikurangi 60% |
| BALL SLOW | 4 detik | Kecepatan bola dikurangi 50% |
| BLIND SPOTS | 4 detik | 2-3 zona gelap menghalangi pandangan |
| REVERSE | 3 detik | Kontrol kiri/kanan dibalik |
| VIBRATE | 5 detik | Guncangan layar terus-menerus |
| GHOST BALL | 3 detik | Bola menjadi tidak terlihat (trail terlihat) |

Setiap event memiliki 1 detik fase peringatan sebelum aktif. Dapat diaktifkan/nonaktifkan di pengaturan.

---

## Mata Uang

| Mata Uang | Simbol | Kegunaan |
|-----------|--------|----------|
| **Koin** | ● | Upgrade permanen, pembelian shop |
| **Core Tokens** | ♦ | Didapat dari boss first clear dan hadiah level-up |
| **XP** | -- | Progression level pemain (meta) |

---

## Cara Bermain

### Kontrol

- **Mouse/Touch:** Gerakkan paddle mengikuti posisi kursor/jari
- **Keyboard:** Arrow Keys / A, D untuk menggerakkan paddle
- **Click/Tap/Space:** Lepaskan bola
- **ESC/P:** Pause

### Tips

1. Jangan remehkan combo -- multiplier skor dan koin meningkat drastis
2. Pilih upgrade yang saling melengkapi untuk mengaktifkan synergy
3. Manfaatkan weak point boss untuk damage maksimal
4. Koin awal lebih baik diinvestasikan ke upgrade permanen daripada upgrade sementara
5. Mode Endurance cocok untuk farming XP dan koin

---

## Teknologi

- **Vanilla JavaScript** (tanpa framework)
- **Canvas 2D** untuk rendering
- **Web Audio API** untuk audio sintesis (tanpa file audio eksternal)
- **Service Worker** untuk PWA dan offline support
- **localStorage** untuk save data

---

## Instalasi

### Online
Kunjungi: `https://fahmikip.github.io/BRICK-RUSH/`

### Offline / Local Development

```bash
git clone https://github.com/fahmikip/BRICK-RUSH.git
cd BRICK-RUSH

# Gunakan server lokal (PWA membutuhkan HTTP server)
# Menggunakan Python:
python -m http.server 8000

# Atau menggunakan Node.js:
npx http-server -p 8000

# Buka browser ke http://localhost:8000
```

### Install sebagai PWA

1. Buka game di browser (Chrome/Edge/Safari)
2. Klik ikon "Install" atau "Add to Home Screen"
3. Game akan tersedia seperti aplikasi native

---

## Struktur Proyek

```
BRICK-RUSH/
├── index.html              -- Halaman utama game
├── manifest.json           -- Konfigurasi PWA
├── sw.js                   -- Service Worker untuk offline
├── css/
│   ├── style.css           -- Style utama
│   ├── menu.css            -- Style menu
│   ├── game.css            -- Style game dan HUD
│   └── responsive.css      -- Responsive design
└── js/
    ├── main.js             -- Bootstrap dan inisialisasi
    ├── game.js             -- Game loop utama
    ├── ball.js             -- Kelas bola
    ├── paddle.js           -- Kelas paddle
    ├── brick.js            -- 9 jenis bata
    ├── brickManager.js     -- Manajemen lifecycle bata
    ├── physics.js          -- Deteksi tabrakan
    ├── level.js            -- Generator level dan wave
    ├── runManager.js       -- Manajemen state run
    ├── boss.js             -- Sistem boss
    ├── bossConfig.js       -- Konfigurasi 6 boss
    ├── eliteManager.js     -- Sistem elite
    ├── worldManager.js     -- Manajemen area/dunia
    ├── powerups.js         -- 10 tipe power-up
    ├── upgrades.js         -- 21 upgrade + 12 permanent
    ├── upgradeManager.js   -- Manajemen upgrade roguelike
    ├── permanentUpgradeManager.js -- Upgrade permanen
    ├── buildManager.js     -- Kalkulasi statistik
    ├── combo.js            -- Sistem combo
    ├── particles.js        -- Sistem partikel
    ├── effects.js          -- Efek visual
    ├── juice.js            -- Screen shake, flash, slow-mo
    ├── audio.js            -- Sintesis audio (35+ efek)
    ├── input.js            -- Input touch/mouse/keyboard
    ├── events.js           -- Event emitter
    ├── eventQueue.js       -- Antrian event tertunda
    ├── storage.js          -- Save/load localStorage
    ├── seedRandom.js       -- RNG seeded untuk daily/mission
    ├── ui.js               -- Manajemen UI dan layar
    ├── metaProgression.js  -- Sistem XP dan level pemain
    ├── missionManager.js   -- Misi harian dan mingguan
    ├── achievementManager.js -- 30 pencapaian
    ├── dailyChallenge.js   -- Tantangan harian
    ├── hardcoreManager.js  -- Konfigurasi mode hardcore
    ├── enduranceManager.js -- Konfigurasi mode endurance
    ├── rageEvents.js       -- 6 event kemarahan
    ├── unlockManager.js    -- 17 definisi unlock
    ├── collectionManager.js -- Koleksi kozmetik
    ├── notificationManager.js -- Notifikasi toast
    ├── reward.js           -- Kalkulasi reward
    ├── rewardQueue.js      -- Antrian reward
    └── reward.js           -- Kalkulasi reward
```

---

## Statistik Proyek

| Komponen | Jumlah |
|----------|--------|
| File JavaScript | 42 |
| File CSS | 4 |
| File HTML | 1 |
| File Config | 2 |
| Total File | 49 |
| Jenis Bata | 9 |
| Tipe Power-Up | 10 |
| Boss | 6 |
| Upgrade Roguelike | 21 |
| Upgrade Permanen | 12 |
| Pencapaian | 30 |
| Efek Suara | 35+ |
| Pola Level | 7 |
| Dunia/Area | 6 |

---

Dibuat dengan penuh semangat oleh [fahmikip](https://github.com/fahmikip)
