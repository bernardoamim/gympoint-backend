import { format, parseISO } from 'date-fns';
import en from 'date-fns/locale/en-US';
import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { helpOrder, userName, userEmail } = data;
    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Answer Help Order',
      template: 'answer',
      context: {
        helpOrder,
        userName,
        userEmail,
        created_at: format(
          parseISO(helpOrder.createdAt),
          "EEEE', ' MMMM' 'dd', 'yyyy",
          {
            locale: en,
          }
        ),
        answered_at: format(
          parseISO(helpOrder.answered_at),
          "EEEE', ' MMMM' 'dd', 'yyyy",
          {
            locale: en,
          }
        ),
      },
    });
  }
}

export default new AnswerMail();
