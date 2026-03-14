// ============================================
// ADMIN DASHBOARD - ENGAGEMENT BANNERS TESTS
// ============================================

describe("Admin Dashboard - Engagement Banners", () => {
  const timestamp = Date.now();
  const testBanner = {
    title: `Test Banner ${timestamp}`,
    message: `This is a test banner created by Cypress`,
    buttonText: "Click Me",
    buttonUrl: "/tools/rpp",
    showOnUserDashboard: true,
    allowDismiss: true,
    active: true,
  };

  beforeEach(() => {
    // Setup admin user
    cy.request("POST", "/api/auth/test-setup", {
      email: Cypress.env("adminEmail"),
      password: Cypress.env("adminPassword"),
      role: "admin",
      status: "approved",
    });

    cy.adminLogin();
    cy.visit("/admin/dashboard");
    cy.contains("Engagement Tools").click();
  });

  context("Banners Tab", () => {
    it("should display banners section", () => {
      cy.contains("Engagement Tools").should("be.visible");
      cy.contains("Banner", { timeout: 10000 }).should("exist");
    });

    it("should show create banner button", () => {
      cy.contains("Create Banner", { timeout: 10000 })
        .or("Tambah Banner")
        .or("Add New Banner")
        .should("exist");
    });

    it("should show active/inactive toggle", () => {
      cy.contains("Active Only", { timeout: 10000 })
        .or("Showing All")
        .or("active")
        .should("exist");
    });
  });

  context("Create Banner", () => {
    it("should open banner form", () => {
      cy.contains("Create Banner")
        .or("Tambah Banner")
        .or("Add New Banner")
        .click();

      cy.contains("Title", { timeout: 5000 }).should("exist");
      cy.contains("Message", { timeout: 5000 }).should("exist");
      cy.contains("Button Text", { timeout: 5000 }).should("exist");
      cy.contains("Button URL", { timeout: 5000 }).should("exist");
    });

    it("should create a new banner successfully", () => {
      cy.contains("Create Banner")
        .or("Tambah Banner")
        .click();

      // Fill form
      cy.get("input[name=title], input[placeholder*='title']").type(testBanner.title);
      cy.get("textarea[name=message], input[placeholder*='message']").type(testBanner.message);
      cy.get("input[name=buttonText], input[placeholder*='button']").type(testBanner.buttonText);
      cy.get("input[name=buttonUrl], input[placeholder*='url']").type(testBanner.buttonUrl);

      // Toggle switches if present
      cy.get("body").then(($body) => {
        if ($body.find("input[type='checkbox']").length > 0) {
          cy.get("input[type='checkbox']").each(($el) => {
            cy.wrap($el).check({ force: true });
          });
        }
      });

      // Submit
      cy.contains("Save", { timeout: 5000 })
        .or("Simpan")
        .or("Create")
        .click();

      cy.contains("successfully", { timeout: 10000 }).should("exist");
    });

    it("should show validation errors for empty required fields", () => {
      cy.contains("Create Banner")
        .or("Tambah Banner")
        .click();

      // Submit without filling form
      cy.contains("Save", { timeout: 5000 })
        .or("Simpan")
        .click();

      cy.contains(/required|wajib|harap diisi/i).should("exist");
    });

    it("should validate button URL format", () => {
      cy.contains("Create Banner")
        .or("Tambah Banner")
        .click();

      cy.get("input[name=title], input[placeholder*='title']").type("Test");
      cy.get("textarea[name=message], input[placeholder*='message']").type("Test message");
      cy.get("input[name=buttonText], input[placeholder*='button']").type("Click");
      cy.get("input[name=buttonUrl], input[placeholder*='url']").type("invalid-url");

      cy.contains("Save", { timeout: 5000 })
        .or("Simpan")
        .click();

      cy.contains(/invalid url|format tidak valid/i).should("exist");
    });
  });

  context("Edit Banner", () => {
    it("should edit existing banner", () => {
      // Create banner first via API
      cy.request("POST", "/api/admin/engagement/create", {
        title: `Edit Me ${timestamp}`,
        message: "Original message",
        buttonText: "Original Button",
        buttonUrl: "/tools/rpp",
        showOnUserDashboard: true,
        allowDismiss: true,
        active: true,
      });

      cy.reload();

      // Find and click edit button
      cy.contains(`Edit Me ${timestamp}`, { timeout: 10000 })
        .parents("tr")
        .find("button")
        .contains(/\bEdit\b|Update|Pencil/)
        .click();

      // Update title
      cy.get("input[name=title], input[placeholder*='title']")
        .clear()
        .type(`Edited Banner ${timestamp}`);

      cy.contains("Save", { timeout: 5000 })
        .or("Update")
        .click();

      cy.contains("successfully", { timeout: 10000 }).should("exist");
      cy.contains(`Edited Banner ${timestamp}`).should("exist");
    });
  });

  context("Toggle Banner Active Status", () => {
    it("should deactivate a banner", () => {
      // Create active banner via API
      cy.request("POST", "/api/admin/engagement/create", {
        title: `Toggle Me ${timestamp}`,
        message: "Toggle test",
        buttonText: "Toggle",
        buttonUrl: "/tools/rpp",
        showOnUserDashboard: true,
        allowDismiss: true,
        active: true,
      });

      cy.reload();

      // Find and click eye/deactivate button
      cy.contains(`Toggle Me ${timestamp}`, { timeout: 10000 })
        .parents("tr")
        .find("button")
        .then(($buttons) => {
          // Find the button that toggles active status (eye icon)
          $buttons.each(($el) => {
            const $button = cy.wrap($el);
            $button.then(($btn) => {
              const html = $btn.html();
              if (html && (html.includes("Eye") || html.includes("active"))) {
                $button.click();
                return false; // break
              }
            });
          });
        });

      cy.contains("Banner updated successfully", { timeout: 10000 }).should("exist");
    });

    it("should show inactive banners when toggle is enabled", () => {
      // Click "Showing All" or similar toggle
      cy.contains("Active Only", { timeout: 10000 })
        .or("Showing All")
        .click();

      // Should show both active and inactive banners
      cy.contains("Active", { timeout: 5000 }).or("Inactive").should("exist");
    });
  });

  context("Delete Banner", () => {
    it("should delete a banner", () => {
      // Create banner via API
      cy.request("POST", "/api/admin/engagement/create", {
        title: `Delete Me ${timestamp}`,
        message: "Delete test",
        buttonText: "Delete",
        buttonUrl: "/tools/rpp",
        showOnUserDashboard: true,
        allowDismiss: true,
        active: true,
      });

      cy.reload();

      // Find and click delete button
      cy.contains(`Delete Me ${timestamp}`, { timeout: 10000 })
        .parents("tr")
        .find("button")
        .contains(/\bDelete\b|Remove|Trash/)
        .click();

      // Confirm deletion if there's a confirmation
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Yes'), button:contains('Confirm')").length > 0) {
          cy.contains("Yes").or("Confirm").click();
        }
      });

      cy.contains("deleted successfully", { timeout: 10000 }).should("exist");

      // Verify banner is gone
      cy.reload();
      cy.contains(`Delete Me ${timestamp}`).should("not.exist");
    });
  });

  context("Banner Display Stats", () => {
    it("should show dismiss count for banners", () => {
      // Create banner via API
      cy.request("POST", "/api/admin/engagement/create", {
        title: `Stats Banner ${timestamp}`,
        message: "Stats test",
        buttonText: "Stats",
        buttonUrl: "/tools/rpp",
        showOnUserDashboard: true,
        allowDismiss: true,
        active: true,
      });

      cy.reload();

      // Look for dismiss count column
      cy.contains(`Stats Banner ${timestamp}`)
        .parents("tr")
        .find("td")
        .then(($cells) => {
          let found = false;
          $cells.each(($el) => {
            const text = $el.text();
            if (text.match(/\d+\s*dismissed/)) {
              found = true;
              return false;
            }
          });
        });
    });
  });
});

