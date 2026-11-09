import { LabTest, LabPackage, LabLocation } from '../types';

export const LAB_TESTS: LabTest[] = [
  {
    id: 'cbc',
    code: 'SER-85025',
    name: 'Complete Blood Count (CBC) with Differential',
    category: 'hematology',
    categoryLabel: 'Hematology',

    description:
      'Measures red blood cells, white blood cells, platelets, hemoglobin, hematocrit, and other blood cell markers to provide a broad view of blood health.',

    fastingRequired: false,

    turnaroundTime: 'Same Day (4–6 hours)',

    specimenType: 'Whole Blood (EDTA Lavender Top)',

    price: 34,

    active: true,

    popular: true,

    commonFor: [
      'Fatigue',
      'Routine physical',
      'Infection screen',
      'Immune status',
    ],

    clinicalSignificance:
      'CBC results can provide information about blood cell production, oxygen-carrying capacity, immune activity, and platelet levels. Abnormal findings may be associated with anemia, infection, inflammation, or other blood-related conditions and should be interpreted with the patient’s symptoms and medical history.',

    whyItIsDone:
      'A CBC may be used as part of routine health screening, to help evaluate symptoms such as fatigue or signs of infection, or to monitor certain health conditions and their treatment.',

    whatItHelpsEvaluate:
      'A CBC evaluates red blood cells, hemoglobin, hematocrit, white blood cells, platelets, and related measurements. The differential also measures different types of white blood cells, including neutrophils, lymphocytes, monocytes, eosinophils, and basophils.',

    abnormalSymptoms:
      'Depending on which measurements are outside the expected range, some people may experience fatigue, weakness, fever, frequent infections, unusual bruising, or bleeding. Some people with abnormal results may have no noticeable symptoms.',

    specimenVolume:
      'To be confirmed by Serine Diagnostics.',

    collectionKit:
      'To be confirmed by Serine Diagnostics.',

    patientPreparation:
      'No special preparation is generally required. Confirm collection instructions with Serine Diagnostics before testing.',

    importantInformation:
      'A CBC provides useful information about blood cell health but does not diagnose a specific condition on its own. Results should be interpreted by a qualified healthcare professional together with symptoms, medical history, and other laboratory findings.',

    relatedTests: [
      'Comprehensive Metabolic Panel (CMP-14)',
      'Iron & Total Iron-Binding Capacity (TIBC) with Ferritin',
      'Vitamin B12 and Folate Panel',
    ],
    whatIsTested: [
      'Red blood cells',
      'Hemoglobin',
      'Hematocrit',
      'Mean corpuscular volume (MCV)',
      'Mean corpuscular hemoglobin (MCH)',
      'Mean corpuscular hemoglobin concentration (MCHC)',
      'Red cell distribution width (RDW)',
      'Platelets',
      'Mean platelet volume (MPV)',
      'White blood cells',
      'Neutrophils',
      'Lymphocytes',
      'Monocytes',
      'Eosinophils',
      'Basophils',
    ],

  },

  {
    id: 'cmp',
    code: 'SER-80053',
    name: 'Comprehensive Metabolic Panel (CMP-14)',
    category: 'biochemistry',
    categoryLabel: 'Biochemistry',
    description:
      'Evaluates 14 vital chemical substances including kidney function (BUN, Creatinine), liver function (ALT, AST, ALP, Bilirubin), electrolytes (Sodium, Potassium, Chloride, CO2), glucose, and proteins.',
    fastingRequired: true,
    fastingHours: 10,
    turnaroundTime: 'Same Day (4–6 hours)',
    specimenType: 'Serum (SST Gold Top)',
    price: 45,
    active: true,
    popular: true,
    commonFor: [
      'Annual checkup',
      'Kidney & liver health',
      'Electrolyte balance',
      'Medication monitoring',
    ],
    clinicalSignificance:
      'Essential baseline metabolic assessment for organ function and fluid balance.',
    whyItIsDone:
      'A CMP is commonly ordered for routine health assessment, to evaluate symptoms, monitor chronic conditions, or follow the effects of medications that may affect kidney, liver, electrolyte, or glucose balance.',
    whatItHelpsEvaluate:
      'The panel evaluates glucose, calcium, electrolytes, proteins, bilirubin, and enzymes and waste products commonly used to assess liver and kidney function.',
    abnormalSymptoms:
      'Possible symptoms associated with abnormalities vary widely and may include fatigue, weakness, nausea, changes in urination, swelling, abdominal discomfort, excessive thirst, or no symptoms at all.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'Fasting may be required for this test. Follow the specific fasting and medication instructions provided by your healthcare professional or Serine Diagnostics.',
    importantInformation:
      'Individual CMP results should not be interpreted in isolation. Abnormal values may have many causes and should be reviewed with a qualified healthcare professional.',
    whatIsTested: [
      'Glucose',
      'Calcium',
      'Sodium',
      'Potassium',
      'Chloride',
      'Carbon dioxide (CO2)',
      'BUN',
      'Creatinine',
      'Albumin',
      'Total protein',
      'Bilirubin',
      'Alkaline phosphatase (ALP)',
      'ALT',
      'AST',
    ],

  },

  {
    id: 'lipid-panel',
    code: 'SER-80061',
    name: 'Lipid Panel with Cardio Risk Ratios',
    category: 'biochemistry',
    categoryLabel: 'Biochemistry',
    description:
      'Comprehensive cholesterol screen measuring Total Cholesterol, HDL (good), LDL (bad), Triglycerides, Non-HDL, and Total/HDL risk ratio.',
    fastingRequired: true,
    fastingHours: 12,
    turnaroundTime: 'Same Day',
    specimenType: 'Serum (SST Gold Top)',
    price: 38,
    active: true,
    popular: true,
    commonFor: [
      'Heart disease screening',
      'Statin monitoring',
      'Cardiovascular risk',
    ],
    clinicalSignificance:
      'Identifies cardiovascular risk and dyslipidemia for preventative heart health.',
    whyItIsDone:
      'A lipid panel may be used for routine cardiovascular risk assessment, to monitor cholesterol treatment, or to evaluate people with risk factors for heart disease.',
    whatItHelpsEvaluate:
      'The panel evaluates total cholesterol, HDL cholesterol, LDL cholesterol, triglycerides, non-HDL cholesterol, and calculated cholesterol ratios used in cardiovascular risk assessment.',
    abnormalSymptoms:
      'High cholesterol and triglycerides often cause no symptoms. When symptoms occur, they are usually related to an underlying condition rather than the cholesterol level itself.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'Fasting may be recommended or required depending on the specific test and clinical purpose. Follow the instructions provided by Serine Diagnostics or your healthcare professional.',
    importantInformation:
      'Lipid results are interpreted together with age, medical history, blood pressure, smoking status, diabetes status, family history, and other cardiovascular risk factors.',
    whatIsTested: [
      'Total cholesterol',
      'HDL cholesterol',
      'LDL cholesterol',
      'Triglycerides',
      'Non-HDL cholesterol',
      'Total cholesterol/HDL ratio',
    ],

  },

  {
    id: 'hba1c',
    code: 'SER-83036',
    name: 'Hemoglobin A1c (HbA1c) with eAG',
    category: 'endocrinology',
    categoryLabel: 'Endocrinology',
    description:
      'Measures average blood glucose control over the preceding 2 to 3 months, providing estimated Average Glucose (eAG).',
    fastingRequired: false,
    turnaroundTime: 'Same Day',
    specimenType: 'Whole Blood (EDTA Lavender Top)',
    price: 36,
    active: true,
    popular: true,
    commonFor: [
      'Prediabetes screening',
      'Diabetes monitoring',
      'Metabolic health',
    ],
    clinicalSignificance:
      'Primary diagnostic test and therapeutic monitoring tool for diabetes and insulin resistance.',
    whyItIsDone:
      'HbA1c may be used to screen for or diagnose diabetes and prediabetes and to monitor longer-term blood glucose control in people with diabetes.',
    whatItHelpsEvaluate:
      'The test estimates longer-term blood glucose control and reports an HbA1c percentage and, when provided by the laboratory, an estimated average glucose (eAG).',
    abnormalSymptoms:
      'Prediabetes and diabetes may have no noticeable symptoms. When glucose levels are elevated, symptoms can include increased thirst, frequent urination, fatigue, blurred vision, or unexplained weight changes.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'No fasting is generally required. Follow any specific instructions provided by your healthcare professional.',
    importantInformation:
      'HbA1c can be affected by some conditions involving red blood cells or hemoglobin. Results should be interpreted in clinical context.',
    whatIsTested: [
      'Hemoglobin A1c (HbA1c)',
      'Estimated average glucose (eAG), when reported',
    ],

  },

  {
    id: 'tsh-thyroid',
    code: 'SER-84443',
    name: 'Thyroid Stimulating Hormone (TSH) with Reflex FT4',
    category: 'endocrinology',
    categoryLabel: 'Endocrinology',
    description:
      'Highly sensitive third-generation immunoassay to assess thyroid gland activity for hypothyroidism or hyperthyroidism.',
    fastingRequired: false,
    turnaroundTime: 'Same Day',
    specimenType: 'Serum (SST Gold Top)',
    price: 42,
    active: true,
    popular: true,
    commonFor: [
      'Unexplained weight changes',
      'Fatigue / Hair thinning',
      'Thyroid medication management',
    ],
    clinicalSignificance:
      'First-line biomarker for screening and managing thyroid dysfunction.',
    whyItIsDone:
      'TSH testing is commonly used when symptoms or clinical findings suggest thyroid dysfunction, for routine thyroid assessment in selected patients, or to monitor thyroid hormone treatment.',
    whatItHelpsEvaluate:
      'The test evaluates thyroid-stimulating hormone and, when reflex criteria are met, may lead to measurement of free T4 to further assess thyroid function.',
    abnormalSymptoms:
      'Symptoms associated with thyroid disorders may include fatigue, changes in weight, sensitivity to heat or cold, changes in heart rate, sleep changes, or hair and skin changes. Symptoms vary and may have many causes.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'No special preparation is generally required unless otherwise instructed. Tell your healthcare professional about thyroid medicines and supplements.',
    importantInformation:
      'TSH results should be interpreted with symptoms, medical history, medications, and, when available, free T4 and other thyroid testing.',
    whatIsTested: [
      'Thyroid-stimulating hormone (TSH)',
      'Free T4, when reflex criteria are met',
    ],

  },

  {
    id: 'vitamin-d',
    code: 'SER-82306',
    name: 'Vitamin D, 25-Hydroxy (25-OH Total)',
    category: 'wellness',
    categoryLabel: 'Wellness & Nutrition',
    description:
      'Quantitative measurement of 25-hydroxyvitamin D2 and D3 levels to evaluate bone health, immune function, and deficiency.',
    fastingRequired: false,
    turnaroundTime: '24 Hours',
    specimenType: 'Serum (SST Gold Top)',
    price: 49,
    active: true,
    popular: true,
    commonFor: [
      'Bone density issues',
      'Low sun exposure (Midwest)',
      'Fatigue & immunity',
    ],
    clinicalSignificance:
      'Evaluates vitamin D sufficiency, critical for calcium absorption and cellular defense.',
    whyItIsDone:
      'Testing may be considered when vitamin D deficiency is suspected, in people with certain bone-health risk factors, or when a healthcare professional is monitoring vitamin D status.',
    whatItHelpsEvaluate:
      `The test measures 25-hydroxyvitamin D in blood to help assess whether vitamin D levels are low, adequate, or elevated in the context of the laboratory's reference range.`,
    abnormalSymptoms:
      'Low vitamin D may occur without symptoms. When symptoms are present, they can be nonspecific and may include bone discomfort or muscle weakness.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'No fasting is generally required unless other tests collected at the same time require fasting.',
    importantInformation:
      `Vitamin D results should be interpreted using the laboratory's reference range and clinical context. Supplement use should be discussed with a healthcare professional.`,
    whatIsTested: [
      '25-hydroxyvitamin D2',
      '25-hydroxyvitamin D3',
      'Total 25-hydroxyvitamin D',
    ],

  },

  {
    id: 'vitamin-b12-folate',
    code: 'SER-82607',
    name: 'Vitamin B12 and Folate Panel',
    category: 'wellness',
    categoryLabel: 'Wellness & Nutrition',
    description:
      'Evaluates cobalamin and folic acid levels for neurological health, cellular energy, and macrocytic anemia.',
    fastingRequired: true,
    fastingHours: 8,
    turnaroundTime: '24 Hours',
    specimenType: 'Serum (SST Gold Top)',
    price: 52,
    active: true,
    popular: false,
    commonFor: [
      'Numbness/tingling',
      'Memory fog',
      'Vegan/vegetarian diets',
      'Fatigue',
    ],
    clinicalSignificance:
      'Detects vitamin B12 deficiency causing neurological dysfunction and anemia.',
    whyItIsDone:
      'The panel may be used to evaluate unexplained anemia, fatigue, numbness or tingling, dietary risk factors, or suspected vitamin deficiency.',
    whatItHelpsEvaluate:
      'The panel measures vitamin B12 and folate levels to help assess whether a deficiency may be contributing to blood-count or neurologic findings.',
    abnormalSymptoms:
      'Possible deficiency-related symptoms include fatigue, weakness, pale skin, numbness or tingling, balance problems, or changes in concentration. Some people have no symptoms.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'Fasting requirements can vary by laboratory and by tests ordered at the same time. Follow the instructions provided by Serine Diagnostics.',
    importantInformation:
      `Vitamin levels should be interpreted with the patient's diet, medications, blood counts, symptoms, and other laboratory findings.`,
    whatIsTested: [
      'Vitamin B12 (cobalamin)',
      'Folate',
    ],

  },

  {
    id: 'psa-total',
    code: 'SER-84153',
    name: 'Prostate-Specific Antigen (PSA) Total',
    category: 'endocrinology',
    categoryLabel: "Men's Health",
    description:
      'Screening biomarker for prostate inflammation, benign prostatic hyperplasia (BPH), and prostate cellular abnormalities.',
    fastingRequired: false,
    turnaroundTime: 'Same Day',
    specimenType: 'Serum (SST Gold Top)',
    price: 48,
    active: true,
    popular: true,
    commonFor: [
      'Men age 45+',
      'Prostate check',
      'Urinary symptom assessment',
    ],
    clinicalSignificance:
      'Screening tool for prostatic enlargement and monitoring ongoing prostate health.',
    whyItIsDone:
      'A total PSA test may be used as part of a discussion about prostate cancer screening, to evaluate certain prostate-related symptoms, or to monitor people with a known prostate condition.',
    whatItHelpsEvaluate:
      'The test measures total prostate-specific antigen in blood and may provide information about prostate activity when interpreted with age, symptoms, examination findings, and prior PSA results.',
    abnormalSymptoms:
      'An elevated PSA does not necessarily cause symptoms. Urinary frequency, weak urine flow, difficulty urinating, pelvic discomfort, or blood in urine or semen may occur with some prostate conditions.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'Follow the collection instructions provided by your healthcare professional. Tell them about recent urologic procedures, prostate-related symptoms, and medications.',
    importantInformation:
      'PSA is not specific for prostate cancer, and a single result cannot diagnose cancer. Screening decisions and follow-up should be discussed with a qualified healthcare professional.',
    whatIsTested: [
      'Total prostate-specific antigen (PSA)',
    ],

  },

  {
    id: 'crp-hs',
    code: 'SER-86141',
    name: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
    category: 'immunology',
    categoryLabel: 'Cardiovascular / Immunology',
    description:
      'Ultra-sensitive biomarker of systemic vascular inflammation and cardiovascular plaque vulnerability.',
    fastingRequired: false,
    turnaroundTime: 'Same Day',
    specimenType: 'Serum (SST Gold Top)',
    price: 39,
    active: true,
    popular: false,
    commonFor: [
      'Cardiac risk stratification',
      'Autoimmune flare evaluation',
      'Systemic inflammation',
    ],
    clinicalSignificance:
      'Identifies hidden low-grade arterial and systemic inflammation.',
    whyItIsDone:
      'hs-CRP may be ordered when a healthcare professional wants additional information about inflammation or cardiovascular risk in an appropriate clinical context.',
    whatItHelpsEvaluate:
      'The test measures C-reactive protein at a sensitivity suitable for detecting relatively low concentrations in blood.',
    abnormalSymptoms:
      'hs-CRP itself does not cause symptoms. Elevated CRP can occur with many inflammatory or infectious conditions, so symptoms depend on the underlying cause.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'No special preparation is generally required unless other tests collected at the same time require fasting.',
    importantInformation:
      'An elevated hs-CRP is nonspecific and can be influenced by infection, injury, chronic inflammatory conditions, and other factors. It should not be used alone to diagnose a condition.',
    whatIsTested: [
      'High-sensitivity C-reactive protein (hs-CRP)',
    ],

  },

  {
    id: 'respiratory-pcr',
    code: 'SER-87635',
    name: 'Respiratory Multiplex PCR Panel (COVID-19 / Flu A&B / RSV)',
    category: 'infectious',
    categoryLabel: 'Infectious Disease',
    description:
      'Rapid RT-PCR molecular assay differentiating SARS-CoV-2, Influenza A, Influenza B, and Respiratory Syncytial Virus (RSV).',
    fastingRequired: false,
    turnaroundTime: 'Same Day (2–4 hours)',
    specimenType: 'Nasopharyngeal / Anterior Nares Swab',
    price: 85,
    active: true,
    popular: true,
    commonFor: [
      'Fever/cough symptoms',
      'Pre-procedure clearance',
      'Seasonal respiratory illness',
    ],
    clinicalSignificance:
      'Gold-standard molecular differential for acute upper respiratory infections.',
    whyItIsDone:
      'The panel may be used when a patient has symptoms of an acute respiratory infection and identifying a specific viral cause may help guide clinical management or infection-control decisions.',
    whatItHelpsEvaluate:
      'The panel evaluates the specimen for SARS-CoV-2, influenza A, influenza B, and respiratory syncytial virus (RSV).',
    abnormalSymptoms:
      'Common respiratory infection symptoms may include fever, cough, sore throat, congestion, runny nose, fatigue, or body aches. Symptoms vary by infection and patient.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'No fasting is required. Follow specimen-collection instructions provided by Serine Diagnostics.',
    importantInformation:
      'A negative result does not always rule out infection, particularly when specimen timing or collection quality affects detection. Results should be interpreted with symptoms and clinical findings.',
    whatIsTested: [
      'SARS-CoV-2',
      'Influenza A',
      'Influenza B',
      'Respiratory syncytial virus (RSV)',
    ],

  },

  {
    id: 'ferritin-iron',
    code: 'SER-80076',
    name: 'Iron & Total Iron-Binding Capacity (TIBC) with Ferritin',
    category: 'biochemistry',
    categoryLabel: 'Biochemistry',
    description:
      'Comprehensive iron stores profile measuring Serum Iron, TIBC, Transferrin Saturation, and Ferritin storage protein.',
    fastingRequired: true,
    fastingHours: 12,
    turnaroundTime: 'Same Day',
    specimenType: 'Serum (SST Gold Top)',
    price: 54,
    active: true,
    popular: false,
    commonFor: [
      'Anemia investigation',
      'Chronic fatigue',
      'Restless legs',
      'Heavy menses',
    ],
    clinicalSignificance:
      'Identifies both iron deficiency before anemia manifests and iron overload disorders.',
    whyItIsDone:
      'This panel may be used to investigate suspected iron deficiency or iron overload, evaluate certain types of anemia, or monitor iron status during treatment.',
    whatItHelpsEvaluate:
      'The panel evaluates serum iron, total iron-binding capacity (TIBC), transferrin saturation, and ferritin, which together provide information about circulating and stored iron.',
    abnormalSymptoms:
      'Iron deficiency may be associated with fatigue, weakness, pale skin, shortness of breath, or restless legs. Iron overload may have few early symptoms or may cause fatigue and joint or abdominal discomfort.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'Fasting may be required for iron studies depending on the laboratory protocol. Follow the exact instructions provided by Serine Diagnostics.',
    importantInformation:
      'Ferritin can also rise with inflammation or infection, so iron studies should be interpreted together rather than from a single value.',
    whatIsTested: [
      'Serum iron',
      'Total iron-binding capacity (TIBC)',
      'Transferrin saturation',
      'Ferritin',
    ],

  },

  {
    id: 'urinalysis-complete',
    code: 'SER-81003',
    name: 'Urinalysis Complete with Microscopic Reflex',
    category: 'routine',
    categoryLabel: 'Routine',
    description:
      'Automated chemical strip screening with reflex microscopic sediment exam for urinary tract health, renal function, and metabolic indicators.',
    fastingRequired: false,
    turnaroundTime: 'Same Day',
    specimenType: 'Clean-catch Midstream Urine',
    price: 26,
    active: true,
    popular: true,
    commonFor: [
      'UTI symptoms',
      'Routine physical',
      'Kidney stone evaluation',
    ],
    clinicalSignificance:
      'Detects urinary tract infections, microscopic hematuria, proteinuria, and crystalluria.',
    whyItIsDone:
      'Urinalysis may be used during routine health assessment or to evaluate symptoms such as painful urination, frequent urination, blood in urine, flank discomfort, or suspected urinary tract infection.',
    whatItHelpsEvaluate:
      'The test can evaluate urine appearance, chemical markers such as protein, glucose, blood, leukocyte esterase and nitrite, and microscopic findings such as cells, crystals, and casts when performed.',
    abnormalSymptoms:
      'Abnormal urine findings may occur with urinary tract infection, kidney conditions, stones, diabetes, dehydration, or other conditions. Some abnormalities cause no symptoms.',
    specimenVolume:
      'To be confirmed by Serine Diagnostics.',
    collectionKit:
      'To be confirmed by Serine Diagnostics.',
    patientPreparation:
      'Collect the specimen according to the instructions provided by Serine Diagnostics, using a clean container and avoiding contamination when possible.',
    importantInformation:
      'A urinalysis alone does not establish a diagnosis. Abnormal findings may require repeat testing, urine culture, blood tests, imaging, or other clinical evaluation.',
    whatIsTested: [
      'Urine appearance',
      'Urine specific gravity',
      'Urine pH',
      'Protein',
      'Glucose',
      'Ketones',
      'Blood/hemoglobin',
      'Leukocyte esterase',
      'Nitrite',
      'Bilirubin',
      'Urobilinogen',
      'Microscopic cells and sediments, when reflexed',
    ],

  },
];

