// ============================================
// SHARED PREVIEW TABS COMPONENT FOR ALL TOOLS
// ============================================

'use client'

import React from 'react'

// Download and Copy icons
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
)

// Tab definitions for each tool type
export const TOOL_TABS = {
  rpp: [
    { key: 'identitas', label: 'Identitas' },
    { key: 'tujuan', label: 'Tujuan Pembelajaran' },
    { key: 'langkah', label: 'Langkah Pembelajaran' },
    { key: 'asesmen', label: 'Asesmen' },
  ],
  lkpd: [
    { key: 'judul', label: 'Judul & Petunjuk' },
    { key: 'tujuan', label: 'Tujuan' },
    { key: 'kegiatan', label: 'Kegiatan' },
    { key: 'pertanyaan', label: 'Pertanyaan' },
  ],
  materi: [
    { key: 'ringkasan', label: 'Ringkasan' },
    { key: 'poin', label: 'Poin Penting' },
    { key: 'contoh', label: 'Contoh' },
  ],
  presentasi: [
    { key: 'slides', label: 'Slides' },
    { key: 'kesimpulan', label: 'Kesimpulan' },
  ],
  rubrik: [
    { key: 'rubrik', label: 'Rubrik' },
    { key: 'skala', label: 'Skala Penilaian' },
  ],
  icebreak: [
    { key: 'aktivitas', label: 'Aktivitas' },
    { key: 'langkah', label: 'Langkah' },
    { key: 'tips', label: 'Tips' },
  ],
  refleksi: [
    { key: 'ringkasan', label: 'Ringkasan' },
    { key: 'analisis', label: 'Analisis' },
    { key: 'motivasi', label: 'Kata Motivasi' },
  ],
  exam: [
    { key: 'naskah', label: 'Naskah Soal' },
    { key: 'kunci', label: 'Kunci Jawaban' },
    { key: 'kisi', label: 'Kisi-Kisi' },
    { key: 'kartu', label: 'Kartu Soal' },
  ],
} as const

export type ToolType = keyof typeof TOOL_TABS
export type ToolTabKey = typeof TOOL_TABS[ToolType][number]['key']

interface ToolPreviewTabsProps {
  tool: ToolType
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ToolPreviewTabs({ tool, activeTab, onTabChange }: ToolPreviewTabsProps) {
  const tabs = TOOL_TABS[tool] || []

  return (
    <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === tab.key
              ? 'text-blue-600 border-blue-600 bg-blue-50'
              : 'text-slate-600 border-transparent hover:text-blue-500 hover:bg-slate-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// Action buttons component
interface ToolActionsProps {
  onCopy: () => void
  onDownload: () => void
  downloadLabel?: string
}

export function ToolActions({ onCopy, onDownload, downloadLabel = 'Download DOCX' }: ToolActionsProps) {
  return (
    <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap justify-center gap-3">
      <button
        onClick={onCopy}
        className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-slate-200 shadow-sm"
      >
        <CopyIcon /> Salin Data
      </button>
      <button
        onClick={onDownload}
        className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700"
      >
        <FileTextIcon /> {downloadLabel}
      </button>
    </div>
  )
}
