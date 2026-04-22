# MyTODO — Smart Productivity Workspace

MyTODO is an advanced, all-in-one personal productivity application designed to seamlessly combine task management with a rich idea-capture workspace. Built with modern web technologies, it emphasizes deep work, seamless context switching, and rewarding consistency.

![App Preview](https://via.placeholder.com/1200x600.png?text=MyTODO+Workspace)

## ✨ Core Features

### 📝 Notes-First Workspace
- **Rich Idea Capture**: Distraction-free text editor with title, content, custom color-coding, and inline tags.
- **Auto & Manual Save**: Real-time debounce auto-saving (with `localStorage` + Firebase integration) and a manual save fallback.
- **Smart Organization**: Pin important notes, search dynamically, and color-code cards for a highly visual board. 

### ⚡ Deep Focus Mode (Pomodoro)
- **Built-in Pomodoro Timer**: Select focus durations (15m, 25m, 60m, etc.) and seamlessly transition into earned breaks.
- **True Background Persistence**: The timer calculates exact end-times based on timestamps (`Date.now()`) and local storage. You can close the tab completely, and the timer will keep running perfectly.
- **System Notifications**: Native browser push notifications gently remind you when it's time to take a break or get back to work.
- **Active Task Context**: Focus mode automatically pulls your top pending task into the timer screen so you know exactly what you're working on.

### 📋 Advanced Task Management
- **Intelligent Sorting & Drag-and-Drop**: Easily reorder tasks using `@dnd-kit`. Automatically sorts by manual order or priority.
- **Snooze & Reschedule**: Instantly bump tasks to "1 hour", "Tonight", "Tomorrow", or "Next week" via the quick-snooze dropdown.
- **Recurring Tasks**: Setup daily/weekly repeating patterns.
- **Priorities & Urgency**: Visual indicators map out overdue, high-priority, and upcoming tasks.

### 📊 Productivity Insights & Streaks
- **GitHub-style Flame Streak**: Visual representation of your daily consistency. It tracks current streaks, longest streaks, and today's completions.
- **Task Analytics**: Real-time charts and data summarizing your workload over time.

### 🏷️ Global Tagging System
- A dynamic tagging system extracted from both tasks and notes.
- Clicking a tag in the sidebar globally filters your active workspace, ensuring you only see the context you need.

### 🌗 Premium UI/UX
- **Beautiful Dark/Light Mode**: Smooth transitions, vivid colors in dark mode, and glassy overlays.
- **Micro-interactions**: Pulse animations, smooth scale-ins, and thoughtful hover states built completely with pure CSS.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 (Vite)
- **Styling**: Pure Vanilla CSS (Variables, Flexbox/Grid, Color-mix, Custom properties)
- **Backend/Database**: Firebase / Firestore (Real-time syncing)
- **Authentication**: Firebase Auth
- **Icons**: `lucide-react`
- **Drag & Drop**: `@dnd-kit/sortable`
- **State Management**: React Context API (`AuthContext`, `TaskContext`, `NoteContext`, `FocusContext`)
- **PWA Ready**: Integrated service worker capabilities (`dev-dist/sw.js`)

---

## 📂 Architecture & Project Structure

The codebase is highly modular, separating UI components from business logic (Custom Hooks) and database interactions (Services). This makes it entirely "Mobile-Ready" should it be ported to React Native in the future.

```text
src/
├── components/          # Reusable UI elements
│   ├── analytics/       # Streak widgets & charts
│   ├── common/          # Buttons, Loaders
│   ├── layout/          # Sidebar, Header, AppLayout
│   ├── productivity/    # FocusStreak (Pomodoro Modal)
│   └── tasks/           # TaskCard, TaskList
├── context/             # Global State Providers
│   ├── AuthContext.jsx  
│   ├── FocusContext.jsx # Timer & background persistence
│   ├── NoteContext.jsx  # Notes CRUD
│   └── TaskContext.jsx  # Tasks CRUD & Filtering
├── hooks/               # Custom consumption hooks
├── pages/               # Main route views (Dashboard, Notes)
├── services/            # Firebase direct interactions
├── styles/              # Global CSS, Tokens, and Component specifics
└── utils/               # Date formatting, constants
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js installed (v16+ recommended).

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Firebase Configuration
Create a `.env` file in the root directory and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally
Start the Vite development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 🔮 Future Scope
- Mobile application using React Native (sharing the `services/` and `context/` logic).
- Calendar View integration for Task deadlines.
- Collaborative notes sharing.
