import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const { count, rows } = await HelpOrder.findAndCountAll({
      where: {
        answered_at: null,
      },
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'height', 'weight'],
        },
      ],
    });

    return res.json({
      total: count,
      page,
      perPage: 20,
      helpOrders: rows,
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Checking if student's id is a valid one
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const order = await HelpOrder.create({
      student_id: student.id,
      ...req.body,
    });

    return res.json(order);
  }

  async show(req, res) {
    const { page = 1 } = req.query;

    // Checking if student's id is a valid one
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const { count, rows } = await HelpOrder.findAndCountAll({
      where: {
        student_id: req.params.id,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json({
      total: count,
      page,
      perPage: 10,
      helpOrders: rows,
    });
  }
}

export default new HelpOrderController();
