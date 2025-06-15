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

#### Complete Performance & Design Overhaul (December 2024)
**Final Implementation - All Issues Resolved**:

**Performance Optimization (LAG ELIMINATED)**:
- **Global animation disable**: Added `animation: none !important` to eliminate all lag-causing effects
- **Removed complex animations**: Eliminated spring, float, liquid-distortion, and heavy CSS transforms
- **Minimal transitions**: Only essential 0.15s ease transitions for interactive feedback
- **Mobile optimization**: Disabled hover effects on touch devices for better performance
- **Fast rendering**: Simplified DOM structure and component hierarchy
- **Build optimized**: Reduced bundle size and improved loading times

**Apple-Style Glassmorphism (ACTUALLY VISIBLE)**:
- **Working `.glass` class**: `backdrop-filter: blur(20px) saturate(180%)` with proper browser support
- **Semi-transparent backgrounds**: `rgba(255, 255, 255, 0.8)` light, `rgba(28, 28, 30, 0.9)` dark
- **Authentic Apple colors**: #007AFF primary blue, iOS-style success/warning/error colors
- **Proper layering**: Glass effects with correct z-index and border styling
- **Dark mode support**: Automatic adaptation with proper contrast ratios
- **Blur effect visible**: Real backdrop-filter blur that users can actually see

**Functional Sidebar Navigation (HAMBURGER MENU WORKS)**:
- **SimpleSidebar component**: Clean, responsive sidebar with hamburger menu functionality
- **Mobile hamburger button**: Fixed top-left three-line icon that actually opens/closes sidebar
- **Slide-out behavior**: Smooth sidebar animation on mobile with overlay backdrop
- **Desktop fixed layout**: Sidebar remains open on larger screens
- **User stats integration**: XP and Goldens display prominently in sidebar
- **Theme toggle**: Built-in light/dark mode switcher
- **Navigation items**: Dashboard, Quests, Rewards, Life Areas with active state
- **Create quest button**: Integrated action button in sidebar

**Apple-Style Rounded Corners (EVERYWHERE)**:
- **Consistent radius system**: 16px (rounded-xl) for cards, 20px (rounded-2xl) for icons
- **Icon containers**: All stat icons use rounded-2xl for modern Apple aesthetic  
- **Interactive elements**: Buttons, inputs, and cards with proper rounded styling
- **Quest cards**: Rounded glass cards with proper corner radius
- **Form elements**: Modal dialogs and inputs with consistent rounding
- **Badge elements**: Difficulty and priority badges with rounded styling

**Streamlined Responsive Design**:
- **Mobile-first approach**: Responsive grid system that works on all devices
- **Clean component structure**: Removed nested animation wrappers and complex DOM
- **Proper spacing**: Consistent padding and margins using Apple-style spacing
- **Color system**: High contrast text with proper accessibility
- **Touch-friendly**: Larger touch targets on mobile devices
- **Fast interactions**: Immediate visual feedback without lag

**Technical Implementation**:
- **Complete CSS rewrite**: `src/app/globals.css` rebuilt from scratch for performance
- **New components**: 
  - `src/components/ui/SimpleSidebar.tsx` - Working sidebar navigation
  - `src/components/ui/SidebarNavigation.tsx` - Alternative navigation component
- **Updated Dashboard**: `src/components/Dashboard.tsx` streamlined with glass effects
- **Build successful**: All TypeScript errors resolved, production-ready
- **Performance metrics**: Significantly reduced bundle size and render time

#### Previous Major UI/UX Overhaul v2 (Earlier Session)
**Complete Rebuild for Performance & Apple Aesthetics**:
- **REMOVED ALL LAG**: Disabled all complex animations (spring, float, liquid) with `animation: none !important`
- **Performance Optimized**: Only essential 0.15s transitions remain, no heavy CSS effects
- **Mobile Optimizations**: Disabled hover effects on mobile devices for better touch performance

