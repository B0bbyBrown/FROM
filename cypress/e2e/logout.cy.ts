/// <reference types="cypress" />

describe("Logout Functionality", () => {
  it("should logout and redirect to login", () => {
    cy.login("ADMIN");
    cy.visit("/dashboard");
    
    // Verify we're logged in
    cy.contains("Dashboard").should("be.visible");
    
    // Click logout
    cy.get('[data-testid="logout-button"]').click();
    
    // Should redirect to login
    cy.url().should("include", "/login");
    cy.contains("Login").should("be.visible");
  });

  it("should prevent access to protected routes after logout", () => {
    cy.login("ADMIN");
    cy.visit("/dashboard");
    
    // Wait for page to load and verify we're logged in
    // Check URL first to ensure we're not redirected to login
    cy.url({ timeout: 10000 }).should("include", "/dashboard");
    // Wait for user to be loaded - check for logout button or user name
    // The dashboard returns null if user isn't loaded yet
    cy.get('[data-testid="logout-button"]', { timeout: 10000 }).should("be.visible");
    // Now check for Dashboard content
    cy.contains("Dashboard", { timeout: 10000 }).should("be.visible");
    
    // Logout
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should("include", "/login");
    cy.contains("Login").should("be.visible");
    
    // Try to access protected route directly
    cy.visit("/dashboard", { failOnStatusCode: false });
    // Should redirect back to login
    cy.url().should("include", "/login");
    // Verify we're still on login page (not dashboard)
    cy.contains("Login").should("be.visible");
    cy.contains("Dashboard").should("not.exist");
  });

  it("should clear session data on logout", () => {
    cy.login("ADMIN");
    cy.visit("/dashboard");
    
    // Wait for page to load and verify we're logged in
    // Check URL first to ensure we're not redirected to login
    cy.url({ timeout: 10000 }).should("include", "/dashboard");
    // Wait for user to be loaded - check for logout button or user name
    // The dashboard returns null if user isn't loaded yet
    cy.get('[data-testid="logout-button"]', { timeout: 10000 }).should("be.visible");
    // Now check for Dashboard content
    cy.contains("Dashboard", { timeout: 10000 }).should("be.visible");
    cy.get('[data-testid="user-name"]').should("be.visible");
    
    // Logout
    cy.get('[data-testid="logout-button"]').click();
    
    // After logout, should be redirected to login page
    cy.url().should("include", "/login");
    cy.contains("Login").should("be.visible");
    
    // User info should not be visible on login page
    cy.get('[data-testid="user-name"]').should("not.exist");
    // Verify we're on login page, not dashboard
    cy.contains("Dashboard").should("not.exist");
  });
});

