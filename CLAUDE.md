# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grind Souls is a gamified habit and task tracker that helps users improve personal development by completing quests (tasks) and leveling up life areas. The application uses RPG-style mechanics inspired by Dark Souls, where users earn XP and in-game currency by completing tasks, level up different life areas, and purchase custom rewards.

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Getting Started
```bash
cd grind-souls-app
npm install
npm run dev
```

The application will be available at http://localhost:3000

### Build Commands
```bash
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run type-check # Run TypeScript compiler check
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: IndexedDB via Dexie.js (local-first)
- **Icons/Emojis**: Unicode emojis for life areas and UI

### Core Architecture

#### Data Layer (`/src/lib/database.ts`)
- **GrindSoulsDB**: Main database class extending Dexie
- **Local-first approach**: All data stored in IndexedDB for offline capability
- **Sync-ready**: UUIDs and timestamps prepared for future cloud sync
- **Auto-calculated rewards**: Database hooks automatically calculate XP/currency for quests and subtasks

#### State Management (`/src/store/useGameStore.ts`)
- **Zustand store**: Central state management for all game data
- **Persistent storage**: UI preferences persisted via localStorage
- **Real-time calculations**: Level progress, rare quest bonuses, and XP distribution
- **Quest completion logic**: Handles parent-child relationships between quests and subtasks

#### Configuration (`/src/config/gameConfig.ts`)
- **Balanced XP system**: Dark Souls-inspired level requirements with productivity scaling
- **Difficulty levels**: Trivial (5 XP) → Impossible (150 XP) with priority multipliers
- **Life areas**: 8 default areas based on Dark Souls stats (Vitality, Intelligence, etc.)
- **Rare quest system**: 3% chance for 2x XP/currency rewards
- **Level boost mechanics**: Lower-level areas get 20% XP bonus to encourage balance

### Key Features Implemented

#### Quest System
- **CRUD operations**: Create, update, complete, delete quests
- **Priority levels**: Normal (1x) and High Priority (1.5x XP multiplier)
- **Difficulty scaling**: 5 levels from Trivial to Impossible
- **Subtask support**: Subtasks contribute to parent quest completion
- **Due date tracking**: Visual warnings for overdue quests
- **Tagging system**: Customizable tags for organization
- **Recurring quests**: Daily, weekly, monthly recurring tasks with streak tracking
- **Quest management page**: Comprehensive filtering, search, and bulk management

#### Quest Management Features
- **Advanced filtering**: Filter by type (active/completed/overdue/recurring), life area, difficulty, priority
- **Search functionality**: Full-text search across quest titles, descriptions, and tags
- **Multiple sorting options**: Sort by date, priority, difficulty, due date, alphabetical
- **Statistics dashboard**: Overview of total, active, completed, overdue, and recurring quests
- **Bulk operations**: Complete and delete quests directly from management interface
- **Navigation integration**: Seamless navigation between dashboard and quest management

#### Life Areas & Leveling
- **8 Default life areas**: Vitality, Attunement, Endurance, Strength, Dexterity, Resistance, Intelligence, Faith
- **Custom life areas**: Users can create additional areas
- **Exponential leveling**: `level * (level + 1) * 15` XP required per level
- **Visual progress**: Progress bars showing current XP toward next level
- **Auto-assignment**: XP automatically assigned to quest's designated life area

#### Rewards System
- **Custom rewards**: User-defined rewards with customizable costs
- **Suggested pricing**: 4 tiers (50, 150, 500, 1500 souls) based on earning rates
- **Currency calculation**: XP ÷ 4 = currency earned (rounded up)
- **Purchase validation**: Prevents buying if insufficient currency

### UI/UX Design

#### Dashboard-First Design
- **Stats overview**: Active quests, completed today, overdue, life areas count
- **Life area progress**: Visual progress bars for all areas with current level display
- **Quick quest creation**: Inline form for rapid task entry
- **Recent activity**: Active quests and recent completions side-by-side

#### Design System
- **Dark/Light themes**: Auto-detection of system preference
- **Responsive layout**: Mobile-first approach with Tailwind CSS
- **Visual hierarchy**: Clear distinction between quest priorities and difficulties
- **Progress visualization**: Animated progress bars with color coding
- **Accessibility**: Semantic HTML structure and color contrast compliance

### Data Models

#### Core Entities
- **User**: Profile, totals, preferences
- **Quest**: Tasks with difficulty, priority, due dates, subtasks, recurrence
- **Subtask**: Child tasks that contribute to parent completion
- **LifeArea**: 8 default + custom areas with leveling progression
- **Reward**: Custom rewards with purchase tracking
- **Milestone**: Checkpoints for long-term quests (prepared for future)

#### Relationships
- Quest → LifeArea (many-to-one)
- Quest → Subtasks (one-to-many) 
- Quest → Milestones (one-to-many, future)
- User → All entities (ownership)

### Performance Considerations
- **Efficient queries**: IndexedDB indexes on commonly queried fields
- **Lazy loading**: Dashboard shows limited quest previews
- **Local-first**: No network dependencies for core functionality
- **Optimistic updates**: UI updates immediately, syncs with database

### Future Sync Architecture
All entities include:
- `syncId`: UUID for cloud sync identification
- `lastSyncAt`: Timestamp for conflict resolution
- Database hooks ready for bidirectional sync implementation

### Development Patterns
- **Hook-based data mutations**: Database hooks handle calculated fields
- **Type safety**: Full TypeScript coverage with strict types
- **Component composition**: Reusable UI components with consistent props
- **State co-location**: Related state and actions grouped in store slices

## Recent Changes and Issues Resolved

### Quest Creation Modal Styling Fix (Latest)
**Issue**: Quest creation modal was displaying improperly with formatting issues due to CSS custom properties not being properly recognized.

**Solution**: Reverted modal styling from CSS custom properties (`bg-surface`, `text-foreground`, etc.) back to standard Tailwind classes (`bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`, etc.) for better browser compatibility and consistent rendering.

**Files Modified**:
- `src/components/QuestCreateModal.tsx` - Complete styling overhaul with traditional Tailwind classes
- Form inputs, labels, buttons, and modal container all use standard gray/blue color scheme
- Maintained dark mode support with explicit dark: prefixes

### Quest Management Page Implementation
**Feature**: Added comprehensive quest management interface accessible via `/quests` route.

**Implementation**:
- `src/app/quests/page.tsx` - New route for quest management
- `src/components/QuestManagement.tsx` - Full-featured management interface
- `src/components/Dashboard.tsx` - Added navigation button to quest management

**Key Features**:
- Advanced filtering and search capabilities
- Statistics overview with quest counts by type
- Sortable quest list with multiple criteria
- Direct quest completion and deletion from interface
- Responsive design with mobile-first approach

### UI/UX Improvements
- Life area descriptions now always visible (removed hover-only requirement)
- Enhanced navigation between dashboard and quest management
- Consistent styling across all modal and form components
- Improved accessibility with proper contrast and focus states