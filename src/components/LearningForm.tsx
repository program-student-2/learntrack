import React, { useState } from 'react';
import { Plus, BookOpen, Clock, CalendarDays, Book, Sparkles } from 'lucide-react';
import { Surface, cardEnter } from './ui/Surface';
import type { LearningRecord, UserSettings } from '../types';

interface Props {
  onAdd: (record: Omit<LearningRecord, 'id'>) => void;
  settings: UserSettings;
}

const inputBase =
  'w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 hover:bg-white';

const labelBase = 'text-xs font-semibold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider';

export function LearningForm({ onAdd, settings }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const hasSubjects = settings.subjectGoals && settings.subjectGoals.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalMinutes = h * 60 + m;
    if (totalMinutes === 0) return;

    onAdd({
      date,
      content: content.trim(),
      durationMinutes: totalMinutes,
      subjectId: subjectId || undefined,
    });

    setContent('');
    setHours('');
    setMinutes('');
  };

  return (
    <Surface variants={cardEnter} bare className="overflow-hidden">
      {/* Header strip */}
      <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-slate-100/80 bg-gradient-to-br from-white via-indigo-50/30 to-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 p-1.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/80">
            New Entry
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">今日の学習を記録</h2>
        <p className="text-xs text-slate-500 mt-0.5">小さな一歩も、積み上がれば大きな差に。</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
        <div className="space-y-1.5">
          <label className={labelBase}>
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            日付
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputBase}
          />
        </div>

        {hasSubjects && (
          <div className="space-y-1.5">
            <label className={labelBase}>
              <Book className="w-3.5 h-3.5 text-slate-400" />
              科目
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className={inputBase}
            >
              <option value="">未分類（指定なし）</option>
              {settings.subjectGoals.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className={labelBase}>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            学習内容
          </label>
          <input
            type="text"
            required
            placeholder={hasSubjects ? '例：第3章 演習問題' : '例：React Hooks の基礎'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={inputBase}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelBase}>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            学習時間
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <input
                type="number"
                min="0"
                placeholder="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={`${inputBase} pr-12 text-right tabular-nums`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold group-focus-within:text-indigo-600 transition-colors">
                時間
              </span>
            </div>
            <div className="relative flex-1 group">
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={`${inputBase} pr-10 text-right tabular-nums`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold group-focus-within:text-indigo-600 transition-colors">
                分
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="relative w-full mt-2 overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 group"
        >
          <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:translate-x-[420%] transition-transform duration-1000" />
          <Plus className="relative w-5 h-5" />
          <span className="relative">記録を追加</span>
        </button>
      </form>
    </Surface>
  );
}
