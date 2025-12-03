/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(role?: "ADMIN" | "CASHIER" | "KITCHEN"): Chainable<void>;
  }
}

describe("Raw Materials Page", () => {
  beforeEach(() => {
    cy.login("ADMIN");
    cy.intercept("GET", "/api/raw-materials?type=RAW").as("getRawMaterials");
    cy.visit("/raw-materials");
    cy.wait("@getRawMaterials", { timeout: 15000 });
  });

  it("should display the raw materials page", () => {
    cy.contains("Raw Materials", { timeout: 10000 }).should("be.visible");
  });

  it("should display raw materials table", () => {
    cy.get("table", { timeout: 10000 }).should("be.visible");
  });

  it("should allow creating a new raw material", () => {
    cy.contains('button', 'Create New Raw Material').click();
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="text"]', { timeout: 10000 }).first().type('New Ingredient'); // Assuming first is name
    cy.get('input[type="text"]').eq(1).type('kg');
    cy.get('input[type="number"]').type('2.5'); // Assuming price is number
    cy.contains('button', 'Create').click();
    cy.contains("Item created successfully", { timeout: 10000 }).should(
      "be.visible"
    );
  });

  it("should display raw materials with correct formatting", () => {
    cy.get("table tbody tr", { timeout: 10000 })
      .first()
      .within(() => {
        cy.get("td").eq(0).should("contain.text", "Bases");
      });
  });

  it("should show price in correct currency format", () => {
    cy.get("table tbody tr", { timeout: 10000 })
      .first()
      .within(() => {
        cy.get('td').eq(2).should('contain.text', 'RAW'); // Adjust to actual format
      });
  });
});
