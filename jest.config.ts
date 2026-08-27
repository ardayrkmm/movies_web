/**
 * Jest Configuration — Movie Reservation System
 *
 * Menggunakan ts-jest untuk transpile TypeScript.
 * Path alias @/* dipetakan ke root project.
 */

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Override beberapa opsi agar kompatibel dengan Jest
          module: "commonjs",
          moduleResolution: "node",
        },
      },
    ],
  },
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/setup.ts"],
  clearMocks: true,
};

export default config;
