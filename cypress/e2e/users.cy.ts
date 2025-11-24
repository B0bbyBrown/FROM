/// <reference types="cypress" />

describe("Users Page", () => {
  beforeEach(() => {
    cy.login("ADMIN");
    cy.visit("/users");
    cy.contains("User Management").should("be.visible");
  });

  it("should display the users page", () => {
    // Check for user creation form
    cy.get('form').should("be.visible");
    // Inputs don't have IDs, so find by label or type
    cy.contains('label', 'Email').should("be.visible");
    cy.contains('label', 'Password').should("be.visible");
    cy.get('input[type="password"]').should("have.length.at.least", 1);
    cy.get('button[type="submit"]').should("contain", "Create User");
  });

  it("should display users table", () => {
    // Users table should be visible
    cy.get('table').should("be.visible");
    cy.get('th').contains("Name").should("be.visible");
    cy.get('th').contains("Email").should("be.visible");
    cy.get('th').contains("Role").should("be.visible");
  });

  it("should allow creating a new user", () => {
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@test.com`;
    
    // Fill in user creation form
    // Email is the first input that's not a password field
    cy.get('form').within(() => {
      cy.get('input').not('[type="password"]').first().type(testEmail);
      // Password is the first password input
      cy.get('input[type="password"]').first().type("password123");
      // Confirm password is the second password input
      cy.get('input[type="password"]').last().type("password123");
      // Name is the second non-password input (after email)
      cy.get('input').not('[type="password"]').last().type("Test User");
    });
    
    // Select role
    cy.get('button[role="combobox"]').click();
    cy.contains('[role="option"]', "Cashier").should("be.visible").click();
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for mutation to complete - button text might change or form resets
    cy.wait(2000);
    // Verify user appears in table (check for email)
    cy.contains("td", testEmail).should("be.visible");
  });

  it("should show error for password mismatch", () => {
    // Fill in user creation form
    cy.get('form').within(() => {
      // Email is the first input that's not a password field
      cy.get('input').not('[type="password"]').first().type("test@example.com");
      // Password is the first password input
      cy.get('input[type="password"]').first().type("password123");
      // Confirm password is the second password input (with different value)
      cy.get('input[type="password"]').last().type("different");
    });
    
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.contains("Passwords do not match").should("be.visible");
  });

  it("should display edit and delete buttons for users", () => {
    // Check if users exist in table
    cy.get('table tbody tr').then(($rows) => {
      if ($rows.length > 0) {
        // Verify action buttons exist
        cy.get('table tbody tr').first().within(() => {
          cy.get('button').should("have.length.at.least", 1);
        });
      }
    });
  });
});

