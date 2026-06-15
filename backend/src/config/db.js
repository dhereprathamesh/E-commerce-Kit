const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL Database Connected on port 5432");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

connectDB();

module.exports = prisma;
