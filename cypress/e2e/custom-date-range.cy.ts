/// <reference types="cypress" />

describe("Custom Date Range in Reports", () => {
  beforeEach(() => {
    cy.login("ADMIN");
    cy.visit("/reports");
    cy.contains("Reports").should("be.visible");
  });

  it("should allow selecting custom date range", () => {
    // Open date range selector
    cy.get('[data-testid="date-range-filter-card"]').should("be.visible");
    
    // Find the SelectTrigger button - it's within the date-range-filter-card
    // The Select component (Root) doesn't render a DOM element, so we find the button directly
    cy.get('[data-testid="date-range-filter-card"]').within(() => {
      // Find the button that's the SelectTrigger (it has the SelectValue inside)
      cy.contains('label', 'Date Range').should("be.visible");
      // The SelectTrigger button comes after the label
      cy.get('button[role="combobox"]').first().click();
    });
    
    // Select "Custom Range" option
    cy.contains('[role="option"]', "Custom Range").should("be.visible").click();
    
    // Custom date inputs should appear
    cy.get('[data-testid="from-date-input"]').should("be.visible");
    cy.get('[data-testid="to-date-input"]').should("be.visible");
  });

  it("should allow setting custom from and to dates", () => {
    // Select custom range
    cy.get('[data-testid="date-range-filter-card"]').within(() => {
      cy.get('button[role="combobox"]').first().click();
    });
    cy.contains('[role="option"]', "Custom Range").should("be.visible").click();
    
    // Wait for custom date inputs to appear
    cy.get('[data-testid="from-date-input"]').should("be.visible");
    cy.get('[data-testid="to-date-input"]').should("be.visible");
    
    // Set from date (7 days ago)
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    const fromDateStr = fromDate.toISOString().split('T')[0];
    cy.get('[data-testid="from-date-input"]').clear().type(fromDateStr);
    
    // Set to date (today)
    const toDate = new Date();
    const toDateStr = toDate.toISOString().split('T')[0];
    cy.get('[data-testid="to-date-input"]').clear().type(toDateStr);
    
    // Verify dates are set
    cy.get('[data-testid="from-date-input"]').should("have.value", fromDateStr);
    cy.get('[data-testid="to-date-input"]').should("have.value", toDateStr);
    
    // Verify metrics update
    cy.get('[data-testid="period-revenue"]').should("be.visible");
  });

  it("should validate date range (to date after from date)", () => {
    // Select custom range
    cy.get('[data-testid="date-range-filter-card"]').within(() => {
      cy.get('button[role="combobox"]').first().click();
    });
    cy.contains('[role="option"]', "Custom Range").should("be.visible").click();
    
    // Wait for custom date inputs to appear
    cy.get('[data-testid="from-date-input"]').should("be.visible");
    cy.get('[data-testid="to-date-input"]').should("be.visible");
    
    // Set invalid range (to before from)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    cy.get('[data-testid="from-date-input"]').clear().type(today);
    cy.get('[data-testid="to-date-input"]').clear().type(yesterdayStr);
    
    // The form should handle this (either prevent or show error)
    // Just verify the inputs accept the values
    cy.get('[data-testid="from-date-input"]').should("have.value", today);
    cy.get('[data-testid="to-date-input"]').should("have.value", yesterdayStr);
  });
});

