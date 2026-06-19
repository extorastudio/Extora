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

  // Seed demo products
  const existingProducts = await (prisma as any).product.count();
  if (existingProducts === 0) {
    const demoProducts = [
      { name: "Wireless Bluetooth Headphones", slug: "wireless-bluetooth-headphones", price: 2499, mrp: 4999, regularPrice: 2499, category: "Electronics", status: "published", brand: "AudioTech", rating: 4.3, reviews: 342, description: "Premium noise-cancelling wireless headphones with 30hr battery life. Features deep bass, crystal clear calls, and comfortable over-ear design.", images: ["https://picsum.photos/600/600?random=1"] },
      { name: "Slim Fit Cotton T-Shirt", slug: "slim-fit-cotton-tshirt", price: 599, mrp: 999, regularPrice: 599, category: "Fashion", status: "published", brand: "StyleHub", rating: 4.1, reviews: 128, description: "Soft 100% cotton slim fit t-shirt. Available in multiple colors. Machine washable, pre-shrunk fabric.", images: ["https://picsum.photos/600/600?random=2"] },
      { name: "Stainless Steel Water Bottle 1L", slug: "steel-water-bottle-1l", price: 449, mrp: 799, regularPrice: 449, category: "Home & Kitchen", status: "published", brand: "EcoLife", rating: 4.5, reviews: 215, description: "Double-walled vacuum insulated stainless steel water bottle. Keeps drinks cold 24hrs, hot 12hrs. BPA free, leak proof.", images: ["https://picsum.photos/600/600?random=3"] },
      { name: "USB-C Fast Charging Cable 2m", slug: "usbc-fast-charging-cable", price: 299, mrp: 599, regularPrice: 299, category: "Electronics", status: "published", brand: "ChargePro", rating: 4.0, reviews: 89, description: "Braided nylon USB-C to USB-C cable. Supports 100W fast charging and 10Gbps data transfer. 2 meter length.", images: ["https://picsum.photos/600/600?random=4"] },
      { name: "Running Shoes - Lightweight", slug: "running-shoes-lightweight", price: 1999, mrp: 3999, regularPrice: 1999, category: "Sports", status: "published", brand: "StrideX", rating: 4.4, reviews: 256, description: "Ultra lightweight running shoes with responsive cushioning. Breathable mesh upper, rubber outsole for grip.", images: ["https://picsum.photos/600/600?random=5"] },
      { name: "Organic Green Tea Bags (100 pcs)", slug: "organic-green-tea-100", price: 349, mrp: 549, regularPrice: 349, category: "Grocery", status: "published", brand: "NatureSip", rating: 4.2, reviews: 173, description: "100% organic green tea bags. Rich in antioxidants. No artificial flavors or preservatives. 100 count pack.", images: ["https://picsum.photos/600/600?random=6"] },
      { name: "Mechanical Keyboard RGB", slug: "mechanical-keyboard-rgb", price: 3499, mrp: 5999, regularPrice: 3499, category: "Electronics", status: "draft", brand: "KeyCraft", rating: 4.6, reviews: 421, description: "Full-size mechanical keyboard with Cherry MX Blue switches. Per-key RGB backlighting. Aircraft-grade aluminum frame.", images: ["https://picsum.photos/600/600?random=7"] },
      { name: "Yoga Mat 6mm Extra Thick", slug: "yoga-mat-6mm", price: 699, mrp: 1299, regularPrice: 699, category: "Sports", status: "published", brand: "FlexFit", rating: 4.3, reviews: 198, description: "Extra thick 6mm yoga mat with non-slip surface. Includes carrying strap. Eco-friendly TPE material.", images: ["https://picsum.photos/600/600?random=8"] },
    ];

    for (const p of demoProducts) {
      const slug = `${p.slug}-demo`;
      try {
        await (prisma as any).product.create({
          data: {
            ...p, slug, type: "simple", inStock: true, stockStatus: "instock",
            returnPolicy: "7 days returnable", warranty: "1 Year Manufacturer Warranty",
            sellerName: "Extora Official", sellerRating: 4.5,
            codAvailable: true, deliveryDate: "Tomorrow",
          },
        });
      } catch { /* skip if exists */ }
    }
    console.log(`Seeded ${demoProducts.length} demo products`);
  }

  // Seed demo categories
  const existingCats = await (prisma as any).productCategory.count();
  if (existingCats === 0) {
    const cats = ["Electronics", "Fashion", "Home & Kitchen", "Sports", "Books", "Grocery", "Beauty", "Toys"];
    for (const name of cats) {
      try {
        await (prisma as any).productCategory.create({
          data: { name, slug: name.toLowerCase().replace(/\s+/g, "-"), description: `Browse our ${name.toLowerCase()} collection` },
        });
      } catch { /* skip */ }
    }
    console.log(`Seeded ${cats.length} categories`);
  }

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
