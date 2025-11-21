/// <reference types="cypress" />

describe("Sales Page", () => {
  beforeEach(() => {
    cy.login("CASHIER");

    cy.visit("/sessions");
    cy.contains("Cash Sessions").should("be.visible");

    // Check for and close any active session
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="close-session-button"]').length > 0) {
        cy.get('[data-testid="close-session-button"]').click();
        cy.get('[data-testid="closing-float-input"]').type("100");
        cy.get('input[id^="item-"]').each(($input) => {
          cy.wrap($input).type("10");
        });
        cy.get('[data-testid="confirm-close-session-button"]').click({
          force: true,
        });
        cy.wait(1000); // Wait for session to close
      }
    });

    // Wait for open button to appear after close
    cy.get('[data-testid="open-session-button"]', { timeout: 10000 }).should(
      "be.visible"
    );

    // Now open a new session if the open button is present
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="open-session-button"]').length > 0) {
        cy.get('[data-testid="open-session-button"]', {
          timeout: 10000,
        }).click();
        cy.get('[data-testid="opening-float-input"]').type("100");
        cy.get('input[id^="item-"]').each(($input) => {
          cy.wrap($input).type("10");
        });
        cy.get('[data-testid="confirm-open-session-button"]').click();
        cy.wait(2000); // Wait for session to open
      }
    });

    cy.visit("/sales");
    cy.contains("Point of Sale").should("be.visible");
  });

  it("should display the sales page and product list", () => {
    cy.get('[data-testid="products-list"]').should("be.visible");
    cy.get('[data-testid="complete-sale-button"]').should("be.visible");
  });

  it("should allow creating a new sale", () => {
    // Find the add button for Margherita Pizza (using the actual item ID from seed)
    cy.get('[data-testid*="add-product"]').first().click();
    cy.get('[data-testid="sale-items-list"]').should("be.visible");
    cy.get('[data-testid="complete-sale-button"]').click();
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
    cy.get('[data-testid="complete-sale-button"]').click({ force: true });
    cy.contains("Please add items to the sale").should("be.visible");
  });
});
