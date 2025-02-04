// Los modulos
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Config de la ip y del puerto
const hostname = '127.0.0.5';
const port = 8085;

// Funcion para el claculo del iban
function calcularIBAN(num) {
    const numeroCompleto = num + '142800'; 
    const resto = BigInt(numeroCompleto) % 97n; //BigInt para numeros garndes
    const codigoControl = (98n - resto).toString().padStart(2, '0'); // Calculo del control y el formateo de los dos digitos
    return `ES${codigoControl}${num}`; // formar el iban completo
}

// creacion del servidor http
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') {
        // Mensaje de bienvenida
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bienvenido al servidor de IBAN');

    } else if (pathname === '/iban') {
        const num = parsedUrl.query.num;

        if (num) {
            // Verificar que sean 20 digitos
            if (/^\d{20}$/.test(num)) {
                const iban = calcularIBAN(num);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`IBAN completo: ${iban}`);
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Error: Debe introducir un numero de 20 digitos.');  //Si no hay 20 digitos mostrar mensaje de error
            }
        } else {
            // archivo instrucciones_iban.html
            const filePath = path.join(__dirname, 'instrucciones_iban.html');
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error al cargar el archivo.');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
        }

    } else if (pathname === '/escribir') {
        const carpeta = path.join(__dirname, 'Copia');
        const archivo = path.join(carpeta, 'holaMundo.txt');
        const nombreCompleto = 'Juan Manuel'; // Sustituye esto por tu nombre

        // Crear la carpeta 'Copia' si no existe
        if (!fs.existsSync(carpeta)) {
            fs.mkdirSync(carpeta);
        }

        // Escribir el nombre completo solo si no esta en el archivo
        let contenidoExistente = '';
        if (fs.existsSync(archivo)) {
            contenidoExistente = fs.readFileSync(archivo, 'utf8');
        }

        if (!contenidoExistente.includes(nombreCompleto)) {
            fs.appendFileSync(archivo, `${nombreCompleto}\n`);
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Archivo creado o actualizado correctamente.');

    } else {
        // Respuesta para rutas no definidas
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada. Intente con /iban o /escribir.');
    }
});

// Iniciar el servidor
server.listen(port, hostname, () => {
    console.log(`Servidor en funcionamiento en http://${hostname}:${port}/`);
});
