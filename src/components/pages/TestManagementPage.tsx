import React, { useEffect, useMemo, useState } from 'react';

import {
  createLabTest,
  updateLabTest,
  deactivateLabTest,
  fetchLabTests,
  fetchAdminLabPackages,
  createLabPackage,
  updateLabPackage,
  deactivateLabPackage,
  type LabPackageAdmin,
} from '../../services/api';

import { LabTest } from '../../types';

interface TestManagementPageProps {
  onNavigate?: (view: string) => void;
}

type TestFormData = {
  code: string;
  name: string;
  category: LabTest['category'];
  categoryLabel: string;
  description: string;

  price: string;

  fastingRequired: boolean;
  fastingHours: string;

  turnaroundTime: string;
  specimenType: string;

  whyItIsDone: string;
  whatItHelpsEvaluate: string;
  clinicalSignificance: string;
  abnormalSymptoms: string;

  specimenVolume: string;
  collectionKit: string;
  patientPreparation: string;
  importantInformation: string;

  whatIsTested: string;
  relatedTests: string;
  commonFor: string;

  active: boolean;
  popular: boolean;
  bookable: boolean;

  source: string;
  itemType: string;

  tags: string[];
};

const AVAILABLE_TAGS = [
  'Thyroid & Hormones',
  'Vitamins & Nutrition',
  'Heart & Cardiovascular',
  "Women's Health",
  "Men's Health",
  'Sexual Health / STD',
  'Diabetes & Metabolic',
  'Liver & Kidney',
  'Blood & Hematology',
  'Infectious Disease',
  'Allergy & Immunology',
  'Wellness & Preventive',
  'Cancer Screening',
  'Drug & Toxicology',
  'Urinalysis',
  'Other',
];

const CATEGORY_OPTIONS = [
  {
    value: 'routine',
    label: 'Routine',
  },
  {
    value: 'hematology',
    label: 'Hematology',
  },
  {
    value: 'biochemistry',
    label: 'Biochemistry',
  },
  {
    value: 'endocrinology',
    label: 'Endocrinology & Thyroid',
  },
  {
    value: 'wellness',
    label: 'Wellness & Nutrition',
  },
  {
    value: 'infectious',
    label: 'Infectious & PCR',
  },
  {
    value: 'immunology',
    label: 'Immunology',
  },
  {
    value: 'toxicology',
    label: 'Toxicology',
  },
];

const ITEM_TYPE_OPTIONS = [
  {
    value: 'TEST',
    label: 'Test',
  },
  {
    value: 'PANEL',
    label: 'Panel',
  },
  {
    value: 'KIT',
    label: 'Kit',
  },
  {
    value: 'SERVICE',
    label: 'Service',
  },
];

const emptyForm: TestFormData = {
  code: '',
  name: '',
  category: 'routine',
  categoryLabel: 'Routine',
  description: '',

  price: '0',

  fastingRequired: false,
  fastingHours: '',

  turnaroundTime: '',
  specimenType: '',

  whyItIsDone: '',
  whatItHelpsEvaluate: '',
  clinicalSignificance: '',
  abnormalSymptoms: '',

  specimenVolume: '',
  collectionKit: '',
  patientPreparation: '',
  importantInformation: '',

  whatIsTested: '',
  relatedTests: '',
  commonFor: '',

  active: true,
  popular: false,
  bookable: true,

  source: 'SERINE',
  itemType: 'TEST',

  tags: [],
};

function testToForm(test: LabTest): TestFormData {
  return {
    code: test.code || '',
    name: test.name || '',
    category: test.category || 'routine',
    categoryLabel: test.categoryLabel || '',
    description: test.description || '',

    price:
      test.price !== undefined &&
      test.price !== null
        ? String(test.price)
        : '0',

    fastingRequired:
      test.fastingRequired ?? false,

    fastingHours:
      test.fastingHours !== undefined &&
      test.fastingHours !== null
        ? String(test.fastingHours)
        : '',

    turnaroundTime:
      test.turnaroundTime || '',

    specimenType:
      test.specimenType || '',

    whyItIsDone:
      test.whyItIsDone || '',

    whatItHelpsEvaluate:
      test.whatItHelpsEvaluate || '',

    clinicalSignificance:
      test.clinicalSignificance || '',

    abnormalSymptoms:
      test.abnormalSymptoms || '',

    specimenVolume:
      test.specimenVolume || '',

    collectionKit:
      test.collectionKit || '',

    patientPreparation:
      test.patientPreparation || '',

    importantInformation:
      test.importantInformation || '',

    whatIsTested:
      test.whatIsTested?.join('\n') || '',

    relatedTests:
      test.relatedTests?.join('\n') || '',

    commonFor:
      test.commonFor?.join('\n') || '',

    active:
      test.active ?? true,

    popular:
      test.popular ?? false,

    bookable:
      test.bookable ?? true,

    source:
      test.source || 'SERINE',

    itemType:
      test.itemType || 'TEST',

    tags:
      test.tags || [],
  };
}

