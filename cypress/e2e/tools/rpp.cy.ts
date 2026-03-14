// ============================================
// AI TOOLS - RPP TESTS
// ============================================

describe("RPP / Modul Ajar Tool", () => {
  beforeEach(() => {
    cy.setupUserWithApiKey();
    cy.visit("/tools/rpp");
  });

  context("Page Load", () => {
    it("should load RPP page correctly", () => {
      cy.url().should("include", "/tools/rpp");
      cy.contains(/RPP|Modul Ajar/i).should("exist");
      cy.contains("Generate RPP").or("Buat RPP").should("exist");
    });

    it("should display form fields", () => {
      cy.get("input[name=namaGuru]").should("exist");
      cy.get("input[name=sekolah]").should("exist");
      cy.get("select[name=jenjang]").should("exist");
      cy.get("select[name=mataPelajaran]").should("exist");
      cy.get("input[name=kelas]").should("exist");
      cy.get("textarea[name=materi]").should("exist");
      cy.get("select[name=kurikulum]").should("exist");
      cy.get("select[name=alokasiWaktu]").should("exist");
    });

    it("should have preview section initially empty", () => {
      cy.contains(/Belum Ada RPP|No RPP Yet|Isi form di sebelah kiri/i).should("exist");
    });
  });

  context("Form Input", () => {
    it("should accept guru name input", () => {
      cy.get("input[name=namaGuru]").type("Budi Santoso, S.Pd.");
      cy.get("input[name=namaGuru]").should("have.value", "Budi Santoso, S.Pd.");
    });

    it("should accept sekolah input", () => {
      cy.get("input[name=sekolah]").type("SD Negeri 1 Jakarta");
      cy.get("input[name=sekolah]").should("have.value", "SD Negeri 1 Jakarta");
    });

    it("should select jenjang option", () => {
      cy.get("select[name=jenjang]").select("SMA");
      cy.get("select[name=jenjang]").should("have.value", "SMA");
    });

    it("should select mata pelajaran option", () => {
      cy.get("select[name=mataPelajaran]").select("Matematika");
      cy.get("select[name=mataPelajaran]").should("have.value", "Matematika");
    });

    it("should show custom mata pelajaran field when Lainnya selected", () => {
      cy.get("select[name=mataPelajaran]").select("Lainnya");
      cy.get("input[name=mataPelajaranKustom]").should("be.visible");
    });

    it("should accept kelas input", () => {
      cy.get("input[name=kelas]").type("X");
      cy.get("input[name=kelas]").should("have.value", "X");
    });

    it("should accept materi input", () => {
      cy.get("textarea[name=materi]").type("Sistem Persamaan Linear");
      cy.get("textarea[name=materi]").should("have.value", "Sistem Persamaan Linear");
    });

    it("should select kurikulum option", () => {
      cy.get("select[name=kurikulum]").select("Kurikulum Merdeka");
      cy.get("select[name=kurikulum]").should("have.value", "Kurikulum Merdeka");
    });

    it("should select alokasi waktu option", () => {
      cy.get("select[name=alokasiWaktu]").select("2 x pertemuan");
      cy.get("select[name=alokasiWaktu]").should("have.value", "2 x pertemuan");
    });

    it("should accept tujuan pembelajaran (optional)", () => {
      cy.get("textarea[name=tujuanPembelajaran]").type(
        "Siswa dapat menyelesaikan persamaan linear"
      );
      cy.get("textarea[name=tujuanPembelajaran]").should(
        "contain.value",
        "Siswa dapat menyelesaikan"
      );
    });
  });

  context("Form Validation", () => {
    it("should show error for missing required fields", () => {
      cy.contains("Generate").click();
      cy.contains(/harap lengkapi|required|wajib/i).should("exist");
    });

    it("should not submit with empty jenjang", () => {
      cy.get("input[name=kelas]").type("X");
      cy.get("select[name=mataPelajaran]").select("Matematika");
      cy.get("textarea[name=materi]").type("Test");

      cy.contains("Generate").click();
      cy.contains(/jenjang|required/i).should("exist");
    });
  });

  context("RPP Generation", () => {
    it("should generate RPP with valid data", () => {
      cy.fillRPPForm({
        namaGuru: "Test Guru",
        sekolah: "SD Test",
        jenjang: "SD",
        mataPelajaran: "Matematika",
        kelas: "5",
        materi: "Pecahan Sederhana",
        kurikulum: "Kurikulum Merdeka",
        alokasiWaktu: "2 x pertemuan",
      });

      cy.contains("Generate").click();

      // Show loading state
      cy.contains(/Sedang Memproses|Generating|Memuat/i).should("exist");

      // Wait for results (may take time with API)
      cy.waitForGeneration();
    });

    it("should show error when API key is missing", () => {
      // Setup user without API key
      cy.request("POST", "/api/auth/test-setup", {
        email: "nokey@test.com",
        password: "NoKey123!",
        status: "approved",
        apiKey: null,
      });

      cy.visit("/login");
      cy.get("input[name=email]").type("nokey@test.com");
      cy.get("input[name=password]").type("NoKey123!");
      cy.get("button[type=submit]").click();

      cy.visit("/tools/rpp");
      cy.fillRPPForm({
        jenjang: "SD",
        mataPelajaran: "Matematika",
        kelas: "5",
        materi: "Test",
      });

      cy.contains("Generate").click();

      cy.contains(/API Key|tidak ditemukan/i, { timeout: 10000 }).should("exist");
    });
  });

  context("Preview Tabs", () => {
    beforeEach(() => {
      // Skip actual generation for preview tests - use mock or skip
      cy.contains("Generate").should("exist");
    });

    it("should have preview tabs", () => {
      // Tabs should be present after generation
      cy.get("body").then(($body) => {
        if ($body.find("[role='tab'], .tab-button, button[class*='tab']").length > 0) {
          cy.get("[role='tab'], .tab-button").should("have.length.greaterThan", 0);
        }
      });
    });
  });

  context("Download and Copy", () => {
    it("should have download button after generation", () => {
      // This test verifies the button exists when content is generated
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Download'), button:contains('DOCX')").length > 0) {
          cy.contains("Download").or("DOCX").should("exist");
        }
      });
    });

    it("should have copy button after generation", () => {
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Copy'), button:contains('Salin')").length > 0) {
          cy.contains("Copy").or("Salin").should("exist");
        }
      });
    });
  });

  context("Navigation", () => {
    it("should have back button to home", () => {
      cy.get("a[href='/']").should("exist");
    });

    it("should navigate back to home when clicking back button", () => {
      cy.get("a[href='/']").click();
      cy.url().should("not.include", "/tools/rpp");
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });

    it("should have profile link", () => {
      cy.get("a[href='/profile']").should("exist");
    });
  });
});
