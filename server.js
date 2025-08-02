const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Crea un servidor HTTP para servir archivos estáticos
const server = http.createServer((req, res) => {
    // Determina la ruta del archivo a servir.
    // Usamos path.join para evitar problemas con barras invertidas o dobles.
    let filePath = path.join(__dirname, req.url);

    // Maneja la ruta raíz y la ruta de control
    if (req.url === '/') {
        filePath = path.join(__dirname, 'index.html');
    } else if (req.url === '/control') {
        filePath = path.join(__dirname, 'control.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Lee el archivo del disco y lo sirve
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // El archivo no existe, envía un 404
                res.writeHead(404);
                res.end('404: Archivo no encontrado');
            } else {
                // Otro tipo de error, envía un 500
                res.writeHead(500);
                res.end('500: Error del servidor: ' + error.code);
            }
        } else {
            // El archivo se encontró, sirve el contenido
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Crea el servidor de WebSockets
const wss = new WebSocket.Server({ server });

// Aquí se guarda la conexión del cliente de control y del cliente de la pantalla principal
let pantallaCliente = null;
let controlCliente = null;

wss.on('connection', ws => {
    console.log('Cliente conectado');

    // Manejar la identificación de los clientes (pantalla vs control)
    ws.on('message', message => {
        const data = JSON.parse(message);

        if (data.type === 'IDENTIFY') {
            if (data.role === 'pantalla' && !pantallaCliente) {
                pantallaCliente = ws;
                console.log('Pantalla principal conectada.');
                ws.send(JSON.stringify({ type: 'STATUS', message: 'Conectado como pantalla.' }));
            } else if (data.role === 'control' && !controlCliente) {
                controlCliente = ws;
                console.log('Control remoto conectado.');
                ws.send(JSON.stringify({ type: 'STATUS', message: 'Conectado como control.' }));
            }
        } else {
            // Reenviar mensajes del control a la pantalla
            if (ws === controlCliente && pantallaCliente && pantallaCliente.readyState === WebSocket.OPEN) {
                pantallaCliente.send(message);
                console.log('Mensaje reenviado a la pantalla:', data);
            }
        }
    });

    ws.on('close', () => {
        if (ws === pantallaCliente) {
            pantallaCliente = null;
            console.log('Pantalla principal desconectada.');
        }
        if (ws === controlCliente) {
            controlCliente = null;
            console.log('Control remoto desconectado.');
        }
        console.log('Cliente desconectado.');
    });

    ws.on('error', error => {
        console.error('Error en el WebSocket:', error);
    });
});

// Inicia el servidor en el puerto 8080
server.listen(8080, () => {
    console.log('Servidor en funcionamiento en http://localhost:8080');
});