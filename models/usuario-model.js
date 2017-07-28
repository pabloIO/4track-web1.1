'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let UsuarioSchema = new mongoose.Schema({
	nombre: {
		type: String,
		required: true
	},
	apellido: {
		type: String,
		required: true	
	},
	correo: {
		type: String,
		required: true,
		lowercase: true,
		unique: true
	},
	password: {
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
			required: true
		},
		codigo_area:{
			type: String,
			required: true
		}
	},
	_dispositivos: [{
		type: Schema.Types.ObjectId,
		ref: 'Dispositivos'
	}],
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
});
const UsuarioModel = mongoose.model('Usuarios', UsuarioSchema);
module.exports = UsuarioModel;