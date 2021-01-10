const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator');
const Book = require('../models/book');
const async = require('async');

exports.bookinstance_list = function (req, res, next) {
	BookInstance.find()
		.populate('book')
		.exec((err, list_bookinstances) => {
			if (err) {
				return next(err);
			}
			//On success
			res.render('bookinstance_list', {
				title: 'Book Instance List',
				bookinstance_list: list_bookinstances,
			});
		});
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {
	BookInstance.findById(req.params.id)
		.populate('book')
		.exec(function (err, book_instance) {
			if (err) {
				return next(err);
			}
			if (book_instance == null) {
				let err = new Error('Book instance not found');
				err.status = 404;
				return next(err);
			}

			res.render('bookinstance_detail', {
				title: 'Copy: ' + book_instance.book.title,
				bookinstance: book_instance,
			});
		});
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
	Book.find({}, 'title').exec((err, books) => {
		if (err) {
			return next(err);
		}

		res.render('bookinstance_form', {
			title: 'Create book instance',
			book_list: books,
		});
	});
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
	body('book', 'Title should not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('imprint', 'Imprint should not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('status', 'Status should not be empty').escape(),
	body('due_back', 'Invalid date')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	(req, res, next) => {
		let errors = validationResult(req);

		let bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back,
		});

		if (!errors.isEmpty()) {
			Book.find({}, 'title').exec((err, book) => {
				if (err) {
					return next(err);
				}

				res.render('bookinstance_form', {
					title: 'Create Book instance',
					book_list: book,
					selected_book: bookinstance.book._id,
					errors: errors.array(),
					bookinstance,
				});
			});
			return;
		} else {
			bookinstance.save(err => {
				if (err) {
					return next(err);
				}

				res.redirect(bookinstance.url);
			});
		}
	},
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res, next) {
	BookInstance.findById(req.params.id).exec((err, book_instance) => {
		if (err) {
			return next(err);
		}

		if (book_instance == null) {
			res.render('/catalog/bookinstances');
		}

		res.render('bookinstance_delete', {
			title: 'Delete Book Instance',
			bookinstance: book_instance,
		});
	});
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res, next) {
	BookInstance.findByIdAndRemove(req.body.bookinstanceid, err => {
		if (err) {
			return next(err);
		}

		res.redirect('/catalog/bookinstances');
	});
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res, next) {
	async.parallel(
		{
			bookinstance: callback => {
				BookInstance.findById(req.params.id).populate('book').exec(callback);
			},
			book_lists: callback => {
				Book.find(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}

			if (results.bookinstance == null) {
				res.redirect('/catalog/bookinstances');
			}

			res.render('bookinstance_form', {
				title: 'Update BookInstance',
				book_list: results.book_lists,
				bookinstance: results.bookinstance,
			});
		}
	);
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
	body('book', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
	body('imprint', 'Imprint must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('status', 'Status should not be empty').escape(),
	body('due_back', 'Date should be in proper format')
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	(req, res, next) => {
		let errors = validationResult(req);

		let bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			Book.find({}, 'title').exec((err, book_list) => {
				if (err) {
					return next(err);
				}

				res.render('bookinstance_form', {
					title: 'Update BookInstance',
					book_list: book_list,
					bookinstance,
					errors: errors.array(),
				});
			});
			return;
		} else {
			BookInstance.findByIdAndUpdate(
				req.params.id,
				bookinstance,
				{},
				(err, bookcopy) => {
					if (err) {
						return next(err);
					}

					res.redirect(bookcopy.url);
				}
			);
		}
	},
];
