import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const materials = [
        {
            key: "cement-cem-42-5",
            name: "Cementas CEM I 42.5",
            unit: "kg",
            description: "Portlandcementis statybos darbams",
            category: "Statybinės medžiagos",
            brand: "Akmenė",
            sku: "CEM425-25KG",
        },
        {
            key: "betonas-c25-30",
            name: "Betonas C25/30",
            unit: "m3",
            description: "Paruoštas betonas konstrukcijoms",
            category: "Betonas",
            brand: "Betono centras",
            sku: "BET-C25-30",
        },
        {
            key: "armatura-16mm",
            name: "Armatūra 16 mm",
            unit: "m",
            description: "Plieninė armatūra",
            category: "Metalas",
            brand: "ArcelorMittal",
            sku: "ARM-16MM",
        },
        {
            key: "kabelis-cu-5x2-5",
            name: "Varinis kabelis 5x2.5",
            unit: "m",
            description: "Elektros instaliacijos kabelis",
            category: "Elektros medžiagos",
            brand: "Prysmian",
            sku: "CU-5X2.5",
        },
        {
            key: "skydelis-elektros-36",
            name: "Elektros skydelis 36 mod.",
            unit: "vnt",
            description: "Modulinis elektros skydelis",
            category: "Elektros įranga",
            brand: "Hager",
            sku: "HAG-36M",
        },
        {
            key: "server-rack-42u",
            name: "Serverio spinta 42U",
            unit: "vnt",
            description: "IT serverių spinta",
            category: "IT įranga",
            brand: "Rittal",
            sku: "RACK-42U",
        },
    ];

    for (const m of materials) {
        await prisma.material.upsert({
            where: { key: m.key },
            update: {
                name: m.name,
                unit: m.unit,
                description: m.description,
                category: m.category,
                brand: m.brand,
                sku: m.sku,
            },
            create: m,
        });
    }

    console.log("✅ Materials seeded");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
