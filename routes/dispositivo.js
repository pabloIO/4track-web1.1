'use strict';
const mongoose = require('mongoose');
let dispositivosController = {
	/**
	 * [nuevoDispositivo] Funcion para asociar un dispositivo con un usuario
	 * @param  {request} req: Peticion del lado del cliente con los datos
	 *                        dispositivo y el _id de usuario
	 * @param  {response} res: Respuesta del servidor
	 * @param  {MongooseModel} usuarioModel: Modelo para controlar Usuarios
	 * @param  {MongooseModel} dispositivoModel: Modelo para controlar Dispositivos
	 * @return {res}: Respuesta en formato JSON
	 */
	nuevoDispositivo: function(req, res, UsuarioModel, DispositivoModel, DispositivoActivoModel){
		const _idUser = mongoose.Types.ObjectId(req.body._idUser);
		try{
			UsuarioModel.findById({_id: _idUser}).then(function(user){
				if(!user || !user.activo) return res.json({success: false, msg: 'El usuario no existe'});
				DispositivoActivoModel.findOne({codigo: req.body.deviceID})
									.then(function(disp){
										if(!disp) return res.json({success: false, msg: 'Código inexistente'});
										if(disp.activo) return res.json({success: false, msg: 'Código inválido'});
										let codigoDisp = disp.codigo;
										disp.activo = true;
										disp.save().then(function(){
											let dispositivo = {
												nombre: req.body.nombre,
												apellido: req.body.apellido,
												ciudad_residencia: req.body.ciudad,
												pais: req.body.pais,
												telefono: {
													celular: req.body.celular,
													codigo_area: req.body.codigo_area_cel,
												},
												codigoFisico: req.body.deviceID,
												_idUser: _idUser,
											}; 
											let nuevoDisp = new DispositivoModel(dispositivo);
											nuevoDisp.save().then(function(dev){
												UsuarioModel.update(
													{ _id: user._id},
													{ $push: {_dispositivos: dev }}
												).then(function(updatedUser){
													return res.json({success: true, msg: 'El dispositivo fue guardado con éxito'});
												}, function(err){
													return res.json({success: false, msg: 'El usuario no fue actualizado'});
												});
											}, function(err){
												console.log(err);
												return res.json({success: false, msg: 'El dispositivo no fue guardado'});
											});
										}, function(err){
											return res.json({success: false, msg: 'Hubo un error en el servidor'});
										});
									}, function(err){
										return res.json({success: false, msg: 'Hubo un error en el servidor'});
									});
			}, function(err){
				return res.json({success: false, msg: 'Hubo un error en el servidor, revise su conexión a internet'});
			});	
		}catch(err){
			res.json({success: false, msg: err});
		}
	},
	editDispositivo: function(req, res, DispositivoModel){

	},
	deleteDispositivo: function(req, res, DispositivoModel){
		let _idDisp = mongoose.Types.ObjectId(req.params.idDisp);
		DispositivoModel.findById({_id: _idDisp}).then(function(disp){
			if(!disp || !disp.activo) return res.json({success: false, msg: 'Dispositivo inválido'});
			disp.activo = false;
			disp.save().then(function(updated){
				res.json({success: true, msg: 'Dispositivo borrado con éxito'});
			}, function(err){
				res.json({success: false, msg: 'Error al borrar dispositivo'});
			});
		}, function(err){
			res.json({success: false, msg: 'Hubo un error en el servidor'});
		});
	},
	coordsGpsDispositivo: function(req, res, DispositivoModel, moment, io){	
		const _idDisp = req.body.idDisp;
		const hoy = moment(Date.now()).tz('America/La_Paz').format('YYYY-MM-DD');
		const ahora = moment(Date.now()).tz('America/La_Paz').format('YYYY-MM-DD HH:mm:ss');
		DispositivoModel.findOne({ codigoFisico: _idDisp }).then(function(disp){
			if(!disp) return res.json({success: false, msg: 'Dispositivo inválido'});
			if(disp.seguimiento.length == 0){
				let nuevoSeguimiento = {
					_id: mongoose.Types.ObjectId(Date.now()),
					fecha_creacion: hoy,
					coords: []
				};
				disp.seguimiento.push(nuevoSeguimiento);
			}
			else if(hoy > disp.seguimiento[disp.seguimiento.length - 1].fecha_creacion){
				let nuevoSeguimiento = {
					_id: mongoose.Types.ObjectId(Date.now()),
					fecha_creacion: hoy,
					coords: []
				};
				disp.seguimiento.push(nuevoSeguimiento);
			}
			let coords = {
				latitude:  parseFloat(req.body.lat),
				longitude: parseFloat(req.body.lon),
				fecha_creacion: ahora,
				syncUsuario: false,
				syncPolicia: false,
				syncPlataforma: false,
			};	
			disp.seguimiento[disp.seguimiento.length - 1].coords.push(coords);
			disp.markModified('seguimiento');
			disp.save(function(err, newDoc){
				if(err) return res.json({success: false, msg: 'Hubo un error'});
				// Emitiendo datos a un cuarto especifico
				// que tiene nombre del ID del usuario
				const lastIdTrack = disp.seguimiento.length - 1;
				const fecha_envio = newDoc.seguimiento[lastIdTrack].coords[disp.seguimiento[lastIdTrack].coords.length - 1].fecha_creacion;
				io.to(disp._idUser).emit('device-signal', JSON.stringify({
					idDevice: disp._id, 
					idUser: disp._idUser,
					latitude: parseFloat(req.body.lat), 
					longitude: parseFloat(req.body.lon),
					fecha: fecha_envio.split(' ')[0],
					hora: fecha_envio.split(' ')[1],
				}));
				//io.emit('station-room', JSON.stringify({
					//idDevice: disp._id, 
					// idUser: disp._idUser,
					// latitude: parseFloat(req.body.lat), 
					// longitude: parseFloat(req.body.lon),
					// fecha: fecha_envio.split(' ')[0],
					// hora: fecha_envio.split(' ')[1],
				//}));
				io.to(disp._id).emit('alert-signal', JSON.stringify({
					idDevice: disp._id, 
					idUser: disp._idUser,
					latitude: parseFloat(req.body.lat), 
					longitude: parseFloat(req.body.lon),
					fecha: fecha_envio.split(' ')[0],
					hora: fecha_envio.split(' ')[1],
				}));
				res.json({success: true, msg: 'Los datos fueron guardados'});
			});
		}, function(err){
			res.json({success: false, msg: 'Hubo un error en el servidor'});
		});
	},
	enviarRoomPolicia: function(req, res, DispositivoModel, io){
		const _idDisp = mongoose.Types.ObjectId(req.body.idDevice);
		DispositivoModel.findById({_id: _idDisp}).then(function(disp){
			if(!disp) return res.json({success: false, msg: 'Dispositivo inválido'});
			io.to(disp._id + ':' + req.body.idPoli).emit('alert-signal', JSON.stringify({
				idDevice: disp._id, 
				idUser: disp._idUser,
				latitude: parseFloat(req.body.lat), 
				longitude: parseFloat(req.body.lon),
				fecha: fecha_envio.split(' ')[0],
				hora: fecha_envio.split(' ')[1],
			}));
		}, function(err){
			return res.json({success: false, msg: 'Hubo un error en el servidor'});
		});
	},
	syncCoordsPolice: function(req, res, DispositivoModel){
		DispositivoModel.findById({_id: req.body.idDisp}).then(function(disp){
			let toUpdate = disp.seguimiento[disp.seguimiento.length - 1];
			for (var i = 0; i < toUpdate.coords.length; i++) {
				toUpdate.coords[i].syncPolicia = true;
			};
			disp.markModified('seguimiento');
			disp.save(function(err, updated){
				if(err) return res.json({success: false, msg: 'Sincronización fallida'})
				let coords = updated.seguimiento[updated.seguimiento.length - 1];
				res.json({
					success: true, 
					device: {
						_id: updated._id,
						nombre: updated.nombre,
					    apellido: updated.apellido,
					    ciudad: updated.ciudad_residencia,
					    pais: updated.pais,
					    codigoFisico: updated.codigoFisico,
					    _idUser: updated._idUser,
					}, 
					coords: coords
				});
			}, function(err){
				res.json({success: false, msg: 'Hubo un error en el servidor al actualizar los datos'});
			});
		}, function(err){
			return res.json({ success: false, msg: 'Hubo un error en el servidor' });
		});
	},
};

module.exports = dispositivosController;