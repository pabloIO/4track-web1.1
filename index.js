'use strict';
/**
 * Modulos de NodeJS:
 * - express
 * - helmet
 * - body-parser
 * - morgan
 * - fs
 * - connect-multiparty
 * - nodemailer
 * - underscore
 * - bcrypt
 * - path
 * - mongoose
 * - socket.io
 */
const express = require('express');
const app = express();
const helmet = require('helmet'); // Seguridad
app.use(helmet()); // Usando el middleware Helmet para seguridad , que bloquea Headers HTTP
const bodyParser = require('body-parser'); // Permite manejar los requests en formato json
const morgan = require('morgan'); // Permite loggear la actividad del servidor en la consola
const fs = require('fs'); // Realizar operaciones con el filesystem
const multiparty = require('connect-multiparty'); // Permite subir archivos
const nodemailer = require('nodemailer'); // Mandar correos electronicos
const _ = require('underscore');
const bcrypt = require('bcrypt-nodejs'); // Permite generar hashes para las contraseñas 
const path = require('path'); // Funciones de rutas absolutas
const mongoose = require('mongoose'); // ODM de MongoDB
const moment = require('moment-timezone');
mongoose.Promise = global.Promise; // Utilizando el sistema de promesas para mongoose

app.use('/bower_components', express.static(path.join(__dirname, 'public/bower_components')));
app.use('/app', express.static(path.join(__dirname, 'public/app')));

// Loggear los requests de la aplicacion en un archivo
const accessLogStream = fs.createWriteStream(path.join(__dirname, '/logs/access.log'), {flags: 'a'});
app.use(morgan('dev', {stream: accessLogStream})); // Loggea en la consola la actividad de la aplicacion, para debbuging y requests
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); // Habilitar requests de tipo JSON

/**
 * 
 */
mongoose.connect('mongodb://localhost:27017/4track', function(err){
	if(err) throw err;
	else console.log('Conectado a MongoDB');
});
/**
 * Importando modelos
 */
const UsuarioModel = require('./models/usuario-model');
const DispositivoModel = require('./models/dispositivo-model'); 
const DispositivoActivoModel = require('./models/dispositivos-activos-model');
const EstacionModel = require('./models/estacion-model');
const PoliciaModel = require('./models/policia-model');
/**
 * Importando rutas
 */
const usuario = require('./routes/usuario');
const login = require('./routes/login');
const dispositivo = require('./routes/dispositivo');
//const tracking = require('./routes/track');


const server = app.listen(8080);
let io = require('socket.io')(server);
const nsps = ['/device-tracking'];

io.on('connection', function(socket){
	socket.on('track', function(coords){
		console.log(coords);
		io.emit('tracking', coords);
	});
	// Creando room para que el usuario pueda
	// recibir notificaciones de los dispositivos asociados
	socket.on('mRoom', function(creds){
		console.log('Suscribiendo a room: ' + creds.id);
		socket.join(creds.id);
	});
	socket.on('start-alert', function(creds){
		console.log('Suscribiendo a room de estacion: ' + creds.idDevice);
		socket.join(creds.idDevice);
	});
	socket.on('station-room', function(creds){
		socket.join(creds.idDevice);
		//io.emit('station-room', {idDisp: creds._id});
	});
	socket.on('police-room', function(creds){
		socket.join(creds.idPoli);
	});
	socket.on('police-notify', function(device){
		io.to().emit()
	});
	/*
	----------------
	 */
	socket.on('stop:tracking', function(state){
		console.log(state);
		io.emit('stop:tracking', state);
	});
	socket.on('start:tracking', function(state){
		io.emit('start:tracking', state);
	});
	socket.on('initMarker', function(state){
		console.log(state);
		socket.emit('initMarker', state);
	});
	socket.on('disconnect', function(){
		console.log('user discon');
	});
});
let nspDevice = io.of(nsps[0], function(socket){
	let room;
	socket.on('enter', function(creds){
		// Validar token en la DB
		room = creds.room;
		socket.join(creds.room);	
		//io.to(room).emit('track-data', 'Estas en el cuarto: ');
	});
	socket.on('track-room', function(data){
		//console.log(io.of('/device-tracking').clients(room));
		socket.broadcast.to(room).emit('track-res', {'msg': data});
	});
});
/**
 * Definiendo rutas publicas
 * @type {[type]}
 */
const publicApiRoutes = express.Router();

publicApiRoutes.post('/register', function(req, res, next){
	bcrypt.hash(req.body.password, null, null, function(err, hashed){
		let newReg = new EstacionModel({
			nombre_estacion: req.body.nombre,
			coords: {
				latitude: req.body.latitud,
				longitude: req.body.longitud
			},
			ciudad: req.body.ciudad,
			nombre_usuario: req.body.nombreUsuario,
			password: hashed
		});
		newReg.save();
		res.json({success: true, msg: 'USUARIO creado'});
	});
});
publicApiRoutes.post('/login', function(req, res, next){
	login.iniciarSesionUser(req, res, UsuarioModel, bcrypt);
});
publicApiRoutes.post('/login-estacion', function(req, res, next){
	login.iniciarSesionEstacion(req, res, EstacionModel, bcrypt);
});
publicApiRoutes.post('/usuario', function(req, res, next){
	usuario.nuevoUsuario(req, res, UsuarioModel, bcrypt);	
});
publicApiRoutes.post('/policia', function(req, res, next){
	usuario.nuevoPolicia(req, res, PoliciaModel, bcrypt);	
});
publicApiRoutes.get('/policias', function(req, res, next){
	usuario.getPolicias(req, res, PoliciaModel);	
});
publicApiRoutes.get('/estacion/:idStat', function(req, res, next){
	usuario.getEstacion(req, res, EstacionModel);	
});
publicApiRoutes.get('/usuario/dispositivos/:_idUser', function(req, res, next){
	usuario.dispositivosUsuario(req, res, UsuarioModel);	
});
publicApiRoutes.post('/dispositivo', function(req, res, next){
	dispositivo.nuevoDispositivo(req, res, UsuarioModel, DispositivoModel, DispositivoActivoModel);
});	
publicApiRoutes.get('/borrar-dispositivo/:idDisp', function(req, res, next){
	dispositivo.deleteDispositivo(req, res, DispositivoModel);
});	
publicApiRoutes.post('/dispositivo/coords', function(req, res, next){
	dispositivo.coordsGpsDispositivo(req, res, DispositivoModel, moment, io);
});
publicApiRoutes.post('/dispositivo/police/sync', function(req, res, next){
	dispositivo.syncCoordsPolice(req, res, DispositivoModel);
});
publicApiRoutes.post('/coords-test', function(req, res, next){
	console.log(req.body);
});
publicApiRoutes.get('/track-device/:id', function(req, res, next){
	dispositivo.joinTrackingRoom(req, res, io, UsuarioModel, DispositivoModel);
});

app.use('/api/v1', publicApiRoutes); 

app.all('/*', function(req, res, next){
	// Mostrando el documento index.html, en cualquier url dada
    res.sendFile(path.join(__dirname, 'public/app/index.html'));
});
