# Contenido de Primal Echo

Revisión: 12 de noviembre de 2026. Fuente: rama `avances-enemigos-y-cinematicas`, commit `16020b4`. Solo se editó la PWA.

## Fuentes contrastadas

- `Assets/Scripts/Niveles/Centinelas.cs`, método `Convert`: reemplaza robots por Explorador, avispas por Ala Cian / Ala Ámbar y elimina las plantas carnívoras. También contiene las nuevas IA terrestres y voladoras.
- `Assets/Scripts/Niveles/CentinelaRex.cs`: jefe del Templo, salida bloqueada, mordida, embestida, cola y furia a media vida.
- `Assets/Editor/JungleLevelBuilder.cs`, `SetupNemesisFinale`: Rex solo y NÉMESIS representada por una computadora al final.
- `Assets/Scripts/Brazalete/BraceletMenu.cs`: Tab / Start; Esc / B; Q-E / LB-RB; Enter / A. Inventario y mejoras.
- `BraceletProgress.cs`, `ItemPickup.cs` y `Assets/Resources/Brazalete/ConfiguracionBrazalete.asset`: fragmentos, núcleos, frutas (máximo 3, curan un corazón), chips, mejoras de vida y daño, y requisitos de nivel II.
- `Assets/Scripts/Niveles/KeyPickup.cs`, `LabDoor.cs`: llave del Valle que abre la barrera del Templo.
- `Assets/Scripts/Niveles/TutorialDirector.cs`: guía secuencial, barreras por objetivos y blancos inmóviles.
- Mapas de tutorial y niveles, escenas y `ProjectSettings/EditorBuildSettings.asset`: introducción, Claro del Despertar, Valle y Templo.
- `Assets/Scenes/Cinematica_Intro.unity`: salida al tutorial. `Assets/Cinematicas/Intro_Primal_Echo.playable`: narración y reparación de Kiro.
- Controlador, lanza, arco y salud: controles, pogo, fijación de apuntado, daño y checkpoints.

## Recursos

`game/static/game/img/actual` contiene copias del fondo del valle, el frame actual de Kael, frame de CentinelaTerrestre/01_Idle (controlador Terrestre), hojas Idle de centinelas alados y Rex, NÉMESIS y los iconos HUD. Las hojas se recortan visualmente por CSS; no se modifican los originales del juego. Los recursos antiguos permanecen en disco, pero no se presentan como enemigos actuales.

## Diseño y alcance

Las tres páginas usan `mundo.css`: fondo atmosférico del proyecto, tipografía serif, separadores, fichas amplias, sprites nítidos y controles apilados en teléfonos. Las páginas informativas Personajes, Novedades y Cómo jugar son públicas. Inicio de usuario y Contacto conservan su requisito de sesión. Login y registro comparten un parcial de modales; la portada pública también usa la estética nueva. También se corrigen en la portada las referencias que negaban las mejoras del brazalete o omitían el tutorial. No se promete compañero controlable para Kiro, nueva fase de Rex, bloqueo funcional ni lanzamiento. Los siguientes pasos son propuestas de validación. No se ejecutó Unity.

## Verificación

    .venv/bin/python manage.py check
    .venv/bin/python manage.py test
    .venv/bin/python manage.py collectstatic --noinput

Las pruebas cubren rutas privadas, login/logout, recursos locales, contenido actualizado, página offline y service worker. Después de reunir estáticos hay que recargar Gunicorn para renovar el inventario de WhiteNoise sin cerrar el túnel de Cloudflare.

## Entrada animada y limpieza del archivo visual

Se retiraron de la PWA las copias terminal.png y cristales.png procedentes de Environment/Relics: su presencia en disco no confirmaba su uso en las escenas actuales. La galería utiliza ahora fragmento, fruta y chip del HUD actual. No se borró ningún recurso del juego.

La entrada es una viñeta exclusiva de la web: caminar → saludo frontal → susto → huida con Explorador. Usa la hoja Kael_Caminar_08frames y los ocho frames de CentinelaTerrestre/03_Correr. Los archivos kael-gestos.png y kael-correr-asustado.png se generaron como adaptación del personaje para esta secuencia; no se presentan como animaciones implementadas en Unity. Dura siete segundos, se omite con botón/Escape, respeta reduced-motion, libera el foco y no bloquea la página si fallan las imágenes. Aparece al entrar en Inicio y al recargar; no interrumpe cada enlace interno. El pie ofrece repetirla.

Ajuste del saludo: se articula únicamente la mano del sprite frontal sobre un cuerpo estático, sin balanceo ni rebote. Se elimina el texto de la persecución.

## Portada integrada y bosque actual

El hero usa las cinco capas de BosqueCaricatura/Imagenes/BosqueDos/Capas, verificadas en BuildJungleParallax; se elimina la copia valle.png usada antes. El suelo se dibuja desde JungleTiles/environment/tiles/jungle/tile_jungle_ground_brown.png. La escena de Kael es ahora un canvas dentro del hero: sin modal, bloqueo de scroll/foco, barra ni botón de omitir. El saludo mantiene el cuerpo fijo. Se conserva Repetir escena.

