const { Sequelize, DataTypes } = require('sequelize');

// 1. Inicializamos SQLite. Creará un archivo llamado 'datos.sqlite'
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './datos.sqlite',
  logging: false // Evita textos basura en la terminal
});

// 2. Definimos la estructura de nuestra tabla de Proyectos
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

// Exportamos las herramientas para usarlas en server.js
module.exports = { sequelize, Proyecto };
