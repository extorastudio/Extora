import { describe, it, expect, beforeEach } from "vitest";
import { createMigrationRunner, BaseMigration } from "../src/database";

class TestMigration1 extends BaseMigration {
  override name = "001_test";
  override version = "1.0.0";
  upCalled = false; downCalled = false;
  override async up() { this.upCalled = true; }
  override async down() { this.downCalled = true; }
}

class TestMigration2 extends BaseMigration {
  override name = "002_test";
  override version = "1.0.0";
  override async up() {}
  override async down() {}
}

describe("Migration Runner", () => {
  it("should register and run pending migrations", async () => {
    const runner = createMigrationRunner("test-plugin");
    const m1 = new TestMigration1();
    runner.register(m1);
    await runner.runPending();
    expect(m1.upCalled).toBe(true);
  });

  it("should not re-run already applied migrations", async () => {
    const runner = createMigrationRunner("test-plugin", [
      { name: "001_test", version: "1.0.0", applied: true, appliedAt: new Date() },
    ]);
    const m1 = new TestMigration1();
    runner.register(m1);
    await runner.runPending();
    expect(m1.upCalled).toBe(false);
  });

  it("should rollback migrations", async () => {
    const runner = createMigrationRunner("test-plugin", [
      { name: "001_test", version: "1.0.0", applied: true, appliedAt: new Date() },
    ]);
    const m1 = new TestMigration1();
    runner.register(m1);
    await runner.rollback(1);
    expect(m1.downCalled).toBe(true);
  });

  it("should report migration status", async () => {
    const runner = createMigrationRunner("test-plugin");
    runner.register(new TestMigration1());
    runner.register(new TestMigration2());
    const status = await runner.status();
    expect(status.length).toBe(2);
    expect(status[0]!.applied).toBe(false);
  });
});
