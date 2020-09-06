"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Mill = require('../models/Mill'); var _Mill2 = _interopRequireDefault(_Mill);
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');
var _Notify = require('../jobs/Notify'); var _Notify2 = _interopRequireDefault(_Notify);

class MillController {
  async index(req, res) {
    const results = await _Mill2.default.findAll({
      where: { deleted_at: null },
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'created_at'],
      include: {
        model: _User2.default,
        as: 'author',
        attributes: ['id', 'name', 'email']
      }
    });
    return res.json(results);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('Please inform the mill name!')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const nameExists = await _Mill2.default.findOne({ where: { name: req.body.name } });
    if (nameExists) {
      return res
        .status(400)
        .json({ error: "There's already a mill with that name!" });
    }
    const { name } = req.body;
    const author_id = req.userId;

    const { id } = await _Mill2.default.create({ name, author_id });

    const register = {
      user: (await _User2.default.findByPk(author_id)).name,
      entity: 'mill: ' + name
    };
    _Notify2.default.call(void 0, req.io, register);

    return res.json({ id, name });
  }

  async update(req, res) {
    const { mill_id } = req.params;
    const schema = Yup.object().shape({
      name: Yup.string().required('Please inform the mill name!')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const mill = await _Mill2.default.findByPk(mill_id);

    if (!mill) {
      return res.status(400).json({ error: 'Mill not found!' });
    }
    if (req.userId != mill.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this mill's author" });
    }

    if (req.body.name) {
      const nameExists = await _Mill2.default.findOne({ where: { name: req.body.name } });
      if (nameExists && nameExists.id != mill_id) {
        return res
          .status(400)
          .json({ error: "There's already a mill with that name!" });
      }
    }

    const { id, name } = await mill.update({ name: req.body.name });

    return res.json({ id, name });
  }

  async delete(req, res) {
    const { mill_id } = req.params;
    const mill = await _Mill2.default.findByPk(mill_id);

    if (!mill) {
      return res.status(400).json({ error: 'Mill not found!' });
    }
    if (req.userId != mill.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this mill's author" });
    }

    await mill.update({
      name: `deleted:${mill.name}#${_uuid.v4.call(void 0, )}`,
      deleted_at: _sequelize2.default.fn('NOW')
    });

    return res.json({ message: 'Mill deleted!' });
  }
}

exports. default = new MillController();
