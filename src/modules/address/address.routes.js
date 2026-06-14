const router = require('express').Router();
const ctrl = require('./address.controller');
const { verifyToken } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { addressSchema, updateAddressSchema } = require('./address.schema');

router.use(verifyToken);

router.get('/',              ctrl.list);
router.get('/:id',           ctrl.getOne);
router.post('/',             validate(addressSchema),       ctrl.create);
router.patch('/:id',         validate(updateAddressSchema), ctrl.update);
router.delete('/:id',        ctrl.remove);
router.patch('/:id/default', ctrl.setDefault);

module.exports = router;
