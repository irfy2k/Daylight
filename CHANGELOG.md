# Changelog

## [1.1.0] - 2025-07-13

### Added
- **Quality of Life Dashboard Improvements**
  - QuickStats component with productivity scoring and progress visualization
  - QuickActions component with fast task/transaction entry and data export/import
  - RecentActivity component showing chronological activity timeline
  - Enhanced summary tab with comprehensive dashboard view
- **Mobile-Optimized Experience**
  - Removed keyboard shortcuts for pure mobile focus
  - Touch-friendly interface optimizations
  - Responsive dashboard layout improvements
- **Consistent Dark Hover Animations**
  - Standardized all card hover effects to use deep black (`hover:bg-black`)
  - Updated 20+ hover effects across daily-summary, task-list, finance-tracker, mood-analytics, mood-logger, and quick-actions components
  - Improved visual consistency and user experience across all dashboard sections

### Fixed
- Resolved favicon conflicts causing 500 errors
- Fixed tab switching state mismatch (overview → summary)
- Eliminated runtime errors causing empty dashboard display
- Improved loading performance and stability
- **Fixed Recent Activity timestamps** - Now shows accurate creation times instead of random fake timestamps
  - Extract real timestamps from task IDs for accurate "Just now" and "Xs ago" display
  - Added seconds precision for very recent actions (under 1 minute)
  - Use actual transaction dates for proper chronological ordering

### Technical
- Comprehensive localStorage persistence for all user data
- Enhanced state management for tab navigation
- Proper TypeScript interfaces for all new components
- Mobile-first responsive design improvements

## [1.0.0] - 2025-07-11

### Added
- Initial release of Daylight AI-powered daily dashboard
- Mood logging with AI suggestions
- Dynamic task management with AI-powered suggestions
- Financial expense tracking
- Real-time analytics and progress tracking
- Global API request counter (60 requests/hour)
- Animated loading screen with minimalist design
- Interactive tutorial for new users
- Dynamic progress metrics (productivity & wellness)
- App performance monitoring
- Black/white minimalist theme with smooth animations

### Features
- **AI Integration**: Mood suggestions based on notes
- **Task Management**: Add, complete, and delete tasks with AI suggestions
- **Mood Analytics**: Track mood patterns and trends over time
- **Finance Tracker**: Monitor expenses and income
- **Progress Tracking**: Real-time productivity and wellness metrics
- **Global State**: Cross-user API request limiting
- **Responsive Design**: Mobile-first approach with clean UI
- **Tutorial System**: Step-by-step guide for new users
