/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('login', (role = 'ADMIN') => {
  const emailMap = {
    ADMIN: 'admin@from.com',
    CASHIER: 'cashier@from.com',
    KITCHEN: 'kitchen@from.com',
  };
  const email = emailMap[role];

  cy.session(email, () => {
    cy.visit('/login', { timeout: 10000 });
    cy.get('#email', { timeout: 10000 }).type(email);
    cy.get('#password', { timeout: 10000 }).type('password');
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    cy.get('button[type="submit"]', { timeout: 10000 }).click();
    cy.wait('@loginRequest', { timeout: 20000 }).its('response.statusCode').should('eq', 200);

    // Wait for redirect and verify based on role
    cy.url({ timeout: 20000 }).should('not.include', '/login');
    if (role === 'ADMIN') {
      cy.url().should('include', '/dashboard');
    } else if (role === 'CASHIER') {
      cy.url().should('include', '/sessions');
    } else if (role === 'KITCHEN') {
      cy.url().should('include', '/kitchen');
    }
  }, {
    validate: () => {
      cy.request('/api/auth/me').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.user.role).to.eq(role);
      });
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: 'ADMIN' | 'CASHIER' | 'KITCHEN'): Chainable<void>;
    }
  }
}