You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

### Commit Message Format

All commits must use this Conventional Commits format:

```text
<type>(<scope>): <short summary>
<type>: <short summary>
  |       |             |
  |       |             +- Summary in imperative present tense. Not capitalized. No period at the end.
  |       |
  |       +- Optional commit scope: angular|app|auth|build|dashboard|events|home|lint|navbar|
  |                                  submissions|submit-talk|supabase|talk-submissions|ui
  |
  +- Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

The `<type>` and `<short summary>` fields are mandatory. The `(<scope>)` field is optional. For example, use either `build(angular): increase component style budget` or `build: increase component style budget`.

#### Type

Must be one of the following:

| Type | Description |
| --- | --- |
| `build` | Changes that affect the build system, deployment tooling, or external dependencies. |
| `ci` | Changes to CI configuration files and scripts. |
| `docs` | Documentation-only changes. |
| `feat` | A new feature. |
| `fix` | A bug fix. |
| `perf` | A code change that improves performance. |
| `refactor` | A code change that neither fixes a bug nor adds a feature. |
| `test` | Adding missing tests or correcting existing tests. |

#### Scope (optional)

The scope should describe the main project area affected, as perceived by someone reading the Git history or changelog. Prefer existing scopes over introducing narrow one-off scopes.

Supported scopes:

- `angular`: Angular framework configuration, migrations, and version-specific framework changes.
- `app`: Application shell, route organization, and cross-feature application wiring.
- `auth`: Authentication flows, login UI, sessions, and organizer sign-in behavior.
- `build`: Production build behavior, deployment configuration, and environment injection.
- `dashboard`: Organizer dashboard views and workflows.
- `events`: Event creation, event details, event visibility, and event data display.
- `home`: Homepage content, sections, stats, and event previews.
- `lint`: ESLint, Stylelint, Prettier, and formatting/linting setup.
- `navbar`: Main navigation, mobile drawer, and user menu behavior.
- `submissions`: Speaker submission data, validation, and speaker-facing submission UI.
- `submit-talk`: Submit-talk route, form, and success flow.
- `supabase`: Supabase schema, client integration, storage, and data access.
- `talk-submissions`: Organizer talk review workflow and talk-submission notifications.
- `ui`: Shared visual polish, layout, theme, and interaction styling.

Use a more specific historical scope only when it is clearly the best fit for the change: `analytics`, `deps`, `email`, `hero`, `sponsors`, `theme`, or `team`.

#### Summary

Use the summary field to provide a succinct description of the change:

- use the imperative, present tense: `add`, not `added` or `adds`
- do not capitalize the first letter
- do not end with a period