export const LAB_PACKAGES: LabPackage[] = [
  {
    id: 'pkg-essential',
    name: 'Essential Health Baseline',
    badge: 'Most Popular',
    tagline: 'Comprehensive annual preventative checkup',
    description:
      'The premier annual health screen combining 4 vital panels (CBC, CMP-14, Lipid Profile, and Urinalysis) to evaluate major organ systems, metabolism, blood counts, and cardiovascular risk.',
    testCount: 4,
    testsIncluded: [
      'CBC with Differential',
      'Comprehensive Metabolic Panel (CMP)',
      'Lipid Profile with Ratios',
      'Urinalysis Complete',
    ],
    price: 99,
    originalValue: 143,
    fastingRequired: true,
    turnaroundTime: 'Same Day',
    recommendedFor:
      'Adults seeking an annual physical baseline, metabolic check, and wellness review.',
    featured: true,
  },

  {
    id: 'pkg-executive',
    name: 'Executive Comprehensive Wellness',
    badge: 'Most Thorough',
    tagline: 'Deep metabolic, endocrine, cardiac, & nutrient analysis',
    description:
      'An in-depth 360-degree assessment covering vital organ function, full thyroid screening, Vitamin D, HbA1c diabetic index, hs-CRP cardiac inflammation, and iron stores.',
    testCount: 8,
    testsIncluded: [
      'CBC with Diff',
      'CMP-14',
      'Lipid Panel',
      'HbA1c with eAG',
      'TSH with Free T4',
      'Vitamin D 25-OH',
      'hs-CRP Cardiac Inflammatory',
      'Ferritin & Iron Panel',
    ],
    price: 199,
    originalValue: 310,
    fastingRequired: true,
    turnaroundTime: '24 Hours',
    recommendedFor:
      'Individuals wanting thorough preventative insights, executive health audits, or unaddressed fatigue analysis.',
    featured: true,
  },

  {
    id: 'pkg-cardiac',
    name: 'Cardiovascular & Metabolic Shield',
    badge: 'Heart Focus',
    tagline: 'Targeted cardiovascular risk & arterial health',
    description:
      'Specialized profile designed to evaluate arterial inflammation, cholesterol fractions, insulin resistance, and kidney-liver metabolic health.',
    testCount: 5,
    testsIncluded: [
      'Advanced Lipid Panel',
      'hs-CRP High Sensitivity',
      'HbA1c Blood Glucose Index',
      'CMP-14 Kidney & Liver',
      'CBC with Differential',
    ],
    price: 139,
    originalValue: 198,
    fastingRequired: true,
    turnaroundTime: 'Same Day',
    recommendedFor:
      'Family history of heart disease, hypertension, elevated cholesterol, or prediabetes monitoring.',
    featured: false,
  },

  {
    id: 'pkg-womens',
    name: "Women's Vitality & Hormonal Profile",
    badge: "Women's Health",
    tagline: 'Tailored for thyroid, iron stores, bone density, & vitality',
    description:
      'Comprehensive screening targeting women’s health priorities including thyroid regulation, ferritin iron reserves, Vitamin D, CBC, and metabolic panel.',
    testCount: 6,
    testsIncluded: [
      'CBC with Differential',
      'Comprehensive Metabolic Panel',
      'TSH + Free T4',
      'Ferritin Storage Iron',
      'Vitamin D 25-OH',
      'Lipid Panel',
    ],
    price: 169,
    originalValue: 260,
    fastingRequired: true,
    turnaroundTime: '24 Hours',
    recommendedFor:
      'Women experiencing changes in energy, hair/skin, weight fluctuation, or routine annual vitality review.',
    featured: false,
  },

  {
    id: 'pkg-mens',
    name: "Men's Health & Longevity Profile",
    badge: "Men's Health",
    tagline: 'Prostate, metabolic, cardiovascular, & vitality check',
    description:
      'Tailored specifically for men, combining total PSA prostate screening with cardiovascular lipids, liver/kidney biomarkers, glucose control, and blood counts.',
    testCount: 6,
    testsIncluded: [
      'Total PSA Prostate Screen',
      'Lipid Panel with Risk Ratios',
      'CMP-14 Metabolic Panel',
      'HbA1c Glycemic Control',
      'CBC with Diff',
      'hs-CRP Inflammation',
    ],
    price: 179,
    originalValue: 275,
    fastingRequired: true,
    turnaroundTime: 'Same Day',
    recommendedFor:
      'Men age 35+ seeking proactive prostate, heart, and metabolic longevity screening.',
    featured: false,
  },
];

