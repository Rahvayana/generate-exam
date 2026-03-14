"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EngagementBanner } from '@/components/EngagementBanner';

// --- ICONS (Internal SVG Components untuk stabilitas maksimal) ---
const IconBase = ({ children, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

const GraduationCap = (props: any) => (
  <IconBase {...props}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></IconBase>
);
const Menu = (props: any) => (
  <IconBase {...props}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></IconBase>
);
const LogOut = (props: any) => (
  <IconBase {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></IconBase>
);
const House = (props: any) => (
  <IconBase {...props}><path d="M15 21v-8a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></IconBase>
);
const BookOpen = (props: any) => (
  <IconBase {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></IconBase>
);
const FileSignature = (props: any) => (
  <IconBase {...props}><path d="M20 22h-2" /><path d="M20 15v2h-2" /><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><path d="m9 10 2 2 4-4" /></IconBase>
);
const BookMarked = (props: any) => (
  <IconBase {...props}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><polyline points="10 2 10 10 13 7 16 10 16 2" /></IconBase>
);
const HelpCircle = (props: any) => (
  <IconBase {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></IconBase>
);
const MonitorPlay = (props: any) => (
  <IconBase {...props}><path d="m10 7 5 3-5 3z" /><rect width="20" height="14" x="2" y="3" rx="2" /><path d="M12 17v4" /><path d="M8 21h8" /></IconBase>
);
const ListChecks = (props: any) => (
  <IconBase {...props}><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></IconBase>
);
const Dices = (props: any) => (
  <IconBase {...props}><rect width="12" height="12" x="2" y="10" rx="2" ry="2" /><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" /><path d="M6 14h.01" /><path d="M10 18h.01" /><path d="M6 18h.01" /><path d="M10 14h.01" /><path d="M15 6h.01" /></IconBase>
);
const Heart = (props: any) => (
  <IconBase {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></IconBase>
);
const ChevronDown = (props: any) => (
  <IconBase {...props}><path d="m6 9 6 6 6-6" /></IconBase>
);
const ArrowLeft = (props: any) => (
  <IconBase {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></IconBase>
);
const Copy = (props: any) => (
  <IconBase {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></IconBase>
);
const FileText = (props: any) => (
  <IconBase {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></IconBase>
);
const Brain = (props: any) => (
  <IconBase {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></IconBase>
);
const Lock = (props: any) => (
  <IconBase {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></IconBase>
);
const AlertCircle = (props: any) => (
  <IconBase {...props}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></IconBase>
);
const ArrowRight = (props: any) => (
  <IconBase {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></IconBase>
);
const User = (props: any) => (
  <IconBase {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></IconBase>
);
const Power = (props: any) => (
  <IconBase {...props}><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" x2="12" y1="2" y2="12" /></IconBase>
);
const Shield = (props: any) => (
  <IconBase {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></IconBase>
);
const Settings = (props: any) => (
  <IconBase {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></IconBase>
);
const Info = (props: any) => (
  <IconBase {...props}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></IconBase>
);

// --- TYPES ---
type ToolCategory =
  | 'rpp'
  | 'lkpd'
  | 'materi'
  | 'soal'
  | 'presentasi'
  | 'rubrik'
  | 'icebreak'
  | 'refleksi';

interface Tool {
  id: ToolCategory;
  title: string;
  description: string;
  iconName: string;
  color: string;
  systemPrompt: string;
  placeholder: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// --- CONSTANTS ---
const TOOLS: Tool[] = [
  {
    id: 'rpp',
    title: 'RPP/Modul Ajar Generator',
    description: 'Buat RPP/Modul Ajar dengan berbagai pilihan kurikulum secara instan.',
    iconName: 'book-open',
    color: 'bg-blue-500',
    systemPrompt: 'Anda adalah pakar kurikulum pendidikan. Buatlah Modul Ajar/RPP profesional. Gunakan gaya penulisan akademik. JANGAN gunakan simbol markdown seperti ** atau #. Gunakan format "BAGIAN:" diikuti nama judul untuk setiap bagian baru.',
    placeholder: 'Contoh: RPP IPAS Kelas 4...'
  },
  {
    id: 'lkpd',
    title: 'LKPD Generator',
    description: 'Buat Lembar Kerja Peserta Didik (LKPD) yang terstruktur dan profesional.',
    iconName: 'file-signature',
    color: 'bg-emerald-500',
    systemPrompt: 'Anda adalah pengembang bahan ajar. Buatlah LKPD formal dan akademik. JANGAN gunakan simbol markdown seperti ** atau #. Gunakan format "BAGIAN:" diikuti nama judul untuk setiap bagian baru.',
    placeholder: 'Contoh: LKPD Eksperimen Sains...'
  },
  {
    id: 'materi',
    title: 'Ringkasan Materi Ajar',
    description: 'Generate ringkasan atau bahan ajar lengkap dari teks yang Anda miliki.',
    iconName: 'book-marked',
    color: 'bg-purple-500',
    systemPrompt: 'Anda adalah ahli konten edukasi. Buatlah ringkasan atau bahan ajar akademik. JANGAN gunakan simbol markdown seperti ** atau #. Gunakan format "BAGIAN:" diikuti nama judul untuk setiap bagian baru.',
    placeholder: 'Contoh: Ringkasan Fotosintesis...'
  },
  {
    id: 'soal',
    title: 'Buat Soal Otomatis',
    description: 'Generate soal, kunci jawaban, kisi-kisi, dan kartu soal lengkap.',
    iconName: 'help-circle',
    color: 'bg-red-500',
    systemPrompt: 'Anda adalah ahli evaluasi pendidikan. Buatlah perangkat asesmen akademik profesional. JANGAN gunakan simbol markdown seperti ** atau #. Gunakan format "BAGIAN:" diikuti nama judul untuk setiap bagian baru.',
    placeholder: 'Contoh: 10 Soal Matematika...'
  },
  {
    id: 'presentasi',
    title: 'Kerangka Presentasi',
    description: 'Buat outline materi slide presentasi mengajar yang sistematis.',
    iconName: 'monitor-play',
    color: 'bg-blue-600 text-white shadow-md shadow-blue-200',
    systemPrompt: 'Anda adalah instruktur pembelajaran. Buatlah kerangka slide akademik. JANGAN gunakan simbol markdown seperti ** atau #. Gunakan format "BAGIAN:" diikuti nama judul untuk setiap bagian baru.',
    placeholder: 'Contoh: Kerangka Slide Sejarah...'
  },
  {
    id: 'rubrik',
    title: 'Rubrik Penilaian',
    description: 'Buat rubrik penilaian tugas atau proyek akademik secara detail.',
    iconName: 'list-checks',
    color: 'bg-orange-500',
    systemPrompt: 'Anda adalah pakar asesmen. Buatlah rubrik penilaian akademik (Skala 1-4). JANGAN gunakan simbol markdown seperti ** atau #. Gunakan format "BAGIAN:" diikuti nama judul untuk setiap bagian baru.',
    placeholder: 'Contoh: Rubrik Menulis Puisi...'
  },
  {
    id: 'icebreak',
    title: 'Ice Breaking Generator',
    description: 'Ide permainan seru untuk mencairkan suasana kelas.',
    iconName: 'dices',
    color: 'bg-pink-500',
    systemPrompt: 'Anda adalah fasilitator pembelajaran. Berikan ide ice breaking yang kreatif namun tetap profesional. JANGAN gunakan simbol markdown seperti ** atau #. Gunakan format "BAGIAN:" diikuti nama judul untuk setiap bagian baru.',
    placeholder: 'Contoh: Game Konsentrasi...'
  },
  {
    id: 'refleksi',
    title: 'Refleksi Mengajar',
    description: 'Dokumentasikan dinamika kelas dan dapatkan analisis reflektif.',
    iconName: 'heart',
    color: 'bg-rose-500',
    systemPrompt: 'Anda adalah mentor guru profesional. Berikan solusi konkret, dukungan reflektif, dan akhiri dengan untaian motivasi inspiratif. JANGAN gunakan simbol markdown seperti ** atau #. Gunakan format "BAGIAN:" diikuti nama judul untuk setiap bagian baru.',
    placeholder: 'Tuliskan refleksi mengajar Anda hari ini...'
  }
];

// --- HELPER: ICON MAPPING ---
const getIcon = (name: string, className?: string) => {
  const props = { className: className || "w-6 h-6" };
  switch (name) {
    case 'book-open': return <BookOpen {...props} />;
    case 'file-signature': return <FileSignature {...props} />;
    case 'book-marked': return <BookMarked {...props} />;
    case 'help-circle': return <HelpCircle {...props} />;
    case 'monitor-play': return <MonitorPlay {...props} />;
    case 'list-checks': return <ListChecks {...props} />;
    case 'dices': return <Dices {...props} />;
    case 'heart': return <Heart {...props} />;
    default: return <BookOpen {...props} />;
  }
};


// --- COMPONENT: DASHBOARD ---
interface DashboardProps {
  onSelectTool: (id: ToolCategory) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  return (
    <div className="p-6 md:p-10 space-y-12 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1e3a8a] to-[#172554] rounded-[32px] p-8 md:p-16 text-white overflow-hidden shadow-xl shadow-blue-900/20">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">Halo, Bapak/Ibu Guru!</h2>
          <p className="text-blue-50 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
            Selamat datang di Asisten Guru AI. Tingkatkan produktivitas mengajar Anda dengan teknologi AI tercanggih yang dirancang khusus untuk pendidik Indonesia.
          </p>
          <div className="mt-10 flex gap-4">
            <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-bold uppercase tracking-widest shadow-sm shadow-slate-200/20">
              Layanan Aktif
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <GraduationCap className="absolute bottom-10 right-10 text-white/5 w-64 h-64 rotate-12" />
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="w-1.5 h-8 bg-blue-600 text-white shadow-md shadow-blue-200 rounded-full shadow-sm shadow-slate-200/20"></span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Pilih Alat Bantu Mengajar</h3>
          </div>
          <span className="hidden sm:block text-[10px] font-black text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 uppercase tracking-widest">
            {TOOLS.length} Fitur Unggulan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group relative flex flex-col items-start text-left bg-white p-7 rounded-[28px] border border-slate-200 hover:border-blue-400 hover:shadow-xl shadow-slate-200/30 hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`${tool.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200/30 group-hover:scale-110 transition-transform duration-300`}>
                {getIcon(tool.iconName, "text-white text-xl w-7 h-7")}
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-600 transition-colors">{tool.title}</h4>
              <p className="text-slate-600 text-xs leading-relaxed mb-6 line-clamp-2 font-medium">{tool.description}</p>

              <div className="mt-auto flex items-center text-[11px] font-bold text-slate-600 uppercase tracking-widest gap-2">
                Buka Tools
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-2 h-0 group-hover:h-full bg-blue-600 text-white shadow-md shadow-blue-200 transition-all duration-300"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
// --- COMPONENT: TOOL VIEW ---
interface ToolViewProps {
  tool: Tool;
  onBack: () => void;
}

const ToolView: React.FC<ToolViewProps> = ({ tool, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [activeSoalTab, setActiveSoalTab] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<any>({
    jenjang: '', kelas: '', mapel: '', mapelKustom: '', topik: '', tujuan: '', model: '', modelKustom: '',
    durasi: '', kurikulum: '', instruksi: '', judul: '', kompetensi: '', petunjuk: '', tugas: '',
    outputType: '', referensi: '',
    tugasType: '', kriteria: '', tujuanIce: '', teksMateri: '', permasalahan: '', durasiIce: '',
    judulBahanAjar: '', jenisOutput: '', bentukSoal: '', topikSoal: '', tujuanPresentasi: '', durasiPresentasi: '', visualisasi: '',
    namaGuru: '', nipGuru: '', namaSekolah: '', namaKepsek: '', nipKepsek: '',
    fase: '', tahunPenyusunan: '', elemenCP: '', pertanyaanPemantik: '', lingkunganBelajar: 'Di dalam kelas (Indoor)', profilPancasila: '', fasilitas: '', targetPenilaian: 'Individu', jenisAsesmen: 'Formatif',
    jenisLKPD: '', alatBahan: '', fenomena: '',
    checkMudah: true, distribusiMudah: 5, checkSedang: true, distribusiSedang: 3, checkSulit: true, distribusiSulit: 2, targetKognitif: ['C1', 'C2', 'C3', 'C4'],
    semester: '', pemahamanBermakna: '', metode: '' // Tambahan Form RPP Baru
  });

  // --- EFEK UNTUK MEMUAT DATA IDENTITAS DARI STORAGE ---
  useEffect(() => {
    const savedIdentitas = sessionStorage.getItem('globalIdentitasPendidik');
    if (savedIdentitas) {
      const parsedData = JSON.parse(savedIdentitas);
      setFormData((prev: any) => ({ ...prev, ...parsedData }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev: any) => {
      const newData = { ...prev, [name]: value };

      // Jika yang diubah adalah isian identitas, simpan ke Session Storage
      if (['namaGuru', 'nipGuru', 'namaSekolah', 'namaKepsek', 'nipKepsek'].includes(name)) {
        const identitasData = {
          namaGuru: name === 'namaGuru' ? value : newData.namaGuru,
          nipGuru: name === 'nipGuru' ? value : newData.nipGuru,
          namaSekolah: name === 'namaSekolah' ? value : newData.namaSekolah,
          namaKepsek: name === 'namaKepsek' ? value : newData.namaKepsek,
          nipKepsek: name === 'nipKepsek' ? value : newData.nipKepsek
        };
        sessionStorage.setItem('globalIdentitasPendidik', JSON.stringify(identitasData));
      }
      return newData;
    });
  };

  const toggleKognitif = (c: string) => {
    setFormData((prev: any) => {
      const isSelected = prev.targetKognitif.includes(c);
      const newTargets = isSelected ? prev.targetKognitif.filter((x: string) => x !== c) : [...prev.targetKognitif, c];
      return { ...prev, targetKognitif: newTargets };
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const generatePrompt = () => {
    let promptText = `Tolong bantu saya sebagai Asisten Guru Profesional.\nFitur: ${tool.title}\n\nDATA INPUT:\n`;

    // Mengecualikan properti yang spesifik ditangani terpisah agar tidak berantakan di prompt
    const excludeKeys = ['checkMudah', 'checkSedang', 'checkSulit', 'distribusiMudah', 'distribusiSedang', 'distribusiSulit', 'targetKognitif'];

    Object.keys(formData).forEach(key => {
      if (formData[key] && !excludeKeys.includes(key)) {
        let label = key.charAt(0).toUpperCase() + key.slice(1);
        if (key === 'mapel' && formData[key] === 'Lainnya') return;
        if (key === 'mapelKustom') label = "Mata Pelajaran (Custom)";
        if (key === 'model' && formData[key] === 'Lainnya') return;
        if (key === 'modelKustom') label = "Model Pembelajaran (Custom)";

        if (key === 'kompetensi') label = "Kompetensi Dasar / Materi Pokok";
        if (key === 'petunjuk') label = "Petunjuk Belajar & Tujuan Pembelajaran";
        if (key === 'tugas') label = "Instruksi Tugas Utama";
        if (key === 'durasiIce') label = "Estimasi Waktu Ice Breaking";
        if (key === 'tujuanIce') label = "Tujuan Khusus Ice Breaking";
        if (key === 'tugasType') label = "Jenis Tugas";
        if (key === 'kriteria') label = "Kriteria Penilaian Spesifik";
        if (key === 'tujuanPresentasi') label = "Tujuan Pembelajaran Presentasi";
        if (key === 'durasiPresentasi') label = "Estimasi Durasi Presentasi";
        if (key === 'bentukSoal') label = "Bentuk Soal";
        if (key === 'topikSoal') label = "Topik/Kata Kunci Soal";
        if (key === 'teksMateri') label = "Teks Materi Sumber";
        if (key === 'judulBahanAjar') label = "Judul Bahan Ajar";
        if (key === 'jenisOutput') label = "Jenis Output Ringkasan";
        if (key === 'visualisasi') label = "Kebutuhan Visualisasi/Gambar";
        if (key === 'namaGuru') label = "Nama Guru";
        if (key === 'nipGuru') label = "NIP Guru";
        if (key === 'namaSekolah') label = "Nama Sekolah";
        if (key === 'namaKepsek') label = "Nama Kepala Sekolah";
        if (key === 'nipKepsek') label = "NIP Kepala Sekolah";
        if (key === 'fase') label = "Fase";
        if (key === 'tahunPenyusunan') label = "Tahun Penyusunan/Pelajaran";
        if (key === 'elemenCP') label = "Elemen/Domain CP";
        if (key === 'pertanyaanPemantik') label = "Pertanyaan Pemantik";
        if (key === 'lingkunganBelajar') label = "Lingkungan Belajar";
        if (key === 'profilPancasila') label = "Profil Pelajar Pancasila";
        if (key === 'fasilitas') label = "Fasilitas (Alat dan Bahan)";
        if (key === 'targetPenilaian') label = "Target Penilaian";
        if (key === 'jenisAsesmen') label = "Jenis Asesmen";
        if (key === 'jenisLKPD') label = "Pendekatan / Tujuan LKPD";
        if (key === 'alatBahan') label = "Alat dan Bahan LKPD";
        if (key === 'fenomena') label = "Fenomena/Kasus Pemantik";
        if (key === 'semester') label = "Semester";
        if (key === 'pemahamanBermakna') label = "Pemahaman Bermakna";
        if (key === 'metode') label = "Metode Pembelajaran";

        promptText += `- ${label}: ${formData[key]}\n`;
      }
    });

    if (formData.namaGuru || formData.namaSekolah) {
      promptText += `\nINSTRUKSI IDENTITAS: Anda WAJIB menyertakan blok "IDENTITAS" yang berisi Nama Guru, NIP, Nama Sekolah, dll sesuai input di bagian paling atas dokumen.\n`;
    }

    if (tool.id === 'rpp') {
      promptText += `\nINSTRUKSI KHUSUS RPP/MODUL AJAR: Anda WAJIB menyusun modul ajar ini mengikuti format template baku 10 Komponen. Gunakan persis teks "BAGIAN: [Nomor]. [Nama Komponen]" untuk memisahkan setiap bagian. Pada setiap bagian, hasilkan HANYA tabel Markdown dengan 2 kolom: | Sub-Komponen | Deskripsi/Keterangan |.

BAGIAN: 1. Informasi Umum Perangkat Ajar
(Tabel: Nama Penyusun, Nama Institusi, Tahun Penyusunan Modul Ajar, Jenjang Sekolah, Fase/Kelas, Alokasi Waktu)

BAGIAN: 2. Tujuan Pembelajaran
(Tabel: Fase Capaian Pembelajaran (CP), Elemen/Domain CP, Tujuan Pembelajaran, Pemahaman Bermakna, Pertanyaan Pemantik, Lingkungan Belajar)

BAGIAN: 3. Profil Pelajar Pancasila
(Tabel: Profil Pelajar Pancasila yang berkaitan)

BAGIAN: 4. Materi Ajar, Alat, dan Bahan
(Tabel: Materi atau Sumber Pembelajaran Utama, Fasilitas/Alat/Bahan)

BAGIAN: 5. Model Pembelajaran
(Tabel: Model Pembelajaran yang digunakan, Metode Pembelajaran)

BAGIAN: 6. Urutan Kegiatan Pembelajaran
(Tabel: Pendahuluan, Inti, Penutup. Jabarkan langkah-langkah secara sangat detail pada kolom deskripsi)

BAGIAN: 7. Asesmen
(Tabel: Target Penilaian, Jenis Asesmen, Penilaian Kompetensi dan Pengetahuan, Cara melakukan asesmen, Kriteria Penilaian)

BAGIAN: 8. Refleksi Guru dan Siswa
(Tabel: Refleksi Guru, Refleksi Siswa)

BAGIAN: 9. Daftar Pustaka
(Tabel: Referensi/Sumber Pustaka)

BAGIAN: 10. Pengayaan dan Remedial
(Tabel: Pengayaan, Remedial)\n\n`;
    }

    if (tool.id === 'lkpd') {
      promptText += `\nINSTRUKSI KHUSUS LKPD: Berdasarkan referensi pedagogik modern, LKPD yang baik BUKAN sekadar daftar latihan soal/PR kosong, melainkan harus berpusat pada siswa (student-centered), membantu siswa menemukan konsep sendiri (konstruktivisme), atau menerapkan konsep.
Anda WAJIB menyusun dokumen LKPD ini dengan format baku berikut (Gunakan persis teks "BAGIAN: [Nama Bagian]" untuk setiap nomor utama agar bisa dipisah oleh antarmuka sistem). Hasilkan instruksi yang detail dan terstruktur:

BAGIAN: 1. Identitas LKPD
(Berisi Judul Kegiatan, Mata Pelajaran, Kelas, dan Tujuan Kegiatan)

BAGIAN: 2. Fenomena / Pemantik
(Sajikan cerita singkat, kasus, atau fenomena konkrit dan sederhana yang memancing rasa ingin tahu siswa, relevan dengan kegiatan yang akan dilakukan)

BAGIAN: 3. Alat dan Bahan
(Sebutkan daftar alat dan bahan fisik maupun referensi yang spesifik jika ini berupa kegiatan eksperimen/observasi)

BAGIAN: 4. Langkah-Langkah Kegiatan
(Instruksi kerja operasional bernomor yang menuntun siswa untuk melakukan aktivitas fisik/mental secara bertahap seperti MELAKUKAN dan MENGAMATI)

BAGIAN: 5. Tabel Data / Hasil Pengamatan
(Gambarkan format tabel kosong yang harus diisi oleh siswa berdasarkan kegiatan yang dilakukan)

BAGIAN: 6. Pertanyaan Analisis & Diskusi
(Berikan minimal 3-5 pertanyaan kritis berjenjang yang membimbing siswa MENGANALISIS fenomena/data untuk menemukan/menerapkan konsep tersebut)

BAGIAN: 7. Kesimpulan
(Instruksi bagi siswa untuk merumuskan simpulan akhir dari kegiatan berdasarkan hasil analisis)\n\n`;
    }

    // --- INSTRUKSI KHUSUS UNTUK SOAL OTOMATIS ---
    if (tool.id === 'soal') {
      const jmlMudah = formData.checkMudah ? Number(formData.distribusiMudah) : 0;
      const jmlSedang = formData.checkSedang ? Number(formData.distribusiSedang) : 0;
      const jmlSulit = formData.checkSulit ? Number(formData.distribusiSulit) : 0;
      const totalSoal = jmlMudah + jmlSedang + jmlSulit;
      const listKognitif = formData.targetKognitif.length > 0 ? formData.targetKognitif.join(', ') : 'Campuran';

      promptText += `\nINSTRUKSI KHUSUS DISTRIBUSI SOAL:
Anda WAJIB membuat total tepat ${totalSoal} soal, dengan rincian proporsi kesulitan:
- Mudah: ${jmlMudah} soal
- Sedang: ${jmlSedang} soal
- Sulit: ${jmlSulit} soal
Target Level Kognitif utama untuk soal-soal ini adalah: ${listKognitif}. Pastikan indikator soal mencerminkan level kognitif tersebut.\n`;

      promptText += `\nFORMAT HASIL GENERATOR SOAL: Anda WAJIB menyusun dokumen hasil secara profesional ke dalam 4 bagian baku berikut (Gunakan persis teks "BAGIAN: [Nama Bagian]" sebagai pemisah agar sistem bisa membuat tab navigasi otomatis).

BAGIAN: Naskah Soal
(Tuliskan naskah soal lengkap dengan teks stimulus/bacaan jika ada, dan butir soal. Pisahkan pilihan ganda ke bawah: A, B, C, D)

BAGIAN: Kunci Jawaban dan Pembahasan
(Berisi format tabel Markdown yang rapi dengan kolom: | No | Jawaban | Pembahasan |)

BAGIAN: Kisi-Kisi Soal
(Berisi format tabel Markdown yang rapi dengan kolom: | No | Materi | Indikator Soal | Level Kognitif | Tingkat Kesulitan |)

BAGIAN: Kartu Soal
(Jabarkan rincian setiap soal secara urut. Berisi detail seperti: Capaian Pembelajaran, Materi, Indikator Soal, Level Kognitif, Kunci Jawaban, dan Naskah Soal. Boleh menggunakan list atau tabel Markdown)\n\n`;
    }

    // --- INSTRUKSI GAMBAR DIPERKUAT SECARA AGRESIF ---
    if (formData.visualisasi && formData.visualisasi.includes('Ya') && tool.id === 'soal') {
      promptText += `\n[SANGAT PENTING - INSTRUKSI VISUALISASI GAMBAR]: 
Karena pengguna memilih untuk menyertakan gambar, Anda WAJIB membuat minimal 2-3 soal yang mengharuskan siswa mengamati gambar.
Untuk menampilkan gambar, Anda DILARANG KERAS menggunakan format gambar Markdown standar seperti ![alt](url).
Anda HANYA BOLEH menggunakan KODE RAHASIA ini tepat di lokasi gambar diletakkan:
[GAMBAR: <deskripsi visual gambar sangat spesifik dalam bahasa INGGRIS>]

Contoh Penulisan yang BENAR di dalam teks:
1. Perhatikan gambar siklus air berikut ini dengan saksama!
[GAMBAR: A detailed illustration of water cycle in nature showing evaporation, condensation, and precipitation]
Berdasarkan gambar di atas, proses penguapan air laut ditunjukkan oleh huruf...

Ingat: Pastikan selalu menggunakan kurung siku [GAMBAR: deskripsi]. Kami akan memproses kode tersebut menjadi gambar asli di layar pengguna!\n`;
    }

    promptText += `\nPERATURAN PENTING & FORMATTING (WAJIB DIIKUTI):
1. Gunakan gaya bahasa AKADEMIK, FORMAL, dan PROFESIONAL (layaknya dokumen resmi instansi pendidikan).
2. Susun konten menjadi bagian-bagian yang jelas dan komprehensif.
3. JANGAN gunakan simbol markdown seperti ** atau # atau __ untuk heading, KECUALI untuk penggunaan tabel Markdown (| kolom | kolom |).
4. Setiap pergantian subjudul / bab baru, WAJIB gunakan format penanda khusus "BAGIAN:" diikuti nama judul bagian.
5. Gunakan penomoran formal yang rapi (1., 2., a., b.) untuk poin-poin. Gunakan tanda hubung strip '-' atau '•' untuk sub-poin di dalam tabel.
6. JANGAN gunakan penebalan teks (bolding) menggunakan bintang.`;
    return promptText;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (tool.id === 'soal') {
      const total = (formData.checkMudah ? Number(formData.distribusiMudah) : 0) +
        (formData.checkSedang ? Number(formData.distribusiSedang) : 0) +
        (formData.checkSulit ? Number(formData.distribusiSulit) : 0);
      if (total === 0) {
        alert("Harap tentukan minimal 1 soal pada Distribusi Kesulitan!");
        return;
      }
    }

    setActiveSoalTab(0); // Reset tabs on new generate
    const userPrompt = generatePrompt();
    setMessages([{ role: 'user', text: userPrompt, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      // 1. GENERATE TEKS menggunakan API Route (dengan user's API Key)
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          systemInstruction: tool.systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        // Handle specific errors
        if (errorData.needsApiKey) {
          throw new Error(errorData.error || 'API Key diperlukan. Silakan tambahkan API Key Gemini di halaman Profile.');
        }
        if (errorData.invalidApiKey) {
          throw new Error(errorData.error || 'API Key tidak valid. Silakan periksa kembali API Key Anda di halaman Profile.');
        }

        throw new Error(errorData.error || 'Gagal mengenerate konten');
      }

      const data = await response.json();
      let aiText = data.text;

      if (!aiText) throw new Error("Format respons teks tidak sesuai.");

      // --- SISTEM NORMALISASI TEKS CERDAS ---
      aiText = aiText.replace(/\*\*/g, '').replace(/#+ /g, '').replace(/__/g, '');
      aiText = aiText.replace(/!\[([^\]]+)\]\([^\)]*\)/g, '[GAMBAR: $1]');
      aiText = aiText.replace(/\[(?:Gambar|Ilustrasi|Image)\s*:?\s*([^\]]+)\]/gi, '[GAMBAR: $1]');
      aiText = aiText.replace(/\((?:Gambar|Ilustrasi|Image)\s*:?\s*([^\)]+)\)/gi, '[GAMBAR: $1]');

      setMessages(prev => [...prev, { role: 'model', text: aiText, timestamp: new Date() }]);

      // --- GENERATE GAMBAR (MENGGUNAKAN IMAGEN 4.0) ---
      const imgRegexExtract = /\[GAMBAR:\s*([^\]]+)\]/gi;
      let matchEx;
      const promptsToGenerate: string[] = [];
      while ((matchEx = imgRegexExtract.exec(aiText)) !== null) {
        promptsToGenerate.push(matchEx[1].trim());
      }

      if (promptsToGenerate.length > 0) {
        setIsGeneratingImages(true);
        const uniquePrompts = [...new Set(promptsToGenerate)];

        for (const imgPrompt of uniquePrompts) {
          try {
            const imgRes = await fetch('/api/ai/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imagePrompt: "Educational worksheet flat vector illustration, simple, clean, white background. Subject: " + imgPrompt,
              }),
            });

            if (!imgRes.ok) {
              throw new Error('Image generation failed');
            }

            const imgData = await imgRes.json();

            if (imgData.imageUrl) {
              setGeneratedImages(prev => ({ ...prev, [imgPrompt]: imgData.imageUrl }));
            } else {
              throw new Error("Invalid Image Format");
            }
          } catch (e) {
            // Fallback to pollinations.ai
            const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt)}?width=600&height=400&nologo=true`;
            setGeneratedImages(prev => ({ ...prev, [imgPrompt]: fallbackUrl }));
          }
        }
        setIsGeneratingImages(false);
      }

    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: error?.message || 'Maaf, terjadi kendala teknis saat memproses permintaan Anda. Hal ini biasanya terjadi jika sistem sedang memproses antrean panjang. Silakan muat ulang (refresh) halaman ini dan coba sekali lagi.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseSections = (text: string) => {
    const sections: { title: string; content: string[] }[] = [];
    const lines = text.split('\n');
    let currentTitle = "Rangkuman Utama";
    let currentContent: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('BAGIAN:')) {
        if (currentContent.length > 0 || sections.length > 0) {
          sections.push({ title: currentTitle, content: currentContent });
        }
        currentTitle = trimmed.replace('BAGIAN:', '').trim();
        currentContent = [];
      } else if (trimmed !== '' || currentContent.length > 0) {
        currentContent.push(line);
      }
    });

    if (currentContent.length > 0) {
      sections.push({ title: currentTitle, content: currentContent });
    }

    return sections.length > 0 ? sections : [{ title: "Hasil Lengkap", content: lines }];
  };

  // --- RENDER TABEL KHUSUS RPP/MODUL AJAR DI UI ---
  const renderRppTableUI = (sections: any[]) => {
    return (
      <div className="overflow-x-auto my-6 shadow-sm shadow-slate-200/20">
        <table className="w-full text-[13px] md:text-sm text-left border-collapse bg-white table-fixed border border-slate-300">
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '65%' }} />
          </colgroup>
          <thead>
            <tr className="bg-slate-100 text-white font-bold uppercase tracking-wider text-xs">
              <th className="px-4 py-3 border border-blue-800 text-center">No</th>
              <th className="px-4 py-3 border border-blue-800">Komponen</th>
              <th className="px-4 py-3 border border-blue-800">Deskripsi / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec, idx) => {
              if (sec.title === "Rangkuman Utama" || sec.title === "Hasil Lengkap") return null;

              let no = "";
              let title = sec.title;
              const match = sec.title.match(/^(\d+)\.\s*(.*)/);
              if (match) {
                no = match[1] + ".";
                title = match[2];
              }

              let rows: string[][] = [];
              sec.content.forEach((line: string) => {
                if (line.trim().startsWith('|') && line.trim().endsWith('|') && !line.replace(/\s/g, '').includes('|-')) {
                  const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
                  // Skip header palsu dari AI
                  if (cells[0].toLowerCase().includes('komponen') || cells[0].toLowerCase().includes('sub-komponen')) return;
                  if (cells.length >= 2) rows.push(cells);
                }
              });

              const elements: any[] = [];

              // Row Judul Bagian
              elements.push(
                <tr key={`${no}-header-${idx}`} className="bg-slate-100">
                  <td className="px-4 py-3 border border-slate-300 font-bold text-center align-top text-indigo-200">{no}</td>
                  <td colSpan={2} className="px-4 py-3 border border-slate-300 font-bold text-indigo-200">{title}</td>
                </tr>
              );

              // Row Data (Isi Tabel)
              rows.forEach((r, rIdx) => {
                let cleanTd = r.slice(1).join(' | ').replace(/[-•]\s/g, '<br/>• ');
                if (cleanTd.startsWith('<br/>')) cleanTd = cleanTd.substring(5);
                cleanTd = cleanTd.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                elements.push(
                  <tr key={`${no}-row-${idx}-${rIdx}`}>
                    <td className="px-4 py-3 border border-slate-300 bg-slate-50"></td>
                    <td className="px-4 py-3 border border-slate-300 font-semibold text-slate-800 align-top">{r[0]}</td>
                    <td className="px-4 py-3 border border-slate-300 align-top text-slate-700" dangerouslySetInnerHTML={{ __html: cleanTd }} />
                  </tr>
                );
              });

              return elements;
            })}
          </tbody>
        </table>
      </div>
    );
  };
  const downloadWord = () => {
    const lastAiMessage = messages.filter(m => m.role === 'model').pop();
    if (!lastAiMessage) return;

    const sections = parseSections(lastAiMessage.text);
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${tool.title}</title>
      <style>
        @page { size: A4 portrait; margin: 2.54cm; }
        body { font-family: 'Times New Roman', Times, serif; padding: 0; font-size: 12pt; color: #000; line-height: 1.5; text-align: justify; }
        h1 { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; color: #000; border: none; padding: 0; }
        h2 { font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #000; border: none; padding: 0; text-transform: uppercase; }
        p { margin: 0 0 8px 0; text-align: justify; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 15pt; font-size: 11pt; }
        th, td { border: 1px solid black; padding: 6px; vertical-align: top; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12pt; }
        .meta-table td { padding: 4px 8px; vertical-align: top; border: none; }
        .meta-table tr td:first-child { width: 30%; font-weight: bold; }
        .signature-table { width: 100%; margin-top: 50px; text-align: center; font-size: 12pt; border: none; page-break-inside: avoid; }
        .signature-table td { border: none; width: 50%; padding: 10px; vertical-align: bottom; }
        .highlight { font-weight: bold; font-style: italic; margin: 10px 0; }
        .list-item { margin-left: 30px; margin-bottom: 4px; }
        .separator { border-top: 2px solid black; margin-bottom: 20px; margin-top: 10px; }
        .page-break { page-break-before: always; }
      </style></head>
      <body>
    `;

    // --- ALGORITMA RENDER WORD UNTUK MASING-MASING FITUR ---
    if (tool.id === 'rpp') {
      htmlContent += `
          <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="font-size: 16pt; font-weight: bold; margin: 0px; text-transform: uppercase;">MODUL AJAR / RPP</h1>
              <p style="font-size: 12pt; font-weight: bold; margin-top: 4px;">Mata Pelajaran: ${formData.mapel === 'Lainnya' ? formData.mapelKustom : formData.mapel || '-'}</p>
              <p style="font-size: 11pt; margin-top: 2px;">Kelas: ${formData.kelas || '-'} | Fase: ${formData.fase || '-'}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11pt; border: 1px solid black;">
              <thead>
                  <tr>
                      <th style="border: 1px solid black; padding: 8px; text-align: center; width: 5%; background-color: #e2e8f0;">No</th>
                      <th style="border: 1px solid black; padding: 8px; text-align: center; width: 30%; background-color: #e2e8f0;">Komponen</th>
                      <th style="border: 1px solid black; padding: 8px; text-align: center; width: 65%; background-color: #e2e8f0;">Deskripsi / Keterangan</th>
                  </tr>
              </thead>
              <tbody>
        `;

      sections.forEach((sec, idx) => {
        if (sec.title === "Rangkuman Utama" || sec.title === "Hasil Lengkap") return;

        let no = "";
        let title = sec.title;
        const match = sec.title.match(/^(\d+)\.\s*(.*)/);
        if (match) {
          no = match[1] + ".";
          title = match[2];
        }

        let rows: string[][] = [];
        sec.content.forEach((line) => {
          if (line.trim().startsWith('|') && line.trim().endsWith('|') && !line.replace(/\s/g, '').includes('|-')) {
            const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
            if (cells[0].toLowerCase().includes('komponen') || cells[0].toLowerCase().includes('sub-komponen')) return;
            if (cells.length >= 2) rows.push(cells);
          }
        });

        htmlContent += `
                <tr style="background-color: #f8fafc;">
                    <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold; vertical-align: top;">${no}</td>
                    <td colspan="2" style="border: 1px solid black; padding: 8px; font-weight: bold; vertical-align: top;">${title}</td>
                </tr>
            `;

        rows.forEach(r => {
          let cleanTd = r.slice(1).join(' | ').replace(/[-•]\s/g, '<br/>• ');
          if (cleanTd.startsWith('<br/>')) cleanTd = cleanTd.substring(5);
          cleanTd = cleanTd.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

          htmlContent += `
                    <tr>
                        <td style="border: 1px solid black; padding: 8px; background-color: #f1f5f9;"></td>
                        <td style="border: 1px solid black; padding: 8px; vertical-align: top; font-weight: bold;">${r[0]}</td>
                        <td style="border: 1px solid black; padding: 8px; vertical-align: top; text-align: justify;">${cleanTd}</td>
                    </tr>
                `;
        });
      });

      htmlContent += `</tbody></table>`;

    } else if (tool.id === 'soal') {
      htmlContent += `
          <h1>NASKAH SOAL</h1>
          <p style="text-align:center;margin-bottom:12pt">Mapel: ${formData.mapel === 'Lainnya' ? formData.mapelKustom : formData.mapel || '-'} | Kelas: ${formData.kelas || '-'}</p>
          <hr style="border: 1px solid black; margin-bottom: 20px;" />
        `;

      sections.forEach((section, index) => {
        if (index > 0) htmlContent += `<div class="page-break"></div>`;
        if (section.title && section.title !== "Rangkuman Utama" && section.title !== "Hasil Lengkap") {
          htmlContent += `<h2>${section.title}</h2>`;
        }

        let tableMode = false;
        section.content.forEach(line => {
          if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            if (line.replace(/\s/g, '').includes('|-')) return;
            if (!tableMode) {
              htmlContent += `<table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin-bottom: 20px;">`;
              tableMode = true;
            }
            const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
            htmlContent += `<tr>`;
            cells.forEach((cell, cellIdx) => {
              let cellContent = cell.replace(/[-•]\s/g, '<br/>• ');
              if (cellContent.startsWith('<br/>')) cellContent = cellContent.substring(5);
              htmlContent += `<td style="border: 1px solid black; padding: 6px; vertical-align: top;">${cellContent}</td>`;
            });
            htmlContent += `</tr>`;
            return;
          } else {
            if (tableMode) {
              htmlContent += `</table>`;
              tableMode = false;
            }
          }

          if (line.match(/\[GAMBAR:\s*([^\]]+)\]/i)) {
            let processedLine = line.replace(/\[GAMBAR:\s*([^\]]+)\]/gi, (match, p1) => {
              const prompt = p1.trim();
              const safeAlt = prompt.replace(/"/g, '&quot;');
              const imgSrc = generatedImages[prompt] || `https://placehold.co/600x400/eee/999?text=Gambar:+${encodeURIComponent(prompt)}`;
              return `<div style="text-align:center; margin: 20px 0;"><img src="${imgSrc}" style="max-width:400px; height:auto; border:1px solid #ccc;" alt="${safeAlt}" /></div>`;
            });
            htmlContent += `<div>${processedLine}</div>`;
          } else {
            const isHighlight = /^(Catatan|Penting|Tips|Langkah|Tujuan|Analisis|Strategi|Instruksi):/i.test(line);
            const isListItem = /^[-*•]\s|^[0-9]+\.\s|^[a-z]\.\s/i.test(line.trim());
            if (isHighlight) {
              htmlContent += `<p class="highlight">${line}</p>`;
            } else if (isListItem) {
              htmlContent += `<p class="list-item">${line}</p>`;
            } else if (line.trim() !== "") {
              htmlContent += `<p>${line}</p>`;
            }
          }
        });
        if (tableMode) htmlContent += `</table>`;
      });

    } else {
      // DEFAULT RENDER FOR OTHER TOOLS (Materi, dll)
      htmlContent += `
          <h1>${tool.title.toUpperCase()}</h1>
          <table class="meta-table">
            <tr><td>Nama Guru</td><td>: ${formData.namaGuru || '-'}</td></tr>
            <tr><td>NIP Guru</td><td>: ${formData.nipGuru || '-'}</td></tr>
            <tr><td>Instansi/Sekolah</td><td>: ${formData.namaSekolah || '-'}</td></tr>
            <tr><td>Jenjang/Kelas</td><td>: ${formData.jenjang || '-'} / ${formData.kelas || '-'}</td></tr>
            <tr><td>Mata Pelajaran</td><td>: ${formData.mapel === 'Lainnya' ? formData.mapelKustom : formData.mapel || '-'}</td></tr>
          </table>
          <div class="separator"></div>
        `;

      sections.forEach((section) => {
        if (section.title && section.title !== "Rangkuman Utama" && section.title !== "Hasil Lengkap") {
          htmlContent += `<h2>${section.title}</h2>`;
        }

        let tableMode = false;
        section.content.forEach(line => {
          if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            if (line.replace(/\s/g, '').includes('|-')) return;
            if (!tableMode) {
              htmlContent += `<table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin-bottom: 20px;">`;
              tableMode = true;
            }
            const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
            htmlContent += `<tr>`;
            cells.forEach((cell) => {
              let cellContent = cell.replace(/[-•]\s/g, '<br/>• ');
              if (cellContent.startsWith('<br/>')) cellContent = cellContent.substring(5);
              htmlContent += `<td style="border: 1px solid black; padding: 6px; vertical-align: top;">${cellContent}</td>`;
            });
            htmlContent += `</tr>`;
            return;
          } else {
            if (tableMode) {
              htmlContent += `</table>`;
              tableMode = false;
            }
          }

          if (line.match(/\[GAMBAR:\s*([^\]]+)\]/i)) {
            let processedLine = line.replace(/\[GAMBAR:\s*([^\]]+)\]/gi, (match, p1) => {
              const prompt = p1.trim();
              const safeAlt = prompt.replace(/"/g, '&quot;');
              const imgSrc = generatedImages[prompt] || `https://placehold.co/600x400/eee/999?text=Gambar:+${encodeURIComponent(prompt)}`;
              return `<div style="text-align:center; margin: 20px 0;"><img src="${imgSrc}" style="max-width:400px; height:auto; border:1px solid #ccc;" alt="${safeAlt}" /></div>`;
            });
            htmlContent += `<div>${processedLine}</div>`;
          } else {
            const isHighlight = /^(Catatan|Penting|Tips|Langkah|Tujuan|Analisis|Strategi|Instruksi):/i.test(line);
            const isListItem = /^[-*•]\s|^[0-9]+\.\s|^[a-z]\.\s/i.test(line.trim());
            if (isHighlight) {
              htmlContent += `<p class="highlight">${line}</p>`;
            } else if (isListItem) {
              htmlContent += `<p class="list-item">${line}</p>`;
            } else if (line.trim() !== "") {
              htmlContent += `<p>${line}</p>`;
            }
          }
        });
        if (tableMode) htmlContent += `</table>`;
      });
    }

    if (tool.id === 'rpp') {
      htmlContent += `
        <table class="signature-table" style="width: 100%; border: none; margin-top: 50px;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: top; border: none;">
              Mengetahui,<br/>
              Kepala ${formData.namaSekolah || 'Sekolah'}<br/><br/><br/><br/><br/>
              <strong><u>${formData.namaKepsek || '...............................................'}</u></strong><br/>
              NIP. ${formData.nipKepsek || '...................................'}
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top; border: none;">
              <br/>
              Guru Mata Pelajaran<br/><br/><br/><br/><br/>
              <strong><u>${formData.namaGuru || '...............................................'}</u></strong><br/>
              NIP. ${formData.nipGuru || '...................................'}
            </td>
          </tr>
        </table>`;
    }

    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.title.replace(/\s+/g, '_')}_${new Date().getTime()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const mapelOptions = [
    "Pendidikan Agama", "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Bahasa Inggris", "Seni Budaya",
    "PJOK", "Informatika", "Prakarya", "Sejarah", "Fisika", "Kimia", "Biologi", "Geografi", "Ekonomi",
    "Sosiologi", "Lainnya"
  ];

  const inputStyle = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900 placeholder-gray-400 font-medium";
  const labelStyle = "block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider";
  const sectionTitleStyle = "flex items-center gap-3 text-lg font-bold text-slate-600 mb-6";
  const helperTextStyle = "text-[10px] text-slate-500 mb-6 italic";
  const primaryButtonStyle = "w-full bg-blue-600 text-white shadow-md shadow-blue-200 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-lg shadow-slate-200/50 disabled:bg-gray-300 active:scale-[0.98]";

  // --- RENDER CONTENT WITH FORMATTING (UMUM) ---
  const renderContentWithFormatting = (lines: string[], sectionTitle: string = "") => {
    let elements: React.ReactNode[] = [];
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6 border border-slate-300 rounded-xl shadow-sm shadow-slate-200/20">
            <table className="w-full text-sm text-left border-collapse bg-white">
              <tbody>
                {tableRows.map((tr, i) => {
                  const isHeader = i === 0;
                  return (
                    <tr key={i} className={isHeader ? "bg-slate-100 font-bold border-b border-slate-300 text-slate-900" : "border-b border-slate-200"}>
                      {tr.map((td, j) => {
                        let cleanTd = td.replace(/[-•]\s/g, '<br/>• ');
                        if (cleanTd.startsWith('<br/>')) cleanTd = cleanTd.substring(5);

                        return (
                          <td key={j}
                            className={`px-4 py-3 border-r last:border-r-0 border-slate-200 align-top ${isHeader ? "text-center" : ""}`}
                            dangerouslySetInnerHTML={{ __html: cleanTd }}
                          />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
    };

    lines.forEach((line, lIdx) => {
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (line.replace(/\s/g, '').includes('|-')) return;
        const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
        tableRows.push(cells);
      } else {
        flushTable();

        const imageTagRegex = /\[GAMBAR:\s*([^\]]+)\]/i;
        const splitRegex = /(\[GAMBAR:\s*[^\]]+\])/i;

        if (splitRegex.test(line)) {
          const parts = line.split(splitRegex);
          elements.push(
            <div key={lIdx} className="my-4">
              {parts.map((part, pIdx) => {
                const imgMatch = part.match(imageTagRegex);
                if (imgMatch) {
                  const prompt = imgMatch[1].trim();
                  const imgSrc = generatedImages[prompt];
                  return (
                    <div key={pIdx} className="my-6 flex flex-col items-center">
                      {imgSrc ? (
                        <img src={imgSrc} alt={prompt} className="max-w-full border border-slate-300 p-1 shadow-sm shadow-slate-200/20 rounded-xl" style={{ maxHeight: '350px' }} loading="lazy" />
                      ) : isGeneratingImages ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-100 border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm shadow-slate-200/20">
                          <div className="w-8 h-8 border-4 border-t-blue-600 border-slate-200 rounded-full animate-spin mb-4"></div>
                          <span className="text-sm text-slate-600 font-bold tracking-wide">AI sedang melukis ilustrasi...</span>
                          <span className="text-[11px] text-blue-500 mt-1">(Tunggu sebentar ya)</span>
                        </div>
                      ) : (
                        <img src={`https://placehold.co/600x400/eee/999?text=Ilustrasi:+${encodeURIComponent(prompt)}`} alt={prompt} className="max-w-full border border-slate-300 p-1 rounded-xl shadow-sm shadow-slate-200/20" style={{ maxHeight: '350px' }} />
                      )}
                    </div>
                  );
                }
                if (!part.trim()) return null;
                return <span key={pIdx}>{part}</span>;
              })}
            </div>
          );
          return;
        }

        const isPenomoran = /^[0-9]+\.|\s?[A-Za-z]\.|\s?[IVX]+\./.test(line);
        const isHighlight = /^(Catatan|Penting|Tips|Langkah|Tujuan|Analisis|Rekomendasi|Instruksi):/i.test(line);

        if (isHighlight) {
          elements.push(<p key={lIdx} className="font-bold italic my-3">{line}</p>);
        } else if (isPenomoran) {
          elements.push(<p key={lIdx} className="ml-5 md:ml-8 my-1">{line}</p>);
        } else if (line.trim() !== "") {
          elements.push(<p key={lIdx}>{line}</p>);
        }
      }
    });
    flushTable();

    return elements;
  };

  const renderIdentitas = () => (
    <div className="mb-6 bg-slate-100/40 p-5 rounded-2xl border border-slate-200">
      <h4 className="text-sm font-bold text-indigo-200 mb-4 flex items-center gap-2">
        <User className="w-4 h-4" /> Data Identitas Pendidik
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Nama Guru</label>
          <input type="text" name="namaGuru" value={formData.namaGuru} onChange={handleInputChange} placeholder="Cth: Budi Santoso, S.Pd." className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>NIP Guru</label>
          <input type="text" name="nipGuru" value={formData.nipGuru} onChange={handleInputChange} placeholder="Cth: 19800101 200501 1 001" className={inputStyle} />
        </div>
        <div className="md:col-span-2">
          <label className={labelStyle}>Nama Sekolah / Instansi</label>
          <input type="text" name="namaSekolah" value={formData.namaSekolah} onChange={handleInputChange} placeholder="Cth: SD Negeri 1 Jakarta" className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>Nama Kepala Sekolah</label>
          <input type="text" name="namaKepsek" value={formData.namaKepsek} onChange={handleInputChange} placeholder="Cth: Dra. Siti Aminah, M.Pd." className={inputStyle} />
        </div>
        <div>
          <label className={labelStyle}>NIP Kepala Sekolah</label>
          <input type="text" name="nipKepsek" value={formData.nipKepsek} onChange={handleInputChange} placeholder="Cth: 19750202 200003 2 002" className={inputStyle} />
        </div>
      </div>
    </div>
  );

  const renderCommonTop = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className={labelStyle}>Jenjang <span className="text-red-500">*</span></label>
        <select name="jenjang" value={formData.jenjang} onChange={handleInputChange} className={inputStyle} required>
          <option value="">Pilih Jenjang</option>
          <option value="PAUD/TK">PAUD/TK</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA">SMA</option>
          <option value="SMK">SMK</option>
        </select>
      </div>
      <div>
        <label className={labelStyle}>Kelas (Cth: X, 5, 12) <span className="text-red-500">*</span></label>
        <input type="text" name="kelas" value={formData.kelas} onChange={handleInputChange} placeholder="Contoh: X" className={inputStyle} required />
      </div>
    </div>
  );

  const renderMapelField = () => (
    <div className="mt-5">
      <label className={labelStyle}>Mata Pelajaran** <span className="text-red-500">*</span></label>
      <select name="mapel" value={formData.mapel} onChange={handleInputChange} className={inputStyle} required>
        <option value="">Pilih Mata Pelajaran</option>
        {mapelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {formData.mapel === 'Lainnya' && (
        <input type="text" name="mapelKustom" value={formData.mapelKustom} onChange={handleInputChange} placeholder="Masukkan mata pelajaran..." className={`${inputStyle} mt-3 border-blue-500/30`} required />
      )}
    </div>
  );

  // Komponen Helper untuk Row Distribusi Kesulitan Soal
  const renderDistribusiRow = (label: string, checkKey: string, valueKey: string) => {
    return (
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2 w-28">
          <input
            type="checkbox"
            checked={formData[checkKey]}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, [checkKey]: e.target.checked, [valueKey]: e.target.checked && prev[valueKey] === 0 ? 1 : prev[valueKey] }))}
            className="w-5 h-5 accent-red-500 rounded cursor-pointer"
          />
          <span className="font-bold text-slate-900 text-sm">{label}</span>
        </div>
        <div className={`flex items-center border-[2px] border-slate-300 rounded-xl overflow-hidden bg-white h-10 transition-opacity ${!formData[checkKey] ? 'opacity-40 pointer-events-none' : ''}`}>
          <button
            type="button"
            onClick={() => setFormData((prev: any) => ({ ...prev, [valueKey]: Math.max(0, prev[valueKey] - 1) }))}
            className="px-4 font-black text-lg hover:bg-slate-100 transition-colors h-full flex items-center justify-center border-r-[2px] border-slate-300"
          >
            −
          </button>
          <input
            type="number"
            value={formData[valueKey]}
            readOnly
            className="w-12 text-center font-bold text-slate-900 outline-none"
          />
          <button
            type="button"
            onClick={() => setFormData((prev: any) => ({ ...prev, [valueKey]: prev[valueKey] + 1, [checkKey]: true }))}
            className="px-4 font-black text-lg hover:bg-slate-100 transition-colors h-full flex items-center justify-center border-l-[2px] border-slate-300"
          >
            +
          </button>
        </div>
      </div>
    );
  };
  const renderFormContent = () => {
    switch (tool.id) {
      case 'rpp':
        return (
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className={sectionTitleStyle}><BookOpen className="text-slate-600 w-6 h-6" /> {tool.title}</h3>
            <p className={helperTextStyle}>Sistem akan merancang RPP/Modul Ajar ke dalam format 10 Komponen Baku Profesional.</p>

            {renderIdentitas()}
            {renderCommonTop()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <label className={labelStyle}>Tahun Pelajaran <span className="text-red-500">*</span></label>
                <input type="text" name="tahunPenyusunan" value={formData.tahunPenyusunan} onChange={handleInputChange} placeholder="Contoh: 2024/2025" className={inputStyle} required />
              </div>
              <div>
                <label className={labelStyle}>Semester <span className="text-red-500">*</span></label>
                <select name="semester" value={formData.semester} onChange={handleInputChange} className={inputStyle} required>
                  <option value="">Pilih Semester</option>
                  <option value="1 (Ganjil)">1 (Ganjil)</option>
                  <option value="2 (Genap)">2 (Genap)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <label className={labelStyle}>Fase CP <span className="text-red-500">*</span></label>
                <select name="fase" value={formData.fase} onChange={handleInputChange} className={inputStyle} required>
                  <option value="">Pilih Fase</option>
                  <option value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</option>
                  <option value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</option>
                  <option value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</option>
                  <option value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</option>
                  <option value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</option>
                  <option value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</option>
                </select>
              </div>
              <div className="-mt-5">
                {renderMapelField()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Topik/Materi Utama <span className="text-red-500">*</span></label>
                <input type="text" name="topik" value={formData.topik} onChange={handleInputChange} placeholder="Contoh : Mengenal Tumbuhan" className={inputStyle} required />
              </div>
              <div>
                <label className={labelStyle}>Elemen/Domain CP</label>
                <input type="text" name="elemenCP" value={formData.elemenCP} onChange={handleInputChange} placeholder="Cth: Menyimak / Berbicara / Menulis" className={inputStyle} />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Tujuan Pembelajaran <span className="text-red-500">*</span></label>
              <textarea name="tujuan" value={formData.tujuan} onChange={handleInputChange} rows={3} placeholder="Tuliskan tujuan pembelajaran spesifik" className={inputStyle} required />
            </div>

            <div>
              <label className={labelStyle}>Pemahaman Bermakna (Opsional)</label>
              <textarea name="pemahamanBermakna" value={formData.pemahamanBermakna} onChange={handleInputChange} rows={2} placeholder="Contoh: Murid menyadari bahwa tumbuhan adalah makhluk hidup..." className={inputStyle}></textarea>
            </div>

            <div>
              <label className={labelStyle}>Pertanyaan Pemantik</label>
              <textarea name="pertanyaanPemantik" value={formData.pertanyaanPemantik} onChange={handleInputChange} rows={2} placeholder="Contoh: Apakah kalian menyukai olahraga? Olahraga apa yang sering kalian lakukan?" className={inputStyle}></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Model Pembelajaran <span className="text-red-500">*</span></label>
                <select name="model" value={formData.model} onChange={handleInputChange} className={inputStyle} required>
                  <option value="">Pilih Model Pembelajaran</option>
                  <option value="Discovery Learning">Discovery Learning</option>
                  <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                  <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                  <option value="Inquiry Based Learning">Inquiry Based Learning</option>
                  <option value="Tatap Muka (Direct Instruction)">Tatap Muka (Direct Instruction)</option>
                  <option value="Blended Learning">Blended Learning</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Metode Pembelajaran</label>
                <input type="text" name="metode" value={formData.metode} onChange={handleInputChange} placeholder="Contoh: Ceramah Interaktif, Tanya Jawab" className={inputStyle} />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Profil Pelajar Pancasila</label>
              <input type="text" name="profilPancasila" value={formData.profilPancasila} onChange={handleInputChange} placeholder="Cth: Beriman, Berkebinekaan Global, Mandiri, Bernalar Kritis, Kreatif" className={inputStyle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Alokasi Waktu (Durasi) <span className="text-red-500">*</span></label>
                <input type="text" name="durasi" value={formData.durasi} onChange={handleInputChange} placeholder="Cth: 2 x 45 menit" className={inputStyle} required />
              </div>
              <div>
                <label className={labelStyle}>Lingkungan Belajar</label>
                <select name="lingkunganBelajar" value={formData.lingkunganBelajar} onChange={handleInputChange} className={inputStyle}>
                  <option value="Di dalam kelas (Indoor)">Di dalam kelas (Indoor)</option>
                  <option value="Di luar kelas (Outdoor)">Di luar kelas (Outdoor)</option>
                  <option value="Kombinasi (Indoor & Outdoor)">Kombinasi (Indoor & Outdoor)</option>
                  <option value="Daring / Online">Daring / Online</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Instruksi atau Permintaan Khusus (Opsional)</label>
              <textarea name="instruksi" value={formData.instruksi} onChange={handleInputChange} rows={3} placeholder="Contoh: Fokuskan kegiatan penutup pada game tanya jawab." className={inputStyle}></textarea>
            </div>

            <button type="submit" disabled={isLoading} className={primaryButtonStyle}>Generate RPP/Modul Ajar (Tabel)</button>
          </form>
        );
      case 'lkpd':
        return (
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className={sectionTitleStyle}><FileSignature className="text-slate-600 w-6 h-6" /> {tool.title}</h3>

            {renderIdentitas()}
            {renderCommonTop()}
            {renderMapelField()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Judul Aktivitas/LKPD <span className="text-red-500">*</span></label>
                <input type="text" name="judul" value={formData.judul} onChange={handleInputChange} placeholder="Contoh: Eksperimen Gaya Gesek" className={inputStyle} required />
              </div>
              <div>
                <label className={labelStyle}>Pendekatan LKPD <span className="text-red-500">*</span></label>
                <select name="jenisLKPD" value={formData.jenisLKPD} onChange={handleInputChange} className={inputStyle} required>
                  <option value="">Pilih Tujuan Utama LKPD</option>
                  <option value="Menemukan Konsep Baru (Konstruktivisme/Eksplorasi)">Menemukan Konsep Baru (Eksplorasi)</option>
                  <option value="Menerapkan & Mengintegrasikan Konsep">Menerapkan & Mengintegrasikan Konsep</option>
                  <option value="Praktikum / Eksperimen Laboratorium">Praktikum / Eksperimen Lab</option>
                  <option value="Pemecahan Masalah (Problem Solving)">Pemecahan Masalah (Problem Solving)</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Tujuan Pembelajaran / Kompetensi Dasar <span className="text-red-500">*</span></label>
              <textarea name="kompetensi" value={formData.kompetensi} onChange={handleInputChange} rows={2} placeholder="Contoh: Siswa dapat menemukan hubungan antara gaya dan percepatan" className={inputStyle} required />
            </div>

            <div>
              <label className={labelStyle}>Fenomena / Kasus Pemantik (Opsional)</label>
              <textarea name="fenomena" value={formData.fenomena} onChange={handleInputChange} rows={2} placeholder="Tuliskan cerita pendek atau fenomena konkrit untuk memancing observasi awal siswa" className={inputStyle}></textarea>
            </div>

            <div>
              <label className={labelStyle}>Alat dan Bahan (Opsional)</label>
              <textarea name="alatBahan" value={formData.alatBahan} onChange={handleInputChange} rows={2} placeholder="Contoh: Kertas polos, Jangka, Penggaris, Gunting, Busur derajat" className={inputStyle}></textarea>
            </div>

            <div>
              <label className={labelStyle}>Instruksi Tugas / Arahan Langkah Kerja <span className="text-red-500">*</span></label>
              <textarea name="tugas" value={formData.tugas} onChange={handleInputChange} rows={3} placeholder="Tuliskan gambaran singkat kegiatan inti siswa (misal: Siswa menggambar lingkaran lalu menggunting 16 juring...)" className={inputStyle} required />
            </div>

            <div>
              <label className={labelStyle}>Kurikulum</label>
              <textarea name="kurikulum" value={formData.kurikulum} onChange={handleInputChange} rows={3} placeholder="Kurikulum Merdeka (KM) | Kurikulum Berbasis Cinta (KBC) Kemenag | Prinsip Pembelajaran Mendalam (PM) | Konsep Deep Learning | dll" className={inputStyle}></textarea>
            </div>

            <div>
              <label className={labelStyle}>Instruksi Khusus (Opsional)</label>
              <textarea name="instruksi" value={formData.instruksi} onChange={handleInputChange} rows={2} placeholder="Contoh: LKPD harus bisa dikerjakan secara berkelompok 3 orang, siapkan ruang 5 baris untuk kesimpulan." className={inputStyle}></textarea>
            </div>

            <button type="submit" disabled={isLoading} className={primaryButtonStyle}>Generate LKPD Akademik</button>
          </form>
        );
      case 'materi':
        return (
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className={sectionTitleStyle}><BookMarked className="text-slate-600" /> {tool.title}</h3>
            <p className={helperTextStyle}>Kolom bertanda <span className="text-red-500">*</span> wajib diisi.</p>
            {renderIdentitas()}
            {renderCommonTop()}
            <div>
              <label className={labelStyle}>Judul Bahan Ajar <span className="text-red-500">*</span></label>
              <input type="text" name="judulBahanAjar" value={formData.judulBahanAjar} onChange={handleInputChange} placeholder="Contoh: Fotosintesis: Proses dan Hasil" className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Teks Panjang atau Poin-poin Materi <span className="text-red-500">*</span></label>
              <textarea name="teksMateri" value={formData.teksMateri} onChange={handleInputChange} rows={6} placeholder="Tempelkan teks lengkap atau poin-poin yang ingin diringkas/diformat ulang..." className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Jenis Output <span className="text-red-500">*</span></label>
              <select name="jenisOutput" value={formData.jenisOutput} onChange={handleInputChange} className={inputStyle} required>
                <option value="">Pilih Jenis Output</option>
                <option value="Ringkasan Eksekutif">Ringkasan Eksekutif</option>
                <option value="Poin-poin Penting">Poin-poin Penting</option>
                <option value="Tanya Jawab (FAQ)">Tanya Jawab (FAQ)</option>
                <option value="Bahan Ajar Lengkap">Bahan Ajar Lengkap</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Kurikulum</label>
              <textarea name="kurikulum" value={formData.kurikulum} onChange={handleInputChange} rows={3} placeholder="Kurikulum Merdeka (KM) | Kurikulum Berbasis Cinta (KBC) Kemenag | Prinsip Pembelajaran Mendalam (PM) | Konsep Deep Learning | dll" className={inputStyle}></textarea>
            </div>
            <div>
              <label className={labelStyle}>Instruksi atau Permintaan Khusus (Opsional)</label>
              <textarea name="instruksi" value={formData.instruksi} onChange={handleInputChange} rows={3} placeholder="Contoh : Gunakan bahasa yang sangat sederhana untuk siswa SD kelas 4." className={inputStyle}></textarea>
            </div>
            <button type="submit" disabled={isLoading} className={primaryButtonStyle}>Generate Teks/Ringkasan</button>
          </form>
        );
      case 'soal':
        return (
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className={sectionTitleStyle}><HelpCircle className="text-slate-600" /> {tool.title}</h3>
            <p className={helperTextStyle}>Sistem akan menghasilkan 4 komponen: Naskah Soal, Kunci Jawaban, Kisi-kisi, dan Kartu Soal.</p>

            {renderIdentitas()}
            {renderCommonTop()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Tahun Pelajaran <span className="text-red-500">*</span></label>
                <input type="text" name="tahunPenyusunan" value={formData.tahunPenyusunan} onChange={handleInputChange} placeholder="Contoh: 2024/2025" className={inputStyle} required />
              </div>
              <div className="-mt-5">
                {renderMapelField()}
              </div>
            </div>

            <div>
              <label className={labelStyle}>Capaian Pembelajaran / Kompetensi Dasar <span className="text-red-500">*</span></label>
              <textarea name="kompetensi" value={formData.kompetensi} onChange={handleInputChange} rows={2} placeholder="Contoh: Peserta didik mampu menganalisis informasi..." className={inputStyle} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Bentuk Soal <span className="text-red-500">*</span></label>
                <select name="bentukSoal" value={formData.bentukSoal} onChange={handleInputChange} className={inputStyle} required>
                  <option value="">Pilih Bentuk Soal</option>
                  <option value="Pilihan Ganda">Pilihan Ganda</option>
                  <option value="Esai/Uraian">Esai/Uraian</option>
                  <option value="Isian Singkat">Isian Singkat</option>
                  <option value="Benar/Salah">Benar/Salah</option>
                  <option value="Menjodohkan">Menjodohkan</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Topik/Kata Kunci Soal <span className="text-red-500">*</span></label>
                <input type="text" name="topikSoal" value={formData.topikSoal} onChange={handleInputChange} placeholder="Contoh: Kemerdekaan Indonesia" className={inputStyle} required />
              </div>
            </div>

            {/* KOMPONEN BARU: DISTRIBUSI KESULITAN & TARGET KOGNITIF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
              <div>
                <label className={`${labelStyle} text-emerald-800`}>Distribusi Kesulitan</label>
                <div className="mt-3">
                  {renderDistribusiRow('Mudah', 'checkMudah', 'distribusiMudah')}
                  {renderDistribusiRow('Sedang', 'checkSedang', 'distribusiSedang')}
                  {renderDistribusiRow('Sulit', 'checkSulit', 'distribusiSulit')}
                </div>
              </div>
              <div>
                <label className={`${labelStyle} text-emerald-800`}>Target Kognitif</label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map(c => {
                    const isSelected = formData.targetKognitif.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleKognitif(c)}
                        className={`px-4 py-2 font-bold rounded-2xl border-[2px] transition-all ${isSelected ? 'border-blue-600 bg-slate-100 text-slate-600 shadow-sm shadow-slate-200/20' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:border-gray-400'}`}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-slate-600 mt-4 leading-relaxed">* Pilih satu atau lebih target kognitif (Taksonomi Bloom) yang ingin diukur dalam soal ini.</p>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Teks Materi Referensi (Opsional)</label>
              <textarea name="referensi" value={formData.referensi} onChange={handleInputChange} rows={3} placeholder="Tempelkan teks materi di sini jika ada." className={inputStyle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Kurikulum</label>
                <textarea name="kurikulum" value={formData.kurikulum} onChange={handleInputChange} rows={2} placeholder="Kurikulum Merdeka (KM) | KBC Kemenag | dll" className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Instruksi Khusus (Opsional)</label>
                <textarea name="instruksi" value={formData.instruksi} onChange={handleInputChange} rows={2} placeholder="Contoh : Buatlah soal berbentuk studi kasus." className={inputStyle} />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Visualisasi Gambar (Opsional)</label>
              <select name="visualisasi" value={formData.visualisasi} onChange={handleInputChange} className={inputStyle}>
                <option value="">Tidak Perlu Gambar (Teks Saja)</option>
                <option value="Ya, Sertakan Ilustrasi/Gambar Secara Otomatis">Ya, Sertakan Ilustrasi/Gambar Secara Otomatis</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading} className={primaryButtonStyle}>Generate Komponen Soal</button>
          </form>
        );
      case 'presentasi':
        return (
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className={sectionTitleStyle}><MonitorPlay className="text-slate-600" /> {tool.title}</h3>
            {renderIdentitas()}
            {renderCommonTop()}
            {renderMapelField()}
            <div>
              <label className={labelStyle}>Topik/Judul Presentasi <span className="text-red-500">*</span></label>
              <input type="text" name="topik" value={formData.topik} onChange={handleInputChange} placeholder="Contoh: Pemanasan Global dan Dampaknya" className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Tujuan Pembelajaran Presentasi <span className="text-red-500">*</span></label>
              <textarea name="tujuanPresentasi" value={formData.tujuanPresentasi} onChange={handleInputChange} rows={3} placeholder="Contoh: Siswa dapat menjelaskan 3 penyebab utama pemanasan global." className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Estimasi Durasi Presentasi <span className="text-red-500">*</span></label>
              <input type="text" name="durasiPresentasi" value={formData.durasiPresentasi} onChange={handleInputChange} placeholder="Contoh: 30 menit (5 slide)" className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Instruksi Khusus (Opsional)</label>
              <textarea name="instruksi" value={formData.instruksi} onChange={handleInputChange} rows={3} placeholder="Contoh : Buatkan kerangka untuk 7 slide, termasuk bagian Q&A." className={inputStyle}></textarea>
            </div>
            <button type="submit" disabled={isLoading} className={primaryButtonStyle}>Generate Kerangka Presentasi</button>
          </form>
        );
      case 'rubrik':
        return (
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className={sectionTitleStyle}><ListChecks className="text-slate-600" /> {tool.title}</h3>
            {renderIdentitas()}
            {renderCommonTop()}
            {renderMapelField()}
            <div>
              <label className={labelStyle}>Jenis Tugas <span className="text-red-500">*</span></label>
              <select name="tugasType" value={formData.tugasType} onChange={handleInputChange} className={inputStyle} required>
                <option value="">Pilih Jenis Tugas</option>
                <option value="Menulis Teks/Karangan">Menulis Teks/Karangan</option>
                <option value="Presentasi Lisan">Presentasi Lisan</option>
                <option value="Proyek Kelompok">Proyek Kelompok</option>
                <option value="Produk Kreatif/Karya Seni">Produk Kreatif/Karya Seni</option>
                <option value="Praktikum/Eksperimen">Praktikum/Eksperimen</option>
                <option value="Ujian Praktik">Ujian Praktik</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Kriteria Penilaian Spesifik <span className="text-red-500">*</span></label>
              <textarea name="kriteria" value={formData.kriteria} onChange={handleInputChange} rows={4} placeholder="Contoh: Sistematika penulisan, orisinalitas ide..." className={inputStyle} required />
            </div>
            <button type="submit" disabled={isLoading} className={primaryButtonStyle}>Generate Rubrik Penilaian</button>
          </form>
        );
      case 'icebreak':
        return (
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className={sectionTitleStyle}><Dices className="text-slate-600" /> {tool.title}</h3>
            {renderIdentitas()}
            {renderCommonTop()}
            {renderMapelField()}
            <div>
              <label className={labelStyle}>Topik/Materi yang Akan Diajarkan <span className="text-red-500">*</span></label>
              <input type="text" name="topik" value={formData.topik} onChange={handleInputChange} placeholder="Contoh: Fungsi Trigonometri" className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Estimasi Waktu <span className="text-red-500">*</span></label>
              <select name="durasiIce" value={formData.durasiIce} onChange={handleInputChange} className={inputStyle} required>
                <option value="">Pilih Durasi</option>
                <option value="5 Menit">5 Menit</option>
                <option value="10 Menit">10 Menit</option>
                <option value="15 Menit">15 Menit</option>
                <option value="Fleksibel">Fleksibel</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Tujuan Khusus Ice Breaking <span className="text-red-500">*</span></label>
              <select name="tujuanIce" value={formData.tujuanIce} onChange={handleInputChange} className={inputStyle} required>
                <option value="">Pilih Tujuan</option>
                <option value="Konsentrasi">Melatih Konsentrasi</option>
                <option value="Semangat/Energi">Meningkatkan Semangat</option>
                <option value="Kerjasama Tim">Kerjasama Tim (Collaboration)</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading} className={primaryButtonStyle}>Generate Ice Breaking</button>
          </form>
        );
      case 'refleksi':
        return (
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className={sectionTitleStyle}><Heart className="text-slate-600" /> Jurnal & Refleksi Mengajar</h3>
            {renderIdentitas()}
            {renderCommonTop()}
            <div>
              <label className={labelStyle}>Isi Refleksi Anda <span className="text-red-500">*</span></label>
              <textarea name="permasalahan" value={formData.permasalahan} onChange={handleInputChange} rows={6} placeholder="Tuliskan tantangan, keberhasilan, atau kejadian menarik di kelas hari ini..." className={inputStyle} required />
            </div>
            <button type="submit" disabled={isLoading} className={primaryButtonStyle}>Simpan & Analisis Refleksi</button>
          </form>
        );
      default: return null;
    }
  };
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shadow-slate-200/20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors" aria-label="Kembali"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-3">
            <div className={`${tool.color} w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-slate-200/20`}>
              {getIcon(tool.iconName, "text-white w-5 h-5")}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{tool.title}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 md:p-10 rounded-[28px] shadow-sm shadow-slate-200/20 border border-slate-200 mb-12">
            {renderFormContent()}
          </div>

          {(messages.length > 1 || isLoading) && (
            <div className="space-y-6 animate-fadeIn pb-20">
              {messages.filter(m => m.role === 'model').map((msg, idx) => (
                <div key={idx} className="bg-white p-8 md:p-14 rounded-sm shadow-2xl shadow-slate-200/50 border border-slate-200 mt-8 text-slate-900 mx-auto w-full max-w-4xl" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

                  {/* --- KOP DOKUMEN PREVIEW (NON SOAL & NON RPP) --- */}
                  {tool.id !== 'soal' && tool.id !== 'rpp' && (
                    <div className="text-center mb-8">
                      <h1 className="text-lg md:text-xl font-bold uppercase mb-6 tracking-wide">{tool.title}</h1>
                      <table className="w-full text-left text-sm md:text-base mb-6 border-collapse">
                        <tbody>
                          <tr><td className="py-1 font-bold w-1/3">Nama Guru</td><td className="py-1">: {formData.namaGuru || '-'}</td></tr>
                          <tr><td className="py-1 font-bold">NIP Guru</td><td className="py-1">: {formData.nipGuru || '-'}</td></tr>
                          <tr><td className="py-1 font-bold">Instansi/Sekolah</td><td className="py-1">: {formData.namaSekolah || '-'}</td></tr>
                          <tr><td className="py-1 font-bold">Jenjang/Kelas</td><td className="py-1">: {formData.jenjang || '-'} / {formData.kelas || '-'}</td></tr>
                          <tr><td className="py-1 font-bold">Mata Pelajaran</td><td className="py-1">: {formData.mapel === 'Lainnya' ? formData.mapelKustom : formData.mapel || '-'}</td></tr>
                        </tbody>
                      </table>
                      <div className="w-full border-b-2 border-slate-300"></div>
                    </div>
                  )}

                  {/* --- KOP KHUSUS RPP --- */}
                  {tool.id === 'rpp' && (
                    <div className="text-center mb-8 border-b-[3px] border-slate-300 pb-4">
                      <h1 className="text-xl md:text-2xl font-bold uppercase mb-2 tracking-wide">MODUL AJAR: {formData.mapel === 'Lainnya' ? formData.mapelKustom : formData.mapel || '-'}</h1>
                      <p className="text-sm md:text-base italic text-slate-700">Materi: {formData.topik || '-'} - Kelas {formData.kelas || '-'}</p>
                    </div>
                  )}

                  {/* --- KOP KHUSUS SOAL --- */}
                  {tool.id === 'soal' && (
                    <div className="text-center mb-4">
                      <h1 className="text-lg md:text-xl font-bold uppercase mb-2 tracking-wide">NASKAH SOAL</h1>
                      <p className="text-sm md:text-base mb-6">Mapel: {formData.mapel === 'Lainnya' ? formData.mapelKustom : formData.mapel || '-'} | Kelas: {formData.kelas || '-'}</p>
                      <div className="w-full border-b-2 border-slate-300 mb-6"></div>
                    </div>
                  )}

                  {/* --- ISI DOKUMEN --- */}
                  {tool.id === 'soal' ? (
                    <div className="space-y-4">
                      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar" style={{ fontFamily: "Inter, sans-serif" }}>
                        {parseSections(msg.text).map((sec, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveSoalTab(i)}
                            className={`px-5 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${activeSoalTab === i ? 'text-slate-600 border-blue-600 bg-slate-100' : 'text-slate-600 border-transparent hover:text-blue-500 hover:bg-slate-50'}`}
                          >
                            {sec.title}
                          </button>
                        ))}
                      </div>
                      <div className="text-justify leading-relaxed text-[14px] md:text-[15px]">
                        {(() => {
                          const sections = parseSections(msg.text);
                          if (sections[activeSoalTab]) {
                            return (
                              <div>
                                {sections[activeSoalTab].title !== "Naskah Soal" && (
                                  <h2 className="text-[15px] md:text-base font-bold uppercase mb-4 text-center">{sections[activeSoalTab].title}</h2>
                                )}
                                {renderContentWithFormatting(sections[activeSoalTab].content, sections[activeSoalTab].title)}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  ) : tool.id === 'rpp' ? (
                    renderRppTableUI(parseSections(msg.text))
                  ) : (
                    <div className="space-y-3 text-justify leading-relaxed text-[14px] md:text-[15px]">
                      {parseSections(msg.text).map((section, sIdx) => {
                        return (
                          <div key={sIdx} className="mb-6">
                            {section.title && section.title !== "Rangkuman Utama" && section.title !== "Hasil Lengkap" && (
                              <h2 className="text-[15px] md:text-base font-bold uppercase mb-3 mt-6">{section.title}</h2>
                            )}
                            <div className="space-y-3">
                              {renderContentWithFormatting(section.content, section.title)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* --- LEMBAR PENGESAHAN DOKUMEN --- */}
                  {tool.id === 'rpp' && (
                    <div className="mt-16 pt-8 grid grid-cols-2 gap-8 text-center text-sm md:text-[15px]">
                      <div>
                        <p>Mengetahui,</p>
                        <p>Kepala {formData.namaSekolah || 'Sekolah'}</p>
                        <div className="h-24"></div>
                        <p className="font-bold underline">{formData.namaKepsek || '...............................................'}</p>
                        <p>NIP. {formData.nipKepsek || '...................................'}</p>
                      </div>
                      <div>
                        <p><br /></p>
                        <p>Guru Mata Pelajaran</p>
                        <div className="h-24"></div>
                        <p className="font-bold underline">{formData.namaGuru || '...............................................'}</p>
                        <p>NIP. {formData.nipGuru || '...................................'}</p>
                      </div>
                    </div>
                  )}

                  {/* --- ACTION BUTTONS --- */}
                  <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap justify-center items-center gap-4 print:hidden" style={{ fontFamily: "Inter, sans-serif" }}>
                    <button onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                      alert('Teks berhasil disalin!');
                    }} className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 border border-slate-200 shadow-sm shadow-slate-200/20">
                      <Copy className="w-4 h-4" /> Salin Teks Mentah
                    </button>
                    <button onClick={downloadWord} className="bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-slate-100 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-slate-200/30 shadow-blue-900/20 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Download Microsoft Word (.doc)
                    </button>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-[28px] border border-slate-200 shadow-sm shadow-slate-200/20 animate-pulse">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                      <Brain className="text-slate-600 w-10 h-10" />
                    </div>
                    <div className="absolute inset-0 border-4 border-t-blue-600 border-slate-200 rounded-full animate-spin"></div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xl">Sedang Merancang Konten Profesional...</h4>
                  <p className="text-sm text-slate-500 mt-2 font-medium">Mohon tunggu sebentar, asisten AI sedang menyusun materi terbaik untuk Anda.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div ref={messagesEndRef} />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
// --- COMPONENT: SIDEBAR ---
interface SidebarProps {
  onSelectTool: (id: ToolCategory | null) => void;
  activeToolId: ToolCategory | null;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectTool, activeToolId, isOpen, onClose }) => {
  const { data: session } = useSession();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-100">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => { onSelectTool(null); onClose(); }}
            >
              <div className="w-12 h-12 bg-blue-600 text-white shadow-md shadow-blue-200 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/30 shadow-blue-100 group-hover:rotate-6 transition-transform">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-indigo-200 leading-tight">Asisten Guru AI</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">by eSolusi.id</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navigasi</p>
            <button
              onClick={() => { onSelectTool(null); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeToolId === null
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-bold shadow-md shadow-slate-200/20 shadow-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <House className="w-5 h-5" />
              Beranda Utama
            </button>

            {/* Admin Dashboard Link - Only visible to admins */}
            {session?.user?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              >
                <Shield className="w-5 h-5" />
                Dashboard Admin
              </Link>
            )}

            <div className="my-6 border-t border-slate-100"></div>
            <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tools Mengajar</p>
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => { onSelectTool(tool.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${activeToolId === tool.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-bold shadow-md shadow-slate-200/20 shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeToolId === tool.id ? 'bg-white' : 'bg-blue-300 group-hover:bg-blue-500'}`}></div>
                <span className="truncate text-sm">{tool.title}</span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold uppercase">
                  {session?.user?.name?.[0] || <User className="w-5 h-5" />}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{session?.user?.email || ''}</p>
                  <p className="text-[10px] text-slate-600 font-medium tracking-tight uppercase">Akun {session?.user?.role || 'User'}</p>
                </div>
                <Link
                  href="/profile"
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                  title="Pengaturan Profil"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-red-100 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors"
              >
                <Power className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
// --- COMPONENT: APP MAIN ---
const App: React.FC = () => {
  const router = useRouter();
  const [activeToolId, setActiveToolId] = useState<ToolCategory | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  // Redirect to new JSON-based tool pages
  const handleSelectTool = (id: ToolCategory | null) => {
    if (id === 'soal') {
      router.push('/tools/buat-soal');
    } else if (id === 'rpp') {
      router.push('/tools/rpp');
    } else if (id === 'lkpd') {
      router.push('/tools/lkpd');
    } else if (id === 'materi') {
      router.push('/tools/materi');
    } else if (id === 'presentasi') {
      router.push('/tools/presentasi');
    } else if (id === 'rubrik') {
      router.push('/tools/rubrik');
    } else if (id === 'icebreak') {
      router.push('/tools/icebreak');
    } else if (id === 'refleksi') {
      router.push('/tools/refleksi');
    } else {
      setActiveToolId(id);
    }
  };

  const activeTool = TOOLS.find(t => t.id === activeToolId) || null;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      <Sidebar
        onSelectTool={handleSelectTool}
        activeToolId={activeToolId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-200/20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveToolId(null)}
            >
              <div className="w-10 h-10 bg-blue-600 text-white shadow-md shadow-blue-200 rounded-xl flex items-center justify-center shadow-md shadow-slate-200/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <div className="block">
                <h1 className="font-bold text-indigo-200 leading-tight text-lg">Asisten Guru AI</h1>
                <p className="text-[11px] text-slate-600 font-medium">by eSolusi.id - Kerjaan Beres Tanpa Ribet</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">Sistem Aktif</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-all border border-transparent"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {activeToolId ? (
              <ToolView key={activeToolId} tool={activeTool!} onBack={() => setActiveToolId(null)} />
            ) : (
              <Dashboard onSelectTool={handleSelectTool} />
            )}
          </div>
        </main>
      </div>

      {/* Engagement Banner - Shows promotional announcements to users */}
      <EngagementBanner />
    </div>
  );
};

export default App;


