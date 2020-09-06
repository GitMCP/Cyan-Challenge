"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _yup = require('yup'); var Yup = _interopRequireWildcard(_yup);
var _uuid = require('uuid');
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class UserController {
  async index(req, res) {
    const results = await _User2.default.findAll({
      attributes: ['id', 'name', 'email', 'created_at'],
      where: { deleted_at: null },
      order: [['id', 'ASC']]
    });
    return res.json(results);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('Please inform your name!'),
      email: Yup.string()
        .email('Invalid e-mail address!')
        .required('Please inform an e-mail address!'),

      password: Yup.string()
        .required('Please inform a password!')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password too weak!'
        ),
      confirmPassword: Yup.string()
        .required('Please confirm your password!')
        .matches(req.body.password, "Passwords doesn't match!")
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const emailInUse = await _User2.default.findOne({ where: { email: req.body.email } });
    if (emailInUse) {
      return res.status(400).json({ error: 'E-mail already in use!' });
    }

    const { id, name, email } = await _User2.default.create(req.body);
    return res.json({ id, name, email });
  }

  async update(req, res) {
    const user = await _User2.default.findByPk(req.userId);
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email('Invalid e-mail address!'),
      password: Yup.string().matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password too weak!'
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required('Please confirm your Password!')
              .oneOf([Yup.ref('password')], "Passwords doesn't match!")
          : field
      ),
      oldPassword: Yup.string().when('password', (password, field) =>
        password ? field.required('Please input the old password!') : field
      )
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }
    if (req.body.email) {
      const emailInUse = await _User2.default.findOne({
        where: { email: req.body.email }
      });
      if (emailInUse) {
        return res.status(400).json({ error: 'E-mail already in use!' });
      }
    }
    if (req.body.password) {
      if (!(await user.checkPassword(req.body.oldPassword))) {
        return res.status(401).json({ message: 'Invalid old password!' });
      }
    }
    const newValues = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    };

    for (var propName in newValues) {
      if (newValues[propName] === null || newValues[propName] === undefined) {
        delete newValues[propName];
      }
    }

    const { id, name, email } = await user.update(newValues);

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const user = await _User2.default.findByPk(req.userId);
    const schema = Yup.object().shape({
      password: Yup.string().required('Please inform your password!')
    });

    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    if (!(await user.checkPassword(req.body.password))) {
      return res.status(401).json({ message: 'Invalid password!' });
    }

    await user.update({
      email: `deleted:${user.email}#${_uuid.v4.call(void 0, )}`,
      deleted_at: _sequelize2.default.fn('NOW')
    });

    return res.json({ message: 'Account deleted!' });
  }
}

exports. default = new UserController();
