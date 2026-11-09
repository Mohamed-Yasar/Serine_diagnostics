import { prisma } from "../server/prisma";

const CONFIRM = "To be confirmed by Serine Diagnostics.";

function isMissing(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return true;

  const text = value.trim().toLowerCase();

  return (
    text === CONFIRM.toLowerCase() ||
    text.includes("quest catalog item imported for demonstration")
  );
}

function detectSpecimen(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();

  if (
    text.includes("urine") ||
    text.includes("urinalysis") ||
    text.includes("urinary")
  ) {
    return "Urine";
  }

  if (
    text.includes("stool") ||
    text.includes("fecal") ||
    text.includes("faecal")
  ) {
    return "Stool";
  }

  if (
    text.includes("saliva") ||
    text.includes("salivary")
  ) {
    return "Saliva";
  }

  if (
    text.includes("swab") ||
    text.includes("nasal") ||
    text.includes("nasopharyngeal") ||
    text.includes("vaginal")
  ) {
    return "Swab";
  }

  if (
    text.includes("semen") ||
    text.includes("sperm")
  ) {
    return "Semen";
  }

  if (
    text.includes("csf") ||
    text.includes("cerebrospinal")
  ) {
    return "Cerebrospinal fluid (CSF)";
  }

  if (
    text.includes("blood") ||
    text.includes("cbc") ||
    text.includes("hemoglobin") ||
    text.includes("hematocrit") ||
    text.includes("platelet") ||
    text.includes("cholesterol") ||
    text.includes("lipid") ||
    text.includes("glucose") ||
    text.includes("diabetes") ||
    text.includes("a1c") ||
    text.includes("hba1c") ||
    text.includes("thyroid") ||
    text.includes("tsh") ||
    text.includes("t4") ||
    text.includes("t3") ||
    text.includes("vitamin") ||
    text.includes("ferritin") ||
    text.includes("iron") ||
    text.includes("calcium") ||
    text.includes("magnesium") ||
    text.includes("sodium") ||
    text.includes("potassium") ||
    text.includes("creatinine") ||
    text.includes("kidney") ||
    text.includes("liver") ||
    text.includes("hepatitis") ||
    text.includes("hiv") ||
    text.includes("hormone") ||
    text.includes("testosterone") ||
    text.includes("estrogen") ||
    text.includes("psa") ||
    text.includes("crp") ||
    text.includes("cortisol")
  ) {
    return "Blood";
  }

  return "Specimen type depends on the specific assay; confirm collection requirements with Serine Diagnostics.";
}

