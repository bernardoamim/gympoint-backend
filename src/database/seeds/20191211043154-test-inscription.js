module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'inscriptions',
      [
        {
          student_id: 2,
          plan_id: 3,
          start_date: new Date(2019, 12, 11),
          end_date: new Date(2020, 7, 11),
          price: 534.0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
