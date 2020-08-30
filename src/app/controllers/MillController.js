import Mill from '../models/Mill';
import * as Yup from 'yup';
import User from '../models/User';
import sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import notify from '../jobs/Notify';

class MillController {
  async index(req, res) {
    const results = await Mill.findAll({
      where: { deleted_at: null },
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'created_at'],
      include: {
        model: User,
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

    const nameExists = await Mill.findOne({ where: { name: req.body.name } });
    if (nameExists) {
      return res
        .status(400)
        .json({ error: "There's already a mill with that name!" });
    }
    const { name } = req.body;
    const author_id = req.userId;

    const { id } = await Mill.create({ name, author_id });

    const register = {
      user: (await User.findByPk(author_id)).name,
      entity: 'mill: ' + name
    };
    notify(req.io, register);

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

    const mill = await Mill.findByPk(mill_id);

    if (!mill) {
      return res.status(400).json({ error: 'Mill not found!' });
    }
    if (req.userId != mill.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this mill's author" });
    }

    if (req.body.name) {
      const nameExists = await Mill.findOne({ where: { name: req.body.name } });
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
    const mill = await Mill.findByPk(mill_id);

    if (!mill) {
      return res.status(400).json({ error: 'Mill not found!' });
    }
    if (req.userId != mill.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this mill's author" });
    }

    await mill.update({
      name: `deleted:${mill.name}#${uuidv4()}`,
      deleted_at: sequelize.fn('NOW')
    });

    return res.json({ message: 'Mill deleted!' });
  }
}

export default new MillController();
