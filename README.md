# Primal Echo · PWA

La web oficial de Primal Echo está publicada en [Railway](https://primal-echo-production.up.railway.app/). El servicio despliega desde [`codex/primal-echo-railway`](https://github.com/boletosscw-spec/pwa/tree/codex/primal-echo-railway).

## Imágenes vigentes

- [Personajes y objetos](game/static/game/img/actual). Kael, Kiro, Explorador, Ala Cian, Ala Ámbar, Rex, NÉMESIS y los objetos del brazalete. Los PNG son los archivos para reutilizar. La web carga las versiones WebP donde las necesita.
- [Animación de entrada](game/static/game/img/entrada). Fotogramas de Kael y Atlas.
- [Sprites del videojuego en Unity](https://github.com/boletosscw-spec/Primal-Echo/tree/avances-enemigos-y-cinematicas/Assets). Los [recursos de Atlas](https://github.com/boletosscw-spec/Primal-Echo/tree/avances-enemigos-y-cinematicas/Assets/Resources/Jefes/Atlas) están en ese repositorio.

Las ilustraciones de la web y los recursos de la portada están en [`art`](game/static/game/art).

## Ejecutar en local

Con Python 3.14 y un entorno virtual activo, instala `requirements.txt` y ejecuta `python manage.py migrate` y `python manage.py runserver`. Verifica el proyecto con `python manage.py test`.
