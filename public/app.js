let modoAuth = 'login'; // Puede ser 'login' o 'registro'

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verificamos si el usuario ya tenía un token guardado previamente
  const tokenGuardado = localStorage.getItem('token_sesion');
  
  if (tokenGuardado) {
    mostrarPanelProyectos();
  } else {
    configurarFormularioAuth();
  }
});

// Función para alternar las pantallas visuales
function mostrarPanelProyectos() {
  document.getElementById('seccion-auth').classList.add('hidden');
  document.getElementById('seccion-proyectos').classList.remove('hidden');
  obtenerProyectos(); // Trae las tareas de la base de datos
  configurarEscuchadoresTarjetas(); // Activamos los botones de las tarjetas

   // NUEVO: Escuchador para cerrar sesión
  document.getElementById('btn-logout').addEventListener('click', () => {
        // 1. Borramos el token del navegador
        localStorage.removeItem('token_sesion');
        // 2. Recargamos la página instantáneamente
        location.reload();
  });
}

function configurarFormularioAuth() {
  const formAuth = document.getElementById('formulario-auth');
  const btnCambiar = document.getElementById('btn-cambiar-modo');
  const tituloAuth = document.getElementById('auth-titulo');
  const btnPrincipal = document.getElementById('btn-auth-principal');

  // Lógica para alternar entre modo Login y modo Registro en la pantalla
  btnCambiar.addEventListener('click', () => {
    modoAuth = modoAuth === 'login' ? 'registro' : 'login';
    tituloAuth.innerText = modoAuth === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta';
    btnPrincipal.innerText = modoAuth === 'login' ? 'Ingresar' : 'Registrarse';
    btnCambiar.innerText = modoAuth === 'login' ? 'Regístrate aquí' : 'Inicia sesión aquí';
  });

  // Envío del formulario al backend
  formAuth.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    // Decidimos a qué ruta apuntar dinámicamente según el modo
    const ruta = modoAuth === 'login' ? '/login' : '/registro';

    const respuesta = await fetch(ruta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.error || 'Ocurrió un error');
      return;
    }

    if (modoAuth === 'login') {
      // Guardamos el token digital en el navegador
      localStorage.setItem('token_sesion', datos.token);
      mostrarPanelProyectos();
    } else {
      alert('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
      btnCambiar.click(); // Regresa automáticamente al modo login
    }
  });
}


// 1. LEER PROYECTOS DESDE EL SERVIDOR (GET)
async function obtenerProyectos() {
  // 1. Extraemos el token del almacenamiento del navegador
  const token = localStorage.getItem('token_sesion');

  // 2. Pasamos el token en los headers de la petición
  const respuesta = await fetch('/proyectos', {
    method: 'GET',
    headers: {
      'Authorization': token // Enviamos nuestro pase digital
    }
  });

  // Si el servidor nos rebota (token vencido o borrado), lo mandamos al login
  if (respuesta.status === 401 || respuesta.status === 403) {
    localStorage.removeItem('token_sesion');
    location.reload(); // Recarga la página para bloquear la pantalla
    return;
  }

  const proyectos = await respuesta.json();
  
  // (Conserva abajo tu bucle proyectos.forEach que pinta las tarjetas en pantalla...)
  const contenedor = document.getElementById('lista-proyectos');
  contenedor.innerHTML = '';
  proyectos.forEach(proyecto => {
    const esCompletado = proyecto.estado === 'Completado';
    const claseTarjeta = esCompletado ? 'bg-white opacity-75 border-l-4 border-emerald-500' : 'bg-white border-l-4 border-amber-500';
    const claseBadge = esCompletado ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20';

    contenedor.innerHTML += `
      <div class="tarjeta-proyecto ${claseTarjeta} p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <span class="inline-flex items-center rounded-md ${claseBadge} px-2 py-1 text-xs font-medium ring-1 ring-inset mb-3">
            ${proyecto.estado}
          </span>
          <h3 class="text-base font-semibold text-slate-900 mb-4">${proyecto.nombre}</h3>
        </div>
        <div class="flex gap-4 border-t border-slate-100 pt-3 mt-2 justify-end text-xs">
          <button class="btn-estado font-medium text-indigo-600 hover:text-indigo-800 transition-colors" data-id="${proyecto.id}" data-estado="${proyecto.estado}">
            ${esCompletado ? '↩️ Pendiente' : '✅ Completar'}
          </button>
          <button class="btn-eliminar font-medium text-rose-600 hover:text-rose-800 transition-colors" data-id="${proyecto.id}">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
  });
}


// 2. CREAR UN NUEVO PROYECTO (POST)
document.getElementById('formulario-proyecto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombreInput = document.getElementById('nombre-input').value;
  const token = localStorage.getItem('token_sesion'); // Extraemos el token

  await fetch('/proyectos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': token // Enviamos el token para poder crear
    },
    body: JSON.stringify({ nombre: nombreInput })
  });

  document.getElementById('nombre-input').value = '';
  obtenerProyectos();
});

// 3. ACTUALIZAR (PUT) Y BORRAR (DELETE) MEDIANTE DELEGACIÓN DE EVENTOS
function configurarEscuchadoresTarjetas() {
  const contenedor = document.getElementById('lista-proyectos');
  
  contenedor.addEventListener('click', async (e) => {
    const idStr = e.target.getAttribute('data-id');
    if (!idStr) return; // Si no hay ID en el elemento clicado, ignorar

     const token = localStorage.getItem('token_sesion'); // Extraemos el token para las acciones

    // ACCIÓN DE CAMBIAR ESTADO (PUT)
    if (e.target.classList.contains('btn-estado')) {
      const estadoActual = e.target.getAttribute('data-estado');
      const nuevoEstado = estadoActual === 'Pendiente' ? 'Completado' : 'Pendiente';

      await fetch(`/proyectos/${idStr}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': token // Enviamos el token para poder editar
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      obtenerProyectos();
    }

    // ACCIÓN DE ELIMINAR (DELETE)
    if (e.target.classList.contains('btn-eliminar')) {
      await fetch(`/proyectos/${idStr}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token // Enviamos el token para poder borrar
            }
      });
      obtenerProyectos();
    }
  });
}
