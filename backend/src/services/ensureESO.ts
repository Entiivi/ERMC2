// backend/src/services/electricity/ensureESO.ts
import { PrismaClient } from "@prisma/client";

export async function ensureESO(
  prisma: PrismaClient,
  projektasId: string
) {
  const eso = await prisma.electricityProvider.findFirst({
    where: { type: "DSO" },
  });

  if (!eso) {
    console.warn("ESO provider not found in DB");
    return;
  }

  await prisma.projektasElectricityProvider.upsert({
    where: {
      projektasId_providerId: {
        projektasId,
        providerId: eso.id,
      },
    },
    update: {
      isPrimary: true,
    },
    create: {
      projektasId,
      providerId: eso.id,
      isPrimary: true,
      note: "Automatiškai priskirta pagal projekto vietą",
    },
  });
}
