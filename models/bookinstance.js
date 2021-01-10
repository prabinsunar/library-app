const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

let BookInstanceSchema = new Schema({
	book: { type: Schema.Types.ObjectId, ref: 'BookModel', required: true },
	imprint: { type: String, required: true },
	status: {
		type: String,
		required: true,
		enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
		default: 'Maintenance',
	},
	due_back: { type: Date, default: Date.now() },
});

BookInstanceSchema.virtual('due_back_formatted').get(function () {
	return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual('due_date_input').get(function () {
	return DateTime.fromJSDate(this.due_back).toISODate();
});

BookInstanceSchema.virtual('url').get(function () {
	return '/catalog/bookinstance/' + this._id;
});

module.exports = mongoose.model('BookInstanceModel', BookInstanceSchema);
