import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating Partneris.imageSrc fields...");

  // nauji keliai į partnerių nuotraukas
  const updates = [
    { name: "Achema", newSrc: "/uploads/homepage-photos/partneriai-photos/achema.png" },
    { name: "Axis", newSrc: "/uploads/homepage-photos/partneriai-photos/axis.png" },
    { name: "Enefit", newSrc: "/uploads/homepage-photos/partneriai-photos/enefit.jpg" },
    { name: "Klaipėdos Nafta", newSrc: "/uploads/homepage-photos/partneriai-photos/klaipedos-nafta.jpg" },
    { name: "Lietuvos Energija", newSrc: "/uploads/homepage-photos/partneriai-photos/lietuvos-energija.png" },
    { name: "LTGEL", newSrc: "/uploads/homepage-photos/partneriai-photos/ltgel.jpg" },
    { name: "Orlen", newSrc: "/uploads/homepage-photos/partneriai-photos/orlen.jpg" },
    { name: "Vilniaus Silumos Tinklai", newSrc: "/uploads/homepage-photos/partneriai-photos/vilniussil.jpg" },
  ];

  for (const u of updates) {
    const partner = await prisma.partneris.findUnique({ where: { name: u.name } });
    if (!partner) {
      console.warn(`⚠️ Partner '${u.name}' nerastas DB – praleidžiam.`);
      continue;
    }

    await prisma.partneris.update({
      where: { name: u.name },
      data: { imageSrc: u.newSrc },
    });

    console.log(`✅ Atnaujinta: ${u.name} → ${u.newSrc}`);
  }

  console.log("Partnerių nuotraukos sėkmingai atnaujintos!");
}

main()
  .catch((err) => {
    console.error(" Klaida seed3 metu:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
