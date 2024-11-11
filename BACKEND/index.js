const axios = require('axios');
const express = require('express');
const connectDB = require('./db');
const cors = require('cors'); // Importa cors
const { MongoClient, ObjectId } = require('mongodb');

const fs = require('fs');
const { info } = require('console');
const path = require('path');
const PDFDocument = require('pdfkit');
const markdownIt = require('markdown-it');
const pdfkitMarkdown = require('pdfkit-markdown');

// Instancia de markdown-it
const md = new markdownIt();



const app = express();

app.use(cors()); // Esto permitirá solicitudes desde cualquier origen

app.use(express.json());


app.post('/api/informes', async (req, res) => {
    const { usuario, alumno, area, instituto, caracteristica1, caracteristica2, caracteristica3, caracteristica4, caracteristica5 } = req.body;
    console.log("Datos ingresados desde front:", req.body);

    try {
        const db = await connectDB();

        // Buscar detalles del alumno
        const alumnoCollection = db.collection('alumnos');
        const alumnoData = await alumnoCollection.findOne({ _id: new ObjectId(alumno) });

        if (!alumnoData) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        console.log("AlumnoData", alumnoData);

        // Crear el prompt con detalles del alumno
        const promptText = `
Genera un informe detallado de hasta 1500 caracteres para el alumno ${alumnoData.firstname} ${alumnoData.lastname} del grado ${alumnoData.grado} en el instituto ${alumnoData.instituto}, en el área de ${area}.

Estructura del informe colocando titulos de cada característica:
1. **Responsabilidad**: Describe el nivel de responsabilidad del alumno, proporcionando ejemplos específicos de cómo esta característica se manifiesta en su trabajo y conducta.
2. **Trabajo grupal**: Explica cómo el alumno interactúa en actividades grupales, incluyendo su habilidad para colaborar y comunicarse con sus compañeros.
3. **Capacidad Resolutiva**: Detalla la capacidad del alumno para resolver problemas y enfrentar desafíos, dando ejemplos de situaciones donde esta habilidad es evidente.
4. **Creatividad**: Comenta sobre la creatividad del alumno, mencionando cómo contribuye con ideas innovadoras y su enfoque en las tareas.
5. **Liderazgo**: Describe el liderazgo del alumno, indicando si asume roles de liderazgo y cómo apoya a sus compañeros en actividades grupales.
**Conclusión**: Resume el desempeño general del alumno en el área evaluada, destacando fortalezas principales y aspectos en los que podría seguir mejorando para alcanzar su máximo potencial.
con las características: Responsabilidad: ${caracteristica1}, Trabajo grupal: ${caracteristica2}, Capacidad Resolutiva: ${caracteristica3}, Creatividad: ${caracteristica4}, Liderazgo: ${caracteristica5}.`;

        // API de Gemini
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
            {
                contents: [
                    {
                        parts: [
                            { text: promptText }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    key: 'AIzaSyC11SKeekuqaBF25y-A8ZTw7jbIaOeucD4'
                }
            }
        );

        const informeGenerado = response.data;
        const informeTexto = informeGenerado.candidates[0].content.parts[0].text;
        console.log(informeTexto);

        // Preparar el nuevo informe con todos los datos
        const nuevoInforme = {
            usuario,
            alumno: alumnoData,
            area,
            instituto,
            caracteristica1,
            caracteristica2,
            caracteristica3,
            caracteristica4,
            caracteristica5,
            informeTexto
        };

        // Guardar en la base de datos
        const informesCollection = db.collection('informes');
        const result = await informesCollection.insertOne(nuevoInforme);

        console.log('Documento insertado con ID:', result.insertedId);
        res.status(201).json({ message: 'Documento insertado', insertedId: result.insertedId, informeTexto });
    } catch (error) {
        console.error('Error al almacenar los datos o generar el informe:', error);
        res.status(500).json({ error: 'Error al almacenar los datos o generar el informe' });
    }
});


const generarInformePDF = (informeData, outputPath) => {
    return new Promise((resolve, reject) => {
        const { alumno, lastname, grado, area, informeTexto } = informeData;

        // Crear el documento PDF
        const pdfDoc = new PDFDocument();

        // Escribir en el archivo
        const writeStream = fs.createWriteStream(outputPath);
        pdfDoc.pipe(writeStream);

        // Crear contenido en Markdown
        const informeMarkdown = `
**Fecha:** ${new Date().toLocaleDateString()}  
${informeTexto}
        `;

        // Agregar título
        pdfDoc.fontSize(20).text('Informe del Alumno', { align: 'center' });
        pdfDoc.moveDown();

        // Renderizar el contenido Markdown y escribirlo en el PDF
        const lines = informeMarkdown.split('\n');
        lines.forEach(line => {
            if (line.startsWith('## ')) {
                pdfDoc.fontSize(16).text(line.replace('## ', ''), { underline: true });
            } else if (line.startsWith('**')) {
                const text = line.replace(/\*\*(.*)\*\*/, '$1'); // Extraer texto entre **
                pdfDoc.fontSize(12).text(text, { bold: true });
            } else {
                pdfDoc.fontSize(12).text(line);
            }
            pdfDoc.moveDown(0.5);
        });

        // Finalizar el documento PDF
        pdfDoc.end();

        // Resolver la promesa cuando se termine de escribir en el archivo
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
};

app.post('/api/alumno', async (req, res) => {
    const { usuario, firstname, lastname, grado, instituto } = req.body;
    try {
        const db = await connectDB();
        const collection = db.collection('alumnos');
        const result = await collection.insertOne({ usuario, firstname, lastname, grado, instituto });
        console.log('Alumno insertado con ID:', result.insertedId);
        res.status(201).json({ message: 'Alumno insertado', insertedId: result.insertedId });
    } catch (error) {
        console.error('Error al almacenar los datos:', error);
        res.status(500).json({ error: 'Error al almacenar los datos' });
    }
});



app.put('/api/informe/:informeId', async (req, res) => {
    const { informeId } = req.params;
    const { informeTexto } = req.body;

    try {
        const db = await connectDB();
        const collection = db.collection('informes');
        const result = await collection.updateOne(
            { _id: new ObjectId(informeId) },
            { $set: { informeTexto } }
        );
        res.status(200).json({ message: 'Informe actualizado', updatedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error al actualizar el informe:', error);
        res.status(500).json({ error: 'Error al actualizar el informe' });
    }
})

app.delete('/api/informe/:informeId', async (req, res) => {
    const { informeId } = req.params;
    try {
        const db = await connectDB();
        const collection = db.collection('informes');
        const result = await collection.deleteOne({ _id: new ObjectId(informeId) });
        res.status(200).json({ message: 'Informe eliminado', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error al eliminar el informe:', error);
        res.status(500).json({ error: 'Error al eliminar el informe' });
    }
})

app.put('/api/alumno/:alumnoId', async (req, res) => {
    const { alumnoId } = req.params;
    const { firstname, lastname, grado, instituto } = req.body;

    try {
        const db = await connectDB();
        const collection = db.collection('alumnos');
        const result = await collection.updateOne(
            { _id: new ObjectId(alumnoId) },
            { $set: { firstname, lastname, grado, instituto } }
        );
        res.status(200).json({ message: 'Alumno actualizado', updatedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error al actualizar el alumno:', error);
        res.status(500).json({ error: 'Error al actualizar el alumno' });
    }
})

app.delete('/api/alumno/:alumnoId', async (req, res) => {
    const { alumnoId } = req.params;
    try {
        const db = await connectDB();
        const collection = db.collection('alumnos');
        const result = await collection.deleteOne({ _id: new ObjectId(alumnoId) });
        res.status(200).json({ message: 'Alumno eliminado', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error al eliminar el alumno:', error);
        res.status(500).json({ error: 'Error al eliminar el alumno' });
    }
})

app.get('/api/informePDF/:informeId', async (req, res) => {
    const { informeId } = req.params;
    const { apellido, año, area } = req.query;

    try {
        const db = await connectDB();
        const collection = db.collection('informes');
        const informe = await collection.findOne({ _id: new ObjectId(informeId) });

        if (!informe) {
            return res.status(404).json({ error: 'Informe no encontrado' });
        }

        // Construir el nombre del archivo PDF con los datos adicionales
        const fileName = `Informe_${apellido}_${año}_${area}.pdf`;
        const outputPath = path.join(__dirname, fileName);

        // Generar el PDF y esperar a que esté listo
        await generarInformePDF(informe, outputPath);

        res.download(outputPath, fileName, (err) => {
            if (err) {
                console.error('Error al enviar el PDF:', err);
                res.status(500).send('Error al enviar el PDF');
            }
            fs.unlink(outputPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error al eliminar el archivo PDF:', unlinkErr);
            });
        });
    } catch (error) {
        console.error('Error al obtener el informe:', error);
        res.status(500).json({ error: 'Error al obtener el informe' });
    }
});



app.get('/api/alumnos', async (req, res) => {
    const { email, page = 1, perPage = 10 } = req.query; // Extrae `email`, `page`, y `perPage`

    try {
        const db = await connectDB();
        const collection = db.collection('alumnos');

        // Construir el filtro para la consulta, si `email` está presente
        const query = email ? { usuario: email } : {}; // Filtrar por el campo `instituto`, que se asume que es el email del usuario

        // Obtener los alumnos con el filtro por email
        const alumnos = await collection
            .find(query) // Filtro de email
            .skip((page - 1) * perPage) // Paginación
            .limit(parseInt(perPage)) // Límite de elementos por página
            .toArray();

        res.json(alumnos);
    } catch (error) {
        console.error('Error al obtener los alumnos:', error);
        res.status(500).json({ error: 'Error al obtener los alumnos' });
    }
});


app.get('/api/informes', async (req, res) => {
    const { email, page = 1, perPage = 10 } = req.query; // Extrae `email`, `page` y `perPage` desde los query params

    try {
        const db = await connectDB();
        const collection = db.collection('informes');

        // Construir el filtro para la consulta, si `email` está presente
        const query = email ? { usuario: email } : {}; // Si el email está presente, se filtra por usuario

        // Obtener los informes con el filtro por email
        const informes = await collection
            .find(query) // Filtro de email
            .skip((page - 1) * perPage) // Paginación
            .limit(parseInt(perPage)) // Límite de elementos por página
            .toArray();

        res.json(informes);
    } catch (error) {
        console.error('Error al obtener los informes:', error);
        res.status(500).json({ error: 'Error al obtener los informes' });
    }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
