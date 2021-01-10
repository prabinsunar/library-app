const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
	Genre.find()
		.sort([['name', 'ascending']])
		.exec((err, genre_list) => {
			if (err) {
				return next(err);
			}

			res.render('genre_list', { title: 'Genre List', genre_list });
		});
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
	async.parallel(
		{
			genre: function (callback) {
				Genre.findById(req.params.id).exec(callback);
			},
			genre_books: function (callback) {
				Book.find({ genre: req.params.id }).exec(callback);
			},
		},
		function (err, results) {
			if (err) {
				return next(err);
			}
			if (results.genre == null) {
				let err = new Error('Genre not found');
				err.status = 404;
				return next(err);
			}

			res.render('genre_detail', {
				title: 'Genre Detail',
				genre: results.genre,
				genre_books: results.genre_books,
			});
		}
	);
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res, next) {
	res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
	body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
	(req, res, next) => {
		const errors = validationResult(req);

		let genre = new Genre({ name: req.body.name });

		if (!errors.isEmpty()) {
			res.render('genre_form', {
				title: 'Create Genre',
				genre: genre,
				errors: errors.array(),
			});
		} else {
			Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
				if (err) {
					return next(err);
				}

				if (found_genre) {
					res.redirect(found_genre.url);
				} else {
					genre.save(err => {
						if (err) {
							return next(err);
						}

						res.redirect(genre.url);
					});
				}
			});
		}
	},
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
	async.parallel(
		{
			genre: callback => {
				Genre.findById(req.params.id).exec(callback);
			},
			genre_books: callback => {
				Book.find({ genre: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}

			if (results.genre_books == null) {
				res.redirect('/catalogs/genres');
			}

			res.render('genre_delete', {
				title: 'Delete Genre',
				genre: results.genre,
				genre_books: results.genre_books,
			});
		}
	);
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
	async.parallel(
		{
			genre: callback => {
				Genre.findById(req.body.genreid).exec(callback);
			},
			genre_books: callback => {
				Book.find({ genre: req.body.genreid }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}

			if (results.genre_books.length > 0) {
				res.render('genre_delete', {
					title: 'Delete Genre',
					genre: results.genre,
					genre_books: results.genre_books,
				});
				return;
			} else {
				Genre.findByIdAndRemove(req.body.genreid, err => {
					if (err) {
						next(err);
					}
					res.redirect('/catalog/genres');
				});
			}
		}
	);
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
	Genre.findById(req.params.id).exec((err, genre) => {
		if (err) {
			return next(err);
		}

		res.render('genre_form', {
			title: 'Update Genre',
			genre,
		});
	});
};

// Handle Genre update on POST.
exports.genre_update_post = [
	body('name', 'Genre name must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		let errors = validationResult(req);

		let genre = new Genre({
			name: req.body.name,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			Genre.findById(req.params.id).exec((err, genre) => {
				if (err) {
					return next(err);
				}

				res.render('genre_form', {
					title: 'Update Genre',
					genre,
					errors: errors.array(),
				});
			});
		} else {
			Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, genre) => {
				if (err) {
					return next(err);
				}

				res.redirect(genre.url);
			});
		}
	},
];