La portada adopta la misma serif del resto del atlas, lenguaje dirigido al jugador, luciérnagas, parallax por capas, apariciones al desplazarse y chips sticky con sección activa. Reduced-motion desactiva estos movimientos y deja una pose estática. Kiro aparece como guía editorial de la web: su sprite se muestra desde el último cuadro de la secuencia de reparación actual, sin afirmar una nueva función de acompañante dentro del juego.

No existe un ejecutable en la copia revisada. El botón Descargar proyecto enlaza al ZIP de la rama avances-enemigos-y-cinematicas de GitHub (HTTP 200 comprobado), con aviso de que requiere Unity 6. No se anuncia una versión jugable para el navegador.

## Marca y secuencia de bienvenida

Se genera un logo transparente original para la web en img/marca/primal-echo-logo.png, con piedra/metal, raíces y acentos cian/ámbar. Se integra en la cabecera y el hero. La secuencia automática presenta primero el logo (mínimo 1,4 segundos), reproduce los siete segundos de Kael y después muestra descripción y botones. Durante la espera los botones son inertes; se recuperan al terminar o si falla la carga, sin bloquear la navegación ni el scroll. Reduced-motion muestra directamente una pose y los enlaces. No hay Repetir escena, ni flechas en los botones del hero.

El menú móvil toma los colores, scanlines, bordes recortados y acento ámbar de BraceletHologram.cs y BraceletSettings.cs. Mantiene Bootstrap, estado expandido accesible, cierre con Escape/fuera del menú y los formularios originales.

## Dirección ilustrada y ritmo visual

La web se ajusta provisionalmente a una dirección ilustrada, sin cambiar el arte del juego. Se retira la franja del tileset saturado: el canvas combina un suelo de tierra oscura con la capa Ground ilustrada del mismo bosque. La cabecera móvil oculta su logo mientras el hero está en la vista inicial. Botones y chips usan serif, metal envejecido y esquinas biseladas; una viñeta local mejora el contraste sin oscurecer todo el bosque.

Se intercalan dos tarjetas con animaciones originales de lanza y arco (KaelAnimaciones/Combate, 8 fotogramas cada una), reproducidas solo al estar visibles. Están identificadas como vistas de sprites, no capturas de partidas. No se encontraron capturas completas del juego que permitan añadir escenas de gameplay fieles. Se acortan descripciones y se reducen consejos repetidos.

## Corrección narrativa del autor

La instrucción del usuario prevalece sobre los nombres antiguos de escenas: el objetivo es descubrir qué ocurrió con NÉMESIS en instalaciones tecnológicas abandonadas vigiladas por dinobots. Se retira toda referencia al templo de las páginas informativas. No se modifica el juego. La cabecera sustituye la hamburguesa por enlaces directos visibles, manteniendo acceso y registro.

## Terminología y fuente narrativa confirmada

El usuario descarta «dinobots»: la web usa «criaturas». Se recuperó el texto escrito por el usuario en Historia de Primal Echo (6ae4edaf-ae54-83e8-8a57-6fd7d80247f5): NÉMESIS fue creada para restaurar el planeta; una criatura colosal ataca la comunidad de Kael; él busca respuestas en las instalaciones y repara a Kiro, cuyo pasado está ligado a NÉMESIS. También se revisó Generar voces de diálogo (6af380a3-b374-83e8-8683-684e9cd8b158), que contiene la secuencia del ojo azul, análisis y transformación a rojo. Las propuestas del asistente en esos chats no se usan como avances implementados. El término descartado en notas históricas anteriores no representa la terminología vigente.


## Revisión narrativa — 16 de noviembre de 2026
Fuente principal: texto del usuario en «Historia de Primal Echo» (6ae4edaf-ae54-83e8-8a57-6fd7d80247f5). NÉMESIS restaura ecosistemas, decide por sí misma eliminar a la humanidad y continúa activa. Kael investiga las órdenes tras el ataque a su comunidad; repara a Kiro, compañero biomecánico con recuerdos incompletos. Se retiran lemas sobre despertar, silencio, recuerdos del mundo y un núcleo final no establecidos en esa historia. Kiro no se presenta como guía que habla o enseña controles. Los controles y niveles se describen como contenido de la versión en desarrollo, no como capítulos confirmados del argumento. Solo se edita la PWA.

## Presentación pública sin spoilers
Por petición del usuario, la web solo presenta el ataque a la comunidad, el viaje de Kael con Kiro y las instalaciones vigiladas. No revelar el origen, decisión, misión ni estado de NÉMESIS; tampoco el vínculo o los recuerdos de Kiro. La historia completa anterior es referencia interna, no texto promocional.

## Rediseño inmersivo completo
Nueva implementación en echo.css/echo.js y plantillas compartidas, sin Bootstrap. Arte promocional original WebP, menú móvil a pantalla completa, selector teclado/mando, habilidades con sprites, manifest e instalación. Se conserva la narrativa sin spoilers y las instalaciones tecnológicas, según la aclaración previa del autor. Documentación y prompts: docs/redesign/.
