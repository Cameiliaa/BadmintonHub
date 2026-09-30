// Global Application State
const AppState = {
  currentRole: 'PENYEWA', // 'PENYEWA' or 'ADMIN'
  adminTab: 'bookings', // 'bookings', 'courts', 'products', 'facilities'
  selectedDateIndex: 0,
  adminSelectedDateIndex: 0,
  rescheduleTargetBookingId: null,
  rescheduleTargetSlot: null,
  hours: [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
    '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
    '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00'
  ],
  dates: [
    { key: '2026-09-28', label: 'Senin, 28 Sep', short: 'SEN 28 Sep' },
    { key: '2026-09-29', label: 'Selasa, 29 Sep', short: 'SEL 29 Sep' },
    { key: '2026-09-30', label: 'Rabu, 30 Sep', short: 'RAB 30 Sep' },
    { key: '2026-10-01', label: 'Kamis, 1 Okt', short: 'KAM 1 Okt' },
    { key: '2026-10-02', label: 'Jumat, 2 Okt', short: 'JUM 2 Okt' },
    { key: '2026-10-03', label: 'Sabtu, 3 Okt', short: 'SAB 3 Okt' },
    { key: '2026-10-04', label: 'Minggu, 4 Okt', short: 'MIN 4 Okt' },
  ],
  courts: [
    {
      id: 'court-1',
      name: 'Court 1 VIP Indoor',
      type: 'VIP Tournament Edition',
      spec: 'Karpet Vinyl PBSI Li-Ning Hijau · Full AC & LED 800 Lux · Ruang Duduk VIP',
      basePrice: 70000,
      isLocked: false
    },
    {
      id: 'court-2',
      name: 'Court 2 Standard Indoor',
      type: 'Standard Tournament',
      spec: 'Karpet Vinyl PBSI Yonex Hijau · Exhaust Blower Sirkulasi · LED 700 Lux',
      basePrice: 50000,
      isLocked: false
    },
    {
      id: 'court-3',
      name: 'Court 3 Training Indoor',
      type: 'Training & Regular',
      spec: 'Karpet Vinyl PBSI Victor Hijau · Plafon Tinggi 12m · Pencahayaan Merata',
      basePrice: 45000,
      isLocked: false
    }
  ],
  // Booked slots registry by Date + Court + Time
  bookedSlots: {
    '2026-09-28': {
      'court-1': ['19:00 - 20:00', '20:00 - 21:00'],
      'court-2': ['19:00 - 20:00', '20:00 - 21:00'],
      'court-3': ['16:00 - 17:00', '17:00 - 18:00']
    },
    '2026-09-29': {
      'court-1': ['19:00 - 20:00', '20:00 - 21:00'],
      'court-2': ['10:00 - 11:00'],
      'court-3': []
    },
    '2026-09-30': {
      'court-1': ['18:00 - 19:00'],
      'court-2': [],
      'court-3': []
    }
  },
  // Equipment Store Items
  products: [
    {
      id: 'prod-raket',
      name: 'Sewa Raket Pro',
      price: 15000,
      unit: 'unit / sesi',
      desc: 'High-end carbon graphite dengan senaran turnamen 28 lbs.',
      image: '/images/badminton_racket_pro_1790574262416.jpg'
    },
    {
      id: 'prod-kok',
      name: 'Beli Shuttlecock (1 Slop)',
      price: 90000,
      unit: 'slop (isi 12 kok)',
      desc: 'Kok bulu angsa pilihan standar PBSI, laju stabil dan tahan banting.',
      image: '/images/shuttlecock_slop_1790574273437.jpg'
    },
    {
      id: 'prod-air',
      name: 'Air Mineral 600ml',
      price: 5000,
      unit: 'botol dingin',
      desc: 'Air mineral dingin higienis untuk menjaga hidrasi selama tanding.',
      image: '/images/mineral_water_bottle_1790574285717.jpg'
    }
  ],
  // Venue Facilities
  facilities: [
    {
      id: 'fac-1',
      title: 'LED High-Glare 800 Lux',
      desc: 'Pencahayaan terstandarisasi turnamen tanpa silau dari segala sudut lapangan, aman untuk smash tinggi.',
      icon: 'sun-medium'
    },
    {
      id: 'fac-2',
      title: 'Shower Air Panas',
      desc: 'Kamar bilas bersih, terawat setiap jam, dilengkapi pemanas air dan loker penyimpanan berbobot.',
      icon: 'shower-head'
    },
    {
      id: 'fac-3',
      title: 'Free High-Speed WiFi',
      desc: 'Koneksi internet serat optik 100 Mbps di seluruh area penonton, ruang tunggu ber-AC, dan kafetaria.',
      icon: 'wifi'
    },
    {
      id: 'fac-4',
      title: 'Parkir Luas & Aman',
      desc: 'Area parkir sanggup menampung 40+ mobil dan 80 motor dengan pengawasan CCTV 24 jam dan petugas ramah.',
      icon: 'shield-check'
    }
  ],
  // Shopping Cart Items
  cart: [],
  // Admin verification queue
  adminBookings: [
    {
      id: 'BHUB-2026-7731',
      name: 'Rian Ardianto',
      phone: '081299887766',
      email: 'rian.ardianto@badmintonhub.id',
      details: 'Court 1 VIP Indoor (19:00 - 21:00) · 2 Jam + 1 Raket Pro',
      courtSlots: [
        { courtId: 'court-1', courtName: 'Court 1 VIP Indoor', dateKey: '2026-09-28', dateLabel: 'Senin, 28 Sep', time: '19:00 - 20:00', price: 70000 },
        { courtId: 'court-1', courtName: 'Court 1 VIP Indoor', dateKey: '2026-09-28', dateLabel: 'Senin, 28 Sep', time: '20:00 - 21:00', price: 70000 }
      ],
      addons: [{ name: 'Sewa Raket Pro', qty: 1, price: 15000 }],
      total: 155000,
      proofUploaded: true,
      status: 'Menunggu Verifikasi',
      adminNote: ''
    },
    {
      id: 'BHUB-2026-8842',
      name: 'Kevin Sanjaya',
      phone: '081388776655',
      email: 'kevin.s@gmail.com',
      details: 'Court 2 Standard Indoor (19:00 - 21:00) · 2 Jam + 1 Slop Kok',
      courtSlots: [
        { courtId: 'court-2', courtName: 'Court 2 Standard Indoor', dateKey: '2026-09-28', dateLabel: 'Senin, 28 Sep', time: '19:00 - 20:00', price: 50000 },
        { courtId: 'court-2', courtName: 'Court 2 Standard Indoor', dateKey: '2026-09-28', dateLabel: 'Senin, 28 Sep', time: '20:00 - 21:00', price: 50000 }
      ],
      addons: [{ name: 'Beli Shuttlecock (1 Slop)', qty: 1, price: 90000 }],
      total: 180000,
      proofUploaded: true,
      status: 'LUNAS',
      adminNote: 'QRIS match via BCA Livin.'
    },
    {
      id: 'BHUB-2026-9120',
      name: 'Siti Fadia',
      phone: '081122334455',
      email: 'fadia.silva@yahoo.com',
      details: 'Court 3 Training Indoor (16:00 - 18:00) · 2 Jam',
      courtSlots: [
        { courtId: 'court-3', courtName: 'Court 3 Training Indoor', dateKey: '2026-09-28', dateLabel: 'Senin, 28 Sep', time: '16:00 - 17:00', price: 45000 },
        { courtId: 'court-3', courtName: 'Court 3 Training Indoor', dateKey: '2026-09-28', dateLabel: 'Senin, 28 Sep', time: '17:00 - 18:00', price: 45000 }
      ],
      addons: [],
      total: 81000,
      proofUploaded: true,
      status: 'Menunggu Verifikasi',
      adminNote: ''
    },
    {
      id: 'BHUB-2026-1044',
      name: 'Anthony Ginting',
      phone: '081234567890',
      email: 'ginting@badmintonhub.id',
      details: 'Court 1 VIP Indoor (19:00 - 21:00) · 2 Jam',
      courtSlots: [
        { courtId: 'court-1', courtName: 'Court 1 VIP Indoor', dateKey: '2026-09-29', dateLabel: 'Selasa, 29 Sep', time: '19:00 - 20:00', price: 70000 },
        { courtId: 'court-1', courtName: 'Court 1 VIP Indoor', dateKey: '2026-09-29', dateLabel: 'Selasa, 29 Sep', time: '20:00 - 21:00', price: 70000 }
      ],
      addons: [],
      total: 140000,
      proofUploaded: true,
      status: 'LUNAS',
      adminNote: 'Booking Manual Walk-in Cash.'
    },
    {
      id: 'BHUB-2026-2055',
      name: 'Jonatan Christie',
      phone: '081398765432',
      email: 'jojo@badmintonhub.id',
      details: 'Court 2 Standard Indoor (10:00 - 11:00) · 1 Jam',
      courtSlots: [
        { courtId: 'court-2', courtName: 'Court 2 Standard Indoor', dateKey: '2026-09-29', dateLabel: 'Selasa, 29 Sep', time: '10:00 - 11:00', price: 50000 }
      ],
      addons: [],
      total: 50000,
      proofUploaded: true,
      status: 'LUNAS',
      adminNote: 'Reservasi WhatsApp.'
    }
  ],
  uploadedProofData: 'simulated_payment_proof.jpg'
};

