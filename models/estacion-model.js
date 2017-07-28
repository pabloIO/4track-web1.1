'use strict';
const mongoose = require('mongoose');

let EstacionSchema = mongoose.Schema({
	nombre_estacion: {
		type: String,
		required: true,
	},
	coords: {
		latitude: {
			type: Number,
			required: true
		},
		longitude: {
			type: Number,
			required: true
		},
	},
	ciudad: {
		type: String,
		required: true,
	},
	nombre_usuario: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true
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
	}
});

module.exports = mongoose.model('Estaciones', EstacionSchema);