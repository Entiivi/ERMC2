import { PrismaClient, Lang, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// -------- Apie --------
async function cloneApie() {
    const ltItems = await prisma.apie.findMany({
        where: { lang: Lang.LT },
    });

    for (const item of ltItems) {
        const existingEn = await prisma.apie.findFirst({
            where: {
                lang: Lang.EN,
                title: item.title + " (EN)", // jau anksčiau sukurtas
            },
        });

        if (existingEn) {
            console.log(`Apie EN jau yra: ${item.title}`);
            continue;
        }

        await prisma.apie.create({
            data: {
                // id nenurodom -> sugeneruos naują
                lang: Lang.EN,
                title: item.title + " (EN)", // unikumas išlaikytas
                content: item.content,       // kol kas LT tekstas, vėliau išversi
                order: item.order,
            },
        });

        console.log(`✅ Sukurtas Apie EN iš: ${item.title}`);
    }
}

// -------- Paslauga --------
async function clonePaslaugos() {
    const ltItems = await prisma.paslauga.findMany({
        where: { lang: Lang.LT },
    });

    for (const item of ltItems) {
        const existingEn = await prisma.paslauga.findFirst({
            where: {
                lang: Lang.EN,
                title: item.title + " (EN)",
            },
        });

        if (existingEn) {
            console.log(`Paslauga EN jau yra: ${item.title}`);
            continue;
        }

        await prisma.paslauga.create({
            data: {
                lang: Lang.EN,
                title: item.title + " (EN)",
                subtitle: item.subtitle,
                iconUrl: item.iconUrl,
                details: item.details,
            },
        });

        console.log(`✅ Sukurta Paslauga EN iš: ${item.title}`);
    }
}

// -------- Darbas --------
async function cloneDarbai() {
    const ltItems = await prisma.darbas.findMany({
        where: { lang: Lang.LT },
    });

    for (const item of ltItems) {
        const existingEn = await prisma.darbas.findFirst({
            where: {
                lang: Lang.EN,
                title: item.title + " (EN)",
            },
        });

        if (existingEn) {
            console.log(`Darbas EN jau yra: ${item.title}`);
            continue;
        }

        await prisma.darbas.create({
            data: {
                lang: Lang.EN,
                title: item.title + " (EN)",
                location: item.location,
                type: item.type,
                description: item.description,
                responsibilities: (item.responsibilities ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                salary: item.salary,
            },
        });

        console.log(`✅ Sukurtas Darbas EN iš: ${item.title}`);
    }
}

// -------- Projektas --------
async function cloneProjektai() {
    const ltItems = await prisma.projektas.findMany({
        where: { lang: Lang.LT },
    });

    for (const item of ltItems) {
        const existingEn = await prisma.projektas.findFirst({
            where: {
                lang: Lang.EN,
                title: item.title + " (EN)",
            },
        });

        if (existingEn) {
            console.log(`Projektas EN jau yra: ${item.title}`);
            continue;
        }

        await prisma.projektas.create({
            data: {
                lang: Lang.EN,
                title: item.title + " (EN)",
                date: item.date,
                cover: item.cover,
                logoUrl: item.logoUrl,
                tech: (item.tech ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                excerpt: item.excerpt,
                link: item.link,
            },
        });

        console.log(`✅ Sukurtas Projektas EN iš: ${item.title}`);
    }
}

// -------- Partneris --------
async function clonePartneriai() {
    const ltItems = await prisma.partneris.findMany({
        where: { lang: Lang.LT },
    });

    for (const item of ltItems) {
        const existingEn = await prisma.partneris.findFirst({
            where: {
                lang: Lang.EN,
                name: item.name + " (EN)",
            },
        });

        if (existingEn) {
            console.log(`Partneris EN jau yra: ${item.name}`);
            continue;
        }

        await prisma.partneris.create({
            data: {
                lang: Lang.EN,
                name: item.name + " (EN)",
                imageSrc: item.imageSrc,
                imageAlt: item.imageAlt,
            },
        });

        console.log(`✅ Sukurtas Partneris EN iš: ${item.name}`);
    }
}

// -------- Kontaktas --------
async function cloneKontaktai() {
    const ltItems = await prisma.kontaktas.findMany({
        where: { lang: Lang.LT },
    });

    for (const item of ltItems) {
        const existingEn = await prisma.kontaktas.findFirst({
            where: {
                lang: Lang.EN,
                label: item.label + " (EN)",
            },
        });

        if (existingEn) {
            console.log(`Kontaktas EN jau yra: ${item.label}`);
            continue;
        }

        await prisma.kontaktas.create({
            data: {
                lang: Lang.EN,
                label: item.label + " (EN)",
                value: item.value,
                copyable: item.copyable,
                icon: item.icon,
            },
        });

        console.log(`✅ Sukurtas Kontaktas EN iš: ${item.label}`);
    }
}

async function main() {
    console.log("=== LT -> EN klonavimas ===");
    await cloneApie();
    await clonePaslaugos();
    await cloneDarbai();
    await cloneProjektai();
    await clonePartneriai();
    await cloneKontaktai();
    console.log("=== Baigta ===");
}

main()
    .catch((e) => {
        console.error("Klaida klonuojant LT->EN:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
