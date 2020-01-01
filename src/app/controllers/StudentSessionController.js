import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import Student from '../models/Student';
import authConfig from '../../config/auth';

class StudentSessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.body;

    const student = await Student.findByPk(Number(id), {
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    return res.json({
      student,
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new StudentSessionController();
