import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GraduationCap, Target, BookOpen } from 'lucide-react';
import { Surface, cardEnter } from './ui/Surface';
import type { LearningRecord, UserSettings } from '../types';

interface Props {
  records: LearningRecord[];
  settings: UserSettings;
}

export function TargetSchoolDashboard({ records, settings }: Props) {
  const { targetSchoolName, subjectGoals } = settings;

  const { overallStats, subjectStats } = useMemo(() => {
    let totalTargetMinutes = 0;
    let totalAchievedMinutes = 0;

    const sStats = (subjectGoals || []).map((subject) => {
      const subjectRecords = records.filter((r) => r.subjectId === subject.id);
      const achievedMins = subjectRecords.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const targetMins = subject.targetHours * 60;

      totalTargetMinutes += targetMins;
      totalAchievedMinutes += Math.min(achievedMins, targetMins);

      const percentage =
        targetMins > 0 ? Math.min(Math.round((achievedMins / targetMins) * 100), 100) : 0;

      let barClass = 'from-rose-400 to-rose-500';
      let pillClass = 'bg-rose-50 text-rose-700';
      if (percentage >= 80) {
        barClass = 'from-emerald-400 to-green-500';
        pillClass = 'bg-emerald-50 text-emerald-700';
      } else if (percentage >= 50) {
        barClass = 'from-amber-400 to-orange-500';
        pillClass = 'bg-amber-50 text-amber-700';
      }

      return {
        ...subject,
        achievedHours: achievedMins / 60,
        remainingHours: Math.max((targetMins - achievedMins) / 60, 0),
        percentage,
        barClass,
        pillClass,
      };
    });

    const overallPercentage =
      totalTargetMinutes > 0 ? Math.round((totalAchievedMinutes / totalTargetMinutes) * 100) : 0;

    return {
      overallStats: {
        percentage: overallPercentage,
        achievedHours: totalAchievedMinutes / 60,
        targetHours: totalTargetMinutes / 60,
      },
      subjectStats: sStats,
    };
  }, [records, subjectGoals]);

  if (!targetSchoolName && (!subjectGoals || subjectGoals.length === 0)) return null;

  const pieData = [
    { name: '達成済', value: overallStats.percentage, color: 'url(#donutGrad)' },
    { name: '未達成', value: Math.max(100 - overallStats.percentage, 0), color: '#eef2f6' },
  ];

  return (
    <Surface variants={cardEnter} bare className="overflow-hidden">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600" />
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-300/30 blur-3xl rounded-full" />
        <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-fuchsia-400/20 blur-3xl rounded-full" />
        <div className="relative p-7 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200/90">
              Target School
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="bg-white/15 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                {targetSchoolName || '志望校未設定'}
              </span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-cyan-100/80 font-bold mb-0.5">
              総合達成率
            </p>
            <div className="flex items-end gap-1 justify-end">
              <span className="text-4xl font-black tabular-nums leading-none">
                {overallStats.percentage}
              </span>
              <span className="text-lg font-bold text-cyan-200 mb-1">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-7 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Donut */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-3 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Overall
          </h3>
          <div className="relative w-44 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={78}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1400}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}%`]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black bg-gradient-to-br from-indigo-600 to-cyan-500 bg-clip-text text-transparent tabular-nums">
                {overallStats.percentage}%
              </span>
            </div>
          </div>
          <div className="text-center mt-3 text-xs text-slate-500 tabular-nums">
            <span className="font-bold text-slate-800">{overallStats.achievedHours.toFixed(1)}h</span>
            <span className="mx-1.5 text-slate-300">/</span>
            <span>{overallStats.targetHours}h</span>
          </div>
        </div>

        {/* Subject bars */}
        <div className="md:col-span-2 min-w-0">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Subject Progress
          </h3>

          {subjectStats.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
              科目が設定されていません。
            </div>
          ) : (
            <div className="space-y-5">
              {subjectStats.map((subject) => (
                <div key={subject.id}>
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-800 truncate">{subject.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${subject.pillClass}`}>
                        {subject.percentage}%
                      </span>
                    </div>
                    <div className="text-xs text-right shrink-0 ml-2 tabular-nums">
                      {subject.remainingHours > 0 ? (
                        <>
                          あと <span className="font-bold text-slate-800">{subject.remainingHours.toFixed(1)}</span>
                          <span className="text-slate-400 ml-0.5">h</span>
                        </>
                      ) : (
                        <span className="font-bold text-emerald-600">目標達成 🎉</span>
                      )}
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${subject.barClass} transition-all duration-1000 ease-out`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium tabular-nums">
                    <span>{subject.achievedHours.toFixed(1)}h</span>
                    <span>{subject.targetHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Surface>
  );
}
