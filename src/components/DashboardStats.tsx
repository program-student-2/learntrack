import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Surface, cardEnter, cardStagger } from './ui/Surface';
import type { LearningRecord } from '../types';
import { format, subDays, parseISO, isSameDay } from 'date-fns';

interface Props {
  records: LearningRecord[];
  weeklyGoalHours: number;
}

export function DashboardStats({ records, weeklyGoalHours }: Props) {
  const WEEKLY_GOAL_MINUTES = weeklyGoalHours * 60;

  const { chartData, totalMinutes, goalPercentage, maxHours } = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    let totalLast7Days = 0;
    let maxH = 0;

    const data = last7Days.map((day) => {
      const dayRecords = records.filter((record) => isSameDay(parseISO(record.date), day));
      const minutes = dayRecords.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const hours = Number((minutes / 60).toFixed(1));
      totalLast7Days += minutes;
      if (hours > maxH) maxH = hours;
      return { name: format(day, 'MM/dd'), minutes, hours };
    });

    const percentage = Math.min(Math.round((totalLast7Days / WEEKLY_GOAL_MINUTES) * 100), 100);
    return {
      chartData: data,
      totalMinutes: totalLast7Days,
      goalPercentage: percentage,
      maxHours: maxH,
    };
  }, [records, WEEKLY_GOAL_MINUTES]);

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <motion.div
      variants={cardStagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Chart */}
      <Surface variants={cardEnter} className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 p-1.5 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/80">
                Last 7 Days
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">直近7日間の学習時間</h2>
            <p className="text-xs text-slate-500 mt-0.5">日別の推移</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="barGradMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)' }}
                formatter={(value: any) => [`${value}時間`, '学習時間']}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={1000}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.hours === maxHours && maxHours > 0 ? 'url(#barGradMax)' : 'url(#barGrad)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Surface>

      {/* Summary stack */}
      <div className="space-y-6">
        <Surface variants={cardEnter}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100/70">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Total / 7d
              </span>
              <h3 className="font-semibold text-slate-800 leading-tight">直近7日間の合計</h3>
            </div>
          </div>
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              {totalHours}
            </span>
            <span className="text-slate-500 font-medium mr-1.5">時間</span>
            <span className="text-2xl font-bold text-slate-700">{remainingMinutes}</span>
            <span className="text-slate-500 font-medium">分</span>
          </div>
        </Surface>

        <Surface variants={cardEnter}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100/70">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Weekly Goal
                </span>
                <h3 className="font-semibold text-slate-800 leading-tight">今週の目標</h3>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full tabular-nums">
              {weeklyGoalHours}h/週
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-slate-900 tabular-nums">
                {goalPercentage}
                <span className="text-xl text-slate-400 ml-0.5">%</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 mb-1">
                {goalPercentage >= 100 ? '達成 🎉' : '継続中'}
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>
          </div>
        </Surface>
      </div>
    </motion.div>
  );
}
