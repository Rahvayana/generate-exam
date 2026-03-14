// ============================================
// AI TOOLS - LKPD TESTS
// ============================================

describe("LKPD Tool", () => {
  beforeEach(() => {
    cy.setupUserWithApiKey();
    cy.visit("/tools/lkpd");
  });

  context("Page Load & Form", () => {
    it("should load LKPD page correctly", () => {
      cy.url().should("include", "/tools/lkpd");
      cy.contains(/LKPD|Lembar Kerja/i).should("exist");
    });

    it("should fill form and generate LKPD", () => {
      cy.get("select[name=mataPelajaran]").select("IPA");
      cy.get("input[name=kelas]").type("7");
      cy.get("textarea[name=materi]").type("Sistem Pencernaan Manusia");
      cy.get("input[name=jumlahSoal]").clear().type("5");

      cy.contains("Generate", { timeout: 5000 }).click();
      cy.contains(/LKPD|hasil/i, { timeout: 60000 }).should("exist");
    });
  });
});
