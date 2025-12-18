import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workers = [
    {
      fullName: "Jonas Jonaitis",
      email: "jonas.jonaitis@ermc.lt",
      phone: "+37060000001",
      role: "Elektrikas",
    },
    {
      fullName: "Petras Petraitis",
      email: "petras.petraitis@ermc.lt",
      phone: "+37060000002",
      role: "Elektrikas",
    },
    {
      fullName: "Asta Kazlauskienė",
      email: "asta.kazlauskiene@ermc.lt",
      phone: "+37060000003",
      role: "Projektų vadovė",
    },
    {
      fullName: "Tomas Vaitkus",
      email: "tomas.vaitkus@ermc.lt",
      phone: "+37060000004",
      role: "Techninis prižiūrėtojas",
    },
    {
      fullName: "Mantas Šimkus",
      email: "mantas.simkus@ermc.lt",
      phone: "+37060000005",
      role: "Inžinierius",
    },
  ];

  for (const w of workers) {
    await prisma.worker.upsert({
      where: { email: w.email },
      update: {
        fullName: w.fullName,
        phone: w.phone,
        role: w.role,
      },
      create: w,
    });
  }

  console.log("✅ Workers seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
