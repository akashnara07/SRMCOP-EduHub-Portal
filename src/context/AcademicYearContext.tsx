import React, { createContext, useContext, useState } from 'react';

export interface AcademicYearContextType {
  activeAcademicYear: string;
  setActiveAcademicYear: (year: string) => void;
  availableAcademicYears: string[];
  selectedProgramme: string;
  setSelectedProgramme: (prog: string) => void;
  availableProgrammes: string[];
  selectedRegulation: string;
  setSelectedRegulation: (reg: string) => void;
  getRegulationsForProgramme: (prog: string) => string[];
}

export const PROGRAMME_REGULATIONS_MAP: Record<string, string[]> = {
  'All Programmes': ['All Regulations', 'PCI 2017', 'PCI 2008', 'PCI 2026'],
  'All': ['All Regulations', 'PCI 2017', 'PCI 2008', 'PCI 2026'],
  'B.Pharm': ['PCI 2017', 'PCI 2026'],
  'Pharm.D': ['PCI 2008'],
  'M.Pharm': ['PCI 2017 PG', 'PCI 2011'],
};

const AcademicYearContext = createContext<AcademicYearContextType>({
  activeAcademicYear: '2026-2027',
  setActiveAcademicYear: () => {},
  availableAcademicYears: ['2024-2025', '2025-2026', '2026-2027', '2027-2028'],
  selectedProgramme: 'B.Pharm',
  setSelectedProgramme: () => {},
  availableProgrammes: ['B.Pharm', 'Pharm.D', 'M.Pharm'],
  selectedRegulation: 'PCI 2017',
  setSelectedRegulation: () => {},
  getRegulationsForProgramme: () => ['PCI 2017', 'PCI 2026'],
});

export const AcademicYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAcademicYear, setActiveAcademicYearState] = useState<string>(() => {
    return localStorage.getItem('srm_lms_active_academic_year') || '2026-2027';
  });

  const [selectedProgramme, setSelectedProgrammeState] = useState<string>(() => {
    return localStorage.getItem('srm_lms_selected_programme') || 'B.Pharm';
  });

  const [selectedRegulation, setSelectedRegulationState] = useState<string>(() => {
    return localStorage.getItem('srm_lms_selected_regulation') || 'PCI 2017';
  });

  const availableAcademicYears = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];
  const availableProgrammes = ['B.Pharm', 'Pharm.D', 'M.Pharm'];

  const getRegulationsForProgramme = (prog: string): string[] => {
    return PROGRAMME_REGULATIONS_MAP[prog] || ['PCI 2017', 'PCI 2026'];
  };

  const setActiveAcademicYear = (year: string) => {
    setActiveAcademicYearState(year);
    localStorage.setItem('srm_lms_active_academic_year', year);
  };

  const setSelectedProgramme = (prog: string) => {
    setSelectedProgrammeState(prog);
    localStorage.setItem('srm_lms_selected_programme', prog);

    // Automatically pick first valid regulation for new programme
    const validRegs = getRegulationsForProgramme(prog);
    if (!validRegs.includes(selectedRegulation)) {
      const newReg = validRegs[0] || 'PCI 2017';
      setSelectedRegulationState(newReg);
      localStorage.setItem('srm_lms_selected_regulation', newReg);
    }
  };

  const setSelectedRegulation = (reg: string) => {
    setSelectedRegulationState(reg);
    localStorage.setItem('srm_lms_selected_regulation', reg);
  };

  return (
    <AcademicYearContext.Provider value={{
      activeAcademicYear,
      setActiveAcademicYear,
      availableAcademicYears,
      selectedProgramme,
      setSelectedProgramme,
      availableProgrammes,
      selectedRegulation,
      setSelectedRegulation,
      getRegulationsForProgramme,
    }}>
      {children}
    </AcademicYearContext.Provider>
  );
};

export const useAcademicYear = () => useContext(AcademicYearContext);

