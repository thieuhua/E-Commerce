const { sequelize } = require('../../config/database');
const Address = require('./address.model');
const { ApiError } = require('../../utils/apiError');

const list = (userId) =>
  Address.findAll({
    where: { user_id: userId },
    order: [['is_default', 'DESC'], ['address_id', 'ASC']],
  });

const getOne = async (addressId, userId) => {
  const address = await Address.findOne({ where: { address_id: addressId, user_id: userId } });
  if (!address) throw ApiError.notFound('Address not found');
  return address;
};

const create = async (userId, data) => {
  const t = await sequelize.transaction();
  try {
    // If new address is default, unset others first
    if (data.is_default) {
      await Address.update({ is_default: 0 }, { where: { user_id: userId }, transaction: t });
    }
    // Auto-default if user has no addresses yet
    const count = await Address.count({ where: { user_id: userId }, transaction: t });
    if (count === 0) data.is_default = 1;

    const address = await Address.create({ ...data, user_id: userId }, { transaction: t });
    await t.commit();
    return address;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const update = async (addressId, userId, data) => {
  const address = await getOne(addressId, userId);
  const t = await sequelize.transaction();
  try {
    if (data.is_default) {
      await Address.update({ is_default: 0 }, { where: { user_id: userId }, transaction: t });
    }
    await address.update(data, { transaction: t });
    await t.commit();
    return address.reload();
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const remove = async (addressId, userId) => {
  const address = await getOne(addressId, userId);
  await address.destroy();

  // If deleted address was default, promote the next one
  if (address.is_default) {
    const next = await Address.findOne({ where: { user_id: userId }, order: [['address_id', 'ASC']] });
    if (next) await next.update({ is_default: 1 });
  }
};

const setDefault = async (addressId, userId) => {
  const address = await getOne(addressId, userId);
  const t = await sequelize.transaction();
  try {
    await Address.update({ is_default: 0 }, { where: { user_id: userId }, transaction: t });
    await address.update({ is_default: 1 }, { transaction: t });
    await t.commit();
    return address.reload();
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { list, getOne, create, update, remove, setDefault };
