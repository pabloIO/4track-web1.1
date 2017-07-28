'use strict';
const mongoose = require('mongoose');
const userController = {
	/**
	 * POST usuario.
	 * @param  body-parser req: Parametros enviados por un formulario
	 * @param  express.res res: Respuesta de la ruta
	 * @param  {[type]} next) {	            	} [description]
	 * @return json: Objeto que verifica si los datos del usuario han sido creados
	 *               en la DB de forma exitosa
	 */
	nuevoUsuario: function(req, res, UsuarioModel, bcrypt){
	  if(!req.body) 
	  	return res.json({success: false, msg: 'Los datos no fueron enviados, intente nuevamente'});
	  bcrypt.hash(req.body.password, null, null, function(err, hashed){
	  	if(err) throw err;
	  	console.log(hashed);
	  	let password = hashed;
	  	let newUser = new UsuarioModel({
	  		nombre: req.body.nombre,
	  		apellido: req.body.apellido,
	  		correo: req.body.correo,
	  		password: password,
	  		ciudad_residencia: req.body.ciudad,
	  		pais: req.body.pais,
	  		telefono: {
	  			celular: req.body.celular,
	  			codigo_area: req.body.codigo_area_cel,
	  		}
		});
		newUser.save().then(function(doc){
			res.json({success: true, msg: 'Bienvenido'});
		}, function(err){
			console.log(err.message);
			res.json({success: false, msg: 'Hubo un error con el servidor'});
		});
	  });
	},	
	dispositivosUsuario: function(req, res, UsuarioModel){
		const _idUser = mongoose.Types.ObjectId(req.params._idUser);
		UsuarioModel.findById({_id: _idUser})
							.populate('_dispositivos')
							.then(function(user){
								let devices = [];
								for (var i = 0; i < user._dispositivos.length; i++) {
									devices.push({
										_idUser: user._dispositivos[i]._idUser,
										nombre: user._dispositivos[i].nombre,
										apellido: user._dispositivos[i].apellido,
										ciudad: user._dispositivos[i].ciudad_residencia,
										pais: user._dispositivos[i].pais,
										celular: user._dispositivos[i].telefono.celular,
										codigo_area_cel: user._dispositivos[i].telefono.codigo_area,
										deviceID: user._dispositivos[i].codigoFisico,
									});
								};
								res.json({
									success: true, 
									msg: 'Dispositivos, vamos a ganar puto',
									devices: devices
								});

		}, function(err){
			res.json({success: false, msg: 'Hubo un problema en el servidor'});
		});
	},
	getEstacion: function(req, res, EstacionModel){
		const _id = mongoose.Types.ObjectId(req.params.idStat);
		EstacionModel.findById({_id: _id}).then(function(estacion){
			if(!estacion || !estacion.activo) return res.json({success: false, msg: 'No existe el usuario'});
			return res.json({
				success: true,
				estacion: {
					nombre: estacion.nombre_estacion,
					coords: {
						latitude: estacion.coords.latitude,
						longitude: estacion.coords.longitude
					},
					ciudad: estacion.ciudad,
					usuario: estacion.nombre_usuario,
				}
			});
		}, function(err){
			return res.json({success: false, msg: 'Hubo un error en el servidor'});
		});
	},
	nuevoPolicia: function(req, res, PoliciaModel, bcrypt){
		if(!req.body) 
		  	return res.json({success: false, msg: 'Los datos no fueron enviados, intente nuevamente'});
		    bcrypt.hash(req.body.password, null, null, function(err, hashed){
		    	if(err) return res.json({success: false, msg: 'Hubo un error en el servidor'});
		    	let password = hashed;
		    	let newUser = new PoliciaModel({
		    		nombre: req.body.nombre,
		    		apellido: {
		    			apat: req.body.apellidos.apat,
		    			amat: req.body.apellidos.amat,
		    		},
		    		codigo: req.body.codigo,
		    		password: password,
		    		telefono: {
		    			celular: req.body.telefono.celular,
		    			codigo_area: req.body.telefono.codigo_area,
			    	},
			  	});
			  	newUser.save().then(function(doc){
			  		res.json({success: true, msg: 'Policía creado con éxito'});
			  	}, function(err){
			  		console.log(err.message);
			  		res.json({success: false, msg: 'Hubo un error con el servidor'});
			  	});
		  });
	},
	getPolicias: function(req, res, PoliciaModel){
		PoliciaModel.find({activo: true}).then(function(policias){
			let policiasActivos = [];
			for (var i = 0; i < policias.length; i++) {
				policiasActivos.push({
					_id: policias[i]._id,
					nombre: policias[i].nombre,
					apat: policias[i].apellido.apat,
					amat: policias[i].apellido.amat,
					codigo: policias[i].codigo,
					celular: policias[i].telefono.celular,
					codigo_area: policias[i].telefono.codigo_area,
				});
			};
			return res.json({success: true, policias: policiasActivos});
		}, function(err){
			return res.json({success: false, msg: 'Hubo un error en el servidor'});
		});
	},
};


module.exports = userController;