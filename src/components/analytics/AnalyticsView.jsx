import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { useTasks } from '../../hooks/useTasks';
import { TASK_PRIORITY } from '../../utils/constants';

const COLORS = {
  high: 'var(--danger)',
  medium: 'var(--warning)',
  low: 'var(--success)',
  primary: 'var(--primary-500)',
  bg: 'var(--bg-secondary)',
  text: 'var(--text-primary)',
};

const AnalyticsView = () => {
  const { tasks, taskCounts } = useTasks();
  
  // Tasks by Priority
  const priorityData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    tasks.forEach(task => {
      if (counts[task.priority] !== undefined) {
        counts[task.priority]++;
      }
    });
    return [
      { name: 'High Priority', value: counts.high, color: COLORS.high },
      { name: 'Medium Priority', value: counts.medium, color: COLORS.medium },
      { name: 'Low Priority', value: counts.low, color: COLORS.low },
    ].filter(i => i.value > 0);
  }, [tasks]);

  // Tasks by Tag
  const tagData = useMemo(() => {
    const tagMap = {};
    tasks.forEach(task => {
      task.tags?.forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });
    return Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7); // Top 7 tags
  }, [tasks]);

  // Completion Trend (Last 7 days)
  const trendData = useMemo(() => {
    const days = 7;
    const data = [];
    const now = new Date();
    now.setHours(0,0,0,0);
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { weekday: 'short' });
      data.push({ date: dateStr, dateObj: d, completed: 0, created: 0 });
    }

    tasks.forEach(task => {
      const created = task.createdAt ? new Date(task.createdAt) : null;
      const completed = task.completedAt ? new Date(task.completedAt) : null;

      data.forEach(day => {
        // Compare dates exactly
        if (created && created.setHours(0,0,0,0) === day.dateObj.getTime()) {
          day.created++;
        }
        if (completed && completed.setHours(0,0,0,0) === day.dateObj.getTime()) {
          day.completed++;
        }
      });
    });

    return data;
  }, [tasks]);

  if (!tasks.length) {
    return (
      <div className="analytics-view fade-in">
        <header className="page-header">
          <h1 className="page-header__title">Dashboard & Insights</h1>
        </header>
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-tertiary)' }}>
          <p>Create some tasks to see your analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-view fade-in">
      <header className="page-header">
        <div style={{ flex: 1 }}>
          <h1 className="page-header__title">Dashboard & Insights</h1>
          <p className="page-header__subtitle" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            Visualize your productivity and track your patterns.
          </p>
        </div>
      </header>
      
      <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        
        {/* Trend Line Chart */}
        <div className="analytics-card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>7-Day Activity Trend</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}
                  itemStyle={{ fontSize: 14 }}
                />
                <Legend />
                <Line type="monotone" dataKey="completed" name="Completed" stroke={COLORS.success || '#10b981'} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="created" name="Created" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        {priorityData.length > 0 && (
          <div className="analytics-card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Tasks by Priority</h3>
            <div style={{ height: 250 }}>
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
                  <Tooltip 
                    contentStyle={{ borderRadius: 'var(--radius-lg)', border: 'none', background: 'var(--bg-primary)'}}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tag Bar Chart */}
        {tagData.length > 0 && (
          <div className="analytics-card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Top Tags</h3>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                  <XAxis type="number" allowDecimals={false} stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    cursor={{fill: 'var(--bg-hover)'}}
                    contentStyle={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)'}}
                  />
                  <Bar dataKey="count" name="Tasks" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsView;
