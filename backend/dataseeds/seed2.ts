import { PrismaClient, Lang } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding HeroPhoto, ApiePhoto, Icon, Partneris...");

    /* ===== HERO PHOTOS ===== */
    const heroPhotos = [
        {
            id: "hero1",
            lang: Lang.LT,
            imageUrl: "/uploads/homepage-photos/hero-photos/hero1.png",
            alt: "Hero 1 – pagrindinis fonas",
            order: 1,
        },
        {
            id: "hero2",
            lang: Lang.LT,
            imageUrl: "/uploads/homepage-photos/hero-photos/hero2.png",
            alt: "Hero 2 – projekto fonas",
            order: 2,
        },
        {
            id: "hero3",
            lang: Lang.LT,
            imageUrl: "/uploads/homepage-photos/hero-photos/hero3.png",
            alt: "Hero 3 – komanda darbe",
            order: 3,
        },
    ];

    for (const h of heroPhotos) {
        await prisma.heroPhoto.upsert({
            where: { id: h.id },
            update: {
                lang: h.lang,
                imageUrl: h.imageUrl,
                alt: h.alt,
                order: h.order,
                active: true,
            },
            create: {
                id: h.id,
                lang: h.lang,
                imageUrl: h.imageUrl,
                alt: h.alt,
                order: h.order,
                active: true,
            },
        });
    }

    /* ===== APIE PHOTOS ===== */
    const apiePhotos = [
        {
            id: "apiefoto1",
            lang: Lang.LT,
            imageUrl: "/uploads/homepage-photos/apie-photos/apiefoto.png",
            alt: "Apie mus 1",
            caption: "Mūsų komanda darbe",
            order: 1,
        },
        {
            id: "apiefoto2",
            lang: Lang.LT,
            imageUrl: "/uploads/homepage-photos/apie-photos/apiefoto2.png",
            alt: "Apie mus 2",
            caption: "Projektų įgyvendinimas",
            order: 2,
        },
        {
            id: "test21",
            lang: Lang.LT,
            imageUrl: "/uploads/homepage-photos/apie-photos/test21.png",
            alt: "Testinė nuotrauka",
            caption: "Test21 nuotrauka",
            order: 3,
        },
    ];

    for (const a of apiePhotos) {
        await prisma.apiePhoto.upsert({
            where: { id: a.id },
            update: {
                lang: a.lang,
                imageUrl: a.imageUrl,
                alt: a.alt,
                caption: a.caption,
                order: a.order,
                active: true,
            },
            create: {
                id: a.id,
                lang: a.lang,
                imageUrl: a.imageUrl,
                alt: a.alt,
                caption: a.caption,
                order: a.order,
                active: true,
            },
        });
    }

    /* ===== ICONS ===== */
    const icons = [
        { name: "arrow", imageUrl: "/uploads/icons/arrow.svg", alt: "Rodyklė", category: "ui" },
        { name: "back", imageUrl: "/uploads/icons/back.svg", alt: "Atgal", category: "ui" },
        { name: "company", imageUrl: "/uploads/icons/company.svg", alt: "Įmonės piktograma", category: "info" },
        { name: "kbmon", imageUrl: "/uploads/icons/kbmon.svg", alt: "KB monitoring", category: "service" },
        { name: "location", imageUrl: "/uploads/icons/location.svg", alt: "Vieta", category: "contact" },
        { name: "mirp", imageUrl: "/uploads/icons/mirp.svg", alt: "MIRP piktograma", category: "service" },
        { name: "phone", imageUrl: "/uploads/icons/phone.svg", alt: "Telefonas", category: "contact" },
        { name: "pvm", imageUrl: "/uploads/icons/pvm.svg", alt: "PVM piktograma", category: "finance" },
        { name: "tpsp", imageUrl: "/uploads/icons/tpsp.svg", alt: "TPSP piktograma", category: "service" },
        { name: "user", imageUrl: "/uploads/icons/user.svg", alt: "Naudotojas", category: "user" },
        { name: "userstar", imageUrl: "/uploads/icons/userstar.svg", alt: "Naudotojas su žvaigžde", category: "user" },
        { name: "vald", imageUrl: "/uploads/icons/vald.svg", alt: "Valdymo piktograma", category: "admin" },
    ];

    for (const icon of icons) {
        await prisma.icon.upsert({
            where: { name: icon.name },
            update: {
                imageUrl: icon.imageUrl,
                alt: icon.alt,
                category: icon.category,
            },
            create: {
                name: icon.name,
                imageUrl: icon.imageUrl,
                alt: icon.alt,
                category: icon.category,
            },
        });
    }

    /* ===== PARTNERIAI PHOTOS ===== */
    const partners = [
        { name: "Achema", imageSrc: "/uploads/homepage-photos/partneriai-photos/achema.png", imageAlt: "Achema" },
        { name: "Axis", imageSrc: "/uploads/homepage-photos/partneriai-photos/axis.png", imageAlt: "Axis" },
        { name: "Enefit", imageSrc: "/uploads/homepage-photos/partneriai-photos/enefit.jpg", imageAlt: "Enefit" },
        { name: "Klaipėdos Nafta", imageSrc: "/uploads/homepage-photos/partneriai-photos/klaipedos-nafta.jpg", imageAlt: "Klaipėdos Nafta" },
        { name: "Lietuvos Energija", imageSrc: "/uploads/homepage-photos/partneriai-photos/lietuvos-energija.png", imageAlt: "Lietuvos Energija" },
        { name: "LTGEL", imageSrc: "/uploads/homepage-photos/partneriai-photos/ltgel.jpg", imageAlt: "LTGEL" },
        { name: "Orlen", imageSrc: "/uploads/homepage-photos/partneriai-photos/orlen.jpg", imageAlt: "Orlen" },
        { name: "Vilniaus Silumos Tinklai", imageSrc: "/uploads/homepage-photos/partneriai-photos/vilniussil.jpg", imageAlt: "Vilniaus šilumos tinklai" },
    ];

    for (const p of partners) {
        await prisma.partneris.upsert({
            where: { name: p.name },
            update: {
                imageSrc: p.imageSrc,
                imageAlt: p.imageAlt,
            },
            create: {
                name: p.name,
                imageSrc: p.imageSrc,
                imageAlt: p.imageAlt,
            },
        });
    }

    console.log("✅ Seed completed successfully with actual file names.");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
