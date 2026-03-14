// ============================================
// REGISTER PAGE TESTS
// ============================================

describe("Register Page", () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Cypress Test ${timestamp}`,
    email: `cypress${timestamp}@test.com`,
    password: "Cypress123!",
  };

  beforeEach(() => {
    cy.visit("/register");
  });

  context("Page Load", () => {
    it("should display register page correctly", () => {
      cy.get("h1, h2").contains(/Daftar|Register|Sign Up/i).should("exist");
      cy.get("input[name=name]").should("be.visible");
      cy.get("input[name=email]").should("be.visible");
      cy.get("input[name=password]").should("be.visible");
      cy.get("button[type=submit]").should("be.visible");
    });

    it("should have login link", () => {
      cy.contains("Sudah punya akun, Login").should("exist");
      cy.contains("Login, masuk").should("exist");
    });
  });

  context("Form Validation", () => {
    it("should show error for empty name", () => {
      cy.get("input[name=email]").type("test@test.com");
      cy.get("input[name=password]").type("Test123!");
      cy.get("button[type=submit]").click();
      cy.contains(/nama|name|required/i).should("exist");
    });

    it("should show error for empty email", () => {
      cy.get("input[name=name]").type("Test User");
      cy.get("input[name=password]").type("Test123!");
      cy.get("button[type=submit]").click();
      cy.contains(/email|required/i).should("exist");
    });

    it("should show error for empty password", () => {
      cy.get("input[name=name]").type("Test User");
      cy.get("input[name=email]").type("test@test.com");
      cy.get("button[type=submit]").click();
      cy.contains(/password|required/i).should("exist");
    });

    it("should show error for invalid email format", () => {
      cy.get("input[name=name]").type("Test User");
      cy.get("input[name=email]").type("invalid-email");
      cy.get("input[name=password]").type("Test123!");
      cy.get("button[type=submit]").click();
      cy.contains(/email|invalid/i).should("exist");
    });

    it("should show error for weak password", () => {
      cy.get("input[name=name]").type("Test User");
      cy.get("input[name=email]").type("test@test.com");
      cy.get("input[name=password]").type("123");
      cy.get("button[type=submit]").click();
      cy.contains(/password|minimal|characters/i).should("exist");
    });
  });

  context("Successful Registration", () => {
    it("should register successfully with valid data", () => {
      cy.get("input[name=name]").type(testUser.name);
      cy.get("input[name=email]").type(testUser.email);
      cy.get("input[name=password]").type(testUser.password);
      cy.get("button[type=submit]").click();

      // Should redirect to dashboard or show pending message
      cy.contains(/menunggu|pending|approval|disetujui/i, { timeout: 10000 }).should("exist");
    });

    it("should show pending status message after registration", () => {
      cy.get("input[name=name]").type(`User ${timestamp}`);
      cy.get("input[name=email]").type(`user${timestamp}@test.com`);
      cy.get("input[name=password]").type("User123!");
      cy.get("button[type=submit]").click();

      cy.contains(/akun anda menunggu|pending approval|menunggu persetujuan/i).should("exist");
    });
  });

  context("Duplicate Email", () => {
    it("should reject duplicate email registration", () => {
      // First registration
      cy.get("input[name=name]").type(`User ${timestamp}`);
      cy.get("input[name=email]").type(`duplicate${timestamp}@test.com`);
      cy.get("input[name=password]").type("User123!");
      cy.get("button[type=submit]").click();
      cy.contains(/menunggu|pending|approval/i).should("exist");

      // Try to register again with same email
      cy.visit("/register");
      cy.get("input[name=name]").type(`User ${timestamp}`);
      cy.get("input[name=email]").type(`duplicate${timestamp}@test.com`);
      cy.get("input[name=password]").type("User123!");
      cy.get("button[type=submit]").click();

      cy.contains(/already exists|sudah terdaftar|email sudah dipakai/i).should("exist");
    });
  });

  context("Navigation", () => {
    it("should navigate to login page", () => {
      cy.contains("Login").click();
      cy.url().should("include", "/login");
    });
  });

  context("Password Visibility Toggle", () => {
    it("should toggle password visibility", () => {
      cy.get("input[name=password]").type("Test123!");

      // Check if there's a toggle button
      cy.get("body").then(($body) => {
        if ($body.find("[data-testid=password-toggle], .eye-icon, svg").length > 0) {
          cy.get("[data-testid=password-toggle], .eye-icon, svg").first().click();
          cy.get("input[name=password]").should("have.attr", "type", "text");
        }
      });
    });
  });
});

describe("Registration Flow Integration", () => {
  it("should complete full registration flow", () => {
    const timestamp = Date.now();
    const newUser = {
      name: `Full User ${timestamp}`,
      email: `fulluser${timestamp}@test.com`,
      password: "FullUser123!",
    };

    // Navigate to register
    cy.visit("/");
    cy.contains("Register").click();
    cy.url().should("include", "/register");

    // Fill form
    cy.get("input[name=name]").type(newUser.name);
    cy.get("input[name=email]").type(newUser.email);
    cy.get("input[name=password]").type(newUser.password);
    cy.get("button[type=submit]").click();

    // Verify registration
    cy.contains(/menunggu|pending|approval/i, { timeout: 10000 }).should("exist");

    // Try to login (should fail - pending)
    cy.contains("Login").click();
    cy.get("input[name=email]").type(newUser.email);
    cy.get("input[name=password]").type(newUser.password);
    cy.get("button[type=submit]").click();
    cy.contains(/pending|menunggu/i).should("exist");
  });
});
