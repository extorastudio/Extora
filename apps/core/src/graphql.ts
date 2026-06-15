import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

interface GraphQLField {
  name: string;
  type: string;
  description?: string;
  resolve?: (parent: unknown, args: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface GraphQLType {
  name: string;
  description?: string;
  fields: GraphQLField[];
}

interface GraphQLQuery {
  name: string;
  description?: string;
  returnType: string;
  args?: Record<string, { type: string; description?: string }>;
  resolve: (parent: unknown, args: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface GraphQLMutation {
  name: string;
  description?: string;
  returnType: string;
  inputFields: Record<string, { type: string; required?: boolean }>;
  resolve: (parent: unknown, args: Record<string, unknown>) => Promise<unknown> | unknown;
}

class GraphQLRegistry {
  private types = new Map<string, GraphQLType>();
  private queries = new Map<string, GraphQLQuery>();
  private mutations = new Map<string, GraphQLMutation>();

  registerType(type: GraphQLType): void {
    this.types.set(type.name, type);
  }

  registerQuery(query: GraphQLQuery): void {
    this.queries.set(query.name, query);
  }

  registerMutation(mutation: GraphQLMutation): void {
    this.mutations.set(mutation.name, mutation);
  }

  getTypes(): GraphQLType[] {
    return Array.from(this.types.values());
  }

  getQueries(): GraphQLQuery[] {
    return Array.from(this.queries.values());
  }

  getMutations(): GraphQLMutation[] {
    return Array.from(this.mutations.values());
  }

  buildSchema(): string {
    const lines: string[] = [];

    for (const type of this.types.values()) {
      lines.push(`type ${type.name} {`);
      for (const field of type.fields) {
        const desc = field.description ? `  # ${field.description}\n` : "";
        lines.push(`${desc}  ${field.name}: ${field.type}`);
      }
      lines.push("}\n");
    }

    lines.push("type Query {");
    for (const query of this.queries.values()) {
      const desc = query.description ? `  # ${query.description}\n` : "";
      const args = query.args
        ? `(${Object.entries(query.args).map(([k, v]) => `${k}: ${v.type}`).join(", ")})`
        : "";
      lines.push(`${desc}  ${query.name}${args}: ${query.returnType}`);
    }
    lines.push("}\n");

    if (this.mutations.size > 0) {
      lines.push("type Mutation {");
      for (const mutation of this.mutations.values()) {
        const desc = mutation.description ? `  # ${mutation.description}\n` : "";
        const args = `(${Object.entries(mutation.inputFields).map(([k, v]) => `${k}: ${v.type}${v.required ? "!" : ""}`).join(", ")})`;
        lines.push(`${desc}  ${mutation.name}${args}: ${mutation.returnType}`);
      }
      lines.push("}");
    }

    return lines.join("\n");
  }

  async execute(query: string, variables: Record<string, unknown> = {}): Promise<{ data: unknown; errors?: { message: string }[] }> {
    try {
      // Parse simple queries (name-based resolution for MVP)
      const trimmed = query.trim();

      // Handle query { field1 field2 ... }
      const queryMatch = /query\s*\{?\s*(\w+)/.exec(trimmed);
      const mutationMatch = /mutation\s*\{?\s*(\w+)/.exec(trimmed);

      if (queryMatch) {
        const fields = this.parseFields(trimmed);
        const result: Record<string, unknown> = {};

        for (const fieldName of fields) {
          const q = this.queries.get(fieldName);
          if (q) {
            result[fieldName] = await q.resolve(null, variables);
          } else {
            result[fieldName] = null;
          }
        }

        return { data: result };
      }

      if (mutationMatch) {
        const name = mutationMatch[1]!;
        const m = this.mutations.get(name);
        if (m) {
          const result = await m.resolve(null, variables);
          return { data: result };
        }
      }

      return { data: {}, errors: [{ message: "Query parsing failed" }] };
    } catch (err: unknown) {
      return { data: null, errors: [{ message: String(err) }] };
    }
  }

  private parseFields(query: string): string[] {
    const fields: string[] = [];
    // Simple parser: extract field names from { field1 field2 nested { subfield } }
    const fieldRegex = /\b([a-zA-Z_]\w*)\b(?!\s*[{])/g;
    let match;
    while ((match = fieldRegex.exec(query)) !== null) {
      const name = match[1]!;
      if (!["query", "mutation", "fragment", "on", "true", "false", "null"].includes(name)) {
        if (this.queries.has(name) || this.mutations.has(name) || this.types.has(name)) {
          fields.push(name);
        }
      }
    }
    return fields;
  }
}

export function registerGraphQLEndpoint(server: FastifyInstance, registry: GraphQLRegistry): void {
  // Schema endpoint
  server.get("/api/v1/graphql/schema", async () => ({
    schema: registry.buildSchema(),
  }));

  // GraphQL introspection
  server.get("/api/v1/graphql", async (request: FastifyRequest) => {
    const { query } = request.query as { query?: string };
    if (!query) {
      return { message: "GraphQL endpoint — use POST for queries or GET with ?query=" };
    }
    return registry.execute(query);
  });

  // GraphQL POST
  server.post("/api/v1/graphql", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { query?: string; variables?: Record<string, unknown> };
    if (!body.query) {
      return reply.status(400).send({ error: "Query is required" });
    }
    return registry.execute(body.query, body.variables ?? {});
  });
}

export { GraphQLRegistry };
