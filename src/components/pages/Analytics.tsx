import {
  CategoryPieChart,
  ExpenseTrendChart,
  HeatmapCalendar,
  IncomeVsExpenseChart
} from './Charts';
import { AIInsights } from './AIInsight';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart />
        <ExpenseTrendChart />
      </div>
      {/* <IncomeVsExpenseChart /> */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeatmapCalendar />
        <AIInsights />
      </div>
    </div>
  )
}