"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Farm = require('../models/Farm'); var _Farm2 = _interopRequireDefault(_Farm);
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _Harvest = require('../models/Harvest'); var _Harvest2 = _interopRequireDefault(_Harvest);
var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');
var _Notify = require('../jobs/Notify'); var _Notify2 = _interopRequireDefault(_Notify);

class FarmController {
  async index(req, res) {
    const results = await _Farm2.default.findAll({
      where: { deleted_at: null },
      attributes: ['id', 'code', 'name', 'created_at'],
      order: [['id', 'ASC']],
      include: [
        {
          model: _Harvest2.default,
          as: 'ownerHarvest',
          attributes: ['id', 'code', 'start_date', 'end_date']
        },
        {
          model: _User2.default,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    return res.json(results);
  }

  async create(req, res) {
    const { harvest_id } = req.params;
    const harvest = await _Harvest2.default.findByPk(harvest_id);
    if (!harvest) {
      return res.status(400).json({ error: 'Harvest not found!' });
    }
    const schema = Yup.object().shape({
      code: Yup.string().required('Please inform the farm code!'),
      name: Yup.string().required('Please inform the farm name!')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const codeExists = await _Farm2.default.findOne({
      where: { code: req.body.code }
    });
    if (codeExists) {
      return res
        .status(400)
        .json({ error: "There's already a farm with that code!" });
    }

    const { code, name } = req.body;
    const author_id = req.userId;

    const { id } = await _Farm2.default.create({ code, name, harvest_id, author_id });

    const register = {
      user: (await _User2.default.findByPk(author_id)).name,
      entity: 'farm: ' + name
    };
    _Notify2.default.call(void 0, req.io, register);

    return res.json(
      await _Farm2.default.findByPk(id, {
        attributes: ['id', 'code', 'name'],
        include: {
          model: _Harvest2.default,
          as: 'ownerHarvest',
          attributes: ['id', 'code', 'start_date', 'end_date']
        }
      })
    );
  }

  async update(req, res) {
    const { farm_id } = req.params;
    const farm = await _Farm2.default.findByPk(farm_id);
    if (!farm) {
      return res.status(400).json({ error: 'Farm not found!' });
    }

    const schema = Yup.object().shape({
      code: Yup.string(),
      name: Yup.string(),
      harvest_id: Yup.number().typeError('Invalid harvest id')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    if (req.body.code) {
      const codeExists = await _Farm2.default.findOne({
        where: { code: req.body.code }
      });
      if (codeExists && codeExists.id != farm_id) {
        return res
          .status(400)
          .json({ error: "There's already a farm with that code!" });
      }
    }

    const newValues = {
      code: req.body.code,
      name: req.body.name,
      harvest_id: req.body.harvest_id
    };
    for (var propName in newValues) {
      if (newValues[propName] === null || newValues[propName] === undefined) {
        delete newValues[propName];
      }
    }
    const { id } = await farm.update(newValues);

    return res.json(
      await _Farm2.default.findByPk(id, {
        attributes: ['id', 'code', 'name'],
        include: {
          model: _Harvest2.default,
          as: 'ownerHarvest',
          attributes: ['id', 'code', 'start_date', 'end_date']
        }
      })
    );
  }

  async delete(req, res) {
    const { farm_id } = req.params;
    const farm = await _Farm2.default.findByPk(farm_id);

    if (!farm) {
      return res.status(400).json({ error: 'Farm not found!' });
    }
    if (req.userId != farm.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this Farm's author" });
    }

    await farm.update({
      code: `deleted:${farm.code}#${_uuid.v4.call(void 0, )}`,
      deleted_at: _sequelize2.default.fn('NOW')
    });

    return res.json({ message: 'Farm deleted!' });
  }
}

exports. default = new FarmController();
