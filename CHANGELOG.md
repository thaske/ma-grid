# Unreleased

### Added

- Userscript version for Safari and browsers without extension stores

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
