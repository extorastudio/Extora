import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Extora database...");

  // Default permissions
  const permissions = [
    { resource: "user", action: "create", description: "Create users" },
    { resource: "user", action: "read", description: "Read users" },
    { resource: "user", action: "update", description: "Update users" },
    { resource: "user", action: "delete", description: "Delete users" },
    { resource: "plugin", action: "install", description: "Install plugins" },
    { resource: "plugin", action: "activate", description: "Activate plugins" },
    { resource: "plugin", action: "configure", description: "Configure plugins" },
    { resource: "plugin", action: "read", description: "Read plugins" },
    { resource: "plugin", action: "uninstall", description: "Uninstall plugins" },
    { resource: "theme", action: "install", description: "Install themes" },
    { resource: "theme", action: "configure", description: "Configure themes" },
    { resource: "theme", action: "read", description: "Read themes" },
    { resource: "config", action: "read", description: "Read configuration" },
    { resource: "config", action: "write", description: "Write configuration" },
    { resource: "system", action: "read", description: "Read system info" },
    { resource: "system", action: "update", description: "Update system" },
    { resource: "content", action: "create", description: "Create content" },
    { resource: "content", action: "read", description: "Read content" },
    { resource: "content", action: "update", description: "Update content" },
    { resource: "content", action: "delete", description: "Delete content" },
    { resource: "backup", action: "read", description: "Read backups" },
    { resource: "backup", action: "write", description: "Create backups" },
    { resource: "deploy", action: "read", description: "Read deployments" },
    { resource: "media", action: "read", description: "Read media" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      create: perm,
      update: {},
    });
  }
  console.log(`Created ${permissions.length} permissions`);

  // Default roles
  const superAdmin = await prisma.roleDefinition.upsert({
    where: { name: "SUPER_ADMIN" },
    create: { name: "SUPER_ADMIN", description: "Full system access", isSystem: true },
    update: {},
  });

  const admin = await prisma.roleDefinition.upsert({
    where: { name: "ADMIN" },
    create: { name: "ADMIN", description: "Administrative access", isSystem: true },
    update: {},
  });

  const editor = await prisma.roleDefinition.upsert({
    where: { name: "EDITOR" },
    create: { name: "EDITOR", description: "Content editing access", isSystem: true },
    update: {},
  });

  // Assign all permissions to SUPER_ADMIN
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdmin.id, permissionId: perm.id } },
      create: { roleId: superAdmin.id, permissionId: perm.id },
      update: {},
    });
  }

  // Assign content + read permissions to EDITOR
  const editorPerms = allPermissions.filter(
    (p) => p.action === "read" || p.resource === "content",
  );
  for (const perm of editorPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: editor.id, permissionId: perm.id } },
      create: { roleId: editor.id, permissionId: perm.id },
      update: {},
    });
  }

  console.log("Created default roles with permissions");

  // Default super admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@extora.dev" },
    create: {
      email: "admin@extora.dev",
      passwordHash,
      displayName: "Super Admin",
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
    update: {},
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superAdmin.id } },
    create: { userId: user.id, roleId: superAdmin.id },
    update: {},
  });

  console.log(`Created super admin user: admin@extora.dev`);
  console.log("Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