function formToPayload(
  form: TestFormData
): Partial<LabTest> {
  return {
    code: form.code.trim(),
    name: form.name.trim(),

    category: form.category,
    categoryLabel: form.categoryLabel.trim(),

    description: form.description.trim(),

    // Pricing is intentionally not exposed in the Manage Tests UI.
    // The caller supplies the existing price for edits and 0 for new tests.

    fastingRequired:
      form.fastingRequired,

    fastingHours:
      form.fastingHours.trim() === ''
        ? undefined
        : Number(form.fastingHours),

    turnaroundTime:
      form.turnaroundTime.trim(),

    specimenType:
      form.specimenType.trim(),

    whyItIsDone:
      form.whyItIsDone.trim() || undefined,

    whatItHelpsEvaluate:
      form.whatItHelpsEvaluate.trim() || undefined,

    clinicalSignificance:
      form.clinicalSignificance.trim(),

    abnormalSymptoms:
      form.abnormalSymptoms.trim() || undefined,

    specimenVolume:
      form.specimenVolume.trim() || undefined,

    collectionKit:
      form.collectionKit.trim() || undefined,

    patientPreparation:
      form.patientPreparation.trim() || undefined,

    importantInformation:
      form.importantInformation.trim() || undefined,

    whatIsTested:
      form.whatIsTested
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),

    relatedTests:
      form.relatedTests
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),

    commonFor:
      form.commonFor
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),

    active:
      form.active,

    popular:
      form.popular,

    bookable:
      form.bookable,

    source:
      form.source.trim() || 'SERINE',

    itemType:
      form.itemType,

    tags:
      form.tags,
  };
}

export const TestManagementPage: React.FC<
  TestManagementPageProps
