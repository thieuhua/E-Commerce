const router = require('express').Router();
const controller = require('./product.controller');
const validate = require('../../middlewares/validate');
const { verifyToken, requireRole } = require('../../middlewares/auth');
const upload = require('../../middlewares/upload');
const { createProductSchema, updateProductSchema, listProductSchema } = require('./product.schema');

// Public routes
router.get('/',    validate(listProductSchema, 'query'), controller.list);
router.get('/:id', controller.getById);

// Admin-only routes
router.use(verifyToken, requireRole('admin', 'staff'));

router.post(
  '/',
  upload.array('images', 10),
  validate(createProductSchema),
  controller.create
);

router.patch(
  '/:id',
  upload.array('images', 10),
  validate(updateProductSchema),
  controller.update
);

router.delete('/:id',              controller.remove);
router.delete('/:id/images/:imageId', controller.deleteImage);

module.exports = router;
