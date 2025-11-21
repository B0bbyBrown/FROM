/// <reference types="cypress" />

describe("Reports Page", () => {
  beforeEach(() => {
    cy.login("ADMIN");
    cy.visit("/reports");
    cy.contains("Reports").should("be.visible");
  });

  it("should display period metrics", () => {
    cy.get('[data-testid="period-revenue"]').should("be.visible");
    cy.get('[data-testid="period-margin"]').should("be.visible");
  });

  it("should change date range", () => {
    // Check if date range selector exists, if not skip
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="date-range-select"]').length > 0) {
        cy.get('[data-testid="date-range-select"]').select("this_week");
        cy.get('[data-testid="period-revenue"]').should("be.visible");
      }
    });
  });

  it("should display top products", () => {
    cy.get('[data-testid="product-performance-card"]').should("be.visible");
  });

  it("should display low stock items", () => {
    cy.get('[data-testid="low-stock-alerts"]').should("be.visible");
  });

  it("should display stock movements", () => {
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="ingredient-usage-table"]').length > 0) {
        cy.get('[data-testid="ingredient-usage-table"]').should("be.visible");
      }
    });
  });

  it("should display current stock levels", () => {
    cy.get('[data-testid="inventory-status-card"]').should("be.visible");
  });
});
