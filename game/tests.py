import json
from html.parser import HTMLParser
from pathlib import Path
from django.conf import settings
from django.contrib.auth.models import User
from django.test import TestCase


class ResourceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for attr in ('src', 'href', 'srcset'):
            url = attrs.get(attr, '')
            if url.startswith('/static/game/'):
                self.resources.append(url.split('?')[0].removeprefix('/static/'))


class GamePortalTests(TestCase):
    def check_resources(self, response):
        parser = ResourceParser()
        parser.feed(response.content.decode())
        for resource in parser.resources:
            self.assertTrue((Path(settings.BASE_DIR) / 'game/static' / resource).is_file(), resource)

    def test_public_pages_share_the_design_and_have_valid_assets(self):
        for path in ['/', '/personajes/', '/novedades/', '/como-jugar/']:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                self.assertContains(response, 'echo.css?v=41')
                self.assertContains(response, 'echo.js?v=40')
                self.assertContains(response, 'id="mobile-menu"')
                self.assertContains(response, 'id="loginModal"')
                self.assertContains(response, 'manifest.webmanifest')
                self.assertNotContains(response, 'bootstrap')
                self.check_resources(response)

    def test_home_shows_art_skills_levels_and_real_download(self):
        response = self.client.get('/')
        for text in ['fondo_noche.webp', 'orn_sup.webp', 'orn_inf.webp',
                     '<h1 id="portada-titulo">Primal Echo</h1>', 'El mundo despertó',
                     'companeros-pixel-web.webp', 'Comienza el viaje',
                     'Valle del Eco', 'Claro del Despertar', 'Instalaciones abandonadas',
                     'Doble salto', 'Dash', 'Salto de pared', 'Pogo', 'Arco',
                     'Descargar proyecto', 'Código fuente para Unity 6',
                     'avances-enemigos-y-cinematicas.zip', 'class="kael-scene"', 'entrada.js?v=38']:
            self.assertContains(response, text)
        self.assertNotContains(response, 'rex-cinematic-wide.webp')
        self.assertNotContains(response, 'rex-cinematic-tall.webp')
        self.assertContains(response, 'El territorio<br>tiene guardianes.')
        self.assertContains(response, 'href="/personajes/#criaturas">Conoce a las criaturas</a>')
        self.assertNotContains(response, 'guide-nav')
        self.assertContains(response, 'name="usuario"')
        self.assertContains(response, 'name="password1"')

    def test_promotion_does_not_reveal_story_or_add_removed_lore(self):
        for path in ['/', '/personajes/', '/novedades/', '/como-jugar/']:
            response = self.client.get(path)
            for spoiler in ['eliminar a la humanidad', 'Sigue activa', 'conexión con NÉMESIS',
                            'pasado ligado a NÉMESIS', 'dinobot', 'templo', 'antes del núcleo',
                            'terminal.png', 'cristales.png']:
                self.assertNotContains(response, spoiler)

    def test_guide_has_keyboard_and_gamepad_and_local_subnavigation(self):
        response = self.client.get('/como-jugar/')
        self.assertContains(response, 'class="guide-nav"')
        for text in ['data-input-choice="keyboard"', 'data-input-choice="gamepad"',
                     'data-binding="keyboard"', 'data-binding="gamepad"',
                     'pad-a', 'pad-b', 'pad-x', 'pad-y', '<kbd>Ctrl</kbd>',
                     'Chips de memoria', 'id="supervivencia"']:
            self.assertContains(response, text)
        self.assertNotContains(response, '<table')

    def test_login_logout_and_private_pages_remain_available(self):
        for path in ['/inicio2/', '/contacto/']:
            self.assertRedirects(self.client.get(path), '/')
        User.objects.create_user(username='explorador', password='test-echo-password')
        self.assertRedirects(self.client.post('/login/', {
            'usuario': 'explorador', 'password': 'test-echo-password'
        }), '/inicio2/')
        for path in ['/inicio2/', '/contacto/', '/personajes/', '/como-jugar/', '/novedades/']:
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200)
            self.check_resources(response)
        self.assertRedirects(self.client.get('/logout/'), '/')
        self.assertRedirects(self.client.get('/inicio2/'), '/')

    def test_registration_flow_still_works(self):
        self.assertRedirects(self.client.post('/registro/', {
            'username': 'kael', 'email': 'kael@example.test',
            'password1': 'test-echo-password', 'password2': 'test-echo-password'
        }), '/inicio2/')
        self.assertTrue(User.objects.filter(username='kael').exists())
        # After registering, the site must treat the visitor as signed in.
        response = self.client.get('/inicio2/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'href="/logout/"')
        self.assertNotContains(response, 'data-dialog="loginModal">Mi cuenta')

    def test_registration_errors_reopen_the_dialog(self):
        User.objects.create_user(username='kael', email='kael@example.test', password='test-echo-password')
        response = self.client.post('/registro/', {
            'username': 'kael', 'email': 'otro@example.test',
            'password1': 'abc', 'password2': 'xyz'
        }, HTTP_REFERER='http://testserver/personajes/', follow=True)
        self.assertEqual(response.redirect_chain[-1][0], 'http://testserver/personajes/')
        self.assertContains(response, 'class="form-error"', count=2)
        self.assertContains(response, 'Ese nombre de usuario ya está en uso.')
        self.assertContains(response, 'Las contraseñas no coinciden.')
        self.assertFalse(User.objects.filter(email='otro@example.test').exists())
        weak = self.client.post('/registro/', {
            'username': 'kiro', 'email': 'kiro@example.test', 'password1': '12345', 'password2': '12345'
        }, follow=True)
        self.assertContains(weak, 'class="form-error"')
        self.assertFalse(User.objects.filter(username='kiro').exists())

    def test_wrong_login_shows_error_inside_dialog(self):
        response = self.client.post('/login/', {'usuario': 'nadie', 'password': 'mal'}, follow=True)
        self.assertContains(response, '<p class="form-error" role="alert">Usuario o contraseña incorrectos.</p>')

    def test_characters_show_the_four_guardians_and_orin(self):
        response = self.client.get('/personajes/')
        for text in ['Atlas', 'Aeris', 'Centinela Rex', 'NÉMESIS', 'Orin', 'atlas.webp', 'aeris.webp', 'orin.webp']:
            self.assertContains(response, text)
        for removed in ['Ala Cian', 'Ala Ámbar', 'explorador.webp']:
            self.assertNotContains(response, removed)
        self.check_resources(response)
        guide = self.client.get('/como-jugar/')
        self.assertContains(guide, 'Destello de Kiro')
        for anchor in ['id="tutorial"', 'id="valle"', 'id="instalaciones"']:
            self.assertContains(guide, anchor)

    def test_manifest_and_offline_worker(self):
        root = Path(settings.BASE_DIR) / 'game/static'
        manifest = json.loads((root / 'game/manifest.webmanifest').read_text())
        self.assertEqual(manifest['start_url'], '/')
        self.assertEqual(manifest['display'], 'standalone')
        for icon in manifest['icons']:
            self.assertTrue((root / icon['src'].removeprefix('/static/')).is_file())
        offline = self.client.get('/offline/')
        self.assertContains(offline, 'Mando Xbox')
        self.assertContains(offline, 'Salto y doble salto')
        self.check_resources(offline)
        worker = self.client.get('/service-worker.js')
        self.assertEqual(worker['Content-Type'], 'application/javascript')
        self.assertEqual(worker['Service-Worker-Allowed'], '/')
        self.assertContains(worker, 'primal-echo-v41')
        self.assertContains(worker, "request.method !== 'GET'")

    def test_entrance_webp_assets_exist(self):
        root = Path(settings.BASE_DIR) / 'game/static/game/img/entrada'
        assets = ['kael-caminar.webp', 'kael-gestos.webp', 'kael-correr-asustado.webp']
        assets += [f'explorador-correr-{i:02}.webp' for i in range(1, 9)]
        for name in assets:
            self.assertTrue((root / name).is_file())
