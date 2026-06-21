document.addEventListener('DOMContentLoaded', () => {
  obtenerProyectos();
  configurarEscuchadoresTarjetas();
});

// 1. LEER PROYECTOS DESDE EL SERVIDOR (GET)
async function obtenerProyectos() {
  const respuesta = await fetch('/proyectos');
  const proyectos = await respuesta.json();
  
  const contenedor = document.getElementById('lista-proyectos');
  contenedor.innerHTML = ''; // Limpiamos el contenedor

  proyectos.forEach(proyecto => {
    // Evaluaciones de estado para estilos dinámicos de Tailwind
    const esCompletado = proyecto.estado === 'Completado';
    const claseTarjeta = esCompletado ? 'bg-white opacity-75 border-l-4 border-emerald-500' : 'bg-white border-l-4 border-amber-500';
    const claseBadge = esCompletado ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20';

    // Inyección del bloque HTML completo (Asegúrate de que las comillas invertidas envuelvan TODO el bloque)
    contenedor.innerHTML += `
      <div class="${claseTarjeta} p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <!-- Etiqueta de Estado -->
          <span class="inline-flex items-center rounded-md ${claseBadge} px-2 py-1 text-xs font-medium ring-1 ring-inset mb-3">
            ${proyecto.estado}
          </span>
          <h3 class="text-base font-semibold text-slate-900 mb-4">${proyecto.nombre}</h3>
        </div>
        
        <!-- Botones de Acción (Deben estar dentro de la tarjeta principal) -->
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

  await fetch('/proyectos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

    // ACCIÓN DE CAMBIAR ESTADO (PUT)
    if (e.target.classList.contains('btn-estado')) {
      const estadoActual = e.target.getAttribute('data-estado');
      const nuevoEstado = estadoActual === 'Pendiente' ? 'Completado' : 'Pendiente';

      await fetch(`/proyectos/${idStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      obtenerProyectos();
    }

    // ACCIÓN DE ELIMINAR (DELETE)
    if (e.target.classList.contains('btn-eliminar')) {
      await fetch(`/proyectos/${idStr}`, { method: 'DELETE' });
      obtenerProyectos();
    }
  });
}
