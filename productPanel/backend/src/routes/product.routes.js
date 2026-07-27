const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const {
  getAll, getOne, create, update, remove,
  bulkUpload, downloadCSV, downloadExcel, upload
} = require('../controllers/product.controller');

const multer = require('multer');
const csvUpload = multer({ dest: 'uploads/' });

router.get('/', auth, getAll);
router.get('/download/csv', auth, downloadCSV);
router.get('/download/excel', auth, downloadExcel);
router.post('/bulk-upload', auth, csvUpload.single('file'), bulkUpload);
router.get('/:id', auth, getOne);
router.post('/', auth, upload.single('image'), create);
router.put('/:id', auth, upload.single('image'), update);
router.delete('/:id', auth, remove);

module.exports = router;
