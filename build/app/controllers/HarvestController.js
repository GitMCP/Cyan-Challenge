"use strict";"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _Harvest = require('../models/Harvest'); var _Harvest2 = _interopRequireDefault(_Harvest);
var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _Mill = require('../models/Mill'); var _Mill2 = _interopRequireDefault(_Mill);
var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _uuid = require('uuid');
var _Notify = require('../jobs/Notify'); var _Notify2 = _interopRequireDefault(_Notify);

class HarvestController {
  async index(req, res) {
    const results = await _Harvest2.default.findAll({
      where: { deleted_at: null },
      order: [['id', 'ASC']],
      attributes: ['id', 'code', 'created_at'],
      include: [
        { model: _Mill2.default, as: 'ownerMill', attributes: ['id', 'name'] },
        { model: _User2.default, as: 'author', attributes: ['id', 'name', 'email'] }
      ]
    });
    return res.json(results);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      code: Yup.string().required('Please inform the harvest code!'),
      start_date: Yup.date()
        .typeError('Invalid start date!')
        .required('Please inform the harvest start date!')
        .max(Yup.ref('end_date'), 'The start date must be prior to end date!'),
      end_date: Yup.date()
        .typeError('Invalid end date!')
        .required('Please inform the harvest end date!')
        .min(Yup.ref('start_date'), 'The end date must be after start date!')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const codeExists = await _Harvest2.default.findOne({
      where: { code: req.body.code }
    });
    if (codeExists) {
      return res
        .status(400)
        .json({ error: "There's already a Harvest with that code!" });
    }
    const { code, start_date, end_date } = req.body;
    const { mill_id } = req.params;
    const mill = await _Mill2.default.findByPk(mill_id);
    if (!mill) {
      return res.status(400).json({ error: 'Mill not found!' });
    }

    const author_id = req.userId;

    const { id } = await _Harvest2.default.create({
      code,
      start_date,
      end_date,
      mill_id,
      author_id
    });

    const register = {
      user: (await _User2.default.findByPk(author_id)).name,
      entity: 'harvest: ' + code
    };
    _Notify2.default.call(void 0, req.io, register);

    return res.json(
      await _Harvest2.default.findByPk(id, {
        attributes: ['id', 'code', 'start_date', 'end_date'],
        include: { model: _Mill2.default, as: 'ownerMill', attributes: ['id', 'name'] }
      })
    );
  }

  async update(req, res) {
    const { harvest_id } = req.params;
    const harvest = await _Harvest2.default.findByPk(harvest_id);

    const schema = Yup.object().shape(
      {
        code: Yup.string(),
        mill_id: Yup.number().typeError('Invalid mill id'),
        start_date: Yup.date().when('end_date', {
          is: '' || null || undefined,
          then: Yup.date()
            .typeError('Invalid start date!')
            .max(harvest.end_date, 'The start date must be prior to end date!'),
          otherwise: Yup.date()
            .typeError('Invalid start date!')
            .max(
              Yup.ref('end_date'),
              'The start date must be prior to end date!'
            )
        }),
        end_date: Yup.date().when('start_date', {
          is: '' || null || undefined,
          then: Yup.date()
            .typeError('Invalid end date!')
            .min(harvest.start_date, 'The end date must be after start date!'),
          otherwise: Yup.date()
            .typeError('Invalid end date!')
            .min(
              Yup.ref('start_date'),
              'The end date must be after start date!'
            )
        })
      },
      ['start_date', 'end_date']
    );
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    if (!harvest) {
      return res.status(400).json({ error: 'Harvest not found!' });
    }
    if (req.userId != harvest.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this Harvest's author" });
    }
    if (req.body.code) {
      const codeExists = await _Harvest2.default.findOne({
        where: { code: req.body.code }
      });
      if (codeExists && codeExists.id != harvest_id) {
        return res
          .status(400)
          .json({ error: "There's already a Harvest with that code!" });
      }
    }

    const newValues = {
      code: req.body.code,
      mill_id: req.body.mill_id,
      start_date: req.body.start_date,
      end_date: req.body.end_date
    };
    for (var propName in newValues) {
      if (newValues[propName] === null || newValues[propName] === undefined) {
        delete newValues[propName];
      }
    }
    const { id } = await harvest.update(newValues);

    return res.json(
      await _Harvest2.default.findByPk(id, {
        attributes: ['id', 'code', 'start_date', 'end_date'],
        include: { model: _Mill2.default, as: 'ownerMill', attributes: ['id', 'name'] }
      })
    );
  }

  async delete(req, res) {
    const { harvest_id } = req.params;
    const harvest = await _Harvest2.default.findByPk(harvest_id);

    if (!harvest) {
      return res.status(400).json({ error: 'Harvest not found!' });
    }
    if (req.userId != harvest.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this Harvest's author" });
    }

    await harvest.update({
      code: `deleted:${harvest.code}#${_uuid.v4.call(void 0, )}`,
      deleted_at: _sequelize2.default.fn('NOW')
    });

    return res.json({ message: 'Harvest deleted!' });
  }
}

exports. default = new HarvestController();
