import { useMemo } from 'react';
import { Target, Calendar as CalendarIcon, Lightbulb, Zap, Flame } from 'lucide-react';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Surface, cardEnter } from './ui/Surface';
import type { LearningRecord } from '../types';

interface Props {
  records: LearningRecord[];
  finalGoalHours: number;
}

export function GoalPredictionCard({ records, finalGoalHours }: Props) {
  const {
    totalHours,
    dailyAverageHours,
    predictedDate,
    progressPercentage,
    studiedToday,
    minutesToSaveOneDay,
  } = useMemo(() => {
    const totalMinutes = records.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const currentHours = totalMinutes / 60;

    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));

    let totalMinutesLast7Days = 0;
    let hasStudiedToday = false;

    last7Days.forEach((day) => {
      const dayRecords = records.filter((r) => isSameDay(parseISO(r.date), day));
      const dayMinutes = dayRecords.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      totalMinutesLast7Days += dayMinutes;
      if (isSameDay(today, day) && dayMinutes > 0) hasStudiedToday = true;
    });

    const dailyAverageMins = totalMinutesLast7Days / 7;
    const dailyAverageHrs = dailyAverageMins / 60;
    const remainingHours = Math.max(finalGoalHours - currentHours, 0);

    let pDate: Date | null = null;
    let minsToSave = 0;
    if (remainingHours > 0 && dailyAverageHrs > 0) {
      const remainingDays = Math.ceil(remainingHours / dailyAverageHrs);
      pDate = addDays(today, remainingDays);
      if (!hasStudiedToday) minsToSave = Math.round(dailyAverageMins);
    }

    const percentage = Math.min(Math.round((currentHours / finalGoalHours) * 100), 100);

    return {
      totalHours: currentHours,
      dailyAverageHours: dailyAverageHrs,
      predictedDate: pDate,
      progressPercentage: percentage,
      studiedToday: hasStudiedToday,
      minutesToSaveOneDay: minsToSave,
    };
  }, [records, finalGoalHours]);

  const remainingDisplay =
    totalHours >= finalGoalHours
      ? '達成済 🎉'
      : `${Math.max(finalGoalHours - totalHours, 0).toFixed(1)} h`;

  return (
    <Surface variants={cardEnter}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 p-1.5 rounded-lg">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/80">
              Final Goal
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">最終目標までの道のり</h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            平均ペース
            <span className="font-bold text-slate-700 tabular-nums">
              {dailyAverageHours.toFixed(1)}
            </span>
            時間/日
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-5 py-3">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-200/40 blur-2xl rounded-full" />
          <p className="relative text-[10px] uppercase tracking-wider font-bold text-indigo-600/80 mb-0.5">
            残り
          </p>
          <p className="relative text-2xl font-black text-indigo-700 leading-none tabular-nums">
            {remainingDisplay}
          </p>
        </div>
      </div>

      {totalHours < finalGoalHours && dailyAverageHours > 0 && predictedDate && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 p-5 mb-7 flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-xl shrink-0 mt-0.5">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-amber-900 text-base sm:text-lg leading-snug">
              このペースなら{' '}
              <span className="text-amber-600 tabular-nums">
                {format(predictedDate, 'yyyy年M月d日', { locale: ja })}
              </span>{' '}
              に達成予定！
            </h3>
            {!studiedToday && minutesToSaveOneDay > 0 && (
              <p className="text-amber-800/80 text-xs sm:text-sm flex items-center gap-1.5 mt-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                今日 <span className="font-bold tabular-nums">{minutesToSaveOneDay}分</span> 学習すれば達成日が早まります。
              </p>
            )}
            {studiedToday && (
              <p className="text-amber-800/80 text-xs sm:text-sm flex items-center gap-1.5 mt-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                今日も記録済み。良いペースです。
              </p>
            )}
          </div>
        </div>
      )}

      {totalHours < finalGoalHours && dailyAverageHours === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-7 flex items-center gap-4">
          <div className="bg-slate-200 p-2 rounded-xl">
            <CalendarIcon className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-slate-600 text-sm font-medium">
            学習記録をつけると、目標達成の予測日が表示されます。
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-end text-xs font-semibold">
          <span className="text-slate-500 uppercase tracking-wider">Progress</span>
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent tabular-nums">
            {progressPercentage}%
          </span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2.5s_ease-in-out_infinite]" />
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1 tabular-nums">
          <span>0h</span>
          <span>{finalGoalHours}h</span>
        </div>
      </div>
    </Surface>
  );
}
