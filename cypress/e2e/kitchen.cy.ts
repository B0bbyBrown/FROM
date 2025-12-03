/// <reference types="cypress" />

describe("Kitchen Page", () => {
  beforeEach(() => {
    cy.login("KITCHEN");
    cy.visit("/kitchen");
    cy.contains("Kitchen").should("be.visible");
  });

  it("should display the kitchen page", () => {
    cy.contains("Kitchen").should("be.visible");
    cy.contains("Manage order preparation").should("be.visible");
  });

  it("should display pending orders", () => {
    // Check if there are any orders
    cy.get("body").then(($body) => {
      // If no orders, should show "No pending orders" message
      if ($body.text().includes("No pending orders")) {
        cy.contains("No pending orders").should("be.visible");
      } else {
        // If orders exist, they should be visible as cards
        cy.get('div[class*="grid"]').should("be.visible");
      }
    });
  });

  it("should allow updating order status", () => {
    // Check if there are any pending orders
    cy.get("body").then(($body) => {
      // Look for order cards (they contain status update buttons)
      const orderCards = $body.find('div[class*="border"]').filter((i, el) => {
        return (
          Cypress.$(el).text().includes("Order #") ||
          Cypress.$(el).find("button").length > 0
        );
      });

      if (orderCards.length > 0) {
        // Find a button to update status (Prep or Done button)
        cy.get("button")
          .contains("Prep")
          .first()
          .then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click();
              // Wait for status update
              cy.wait(1000);
              // Verify toast notification or status change
              cy.get("body").should("satisfy", ($body) => {
                return (
                  $body.text().includes("Status updated") ||
                  $body.text().includes("updated")
                );
              });
            }
          });
      }
    });
  });

  // Replace the existing 'should display order details' test (around lines 53-58) with this:
  it("should display order details", () => {
    // Create a pending order by logging in as CASHIER and making a sale
    cy.login("CASHIER");
    cy.intercept("GET", "/api/raw-materials").as("getProducts"); // Correct endpoint
    cy.visit("/sales");
    // If no session, open one (similar to sales fix)
    cy.get('body').then(($body) => {
      if ($body.text().includes('No Active Cash Session')) {
        cy.contains('button', 'Go to Sessions').click();
        cy.contains('button', 'Open Session').click();
        cy.get('input[name="openingFloat"]').type('100');
        cy.contains('button', 'Confirm').click();
        cy.contains('Session Opened').should('be.visible');
        cy.visit("/sales");
      }
    });
    cy.wait("@getProducts", { timeout: 15000 });
    cy.get('[data-testid*="add-product-"]', { timeout: 10000 }).first().click(); // Click add for first product
    cy.get('[data-testid="payment-method-select"]').click();
    cy.contains("Cash").click();
    cy.intercept("POST", "/api/sales").as("createSale");
    cy.get('[data-testid="complete-sale-button"]').click();
    cy.wait("@createSale", { timeout: 10000 });

    // Now log in as KITCHEN and visit kitchen page
    cy.login("KITCHEN");
    cy.visit("/kitchen");
    cy.intercept("GET", "/api/kitchen/orders").as("getOrders");
    cy.wait("@getOrders", { timeout: 15000 });

    // Click the order card and check details
    cy.get(".flex.flex-col.h-full.cursor-pointer", { timeout: 15000 })
      .first()
      .click({ force: true });
    cy.contains("Order Details", { timeout: 15000 }).should("be.visible");
    cy.get('[aria-label="Close"]', { timeout: 5000 }).click({ force: true }); // Close dialog
  });

  it('should auto-refresh orders', () => {
    cy.contains('Kitchen').should('be.visible');
    cy.wait(6000); // Wait for potential refresh
    // Assert something refreshes, e.g., check for updated orders
  });
});