function getWhatIsTested(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase();

  if (text.includes("complete blood count") || /\bcbc\b/.test(text)) {
    return [
      "Red blood cell count",
      "White blood cell count",
      "Hemoglobin",
      "Hematocrit",
      "Red blood cell indices",
      "Platelet count",
      "White blood cell differential",
    ];
  }

  if (
    text.includes("comprehensive metabolic panel") ||
    /\bcmp\b/.test(text)
  ) {
    return [
      "Glucose",
      "Calcium",
      "Sodium",
      "Potassium",
      "Chloride",
      "Carbon dioxide",
      "BUN",
      "Creatinine",
      "Total protein",
      "Albumin",
      "Bilirubin",
      "Alkaline phosphatase",
      "AST",
      "ALT",
    ];
  }

  if (
    text.includes("lipid") ||
    text.includes("cholesterol panel") ||
    text.includes("cholesterol")
  ) {
    return [
      "Total cholesterol",
      "HDL cholesterol",
      "LDL cholesterol",
      "Triglycerides",
    ];
  }

  if (
    text.includes("hba1c") ||
    text.includes("hemoglobin a1c") ||
    text.includes("a1c")
  ) {
    return [
      "Hemoglobin A1c percentage",
      "Estimated average glucose (eAG)",
    ];
  }

  if (text.includes("thyroid") || /\btsh\b/.test(text)) {
    return [
      "Thyroid-stimulating hormone (TSH)",
      "Thyroid hormone levels when included in the ordered test",
    ];
  }

  if (text.includes("vitamin d")) {
    return [
      "25-hydroxy vitamin D",
    ];
  }

  if (
    text.includes("vitamin b12") ||
    text.includes("b-12") ||
    text.includes("cobalamin")
  ) {
    return [
      "Vitamin B12 (cobalamin)",
    ];
  }

  if (text.includes("folate") || text.includes("folic acid")) {
    return [
      "Folate (folic acid)",
    ];
  }

  if (
    text.includes("ferritin") ||
    text.includes("iron & tibc") ||
    text.includes("iron and tibc") ||
    text.includes("iron panel")
  ) {
    return [
      "Ferritin",
      "Serum iron",
      "Iron-binding capacity",
      "Transferrin saturation when included",
    ];
  }

  if (
    text.includes("crp") ||
    text.includes("c-reactive protein")
  ) {
    return [
      "C-reactive protein (CRP)",
    ];
  }

  if (text.includes("psa")) {
    return [
      "Prostate-specific antigen (PSA)",
    ];
  }

  if (text.includes("hiv")) {
    return [
      "HIV antigen and/or antibodies, depending on the test",
    ];
  }

  if (text.includes("hepatitis")) {
    return [
      "Hepatitis-specific antigens and/or antibodies",
      "Markers appropriate to the ordered hepatitis test",
    ];
  }

  if (
    text.includes("chlamydia") ||
    text.includes("gonorrhea") ||
    text.includes("n. gonorrhoeae")
  ) {
    return [
      "Chlamydia trachomatis",
      "Neisseria gonorrhoeae",
    ];
  }

  if (text.includes("hpv")) {
    return [
      "Human papillomavirus (HPV) genetic material or high-risk HPV markers",
    ];
  }

  if (text.includes("urinalysis") || text.includes("urine analysis")) {
    return [
      "Urine appearance",
      "Chemical markers",
      "Protein",
      "Glucose",
      "Blood",
      "Ketones",
      "Nitrite",
      "Leukocyte esterase",
      "Microscopic urine elements when included",
    ];
  }

  if (text.includes("uric acid") || text.includes("gout")) {
    return [
      "Uric acid level",
    ];
  }

  if (text.includes("magnesium")) {
    return [
      "Serum magnesium",
    ];
  }

  if (text.includes("calcium")) {
    return [
      "Calcium level",
    ];
  }

  if (text.includes("copper")) {
    return [
      "Copper level",
    ];
  }

  if (text.includes("iodine")) {
    return [
      "Iodine level or iodine-related marker specified by the test",
    ];
  }

  if (
    text.includes("lead") ||
    text.includes("heavy metal") ||
    text.includes("heavy metals")
  ) {
    return [
      "Lead and/or other heavy metals included in the ordered panel",
    ];
  }

  if (text.includes("homocysteine")) {
    return [
      "Homocysteine level",
    ];
  }

  if (text.includes("cortisol")) {
    return [
      "Cortisol level",
    ];
  }

  if (text.includes("dhea")) {
    return [
      "DHEA or DHEA-S level",
    ];
  }

  if (
    text.includes("insulin resistance") ||
    text.includes("insulin")
  ) {
    return [
      "Insulin level",
      "Glucose-related markers when included",
      "Additional insulin-resistance markers when included",
    ];
  }

  if (
    text.includes("allergy") ||
    text.includes("allergen")
  ) {
    return [
      "Allergen-specific IgE antibodies and/or related allergy markers",
    ];
  }

  if (
    text.includes("celiac") ||
    text.includes("gluten")
  ) {
    return [
      "Celiac-related antibodies",
      "Additional gluten/celiac markers included in the ordered panel",
    ];
  }

  if (
    text.includes("respiratory") ||
    text.includes("respiratory infection")
  ) {
    return [
      "Pathogen-specific genetic material and/or antigen markers included in the panel",
    ];
  }

  if (
    text.includes("drug screen") ||
    text.includes("drug test") ||
    text.includes("toxicology")
  ) {
    return [
      "Drug or drug-metabolite markers included in the ordered panel",
    ];
  }

  if (
    text.includes("mmr") ||
    text.includes("measles") ||
    text.includes("mumps") ||
    text.includes("rubella")
  ) {
    return [
      "Measles antibodies",
      "Mumps antibodies",
      "Rubella antibodies",
    ];
  }

  return [
    `Markers and measurements included in the ${name} test or panel`,
  ];
}

