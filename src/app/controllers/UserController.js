import User from '../models/User';

class UserController {
  // not being used since it was used a seed
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists!' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  // not being used since it was used a seed

  async update(req, res) {
    return res.json({ ok: true });
  }
}

export default new UserController();