export const LAB_LOCATIONS: LabLocation[] = [
  {
    id: 'centralia-main',
    name: 'Serine Central Reference Laboratory & Patient Center',
    shortName: 'Centralia Main Laboratory',
    address: '101 S Lincoln Blvd',
    city: 'Centralia',
    state: 'IL',
    zip: '62801',
    phone: '872-330-7679',
    fax: '872-330-7679',
    hoursWeekday: '6:30 AM – 6:00 PM',
    hoursSaturday: '7:00 AM – 2:00 PM',
    hoursSunday: 'Closed',
    hasDrawSite: true,
    hasWheelchairAccess: true,
    hasParking: true,
    transitInfo:
      'Convenient Centralia location with validated parking and easy patient access.',
    specialNotes:
      'Full-service reference laboratory with STAT rapid processing and pediatric phlebotomy team.',
  }
];

export const DEMO_TIME_SLOTS = [
  { time: '07:00 AM', period: 'morning', badge: 'Fast Track' },
  { time: '07:30 AM', period: 'morning', badge: 'Fasting Slot' },
  { time: '08:00 AM', period: 'morning', badge: 'Fasting Slot' },
  { time: '08:30 AM', period: 'morning', badge: 'Popular' },
  { time: '09:15 AM', period: 'morning', badge: 'Available' },
  { time: '10:00 AM', period: 'morning', badge: 'Available' },
  { time: '10:45 AM', period: 'morning', badge: 'Available' },
  { time: '11:30 AM', period: 'morning', badge: 'Available' },
  { time: '01:00 PM', period: 'afternoon', badge: 'Available' },
  { time: '01:45 PM', period: 'afternoon', badge: 'Available' },
  { time: '02:30 PM', period: 'afternoon', badge: 'Available' },
  { time: '03:15 PM', period: 'afternoon', badge: 'Fast Track' },
  { time: '04:00 PM', period: 'afternoon', badge: 'Available' },
  { time: '04:45 PM', period: 'afternoon', badge: 'Last Draw' },
];

