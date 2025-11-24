/// <reference types="cypress" />

describe("Navigation Tests", () => {
  beforeEach(() => {
    cy.login("ADMIN");
  });

  it("should navigate between main pages", () => {
    // Start at dashboard
    cy.visit("/dashboard");
    cy.contains("Dashboard").should("be.visible");

    // Navigate to purchases
    cy.get('[data-testid="nav-link-purchases"]').click();
    cy.url().should("include", "/purchases");
    cy.contains("Purchases").should("be.visible");

    // Navigate to raw materials
    cy.get('[data-testid="nav-link-raw-materials"]').click();
    cy.url().should("include", "/raw-materials");
    cy.contains("Raw Materials").should("be.visible");

    // Navigate to reports
    cy.get('[data-testid="nav-link-reports"]').click();
    cy.url().should("include", "/reports");
    cy.contains("Reports").should("be.visible");

    // Navigate to expenses
    cy.get('[data-testid="nav-link-expenses"]').click();
    cy.url().should("include", "/expenses");
    cy.contains("Expenses").should("be.visible");

    // Navigate to users
    cy.get('[data-testid="nav-link-users"]').click();
    cy.url().should("include", "/users");
    cy.contains("User Management").should("be.visible");

    // Navigate back to dashboard
    cy.get('[data-testid="nav-link-dashboard"]').click();
    cy.url().should("include", "/dashboard");
  });

  it("should navigate using quick actions", () => {
    // Quick sale button navigates to /sales, which requires CASHIER or DEV role
    cy.login("CASHIER");
    cy.visit("/dashboard");
    
    // Wait for dashboard to load
    cy.url({ timeout: 10000 }).should("include", "/dashboard");
    
    // Check for quick sale button
    cy.get('[data-testid="quick-sale-button"]', { timeout: 10000 }).should("be.visible");
    cy.get('[data-testid="quick-sale-button"]').click();
    
    // Wait for navigation to sales page
    cy.url({ timeout: 10000 }).should("include", "/sales");
    
    // Wait for page to load - the sales page shows different content based on session state
    // If there's an active session, it shows "Point of Sale"
    // If there's no active session, it shows "No Active Cash Session"
    // Check for either to verify navigation worked
    cy.get("body", { timeout: 10000 }).then(($body) => {
      const bodyText = $body.text();
      const hasPointOfSale = bodyText.includes("Point of Sale");
      const hasNoSession = bodyText.includes("No Active Cash Session");
      
      if (hasPointOfSale) {
        cy.contains("Point of Sale").should("be.visible");
      } else if (hasNoSession) {
        cy.contains("No Active Cash Session").should("be.visible");
      } else {
        // Fallback: just verify we're on the sales page by URL
        cy.url().should("include", "/sales");
      }
    });
  });

  it("should navigate from KPI cards", () => {
    cy.visit("/dashboard");
    
    // Click revenue KPI card
    cy.get('[data-testid="kpi-revenue"]').click();
    cy.url().should("include", "/reports");
    
    // Go back and click margin card
    cy.visit("/dashboard");
    cy.get('[data-testid="kpi-margin"]').click();
    cy.url().should("include", "/reports");
  });

  it("should maintain navigation state on page refresh", () => {
    cy.visit("/reports");
    cy.reload();
    cy.url().should("include", "/reports");
    cy.contains("Reports").should("be.visible");
  });
});

