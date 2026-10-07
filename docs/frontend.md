# Frontend guide

The frontend lives in `frontend/`. It uses React for the interface, TypeScript for type checking, React Router for pages, Bootstrap for styling, and Vite for development and builds. Most app code belongs in `frontend/src/`.

## Where things go

| File or folder | Purpose and what belongs here |
| --- | --- |
| `src/main.tsx` | Starts React in the HTML `root` element. Wraps `App` in `BrowserRouter` and `StrictMode`, and imports Bootstrap's global CSS. |
| `src/App.tsx` | Defines the app's shared layout and routes. Currently wraps the pages in `CourseProvider` and maps `/` to `Home` and `/starred` to `Starred`. Add new routes here. |
| `src/pages/` | Components representing whole pages. `Home.tsx` currently displays a welcome message; `Starred.tsx` is an empty placeholder. Pages arrange smaller components. |
| `src/components/` | Reusable UI pieces such as course cards, search forms, or navigation. `CourseCard.tsx` is currently an empty placeholder. Pass a specific course to a card through props. |
| `src/contexts/CourseContext.tsx` | Contains **CourseProvider**, despite the filename. Stores the shared `courses` state and supplies `courses` and `setCourses` to its descendants. |
| `src/hooks/useCourseContext.ts` | Creates the **CourseContext** object and exports the hook that reads it. The hook throws a helpful error when used outside the provider. Other reusable React hooks also belong in `hooks/`. |
| `src/types/course.ts` | Describes the `Course` and `Section` data shapes. Both types currently live in this one file. Types help autocomplete and catch mistakes; they do not fetch or create data. |
| `src/api/courses.ts` | Currently empty. Put course-related backend request functions here, including request URLs, query parameters, HTTP error checks, and JSON response handling. |
| `src/assets/` | Images imported by app code. Currently contains starter images; replace or remove them as needed. |
| `public/` | Static files served directly, such as the favicon. For example, `public/favicon.svg` is available at `/favicon.svg`. |

Use `.tsx` for files containing JSX (markup such as `<h1>`), and `.ts` for files without JSX, such as types and API functions.

## How the pieces connect

```text
index.html → main.tsx → BrowserRouter → App → CourseProvider → routed page
```

`CourseProvider` owns the course state. A component beneath it can read that state with:

```tsx
import { useCourseContext } from '../hooks/useCourseContext'

// Inside a component or another custom hook:
const { courses, setCourses } = useCourseContext()
```

Updating the state with `setCourses` lets React render the updated data. Context access follows the component tree: consumers must be underneath the provider.

A future search could work like this:

```text
Search form → API function → backend response → setCourses(results)
           → Home renders a CourseCard for each course
```

Keep temporary state used by just one component, such as a search input's text, in that component. Use context for state that multiple parts of the app need to share. State currently lives in memory and resets on a page reload.

## Adding future features

- **New page:** create a component in `pages/` and register its route in `App.tsx`.
- **Reusable UI:** add it to `components/`; use props to supply its inputs.
- **Backend request:** add a function to `api/`. Match names and response shapes agreed in [API-contracts.md](API-contracts.md). The course endpoint is still proposed; the empty API file does not implement it.
- **New data shape:** add a type to `types/`. The current `Section` type includes only some fields from the proposed contract; extend it as the contract is implemented.
- **Styling:** use Bootstrap classes where suitable. Add component CSS alongside its component, or create `src/index.css` for global styles and import it after Bootstrap in `main.tsx`. The old starter CSS files have been removed.

## Supporting files and commands

| File | Purpose |
| --- | --- |
| `index.html` | HTML shell with the React mount point, page title, favicon, and entry script. |
| `package.json` / `package-lock.json` | Dependencies and npm scripts / locked dependency versions. |
| `vite.config.ts` | Vite configuration, including the React plugin. Future development proxy configuration belongs here. |
| `tsconfig.json` | Connects the app and tooling TypeScript configurations. |
| `tsconfig.app.json` | TypeScript rules for `src/`, including enabled strict checking. |
| `tsconfig.node.json` | TypeScript rules for tooling such as the Vite configuration. |
| `eslint.config.js` | Code checks, including React hook and Fast Refresh rules. |
| `README.md` | Vite starter reference. Project setup instructions are in [Clone-and-App-Setup.md](Clone-and-App-Setup.md). |

From the repository root:

```sh
npm --prefix frontend run dev      # Start the development server
npm --prefix frontend run lint     # Check code with ESLint
npm --prefix frontend run build    # Check TypeScript and create a production build
npm --prefix frontend run preview  # Serve the production build locally
```

`node_modules/` contains installed dependencies; `dist/` contains generated build output. Neither is a place to write app code.
