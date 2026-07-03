// 1. IMPORTAR LIBRERÍAS DE SEGURIDAD (Pon esto arriba del todo en server.js)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, Proyecto, Usuario } = require('./database'); // Asegúrate de importar Usuario aquí


const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// CLAVE_SECRETA debe ser la misma que usaste en el login
const CLAVE_SECRETA = "mi_palabra_secreta_super_segura";

// MIDDLEWARE PROTECTOR
function verificarToken(req, res, next) {
    // 1. Capturamos el token que viene en el encabezado 'Authorization'
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    try {
        // 2. Verificamos si el token es real y no ha expirado
        const verificado = jwt.verify(token, CLAVE_SECRETA);
        req.usuario = verificado; // Guardamos los datos del usuario dentro de la petición
        next(); // ¡Todo bien! Permitimos pasar a la ruta real
    } catch (error) {
        res.status(403).json({ error: "Token inválido o expirado." });
    }
}


// 2. MODIFICAMOS LA RUTA GET PARA USAR LA BASE DE DATOS
//app.get('/proyectos', async (req, res) => {
    // Buscamos todos los proyectos guardados en el archivo SQLite
//    const listaProyectos = await Proyecto.findAll();
//    res.json(listaProyectos);
//});

// Ahora esta ruta está blindada por el middleware
app.get('/proyectos', verificarToken, async (req, res) => {
  const listaProyectos = await Proyecto.findAll();
  res.json(listaProyectos);
});


// RUTA DE INICIO
//app.get('/', (req, res) => {
//    res.send('¡Servidor de Gestión de Proyectos activo!');
//});

// LEER TODOS LOS PROYECTOS (GET)
//app.get('/proyectos', (req, res) => {
//    res.json(proyectos); 
//});

// LEER UN PROYECTO ESPECÍFICO (GET con parámetro)
//app.get('/proyectos/:id', (req, res) => {
//    const idProyecto = Number(req.params.id); 
//    const proyectoEncontrado = proyectos.find(p => p.id === idProyecto);
//
//    if (!proyectoEncontrado) {
//        return res.status(404).json({ error: "Proyecto no encontrado" });
//   }
//
//    res.json(proyectoEncontrado);
//});

// 1. LEER PROYECTOS FILTRADOS (GET)
app.get('/proyectos', verificarToken, async (req, res) => {
    // Extraemos el ID del usuario desde el token descifrado por el middleware
    const idDelUsuarioActual = req.usuario.usuarioId;

    // Buscamos ÚNICAMENTE los proyectos que le pertenecen a este usuario
    const listaProyectos = await Proyecto.findAll({
        where: { UsuarioId: idDelUsuarioActual }
    });
    
    res.json(listaProyectos);
});

// CREAR UN NUEVO PROYECTO (POST)
//app.post('/proyectos', verificarToken, async (req, res) => {
//    // 1. Tomamos el nombre que envía el frontend en el body
//    const { nombre } = req.body; 
//
    // 2. Insertamos el registro en la base de datos real
    // Sequelize le asignará un ID automático (1, 2, 3...) y el estado por defecto 'Pendiente'
//    const nuevoProyecto = await Proyecto.create({ nombre });

    // 3. Respondemos con el objeto real creado por la base de datos
//   res.status(201).json(nuevoProyecto);
//});

// 2. CREAR PROYECTO PRIVADO (POST)
app.post('/proyectos', verificarToken, async (req, res) => {
  const { nombre } = req.body;
  const idDelUsuarioActual = req.usuario.usuarioId;

  // Creamos el proyecto asociándolo automáticamente con el usuario actual
  const nuevoProyecto = await Proyecto.create({
    nombre,
    UsuarioId: idDelUsuarioActual
  });

  res.status(201).json(nuevoProyecto);
});


// BORRAR UN PROYECTO (DELETE con parámetro)
// MODIFICAMOS LA RUTA DELETE
//app.delete('/proyectos/:id', verificarToken, async (req, res) => {
//    const idProyecto = Number(req.params.id);

    // Borra el proyecto donde el ID coincida
