// Define rawItems at top or fetch
const rawItems = [{ id: '1', name: 'Item1', price: 10 }]; // Mock data; alternatively, intercept API to provide this

describe('Sessions Page', () => {
  beforeEach(() => {
    cy.login('CASHIER');
    cy.intercept('GET', '/api/sessions').as('getSessions');
    cy.visit('/sessions');
    cy.wait('@getSessions', { timeout: 10000 });
  });

  it('should display the sessions page with no active session', () => {
    cy.contains('button', 'Open Session').should('be.visible').click();
    cy.get('button', { timeout: 10000 }).contains('Close Session').should('not.exist');
  });

  it('should allow opening and closing a session', () => {
    cy.contains('button', 'Open Session').click();
    cy.get('input[name="openingFloat"]').type('100');
    rawItems.forEach((item, index) => {
      cy.get(`input[id="item-${item.id}"]`).type('10'); // Adjust if needed
    });
    cy.contains('button', 'Confirm').click();
    cy.contains('Session Opened').should('be.visible');

    // Assume a sale is needed, but for closing
    cy.contains('button', 'Close Session').click();
    cy.get('input[name="closingFloat"]').type('150');
    rawItems.forEach((item, index) => {
      cy.get(`input[id="close-item-${item.id}"]`).type('5');
    });
    cy.contains('button', 'Confirm').click();
    cy.contains('Session Closed').should('be.visible');
  });

  it('should display session history', () => {
    cy.get('[data-testid="sessions-table"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="sessions-table"] tbody tr').should('have.length.gte', 1);
  });

  it('should display session totals in table', () => {
    cy.get('[data-testid="sessions-table"] tbody tr', { timeout: 10000 }).first().click();
    cy.contains('Total Sales').should('be.visible');
    cy.contains('Total COGS').should('be.visible');
  });

  it('should show error for invalid opening float', () => {
    cy.contains('button', 'Open Session').click();
    cy.get('input[name="openingFloat"]').type('abc');
    cy.contains('button', 'Confirm').click();
    cy.contains('Invalid float amount').should('be.visible');
  });
});
