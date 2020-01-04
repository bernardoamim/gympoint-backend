import { Op } from 'sequelize';
import { startOfToday, endOfToday, subDays } from 'date-fns';
import Inscription from '../models/Inscription';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    // Checking if student is valid
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const { page = 1 } = req.query;

    const { count, rows } = await Checkin.findAndCountAll({
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
      limit: 10,
      offset: (page - 1) * 10,
      order: [['created_at', 'DESC']],
    });

    return res.json({
      total: count,
      page,
      perPage: 10,
      checkins: rows,
    });
  }

  async store(req, res) {
    // Checking if student has an active inscription
    const inscription = await Inscription.findOne({
      where: {
        student_id: req.params.id,
        start_date: {
          [Op.lte]: startOfToday(),
        },
        end_date: {
          [Op.gte]: endOfToday(),
        },
      },
      attributes: ['isActive', 'id', 'start_date', 'end_date'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    if (!inscription) {
      return res
        .status(400)
        .json({ error: 'Student does not have a valid inscription.' });
    }

    // Checking if student has reached it's weekly quota
    const checkinCount = await Checkin.findAndCountAll({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [subDays(startOfToday(), 7), endOfToday()],
        },
      },
    });

    if (checkinCount.count >= 5) {
      return res
        .status(400)
        .json({ error: 'You have reached your use limit in the last 7 days.' });
    }

    const checkin = await Checkin.create({
      student_id: req.params.id,
    });

    return res.json({ checkin, count: checkinCount.count + 1 });
  }
}

export default new CheckinController();
