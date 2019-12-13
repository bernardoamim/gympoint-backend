import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import User from '../models/User';
import Queue from '../../lib/Queue';
import AnswerMail from '../jobs/AnswerMail';

class AnswerController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string()
        .required()
        .min(1),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Checking if help order id is a valid one
    const helpOrder = await HelpOrder.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
        },
      ],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order not found.' });
    }

    // Checking if student has been deleted
    if (!helpOrder.student_id) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    /**
     * Here we are going to allow User to answer even if it has already been answered.
     * That way, it will be able to 'update' the answer and that wouldn't be much of
     * problem, since the student will receive another email.
     */

    const { name } = await User.findByPk(req.userId);
    const { answer } = req.body;

    helpOrder.answer = answer;
    helpOrder.answered_at = new Date();

    await helpOrder.save();

    await Queue.add(AnswerMail.key, {
      helpOrder,
      userName: name,
    });

    return res.json(helpOrder);
  }
}

export default new AnswerController();
