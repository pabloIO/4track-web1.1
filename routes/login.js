'use strict';
const loginController = {
	iniciarSesionUser: function(req, res, UsuarioModel, bcrypt){
		if(req.body){
			UsuarioModel.findOne({correo: req.body.correo}).then(function(usuario){
				if(!usuario || !usuario.activo){
					return res.json({success: false, msg: 'El usuario no existe'});
				}else{
					bcrypt.compare(req.body.password, usuario.password, function(err, isHash){
						if(!isHash){
							res.json({success: false, msg: 'Sus datos son incorrectos'});
						}else{
							res.json({
								success: true, 
								msg:'Bienvenido', 
								user: {
									_id: usuario._id.toString(),
									nombre: usuario.nombre,
									apellido: usuario.apellido,
									correo: usuario.correo,
									pais: usuario.pais,
									ciudad: usuario.ciudad,
									celular: usuario.telefono.celular,
									codigo_area: usuario.telefono.codigo_area,
								}});
						}
					});
				}
			}, function(err){
				res.json({success: false, msg: 'Hubo un error en el servidor'});
			});
		}else{
			res.json({success: false, msg:'Hubo un error, inténtelo nuevamente'});
		}
	},
	iniciarSesionEstacion: function(req, res, EstacionModel, bcrypt){
		if(req.body){
			EstacionModel.findOne({nombre_usuario: req.body.userName}).then(function(usuario){
				console.log(usuario);
				if(!usuario || !usuario.activo){
					return res.json({success: false, msg: 'El usuario no existe'});
				}else{
					bcrypt.compare(req.body.password, usuario.password, function(err, isHash){
						if(!isHash){
							res.json({success: false, msg: 'Sus datos son incorrectos'});
						}else{
							res.json({
								success: true, 
								msg:'Bienvenido', 
								user: {
									_id: usuario._id,
									coords: usuario.coords
								}});
						}
					});
				}
			}, function(err){
				return res.json({success: false, msg: 'Hubo un error en el servidor'});
			});
		}else{
			return res.json({success: false, msg:'Hubo un error, inténtelo nuevamente'});
		}
	},
};

module.exports = loginController;