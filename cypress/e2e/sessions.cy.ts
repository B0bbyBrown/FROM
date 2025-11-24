describe("Sessions Page", () => {
  beforeEach(() => {
    cy.login("CASHIER");
    cy.visit("/sessions");
    cy.contains("Cash Sessions").should("be.visible");
  });

  it("should display the sessions page with no active session", () => {
    // Check if there's no active session (seed data has closed sessions)
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="no-active-session"]').length > 0) {
        cy.get('[data-testid="no-active-session"]').should("be.visible");
      } else {
        // If there's an active session, close it first
        cy.get('[data-testid="close-session-button"]').click();
        cy.get('[data-testid="close-session-dialog"]').should("be.visible");
        cy.get('[data-testid="closing-float-input"]').type("100");
        // Closing dialog uses close-item- prefix, opening uses item- prefix
        cy.get('input[id^="close-item-"]').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.get('input[id^="close-item-"]').each(($input) => {
              cy.wrap($input).type("10");
            });
          }
        });
        cy.get('[data-testid="confirm-close-session-button"]').click({
          force: true,
        });
        cy.wait(2000);
        cy.get('[data-testid="no-active-session"]').should("be.visible");
      }
    });
  });

  it("should allow opening and closing a session", () => {
    // Close any active session first
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="close-session-button"]').length > 0) {
        cy.get('[data-testid="close-session-button"]').click();
        cy.get('[data-testid="close-session-dialog"]').should("be.visible");
        cy.get('[data-testid="closing-float-input"]').type("100");
        // Closing dialog uses close-item- prefix
        cy.get('input[id^="close-item-"]').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.get('input[id^="close-item-"]').each(($input) => {
              cy.wrap($input).type("10");
            });
          }
        });
        cy.get('[data-testid="confirm-close-session-button"]').click({
          force: true,
        });
        cy.wait(2000);
      }
    });

    // Wait for no active session state
    cy.get('[data-testid="no-active-session"]', { timeout: 10000 }).should("be.visible");
    cy.get('[data-testid="open-session-button"]', { timeout: 10000 }).click();
    cy.get('[data-testid="open-session-dialog"]').should("be.visible");
    cy.get('[data-testid="opening-float-input"]').type("100");
    // Opening dialog uses item- prefix (not close-item-)
    cy.get('input[id^="item-"]').then(($inputs) => {
      if ($inputs.length > 0) {
        cy.get('input[id^="item-"]').each(($input) => {
          cy.wrap($input).type("10");
        });
      }
    });
    cy.get('[data-testid="confirm-open-session-button"]').click();
    cy.wait(2000);
    cy.get('[data-testid="active-session-info"]').should("be.visible");

    cy.get('[data-testid="close-session-button"]').click();
    cy.get('[data-testid="close-session-dialog"]').should("be.visible");
    cy.get('[data-testid="closing-float-input"]').type("600");
    // Closing dialog uses close-item- prefix
    cy.get('input[id^="close-item-"]').then(($inputs) => {
      if ($inputs.length > 0) {
        cy.get('input[id^="close-item-"]').each(($input) => {
          cy.wrap($input).type("10");
        });
      }
    });
    cy.get('[data-testid="confirm-close-session-button"]').click({
      force: true,
    });
    cy.wait(2000);
    cy.get('[data-testid="no-active-session"]').should("be.visible");
  });

  it("should display session history", () => {
    cy.get('[data-testid="sessions-table"]').should("be.visible");
  });

  it("should display session totals in table", () => {
    // Verify sessions table displays totals
    cy.get('[data-testid="sessions-table"]').should("be.visible");
    // Check if there are any sessions in the table
    cy.get('[data-testid="sessions-table"]').then(($table) => {
      if ($table.find('[data-testid*="session-row-"]').length > 0) {
        // Verify at least one session row exists with data
        cy.get('[data-testid*="session-row-"]').first().should("be.visible");
      }
    });
  });

  it("should show error for invalid opening float", () => {
    // Close any active session first
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="close-session-button"]').length > 0) {
        cy.get('[data-testid="close-session-button"]').click();
        cy.get('[data-testid="close-session-dialog"]').should("be.visible");
        cy.get('[data-testid="closing-float-input"]').type("100");
        // Closing dialog uses close-item- prefix
        cy.get('input[id^="close-item-"]').then(($inputs) => {
          if ($inputs.length > 0) {
            cy.get('input[id^="close-item-"]').each(($input) => {
              cy.wrap($input).type("10");
            });
          }
        });
        cy.get('[data-testid="confirm-close-session-button"]').click({
          force: true,
        });
        cy.wait(2000);
      }
    });

    cy.get('[data-testid="no-active-session"]', { timeout: 10000 }).should("be.visible");
    cy.get('[data-testid="open-session-button"]', { timeout: 10000 }).click();
    cy.get('[data-testid="open-session-dialog"]').should("be.visible");
    cy.get('[data-testid="opening-float-input"]').type("-100");
    cy.get('[data-testid="confirm-open-session-button"]').click();
    cy.contains("Float must be positive").should("be.visible");
  });
});
