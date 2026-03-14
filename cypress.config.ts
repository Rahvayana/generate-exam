import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{ts,js}",
    supportFile: "cypress/support/e2e.ts",
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      apiUrl: "http://localhost:3000/api",
      testUserEmail: "testuser@cypress.test",
      testUserPassword: "Test123!",
      adminEmail: "admin@cypress.test",
      adminPassword: "Admin123!",
    },
  },
});
