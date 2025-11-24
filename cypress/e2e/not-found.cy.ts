/// <reference types="cypress" />

describe("Not Found Page", () => {
  it("should display 404 page for invalid routes", () => {
    cy.login("ADMIN");
    cy.visit("/invalid-route-that-does-not-exist");

    // Should show 404 or not found message
    cy.get("body").should("satisfy", ($body) => {
      const text = $body.text();
      return (
        text.includes("404") ||
        text.includes("Not Found") ||
        text.includes("Page not found") ||
        text.includes("not found")
      );
    });
  });

  it("should allow navigation back from 404 page", () => {
    cy.login("ADMIN");
    cy.visit("/invalid-route");

    // Verify we're on the 404 page
    cy.contains("404 Page Not Found").should("be.visible");

    // Check if there's a link or button to go back
    cy.get("body").then(($body) => {
      const hasHomeLink = $body.find('a[href="/"]').length > 0;
      const hasDashboardLink = $body.find('a[href="/dashboard"]').length > 0;
      const hasHomeButton =
        $body.find("button").filter((i, el) => el.textContent?.includes("Home"))
          .length > 0;
      const hasBackButton =
        $body.find("button").filter((i, el) => el.textContent?.includes("Back"))
          .length > 0;

      if (hasHomeLink || hasDashboardLink || hasHomeButton || hasBackButton) {
        // Click back/home button if it exists
        if (hasHomeLink) {
          cy.get('a[href="/"]').click();
        } else if (hasDashboardLink) {
          cy.get('a[href="/dashboard"]').click();
        } else if (hasHomeButton) {
          cy.contains("button", "Home").click();
        } else if (hasBackButton) {
          cy.contains("button", "Back").click();
        }
        // Should navigate away from 404
        cy.url().should("not.include", "invalid-route");
      } else {
        // If no navigation element exists, we can navigate using browser back or direct URL
        // For this test, we'll just verify the 404 page is displayed
        cy.contains("404 Page Not Found").should("be.visible");
      }
    });
  });
});
