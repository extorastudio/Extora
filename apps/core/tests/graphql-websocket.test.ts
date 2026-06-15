import { describe, it, expect } from "vitest";
import { GraphQLRegistry } from "../src/graphql";

describe("GraphQL Registry", () => {
  it("should register types", () => {
    const gql = new GraphQLRegistry();
    gql.registerType({ name: "User", fields: [{ name: "id", type: "String" }, { name: "email", type: "String" }] });
    expect(gql.getTypes().length).toBe(1);
  });

  it("should register queries", () => {
    const gql = new GraphQLRegistry();
    gql.registerQuery({ name: "users", returnType: "[User]", resolve: async () => [] });
    expect(gql.getQueries().length).toBe(1);
  });

  it("should build schema with types and queries", () => {
    const gql = new GraphQLRegistry();
    gql.registerType({ name: "User", fields: [{ name: "id", type: "String" }] });
    gql.registerQuery({ name: "users", returnType: "[User]", resolve: async () => [] });
    const schema = gql.buildSchema();
    expect(schema).toContain("type User");
    expect(schema).toContain("type Query");
    expect(schema).toContain("users");
  });

  it("should execute simple query", async () => {
    const gql = new GraphQLRegistry();
    gql.registerQuery({ name: "hello", returnType: "String", resolve: async () => "world" });
    const result = await gql.execute("query { hello }");
    expect((result.data as Record<string,unknown>).hello).toBe("world");
  });

  it("should register mutations", () => {
    const gql = new GraphQLRegistry();
    gql.registerMutation({ name: "createUser", returnType: "User", inputFields: { name: { type: "String", required: true } }, resolve: async () => ({ id: "1" }) });
    expect(gql.getMutations().length).toBe(1);
  });
});
