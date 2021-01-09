const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator');
const async = require('async');

exports.index = (req, res) => {
	async.parallel(
		{
			book_count: callback => {
				Book.countDocuments({}, callback);
			},
			book_instance_count: callback => {
				BookInstance.countDocuments({}, callback);
			},
			book_instance_available_count: callback => {
				BookInstance.countDocuments({ status: 'Available' }, callback);
			},
			author_count: callback => {
				Author.countDocuments({}, callback);
			},
			genre_count: callback => {
				Genre.countDocuments({}, callback);
			},
		},
		(err, results) => {
			res.render('index', {
				title: 'Local Library Home',
				error: err,
				data: results,
			});
		}
	);
};

exports.book_list = (req, res, next) => {
	Book.find({}, 'title author')
		.populate('author')
		.exec((err, list_books) => {
			if (err) {
				return next(err);
			}
			//On successfull query
			res.render('book_list', { title: 'Book List', book_list: list_books });
		});
};

exports.book_list_detail = (req, res, next) => {
	async.parallel(
		{
			book: function (callback) {
				Book.findById(req.params.id)
					.populate('author')
					.populate('genre')
					.exec(callback);
			},
			book_instance: function (callback) {
				BookInstance.find({ book: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.book == null) {
				let err = new Error('Book instance not found');
				err.status = 404;
				return next(err);
			}

			res.render('book_detail', {
				title: 'Books Detail',
				book: results.book,
				book_instance: results.book_instance,
			});
		}
	);
};

exports.book_create_get = (req, res, next) => {
	async.parallel(
		{
			authors: function (callback) {
				Author.find(callback);
			},
			genres: function (callback) {
				Genre.find(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('book_form', {
				title: 'Create Book',
				genres: results.genres,
				authors: results.authors,
			});
		}
	);
};

exports.book_create_post = [
	(req, res, next) => {
		if (!(req.body.genre instanceof Array)) {
			if (typeof req.body.genre === undefined) {
				req.body.genre = [];
			} else {
				req.body.genre = new Array(req.body.genre);
			}
		}
		next();
	},
	body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
	body('author', 'Author must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('summary', 'Summary must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
	body('genre.*').escape(),
	(req, res, next) => {
		let errors = validationResult(req);

		let book = new Book({
			title: req.body.title,
			author: req.body.author,
			summary: req.body.summary,
			isbn: req.body.isbn,
			genre: req.body.genre,
		});

		if (!errors.isEmpty()) {
			async.parallel(
				{
					genre: function (callback) {
						Genre.find(callback);
					},
					author: function (callback) {
						Author.find(callback);
					},
				},
				(err, results) => {
					if (err) {
						return next(err);
					}
					for (let i = 0; i < results.genres.length; i++) {
						if (book.genre.indexOf(results.genres[i]._id) > -1) {
							results.genres[i].checked = 'true';
						}
					}

					res.render('book_form', {
						title: 'Create Book',
						authors: results.authors,
						genres: results.genres,
						book: book,
						errors: errors.array(),
					});
				}
			);
			return;
		} else {
			book.save(err => {
				if (err) {
					return next(err);
				}

				res.redirect(book.url);
			});
		}
	},
];

exports.book_delete_get = (req, res) => {
	res.send('Not implemented: Book delete GET');
};

exports.book_delete_post = (req, res) => {
	res.send('Not implemented: Book delete POST');
};

exports.book_update_get = (req, res) => {
	res.send('Not implemented: Book update GET');
};

exports.book_update_post = (req, res) => {
	res.send('Not implemented: Book update POST');
};
