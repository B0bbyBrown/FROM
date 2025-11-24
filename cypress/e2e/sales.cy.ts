/// <reference types="cypress" />

describe("Sales Page", () => {
  beforeEach(() => {
    cy.login("CASHIER");

    cy.visit("/sessions");
    cy.contains("Cash Sessions", { timeout: 10000 }).should("be.visible");
    
    // Wait for page to load
    cy.wait(2000);

    // Check if there's already an active session
    // Wait for either close button (session exists) or open button (no session) to appear
    cy.get("body").then(($body) => {
      const hasCloseButton = $body.find('[data-testid="close-session-button"]').length > 0;
      const hasOpenButton = $body.find('[data-testid="open-session-button"]').length > 0;
      
      if (hasCloseButton) {
        // There's an active session - we can use it, no need to close and reopen
        cy.log("Active session found, using existing session");
      } else if (hasOpenButton) {
        // Open button is visible - click it to open a session
        cy.log("No active session, opening new session");
        cy.get('[data-testid="open-session-button"]').click();
        cy.get('[data-testid="open-session-dialog"]').should("be.visible");
        cy.get('[data-testid="opening-float-input"]').type("100");
        cy.get('input[id^="item-"]').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.get('input[id^="item-"]').each(($input) => {
              cy.wrap($input).type("10");
            });
          }
        });
        cy.get('[data-testid="confirm-open-session-button"]').click();
        cy.wait(2000);
      } else {
        // Neither button found yet - wait for open button to appear
        cy.log("Waiting for session state to load...");
        cy.contains("button", "Open Session", { timeout: 20000 }).click();
        cy.get('[data-testid="open-session-dialog"]').should("be.visible");
        cy.get('[data-testid="opening-float-input"]').type("100");
        cy.get('input[id^="item-"]').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.get('input[id^="item-"]').each(($input) => {
              cy.wrap($input).type("10");
            });
          }
        });
        cy.get('[data-testid="confirm-open-session-button"]').click();
        cy.wait(2000);
      }
    });

    // Navigate to sales page
    cy.visit("/sales");
    cy.contains("Point of Sale", { timeout: 10000 }).should("be.visible");
  });

  it("should display the sales page and product list", () => {
    cy.get('[data-testid="products-list"]').should("be.visible");
    cy.get('[data-testid="complete-sale-button"]').should("be.visible");
  });

  it("should allow creating a new sale", () => {
    // Ensure no dialogs are blocking interactions
    // Wait for any open dialogs to close
    cy.get("body").then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.get('[role="dialog"]', { timeout: 5000 }).should("not.exist");
      }
    });
    
    // Find the add button for any product
    cy.get('[data-testid*="add-product"]').first().should("be.visible");
    cy.get('[data-testid*="add-product"]').first().click();
    cy.get('[data-testid="sale-items-list"]').should("be.visible");
    // Select payment method before completing
    cy.get('[data-testid="payment-method-select"]').click();
    cy.contains("Cash").click();
    cy.get('[data-testid="complete-sale-button"]').click();
    // Wait for sale to complete and table to update
    cy.wait(2000);
    cy.get('[data-testid="recent-sales-table"]').should("be.visible");
  });

  it("should search for products", () => {
    cy.get('[data-testid="product-search-input"]').type("pep");
    cy.get('[data-testid="products-list"]')
      .contains("Pepperoni")
      .should("be.visible");
  });

  it("should update item quantity in sale", () => {
    cy.get('[data-testid*="add-product"]').first().click();
    cy.get('[data-testid*="increase-qty"]').first().click();
    cy.get('[data-testid*="qty"]').first().should("not.have.text", "1");
    cy.get('[data-testid*="decrease-qty"]').first().click();
  });

  it("should remove item from sale", () => {
    cy.get('[data-testid*="add-product"]').first().click();
    cy.get('[data-testid*="remove-item"]').first().click();
    cy.get('[data-testid="sale-items-list"]').should("not.contain", "Pizza");
  });

  it("should show error when completing sale with no items", () => {
    // Ensure no dialogs are blocking interactions
    // Wait for any open dialogs to close
    cy.get("body").then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.get('[role="dialog"]', { timeout: 5000 }).should("not.exist");
      }
    });
    
    // Ensure no items are in the sale
    cy.get('[data-testid="sale-items-list"]').then(($list) => {
      // If there are items, remove them
      if ($list.find('[data-testid*="remove-item"]').length > 0) {
        cy.get('[data-testid*="remove-item"]').each(($btn) => {
          cy.wrap($btn).click();
        });
        cy.wait(500); // Wait for items to be removed
      }
    });
    
    cy.get('[data-testid="complete-sale-button"]').click({ force: true });
    
    // The error is shown in a toast notification
    // Wait a moment for the toast to appear, then check for the error message
    cy.wait(500);
    cy.contains("Please add items to the sale", { timeout: 5000 }).should("be.visible");
  });
});
