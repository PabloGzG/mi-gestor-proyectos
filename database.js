const { Sequelize, DataTypes } = require('sequelize');

// Inicializamos SQLite. Creará un archivo llamado 'datos.sqlite'
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './datos.sqlite',
  logging: false // Evita textos basura en la terminal
});

// NUEVO: Modelo de Usuario Proyecto
const Proyecto = sequelize.define('Proyecto', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false // Obligatorio poner un nombre
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'Pendiente' // Si no se aclara, empieza Pendiente
  }
});

// NUEVO: Modelo de Usuario
const Usuario = sequelize.define('Usuario', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // No permite dos usuarios con el mismo correo
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// NUEVO: Definimos la relación (Un Proyecto pertenece a un Usuario)
Proyecto.belongsTo(Usuario);

// Exportamos ambos modelos
module.exports = { sequelize, Proyecto, Usuario };
