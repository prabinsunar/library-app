const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator');
const Book = require('../models/book');

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
exports.bookinstance_delete_get = function (req, res) {
	res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
	res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
	res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
	res.send('NOT IMPLEMENTED: BookInstance update POST');
};
