const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('index', { title: 'Users route' });
});

module.exports = router;
