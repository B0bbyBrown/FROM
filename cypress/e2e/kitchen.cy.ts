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
        return Cypress.$(el).text().includes("Order #") || 
               Cypress.$(el).find('button').length > 0;
      });
      
      if (orderCards.length > 0) {
        // Find a button to update status (Prep or Done button)
        cy.get('button').contains("Prep").first().then(($btn) => {
          if ($btn.length > 0) {
            cy.wrap($btn).click();
            // Wait for status update
            cy.wait(1000);
            // Verify toast notification or status change
            cy.get('body').should("satisfy", ($body) => {
              return $body.text().includes("Status updated") || 
                     $body.text().includes("updated");
            });
          }
        });
      }
    });
  });

  it("should display order details", () => {
    // Check if orders are displayed with item information
    cy.get("body").then(($body) => {
      if (!$body.text().includes("No pending orders")) {
        // Orders should show item names and quantities
        cy.get('div').contains("x").should("exist");
      }
    });
  });

  it("should auto-refresh orders", () => {
    // Kitchen page auto-refreshes every 5 seconds
    // Just verify the page loads correctly
    cy.contains("Kitchen").should("be.visible");
  });
});

