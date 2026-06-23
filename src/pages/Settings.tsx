import { useState } from 'react';
import { Save, User, Target, GraduationCap, Book, Plus, Trash2, Download, Upload, Database, AlertCircle } from 'lucide-react';
import { useApp } from '../components/Layout';
import { Surface, cardEnter, cardStagger } from '../components/ui/Surface';
import { motion } from 'framer-motion';
import type { SubjectGoal } from '../types';

const input =
  'w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 hover:bg-white';
const label = 'text-xs font-semibold text-slate-600 flex items-center gap-2 uppercase tracking-wider';

export function Settings() {
  const { records, settings, onUpdateSettings, onImportData } = useApp();
  const [userName, setUserName] = useState(settings.userName);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(settings.weeklyGoalHours.toString());
  const [finalGoalHours, setFinalGoalHours] = useState((settings.finalGoalHours || 100).toString());
  const [targetSchoolName, setTargetSchoolName] = useState(settings.targetSchoolName || '');
  const [subjectGoals, setSubjectGoals] = useState<SubjectGoal[]>(settings.subjectGoals || []);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddSubject = () => {
    setSubjectGoals([...subjectGoals, { id: crypto.randomUUID(), name: '', targetHours: 100 }]);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjectGoals(subjectGoals.filter((s) => s.id !== id));
  };

  const handleSubjectChange = (id: string, field: 'name' | 'targetHours', value: string) => {
    setSubjectGoals(
      subjectGoals.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: field === 'targetHours' ? parseInt(value) || 0 : value };
        }
        return s;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goal = parseInt(weeklyGoalHours);
    const finalGoal = parseInt(finalGoalHours);
    if (isNaN(goal) || goal <= 0 || isNaN(finalGoal) || finalGoal <= 0) return;
    const validSubjects = subjectGoals.filter((s) => s.name.trim() !== '');
    onUpdateSettings({
      userName: userName.trim(),
      weeklyGoalHours: goal,
      finalGoalHours: finalGoal,
      targetSchoolName: targetSchoolName.trim(),
      subjectGoals: validSubjects,
    });
    setSubjectGoals(validSubjects);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExport = () => {
    const data = { records, settings, version: '1.0', exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learntrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    // Reset so the same file can be picked again later
    const resetInput = () => { input.value = ''; };
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // Validate shape
        const validRecords =
          Array.isArray(data?.records) &&
          data.records.every(
            (r: any) =>
              r &&
              typeof r.id === 'string' &&
              typeof r.date === 'string' &&
              typeof r.content === 'string' &&
              typeof r.durationMinutes === 'number'
          );
        const validSettings =
          data?.settings &&
          typeof data.settings === 'object' &&
          typeof data.settings.weeklyGoalHours === 'number';

        if (!validRecords || !validSettings) {
          alert('無効なバックアップファイルです。');
          return;
        }

        if (!confirm(
          `データを復元しますか？\n\n記録: ${data.records.length} 件\n現在のデータは上書きされます。`
        )) return;

        // Normalize settings (fill in missing fields with safe defaults)
        const importedSettings = {
          userName: data.settings.userName ?? 'User',
          weeklyGoalHours: data.settings.weeklyGoalHours,
          finalGoalHours: data.settings.finalGoalHours ?? 100,
          targetSchoolName: data.settings.targetSchoolName ?? '',
          subjectGoals: Array.isArray(data.settings.subjectGoals) ? data.settings.subjectGoals : [],
        };

        // Update App-level state (will persist to localStorage via App's effects)
        onImportData(data.records, importedSettings);

        // Sync this page's local form state so inputs reflect the imported values
        setUserName(importedSettings.userName);
        setWeeklyGoalHours(String(importedSettings.weeklyGoalHours));
        setFinalGoalHours(String(importedSettings.finalGoalHours));
        setTargetSchoolName(importedSettings.targetSchoolName);
        setSubjectGoals(importedSettings.subjectGoals);

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch {
        alert('ファイルの読み込みに失敗しました。');
      } finally {
        resetInput();
      }
    };
    reader.onerror = () => {
      alert('ファイルの読み込みに失敗しました。');
      resetInput();
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl pb-12">
      <div className="mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600/80">
          Preferences
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">設定</h2>
        <p className="text-sm text-slate-500 mt-1.5">プロフィール・学習目標・志望校をカスタマイズ。</p>
      </div>

      <motion.form
        variants={cardStagger}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-7"
      >
        {/* 基本設定 */}
        <Surface variants={cardEnter}>
          <SectionHeader eyebrow="Basic" title="基本設定" />
          <div className="space-y-5">
            <Field>
              <label className={label}>
                <User className="w-3.5 h-3.5 text-slate-400" />
                ユーザー名
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={input}
                placeholder="あなたの名前"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field>
                <label className={label}>
                  <Target className="w-3.5 h-3.5 text-slate-400" />
                  週の学習目標
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={weeklyGoalHours}
                    onChange={(e) => setWeeklyGoalHours(e.target.value)}
                    className={`${input} pr-12 text-right tabular-nums`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                    時間
                  </span>
                </div>
              </Field>

              <Field>
                <label className={label}>
                  <Target className="w-3.5 h-3.5 text-slate-400" />
                  最終目標
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={finalGoalHours}
                    onChange={(e) => setFinalGoalHours(e.target.value)}
                    className={`${input} pr-12 text-right tabular-nums`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                    時間
                  </span>
                </div>
              </Field>
            </div>
          </div>
        </Surface>

        {/* 志望校・科目 */}
        <Surface variants={cardEnter}>
          <SectionHeader
            eyebrow="Target"
            title="志望校・科目設定"
            icon={<GraduationCap className="w-3.5 h-3.5 text-white" />}
            gradient="from-indigo-600 to-cyan-500"
          />
          <div className="space-y-5">
            <Field>
              <label className={label}>志望校名</label>
              <input
                type="text"
                value={targetSchoolName}
                onChange={(e) => setTargetSchoolName(e.target.value)}
                className={input}
                placeholder="例：東京大学 理科一類"
              />
              <p className="text-xs text-slate-500 mt-1">
                ダッシュボードやサイドバーに表示され、モチベーションを高めます。
              </p>
            </Field>

            <div className="space-y-3">
              <label className={label}>
                <Book className="w-3.5 h-3.5 text-slate-400" />
                科目別の目標時間
              </label>

              {subjectGoals.length === 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-sm text-slate-500">
                  科目が設定されていません。下のボタンから追加してください。
                </div>
              )}

              {subjectGoals.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-white p-3 rounded-2xl border border-slate-200/70"
                >
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      required
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                      placeholder="科目名（例：英語）"
                    />
                  </div>
                  <div className="w-28 relative shrink-0">
                    <input
                      type="number"
                      min="1"
                      required
                      value={subject.targetHours || ''}
                      onChange={(e) => handleSubjectChange(subject.id, 'targetHours', e.target.value)}
                      className="w-full pl-3 pr-7 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-right tabular-nums"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">h</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subject.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSubject}
                className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-indigo-600 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                科目を追加する
              </button>
            </div>
          </div>
        </Surface>

        {/* データ管理 */}
        <Surface variants={cardEnter}>
          <SectionHeader
            eyebrow="Data"
            title="バックアップと復元"
            icon={<Database className="w-3.5 h-3.5 text-white" />}
            gradient="from-amber-500 to-orange-500"
          />

          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-bold mb-0.5">注意：データはブラウザに保存されています</p>
                <p className="text-amber-800/80 text-xs leading-relaxed">
                  ブラウザのキャッシュをクリアしたり別のブラウザで開くと、データが失われます。定期的にバックアップを取得してください。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 shadow-sm"
              >
                <Download className="w-5 h-5 text-blue-500" />
                バックアップをダウンロード
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  id="import-data"
                />
                <label
                  htmlFor="import-data"
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 shadow-sm cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-emerald-500" />
                  バックアップから復元
                </label>
              </div>
            </div>
          </div>
        </Surface>

        <div className="flex items-center gap-4 sticky bottom-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-slate-200/70 z-10">
          <button
            type="submit"
            className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/30 text-white font-semibold py-2.5 px-7 rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98] flex items-center gap-2 shadow-md shadow-indigo-500/20 group"
          >
            <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:translate-x-[420%] transition-transform duration-1000" />
            <Save className="relative w-5 h-5" />
            <span className="relative">設定を保存</span>
          </button>
          {isSaved && (
            <span className="text-emerald-700 text-sm font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              保存しました
            </span>
          )}
        </div>
      </motion.form>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function SectionHeader({
  eyebrow,
  title,
  icon,
  gradient = 'from-slate-700 to-slate-900',
}: {
  eyebrow: string;
  title: string;
  icon?: React.ReactNode;
  gradient?: string;
}) {
  return (
    <div className="mb-6 pb-4 border-b border-slate-100">
      <div className="flex items-center gap-2 mb-1">
        <div className={`bg-gradient-to-br ${gradient} p-1.5 rounded-lg`}>
          {icon ?? <span className="block w-3.5 h-3.5" />}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {eyebrow}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
    </div>
  );
}
