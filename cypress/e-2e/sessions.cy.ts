describe('Sessions Page', () => {
  beforeEach(() => {
    cy.login('CASHIER');
    cy.visit('/sessions');
  });

  it('should display the sessions page with no active session', () => {
    // ... existing code ...
  });
});
