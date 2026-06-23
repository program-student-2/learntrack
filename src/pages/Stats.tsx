import { DashboardStats } from '../components/DashboardStats';
import { useApp } from '../components/Layout';

export function Stats() {
  const { records, settings } = useApp();

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600/80">
          Analytics
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">学習統計</h2>
        <p className="text-sm text-slate-500 mt-1.5">過去の学習データから進捗と傾向を分析します。</p>
      </div>

      <DashboardStats records={records} weeklyGoalHours={settings.weeklyGoalHours} />
    </div>
  );
}
