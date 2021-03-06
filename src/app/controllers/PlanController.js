import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const plans = await Plan.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(plans);
  }

  async show(req, res) {
    const { id } = req.params;

    const plan = await Plan.findByPk(id, {
      attributes: ['id', 'title', 'duration', 'price'],
    });

    if (!plan)
      return res
        .status(400)
        .json({ error: "We couldn't find the Plan you're looking for." });

    return res.json(plan);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const planExists = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (planExists) {
      return res
        .status(400)
        .json({ error: `Plan '${req.body.title}' already exists!` });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const plan = await Plan.findByPk(req.params.id);

    const { title } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist.' });
    }

    if (title !== plan.title) {
      const planExists = await Plan.findOne({
        where: { title },
      });

      if (planExists) {
        return res.status(400).json({ error: 'Plan already exist.' });
      }
    }

    const { id, duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist.' });
    }

    await plan.destroy();

    return res.json({ message: 'Plan succesfully deleted!' });
  }
}

export default new PlanController();
