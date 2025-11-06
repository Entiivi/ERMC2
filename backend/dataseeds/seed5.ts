import { PrismaClient, Lang, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const servicesSeed: Prisma.ServiceCreateManyInput[] = [
  // ---------- LT ----------
  {
    lang: Lang.LT,
    title: "Įvairios įrangos montavimas ir priežiūra",
    subtitle: "Montuojame ir prižiūrime statybos objektuose naudojamą įrangą",
    iconUrl: "/icons/mirp.svg",
    order: 1,
    details: `
Darbo pobūdis apima statybos objektuose naudojamos įvairios įrangos montavimą, paleidimą,
techninę priežiūrą ir remontą. Tai gali būti elektros skydai, siurbliai, ventiliacijos
ir šildymo sistemos, automatinio valdymo įranga, statybiniai keltuvai ar kita mechaninė įranga.

**Pagrindinės veiklos sritys:**

- Garo turbinų montavimo darbai
- Šilumokaičių ir katilų montavimas ir priežiūra
- Pagalbinės įrangos ir vamzdynų montavimas
- Techninė priežiūra ir remonto darbai
`.trim(),
  },
  {
    lang: Lang.LT,
    title: "Metalinių konstrukcijų gamyba ir montavimas",
    subtitle: "Žemės ūkio, pramoninių ar pastatų metalinių konstrukcijų pilnas ciklas",
    iconUrl: "/icons/kbmon.svg",
    order: 2,
    details: `
Įvairių metalinių konstrukcijų gamyba dirbtuvėse bei jų montavimas statybos objektuose.

**Pagrindinės atsakomybės:**

- Metalinių detalių gamyba pagal brėžinius ar techninę dokumentaciją
- Konstrukcijų surinkimas ir suvirinimas gamybos ceche arba objekte
- Paruoštų elementų montavimas statybos aikštelėje
- Darbas su metalo apdirbimo įranga
- Kokybės, saugos ir technologinių procesų laikymasis
`.trim(),
  },
  {
    lang: Lang.LT,
    title: "Technologinių sprendimų projektavimas",
    subtitle: "Projektuojame efektyvias, ekonomiškai pagrįstas technologines sistemas",
    iconUrl: "/icons/tpsp.svg",
    order: 3,
    details: `
Technologinių procesų, inžinerinių sistemų ar gamybos linijų projektavimas pagal klientų poreikius.

**Pagrindinės atsakomybės:**

- Procesų ir sistemų projektavimas (gamybos, vėdinimo, šildymo ir kt.)
- Sprendimų skaičiavimai ir optimizavimas
- Techninės dokumentacijos ruošimas
- Bendradarbiavimas su architektais ir inžinieriais
- Sprendimų derinimas su užsakovu
`.trim(),
  },
  {
    lang: Lang.LT,
    title: "Inžinerinių / Statybos projektų valdymas",
    subtitle: "Pilnas projektų ciklas: planavimas, koordinavimas, įgyvendinimas",
    iconUrl: "/icons/vald.svg",
    order: 4,
    details: `
Visapusiškas inžinerinių arba statybos projektų planavimas, koordinavimas ir priežiūra nuo idėjos iki įgyvendinimo.

**Pagrindinės atsakomybės:**

- Darbų grafiko sudarymas ir sąnaudų skaičiavimas
- Terminų, biudžeto ir kokybės kontrolė
- Derybos su užsakovais ir subrangovais
- Dokumentacijos priežiūra ir pokyčių valdymas
- Objekto kokybės ir darbo saugos kontrolė
`.trim(),
  },

  // ---------- EN ----------
  {
    lang: Lang.EN,
    title: "Installation and maintenance of various equipment",
    subtitle: "We install and maintain equipment used on construction sites",
    iconUrl: "/icons/mirp.svg",
    order: 1,
    details: `
The scope of work includes installation, commissioning, technical maintenance and repair
of various equipment used on construction sites. This may include electrical switchboards,
pumps, ventilation and heating systems, automation equipment, construction hoists and other
mechanical systems.

**Main areas of responsibility:**

- Installation of steam turbines
- Installation and maintenance of heat exchangers and boilers
- Installation of auxiliary equipment and piping
- Technical maintenance and repair works
`.trim(),
  },
  {
    lang: Lang.EN,
    title: "Manufacturing and installation of steel structures",
    subtitle: "Full cycle of agricultural, industrial and building steel structures",
    iconUrl: "/icons/kbmon.svg",
    order: 2,
    details: `
Manufacturing of various steel structures in the workshop and their installation on construction sites.

**Main responsibilities:**

- Manufacturing steel parts according to drawings and technical documentation
- Assembling and welding structures in the workshop or on site
- Installing finished elements on the construction site
- Working with metalworking and fabrication equipment
- Ensuring quality, safety and compliance with technological processes
`.trim(),
  },
  {
    lang: Lang.EN,
    title: "Design of technological solutions",
    subtitle: "We design efficient and economically sound technological systems",
    iconUrl: "/icons/tpsp.svg",
    order: 3,
    details: `
Design of technological processes, engineering systems or production lines according to client needs.

**Main responsibilities:**

- Designing processes and systems (production, ventilation, heating, etc.)
- Performing calculations and optimisation of proposed solutions
- Preparing technical documentation
- Cooperating with architects and engineers
- Aligning proposed solutions with the client
`.trim(),
  },
  {
    lang: Lang.EN,
    title: "Engineering / construction project management",
    subtitle: "Full project cycle: planning, coordination and implementation",
    iconUrl: "/icons/vald.svg",
    order: 4,
    details: `
Comprehensive planning, coordination and supervision of engineering or construction projects
throughout the entire life cycle.

**Main responsibilities:**

- Preparing work schedules and cost estimates
- Controlling deadlines, budget and quality
- Negotiating with clients and subcontractors
- Managing project documentation and change control
- Ensuring quality and occupational safety at the site
`.trim(),
  },
];

export async function seedServices() {
  // Išvalom lentelę, kad nebūtų dublikatų
  await prisma.service.deleteMany();

  // Įdedam naujus įrašus
  await prisma.service.createMany({
    data: servicesSeed,
    // skipDuplicates čia NEPALAIKOMAS, todėl jo nerašom
  });
}

// Jei čia yra tavo pagrindinis seed.ts:
async function main() {
  await seedServices();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
