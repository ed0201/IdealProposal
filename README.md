# IdealProposal — Configurador de Anillos de Compromiso

Aplicación web interactiva con visualizador 3D de anillos de compromiso, cotizador en MXN y guía educativa de las 4Cs del diamante.

## Tecnologías

- HTML + React (via Babel in-browser, sin build step)
- Tailwind CSS (CDN)
- `<model-viewer>` de Google para los modelos 3D `.glb`

## Estructura

```
.
├── index.html              # Punto de entrada
├── app.jsx                 # Shell de la app + pestañas
├── configurator-3d.jsx     # Pestaña Configurador con visualizador 3D
├── education.jsx           # Pestaña Guía de Educación (4Cs + metales)
├── ring.jsx                # Constantes (paleta de metales, formas, monturas)
└── models/                 # Modelos 3D (.glb)
    ├── ring-solitario.glb
    ├── ring-halo.glb
    ├── ring-tres-piedras.glb
    ├── gem-round.glb
    ├── gem-princess.glb
    ├── gem-emerald.glb
    └── gem-oval.glb
```

## Cómo desplegar en GitHub Pages

1. Crea un repositorio público en GitHub.
2. Sube TODOS los archivos de este folder (incluyendo `models/`).
3. En el repo → **Settings → Pages**.
4. **Source:** Deploy from a branch · **Branch:** `main` · **Folder:** `/ (root)`.
5. Espera 1–2 minutos. Tu sitio estará en `https://tu-usuario.github.io/<repo>/`.

## Cómo probar localmente

Como los `.glb` se cargan vía `fetch`, necesitas un servidor HTTP (no funciona abrir `index.html` directamente desde el disco). Opciones:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```

Abre `http://localhost:8000`.

## Créditos

Modelos 3D propios. Pricing referencial al mercado mexicano.
