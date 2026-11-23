# Primal Echo — rediseño inmersivo

## Archivos de la implementación
- `game/templates/game/base.html`: documento compartido, fuentes, manifest, pie e instalación.
- `game/templates/game/navegacion.html`: navegación de escritorio y diálogo móvil.
- `game/templates/game/progreso.html`: portada, historia sin spoilers, niveles, habilidades, guardianes y brazalete.
- `game/templates/game/habilidades.html`: cinco animaciones con sprites del proyecto.
- `game/templates/game/como_jugar.html`: guía, chips con sección activa, selector teclado/mando y keycaps.
- `game/templates/game/personajes.html` y `novedades.html`: composiciones con arte y contenido actual.
- `game/static/game/echo.css` y `echo.js`: implementación nueva, sin frameworks.
- `game/static/game/entrada.js`: saludo y persecución de Kael integrados, recursos WebP.
- `game/static/game/manifest.webmanifest` y `game/templates/game/service-worker.js`: instalación y pantalla offline.

## Arte
Se usó la herramienta integrada image_gen. Diez imágenes originales en `game/static/game/art/`: `hero-wide.webp` (16:9), `hero-tall.webp` (9:16), `claro.webp`, `valle.webp`, `instalaciones.webp`, `rex-art.webp`, `companeros.webp`, `parallax-sky.webp`, `parallax-ruins.webp` y `parallax-front.webp`. Las dos últimas preservan transparencia. Son ilustraciones promocionales, no capturas de gameplay. Las fuentes de generación están en `PROMPTS.json` y `CLARO-PROMPT.md`. Se conservaron los PNG originales del proyecto; la web usa WebP.

## Decisiones de contenido
Se mantienen las instalaciones tecnológicas abandonadas, según la aclaración narrativa del autor; no se introduce un templo religioso. Solo se presenta la premisa del ataque a la comunidad y la búsqueda de Kael y Kiro. No se revela origen, misión ni decisiones de NÉMESIS, ni el pasado de Kiro. El botón descarga el código fuente de la rama del proyecto: no promete un ejecutable ni una versión de navegador. Los niveles marcados disponibles son los presentes en la versión en desarrollo.

## Interacción y accesibilidad
Menú móvil con diálogo nativo, foco confinado, Escape y restauración de foco. Portada con parallax, esporas y niebla. Revelados escalonados y animaciones activas solo en pantalla. `prefers-reduced-motion` muestra contenido estático. La guía tiene chips fijos solo en esa vista. Selector de teclado/mando sincronizado entre combate y brazalete, con `aria-pressed`. Teclas y botones Xbox dibujados con CSS; A/B/X/Y conservan los colores de sus controles.

## PWA y rendimiento
Manifest con iconos de 192 y 512 px y alcance raíz. Botón de instalación solo cuando existe un evento real del navegador; instrucciones para Safari y otros casos. Service worker v32, caché de recursos estáticos y navegación por red con pantalla offline de reserva. Nunca se almacenan páginas personales o formularios en el caché de estáticos. No se añadieron dependencias de Python ni JavaScript. Fuentes con display=swap, imágenes WebP y carga diferida fuera de la portada.

## Verificación
Ejecutar `./.venv/bin/python manage.py check`, `./.venv/bin/python manage.py test` y `./.venv/bin/python manage.py collectstatic --noinput`. La suite valida rutas, acceso/registro, recursos locales, contenido sin spoilers, controles y manifest/service worker. La revisión visual cubre escritorio, móvil, menú y controles Xbox.

## Usar el código entregado
El ZIP contiene el proyecto Django con plantillas, HTML, CSS, JS y arte integrados. Se omiten la base de datos de usuarios, la clave privada, el entorno virtual y los estáticos duplicados. Para actualizar una copia existente conserva `db.sqlite3` y `.secret_key`. Para una copia nueva instala `requirements.txt` en un entorno virtual y ejecuta `python manage.py migrate`, `python manage.py collectstatic --noinput` y `python manage.py runserver`. El botón de descarga del juego sigue apuntando al repositorio del juego, no al ZIP de la web.

## Revisión móvil y marca simplificada
Nueva marca tipográfica en `game/templates/game/wordmark.html`, con exportación SVG en `game/static/game/art/primal-echo-wordmark.svg`: sin texturas ni relieves generados. Kiro independiente para notas en `game/static/game/art/kiro-notas.webp`, exportación ligera `kiro-notas-small.webp`; generación y prompt en `KIRO-NOTES.md`. Revisión de anchos 320 y 390 px, controles, navegación y secuencia caminar → saludar → persecución. Se aumentó el tamaño de lectura móvil y las áreas táctiles de navegación. Caché renovado v32.

## Pixel art y Rex fiel al juego
Los fondos se sustituyen por versiones originales en pixel art. Ambas portadas carecen de personajes: solo aparece Kael mediante la animación. Su suelo se dibuja con formas de píxeles, sin vegetación pintada superpuesta. Rex se rehace a partir de Assets/Sprites/Enemigos/Vista/Rex.png, conservando placas manufacturadas blancas, cuerpo mecánico oscuro, cables naranjas, módulo dorsal cian y antenas. Se muestra como sprite transparente completo con object-fit: contain; en móvil el texto va debajo. Se mantienen exportaciones maestras sin pérdida y versiones ligeras *-web.webp. Prompts y referencias: PIXEL-ART-PROMPTS.json. Únicamente se edita la PWA. Caché v33.

Verificación final: Rex completo en Inicio, Personajes y Novedades a 320 y 390 px; sin desbordamientos y con ajuste contain. Saludo y persecución de Kael comprobados sobre la portada vacía de personajes. Suelo pixelado y limpieza del lienzo al finalizar. Ocho pruebas aprobadas. Caché final v34.

## Escena de encuentro con Rex
Se sustituye la presentación del sprite aislado por una escena completa de Kael frente a Rex en las ruinas, según la aclaración del autor. Dos composiciones originales en pixel art: `game/static/game/art/rex-encounter-wide.webp` y `rex-encounter-tall.webp`. La referencia de identidad sigue siendo el sprite Rex.png del juego, sin armadura fósil. Picture selecciona la escena vertical por debajo de 1000 px. El encuadre completo usa contain; texto debajo en móvil y superpuesto en escritorio. Prompts: REX-ENCOUNTER-PROMPTS.json. Caché v35.

## Rex: puesta en escena más natural
Nueva dirección de composición basada en la referencia del autor: Kael en primer plano con arco, Rex en segundo plano a escala contenida, luz natural y profundidad. Se mantienen pixel art y diseño propio. Archivos: rex-cinematic-wide.webp y rex-cinematic-tall.webp; prompts en REX-CINEMATIC-PROMPTS.json. El texto va debajo para conservar visible la acción. Caché v36.
