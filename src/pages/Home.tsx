import { motion } from 'framer-motion';
import { LearningForm } from '../components/LearningForm';
import { HistoryList } from '../components/HistoryList';
import { GoalPredictionCard } from '../components/GoalPredictionCard';
import { TargetSchoolDashboard } from '../components/TargetSchoolDashboard';
import { useApp } from '../components/Layout';
import { cardStagger } from '../components/ui/Surface';

export function Home() {
  const { records, settings, onAddRecord, onDeleteRecord, onEditRecord } = useApp();

  return (
    <motion.div
      variants={cardStagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
    >
      {/* Left column: input + sticky form */}
      <div className="lg:col-span-4 xl:col-span-4 order-2 lg:order-1">
        <div className="lg:sticky lg:top-6 space-y-6">
          <LearningForm onAdd={onAddRecord} settings={settings} />
        </div>
      </div>

      {/* Right column: KPIs + history */}
      <div className="lg:col-span-8 xl:col-span-8 order-1 lg:order-2 space-y-6 lg:space-y-8 min-w-0">
        <TargetSchoolDashboard records={records} settings={settings} />
        <GoalPredictionCard records={records} finalGoalHours={settings.finalGoalHours || 100} />
        <HistoryList
          records={records}
          settings={settings}
          onDelete={onDeleteRecord}
          onEdit={onEditRecord}
        />
      </div>
    </motion.div>
  );
}
