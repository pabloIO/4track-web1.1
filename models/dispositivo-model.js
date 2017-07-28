'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let DispositivoSchema = mongoose.Schema({
	nombre: {
		type: String,
		required: true
	},
	apellido: {
		type: String,
		required: true	
	},
	ciudad_residencia: {
		type: String,
		required: true
	},
	pais: {
		type: String,
		required: true
	},
	telefono:{
		celular: {
			type: Number,
			required: true,
			unique: true
		},
		codigo_area:{
			type: String,
			required: true
		}
	},
	seguimiento: [],
	fecha_creacion: {
		type: Date,
		default: Date.now
	},
	fecha_actualizacion: {
		type: Date,
		default: null
	},
	activo: {
		type: Boolean,
		default: true,
	},
	img: {
		type: String,
		default: null
	},
	codigoFisico: {
		type: String,
		unique: true,
	},
	_idUser: {
		type: Schema.Types.ObjectId,
		ref: 'Usuario'
	},
});
/*
	seguimiento: [
		{
			_id: ObjectId,
			fecha_creacion: {
				type: Date,
				default: Date.now
			},
			coords: [{
				latitude: Number,
				longitude: Number,
				fecha: {
					type: Date,
					default: Date.now
				},
				syncUsuario: {
					type: Boolean,
					default: false
				},
				syncPolicia: {
					type: Boolean,
					default: false
				},
				syncPlataforma: {
					type: Boolean,
					default: false
				}]
			}
		}
	]
 */

let DispositivoModel = mongoose.model('Dispositivos', DispositivoSchema);
module.exports = DispositivoModel;
