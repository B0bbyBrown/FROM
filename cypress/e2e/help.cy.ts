describe('Help Page', () => {
  beforeEach(() => {
    cy.login('CASHIER');
    cy.intercept('GET', '/api/auth/me').as('getMe');
    cy.visit('/help');
    cy.wait('@getMe');
  });

  it('should display the help page with search and task cards', () => {
    cy.contains('Quick Task Helper').should('be.visible');
    cy.get('input[placeholder="Search tasks (e.g., add product)"]').should('be.visible');
    cy.get('[data-testid^="task-accordion-"]').should('have.length.gt', 0);
  });

  it('should filter tasks when searching', () => {
    cy.get('input[placeholder="Search tasks (e.g., add product)"]').type('sale');
    cy.get('[data-testid^="task-accordion-"]').should('have.length', 1);
    cy.get('[data-testid="task-accordion-process-sale"]').contains('Process a Sale').should('be.visible');
  });

  it('should redirect to the correct page when a task is clicked', () => {
    cy.get('[data-testid="task-accordion-process-sale"]').contains('Process a Sale').click();
    cy.get('button').contains('Go to Task').click();
    cy.url().should('include', '/sales');
  });
});
