from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.utils.http import url_has_allowed_host_and_scheme


def _volver(request):
    """Regresa a la página desde la que se envió el formulario (solo si es de este sitio)."""
    destino = request.META.get('HTTP_REFERER', '')
    if destino and url_has_allowed_host_and_scheme(destino, allowed_hosts={request.get_host()},
                                                   require_https=request.is_secure()):
        return redirect(destino)
    return redirect('/')


def _iniciar_sesion(request, user):
    login(request, user)
    # Se conservan por compatibilidad con plantillas o vistas antiguas.
    request.session["logueado"] = True
    request.session["usuario"] = user.username


def login_view(request):

    if request.method == "POST":

        usuario = request.POST.get("usuario", "").strip()
        password = request.POST.get("password", "")

        user = authenticate(request, username=usuario, password=password)

        if user is not None:
            _iniciar_sesion(request, user)
            return redirect("/inicio2/")

        # El error se muestra dentro del modal de inicio de sesión, que se vuelve a abrir solo.
        messages.error(request, "Usuario o contraseña incorrectos.", extra_tags="login")
        return _volver(request)

    return redirect("/")


def inicio(request):
    return render(request, 'game/inicio.html')


def inicio2(request):

    if not request.user.is_authenticated:
        return redirect("/")

    return render(request, 'game/inicio2.html', {'usuario': request.user.username})


def novedades(request):
    return render(request, 'game/novedades.html', {'usuario': request.user.username})


def personajes(request):
    return render(request, 'game/personajes.html', {'usuario': request.user.username})


def como_jugar(request):
    return render(request, 'game/como_jugar.html', {'usuario': request.user.username})


def contacto(request):

    if not request.user.is_authenticated:
        return redirect("/")

    return render(request, 'game/contacto.html', {'usuario': request.user.username})


def logout_view(request):
    logout(request)
    request.session.flush()
    return redirect("/")


def registro(request):

    if request.method != 'POST':
        return redirect('/')

    username = request.POST.get('username', '').strip()
    email = request.POST.get('email', '').strip()
    password1 = request.POST.get('password1', '')
    password2 = request.POST.get('password2', '')

    errores = []

    if not username:
        errores.append('Escribe un nombre de usuario.')
    elif User.objects.filter(username__iexact=username).exists():
        errores.append('Ese nombre de usuario ya está en uso.')

    try:
        validate_email(email)
        if User.objects.filter(email__iexact=email).exists():
            errores.append('Ese correo ya tiene una cuenta. Inicia sesión.')
    except ValidationError:
        errores.append('Escribe un correo electrónico válido.')

    if password1 != password2:
        errores.append('Las contraseñas no coinciden.')
    else:
        try:
            validate_password(password1, user=User(username=username, email=email))
        except ValidationError as error:
            errores.extend(error.messages)

    if errores:
        # Los errores se muestran dentro del modal de registro, que se vuelve a abrir solo.
        for texto in errores:
            messages.error(request, texto, extra_tags='registro')
        return _volver(request)

    usuario = User.objects.create_user(username=username, email=email, password=password1)
    _iniciar_sesion(request, usuario)
    messages.success(request, f'Bienvenido al viaje, {usuario.username}.')

    return redirect('/inicio2/')


# PÁGINA SIN CONEXIÓN
def offline(request):
    return render(request, 'game/offline.html')


# SERVICE WORKER
def service_worker(request):

    contenido = render_to_string('game/service-worker.js')

    response = HttpResponse(contenido, content_type='application/javascript')
    response['Service-Worker-Allowed'] = '/'

    return response