function getWhy(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();

  if (
    text.includes("screen") ||
    text.includes("screening")
  ) {
    return `This test is performed to screen for conditions or risk factors relevant to ${name}. It may be ordered as part of routine health assessment or based on individual clinical needs.`;
  }

  if (
    text.includes("allergy") ||
    text.includes("allergen")
  ) {
    return "This test is performed to help investigate possible allergic sensitivity and identify immune responses to specific allergens.";
  }

  if (
    text.includes("infection") ||
    text.includes("infectious") ||
    text.includes("hiv") ||
    text.includes("hepatitis") ||
    text.includes("chlamydia") ||
    text.includes("gonorrhea")
  ) {
    return "This test is performed to help evaluate for a possible infection or exposure and to support appropriate clinical assessment.";
  }

  if (
    text.includes("hormone") ||
    text.includes("thyroid") ||
    text.includes("cortisol") ||
    text.includes("testosterone") ||
    text.includes("estrogen")
  ) {
    return "This test is performed to evaluate hormone-related health concerns, symptoms, or changes in endocrine function.";
  }

  if (
    text.includes("monitor") ||
    text.includes("monitoring")
  ) {
    return "This test may be performed to monitor a known condition, treatment response, or changes in relevant laboratory markers.";
  }

  return `This test is performed to help evaluate health concerns related to ${name}. Your healthcare provider may order it based on symptoms, medical history, screening needs, or ongoing monitoring.`;
}

function getWhatItHelpsEvaluate(
  name: string,
  description: string
): string {
  const text = `${name} ${description}`.toLowerCase();

  if (
    text.includes("cbc") ||
    text.includes("complete blood count")
  ) {
    return "It helps evaluate red and white blood cell counts, hemoglobin, hematocrit, platelets, and other blood-cell characteristics.";
  }

  if (
    text.includes("cmp") ||
    text.includes("comprehensive metabolic panel")
  ) {
    return "It helps evaluate blood glucose, kidney function, liver-related markers, electrolytes, proteins, and other metabolic measurements.";
  }

  if (
    text.includes("lipid") ||
    text.includes("cholesterol")
  ) {
    return "It helps evaluate cholesterol and triglyceride levels and can support assessment of cardiovascular risk.";
  }

  if (
    text.includes("hba1c") ||
    text.includes("a1c") ||
    text.includes("diabetes")
  ) {
    return "It helps evaluate average blood glucose levels over the previous several weeks to months and supports diabetes screening or monitoring.";
  }

  if (
    text.includes("thyroid") ||
    text.includes("tsh")
  ) {
    return "It helps evaluate thyroid function and can support assessment of symptoms associated with abnormal thyroid activity.";
  }

  if (
    text.includes("iron") ||
    text.includes("ferritin")
  ) {
    return "It helps evaluate iron stores and iron availability and can support assessment of iron deficiency or iron overload.";
  }

  if (
    text.includes("vitamin")
  ) {
    return "It helps evaluate the level of the specified vitamin and can support assessment of nutritional status or deficiency.";
  }

  if (
    text.includes("allergy") ||
    text.includes("allergen")
  ) {
    return "It helps evaluate immune sensitization to the allergens included in the test.";
  }

  if (
    text.includes("infection") ||
    text.includes("infectious") ||
    text.includes("hiv") ||
    text.includes("hepatitis")
  ) {
    return "It helps evaluate markers associated with the infection or exposure being investigated.";
  }

  return `It helps evaluate laboratory markers associated with ${name} and may provide information useful for clinical assessment.`;
}

function getSymptoms(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();

  if (
    text.includes("allergy") ||
    text.includes("allergen")
  ) {
    return "Possible symptoms may include sneezing, nasal congestion, itching, skin reactions, watery eyes, or other symptoms associated with allergic exposure.";
  }

  if (
    text.includes("infection") ||
    text.includes("hiv") ||
    text.includes("hepatitis") ||
    text.includes("chlamydia") ||
    text.includes("gonorrhea")
  ) {
    return "Possible symptoms vary by infection and may include fever, fatigue, pain, discharge, swollen glands, or no symptoms at all. Testing may be appropriate even when symptoms are absent.";
  }

  if (
    text.includes("anemia") ||
    text.includes("iron") ||
    text.includes("ferritin")
  ) {
    return "Possible signs may include fatigue, weakness, dizziness, shortness of breath, headaches, or reduced exercise tolerance.";
  }

  if (
    text.includes("thyroid") ||
    text.includes("tsh")
  ) {
    return "Possible symptoms may include fatigue, changes in weight, temperature sensitivity, changes in heart rate, sleep changes, or changes in mood.";
  }

  if (
    text.includes("diabetes") ||
    text.includes("glucose") ||
    text.includes("hba1c") ||
    text.includes("a1c")
  ) {
    return "Possible symptoms may include increased thirst, frequent urination, fatigue, blurred vision, or unexplained changes in weight. Some people have no symptoms.";
  }

  return "Signs and symptoms depend on the condition being evaluated. Some abnormal laboratory results may occur without noticeable symptoms.";
}

