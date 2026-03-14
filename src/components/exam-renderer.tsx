// ============================================
// EXAM RENDERING ENGINE
// ============================================

'use client'

import React from 'react'
import { ExamGenerationResponse, Question, EducatorIdentity } from '@/lib/exam-schema'

// Icons
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

interface ExamRendererProps {
  data: ExamGenerationResponse
  images?: Record<number, string>
  activeTab: ExamTab
}

export type ExamTab = 'naskah' | 'kunci' | 'kisi' | 'kartu'

// Badge styles for difficulty and cognitive levels
const getDifficultyBadge = (difficulty: string) => {
  const styles: Record<string, string> = {
    mudah: 'bg-green-100 text-green-700',
    sedang: 'bg-yellow-100 text-yellow-700',
    sulit: 'bg-red-100 text-red-700',
  }
  return styles[difficulty.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

const getCognitiveBadge = (level: string) => {
  const num = parseInt(level.replace('C', ''))
  if (num <= 2) return 'bg-blue-100 text-blue-700'
  if (num <= 4) return 'bg-purple-100 text-purple-700'
  return 'bg-pink-100 text-pink-700'
}

// Render educator identity header
function renderEducatorHeader(educator?: EducatorIdentity, metadata?: ExamGenerationResponse['metadata']) {
  if (!educator && !metadata) return null

  return (
    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
      <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase">Identitas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        {educator?.teacher_name && (
          <div><span className="font-medium">Nama Guru:</span> {educator.teacher_name}</div>
        )}
        {educator?.teacher_nip && (
          <div><span className="font-medium">NIP:</span> {educator.teacher_nip}</div>
        )}
        {educator?.school_name && (
          <div><span className="font-medium">Sekolah:</span> {educator.school_name}</div>
        )}
        {metadata?.subject && (
          <div><span className="font-medium">Mata Pelajaran:</span> {metadata.subject}</div>
        )}
        {metadata?.topic && (
          <div><span className="font-medium">Materi:</span> {metadata.topic}</div>
        )}
        {metadata?.class_level && (
          <div><span className="font-medium">Kelas:</span> {metadata.class_level}</div>
        )}
      </div>
    </div>
  )
}

// Render single question
function renderQuestion(q: Question, imageUrl?: string) {
  return (
    <div key={q.number} className="mb-6 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-colors">
      {/* Question header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
          {q.number}
        </span>
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getDifficultyBadge(q.difficulty)}`}>
            {q.difficulty}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getCognitiveBadge(q.cognitive_level)}`}>
            {q.cognitive_level}
          </span>
        </div>
      </div>

      {/* Question text */}
      <p className="text-slate-900 mb-4 text-justify leading-relaxed">
        {q.question_text}
      </p>

      {/* Image */}
      {imageUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={imageUrl}
            alt={`Question ${q.number}`}
            className="max-w-md rounded-lg border border-slate-200"
          />
        </div>
      )}

      {/* Options for multiple choice */}
      {q.type === 'multiple_choice' && q.options && (
        <div className="space-y-2 ml-10">
          {q.options.map((opt) => (
            <div key={opt.label} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-slate-100 rounded font-semibold text-sm text-slate-700 shrink-0">
                {opt.label}
              </span>
              <span className="text-slate-800">{opt.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Render answer key table
function renderAnswerKey(questions: Question[]) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">No</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">Kunci</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">Pembahasan</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.number} className={q.number % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
              <td className="px-4 py-3 border-b border-slate-200">{q.number}</td>
              <td className="px-4 py-3 border-b border-slate-200 font-semibold text-blue-700">{q.correct_answer}</td>
              <td className="px-4 py-3 border-b border-slate-200 text-slate-700">{q.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Render kisi-kisi table
function renderKisiKisi(questions: Question[]) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-purple-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">No</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">Materi</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">Indikator Soal</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">Level Kognitif</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-b border-slate-200">Kesulitan</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.number} className={q.number % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
              <td className="px-4 py-3 border-b border-slate-200">{q.number}</td>
              <td className="px-4 py-3 border-b border-slate-200">{q.material}</td>
              <td className="px-4 py-3 border-b border-slate-200">{q.indicator}</td>
              <td className="px-4 py-3 border-b border-slate-200">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getCognitiveBadge(q.cognitive_level)}`}>
                  {q.cognitive_level}
                </span>
              </td>
              <td className="px-4 py-3 border-b border-slate-200">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getDifficultyBadge(q.difficulty)}`}>
                  {q.difficulty}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Render kartu soal
function renderKartuSoal(questions: Question[], metadata?: ExamGenerationResponse['metadata']) {
  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.number} className="border border-slate-200 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
            <h4 className="font-bold text-slate-900">Soal No. {q.number}</h4>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getDifficultyBadge(q.difficulty)}`}>
                {q.difficulty}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getCognitiveBadge(q.cognitive_level)}`}>
                {q.cognitive_level}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span className="font-medium text-slate-600">Materi:</span>
              <p className="text-slate-900">{q.material}</p>
            </div>
            <div>
              <span className="font-medium text-slate-600">Indikator:</span>
              <p className="text-slate-900">{q.indicator}</p>
            </div>
          </div>

          <div className="mb-3">
            <span className="font-medium text-slate-600 text-sm">Naskah Soal:</span>
            <p className="text-slate-900 mt-1 text-justify">{q.question_text}</p>
            {q.type === 'multiple_choice' && q.options && (
              <div className="mt-2 space-y-1 ml-4">
                {q.options.map((opt) => (
                  <div key={opt.label} className="text-slate-700">
                    {opt.label}. {opt.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-emerald-50 rounded-lg p-3">
            <span className="font-medium text-emerald-700 text-sm">Kunci Jawaban:</span>
            <span className="ml-2 font-bold text-emerald-800">{q.correct_answer}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Main component
export function ExamRenderer({ data, images = {}, activeTab }: ExamRendererProps) {
  const { metadata, educator, questions } = data

  const renderContent = () => {
    switch (activeTab) {
      case 'naskah':
        return (
          <div>
            {renderEducatorHeader(educator, metadata)}
            {questions.map((q) => renderQuestion(q, images[q.number]))}
          </div>
        )

      case 'kunci':
        return renderAnswerKey(questions)

      case 'kisi':
        return renderKisiKisi(questions)

      case 'kartu':
        return renderKartuSoal(questions, metadata)

      default:
        return null
    }
  }

  return (
    <div className="text-justify" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {renderContent()}
    </div>
  )
}

// Tab navigation component
interface ExamTabsProps {
  activeTab: ExamTab
  onTabChange: (tab: ExamTab) => void
}

export function ExamTabs({ activeTab, onTabChange }: ExamTabsProps) {
  const tabs: { key: ExamTab; label: string }[] = [
    { key: 'naskah', label: 'Naskah Soal' },
    { key: 'kunci', label: 'Kunci Jawaban' },
    { key: 'kisi', label: 'Kisi-Kisi' },
    { key: 'kartu', label: 'Kartu Soal' },
  ]

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
interface ExamActionsProps {
  data: ExamGenerationResponse
  onCopy: () => void
  onDownload: () => void
}

export function ExamActions({ data, onCopy, onDownload }: ExamActionsProps) {
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
        <FileTextIcon /> Download DOCX
      </button>
    </div>
  )
}