**Actual Working Apple Glassmorphism**:
- **Real `.glass` class**: Uses `backdrop-filter: blur(20px) saturate(180%)` with proper rgba backgrounds
- **Visible glass effect**: Semi-transparent white/dark backgrounds with actual blur
- **Apple color system**: Authentic #007AFF primary with iOS-style state colors
- **Proper layering**: Glass effects stack correctly with proper z-index

**Functional Sidebar Navigation**:
- **SimpleSidebar component**: Clean, working sidebar with hamburger menu
- **Mobile hamburger**: Fixed top-left button that actually opens sidebar
- **Collapsible design**: Slides in/out on mobile, fixed on desktop
- **User stats integrated**: XP and Goldens display in sidebar
- **Theme toggle included**: Built-in theme switcher

**Apple-style Rounded Corners**:
- **Consistent border-radius**: 16px (rounded-xl) and 20px (rounded-2xl) throughout
- **Icon containers**: All use rounded-2xl for modern Apple look
- **Cards and buttons**: Proper rounded corners on all interactive elements
- **Input fields**: Consistent rounded styling

**Streamlined & Responsive**:
- **Clean component structure**: Removed complex nested animations
- **Fast rendering**: Simplified DOM structure for better performance
- **Mobile-first**: Responsive grid and sidebar that works on all devices
- **Color consistency**: Proper contrast and visibility

**Key Files Rewritten**:
- `src/app/globals.css` - Completely rebuilt with performance focus
- `src/components/ui/SimpleSidebar.tsx` - New working sidebar component  
- `src/components/Dashboard.tsx` - Streamlined with glass effects and rounded corners
- All animations disabled globally for maximum performance

#### Previous Major UI/UX Overhaul (Earlier Session)
**Performance & Responsiveness Optimization**:
- Removed all excessive animations causing lag (spring, float, liquid distortion)
- Optimized CSS to use only essential fade-in animations
- Improved mobile performance by disabling hover effects on touch devices
- Streamlined component structure for faster rendering

