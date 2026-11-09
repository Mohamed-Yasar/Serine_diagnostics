import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  fetchLabTests,
  fetchLabPackages,
  fetchLabLocations,
} from '../services/api';

import {
  LabTest,
  LabPackage,
  LabLocation,
} from '../types';

interface LabDataContextType {
  // Tests
  tests: LabTest[];
  testsLoading: boolean;
  testsError: string | null;

  // Packages
  packages: LabPackage[];
  packagesLoading: boolean;
  packagesError: string | null;

  // Locations
  locations: LabLocation[];
  locationsLoading: boolean;
  locationsError: string | null;
}

const LabDataContext = createContext<LabDataContextType | undefined>(
  undefined
);

interface LabDataProviderProps {
  children: ReactNode;
}

export const LabDataProvider: React.FC<LabDataProviderProps> = ({
  children,
}) => {
  // =========================
  // TESTS
  // =========================

  const [tests, setTests] = useState<LabTest[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState<string | null>(null);

  // =========================
  // PACKAGES
  // =========================

  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState<string | null>(null);

  // =========================
  // LOCATIONS
  // =========================

  const [locations, setLocations] = useState<LabLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // =========================
  // FETCH TESTS
  // =========================

  useEffect(() => {
    async function loadTests() {
      try {
        setTestsLoading(true);
        setTestsError(null);

        const data = await fetchLabTests();

        setTests(data);
      } catch (error) {
        console.error('Failed to load tests:', error);

        setTestsError(
          error instanceof Error
            ? error.message
            : 'Failed to load tests'
        );
      } finally {
        setTestsLoading(false);
      }
    }

    loadTests();
  }, []);

  // =========================
  // FETCH PACKAGES
  // =========================

  useEffect(() => {
    async function loadPackages() {
      try {
        setPackagesLoading(true);
        setPackagesError(null);

        const data = await fetchLabPackages();

        setPackages(data);
      } catch (error) {
        console.error('Failed to load packages:', error);

        setPackagesError(
          error instanceof Error
            ? error.message
            : 'Failed to load packages'
        );
      } finally {
        setPackagesLoading(false);
      }
    }

    loadPackages();
  }, []);

  // =========================
  // FETCH LOCATIONS
  // =========================

  useEffect(() => {
    async function loadLocations() {
      try {
        setLocationsLoading(true);
        setLocationsError(null);

        const data = await fetchLabLocations();

        setLocations(data);
      } catch (error) {
        console.error('Failed to load locations:', error);

        setLocationsError(
          error instanceof Error
            ? error.message
            : 'Failed to load locations'
        );
      } finally {
        setLocationsLoading(false);
      }
    }

    loadLocations();
  }, []);

  return (
    <LabDataContext.Provider
      value={{
        // Tests
        tests,
        testsLoading,
        testsError,

        // Packages
        packages,
        packagesLoading,
        packagesError,

        // Locations
        locations,
        locationsLoading,
        locationsError,
      }}
    >
      {children}
    </LabDataContext.Provider>
  );
};

export const useLabData = (): LabDataContextType => {
  const context = useContext(LabDataContext);

  if (!context) {
    throw new Error(
      'useLabData must be used inside a LabDataProvider'
    );
  }

  return context;
};