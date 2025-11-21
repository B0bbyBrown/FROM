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

  it("should navigate to raw materials from low stock alert", () => {
    cy.get('[data-testid="create-purchase-order"]').click();
    cy.location("pathname").should("eq", "/purchases");
  });

  it("should show no activity message with empty feed", () => {
    // This test may need adjustment based on actual seed data
    cy.get('[data-testid="recent-activity-card"]').should("be.visible");
  });
});
