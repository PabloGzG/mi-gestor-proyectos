const express = require('express');
const app = express();

// 1. IMPORTAMOS LA BASE DE DATOS Y EL MODELO
const { sequelize, Proyecto } = require('./database');

app.use(express.json());
app.use(express.static('public'));

// 2. MODIFICAMOS LA RUTA GET PARA USAR LA BASE DE DATOS
app.get('/proyectos', async (req, res) => {
  // Buscamos todos los proyectos guardados en el archivo SQLite
  const listaProyectos = await Proyecto.findAll();
  res.json(listaProyectos);
});

// RUTA DE INICIO
app.get('/', (req, res) => {
  res.send('¡Servidor de Gestión de Proyectos activo!');
});

// LEER TODOS LOS PROYECTOS (GET)
app.get('/proyectos', (req, res) => {
  res.json(proyectos); 
});

// LEER UN PROYECTO ESPECÍFICO (GET con parámetro)
app.get('/proyectos/:id', (req, res) => {
  const idProyecto = Number(req.params.id); 
  const proyectoEncontrado = proyectos.find(p => p.id === idProyecto);

  if (!proyectoEncontrado) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }

  res.json(proyectoEncontrado);
});

// CREAR UN NUEVO PROYECTO (POST)
// MODIFICAMOS LA RUTA POST
app.post('/proyectos', async (req, res) => {
  // 1. Tomamos el nombre que envía el frontend en el body
  const { nombre } = req.body; 

  // 2. Insertamos el registro en la base de datos real
  // Sequelize le asignará un ID automático (1, 2, 3...) y el estado por defecto 'Pendiente'
  const nuevoProyecto = await Proyecto.create({ nombre });

  // 3. Respondemos con el objeto real creado por la base de datos
  res.status(201).json(nuevoProyecto);
});


// BORRAR UN PROYECTO (DELETE con parámetro)
// MODIFICAMOS LA RUTA DELETE
app.delete('/proyectos/:id', async (req, res) => {
  const idProyecto = Number(req.params.id);

  // Borra el proyecto donde el ID coincida
  await Proyecto.destroy({
    where: { id: idProyecto }
  });

  res.json({ mensaje: `Proyecto con ID ${idProyecto} eliminado de la Base de Datos` });
});

// MODIFICAMOS LA RUTA PUT
app.put('/proyectos/:id', async (req, res) => {
  const idProyecto = Number(req.params.id);
  
  // Buscamos el proyecto por su ID (Primary Key)
  const proyecto = await Proyecto.findByPk(idProyecto);

  if (!proyecto) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }

  // Actualizamos los campos con lo que venga en el body o dejamos lo que estaba
  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.estado = req.body.estado || proyecto.estado;

  // Guardamos los cambios físicamente en la base de datos
  await proyecto.save();

  res.json(proyecto);
});



// ENCENDER EL SERVIDOR
// Sincroniza las tablas antes de encender el servidor
// Definimos el puerto dinámico de internet O el 3000 por defecto si estamos en local
const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo de forma segura en el puerto ${PORT}`);
  });
});
