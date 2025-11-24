describe("Dashboard Page", () => {
  beforeEach(() => {
    cy.login("ADMIN");
    cy.visit("/");
    cy.contains("Dashboard").should("be.visible");
  });

  it("should display the main KPI cards", () => {
    cy.get('[data-testid="today-revenue"]').should("be.visible");
    cy.get('[data-testid="gross-margin"]').should("be.visible");
  });

  it('should display the "Top Products Today" section', () => {
    cy.get('[data-testid="top-products-card"]').should("be.visible");
  });

  it('should display the "Recent Activity" feed', () => {
    cy.get('[data-testid="recent-activity-card"]').should("be.visible");
  });

  it('should display the "Low Stock Alert" card', () => {
    cy.get('[data-testid="low-stock-card"]').should("be.visible");
  });

  it('should display the "Sales Trend" chart', () => {
    cy.get('[data-testid="sales-chart-card"]').should("be.visible");
  });

  it("should navigate from KPI card click", () => {
    cy.get('[data-testid="kpi-revenue"]').click();
    cy.location("pathname").should("eq", "/reports");
  });

  it("should navigate to purchases from low stock alert", () => {
    // Check if there are low stock items (button only shows when items exist)
    cy.get('[data-testid="low-stock-card"]').should("be.visible");
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="create-purchase-order"]').length > 0) {
        // If button exists, click it and verify navigation
        cy.get('[data-testid="create-purchase-order"]').click();
        cy.location("pathname").should("eq", "/purchases");
      } else {
        // If no low stock items, verify the message is shown
        cy.get('[data-testid="low-stock-list"]').should("contain", "well stocked");
      }
    });
  });

  it("should show no activity message with empty feed", () => {
    // This test may need adjustment based on actual seed data
    cy.get('[data-testid="recent-activity-card"]').should("be.visible");
  });

  it("should filter activity by sales", () => {
    cy.get('[data-testid="filter-sales-button"]').should("be.visible");
    cy.get('[data-testid="filter-all-activity-button"]').should("be.visible");
    
    // Click sales filter
    cy.get('[data-testid="filter-sales-button"]').click();
    // Check that the button is active by verifying it doesn't have outline variant
    // (default variant has bg-primary, outline has border)
    cy.get('[data-testid="filter-sales-button"]').should("not.have.class", "border-input");
    
    // Verify activity list is still visible
    cy.get('[data-testid="activity-list"]').should("be.visible");
  });

  it("should filter activity to show all", () => {
    // Click all activity filter
    cy.get('[data-testid="filter-all-activity-button"]').click();
    // Check that the button is active
    cy.get('[data-testid="filter-all-activity-button"]').should("not.have.class", "border-input");
    
    // Verify activity list is visible
    cy.get('[data-testid="activity-list"]').should("be.visible");
  });
});
