describe("Purchases Page", () => {
  beforeEach(() => {
    cy.login("ADMIN");
    cy.visit("/purchases");
    cy.intercept("GET", "/api/purchases").as("getPurchases");
    cy.wait("@getPurchases", { timeout: 15000 });
  });

  it("should display the purchases page and past purchases", () => {
    cy.contains("Purchases", { timeout: 10000 }).should("be.visible");
    cy.get("table", { timeout: 10000 }).should("be.visible");
  });

  it("should allow creating a new purchase", () => {
    cy.get('button[data-testid="create-purchase-button"]', {
      timeout: 15000,
    }).click();
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible'); // Wait for dialog
    cy.get('[data-testid="supplier-select"]', { timeout: 10000 }).click({ force: true }); // Force click if overlay
    cy.get('[role="option"]').contains("Add New Supplier").click();
    cy.get('input[data-testid="supplier-name-input"]', { timeout: 10000 }).type(
      "Test Supplier"
    );
    cy.get('button[data-testid="create-supplier-button"]').click();
    cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist'); // Ensure add supplier dialog closes
    // Instead, check if the supplier is selected or appears in options
    cy.get('[data-testid="supplier-select"]', { timeout: 10000 }).click(); // Open dropdown
    cy.get('[role="option"]', { timeout: 5000 }).should('contain.text', 'Test Supplier'); // Check in options
    cy.get('[data-testid="supplier-select"]').click(); // Close if needed
    // Now select the new supplier
    cy.get('[data-testid="supplier-select"]', { timeout: 10000 }).click();
    cy.get('[role="option"]').contains("Test Supplier").click();
    // Add item
    cy.get('button[data-testid="add-purchase-item-button"]').click();
    cy.get('[data-testid="item-select-0"]', { timeout: 10000 }).click();
    cy.get('[role="option"]').contains("Bases").click();
    cy.get('input[data-testid="quantity-input-0"]').type("10");
    cy.get('input[data-testid="cost-input-0"]').type("25");
    // Submit
    cy.get('button[data-testid="confirm-purchase-button"]').click();
    cy.contains("Success", { timeout: 10000 }).should("be.visible");
    cy.contains("Purchase order created successfully").should("be.visible");
  });
});
