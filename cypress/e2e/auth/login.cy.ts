// ============================================
// LOGIN PAGE TESTS
// ============================================

import { testUsers } from "../../fixtures/test-data.json";

describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  context("Page Load", () => {
    it("should display login page correctly", () => {
      cy.get("h1, h2").contains(/Masuk|Login|Sign In/i).should("exist");
      cy.get("input[name=email]").should("be.visible");
      cy.get("input[name=password]").should("be.visible");
      cy.get("button[type=submit]").should("be.visible");
    });

    it("should have register link", () => {
      cy.contains("Belum punya akun, Register").should("exist");
      cy.contains("Register, daftar").should("exist");
    });
  });

  context("Form Validation", () => {
    it("should show error for empty email", () => {
      cy.get("input[name=password]").type("Test123!");
      cy.get("button[type=submit]").click();
      cy.contains(/email|required/i).should("exist");
    });

    it("should show error for empty password", () => {
      cy.get("input[name=email]").type("test@test.com");
      cy.get("button[type=submit]").click();
      cy.contains(/password|required/i).should("exist");
    });

    it("should show error for invalid email format", () => {
      cy.get("input[name=email]").type("invalid-email");
      cy.get("input[name=password]").type("Test123!");
      cy.get("button[type=submit]").click();
      cy.contains(/email|invalid/i).should("exist");
    });

    it("should show error for wrong credentials", () => {
      cy.get("input[name=email]").type("wrong@test.com");
      cy.get("input[name=password]").type("WrongPass123!");
      cy.get("button[type=submit]").click();
      cy.contains(/invalid|credentials|salah/i, { timeout: 10000 }).should("exist");
    });
  });

  context("Successful Login", () => {
    it("should login successfully with valid credentials", () => {
      // This test requires a pre-existing approved user
      // For CI/CD, create the user via API first
      cy.request("POST", "/api/auth/test-setup", {
        email: Cypress.env("testUserEmail"),
        password: Cypress.env("testUserPassword"),
        status: "approved",
      }).then(() => {
        cy.login();
        cy.url().should("not.include", "/login");
        cy.url().should("eq", Cypress.config("baseUrl") + "/");
      });
    });
  });

  context("User Status Restrictions", () => {
    it("should not allow pending users to login", () => {
      cy.request("POST", "/api/auth/test-setup", {
        email: "pending@test.com",
        password: "Pending123!",
        status: "pending",
      });

      cy.visit("/login");
      cy.get("input[name=email]").type("pending@test.com");
      cy.get("input[name=password]").type("Pending123!");
      cy.get("button[type=submit]").click();

      cy.contains(/pending|disetujui|menunggu/i).should("exist");
      cy.url().should("include", "/login");
    });

    it("should not allow rejected users to login", () => {
      cy.request("POST", "/api/auth/test-setup", {
        email: "rejected@test.com",
        password: "Rejected123!",
        status: "rejected",
      });

      cy.visit("/login");
      cy.get("input[name=email]").type("rejected@test.com");
      cy.get("input[name=password]").type("Rejected123!");
      cy.get("button[type=submit]").click();

      cy.contains(/rejected|ditolak/i).should("exist");
      cy.url().should("include", "/login");
    });
  });

  context("Navigation", () => {
    it("should navigate to register page", () => {
      cy.contains("Register").click();
      cy.url().should("include", "/register");
    });

    it("should redirect to home after successful login", () => {
      cy.request("POST", "/api/auth/test-setup", {
        email: Cypress.env("testUserEmail"),
        password: Cypress.env("testUserPassword"),
        status: "approved",
      });

      cy.login();
      cy.url().should("not.include", "/login");
      cy.get("h1, h2").should("exist");
    });
  });

  context("Remember Me", () => {
    it("should remember user after page reload if session exists", () => {
      cy.request("POST", "/api/auth/test-setup", {
        email: Cypress.env("testUserEmail"),
        password: Cypress.env("testUserPassword"),
        status: "approved",
      });

      cy.login();
      cy.reload();
      cy.url().should("not.include", "/login");
    });
  });
});

describe("Session Management", () => {
  beforeEach(() => {
    cy.request("POST", "/api/auth/test-setup", {
      email: Cypress.env("testUserEmail"),
      password: Cypress.env("testUserPassword"),
      status: "approved",
    });
  });

  it("should maintain session across pages", () => {
    cy.login();
    cy.visit("/tools/rpp");
    cy.url().should("include", "/tools/rpp");
    cy.visit("/tools/lkpd");
    cy.url().should("include", "/tools/lkpd");
    cy.visit("/admin/dashboard");
    cy.contains(/unauthorized|forbidden/i).should("exist");
  });

  it("should redirect to login when accessing protected routes without session", () => {
    cy.clearCookies();
    cy.visit("/tools/rpp");
    cy.url().should("include", "/login");
  });
});
