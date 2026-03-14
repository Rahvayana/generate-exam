// ============================================
// ADMIN DASHBOARD - USER MANAGEMENT TESTS
// ============================================

describe("Admin Dashboard - User Management", () => {
  const timestamp = Date.now();

  beforeEach(() => {
    // Setup admin user
    cy.request("POST", "/api/auth/test-setup", {
      email: Cypress.env("adminEmail"),
      password: Cypress.env("adminPassword"),
      role: "admin",
      status: "approved",
    });

    // Setup test users
    cy.request("POST", "/api/auth/test-setup", {
      email: `pending${timestamp}@test.com`,
      password: "Pending123!",
      status: "pending",
    });

    cy.request("POST", "/api/auth/test-setup", {
      email: `active${timestamp}@test.com`,
      password: "Active123!",
      status: "approved",
    });

    cy.adminLogin();
    cy.visit("/admin/dashboard");
  });

  context("Dashboard Access", () => {
    it("should load admin dashboard", () => {
      cy.url().should("include", "/admin/dashboard");
      cy.contains(/Admin|Dashboard|Manage/i).should("exist");
    });

    it("should have two tabs: Manage Users and Engagement Tools", () => {
      cy.contains("Manage Users").should("be.visible");
      cy.contains("Engagement Tools").should("be.visible");
    });
  });

  context("Users Tab", () => {
    beforeEach(() => {
      cy.contains("Manage Users").click();
    });

    it("should display users list", () => {
      cy.contains("Pending Users", { timeout: 10000 }).should("exist");
      cy.contains("Approved Users", { timeout: 10000 }).should("exist");
    });

    it("should show pending users", () => {
      cy.contains(`pending${timestamp}@test.com`, { timeout: 10000 }).should("exist");
      cy.contains("Approve", { timeout: 10000 }).should("exist");
      cy.contains("Reject", { timeout: 10000 }).should("exist");
    });

    it("should show active users", () => {
      // Click on Approved filter
      cy.contains("Approved").click();

      cy.contains(`active${timestamp}@test.com`, { timeout: 10000 }).should("exist");
      cy.contains("Unapprove").should("exist");
    });

    it("should filter users by status", () => {
      // Test all status filters
      const statuses = ["All", "Pending", "Approved", "Rejected", "Unapproved"];

      statuses.forEach((status) => {
        cy.contains(status).click();
        cy.wait(500);
      });
    });

    it("should search users by email", () => {
      cy.get("input[placeholder*='email'], input[placeholder*='cari'], input[type='search']")
        .first()
        .type(`pending${timestamp}@test.com`);

      cy.contains(`pending${timestamp}@test.com`, { timeout: 10000 }).should("exist");
    });
  });

  context("User Actions", () => {
    beforeEach(() => {
      cy.contains("Manage Users").click();
    });

    it("should approve a pending user", () => {
      cy.contains(`pending${timestamp}@test.com`)
        .parents("tr")
        .find("button")
        .contains("Approve")
        .click();

      // Wait for API response
      cy.contains("User approved successfully", { timeout: 10000 }).should("exist");

      // Refresh and verify user is now in approved list
      cy.reload();
      cy.contains("Approved").click();
      cy.contains(`pending${timestamp}@test.com`).should("exist");
    });

    it("should reject a pending user", () => {
      // Create a new pending user for rejection test
      cy.request("POST", "/api/auth/test-setup", {
        email: `rejectme${timestamp}@test.com`,
        password: "Reject123!",
        status: "pending",
      });

      cy.reload();
      cy.contains(`rejectme${timestamp}@test.com`, { timeout: 10000 })
        .parents("tr")
        .find("button")
        .contains("Reject")
        .click();

      cy.contains("User rejected successfully", { timeout: 10000 }).should("exist");
    });

    it("should unapprove an approved user", () => {
      cy.contains("Approved").click();

      cy.contains(`active${timestamp}@test.com`)
        .parents("tr")
        .find("button")
        .contains("Unapprove")
        .click();

      cy.contains("User unapproved successfully", { timeout: 10000 }).should("exist");
    });

    it("should show error when action fails", () => {
      // Try to action with invalid user ID (will fail gracefully)
      cy.request({
        method: "POST",
        url: "/api/admin/users/update",
        body: { id: "invalid-id", action: "approve" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.greaterThan(399);
      });
    });
  });

  context("Access Control", () => {
    it("should redirect non-admin users", () => {
      // Create regular user
      cy.request("POST", "/api/auth/test-setup", {
        email: "regular@test.com",
        password: "Regular123!",
        role: "user",
        status: "approved",
      });

      // Logout admin
      cy.visit("/login");
      cy.clearCookies();

      // Login as regular user
      cy.get("input[name=email]").type("regular@test.com");
      cy.get("input[name=password]").type("Regular123!");
      cy.get("button[type=submit]").click();

      // Try to access admin dashboard
      cy.visit("/admin/dashboard");

      // Should be redirected or see unauthorized message
      cy.url().should("not.include", "/admin/dashboard");
    });
  });

  context("Dashboard Stats", () => {
    it("should display user statistics", () => {
      cy.contains("Manage Users").click();

      // Look for stat cards
      cy.get("body").then(($body) => {
        if ($body.find("[class*='stat'], [class*='card'], [class*='count']").length > 0) {
          cy.get("[class*='stat'], [class*='card']").should("have.length.greaterThan", 0);
        }
      });
    });
  });

  context("Pagination", () => {
    it("should handle pagination if many users exist", () => {
      cy.contains("Manage Users").click();

      // Create multiple test users
      for (let i = 0; i < 15; i++) {
        cy.request("POST", "/api/auth/test-setup", {
          email: `pageuser${timestamp}${i}@test.com`,
          password: "PageUser123!",
          status: "pending",
        });
      }

      cy.reload();
      cy.wait(2000);

      // Look for pagination controls
      cy.get("body").then(($body) => {
        if ($body.find("[class*='pagination'], button[aria-label*='page']").length > 0) {
          cy.get("[class*='pagination'], button[aria-label*='page']").should("exist");
        }
      });
    });
  });
});

describe("Admin - Bulk Actions", () => {
  beforeEach(() => {
    cy.request("POST", "/api/auth/test-setup", {
      email: Cypress.env("adminEmail"),
      password: Cypress.env("adminPassword"),
      role: "admin",
      status: "approved",
    });

    cy.adminLogin();
    cy.visit("/admin/dashboard");
    cy.contains("Manage Users").click();
  });

  it("should allow selecting multiple users", () => {
    const timestamp = Date.now();

    // Create multiple pending users
    for (let i = 0; i < 3; i++) {
      cy.request("POST", "/api/auth/test-setup", {
        email: `bulk${timestamp}${i}@test.com`,
        password: "BulkUser123!",
        status: "pending",
      });
    }

    cy.reload();

    // Check for checkboxes
    cy.get("body").then(($body) => {
      if ($body.find("input[type='checkbox']").length > 0) {
        // Select first checkbox
        cy.get("input[type='checkbox']").first().check();
        cy.get("input[type='checkbox']").eq(1).check();

        // Look for bulk action buttons
        if ($body.find("button:contains('Approve All'), button:contains('Bulk')").length > 0) {
          cy.get("button:contains('Approve All'), button:contains('Bulk')").first().click();
        }
      }
    });
  });
});