//    await Proyecto.destroy({
//        where: { id: idProyecto }
//    });

//    res.json({ mensaje: `Proyecto con ID ${idProyecto} eliminado de la Base de Datos` });
//});

// BORRAR PROYECTO PRIVADO (DELETE)
app.delete('/proyectos/:id', verificarToken, async (req, res) => {
    const idProyecto = Number(req.params.id);
    const idDelUsuarioActual = req.usuario.usuarioId; // ID extraído del token

    // Borra el proyecto SOLO si coincide el ID del proyecto Y le pertenece al usuario actual
    const filasBorradas = await Proyecto.destroy({
        where: { 
        id: idProyecto,
        UsuarioId: idDelUsuarioActual
        }
    });

    if (filasBorradas === 0) {
        return res.status(403).json({ error: "No tienes permiso para eliminar este proyecto o no existe." });
    }

    res.json({ mensaje: "Proyecto eliminado con éxito" });
});

// MODIFICAMOS LA RUTA PUT
//app.put('/proyectos/:id', verificarToken, async (req, res) => {
//    const idProyecto = Number(req.params.id);
    
    // Buscamos el proyecto por su ID (Primary Key)
//    const proyecto = await Proyecto.findByPk(idProyecto);

//    if (!proyecto) {
//        return res.status(404).json({ error: "Proyecto no encontrado" });
//    }

    // Actualizamos los campos con lo que venga en el body o dejamos lo que estaba
//    proyecto.nombre = req.body.nombre || proyecto.nombre;
//    proyecto.estado = req.body.estado || proyecto.estado;

    // Guardamos los cambios físicamente en la base de datos
//    await proyecto.save();

//    res.json(proyecto);
//});

// ACTUALIZAR PROYECTO PRIVADO (PUT)
app.put('/proyectos/:id', verificarToken, async (req, res) => {
  const idProyecto = Number(req.params.id);
  const idDelUsuarioActual = req.usuario.usuarioId;

  // Buscamos el proyecto que coincida con el ID Y con el usuario dueño
  const proyecto = await Proyecto.findOne({
    where: {
      id: idProyecto,
      UsuarioId: idDelUsuarioActual
    }
  });

  if (!proyecto) {
    return res.status(403).json({ error: "No tienes permiso para editar este proyecto o no existe." });
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.estado = req.body.estado || proyecto.estado;
  await proyecto.save();

  res.json(proyecto);
});

// RUTA DE REGISTRO
app.post('/registro', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Encriptamos la contraseña con un factor de seguridad de 10 (estándar de la industria)
        const passwordEncriptada = await bcrypt.hash(password, 10);

        // Guardamos el usuario en la base de datos real
        const nuevoUsuario = await Usuario.create({
        email,
        password: passwordEncriptada
        });

        res.status(201).json({ mensaje: "Usuario registrado con éxito", usuarioId: nuevoUsuario.id });
    } catch (error) {
        // Si el email ya existe, Sequelize arrojará un error de validación
        res.status(400).json({ error: "El correo electrónico ya está registrado" });
    }
});

// CLAVE SECRETA: Se usa para firmar los tokens (en producción va en una variable de entorno)
//const CLAVE_SECRETA = "mi_palabra_secreta_super_segura";

// RUTA DE LOGIN
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscamos al usuario por su correo
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ error: "Credenciales incorrectas" });
    }

    // 2. Comparamos la contraseña ingresada con la encriptada en la BD
    const passwordCorrecto = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecto) {
      return res.status(400).json({ error: "Credenciales incorrectas" });
    }

    // 3. Si todo es correcto, generamos el Token JWT (expira en 2 horas)
    const token = jwt.sign({ usuarioId: usuario.id }, CLAVE_SECRETA, { expiresIn: '1h' });

    // 4. Respondemos con el Token de acceso
    res.json({ mensaje: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ error: "Hubo un error en el servidor" });
  }
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
