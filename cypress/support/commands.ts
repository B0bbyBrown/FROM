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
    ADMIN: 'admin@pizzatruck.com',
    CASHIER: 'cashier@pizzatruck.com',
    KITCHEN: 'kitchen@pizzatruck.com',
  };
  const email = emailMap[role];

  cy.session(email, () => {
    cy.visit('/login');
    cy.get('#email').type(email);
    cy.get('#password').type('password');
    cy.get('button[type="submit"]').click();

    if (role === 'CASHIER') {
      cy.url().should('include', '/sessions');
    } else if (role === 'KITCHEN') {
      cy.url().should('include', '/kitchen');
    } else {
      cy.url().should('include', '/dashboard');
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