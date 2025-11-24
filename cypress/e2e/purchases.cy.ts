describe("Purchases Page", () => {
  beforeEach(() => {
    cy.login("ADMIN");
    cy.visit("/purchases");
    cy.contains("Purchases").should("be.visible");
  });

  it("should display the purchases page and past purchases", () => {
    cy.get('[data-testid="purchases-table"]').should("be.visible");
  });

  it("should allow creating a new purchase", () => {
    cy.get('[data-testid="create-purchase-button"]').click();
    // Wait for dialog to open
    cy.get('[data-testid="create-purchase-dialog"]').should("be.visible");
    
    // Handle supplier selection - may open "Add New Supplier" dialog if no suppliers exist
    cy.get('[data-testid="supplier-select"]').click();
    
    // Check if "Add New Supplier" option exists (no suppliers scenario)
    cy.get('[role="option"]').then(($options) => {
      const optionTexts = Array.from($options).map(el => el.textContent || '');
      const hasAddNew = optionTexts.some(text => text.includes('Add New Supplier'));
      
      if (hasAddNew && $options.length === 1) {
        // Only "Add New Supplier" option exists - no suppliers
        cy.contains('[role="option"]', "Add New Supplier").click();
        // Wait for add supplier dialog to open
        cy.get('[data-testid="add-supplier-dialog"]', { timeout: 5000 }).should("be.visible");
        // Fill in supplier details
        cy.get('[data-testid="supplier-name-input"]').type("Test Supplier");
        cy.get('[data-testid="create-supplier-button"]').click();
        // Wait for supplier to be created and dialog to close
        cy.get('[data-testid="add-supplier-dialog"]').should("not.exist");
        cy.wait(500);
        // Now select the supplier we just created
        cy.get('[data-testid="supplier-select"]').click();
        cy.contains('[role="option"]', "Test Supplier").click();
      } else {
        // Suppliers exist, select the first one (skip "Add New Supplier" if it's there)
        const supplierOptions = Array.from($options).filter(el => 
          !el.textContent?.includes('Add New Supplier')
        );
        if (supplierOptions.length > 0) {
          cy.wrap(supplierOptions[0]).click();
        } else {
          cy.get('[role="option"]').first().click();
        }
      }
    });
    
    // Add purchase item - ensure we're back in the purchase dialog
    cy.get('[data-testid="create-purchase-dialog"]').should("be.visible");
    cy.get('[data-testid="item-select-0"]', { timeout: 5000 }).should("be.visible").click();
    // Wait for options to appear and select first item
    cy.get('[role="option"]').first().click();
    cy.get('[data-testid="quantity-input-0"]').clear().type("5");
    cy.get('[data-testid="cost-input-0"]').clear().type("25");
    // Confirm purchase
    cy.get('[data-testid="confirm-purchase-button"]').click();
    // Wait for dialog to close and table to update
    cy.wait(1000);
    cy.get('[data-testid="purchases-table"]').should("be.visible");
  });
});
