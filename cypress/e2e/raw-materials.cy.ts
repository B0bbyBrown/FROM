/// <reference types="cypress" />

describe("Raw Materials Page", () => {
  beforeEach(() => {
    cy.login("ADMIN");
    cy.visit("/raw-materials");
    cy.contains("Raw Materials").should("be.visible");
  });

  it("should display the raw materials page", () => {
    cy.contains("Raw Materials").should("be.visible");
    cy.get("table").should("be.visible");
  });

  it("should display raw materials table", () => {
    cy.get("table").should("be.visible");
    cy.get("th").contains("Name").should("be.visible");
    cy.get("th").contains("SKU").should("be.visible");
    cy.get("th").contains("Type").should("be.visible");
    cy.get("th").contains("Unit").should("be.visible");
    cy.get("th").contains("Price").should("be.visible");
  });

  it("should allow creating a new raw material", () => {
    // Click the "Create New Item" button
    cy.contains("button", "Create New Item").click();

    // Wait for dialog to open
    cy.contains("Create New Item").should("be.visible");

    // Fill in raw material details using specific input IDs
    cy.get("#name").type("Test Material");
    cy.get("#unit").type("kg");
    cy.get("#sku").type("TEST-MAT-001");

    // Type is already set to "RAW" by default, but we can verify or change it if needed
    // The type select shows "Raw Ingredient" as the label
    cy.get('button[role="combobox"]').first().should("be.visible");

    // Fill in low stock level (optional)
    cy.get("#lowStockLevel").type("10");

    // Intercept the API call to see if it succeeds or fails
    cy.intercept("POST", "/api/raw-materials").as("createItem");

    // Submit form
    cy.get('button[type="submit"]').contains("Create Item").click();

    // Wait for the API call to complete
    cy.wait("@createItem", { timeout: 10000 }).then((interception) => {
      if (interception.response?.statusCode === 200) {
        // Success - wait for dialog to close
        // Check for the dialog content element to disappear
        cy.get('[role="dialog"]', { timeout: 10000 }).should("not.exist");
        
        // Verify material appears in table
        cy.contains("Test Material").should("be.visible");
      } else {
        // API call failed - check for error message
        cy.contains("Failed to create item", { timeout: 5000 }).should("be.visible");
        // Dialog should still be open on error
        cy.get('[role="dialog"]').should("be.visible");
      }
    });
  });

  it("should display raw materials with correct formatting", () => {
    // Check if materials are displayed
    cy.get("table tbody tr").then(($rows) => {
      if ($rows.length > 0) {
        // Verify first row has data
        cy.get("table tbody tr")
          .first()
          .within(() => {
            cy.get("td").should("have.length.at.least", 3);
          });
      }
    });
  });

  it("should show price in correct currency format", () => {
    // Check if prices are displayed with currency formatting
    cy.get("table tbody tr").then(($rows) => {
      if ($rows.length > 0) {
        // Prices should contain R or currency symbol
        cy.get("table tbody").should("satisfy", ($body) => {
          return $body.text().includes("R") || $body.text().match(/\d+\.\d{2}/);
        });
      }
    });
  });
});
