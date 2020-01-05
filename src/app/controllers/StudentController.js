import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const { q = '', page = 1 } = req.query;

    const whereStatement = {};

    if (q !== '') {
      whereStatement.name = { [Op.iLike]: `%${q}%` };
    }

    const students = await Student.findAll({
      where: whereStatement,
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    });

    // const response = {
    //   ...students,
    //   total: students.length,
    //   totalPages: students.lenght / 20,
    // };

    return res.json(students);
  }

  async show(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    });

    if (!student)
      return res
        .status(400)
        .json({ error: "We couldn't find the student you're looking for." });

    return res.json(student);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists!' });
    }

    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { email } = req.body;

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    if (email !== student.email) {
      const emailExists = await Student.findOne({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists.' });
      }
    }

    const { id, name, age, weight, height } = await student.update(req.body);

    return res.json({ id, name, age, weight, height });
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    await student.destroy();

    return res.json({ message: 'Student succesfully deleted!' });
  }
}

export default new StudentController();
