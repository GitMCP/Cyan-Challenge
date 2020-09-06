"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Farm = require('../models/Farm'); var _Farm2 = _interopRequireDefault(_Farm);
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _Field = require('../models/Field'); var _Field2 = _interopRequireDefault(_Field);
var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');
var _Notify = require('../jobs/Notify'); var _Notify2 = _interopRequireDefault(_Notify);

class FieldController {
  async index(req, res) {
    const results = await _Field2.default.findAll({
      where: { deleted_at: null },
      attributes: ['id', 'code', 'location'],
      order: [['id', 'ASC']],
      include: [
        {
          model: _Farm2.default,
          as: 'ownerFarm',
          attributes: ['id', 'code', 'name']
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
    const { farm_id } = req.params;
    const farm = await _Farm2.default.findByPk(farm_id);
    if (!farm) {
      return res.status(400).json({ error: 'Farm not found!' });
    }
    const schema = Yup.object().shape({
      code: Yup.string().required('Please inform the field code!'),
      coordinates: Yup.array()
        .of(Yup.number().typeError('Invalid coordinates'))
        .min(2, 'Invalid coordinates')
        .max(2, 'Invalid coordinates')
        .required()
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const codeExists = await _Field2.default.findOne({
      where: { code: req.body.code }
    });
    if (codeExists) {
      return res
        .status(400)
        .json({ error: "There's already a field with that code!" });
    }

    const { code, coordinates } = req.body;
    const location = {
      type: 'Point',
      coordinates
    };
    const author_id = req.userId;

    const { id } = await _Field2.default.create({ code, location, farm_id, author_id });
    const register = {
      user: (await _User2.default.findByPk(author_id)).name,
      entity: 'field: ' + code
    };
    _Notify2.default.call(void 0, req.io, register);

    return res.json(
      await _Field2.default.findByPk(id, {
        attributes: ['id', 'code', 'location'],
        include: {
          model: _Farm2.default,
          as: 'ownerFarm',
          attributes: ['id', 'name', 'code']
        }
      })
    );
  }

  async update(req, res) {
    const { field_id } = req.params;
    const field = await _Field2.default.findByPk(field_id);
    if (!field) {
      return res.status(400).json({ error: 'Field not found!' });
    }

    const schema = Yup.object().shape({
      code: Yup.string(),
      coordinates: Yup.array()
        .of(Yup.number().typeError('Invalid coordinates'))
        .min(2, 'Invalid coordinates')
        .max(2, 'Invalid coordinates'),
      farm_id: Yup.number().typeError('Invalid farm id')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    if (req.body.code) {
      const codeExists = await _Field2.default.findOne({
        where: { code: req.body.code }
      });
      if (codeExists && codeExists.id != field_id) {
        return res
          .status(400)
          .json({ error: "There's already a field with that code!" });
      }
    }
    const { coordinates } = req.body;

    const location = coordinates
      ? {
          type: 'Point',
          coordinates
        }
      : null;

    const newValues = {
      code: req.body.code,
      location,
      harvest_id: req.body.harvest_id
    };
    for (var propName in newValues) {
      if (newValues[propName] === null || newValues[propName] === undefined) {
        delete newValues[propName];
      }
    }
    const { id } = await field.update(newValues);

    return res.json(
      await _Field2.default.findByPk(id, {
        attributes: ['id', 'code', 'location'],
        include: {
          model: _Farm2.default,
          as: 'ownerFarm',
          attributes: ['id', 'code', 'name']
        }
      })
    );
  }

  async delete(req, res) {
    const { field_id } = req.params;
    const field = await _Field2.default.findByPk(field_id);

    if (!field) {
      return res.status(400).json({ error: 'Field not found!' });
    }
    if (req.userId != field.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this Field's author" });
    }

    await field.update({
      code: `deleted:${field.code}#${_uuid.v4.call(void 0, )}`,
      deleted_at: _sequelize2.default.fn('NOW')
    });

    return res.json({ message: 'Field deleted!' });
  }
}

exports. default = new FieldController();
