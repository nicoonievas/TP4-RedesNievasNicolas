// db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();


// URL de conexión a MongoDB Atlas

const uri = process.env.MONGODB_URI;
let db;

const connectDB = async () => {
  if (db) return db; // Retorna la conexión existente si ya está abierta

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Conectado a la base de datos MongoDB');
    db = client.db('miBaseDeDatosLocal'); // Reemplaza con el nombre de tu base de datos
    return db;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1); // Salir del proceso si falla la conexión
  }
};

module.exports = connectDB;