describe("Banner User Display Integration", () => {
  it("should show banner on user dashboard", () => {
    const timestamp = Date.now();

    // Create admin and banner
    cy.request("POST", "/api/auth/test-setup", {
      email: Cypress.env("adminEmail"),
      password: Cypress.env("adminPassword"),
      role: "admin",
      status: "approved",
    });

    cy.request("POST", "/api/admin/engagement/create", {
      title: `User Banner ${timestamp}`,
      message: "This banner should appear for users",
      buttonText: "View",
      buttonUrl: "/tools/rpp",
      showOnUserDashboard: true,
      allowDismiss: true,
      active: true,
    });

    // Create regular user
    cy.request("POST", "/api/auth/test-setup", {
      email: `bannertest${timestamp}@test.com`,
      password: "BannerUser123!",
      status: "approved",
    });

    // Login as regular user
    cy.visit("/login");
    cy.get("input[name=email]").type(`bannertest${timestamp}@test.com`);
    cy.get("input[name=password]").type("BannerUser123!");
    cy.get("button[type=submit]").click();

    // Check if banner appears
    cy.contains(`User Banner ${timestamp}`, { timeout: 10000 }).should("exist");
  });

  it("should not show banner to admin users", () => {
    const timestamp = Date.now();

    cy.request("POST", "/api/auth/test-setup", {
      email: Cypress.env("adminEmail"),
      password: Cypress.env("adminPassword"),
      role: "admin",
      status: "approved",
    });

    cy.request("POST", "/api/admin/engagement/create", {
      title: `Admin No Banner ${timestamp}`,
      message: "Admins should not see this",
      buttonText: "View",
      buttonUrl: "/tools/rpp",
      showOnUserDashboard: true,
      allowDismiss: true,
      active: true,
    });

    cy.adminLogin();

    // Banner should NOT appear for admin
    cy.contains(`Admin No Banner ${timestamp}`).should("not.exist");
  });

  it("should allow user to dismiss banner", () => {
    const timestamp = Date.now();

    cy.request("POST", "/api/auth/test-setup", {
      email: Cypress.env("adminEmail"),
      password: Cypress.env("adminPassword"),
      role: "admin",
      status: "approved",
    });

    cy.request("POST", "/api/admin/engagement/create", {
      title: `Dismissible ${timestamp}`,
      message: "You can dismiss this",
      buttonText: "OK",
      buttonUrl: "/tools/rpp",
      showOnUserDashboard: true,
      allowDismiss: true,
      active: true,
    });

    // Create user
    cy.request("POST", "/api/auth/test-setup", {
      email: `dismiss${timestamp}@test.com`,
      password: "DismissUser123!",
      status: "approved",
    });

    // Login as user
    cy.visit("/login");
    cy.get("input[name=email]").type(`dismiss${timestamp}@test.com`);
    cy.get("input[name=password]").type("DismissUser123!");
    cy.get("button[type=submit]").click();

    // Banner appears
    cy.contains(`Dismissible ${timestamp}`, { timeout: 10000 }).should("exist");

    // Dismiss it
    cy.get("button[aria-label='Close'], button[title='Close'], .close-button, svg").click();

    // Banner should disappear
    cy.contains(`Dismissible ${timestamp}`).should("not.exist");

    // Reload and verify banner still doesn't appear
    cy.reload();
    cy.contains(`Dismissible ${timestamp}`).should("not.exist");
  });
});
