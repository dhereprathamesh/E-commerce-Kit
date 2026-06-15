const {
  createAddress,

  getAddresses,

  updateAddress,

  deleteAddress,

  setDefaultAddress,
} = require("./address.service");

const create = async (req, res, next) => {
  try {
    const address = await createAddress(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const addresses = await getAddresses(req.user.id);

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const address = await updateAddress(req.params.id, req.body);

    res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await deleteAddress(req.params.id);

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const setDefault = async (req, res, next) => {
  try {
    const address = await setDefaultAddress(req.user.id, req.params.id);

    res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  update,
  remove,
  setDefault,
};
