import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { UserCircle, Calendar, BarChart, Settings, LogOut } from 'lucide-react';

const ProfileView = () => {
  const { user, signOut, requestNotificationPermission } = useAuth();
  const { taskCounts } = useTasks();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

const ProfileView = () => {
  const { user, signOut, requestNotificationPermission } = useAuth();
  const { taskCounts } = useTasks();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className="dashboard view-container">
      <div className="profile-view__header">
        <h1 className="profile-view__title">Profile & Settings</h1>
        <p className="profile-view__subtitle">Manage your account and preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
        {/* User Card */}
        <section className="stats-card profile-card">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="profile-card__avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="profile-card__avatar-fallback">
              {user?.displayName?.charAt(0) || <UserCircle size={48} />}
            </div>
          )}
          
          <h2 className="profile-card__name">{user?.displayName || 'Todo User'}</h2>
          <p className="profile-card__email">{user?.email}</p>
          
          <button className="btn btn--danger" onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </section>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="stats-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="stats-card__icon stats-card__icon--primary">
              <BarChart size={24} />
            </div>
            <div>
              <p className="stats-card__value">{taskCounts.total}</p>
              <p className="stats-card__label">Total Lifetime Tasks</p>
            </div>
          </div>
          
          <div className="stats-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="stats-card__icon stats-card__icon--success">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="stats-card__value">{taskCounts.completed}</p>
              <p className="stats-card__label">Completed Tasks</p>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <section className="stats-card">
          <h3 className="settings-section__title">
            <Settings size={20} /> Preferences
          </h3>
          
          <div className="settings-item">
            <div>
              <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Push Notifications</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Receive reminders for upcoming tasks</p>
            </div>
            <button 
              className="btn btn--secondary" 
              onClick={requestNotificationPermission}
              disabled={Notification?.permission === 'granted'}
            >
              {Notification?.permission === 'granted' ? 'Enabled' : 'Enable'}
            </button>
          </div>
          
          <div className="settings-item">
            <div>
              <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Offline Mode</p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Cache data on this device</p>
            </div>
            <span style={{ color: 'var(--success)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="priority-indicator priority-low" style={{ marginRight: 0 }}></span> Active
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};
  );
};

// Quick fix for missing CheckCircle
import { CheckCircle } from 'lucide-react';

export default ProfileView;
