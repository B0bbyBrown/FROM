/// <reference types="cypress" />

describe("Role-Based Access Control", () => {
  it("should redirect ADMIN to dashboard after login", () => {
    cy.visit("/login");
    cy.get('#email').type('admin@pizzatruck.com');
    cy.get('#password').type('password');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should("include", "/dashboard");
    cy.contains("Dashboard").should("be.visible");
  });

  it("should redirect CASHIER to sessions after login", () => {
    cy.visit("/login");
    cy.get('#email').type('cashier@pizzatruck.com');
    cy.get('#password').type('password');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to sessions (as per App.tsx logic)
    cy.url().should("include", "/sessions");
    cy.contains("Cash Sessions").should("be.visible");
  });

  it("should redirect KITCHEN to kitchen after login", () => {
    cy.visit("/login");
    cy.get('#email').type('kitchen@pizzatruck.com');
    cy.get('#password').type('password');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to kitchen
    cy.url().should("include", "/kitchen");
    cy.contains("Kitchen").should("be.visible");
  });

  it("should prevent CASHIER from accessing admin routes", () => {
    cy.login("CASHIER");
    
    // Try to access admin-only routes
    cy.visit("/users");
    // Should redirect to dashboard or sessions
    cy.url().should("satisfy", (url) => {
      return url.includes("/dashboard") || url.includes("/sessions");
    });
    
    cy.visit("/expenses");
    cy.url().should("satisfy", (url) => {
      return url.includes("/dashboard") || url.includes("/sessions");
    });
    
    cy.visit("/reports");
    cy.url().should("satisfy", (url) => {
      return url.includes("/dashboard") || url.includes("/sessions");
    });
  });

  it("should prevent KITCHEN from accessing non-kitchen routes", () => {
    cy.login("KITCHEN");
    
    // Try to access other routes
    cy.visit("/dashboard");
    // Should redirect to kitchen
    cy.url().should("include", "/kitchen");
    
    cy.visit("/sales");
    cy.url().should("include", "/kitchen");
    
    cy.visit("/sessions");
    cy.url().should("include", "/kitchen");
  });

  it("should allow ADMIN to access all routes", () => {
    cy.login("ADMIN");
    
    // Should be able to access all routes
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
    
    cy.visit("/users");
    cy.url().should("include", "/users");
    
    cy.visit("/expenses");
    cy.url().should("include", "/expenses");
    
    cy.visit("/reports");
    cy.url().should("include", "/reports");
    
    cy.visit("/purchases");
    cy.url().should("include", "/purchases");
    
    cy.visit("/raw-materials");
    cy.url().should("include", "/raw-materials");
  });

  it("should redirect unauthenticated users to login", () => {
    // Clear session
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Try to access protected route
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
    
    cy.visit("/reports");
    cy.url().should("include", "/login");
  });

  it("should allow logout and redirect to login", () => {
    cy.login("ADMIN");
    cy.visit("/dashboard");
    
    // Click logout button
    cy.get('[data-testid="logout-button"]').click();
    
    // Should redirect to login
    cy.url().should("include", "/login");
    cy.contains("Login").should("be.visible");
  });
});

