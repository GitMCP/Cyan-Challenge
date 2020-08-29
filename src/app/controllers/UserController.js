import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import sequelize from 'sequelize';

class UserController {
	async index(req, res) {
		const results = await User.findAll({
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
				.matches(req.body.password, 'Passwords doesn\'t match!')
		});
		const validationErrors = [];
		await schema.validate(req.body, { abortEarly: false }).catch(err => {
			validationErrors.push(...err.errors);
		});
		if (!(await schema.isValid(req.body))) {
			return res.status(400).json({ message: validationErrors });
		}

		const emailInUse = await User.findOne({ where: { email: req.body.email } });
		if (emailInUse) {
			return res.status(400).json({ error: 'E-mail already in use!' });
		}

		const { id, name, email } = await User.create(req.body);
		return res.json({ id, name, email });
	}

	async update(req, res) {
		const user = await User.findByPk(req.userId);
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
						.oneOf([Yup.ref('password')], 'Passwords doesn\'t match!')
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
			const emailInUse = await User.findOne({
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
		const user = await User.findByPk(req.userId);
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
			email: `deleted:${user.email}#${uuidv4()}`,
			deleted_at: sequelize.fn('NOW')
		});

		return res.json({ message: 'Account deleted!' });
	}
}

export default new UserController();
