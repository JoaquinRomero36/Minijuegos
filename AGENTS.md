# AGENTS.md

## Estructura

Cinco juegos/experiencias Angular 18 independientes (no es un monorepo):

| Juego      | Ruta Angular            | Electron | Comando build + empaquetado    |
|------------|-------------------------|----------|--------------------------------|
| Ruleta     | `ruleta/ruleta/`        | No       | `cd ruleta/ruleta && ng build` |
| Trivia     | `trivia/trivia/`        | Sí (`trivia/main.js`)    | `cd trivia && npm run dist`    |
| Memotest   | `memotest/memotest/`    | Sí (`memotest/main.js`)  | `cd memotest && npm run dist`  |
| Reaction   | `reaction/reaction/`    | Sí (`reaction/main.js`)  | `cd reaction && npm run dist`  |
| Embajador  | `embajador/embajador/`  | Sí (`embajador/main.js`) | `cd embajador && npm run dist` |

## Comandos clave

- **Ruleta (dev)**: `cd ruleta/ruleta && ng serve` → http://localhost:4200
- **Trivia (dev)**: `cd trivia/trivia && ng serve`
- **Memotest (dev)**: `cd memotest/memotest && ng serve`
- **Reaction (dev)**: `cd reaction/reaction && ng serve`
- **Embajador (dev)**: `cd embajador/embajador && ng serve` → http://localhost:4210/embajador
- **Trivia build + Electron dist**: `cd trivia && npm run dist`
- **Memotest build + Electron dist**: `cd memotest && npm run dist`
- **Reaction build + Electron dist**: `cd reaction && npm run dist`
- **Embajador build + Electron dist**: `cd embajador && npm run dist`
- **Tests unitarios**: `cd <angular-app> && ng test` (Karma + Jasmine)

## Electron

- Trivia, Memotest, Reaction y Embajador envuelven la app Angular con Electron
- `main.js` en cada carpeta padre carga `dist/browser/browser/index.html`
- Build: `npm run build-angular` compila Angular con `--base-href ./ --output-path ../dist/browser`
- Dist empaquetado: `npm run dist` → build Angular + `electron-builder --win` → genera `.exe` (NSIS) en `dist-electron/`
- `frame: false`, menú oculto, maximizado al abrir

## Dependencias compartidas

- `sweetalert2` usado en todos los juegos
- Ruleta usa además `@theblindhawk/roulette`
- Embajador usa `qrcode` + `@types/qrcode` (QR en pantalla) y `html2canvas` (exportar credencial a PNG)
- La descarga de la credencial en Embajador exporta la **story card oculta** (`#story-card`, **1920×1080 horizontal**, estilo certificado con marco gradiente, fondo blanco, fila de 5 logos arriba, nombre y respuestas libres) a PNG. **No hay botón DESCARGAR**: la preview en pantalla (`step 5`) muestra el **propio PNG generado** (`<img [src]="storyDataUrl">`, sin URL bajo el QR). El QR es el único canal de descarga (Electron)
- Las preguntas del form son **texto libre** (sin opciones predefinidas): nombre, lugar, plato, mensaje (maxlength 40/40/60)
- **QR de descarga (Electron)**: al terminar, la story PNG se genera sola y se envía por IPC (`save-story-png`) al main de Electron, que **sube el PNG a internet** (multipart con `https` core, sin deps) y el QR codifica la **URL pública** → el celular descarga desde **cualquier red** (datos móviles u otra WiFi)
  - **Host primario**: `tmpfiles.org` (API `/api/v1/upload`, campo `file`) → URL `https://tmpfiles.org/<id>/<name>`; luego se hace GET a esa página y se extrae el href `https://tmpfiles.org/dl/<sig>/<id>/<name>` (el botón Download), que sirve el PNG **directo** (`image/png`). Autoborrado del archivo tras unas horas (no se retienen imágenes). Elegido porque **resuelve en el DNS del venue** y está detrás de **Cloudflare** (los carriers móviles no lo bloquean)
  - **Host secundario**: `litterbox.catbox.moe` (API `reqtype=fileupload`, `time=24h`) → URL `https://litter.catbox.moe/<token>.png` (expira en 24 h). Ojo: **algunos carriers/ISPs bloquean litterbox/catbox** (síntoma: misma WiFi OK, datos móviles no); por eso es solo respaldo
  - **No usar túneles** (`cloudflared trycloudflare`, ngrok…): los DNS de redes de eventos suelen bloquear `trycloudflare.com` (verificado en el venue)
  - `UPLOAD_TIMEOUT = 20 s` por intento
  - **Nombre aleatorio**: `embajador-<nombre>-<8 chars>.png` (URL no adivinable)
  - **Borrado local**: si la subida funciona, se borra el PNG de `%TEMP%/embajador-totem`; si falla, se conserva y se usa la **URL LAN** como respaldo (el celular debe estar en la misma WiFi)
  - **Kill-switch**: `EMBAJADOR_UPLOAD=0` desactiva la subida (siempre URL LAN)
  - El servidor HTTP local (`http://<IP-LAN>:4343/`, puerto fijo con reintento `4344+`, selección de IP que filtra adaptadores virtuales y prioriza `192.168.x` > `10.x` > `172.16-31.x`) queda como **respaldo**
  - El QR **nunca** codifica el volcado de datos: siempre es la URL de descarga (pública o LAN), o (si todo falla) un **texto de invitación** ("Vení a crear la tuya…") con el aviso en pantalla "Si no descarga, sacale una foto a la pantalla". La URL **no** se muestra en pantalla (solo va dentro del QR). Mientras se genera/sub e, la caja del QR muestra "Generando tu QR de descarga…" (no hay QR escaneable a medias)
  - En browser (dev, `ng serve`) no hay Electron → **no se muestra QR** en la caja, sino una nota: "El QR de descarga funciona en el totem (app instalada)." (sin botón DESCARGAR, la descarga es solo por QR en el totem). El QR **no** aparece en la imagen descargada
- **Requisito**: el totem necesita **internet** para el QR universal (LAN es solo respaldo). Primera vez que se abre el `.exe` hay que aceptar el aviso de firewall de Windows (para el respaldo LAN)
- `public/cards/logo-suramericanos-white.png` es el logo suramericanos rasterizado en blanco (fondo transparente) porque html2canvas no aplica filtros CSS ni renderiza SVGs externos
- El certificado (story card) usa **PNG rasterizados** (no SVG): `logo-suramericanos-color.png` (multicolor) + `logo-santafe-navy.png`, `logo-rosario-navy.png`, `logo-rafaela-navy.png`, `logo-municipio-navy.png` (todos recolorados a navy `#002751` porque los SVGs originales son blancos/grises y serían invisibles sobre fondo blanco). Generados por screenshot de elemento en Chromium con `omitBackground: true` (PNG RGBA con transparencia)
- Cada Angular app tiene su propio `node_modules` y `package.json`
- Las carpetas padre (Electron) tienen su propio `package.json` y `node_modules`

## Notas

- Ruleta **no** tiene wrapper Electron ni package.json de build; solo es la app Angular standalone
- Los 5 proyectos usan Angular 18.2 + TypeScript ~5.5 + Zone.js ~0.14
- `embajador/embajador/angular.json` tiene presupuestos ajustados (CSS 12 kB, bundle inicial ~590 kB como warning) por la hoja de estilos grande y las deps CommonJS (qrcode/html2canvas/sweetalert2)
- No hay lint configurado, ni husky, ni CI/CD
- Sin cobertura e2e configurada
- `dist/browser/browser/index.html` (doble `browser/`) es la ruta de producción esperada por los `main.js`
