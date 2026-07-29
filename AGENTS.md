# AGENTS.md

## Estructura

Cuatro juegos Angular 18 independientes (no es un monorepo):

| Juego      | Ruta Angular            | Electron | Comando build + empaquetado    |
|------------|-------------------------|----------|--------------------------------|
| Ruleta     | `ruleta/ruleta/`        | No       | `cd ruleta/ruleta && ng build` |
| Trivia     | `trivia/trivia/`        | Sí (`trivia/main.js`)    | `cd trivia && npm run dist`    |
| Memotest   | `memotest/memotest/`    | Sí (`memotest/main.js`)  | `cd memotest && npm run dist`  |
| Reaction   | `reaction/reaction/`    | Sí (`reaction/main.js`)  | `cd reaction && npm run dist`  |

## Comandos clave

- **Ruleta (dev)**: `cd ruleta/ruleta && ng serve` → http://localhost:4200
- **Trivia (dev)**: `cd trivia/trivia && ng serve`
- **Memotest (dev)**: `cd memotest/memotest && ng serve`
- **Reaction (dev)**: `cd reaction/reaction && ng serve`
- **Trivia build + Electron dist**: `cd trivia && npm run dist`
- **Memotest build + Electron dist**: `cd memotest && npm run dist`
- **Reaction build + Electron dist**: `cd reaction && npm run dist`
- **Tests unitarios**: `cd <angular-app> && ng test` (Karma + Jasmine)

## Electron

- Trivia, Memotest y Reaction envuelven la app Angular con Electron
- `main.js` en cada carpeta padre carga `dist/browser/browser/index.html`
- Build: `npm run build-angular` compila Angular con `--base-href ./ --output-path ../dist/browser`
- Dist empaquetado: `npm run dist` → build Angular + `electron-builder --win` → genera `.exe` (NSIS) en `dist-electron/`
- `frame: false`, menú oculto, maximizado al abrir

## Dependencias compartidas

- `sweetalert2` usado en todos los juegos
- Ruleta usa además `@theblindhawk/roulette`
- Cada Angular app tiene su propio `node_modules` y `package.json`
- Las carpetas padre (Electron) tienen su propio `package.json` y `node_modules`

## Notas

- Ruleta **no** tiene wrapper Electron ni package.json de build; solo es la app Angular standalone
- Los 4 proyectos usan Angular 18.2 + TypeScript ~5.5 + Zone.js ~0.14
- No hay lint configurado, ni husky, ni CI/CD
- Sin cobertura e2e configurada
- `dist/browser/browser/index.html` (doble `browser/`) es la ruta de producción esperada por los `main.js`