> = ({ onNavigate }) => {
  const [tests, setTests] = useState<LabTest[]>([]);

  const [activeTab, setActiveTab] = useState<
    'individual' | 'packages'
  >('individual');

  const [packages, setPackages] =
    useState<LabPackageAdmin[]>([]);

  const [packagesLoading, setPackagesLoading] =
    useState(false);

  const [packageSearch, setPackageSearch] =
    useState('');

  const [packageStatusFilter, setPackageStatusFilter] =
    useState<'all' | 'active' | 'inactive'>('all');

  const [editingPackage, setEditingPackage] =
    useState<LabPackageAdmin | null>(null);

  const [showPackageForm, setShowPackageForm] =
    useState(false);

  const [packageSaving, setPackageSaving] =
    useState(false);

  const [packageForm, setPackageForm] = useState({
    name: '',
    badge: '',
    tagline: '',
    description: '',
    price: '',
    originalValue: '',
    fastingRequired: false,
    turnaroundTime: '',
    recommendedFor: '',
    featured: false,
    active: true,
    testIds: [] as string[],
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<'all' | 'active' | 'inactive'>(
      'all'
    );

  const [editingTest, setEditingTest] =
    useState<LabTest | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] =
    useState<TestFormData>(emptyForm);

  // ========================================
  // LOAD TESTS
  // ========================================

  const loadTests = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchLabTests();

      setTests(data);
    } catch (error) {
      console.error(
        'Failed to load tests:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load tests'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const loadPackages = async () => {
    try {
      setPackagesLoading(true);
      setError(null);
      const data = await fetchAdminLabPackages();
      setPackages(data);
    } catch (error) {
      console.error('Failed to load lab packages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load lab packages');
    } finally {
      setPackagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'packages') {
      loadPackages();
    }
  }, [activeTab]);

  // ========================================
  // FILTER TESTS
  // ========================================

  const filteredTests = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesSearch =
        searchValue === '' ||
        test.name
          .toLowerCase()
          .includes(searchValue) ||
        test.code
          .toLowerCase()
          .includes(searchValue) ||
        test.description
          .toLowerCase()
          .includes(searchValue) ||
        test.categoryLabel
          .toLowerCase()
          .includes(searchValue) ||
        test.tags?.some((tag) =>
          tag
            .toLowerCase()
            .includes(searchValue)
        );

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' &&
          test.active !== false) ||
        (statusFilter === 'inactive' &&
          test.active === false);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [tests, search, statusFilter]);

  const filteredPackages = useMemo(() => {
    const searchValue = packageSearch.trim().toLowerCase();

    return packages.filter((pkg) => {
      const matchesSearch =
        searchValue === '' ||
        pkg.name.toLowerCase().includes(searchValue) ||
        pkg.tagline.toLowerCase().includes(searchValue) ||
        pkg.description.toLowerCase().includes(searchValue) ||
        pkg.recommendedFor.toLowerCase().includes(searchValue);

      const matchesStatus =
        packageStatusFilter === 'all' ||
        (packageStatusFilter === 'active' && pkg.active !== false) ||
        (packageStatusFilter === 'inactive' && pkg.active === false);

      return matchesSearch && matchesStatus;
    });
  }, [packages, packageSearch, packageStatusFilter]);

  // ========================================
  // OPEN ADD FORM
  // ========================================

  const handleAddTest = () => {
    setEditingTest(null);
    setForm(emptyForm);
    setMessage(null);
    setError(null);
    setShowForm(true);
  };

  // ========================================
  // OPEN EDIT FORM
  // ========================================

  const handleEditTest = (
    test: LabTest
  ) => {
    setEditingTest(test);
    setForm(testToForm(test));
    setMessage(null);
    setError(null);
    setShowForm(true);
  };

  // ========================================
  // CLOSE FORM
  // ========================================

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingTest(null);
    setForm(emptyForm);
  };

  // ========================================
  // FORM FIELD UPDATE
  // ========================================

  const updateField = <
    K extends keyof TestFormData
  >(
    field: K,
    value: TestFormData[K]
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  // ========================================
  // TAG TOGGLE
  // ========================================

  const toggleTag = (tag: string) => {
    setForm((currentForm) => {
      const alreadySelected =
        currentForm.tags.includes(tag);

      return {
        ...currentForm,
        tags: alreadySelected
          ? currentForm.tags.filter(
              (currentTag) =>
                currentTag !== tag
            )
          : [
              ...currentForm.tags,
              tag,
            ],
      };
    });
  };

  // ========================================
  // SAVE TEST
  // ========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage(null);
    setError(null);

    if (!form.code.trim()) {
      setError('Test code is required.');
      return;
    }

    if (!form.name.trim()) {
      setError('Test name is required.');
      return;
    }

    if (!form.description.trim()) {
      setError(
        'Test description is required.'
      );
      return;
    }

    if (!form.categoryLabel.trim()) {
      setError(
        'Category label is required.'
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formToPayload(form),
        // Preserve existing pricing without displaying/editing it here.
        price: editingTest ? editingTest.price : 0,
      };

      if (editingTest) {
        const updatedTest =
          await updateLabTest(
            editingTest.id,
            payload
          );

        setTests((currentTests) =>
          currentTests.map((test) =>
            test.id ===
            editingTest.id
              ? updatedTest
              : test
          )
        );

        setMessage(
          'Lab test updated successfully.'
        );
      } else {
        const createdTest =
          await createLabTest(
            payload
          );

        setTests((currentTests) => [
          createdTest,
          ...currentTests,
        ]);

        setMessage(
          'Lab test created successfully.'
        );
      }

      setShowForm(false);
      setEditingTest(null);
      setForm(emptyForm);
    } catch (error) {
      console.error(
        'Failed to save lab test:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save lab test'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddPackage = () => {
    setEditingPackage(null);
    setPackageForm({
      name: '', badge: '', tagline: '', description: '', price: '',
      originalValue: '', fastingRequired: false, turnaroundTime: '',
      recommendedFor: '', featured: false, active: true, testIds: [],
    });
    setMessage(null);
    setError(null);
    setShowPackageForm(true);
  };

  const handleEditPackage = (pkg: LabPackageAdmin) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name || '',
      badge: pkg.badge || '',
      tagline: pkg.tagline || '',
      description: pkg.description || '',
      price: pkg.price !== undefined ? String(pkg.price) : '',
      originalValue: pkg.originalValue !== undefined ? String(pkg.originalValue) : '',
      fastingRequired: pkg.fastingRequired ?? false,
      turnaroundTime: pkg.turnaroundTime || '',
      recommendedFor: pkg.recommendedFor || '',
      featured: pkg.featured ?? false,
      active: pkg.active ?? true,
      testIds: [...(pkg.testIds || [])],
    });
    setMessage(null);
    setError(null);
    setShowPackageForm(true);
  };

  const handleClosePackageForm = () => {
    if (packageSaving) return;
    setShowPackageForm(false);
    setEditingPackage(null);
  };

  const updatePackageField = (
    field: keyof typeof packageForm,
    value: string | boolean | string[]
  ) => {
    setPackageForm((current) => ({ ...current, [field]: value }));
  };

  const togglePackageTest = (testId: string) => {
    setPackageForm((current) => {
      const selected = current.testIds.includes(testId);
      return {
        ...current,
        testIds: selected
          ? current.testIds.filter((id) => id !== testId)
          : [...current.testIds, testId],
      };
    });
  };

  const handlePackageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!packageForm.name.trim()) {
      setError('Package name is required.');
      return;
    }
    if (packageForm.originalValue.trim() !== '' && Number.isNaN(Number(packageForm.originalValue))) {
      setError('Original value must be a valid number.');
      return;
    }
    if (!packageForm.description.trim()) {
      setError('Package description is required.');
      return;
    }

    try {
      setPackageSaving(true);
      const payload = {
        name: packageForm.name.trim(),
        badge: packageForm.badge.trim() || undefined,
        tagline: packageForm.tagline.trim(),
        description: packageForm.description.trim(),
        // Pricing is intentionally not exposed in the Manage Tests UI.
        // Preserve existing values on edit; new packages start with 0.
        price: editingPackage ? Number(editingPackage.price || 0) : 0,
        originalValue: editingPackage ? Number(editingPackage.originalValue || 0) : 0,
        fastingRequired: packageForm.fastingRequired,
        turnaroundTime: packageForm.turnaroundTime.trim(),
        recommendedFor: packageForm.recommendedFor.trim(),
        featured: packageForm.featured,
        active: packageForm.active,
        testIds: packageForm.testIds,
      };

      if (editingPackage) {
        const updatedPackage = await updateLabPackage(editingPackage.id, payload);
        setPackages((current) => current.map((pkg) => pkg.id === updatedPackage.id ? updatedPackage : pkg));
        setMessage('Wellness package updated successfully.');
      } else {
        const createdPackage = await createLabPackage(payload);
        setPackages((current) => [createdPackage, ...current]);
        setMessage('Wellness package created successfully.');
      }

      setShowPackageForm(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Failed to save lab package:', error);
      setError(error instanceof Error ? error.message : 'Failed to save wellness package');
    } finally {
      setPackageSaving(false);
    }
  };

  const handleDeactivatePackage = async (pkg: LabPackageAdmin) => {
    const confirmed = window.confirm(
      `Deactivate "${pkg.name}"? This will make the package inactive and prevent new bookings.`
    );
    if (!confirmed) return;

    try {
      setError(null);
      setMessage(null);
      const updatedPackage = await deactivateLabPackage(pkg.id);
      setPackages((current) => current.map((currentPackage) =>
        currentPackage.id === pkg.id ? updatedPackage : currentPackage
      ));
      setMessage('Wellness package deactivated successfully.');
    } catch (error) {
      console.error('Failed to deactivate lab package:', error);
      setError(error instanceof Error ? error.message : 'Failed to deactivate lab package');
    }
  };

  // ========================================
  // DEACTIVATE TEST
  // ========================================

  const handleDeactivate = async (
    test: LabTest
  ) => {
    const confirmed =
      window.confirm(
        `Deactivate "${test.name}"? This will make the test inactive and prevent new bookings.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setMessage(null);

      const updatedTest =
        await deactivateLabTest(
          test.id
        );

      setTests((currentTests) =>
        currentTests.map((currentTest) =>
          currentTest.id === test.id
            ? updatedTest
            : currentTest
        )
      );

      setMessage(
        'Lab test deactivated successfully.'
      );
    } catch (error) {
      console.error(
        'Failed to deactivate test:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to deactivate test'
      );
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f7fbfb] px-4 py-12">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-700">
              Loading tests...
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Please wait while we retrieve the test catalog.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // WELLNESS PACKAGE FORM VIEW
  // ========================================

  if (showPackageForm) {
    return (
      <div className="min-h-[70vh] bg-[#f7fbfb] px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <button type="button" onClick={handleClosePackageForm} className="mb-6 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            ← Back to Manage Tests
          </button>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#168d90]">Administration</p>
            <h1 className="text-3xl font-extrabold text-[#103d4a] mt-2">
              {editingPackage ? 'Edit Wellness Package' : 'Add New Wellness Package'}
            </h1>
            <p className="text-sm text-slate-600 mt-2">Manage package information, pricing, booking details, and included tests.</p>
          </div>

          {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          <form onSubmit={handlePackageSubmit} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Package Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  ['name','Package Name','e.g. Complete Wellness Package'],
                  ['badge','Badge','e.g. Most Popular'],
                  ['tagline','Tagline','Short package headline'],
                  ['turnaroundTime','Turnaround Time','e.g. 1-2 business days'],
                  ['recommendedFor','Recommended For','Who this package is for'],
                ].map(([field,label,placeholder]) => (
                  <div key={field} className={field === 'recommendedFor' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
                    <input type="text" value={packageForm[field as keyof typeof packageForm] as string} onChange={(e) => updatePackageField(field as keyof typeof packageForm, e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]" placeholder={placeholder} />
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea required rows={5} value={packageForm.description} onChange={(e) => updatePackageField('description', e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]" placeholder="Describe what the package includes and its purpose..." />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Package Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={packageForm.fastingRequired} onChange={(e) => updatePackageField('fastingRequired', e.target.checked)} className="h-4 w-4" /><span className="text-sm font-semibold text-slate-700">Fasting Required</span></label>
                  <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={packageForm.featured} onChange={(e) => updatePackageField('featured', e.target.checked)} className="h-4 w-4" /><span className="text-sm font-semibold text-slate-700">Featured Package</span></label>
                  <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={packageForm.active} onChange={(e) => updatePackageField('active', e.target.checked)} className="h-4 w-4" /><span className="text-sm font-semibold text-slate-700">Active</span></label>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                <div><h2 className="text-xl font-bold text-slate-900">Tests Included</h2><p className="text-sm text-slate-500 mt-1">Select the individual tests included in this wellness package.</p></div>
                <span className="px-3 py-1 rounded-full bg-[#e8f6f4] text-[#168d90] text-xs font-bold">{packageForm.testIds.length} selected</span>
              </div>
              <div className="max-h-[520px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {tests.length === 0 ? <div className="p-6 text-center text-sm text-slate-500">No tests available.</div> : tests.map((test) => {
                  const selected = packageForm.testIds.includes(test.id);
                  return (
                    <label key={test.id} className={`flex items-start gap-3 p-4 cursor-pointer transition ${selected ? 'bg-[#e8f6f4]' : 'hover:bg-slate-50'}`}>
                      <input type="checkbox" checked={selected} onChange={() => togglePackageTest(test.id)} className="h-4 w-4 mt-1" />
                      <div className="min-w-0"><div className="font-semibold text-sm text-slate-900">{test.name}</div><div className="text-xs text-slate-500 mt-1">{test.code} · {test.categoryLabel}</div></div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" onClick={handleClosePackageForm} disabled={packageSaving} className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={packageSaving} className="px-6 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm transition disabled:opacity-60">{packageSaving ? 'Saving...' : editingPackage ? 'Save Changes' : 'Create Package'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ========================================
  // FORM VIEW
  // ========================================

  if (showForm) {
    return (
      <div className="min-h-[70vh] bg-[#f7fbfb] px-4 py-12">
        <div className="max-w-5xl mx-auto">

          <button
            type="button"
            onClick={handleCloseForm}
            className="mb-6 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            ← Back to Manage Tests
          </button>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#168d90]">
              Administration
            </p>

            <h1 className="text-3xl font-extrabold text-[#103d4a] mt-2">
              {editingTest
                ? 'Edit Lab Test'
                : 'Add New Lab Test'}
            </h1>

            <p className="text-sm text-slate-600 mt-2">
              Manage test information, clinical details, pricing, booking settings, and tags.
            </p>
          </div>

          {message && (
            <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ========================================
                BASIC INFORMATION
                ======================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Test Code
                  </label>

                  <input
                    type="text"
                    required
                    disabled={Boolean(editingTest)}
                    value={form.code}
                    onChange={(event) =>
                      updateField(
                        'code',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90] disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="e.g. CBC"
                  />

                  {editingTest && (
                    <p className="text-xs text-slate-500 mt-2">
                      Test codes cannot be changed after creation.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Test Name
                  </label>

                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        'name',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                    placeholder="Complete Blood Count"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Type
                  </label>

                  <select
                    value={form.itemType}
                    onChange={(event) =>
                      updateField(
                        'itemType',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#168d90]"
                  >
                    {ITEM_TYPE_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) => {
                      const selected =
                        CATEGORY_OPTIONS.find(
                          (option) =>
                            option.value ===
                            event.target.value
                        );

                      updateField(
                        'category',
                        event.target.value as LabTest['category']
                      );

                      updateField(
                        'categoryLabel',
                        selected?.label ||
                          event.target.value
                      );
                    }}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#168d90]"
                  >
                    {CATEGORY_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category Label
                  </label>

                  <input
                    type="text"
                    required
                    value={form.categoryLabel}
                    onChange={(event) =>
                      updateField(
                        'categoryLabel',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                    placeholder="Endocrinology & Thyroid"
                  />
                </div>

                {/* TAGS */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tags
                  </label>

                  <p className="text-xs text-slate-500 mb-4">
                    Select all tags that help patients and staff understand what this test is related to.
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {AVAILABLE_TAGS.map(
                      (tag) => {
                        const selected =
                          form.tags.includes(
                            tag
                          );

                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              toggleTag(
                                tag
                              )
                            }
                            className={`px-3 py-2 rounded-full text-xs font-semibold border transition ${
                              selected
                                ? 'bg-[#168d90] text-white border-[#168d90]'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {selected
                              ? '✓ '
                              : ''}
                            {tag}
                          </button>
                        );
                      }
                    )}

                  </div>

                  {form.tags.length > 0 && (
                    <div className="mt-4 text-sm text-slate-600">
                      <span className="font-semibold">
                        Selected:
                      </span>{' '}
                      {form.tags.join(
                        ', '
                      )}
                    </div>
                  )}

                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        'description',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                    placeholder="Describe the test..."
                  />
                </div>

              </div>
            </div>

            {/* ========================================
                CLINICAL INFORMATION
                ======================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Clinical Information
              </h2>

              <div className="space-y-5">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Why Is This Test Done?
                  </label>

                  <textarea
                    rows={3}
                    value={form.whyItIsDone}
                    onChange={(event) =>
                      updateField(
                        'whyItIsDone',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What Does It Help Evaluate?
                  </label>

                  <textarea
                    rows={3}
                    value={
                      form.whatItHelpsEvaluate
                    }
                    onChange={(event) =>
                      updateField(
                        'whatItHelpsEvaluate',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What's Tested?
                  </label>

                  <textarea
                    rows={4}
                    value={form.whatIsTested}
                    onChange={(event) =>
                      updateField(
                        'whatIsTested',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                    placeholder="Enter one item per line"
                  />

                  <p className="text-xs text-slate-500 mt-2">
                    Enter each item on a separate line.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Clinical Significance
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={
                      form.clinicalSignificance
                    }
                    onChange={(event) =>
                      updateField(
                        'clinicalSignificance',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Possible Signs & Symptoms
                  </label>

                  <textarea
                    rows={3}
                    value={
                      form.abnormalSymptoms
                    }
                    onChange={(event) =>
                      updateField(
                        'abnormalSymptoms',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                  />
                </div>

              </div>
            </div>

            {/* ========================================
                COLLECTION INFORMATION
                ======================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Collection Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Specimen Type
                  </label>

                  <input
                    type="text"
                    value={form.specimenType}
                    onChange={(event) =>
                      updateField(
                        'specimenType',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                    placeholder="Blood"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Specimen Volume
                  </label>

                  <input
                    type="text"
                    value={form.specimenVolume}
                    onChange={(event) =>
                      updateField(
                        'specimenVolume',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                    placeholder="5 mL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Collection Kit
                  </label>

                  <input
                    type="text"
                    value={form.collectionKit}
                    onChange={(event) =>
                      updateField(
                        'collectionKit',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Turnaround Time
                  </label>

                  <input
                    type="text"
                    value={
                      form.turnaroundTime
                    }
                    onChange={(event) =>
                      updateField(
                        'turnaroundTime',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                    placeholder="1-2 business days"
                  />
                </div>

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Patient Preparation
                  </label>

                  <textarea
                    rows={3}
                    value={
                      form.patientPreparation
                    }
                    onChange={(event) =>
                      updateField(
                        'patientPreparation',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                  />

                </div>

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Important Information
                  </label>

                  <textarea
                    rows={3}
                    value={
                      form.importantInformation
                    }
                    onChange={(event) =>
                      updateField(
                        'importantInformation',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                  />

                </div>

                <div className="md:col-span-2">

                  <label className="flex items-center gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={
                        form.fastingRequired
                      }
                      onChange={(event) =>
                        updateField(
                          'fastingRequired',
                          event.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      Fasting Required
                    </span>

                  </label>

                </div>

                {form.fastingRequired && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Fasting Hours
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.fastingHours
                      }
                      onChange={(event) =>
                        updateField(
                          'fastingHours',
                          event.target.value
                        )
                      }
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                      placeholder="8"
                    />
                  </div>
                )}

              </div>
            </div>

            {/* ========================================
                BUSINESS INFORMATION
                ======================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Business & Booking
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Source
                  </label>

                  <input
                    type="text"
                    value={form.source}
                    onChange={(event) =>
                      updateField(
                        'source',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                    placeholder="SERINE"
                  />
                </div>

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Common For
                  </label>

                  <textarea
                    rows={3}
                    value={form.commonFor}
                    onChange={(event) =>
                      updateField(
                        'commonFor',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                    placeholder="Enter one item per line"
                  />

                </div>

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Related Tests
                  </label>

                  <textarea
                    rows={3}
                    value={
                      form.relatedTests
                    }
                    onChange={(event) =>
                      updateField(
                        'relatedTests',
                        event.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none resize-y focus:border-[#168d90]"
                    placeholder="Enter one test per line"
                  />

                </div>

                <div className="md:col-span-2 space-y-4">

                  <label className="flex items-center gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={form.bookable}
                      onChange={(event) =>
                        updateField(
                          'bookable',
                          event.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      Available for Online Booking
                    </span>

                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) =>
                        updateField(
                          'active',
                          event.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      Active
                    </span>

                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={form.popular}
                      onChange={(event) =>
                        updateField(
                          'popular',
                          event.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      Mark as Popular
                    </span>

                  </label>

                </div>

              </div>
            </div>

            {/* ========================================
                ACTIONS
                ======================================== */}

            <div className="flex flex-col sm:flex-row gap-3 justify-end">

              <button
                type="button"
                onClick={
                  handleCloseForm
                }
                disabled={saving}
                className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm transition disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingTest
                  ? 'Save Changes'
                  : 'Create Test'}
              </button>

            </div>

          </form>
        </div>
      </div>
    );
  }

  // ========================================
  // MANAGEMENT DASHBOARD
  // ========================================

  return (
    <div className="min-h-[70vh] bg-[#f7fbfb] px-4 py-12">
      <div className="max-w-7xl mx-auto">

        {/* ADMIN NAVIGATION */}

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('appointments')}
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            📅 Appointments
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('staff-management')}
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            👥 Staff Management
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('test-management')}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            🧪 Manage Tests
          </button>
        </div>

        {/* HEADER */}

        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#168d90]">
              Administration
            </p>

            <h1 className="text-3xl font-extrabold text-[#103d4a] mt-2">
              Manage Tests
            </h1>

            <p className="text-sm text-slate-600 mt-2">
              Create, edit, organize, and manage the diagnostic test catalog.
            </p>
          </div>

          {activeTab === 'packages' ? (
            <button
              type="button"
              onClick={handleAddPackage}
              className="px-5 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm transition"
            >
              + Add New Package
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddTest}
              className="px-5 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-sm transition"
            >
              + Add New Test
            </button>
          )}
        </div>

        {/* MANAGEMENT TABS */}

        <div className="mb-6 border-b border-slate-200">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('individual')}
              className={`px-5 py-3 rounded-t-xl text-sm font-bold transition ${
                activeTab === 'individual'
                  ? 'bg-[#168d90] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              🧪 Individual Tests
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('packages')}
              className={`px-5 py-3 rounded-t-xl text-sm font-bold transition ${
                activeTab === 'packages'
                  ? 'bg-[#168d90] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              📦 Wellness Packages
            </button>
          </div>
        </div>

        {/* MESSAGES */}

        {message && (
          <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {activeTab === 'packages' ? (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Search Packages
                  </label>
                  <input
                    type="search"
                    value={packageSearch}
                    onChange={(event) => setPackageSearch(event.target.value)}
                    placeholder="Search by name, tagline, description, or recommended-for..."
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={packageStatusFilter}
                    onChange={(event) =>
                      setPackageStatusFilter(
                        event.target.value as 'all' | 'active' | 'inactive'
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#168d90]"
                  >
                    <option value="all">All Packages</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="text-sm text-slate-500">Total Packages</div>
                <div className="text-2xl font-bold text-slate-900 mt-2">{packages.length}</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="text-sm text-slate-500">Active</div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {packages.filter((pkg) => pkg.active !== false).length}
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="text-sm text-slate-500">Featured</div>
                <div className="text-2xl font-bold text-[#168d90] mt-2">
                  {packages.filter((pkg) => pkg.featured === true && pkg.active !== false).length}
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="text-sm text-slate-500">Showing</div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {filteredPackages.length}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Wellness Package Catalog</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredPackages.length} package{filteredPackages.length === 1 ? '' : 's'} found
                </p>
              </div>

              {packagesLoading ? (
                <div className="px-5 py-12 text-center">
                  <p className="font-semibold text-slate-700">Loading wellness packages...</p>
                  <p className="text-sm text-slate-500 mt-1">Please wait while we retrieve the package catalog.</p>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="font-semibold text-slate-700">No wellness packages found.</p>
                  <p className="text-sm text-slate-500 mt-1">Create a package or change your search/filter.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredPackages.map((pkg) => (
                    <div key={pkg.id} className="p-5 sm:p-6 hover:bg-slate-50 transition">
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                            {pkg.badge && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                                {pkg.badge}
                              </span>
                            )}
                            {pkg.featured && (
                              <span className="px-2.5 py-1 rounded-full bg-[#e8f6f4] text-[#168d90] text-xs font-bold">
                                Featured
                              </span>
                            )}
                          </div>

                          {pkg.tagline && (
                            <p className="text-sm font-medium text-[#168d90] mt-1">{pkg.tagline}</p>
                          )}

                          {pkg.description && (
                            <p className="text-sm text-slate-600 mt-3 max-w-3xl">{pkg.description}</p>
                          )}

                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                              {pkg.testCount} tests
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                              {pkg.turnaroundTime || 'Turnaround TBD'}
                            </span>
                            {pkg.fastingRequired && (
                              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                Fasting Required
                              </span>
                            )}
                          </div>

                          {pkg.testsIncluded && pkg.testsIncluded.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Included Tests</p>
                              <div className="flex flex-wrap gap-2">
                                {pkg.testsIncluded.slice(0, 8).map((testName: string) => (
                                  <span key={testName} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                    {testName}
                                  </span>
                                ))}
                                {pkg.testsIncluded.length > 8 && (
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500">
                                    +{pkg.testsIncluded.length - 8} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="xl:w-44 shrink-0 flex flex-col xl:items-end gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            pkg.active !== false
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {pkg.active !== false ? 'Active' : 'Inactive'}
                          </span>

                          <div className="flex flex-wrap xl:justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditPackage(pkg)}
                              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                            >
                              Edit
                            </button>
                            {pkg.active !== false && (
                              <button
                                type="button"
                                onClick={() => handleDeactivatePackage(pkg)}
                                className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition"
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Search Tests
                  </label>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, code, category, description, or tag..."
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#168d90]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[#168d90]"
                  >
                    <option value="all">All Tests</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="text-sm text-slate-500">Total Tests</div>
                <div className="text-2xl font-bold text-slate-900 mt-2">{tests.length}</div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="text-sm text-slate-500">Active</div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {tests.filter((test) => test.active !== false).length}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="text-sm text-slate-500">Bookable</div>
                <div className="text-2xl font-bold text-[#168d90] mt-2">
                  {tests.filter(
                    (test) => test.bookable === true && test.active !== false
                  ).length}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="text-sm text-slate-500">Showing</div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {filteredTests.length}
                </div>
              </div>
            </div>

            {/* TEST LIST */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Test Catalog</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredTests.length}{' '}
                  test
                  {filteredTests.length === 1 ? '' : 's'} found
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTests.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <p className="font-semibold text-slate-700">No tests found.</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Try changing your search or filter.
                    </p>
                  </div>
                ) : (
                  filteredTests.map((test) => (
                    <div key={test.id} className="p-5 hover:bg-slate-50 transition">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                              {test.code}
                            </span>
                          </div>

                          <p className="text-sm text-slate-500 mt-1">{test.categoryLabel}</p>

                          <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                            {test.description}
                          </p>

                          {test.tags && test.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {test.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-1 rounded-full bg-[#e8f6f4] text-[#168d90] text-xs font-semibold"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col lg:items-end gap-3 shrink-0">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                test.active !== false
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {test.active !== false ? 'Active' : 'Inactive'}
                            </span>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                test.bookable
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {test.bookable ? 'Bookable' : 'Not Bookable'}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditTest(test)}
                              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                            >
                              Edit
                            </button>

                            {test.active !== false && (
                              <button
                                type="button"
                                onClick={() => handleDeactivate(test)}
                                className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition"
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};