function getClinicalSignificance(
  name: string,
  description: string
): string {
  return `The ${name} test provides laboratory information that may help a healthcare professional assess the patient's clinical status. Results should be interpreted together with symptoms, medical history, medications, physical examination, and other relevant tests. An abnormal result does not by itself establish a diagnosis.`;
}

function getPatientPreparation(
  fastingRequired: boolean | null | undefined,
  fastingHours: number | null | undefined,
  name: string
): string {
  if (fastingRequired) {
    if (fastingHours && fastingHours > 0) {
      return `Fasting is required before this test. Please follow the laboratory or healthcare provider's instructions for approximately ${fastingHours} hours of fasting before specimen collection.`;
    }

    return "Fasting may be required before this test. Follow the specific preparation instructions provided by Serine Diagnostics or your healthcare provider.";
  }

  return `No special preparation is indicated in the current test information for ${name}. Continue to follow any specific instructions provided by Serine Diagnostics or your healthcare provider.`;
}

function getImportantInformation(
  name: string
): string {
  return `Test requirements can vary depending on the exact test and clinical situation. Please follow the collection and preparation instructions provided by Serine Diagnostics. Results should be reviewed with a qualified healthcare professional and should not be used as the sole basis for diagnosis or treatment.`;
}

function getRelatedTests(
  name: string,
  description: string
): string[] {
  const text = `${name} ${description}`.toLowerCase();

  if (
    text.includes("cbc") ||
    text.includes("complete blood count")
  ) {
    return [
      "Iron & TIBC with Ferritin",
      "Vitamin B12",
      "Folate",
    ];
  }

  if (
    text.includes("cmp") ||
    text.includes("comprehensive metabolic")
  ) {
    return [
      "Lipid Panel",
      "HbA1c",
      "Complete Blood Count (CBC)",
    ];
  }

  if (
    text.includes("lipid") ||
    text.includes("cholesterol")
  ) {
    return [
      "HbA1c",
      "Comprehensive Metabolic Panel (CMP)",
      "High-Sensitivity C-Reactive Protein (hs-CRP)",
    ];
  }

  if (
    text.includes("hba1c") ||
    text.includes("a1c") ||
    text.includes("diabetes")
  ) {
    return [
      "Comprehensive Metabolic Panel (CMP)",
      "Lipid Panel",
      "Insulin Resistance Test",
    ];
  }

  if (
    text.includes("thyroid") ||
    text.includes("tsh")
  ) {
    return [
      "Free T4",
      "Free T3",
      "Thyroid Antibody Tests",
    ];
  }

  if (
    text.includes("iron") ||
    text.includes("ferritin")
  ) {
    return [
      "Complete Blood Count (CBC)",
      "Vitamin B12",
      "Folate",
    ];
  }

  if (
    text.includes("vitamin b12") ||
    text.includes("folate") ||
    text.includes("vitamin")
  ) {
    return [
      "Complete Blood Count (CBC)",
      "Iron & TIBC with Ferritin",
    ];
  }

  if (
    text.includes("allergy") ||
    text.includes("allergen")
  ) {
    return [
      "Total IgE",
      "CBC with Differential",
    ];
  }

  if (
    text.includes("chlamydia") ||
    text.includes("gonorrhea")
  ) {
    return [
      "HIV Test",
      "Syphilis Test",
      "Hepatitis B Test",
    ];
  }

  if (text.includes("hiv")) {
    return [
      "Hepatitis B Test",
      "Hepatitis C Test",
      "Syphilis Test",
    ];
  }

  if (text.includes("hepatitis")) {
    return [
      "HIV Test",
      "Syphilis Test",
    ];
  }

  if (
    text.includes("urinalysis") ||
    text.includes("urine")
  ) {
    return [
      "Urine Culture",
      "Comprehensive Metabolic Panel (CMP)",
    ];
  }

  return [];
}

