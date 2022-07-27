'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('reminders', { id: Sequelize.INTEGER });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('reminders');
  },
};
