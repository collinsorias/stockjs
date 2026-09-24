// Tries a list of candidate connection URLs and reports which one connects.
const { PrismaClient } = require("@prisma/client");

const candidates = process.argv.slice(2);

async function testOne(url) {
  const prisma = new PrismaClient({ datasources: { db: { url } }, log: ["error"] });
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (error) {
    const msg = String(error.message).replace(/\s+/g, " ").trim();
    return { ok: false, msg: msg.slice(0, 200) };
  } finally {
    await prisma.$disconnect().catch(() => { });
  }
}

(async () => {
  for (const url of candidates) {
    const label = url.replace(/:\/\/[^@]+@/, "://***@");
    const result = await testOne(url);
    if (result.ok) {
      console.log(`OK   ${label}`);
    } else {
      console.log(`FAIL ${label}`);
      console.log(`     ${result.msg}`);
    }
  }
})();