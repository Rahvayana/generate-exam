// ============================================
// AI TOOLS - BUAT SOAL TESTS
// ============================================

describe("Buat Soal Tool", () => {
  beforeEach(() => {
    cy.setupUserWithApiKey();
    cy.visit("/tools/buat-soal");
  });

  context("Page Load", () => {
    it("should load buat soal page correctly", () => {
      cy.url().should("include", "/tools/buat-soal");
      cy.contains(/Soal|Ujian|Exam/i).should("exist");
    });
  });

  context("Form Input & Generation", () => {
    it("should fill form and generate soal", () => {
      cy.get("input[name=namaGuru]").type("Guru Test");
      cy.get("input[name=mataPelajaran]").type("Bahasa Indonesia");
      cy.get("input[name=kelas]").type("X");
      cy.get("textarea[name=materiPokok]").type("Teks Laporan Hasil Observasi");
      cy.get("input[name=jumlahSoal]").clear().type("5");

      cy.contains("Generate", { timeout: 5000 }).click();

      // Wait for generation (may timeout without valid API key)
      cy.contains(/Naskah Soal|Soal Berhasil/i, { timeout: 60000 }).should("exist");
    });

    it("should validate required fields", () => {
      cy.contains("Generate").click();
      cy.contains(/required|wajib|lengkapi/i).should("exist");
    });
  });
});
