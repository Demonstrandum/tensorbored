# TensorBored - Agent Guidelines

This document provides codebase design information for AI agents working on TensorBored.

**See also:** [NEW.md](./NEW.md) for a summary of features new to TensorBored (vs TensorBoard).

---

## Project Structure

```
/workspace/
├── tensorbored/              # Main source code
│   ├── webapp/               # Angular frontend (NgRx state management)
│   │   ├── metrics/          # Metrics dashboard (scalars, histograms, images)
│   │   ├── runs/             # Run selection and management
│   │   ├── profile/          # Dashboard profiles feature
│   │   ├── header/           # Top navigation bar
│   │   ├── core/             # Core state and actions
│   │   └── widgets/          # Reusable UI components
│   ├── plugins/              # Backend plugins (Python)
│   │   ├── core/             # Core plugin with profile_writer
│   │   ├── scalar/           # Scalar data plugin
│   │   └── ...               # Other plugins
│   ├── backend/              # WSGI backend server
│   └── pip_package/          # Package build scripts
├── .github/workflows/        # CI/CD workflows
├── demo/                     # Demo deployment files
└── docs/                     # Documentation
```

---

## Frontend Architecture

### State Management (NgRx)

The frontend uses NgRx for state management with these patterns:

- **Actions** - Events that trigger state changes (e.g., `metricsTagFilterChanged`)
- **Reducers** - Pure functions that update state
- **Selectors** - Memoized functions to derive data from state
- **Effects** - Side effects like API calls or localStorage

Key state slices:
- `metrics` - Card data, pinned cards, superimposed cards, settings
- `runs` - Run metadata, selection state, colors
- `profile` - Saved profiles, active profile

### Component Patterns

Components follow Angular patterns:
- **Container components** - Connect to store, dispatch actions
- **Presentation components** - Pure UI, receive inputs, emit outputs
- Use `ChangeDetectionStrategy.OnPush` for performance

### Key Files

| Feature | Files |
|---------|-------|
| Superimposed cards | `webapp/metrics/views/card_renderer/superimposed_card_*` |
| Pinned cards | `webapp/metrics/store/metrics_reducers.ts` (pin reducers) |
| Run selection | `webapp/runs/store/runs_reducers.ts` |
| Profile system | `webapp/profile/` directory |
| Tag filter | `webapp/metrics/views/main_view/filter_input_*` |

---

## Backend Architecture

### Plugin System

Each plugin provides:
- Data loading from tfevents
- HTTP endpoints for frontend
- Summary writing utilities

### Profile Writer

Location: `tensorbored/plugins/core/profile_writer.py`

Writes default profiles to `<logdir>/.tensorboard/default_profile.json`

---

## LocalStorage Keys

The frontend persists state to localStorage:

| Key | Purpose | Format |
|-----|---------|--------|
| `_tb_profile.*` | Saved profile data | JSON ProfileData |
| `_tb_profiles_index` | List of profile names | JSON string array |
| `_tb_active_profile` | Active profile name | Plain string |
| `_tb_run_selection.v1` | Run visibility | `{version: 1, runSelection: [[id, bool], ...]}` |
| `_tb_run_colors.v1` | Color overrides | `{version: 1, runColorOverrides: [...], groupKeyToColorId: [...]}` |
| `_tb_tag_filter.v1` | Tag filter | `{value: string, timestamp: number}` |
| `tb-saved-pins` | Pinned cards | JSON CardUniqueInfo array |

---

## Common Tasks

### Adding a New Setting

1. Add to `MetricsState` in `webapp/metrics/store/metrics_types.ts`
2. Add initial value in `webapp/metrics/store/metrics_reducers.ts`
3. Create action in `webapp/metrics/actions/index.ts`
4. Add reducer case in `webapp/metrics/store/metrics_reducers.ts`
5. Add selector in `webapp/metrics/store/metrics_selectors.ts`
6. Wire up in component

### Adding localStorage Persistence

1. Define storage key constant
2. Create load effect (triggers on `navigated`, reads from localStorage)
3. Create persist effect (triggers on relevant actions, writes to localStorage)
4. Add to effect's merged observable if non-dispatching

### Modifying Profile Schema

1. Update `ProfileData` interface in `webapp/profile/types.ts`
2. Update `createEmptyProfile()` function
3. Update `isValidProfile()` validation
4. Bump `PROFILE_VERSION` if breaking change
5. Add migration logic in `migrateProfile()`

---

## Testing

### Running Tests

```bash
# All tests
bazel test //tensorbored/...

# Specific test
bazel test //tensorbored/webapp/runs/store:runs_reducers_test

# Frontend tests
bazel test //tensorbored/webapp/...
```

### Test Patterns

- Unit tests colocated with source (`*_test.ts`)
- Use `fakeAsync` for async tests
- Override selectors with `store.overrideSelector()`

---

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push, PR | Build, test, lint |
| `wheel-prerelease.yml` | Push to master | Build RC wheel, publish to PyPI, trigger demo deploy |
| `deploy-demo.yml` | Called by wheel-prerelease | Deploy to HF Spaces |
| `pr-preview.yml` | Part of ci.yml | PR preview deployments |

---

## Coding Guidelines

From user preferences:

1. **Avoid branching in hot loops** - Select specialized functions once per run
2. **Prefer dataclasses over dicts** - Better type safety on core paths
3. **Use int/enum comparisons** - Not string comparisons in perf-sensitive code
4. **No constant conditionals in loops** - Decide branches outside loops
5. **Avoid defensive programming** - No unnecessary try/except fallbacks

---

## Key Differences from TensorBoard

| Area | TensorBoard | TensorBored |
|------|-------------|-------------|
| Pins storage | URL params (limited) | localStorage (up to 1000) |
| Dashboard state | Lost on refresh | Persisted via profiles |
| Multiple metrics | Separate charts | Superimposed plots |
| Configuration | CLI only | Python API + profiles |
| Run colors | Auto-assigned | Persistent custom colors |

---

## Debugging Tips

### State Inspection

Install Redux DevTools browser extension to inspect NgRx state.

### Network Issues

Check browser DevTools Network tab. TensorBored should only make requests to `localhost`.

### Empty Charts

If charts appear blank:
1. Check if time series data exists in state
2. Verify run selection (are runs visible?)
3. Check card visibility (intersection observer)
4. Look for console errors

### Profile Not Loading

1. Check localStorage in DevTools → Application → Local Storage
2. Verify profile JSON structure
3. Check for migration issues in console
