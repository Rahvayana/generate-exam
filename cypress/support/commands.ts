// ============================================
// CYPRESS CUSTOM COMMANDS
// ============================================

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): void;
      adminLogin(): void;
      registerUser(name: string, email: string, password: string): void;
      logout(): void;
      fillRPPForm(data: Partial<Cypress.RPPFormData>): void;
      fillBuatSoalForm(data: Partial<Cypress.BuatSoalFormData>): void;
      fillLKPDForm(data: Partial<Cypress.LKPDFormData>): void;
      waitForGeneration(): void;
      setupUserWithApiKey(): void;
    }
  }
}

// Type definitions for form data
declare namespace Cypress {
  interface RPPFormData {
    namaGuru: string;
    sekolah: string;
    jenjang: string;
    mataPelajaran: string;
    kelas: string;
    materi: string;
    kurikulum: string;
    alokasiWaktu: string;
  }

  interface BuatSoalFormData {
    namaGuru: string;
    mataPelajaran: string;
    kelas: string;
    materiPokok: string;
    jumlahSoal: string;
  }

  interface LKPDFormData {
    mataPelajaran: string;
    kelas: string;
    materi: string;
    jumlahSoal: string;
  }
}

/**
 * Setup test user with API key
 */
Cypress.Commands.add("setupUserWithApiKey", () => {
  const testEmail = Cypress.env("testUserEmail") || "testuser@cypress.test";
  const testPassword = Cypress.env("testUserPassword") || "Test123!";
  const apiKey = Cypress.env("GEMINI_API_KEY") || "test-key";

  cy.request("POST", "/api/auth/test-setup", {
    email: testEmail,
    password: testPassword,
    status: "approved",
    apiKey,
  }).then(() => {
    cy.login(testEmail, testPassword);
  });
});

/**
 * Login as a regular user
 */
Cypress.Commands.add("login", (email?: string, password?: string) => {
  const testEmail = email || Cypress.env("testUserEmail");
  const testPassword = password || Cypress.env("testUserPassword");

  cy.visit("/login");
  cy.get("input[name=email]").clear().type(testEmail);
  cy.get("input[name=password]").clear().type(testPassword);
  cy.get("button[type=submit]").click();

  // Wait for redirect to dashboard
  cy.url().should("not.include", "/login");
});

/**
 * Login as admin
 */
Cypress.Commands.add("adminLogin", () => {
  const adminEmail = Cypress.env("adminEmail");
  const adminPassword = Cypress.env("adminPassword");

  cy.visit("/login");
  cy.get("input[name=email]").clear().type(adminEmail);
  cy.get("input[name=password]").clear().type(adminPassword);
  cy.get("button[type=submit]").click();

  // Wait for redirect to dashboard
  cy.url().should("not.include", "/login");
});

/**
 * Register a new user
 */
Cypress.Commands.add("registerUser", (name: string, email: string, password: string) => {
  cy.visit("/register");
  cy.get("input[name=name]").clear().type(name);
  cy.get("input[name=email]").clear().type(email);
  cy.get("input[name=password]").clear().type(password);
  cy.get("button[type=submit]").click();
});

/**
 * Logout
 */
Cypress.Commands.add("logout", () => {
  cy.visit("/");
  // Click on user menu or settings icon
  cy.get("a[href='/profile']").should("exist").click();
  // Look for logout button
  cy.contains("Sign Out").click();
  cy.url().should("include", "/login");
});

/**
 * Fill RPP form
 */
Cypress.Commands.add("fillRPPForm", (data: Partial<Cypress.RPPFormData>) => {
  if (data.namaGuru) {
    cy.get("input[name=namaGuru]").clear().type(data.namaGuru);
  }
  if (data.sekolah) {
    cy.get("input[name=sekolah]").clear().type(data.sekolah);
  }
  if (data.jenjang) {
    cy.get("select[name=jenjang]").select(data.jenjang);
  }
  if (data.mataPelajaran) {
    cy.get("select[name=mataPelajaran]").select(data.mataPelajaran);
  }
  if (data.kelas) {
    cy.get("input[name=kelas]").clear().type(data.kelas);
  }
  if (data.materi) {
    cy.get("textarea[name=materi]").clear().type(data.materi);
  }
  if (data.kurikulum) {
    cy.get("select[name=kurikulum]").select(data.kurikulum);
  }
  if (data.alokasiWaktu) {
    cy.get("select[name=alokasiWaktu]").select(data.alokasiWaktu);
  }
});

/**
 * Fill Buat Soal form
 */
Cypress.Commands.add("fillBuatSoalForm", (data: Partial<Cypress.BuatSoalFormData>) => {
  if (data.namaGuru) {
    cy.get("input[name=namaGuru]").clear().type(data.namaGuru);
  }
  if (data.mataPelajaran) {
    cy.get("input[name=mataPelajaran]").clear().type(data.mataPelajaran);
  }
  if (data.kelas) {
    cy.get("input[name=kelas]").clear().type(data.kelas);
  }
  if (data.materiPokok) {
    cy.get("textarea[name=materiPokok]").clear().type(data.materiPokok);
  }
  if (data.jumlahSoal) {
    cy.get("input[name=jumlahSoal]").clear().clear().type(data.jumlahSoal);
  }
});

/**
 * Fill LKPD form
 */
Cypress.Commands.add("fillLKPDForm", (data: Partial<Cypress.LKPDFormData>) => {
  if (data.mataPelajaran) {
    cy.get("select[name=mataPelajaran]").select(data.mataPelajaran);
  }
  if (data.kelas) {
    cy.get("input[name=kelas]").clear().type(data.kelas);
  }
  if (data.materi) {
    cy.get("textarea[name=materi]").clear().type(data.materi);
  }
  if (data.jumlahSoal) {
    cy.get("input[name=jumlahSoal]").clear().type(data.jumlahSoal);
  }
});

/**
 * Wait for AI generation to complete
 */
Cypress.Commands.add("waitForGeneration", () => {
  // Wait for loading state to disappear
  cy.get("button:contains('Sedang Memproses'), button:contains('Generating')", { timeout: 1000 })
    .should("not.exist");
  // Wait for success (preview section appears)
  cy.get("[class*='preview'], [class*='result']", { timeout: 60000 }).should("exist");
});

// Add Testing Library commands
import "@testing-library/cypress/add-commands";
