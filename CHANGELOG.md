# 1.3.2 (2026-01-25)

### Changed

- Remove fallback timestamp parsing, now exclusively using dateCompletedStr from API

# 1.3.1 (2026-01-08)

### Fixed

- Strip console calls in production builds for userscript and extension bundles

# 1.3.0 (2026-01-08)

### Added

- Longest streak stat and settings toggles for stat visibility
- Longest streak tooltip clarification in settings
- Strip logger plugin for production builds
- E2E coverage for stats visibility
- Aggregation test for longest streak exclusion

### Changed

- Refactor settings UI into panel/form components
- Refactor data source abstraction and move types into utils/types
- Split E2E specs and share mock URL

### Fixed

- Userscript background refresh triggers on stale cache without waiting for onUpdate
- E2E profile isolation for parallel runs

# 1.2.1 (2025-12-29)

### Fixed

- Bug causing incorrect date calculations in certain time zones

# 1.2.0 (2025-12-28)

### Added

- Userscript version for Safari

### Changed

- Clean up leftover elements from previous script executions to prevent duplicates

# 1.1.1 (2025-12-28)

### Fixed

- Month labels colliding in calendar grid when spacing is insufficient

# 1.1.0 (2025-12-24)

### Fixed

- XP not updating after completing lessons/reviews
- Background refresh now updates all open tabs

### Changed

- Consolidated browser modules (`modules/firefox.ts`, `modules/safari.ts`)
- Cache freshness check (30s stale-while-revalidate)

### Added

- Test suite (aggregation, API, demo)
- Prettier and Bun configuration

# 1.0.0 (2025-12-23)

### Added

- Activity graph
- Settings popup
- Option to change placement between "Incomplete tasks" or "Sidebar" sections
- Option to hide original XP element
- "Clear cache" button