export const INSURANCES_ACCEPTED = [
  {
    name: 'Blue Cross and Blue Shield of Illinois',
    status: 'In-Network Preferred',
  },
  {
    name: 'UnitedHealthcare (Commercial & Medicare)',
    status: 'In-Network',
  },
  {
    name: 'Aetna Health & Medicare',
    status: 'In-Network',
  },
  {
    name: 'Cigna Healthcare',
    status: 'In-Network',
  },
  {
    name: 'Humana',
    status: 'In-Network',
  },
  {
    name: 'Medicare Part B (Original Medicare)',
    status: 'Participating Provider',
  },
  {
    name: 'Illinois Medicaid (HealthChoice Illinois)',
    status: 'In-Network',
  },
  {
    name: 'Self-Pay / Cash Discount Program',
    status: 'Direct Transparent Rates',
  },
];

export const FAQS = [
  {
    q: 'Do I need a doctor’s order to get tested at Serine Diagnostics?',
    a: 'For insurance-billed clinical diagnostic tests, a requisition order from a licensed healthcare provider is standard. For our wellness packages and self-pay routine screenings, Serine Diagnostics offers clinical physician-oversight ordering pathways where allowable by state regulations.',
  },
  {
    q: 'What is the preparation for a fasting test?',
    a: 'For tests requiring fasting (such as Comprehensive Metabolic Panel, Lipid Panel, or Fasting Glucose), do not eat or drink anything other than plain water for 10 to 12 hours before your blood draw. You may continue to take prescription medications unless instructed otherwise by your physician.',
  },
  {
    q: 'How fast will my lab results be ready?',
    a: 'Most routine tests (CBC, CMP, Lipid, Urinalysis, Rapid Respiratory PCR) are processed with Same-Day turnaround at our Centralia Reference Lab. Specialized immunology and endocrine tests are typically completed within 24 to 48 hours.',
  },
  {
    q: 'How does the appointment booking work?',
    a: 'Our online booking portal allows you to select your tests, choose your preferred Centralia patient service center or home phlebotomy dispatch, pick a date/time, and review preparation instructions. In our current preview, this runs as a safe demonstration; for production, we will connect to a designated HIPAA-eligible third-party scheduling provider.',
  },
  {
    q: 'Can I walk in without an appointment?',
    a: 'Yes, all Serine Diagnostics patient service centers welcome walk-in patients during standard draw hours. However, scheduling an appointment online gives you priority fast-track check-in and minimizes wait times.',
  },
];

