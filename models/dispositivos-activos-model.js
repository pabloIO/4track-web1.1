'use strict';
const mongoose = require('mongoose');

let DispositivosActivosSchema = mongoose.Schema({
	codigo: {
		type: String,
		required: true,
		unique: true
	},
	fecha_creacion: {
		type: Date,
		default: Date.now
	},
	activo: {
		type: Boolean,
		default: false
	},
});

const DispositivosActivosModel = mongoose.model('DispositivosActivos', DispositivosActivosSchema);
module.exports = DispositivosActivosModel;