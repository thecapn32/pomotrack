# PomoTrack 🍅

A modern Pomodoro time tracking application built with SvelteKit, featuring project management, task tracking, and time analytics with a beautiful dark theme.

## ✨ Features

- **Project Management**: Create and organize projects with custom colors
- **Task Tracking**: Add tasks to projects with detailed descriptions
- **Time Tracking**: Track time spent on individual tasks in hours/minutes
- **Dark Theme**: GitHub-inspired dark mode interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Persistent Storage**: SQLite database with full data persistence
- **Modular Architecture**: Built following SOLID principles

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **pnpm** or **yarn**
- **Linux-based system** (Ubuntu, Fedora, Arch, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thecapn32/pomotrack.git
   cd pomotrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   npm run dev -- --open  # Opens browser automatically
   ```

4. **Access the application**
   - Open your browser to `http://localhost:5173`
   - The app should be running with the tomato icon favicon!

## 🗄️ Database Architecture

PomoTrack uses SQLite with Drizzle ORM for data persistence. Here's the relational structure:

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│    projects     │       │      tasks       │       │   time_sessions     │
├─────────────────┤       ├──────────────────┤       ├─────────────────────┤
│ id (PK)         │◄──────┤ project_id (FK)  │◄──────┤ task_id (FK)        │
│ name            │   1:N │ id (PK)          │   1:N │ id (PK)             │
│ description     │       │ name             │       │ duration_minutes    │
│ color           │       │ description      │       │ started_at          │
│ total_minutes   │       │ completed        │       │ ended_at            │
│ created_at      │       │ time_spent       │       │ notes               │
│ updated_at      │       │ created_at       │       └─────────────────────┘
└─────────────────┘       │ completed_at     │
                          │ updated_at       │
                          └──────────────────┘
```

### Relationships:
- **Projects → Tasks**: One-to-Many (One project can have multiple tasks)
- **Tasks → Time Sessions**: One-to-Many (One task can have multiple tracking sessions)
- **Cascade Deletes**: Deleting a project removes all its tasks and sessions

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run dev -- --open # Start dev server and open browser

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Quality Assurance
npm run check        # Type checking with Svelte
npm run lint         # ESLint code linting
npm run format       # Prettier code formatting
```

### Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── Modal.svelte
│   │   ├── ProjectCard.svelte
│   │   ├── ProjectForm.svelte
│   │   ├── TaskForm.svelte
│   │   └── TabNavigation.svelte
│   ├── stores/              # Svelte stores for state management
│   │   ├── projects.ts
│   │   └── navigation.ts
│   ├── types.ts             # TypeScript type definitions
│   └── utils/               # Utility functions
│       └── time.ts
├── routes/
│   └── +page.svelte         # Main application page
├── app.html                 # HTML template
└── app.css                  # Global styles (Tailwind CSS)
```

## 🎨 Technology Stack

- **Frontend**: SvelteKit + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite + Drizzle ORM
- **Icons**: Heroicons (SVG)
- **Build Tool**: Vite
- **Package Manager**: npm/pnpm/yarn

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS v4 with custom configuration in `tailwind.config.js`:

```javascript
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // Custom dark theme colors
    }
  }
}
```

### Database Setup
Database migrations and schema are managed through Drizzle ORM. The database file is created automatically on first run.

## 📱 Usage

1. **Create Projects**: Click the floating + button to add new projects
2. **Add Tasks**: Use the green + button on each project card to add tasks
3. **Track Time**: Start timers for individual tasks (Timer tab)
4. **View Analytics**: Check time statistics and progress (Statistics tab)
5. **Manage Tasks**: Mark tasks as complete using checkboxes

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `build` folder
- **Node.js**: Use the SvelteKit Node adapter
- **Static**: Use the SvelteKit static adapter for static hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Heroicons](https://heroicons.com/)
- Database powered by [SQLite](https://sqlite.org/) + [Drizzle ORM](https://orm.drizzle.team/)

---

**Happy time tracking! 🍅⏰**