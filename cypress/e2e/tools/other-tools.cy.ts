// ============================================
// AI TOOLS - MATERI, PRESENTASI, RUBRIK, ICEBREAK, REFLEKSI
// ============================================

describe("Materi Tool", () => {
  beforeEach(() => {
    cy.setupUserWithApiKey();
    cy.visit("/tools/materi");
  });

  context("Page Load & Form", () => {
    it("should load materi page correctly", () => {
      cy.url().should("include", "/tools/materi");
      cy.contains(/Materi|Material/i).should("exist");
    });

    it("should fill form and generate materi", () => {
      cy.get("select[name=mataPelajaran]").select("Sejarah");
      cy.get("input[name=kelas]").type("XI");
      cy.get("textarea[name=materi]").type("Pergerakan Nasional Indonesia");

      cy.contains("Generate", { timeout: 5000 }).click();
      cy.contains(/Ringkasan|Summary/i, { timeout: 60000 }).should("exist");
    });
  });
});

describe("Presentasi Tool", () => {
  beforeEach(() => {
    cy.setupUserWithApiKey();
    cy.visit("/tools/presentasi");
  });

  context("Page Load & Form", () => {
    it("should load presentasi page correctly", () => {
      cy.url().should("include", "/tools/presentasi");
      cy.contains(/Presentasi|Presentation/i).should("exist");
    });

    it("should fill form and generate presentasi", () => {
      cy.get("input[name=topik]").type("Pemanasan Global");
      cy.get("input[name=audiens]").type("Siswa SMA");
      cy.get("input[name=durasi]").type("15 menit");
      cy.get("input[name=jumlahSlide]").clear().type("8");

      cy.contains("Generate", { timeout: 5000 }).click();
      cy.contains(/Slide|Presentation/i, { timeout: 60000 }).should("exist");
    });
  });
});

describe("Rubrik Tool", () => {
  beforeEach(() => {
    cy.setupUserWithApiKey();
    cy.visit("/tools/rubrik");
  });

  context("Page Load & Form", () => {
    it("should load rubrik page correctly", () => {
      cy.url().should("include", "/tools/rubrik");
      cy.contains(/Rubrik|Rubric/i).should("exist");
    });

    it("should fill form and generate rubrik", () => {
      cy.get("select[name=mataPelajaran]").select("Bahasa Inggris");
      cy.get("input[name=jenisTugas]").type("Speaking Test");
      cy.get("textarea[name=kriteria]").type("Fluency, Vocabulary, Grammar");

      cy.contains("Generate", { timeout: 5000 }).click();
      cy.contains(/Rubrik|Criteria/i, { timeout: 60000 }).should("exist");
    });
  });
});

describe("Icebreak Tool", () => {
  beforeEach(() => {
    cy.setupUserWithApiKey();
    cy.visit("/tools/icebreak");
  });

  context("Page Load & Form", () => {
    it("should load icebreak page correctly", () => {
      cy.url().should("include", "/tools/icebreak");
      cy.contains(/Icebreak|Ice Breaking/i).should("exist");
    });

    it("should fill form and generate icebreak", () => {
      cy.get("input[name=kelas]").type("X");
      cy.get("select[name=durasi]").select("10-15 menit");
      cy.get("input[name=tema]").type("Getting to Know Each Other");

      cy.contains("Generate", { timeout: 5000 }).click();
      cy.contains(/Aktivitas|Activity/i, { timeout: 60000 }).should("exist");
    });
  });
});

describe("Refleksi Tool", () => {
  beforeEach(() => {
    cy.setupUserWithApiKey();
    cy.visit("/tools/refleksi");
  });

  context("Page Load & Form", () => {
    it("should load refleksi page correctly", () => {
      cy.url().should("include", "/tools/refleksi");
      cy.contains(/Refleksi|Reflection/i).should("exist");
    });

    it("should fill form and generate refleksi", () => {
      cy.get("select[name=mataPelajaran]").select("Matematika");
      cy.get("input[name=kelas]").type("VIII");
      cy.get("textarea[name=materi]").type("Aljabar Dasar");

      cy.contains("Generate", { timeout: 5000 }).click();
      cy.contains(/Refleksi|Reflection/i, { timeout: 60000 }).should("exist");
    });
  });
});
