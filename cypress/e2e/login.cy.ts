describe('Login Page', () => {
  beforeEach(() => {
    // For local testing, ensure the base URL is correct
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Log In');
  });

  it('should show an error message with invalid credentials', () => {
    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    // Assuming a toast message or similar appears for errors
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should login successfully with valid credentials and redirect to dashboard', () => {
    cy.get('#email').type('admin@pizzatruck.com');
    cy.get('#password').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.contains('Dashboard').should('be.visible');
  });
});