**Apple-style Design System Implementation**:
- Complete color system overhaul with Apple-inspired colors (#007AFF primary, authentic iOS colors)
- Proper liquid glass effect using backdrop-filter with 20px blur and 180% saturation
- Apple-style rounded corner system (4px to 24px radius scale)
- Authentic shadows and typography matching iOS design language

**Sidebar Navigation System**:
- Replaced complex mobile/desktop navigation with unified sidebar
- Collapsible sidebar with user stats display
- Mobile top bar with hamburger menu integration
- Fixed sidebar positioning with proper z-index layering
- Integrated theme toggle and create action buttons

**Visual Design Enhancements**:
- All components now use consistent .glass-card class for liquid glass effect
- Rounded corners applied throughout (rounded-lg, rounded-xl classes)
- Removed all complex animations (spring-in, float, card-hover)
- Optimized hover effects with simple translateY transformations
- Consistent border and shadow system

**Files Updated**:
- `src/app/globals.css` - Complete rewrite with Apple-style design system
- `src/components/ui/SidebarNavigation.tsx` - New sidebar navigation component
- `src/components/Dashboard.tsx` - Updated to use sidebar navigation and optimized styling
- Removed excessive animation classes and complex visual effects

#### Previous Improvements
- Life area descriptions now always visible (removed hover-only requirement)
- Enhanced navigation between dashboard and quest management
- Consistent styling across all modal and form components
- Improved accessibility with proper contrast and focus states

## Complete Project Development Journey

### Phase 1: Core Foundation
- **Next.js 15 setup** with TypeScript and App Router
- **Database architecture** with IndexedDB via Dexie.js for local-first approach
- **Game mechanics** implementation (XP, currency, levels, quests)
- **Basic CRUD operations** for all core entities
- **Zustand state management** with persistent storage

### Phase 2: Feature Expansion
- **Recurring quest system** with streak tracking and reset logic
- **Quest difficulty levels** from trivial to impossible with XP scaling
- **Priority system** with visual indicators and XP multipliers
- **Rare quest mechanics** with bonus rewards (3% chance, 2x multiplier)
- **Overdue tracking** with visual warnings and alerts
- **Subtask system** with progress tracking and completion blocking

### Phase 3: Management Interfaces
- **Comprehensive quest management** with filtering, search, and sorting
- **Custom rewards system** with purchase validation and history
- **Life areas customization** with active/inactive states
- **Statistics dashboard** with real-time progress tracking
- **Navigation system** between all major sections

### Phase 4: UI/UX Evolution
- **Dark/light theme system** with auto-detection
- **Accessibility improvements** with proper contrast and focus states
- **Mobile responsiveness** with touch-friendly interactions
- **Visual hierarchy** with consistent spacing and typography
- **Color system** standardization across components

### Phase 5: Performance & Design Mastery
- **Performance optimization** with animation elimination and DOM simplification
- **Apple glassmorphism** with authentic backdrop-filter effects
- **Sidebar navigation** with working hamburger menu and responsive behavior
- **Rounded corner system** with consistent Apple-style aesthetics
- **Mobile-first design** with optimized touch interactions

### Latest Major Update: Minimalist Design System (December 2024)
**Complete transition from glassmorphism to clean minimalist design**:

**Minimalist Design Implementation**:
- **Removed glassmorphism effects**: Eliminated backdrop-filter, blur effects, and complex visual styling
- **Clean card system**: Simple white/gray cards with subtle borders and shadows
- **Consistent color palette**: Professional blue primary (#2563eb), clean grays, proper contrast ratios
- **Simplified animations**: Removed all complex animations, kept only essential 0.15s transitions
- **8px border radius**: Modern, clean rounded corners throughout the interface
- **Unified navigation**: SimpleSidebar component used consistently across all pages

**Performance & Consistency**:
- **Global style cleanup**: Completely rewritten `src/app/globals.css` with minimalist approach
- **Component standardization**: All management pages (Dashboard, Quests, Rewards, Life Areas) now use identical styling patterns
- **Eliminated style inconsistencies**: Removed old liquid-container, glass-card, and animation classes
- **Clean form inputs**: Consistent styling with proper focus states and accessibility
- **Optimized rendering**: Simplified DOM structure for better performance

**Files Updated**:
- `src/app/globals.css` - Complete rewrite with minimalist design system
- `src/components/Dashboard.tsx` - Updated to use `.card` classes instead of `.glass`
- `src/components/QuestManagement.tsx` - Unified with SimpleSidebar navigation and card styling
- `src/components/RewardsManagement.tsx` - Consistent minimalist styling and navigation
- `src/components/LifeAreasManagement.tsx` - Clean card design and sidebar integration

**Key Design Elements**:
- **White backgrounds** with subtle gray borders (#e2e8f0)
- **Clean shadows** using Tailwind's shadow utilities
- **Professional color scheme** with accessible contrast ratios
- **Consistent spacing** and typography throughout
- **Fast, smooth interactions** without visual distractions

### Current State (December 2024)
The Grind Souls application is now a **production-ready**, **high-performance** gamified habit tracker with:

**Core Features**:
- Complete quest management with subtasks and recurring patterns
- Life area progression with XP-based leveling
- Custom rewards system with currency mechanics
- Comprehensive filtering, search, and management interfaces

**Performance**:
- **Lightning-fast UI** with eliminated lag and optimized rendering
- **Mobile-optimized** with touch-friendly interactions
- **Build-optimized** with reduced bundle size and faster loading

**Design**:
- **Clean minimalist interface** with consistent styling across all pages
- **Working sidebar navigation** with hamburger menu
- **Professional appearance** suitable for productivity applications
- **Responsive design** that works perfectly on all devices

**Technical Excellence**:
- **TypeScript coverage** with strict typing
- **Local-first architecture** with IndexedDB persistence
- **Component architecture** with reusable UI elements
- **Build success** with no errors or warnings

The application successfully transforms daily habits into an engaging RPG-style experience while maintaining excellent performance and a clean, professional appearance.