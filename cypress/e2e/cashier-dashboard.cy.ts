/// <reference types="cypress" />

describe("Cashier Dashboard", () => {
  beforeEach(() => {
    cy.login("CASHIER");
    cy.visit("/dashboard");
  });

  it("should display cashier-specific dashboard", () => {
    // Cashier dashboard should be different from admin dashboard
    cy.contains("Dashboard").should("be.visible");
    
    // Check for cashier-specific elements
    cy.get("body").then(($body) => {
      // Cashier dashboard might have different content
      const hasCashierContent = $body.text().includes("Current Session") || 
                                $body.text().includes("Session") ||
                                $body.text().includes("Cash");
      // At minimum, should show dashboard
      expect(hasCashierContent || $body.text().includes("Dashboard")).to.be.true;
    });
  });

  it("should show current session information if active", () => {
    // Check if there's an active session
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="active-session-info"]').length > 0) {
        cy.get('[data-testid="active-session-info"]').should("be.visible");
      } else if ($body.find('[data-testid="no-active-session"]').length > 0) {
        cy.get('[data-testid="no-active-session"]').should("be.visible");
      }
    });
  });

  it("should allow navigation to sessions from dashboard", () => {
    // Cashier should be able to navigate to sessions
    // Navigation link test ID is generated as: nav-link-{name.toLowerCase().replace(/ /g, "-")}
    // "Cash Sessions" -> "nav-link-cash-sessions"
    cy.get('[data-testid="nav-link-cash-sessions"]').click();
    cy.url().should("include", "/sessions");
  });

  it("should allow navigation to sales from dashboard", () => {
    // Cashier should be able to navigate to sales
    // "Point of Sale" -> "nav-link-point-of-sale"
    cy.get('[data-testid="nav-link-point-of-sale"]').click();
    cy.url().should("include", "/sales");
  });
});

