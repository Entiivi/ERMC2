// prisma/seed.ts
import { PrismaClient, ElectricityProviderType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const providers = [
    {
      name: "ESO",
      type: ElectricityProviderType.DSO,
      website: "https://www.eso.lt",
      phone: "+370 5 278 1717",
      email: null,
    },
    {
      name: "Litgrid",
      type: ElectricityProviderType.TSO,
      website: "https://www.litgrid.eu",
      phone: null,
      email: null,
    },
    {
      name: "Ignitis",
      type: ElectricityProviderType.SUPPLIER,
      website: "https://ignitis.lt",
      phone: null,
      email: null,
    },
    {
      name: "Elektrum Lietuva",
      type: ElectricityProviderType.SUPPLIER,
      website: "https://www.elektrum.lt",
      phone: null,
      email: null,
    },
    {
      name: "Enefit",
      type: ElectricityProviderType.SUPPLIER,
      website: "https://www.enefit.lt",
      phone: null,
      email: null,
    },
  ] as const;

  for (const p of providers) {
    await prisma.electricityProvider.upsert({
      where: { name: p.name },
      update: {
        type: p.type,
        website: p.website,
        phone: p.phone,
        email: p.email,
      },
      create: {
        name: p.name,
        type: p.type,
        website: p.website,
        phone: p.phone,
        email: p.email,
      },
    });
  }

  console.log(`Seed done: upserted ${providers.length} electricity providers.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
