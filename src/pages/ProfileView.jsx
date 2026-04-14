import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { LogOut, Calendar, CheckSquare, Target, Clock, Settings, User } from 'lucide-react';
import Button from '../components/common/Button';

import { useNavigate } from 'react-router';

const ProfileView = () => {
  const { user, signOut } = useAuth();
  const { tasks, taskCounts } = useTasks();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out failed', err);
    }
  };

  const pendingTasks = taskCounts.total - taskCounts.completed;
  const completionRate = taskCounts.total > 0 
    ? Math.round((taskCounts.completed / taskCounts.total) * 100) 
    : 0;

  return (
    <div className="analytics-view fade-in" style={{ paddingBottom: 'var(--space-8)' }}>
      <header className="page-header" style={{ borderBottom: 'none' }}>
        <div style={{ flex: 1 }}>
          <h1 className="page-header__title">User Profile</h1>
          <p className="page-header__subtitle" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            Manage your account and view total lifetime statistics.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        
        {/* Profile Card */}
        <div className="analytics-card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {user?.displayName?.charAt(0) || <User size={40} />}
            </div>
          )}
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
              {user?.displayName}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
              {user?.email}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Calendar size={16} /> 
                Joined {user?.creationTime ? new Date(user.creationTime).toLocaleDateString() : 'recently'}
              </span>
            </div>
          </div>

          <div>
            <Button variant="ghost" onClick={handleSignOut} style={{ color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-4)' }}>Lifetime Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          
          <div className="analytics-card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
            <div style={{ color: 'var(--primary-500)', marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'center' }}>
              <CheckSquare size={32} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {taskCounts.completed}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: 'var(--space-1)' }}>
              Tasks Completed
            </div>
          </div>

          <div className="analytics-card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
            <div style={{ color: 'var(--warning)', marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'center' }}>
              <Clock size={32} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {pendingTasks}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: 'var(--space-1)' }}>
              Tasks Pending
            </div>
          </div>

          <div className="analytics-card" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
            <div style={{ color: 'var(--success)', marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'center' }}>
              <Target size={32} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {completionRate}%
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: 'var(--space-1)' }}>
              Completion Rate
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfileView;
