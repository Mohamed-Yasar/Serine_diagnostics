import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import {
  LAB_TESTS,
  LAB_PACKAGES,
  LAB_LOCATIONS,
} from "../src/data/labData";

import { QUEST_CATALOG } from '../src/data/questCatalog';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const packageTestMap: Record<string, string[]> = {
  "pkg-essential": [
    "cbc",
    "cmp",
    "lipid-panel",
    "urinalysis-complete",
  ],

  "pkg-executive": [
    "cbc",
    "cmp",
    "lipid-panel",
    "hba1c",
    "tsh-thyroid",
    "vitamin-d",
    "crp-hs",
    "ferritin-iron",
  ],

  "pkg-cardiac": [
    "lipid-panel",
    "crp-hs",
    "hba1c",
    "cmp",
    "cbc",
  ],

  "pkg-womens": [
    "cbc",
    "cmp",
    "tsh-thyroid",
    "ferritin-iron",
    "vitamin-d",
    "lipid-panel",
  ],

  "pkg-mens": [
    "psa-total",
    "lipid-panel",
    "cmp",
    "hba1c",
    "cbc",
    "crp-hs",
  ],
};

async function main() {
  console.log("🌱 Starting Serine Diagnostics seed...");

  // -------------------------
  // LAB TESTS
  // -------------------------

  for (const test of LAB_TESTS) {
    await prisma.labTest.upsert({
      where: {
        id: test.id,
      },
      update: {
        code: test.code,
        name: test.name,
        category: test.category,
        categoryLabel: test.categoryLabel,
        description: test.description,
        fastingRequired: test.fastingRequired,
        fastingHours: test.fastingHours ?? null,
        turnaroundTime: test.turnaroundTime,
        specimenType: test.specimenType,
        price: test.price,
        popular: test.popular ?? false,
        commonFor: test.commonFor ?? [],
        tags: [],
        clinicalSignificance: test.clinicalSignificance,
        whyItIsDone: test.whyItIsDone ?? null,
        whatItHelpsEvaluate: test.whatItHelpsEvaluate ?? null,
        abnormalSymptoms: test.abnormalSymptoms ?? null,
        specimenVolume: test.specimenVolume ?? null,
        collectionKit: test.collectionKit ?? null,
        patientPreparation: test.patientPreparation ?? null,
        importantInformation: test.importantInformation ?? null,
        whatIsTested: test.whatIsTested ?? [],
        relatedTests: test.relatedTests ?? [],
        active: true,
        source: "SERINE",
        itemType: "TEST",
        bookable: true,
      },
      create: {
        id: test.id,
        code: test.code,
        name: test.name,
        category: test.category,
        categoryLabel: test.categoryLabel,
        description: test.description,
        fastingRequired: test.fastingRequired,
        fastingHours: test.fastingHours ?? null,
        turnaroundTime: test.turnaroundTime,
        specimenType: test.specimenType,
        price: test.price,
        popular: test.popular ?? false,
        commonFor: test.commonFor ?? [],
        tags: [],
        clinicalSignificance: test.clinicalSignificance,
        whyItIsDone: test.whyItIsDone ?? null,
        whatItHelpsEvaluate: test.whatItHelpsEvaluate ?? null,
        abnormalSymptoms: test.abnormalSymptoms ?? null,
        specimenVolume: test.specimenVolume ?? null,
        collectionKit: test.collectionKit ?? null,
        patientPreparation: test.patientPreparation ?? null,
        importantInformation: test.importantInformation ?? null,
        whatIsTested: test.whatIsTested ?? [],
        relatedTests: test.relatedTests ?? [],
        source: "SERINE",
        itemType: "TEST",
        bookable: true,
      },
    });
  }

  console.log(`✅ ${LAB_TESTS.length} lab tests seeded`);

  console.log('📚 Importing Quest catalog...');

const existingTests = await prisma.labTest.findMany({
  select: {
    id: true,
    code: true,
  },
});

const existingCodes = new Set(
  existingTests.map((test) => test.code)
);

let questCreated = 0;
let questUpdated = 0;

for (const quest of QUEST_CATALOG) {
  const questData = {
    name: quest.name,
    category: 'routine',
    categoryLabel: quest.type,

    source: 'QUEST',
    itemType: quest.type.toUpperCase(),
    bookable: false,

    description:
      quest.questDescription ||
      `Quest catalog item: ${quest.name}`,

    price: 0,
    fastingRequired: false,
    fastingHours: null,
    turnaroundTime:
      'To be confirmed by Serine Diagnostics.',
    specimenType:
      'To be confirmed by Serine Diagnostics.',
    clinicalSignificance:
      'To be confirmed by Serine Diagnostics.',

    active: true,
    popular: false,
    commonFor: [],
tags: [],

    whyItIsDone: null,
    whatItHelpsEvaluate: null,
    abnormalSymptoms: null,
    specimenVolume: null,
    collectionKit: null,
    patientPreparation: null,

    importantInformation:
      'Quest catalog item imported for demonstration. Serine Diagnostics operational details are to be confirmed.',

    whatIsTested: [],
    relatedTests: [],
  };

  if (existingCodes.has(quest.id)) {
    const existingTest = existingTests.find(
      (test) => test.code === quest.id
    );

    // Never overwrite an existing Serine test.
    if (existingTest) {
      const isSerineTest =
        LAB_TESTS.some(
          (test) => test.id === existingTest.id
        );

      if (isSerineTest) {
        continue;
      }

      await prisma.labTest.update({
        where: {
          id: existingTest.id,
        },
        data: questData,
      });

      questUpdated++;
      continue;
    }
  }

  await prisma.labTest.create({
    data: {
      code: quest.id,
      ...questData,
    },
  });

  questCreated++;
}

console.log(
  `📚 Quest catalog import complete: ${questCreated} created, ${questUpdated} updated.`
);

  // -------------------------
  // LAB PACKAGES
  // -------------------------

  for (const pkg of LAB_PACKAGES) {
    await prisma.labPackage.upsert({
      where: {
        id: pkg.id,
      },
      update: {
        name: pkg.name,
        badge: pkg.badge ?? null,
        tagline: pkg.tagline,
        description: pkg.description,
        testCount: pkg.testCount,
        price: pkg.price,
        originalValue: pkg.originalValue,
        fastingRequired: pkg.fastingRequired,
        turnaroundTime: pkg.turnaroundTime,
        recommendedFor: pkg.recommendedFor,
        featured: pkg.featured ?? false,
        active: true,
       
      },
      create: {
        id: pkg.id,
        name: pkg.name,
        badge: pkg.badge ?? null,
        tagline: pkg.tagline,
        description: pkg.description,
        testCount: pkg.testCount,
        price: pkg.price,
        originalValue: pkg.originalValue,
        fastingRequired: pkg.fastingRequired,
        turnaroundTime: pkg.turnaroundTime,
        recommendedFor: pkg.recommendedFor,
        featured: pkg.featured ?? false,
      },
    });
  }

  console.log(`✅ ${LAB_PACKAGES.length} lab packages seeded`);

  // -------------------------
  // PACKAGE → TEST RELATIONS
  // -------------------------

  for (const [packageId, testIds] of Object.entries(packageTestMap)) {
    await prisma.packageTest.deleteMany({
      where: {
        packageId,
      },
    });

    await prisma.packageTest.createMany({
      data: testIds.map((testId) => ({
        packageId,
        testId,
      })),
      skipDuplicates: true,
    });
  }

  console.log("✅ Package/test relationships seeded");

  // -------------------------
  // LOCATIONS
  // -------------------------

  for (const location of LAB_LOCATIONS) {
    await prisma.location.upsert({
      where: {
        id: location.id,
      },
      update: {
        name: location.name,
        shortName: location.shortName,
        address: location.address,
        city: location.city,
        state: location.state,
        zip: location.zip,
        phone: location.phone,
        fax: location.fax,
        hoursWeekday: location.hoursWeekday,
        hoursSaturday: location.hoursSaturday,
        hoursSunday: location.hoursSunday,
        hasDrawSite: location.hasDrawSite,
        hasWheelchairAccess: location.hasWheelchairAccess,
        hasParking: location.hasParking,
        transitInfo: location.transitInfo,
        specialNotes: location.specialNotes ?? null,
        active: true,
      },
      create: {
        id: location.id,
        name: location.name,
        shortName: location.shortName,
        address: location.address,
        city: location.city,
        state: location.state,
        zip: location.zip,
        phone: location.phone,
        fax: location.fax,
        hoursWeekday: location.hoursWeekday,
        hoursSaturday: location.hoursSaturday,
        hoursSunday: location.hoursSunday,
        hasDrawSite: location.hasDrawSite,
        hasWheelchairAccess: location.hasWheelchairAccess,
        hasParking: location.hasParking,
        transitInfo: location.transitInfo,
        specialNotes: location.specialNotes ?? null,
      },
    });
  }

  console.log(`✅ ${LAB_LOCATIONS.length} locations seeded`);

  // -------------------------
// DEACTIVATE OLD LOCATIONS
// -------------------------

await prisma.location.updateMany({
  where: {
    id: {
      in: [
        'chicago-main',
        'chicago-loop',
        'chicago-north',
        'chicago-suburbs-west',
        'chicago-suburbs-nw',
        'home-mobile',
      ],
    },
  },
  data: {
    active: false,
  },
});

  // -------------------------
  // STAFF ADMIN USER
  // -------------------------

  const adminPassword = "Admin@123";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.staffUser.upsert({
    where: {
      email: "admin@serinediagnostics.com",
    },

    update: {
      firstName: "Serine",
      lastName: "Admin",
      role: "ADMIN",
      active: true,
      passwordHash,
    },

    create: {
      email: "admin@serinediagnostics.com",
      passwordHash,
      firstName: "Serine",
      lastName: "Admin",
      role: "ADMIN",
      active: true,
    },
  });

  console.log("✅ Staff admin user seeded");
  console.log("📧 Email: admin@serinediagnostics.com");
  console.log("🔐 Password: Admin@123");

  console.log("🎉 Serine Diagnostics seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });