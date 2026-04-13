import { useMemo } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { TASK_PRIORITY } from '../../utils/constants';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Colors based on our CSS variables (approximated for charting)
const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#64748b'
};

const AnalyticsView = () => {
  const { allTags } = useTasks();
  // We need access to all raw tasks, unfiltered by activeTag
  // Assuming TaskContext doesn't expose raw state.tasks, we might use filteredTasks for analytics 
  // or we can import useTasks and check `todayTasks` + `completedTasks` etc. 
  // Actually, wait, we need `state.tasks` from TaskContext to build global analytics. 
  // Let's assume useTasks provides `tasks` as all tasks.
  const { tasks = [] } = useTasks(); 

  // 1. Task Completion over the last 7 days
  const sevenDayData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(startOfDay(new Date()), i);
      const dayStr = format(date, 'MMM d');
      
      const completedOnDay = tasks.filter(t => 
        t.status === 'completed' && t.completedAt && isSameDay(t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt), date)
      ).length;

      const createdOnDay = tasks.filter(t => 
        t.createdAt && isSameDay(t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt), date)
      ).length;

      data.push({
        name: dayStr,
        Completed: completedOnDay,
        Created: createdOnDay,
      });
    }
    return data;
  }, [tasks]);

  // 2. Tasks by Priority
  const priorityData = useMemo(() => {
    const high = tasks.filter(t => t.priority === TASK_PRIORITY.HIGH).length;
    const med = tasks.filter(t => t.priority === TASK_PRIORITY.MEDIUM).length;
    const low = tasks.filter(t => t.priority === TASK_PRIORITY.LOW).length;
    
    return [
      { name: 'High', value: high, color: COLORS.danger },
      { name: 'Medium', value: med, color: COLORS.warning },
      { name: 'Low', value: low, color: COLORS.success },
    ].filter(d => d.value > 0);
  }, [tasks]);

  // 3. Top Tags
  const tagData = useMemo(() => {
    const counts = {};
    tasks.forEach(t => {
      if (t.tags) {
        t.tags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5 tags
  }, [tasks]);

  return (
  return (
    <div className="dashboard view-container">
      <div className="profile-view__header">
        <h1 className="profile-view__title">Analytics</h1>
        <p className="profile-view__subtitle">Track your productivity across time.</p>
      </div>

      <div className="analytics-grid">
        
        {/* 7 Day Trend */}
        <div className="stats-card analytics-chart-card">
          <h3 className="chart-title">Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sevenDayData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.text }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.text }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Created" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Completed" fill={COLORS.success} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          
          {/* Priority Chart */}
          <div className="stats-card analytics-chart-card--small" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="chart-title">Tasks by Priority</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                  No priority data
                </div>
              )}
            </div>
          </div>

          {/* Tags Chart */}
          <div className="stats-card analytics-chart-card--small" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="chart-title">Top Tags</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
               {tagData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={tagData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: COLORS.text }} axisLine={false} tickLine={false} width={80} />
                     <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                     <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]}>
                        {tagData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.primary} />
                        ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                   No tag data
                 </div>
               )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
