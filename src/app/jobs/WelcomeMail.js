import { format, parseISO } from 'date-fns';
import en from 'date-fns/locale/en-US';
import Mail from '../../lib/Mail';

class WelcomeMail {
  get key() {
    return 'WelcomeMail';
  }

  async handle({ data }) {
    const { inscription, student, plan } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'GymPoint Inscription',
      template: 'welcome',
      context: {
        studentId: student.id,
        student: student.name,
        plan: plan.title,
        fee: plan.price.toFixed(2),
        amount: inscription.price.toFixed(2),
        endDate: format(
          parseISO(inscription.end_date),
          "EEEE', ' MMMM' 'dd', 'yyyy",
          {
            locale: en,
          }
        ),
      },
    });
  }
}

export default new WelcomeMail();