async function main() {
  console.log("==============================================");
  console.log(" Serine Diagnostics - Bulk Test Detail Update");
  console.log("==============================================");
  console.log("");

  const tests = await prisma.labTest.findMany({
    orderBy: {
      name: "asc",
    },
  });

  console.log(`Found ${tests.length} records in database.`);
  console.log("");

  let updated = 0;
  let skipped = 0;

  for (const test of tests) {
    /*
     * Only populate actual TEST/PANEL records.
     * SERVICE and KIT records are skipped.
     */
    if (
      test.itemType &&
      test.itemType !== "TEST" &&
      test.itemType !== "PANEL"
    ) {
      skipped++;
      continue;
    }

    const name = test.name || "";
    const description = test.description || "";

    const data: Record<string, unknown> = {};

    if (isMissing(test.whyItIsDone)) {
      data.whyItIsDone = getWhy(name, description);
    }

    if (isMissing(test.whatItHelpsEvaluate)) {
      data.whatItHelpsEvaluate = getWhatItHelpsEvaluate(
        name,
        description
      );
    }

    if (!test.whatIsTested || test.whatIsTested.length === 0) {
      data.whatIsTested = getWhatIsTested(
        name,
        description
      );
    }

    if (isMissing(test.clinicalSignificance)) {
      data.clinicalSignificance = getClinicalSignificance(
        name,
        description
      );
    }

    if (isMissing(test.abnormalSymptoms)) {
      data.abnormalSymptoms = getSymptoms(
        name,
        description
      );
    }

    if (isMissing(test.specimenType)) {
      data.specimenType = detectSpecimen(
        name,
        description
      );
    }

    /*
     * DO NOT invent specimen volume.
     */
    if (isMissing(test.specimenVolume)) {
      data.specimenVolume = CONFIRM;
    }

    /*
     * DO NOT invent collection kit.
     */
    if (isMissing(test.collectionKit)) {
      data.collectionKit = CONFIRM;
    }

    if (isMissing(test.patientPreparation)) {
      data.patientPreparation = getPatientPreparation(
        test.fastingRequired,
        test.fastingHours,
        name
      );
    }

    if (isMissing(test.importantInformation)) {
      data.importantInformation =
        getImportantInformation(name);
    }

    if (
      !test.relatedTests ||
      test.relatedTests.length === 0
    ) {
      const related = getRelatedTests(
        name,
        description
      );

      data.relatedTests =
        related.length > 0
          ? related
          : ["Related testing should be selected based on the patient's clinical needs."];
    }

    /*
     * IMPORTANT:
     * Price, name, code, category, active,
     * bookable and turnaroundTime are NOT changed.
     */
    if (Object.keys(data).length === 0) {
      skipped++;
      continue;
    }

    await prisma.labTest.update({
      where: {
        id: test.id,
      },
      data,
    });

    updated++;

    console.log(
      `✓ Updated: ${name} (${test.code})`
    );
  }

  console.log("");
  console.log("==============================================");
  console.log(" Bulk update completed");
  console.log("==============================================");
  console.log(`Total records : ${tests.length}`);
  console.log(`Updated       : ${updated}`);
  // Verify every TEST/PANEL record has patient-facing detail content.
  const verify = await prisma.labTest.findMany({
    where: { itemType: { in: ["TEST", "PANEL"] } },
    select: {
      id: true,
      name: true,
      whyItIsDone: true,
      whatItHelpsEvaluate: true,
      clinicalSignificance: true,
      abnormalSymptoms: true,
      specimenVolume: true,
      collectionKit: true,
      patientPreparation: true,
      importantInformation: true,
      whatIsTested: true,
      relatedTests: true,
    },
  });

  const incomplete = verify.filter((t) =>
    isMissing(t.whyItIsDone) ||
    isMissing(t.whatItHelpsEvaluate) ||
    isMissing(t.clinicalSignificance) ||
    isMissing(t.abnormalSymptoms) ||
    isMissing(t.specimenVolume) ||
    isMissing(t.collectionKit) ||
    isMissing(t.patientPreparation) ||
    isMissing(t.importantInformation) ||
    t.whatIsTested.length === 0 ||
    t.relatedTests.length === 0
  );

  console.log(`TEST/PANEL verified: ${verify.length}`);
  console.log(`Incomplete after update: ${incomplete.length}`);
  if (incomplete.length > 0) {
    console.log("Incomplete tests:");
    for (const t of incomplete.slice(0, 25)) console.log(` - ${t.name}`);
  }
  console.log(`Skipped       : ${skipped}`);
  console.log("");
  console.log(
    "Price, active status, booking status and other existing fields were preserved."
  );
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Bulk update failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });