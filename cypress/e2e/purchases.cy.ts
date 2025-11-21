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
    cy.get('[data-testid="item-select-0"]').click();
    cy.get('[data-testid="quantity-input-0"]').type("5");
    cy.get('[data-testid="cost-input-0"]').type("25");
    cy.get('[data-testid="confirm-purchase-button"]').click();
    cy.get('[data-testid="purchases-table"]').should("be.visible");
  });
});
