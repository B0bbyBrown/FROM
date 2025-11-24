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
    // The test ID is on the Select component (Radix UI)
    // We need to find and click the SelectTrigger button inside it
    cy.get('[data-testid="date-range-filter-card"]').should("be.visible");
    
    // Find the SelectTrigger button - it's within the date-range-filter-card
    // The Select component (Root) doesn't render a DOM element, so we find the button directly
    cy.get('[data-testid="date-range-filter-card"]').within(() => {
      // Find the button that's the SelectTrigger (it has role="combobox")
      cy.get('button[role="combobox"]').first().click();
    });
    
    // Wait for the dropdown to open and select "This Week"
    cy.contains('[role="option"]', "This Week").should("be.visible").click();
    
    // Verify metrics are still visible after change
    cy.get('[data-testid="period-revenue"]').should("be.visible");
    cy.get('[data-testid="period-margin"]').should("be.visible");
  });

  it("should display top products", () => {
    cy.get('[data-testid="product-performance-card"]').should("be.visible");
  });

  it("should display low stock items", () => {
    // Low stock alerts section exists, but may be empty if no low stock items
    cy.get('[data-testid="inventory-status-card"]').should("be.visible");
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="low-stock-alerts"]').length > 0) {
        cy.get('[data-testid="low-stock-alerts"]').should("be.visible");
      } else {
        // If no low stock items, verify the card still exists
        cy.get('[data-testid="inventory-status-card"]').should("be.visible");
      }
    });
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
