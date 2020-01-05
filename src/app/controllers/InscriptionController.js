import {
  isBefore,
  parseISO,
  startOfToday,
  addMonths,
  endOfDay,
  isAfter,
  startOfDay,
} from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Inscription from '../models/Inscription';
import WelcomeMail from '../jobs/WelcomeMail';
import Queue from '../../lib/Queue';

class InscriptionController {
  // =================================  <INDEX>  ================================= //

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
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
      attributes: ['id', 'isActive', 'start_date', 'end_date', 'price'],
      order: [['end_date', 'DESC']],
      offset: (page - 1) * 20,
    });
    return res.json(inscriptions);
  }

  // ================================  </INDEX>  ================================= //

  // =================================  <SHOW>  ================================= //

  async show(req, res) {
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
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
      attributes: ['id', 'isActive', 'start_date', 'end_date', 'price'],
    });
    return res.json(inscription);
  }

  // =================================  </SHOW>  ================================= //

  // =================================  <STORE>  ================================= //

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
    const startDay = startOfDay(parsedStartDate);

    if (isBefore(startDay, startOfToday())) {
      return res.status(400).json({
        error: 'You cannot create an inscription with past start date.',
      });
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
          [Op.gte]: endOfDay(parsedStartDate),
        },
      },
    });

    if (ongoingInscription) {
      return res
        .status(400)
        .json({ error: 'User already has an ongoing/set inscription.' });
    }

    const end_date = addMonths(endOfDay(parsedStartDate), plan.duration);
    const totalPrice = plan.price * plan.duration;

    const inscription = await Inscription.create({
      student_id,
      plan_id,
      start_date: startDay,
      end_date,
      price: totalPrice,
    });

    await Queue.add(WelcomeMail.key, { inscription, plan, student });

    return res.json(inscription);
  }

  // =================================  </STORE>  ================================= //

  // =================================  <UPDATE>  ================================= //

  /**
   *  The user will be able to edit the inscription if
   *  it is active or is set to start in the future
   */

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { plan_id, start_date = startOfToday() } = req.body;

    // Verifying if inscription exists
    const inscription = await Inscription.findByPk(req.params.id);

    if (!inscription) {
      return res
        .status(400)
        .json({ error: "Couldn't find informed inscription." });
    }

    // Checking if student has been deleted
    if (!inscription.student_id) {
      return res
        .status(400)
        .json({ error: "Couldn't find inscription's student." });
    }

    // Checking if plan is valid
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: "Couldn't find informed plan." });
    }

    // Checking if inscription has ended (notShown)
    if (isAfter(startOfToday(), inscription.end_date)) {
      return res
        .status(400)
        .json({ error: "You can't update ended inscriptions." });
    }

    // Checking if informed start_date is in the past
    const parsedStartDate = parseISO(start_date);
    const startDay = startOfDay(parsedStartDate);

    if (isBefore(startDay, startOfToday())) {
      return res.status(400).json({
        error: 'Start date of the inscription cannot be past date.',
      });
    }

    const end_date = addMonths(endOfDay(parsedStartDate), plan.duration);
    const totalPrice = plan.price * plan.duration;

    const updatedInscription = await inscription.update({
      plan_id,
      start_date: startDay,
      end_date,
      price: totalPrice,
    });

    return res.json(updatedInscription);
  }

  // =================================  </UPDATE>  ================================= //

  // =================================  <DELETE>  ================================= //

  async delete(req, res) {
    const inscription = await Inscription.findByPk(req.params.id);

    if (!inscription) {
      return res.status(400).json({ error: 'Inscription does not exist.' });
    }

    await inscription.destroy();

    return res.json({ message: 'Inscription succesfully deleted!' });
  }
}

// =================================  </DELETE>  ================================= //

export default new InscriptionController();
