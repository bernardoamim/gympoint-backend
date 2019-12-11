import Sequelize, { Model } from 'sequelize';
import { isBefore, isAfter } from 'date-fns';

class Inscription extends Model {
  static init(sequelize) {
    super.init(
      {
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        price: Sequelize.FLOAT,
        isActive: {
          type: Sequelize.VIRTUAL,
          get() {
            return (
              isBefore(new Date(), this.end_date) &&
              isAfter(new Date(), this.start_date)
            );
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    this.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
  }
}

export default Inscription;
