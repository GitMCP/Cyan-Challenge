import jwt from 'jsonwebtoken';
import User from '../models/User';
import authConfig from '../../config/auth';
import * as Yup from 'yup';

class SessionController {
	async create(req, res) {
		const schema = Yup.object().shape({
			email: Yup.string()
				.email()
				.required(),
			password: Yup.string().required(),
		});
		const validationErrors = [];
		await schema.validate(req.body, { abortEarly: false }).catch(err => {
			validationErrors.push(...err.errors);
		});
		if (!(await schema.isValid(req.body))) {
			return res.status(400).json({ message: validationErrors });
		}
        
		const { email, password } = req.body;

		const user = await User.findOne({ where: { email: email}});
		if (!user || user.deleted_at) {
			return res.status(401).json({ error: 'User not found!' });
		}
		if (!(await user.checkPassword(password))) {
			return res.status(401).json({ error: 'Invalid password!' });
		}
      
		const { id, name } = user;
      
		return res.json({
			user: {
				id,
				name,
				email,
			},
			token: jwt.sign({ id }, authConfig.secret, {
				expiresIn: authConfig.expiresIn,
			}),
		});
	}
}

export default new SessionController();
