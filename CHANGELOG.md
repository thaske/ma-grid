# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# [1.0.0] - 2025-12-24

### Fixed

- XP not updating after completing lessons/reviews
- Background refresh now updates all open tabs

### Changed

- Consolidated browser modules (`modules/firefox.ts`, `modules/safari.ts`)
- Cache freshness check (30s stale-while-revalidate)

### Added

- Test suite (aggregation, API, demo)
- Prettier and Bun configuration

# [1.0.0] - 2025-12-23

### Added

- Activity heatmap
- Settings popup
- Option to change placement between "Incomplete tasks" or "Sidebar" sections
- Option to hide original XP element
- "Clear cache" button
