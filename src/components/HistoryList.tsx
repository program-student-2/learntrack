import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, History, Trash2, Edit2, Check, X, Tag } from 'lucide-react';
import { Surface, cardEnter } from './ui/Surface';
import type { LearningRecord, UserSettings } from '../types';

interface Props {
  records: LearningRecord[];
  settings: UserSettings;
  onDelete: (id: string) => void;
  onEdit: (record: LearningRecord) => void;
}

export function HistoryList({ records, settings, onDelete, onEdit }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editMinutes, setEditMinutes] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return '未分類';
    const subject = settings.subjectGoals?.find((s) => s.id === subjectId);
    return subject ? subject.name : '未分類';
  };

  const startEditing = (record: LearningRecord) => {
    setEditingId(record.id);
    setEditContent(record.content);
    setEditHours(Math.floor(record.durationMinutes / 60).toString());
    setEditMinutes((record.durationMinutes % 60).toString());
    setEditSubjectId(record.subjectId || '');
  };

  const cancelEditing = () => setEditingId(null);

  const saveEdit = (record: LearningRecord) => {
    if (!editContent.trim()) return;
    const h = parseInt(editHours) || 0;
    const m = parseInt(editMinutes) || 0;
    const totalMinutes = h * 60 + m;
    if (totalMinutes === 0) return;
    onEdit({
      ...record,
      content: editContent.trim(),
      durationMinutes: totalMinutes,
      subjectId: editSubjectId || undefined,
    });
    setEditingId(null);
  };

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const hasSubjects = settings.subjectGoals && settings.subjectGoals.length > 0;

  return (
    <Surface variants={cardEnter} bare className="overflow-hidden">
      <div className="px-7 sm:px-8 py-6 border-b border-slate-100/80 flex justify-between items-center bg-gradient-to-br from-white via-slate-50/40 to-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-1.5 rounded-lg">
              <History className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              History
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">最近の学習履歴</h2>
        </div>
        <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-700 shadow-sm tabular-nums">
          {records.length} 件
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <History className="w-7 h-7 text-slate-300" />
            </div>
            <p className="font-medium text-slate-500">まだ学習記録がありません</p>
            <p className="text-xs mt-1 text-slate-400">左のフォームから今日の学習を記録しましょう</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {sortedRecords.map((record) => {
                const isEditing = editingId === record.id;

                if (isEditing) {
                  return (
                    <motion.li
                      key={record.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-indigo-50/60 border border-indigo-200 p-5 rounded-2xl ring-1 ring-indigo-500/15 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 w-full space-y-3 min-w-0">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800"
                            placeholder="学習内容"
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            {hasSubjects && (
                              <select
                                value={editSubjectId}
                                onChange={(e) => setEditSubjectId(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-700 text-sm"
                              >
                                <option value="">未分類</option>
                                {settings.subjectGoals.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={editHours}
                                onChange={(e) => setEditHours(e.target.value)}
                                className="w-20 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-700 text-center tabular-nums"
                              />
                              <span className="text-sm font-bold text-indigo-700/70">h</span>
                              <input
                                type="number"
                                min="0"
                                max="59"
                                value={editMinutes}
                                onChange={(e) => setEditMinutes(e.target.value)}
                                className="w-20 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-700 text-center tabular-nums"
                              />
                              <span className="text-sm font-bold text-indigo-700/70">m</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                          <button
                            onClick={cancelEditing}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                            title="キャンセル"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => saveEdit(record)}
                            className="p-2 text-white bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-lg transition-colors shadow-sm"
                            title="保存"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  );
                }

                return (
                  <motion.li
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="group relative bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-base truncate">
                        {record.content}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{record.date}</span>
                        </div>
                        {hasSubjects && (
                          <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {getSubjectName(record.subjectId)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0">
                      <div className="flex items-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/70 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-bold text-slate-800 text-sm">
                          {formatDuration(record.durationMinutes)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(record)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(record.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </Surface>
  );
}
