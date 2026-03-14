// ============================================
// CYPRESS E2E SUPPORT FILE
// ============================================

import "./commands";

// Global before/after hooks
beforeEach(() => {
  // Clear cookies and localStorage before each test
  cy.clearCookies();
  cy.clearLocalStorage();
});

// Uncaught exception handling
Cypress.on("uncaught:exception", (err) => {
  // Return false to prevent Cypress from failing the test
  // Useful for handling expected errors
  if (err.message.includes("API Key")) {
    return false;
  }
  return true;
});

// Console error logging
Cypress.on("fail", (error) => {
  console.error("Test failed:", error.message);
});

// Add custom timeouts
const DEFAULT_TIMEOUT = 10000;
const API_TIMEOUT = 30000;

export {};
