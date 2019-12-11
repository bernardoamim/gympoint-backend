import {
  isBefore,
  parseISO,
  startOfToday,
  addMonths,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Inscription from '../models/Inscription';

class InscriptionController {
  async index(req, res) {
    const { page = 1 } = req.query;

    /**
     *  Only lists inscriptions that are active or set to future
     *  isActive: true -> ongoing;
     *  isActive: false -> future inscription
     *  not shown -> ended inscription
     * */
    const inscriptions = await Inscription.findAll({
      where: {
        end_date: {
          [Op.gte]: new Date(),
        },
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration', 'price'],
        },
      ],
      attributes: ['id', 'isActive', 'start_date', 'end_date', 'price'],
      order: [['end_date', 'DESC']],
      offset: (page - 1) * 20,
    });
    return res.json(inscriptions);
  }

  async show(req, res) {
    /**
     *  Only lists inscriptions that are active or set to future
     *  isActive: true -> ongoing;
     *  isActive: false -> future inscription
     *  not shown -> ended inscription
     * */
    const inscription = await Inscription.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration', 'price'],
        },
      ],
      attributes: ['id', 'isActive', 'start_date', 'end_date', 'price'],
    });
    return res.json(inscription);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Checking if start_date is before today
     * Here we validated by the day. Made more sense. Rsrs
     */
    const parsedStartDate = parseISO(start_date);
    const endOfStartDay = endOfDay(parsedStartDate);

    if (isBefore(endOfStartDay, startOfToday())) {
      return res
        .status(400)
        .json({ error: 'You cannot create an inscription with past date.' });
    }

    // Checking if student_id is valid
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    // Checking if plan_id is valid
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist.' });
    }

    // Checking if student already has an ongoing/set inscription
    const ongoingInscription = await Inscription.findOne({
      where: {
        student_id,
        end_date: {
          [Op.gte]: endOfStartDay,
        },
      },
    });

    if (ongoingInscription) {
      return res
        .status(400)
        .json({ error: 'User already has an ongoing/set inscription.' });
    }

    const end_date = addMonths(endOfStartDay, plan.duration);
    const totalPrice = plan.price * plan.duration;

    const inscription = await Inscription.create({
      student_id,
      plan_id,
      start_date: endOfStartDay,
      end_date,
      price: totalPrice,
    });

    return res.json(inscription);
  }
}

export default new InscriptionController();
