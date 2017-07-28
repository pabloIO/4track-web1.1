'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let PoliciaSchema = new mongoose.Schema({
	nombre: {
		type: String,
		required: true
	},
	apellido: {
		apat: {
			type: String,
			required: true	
		},
		amat: {
			type: String,
			required: true	
		}
	},
	codigo: {
		type: String,
		required: true,
		uppercase: true,
		unique: true
	},
	password: {
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
const UsuarioModel = mongoose.model('Policias', PoliciaSchema);
module.exports = UsuarioModel;