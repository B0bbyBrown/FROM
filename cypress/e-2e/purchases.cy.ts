describe('Purchases Page', () => {
  before(() => {
    cy.task('db:reset');
    cy.task('db:seed');
  });

  beforeEach(() => {
    cy.login('ADMIN');
    cy.intercept('GET', '/api/auth/me').as('getMe');
  });
});
