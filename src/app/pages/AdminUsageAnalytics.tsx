/**
 * Admin Usage Analytics Page
 * Provides comprehensive usage pattern analysis over time
 * Read-only analytics - no content or user management
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Info, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as Dialog from '@radix-ui/react-dialog';
import { getPrescriptionsSync } from '../data/prescriptions';
import { getAllFormulas } from '../data/formulasManager';
import { DEMO_USERS } from '../data/usersManager';

type TimeRange = 'week' | 'month' | 'year' | 'all' | 'custom';

// Hook to detect mobile view
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Calculate real KPI data from prescriptions
function calculateRealKPIData() {
  const prescriptions = getPrescriptionsSync();
  const allFormulas = getAllFormulas();
  
  // Count unique herbs and formulas used
  const uniqueHerbs = new Set<string>();
  const uniqueFormulas = new Set<string>();
  let standardFormulaCount = 0;
  let customFormulaCount = 0;
  const activeUserEmails = new Set<string>();
  
  prescriptions.forEach(prescription => {
    // Track active users
    if (prescription.createdBy?.userEmail) {
      activeUserEmails.add(prescription.createdBy.userEmail);
    }
    
    // Count herbs and formulas
    prescription.components.forEach(comp => {
      if (comp.type === 'herb') {
        uniqueHerbs.add(comp.name);
      } else if (comp.type === 'formula') {
        uniqueFormulas.add(comp.name);
        
        // Check if it's a standard formula
        const isStandard = allFormulas.some(f => 
          (f.pinyin_name === comp.name || f.english_name === comp.name) && !f.isCustom
        );
        
        if (isStandard) {
          standardFormulaCount++;
        } else {
          customFormulaCount++;
        }
      }
    });
  });
  
  const totalFormulas = standardFormulaCount + customFormulaCount;
  const standardPercentage = totalFormulas > 0 ? Math.round((standardFormulaCount / totalFormulas) * 100) : 0;
  const customPercentage = 100 - standardPercentage;
  
  return {
    totalPrescriptions: { current: prescriptions.length, change: undefined },
    herbsUsed: { current: uniqueHerbs.size, change: undefined },
    formulasUsed: { current: uniqueFormulas.size, change: undefined },
    standardFormulas: standardPercentage,
    customFormulas: customPercentage,
    activeUsers: { current: activeUserEmails.size, change: undefined },
  };
}

// Real data generators from prescriptions
const generatePrescriptionsData = (range: TimeRange, customDates?: { start: Date; end: Date }) => {
  const prescriptions = getPrescriptionsSync();
  const now = new Date();

  if (range === 'custom' && customDates) {
    const daysDiff = Math.floor((customDates.end.getTime() - customDates.start.getTime()) / (1000 * 60 * 60 * 24));
    const dateCounts: { [date: string]: number } = {};

    // Generate all dates in range
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(customDates.start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      dateCounts[dateStr] = 0;
    }

    // Count prescriptions for each date
    prescriptions.forEach(p => {
      if (p.createdAt >= customDates.start && p.createdAt <= customDates.end) {
        const dateStr = `${p.createdAt.getMonth() + 1}/${p.createdAt.getDate()}`;
        if (dateCounts[dateStr] !== undefined) {
          dateCounts[dateStr]++;
        }
      }
    });

    return Object.entries(dateCounts).map(([date, value]) => ({ date, value }));
  } else if (range === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);

    prescriptions.forEach(p => {
      const daysDiff = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const dayIndex = p.createdAt.getDay();
        counts[dayIndex]++;
      }
    });

    return days.map((day, i) => ({ date: day, value: counts[i] }));
  } else if (range === 'month') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const counts = new Array(4).fill(0);

    prescriptions.forEach(p => {
      const daysDiff = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 28) {
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex < 4) counts[3 - weekIndex]++;
      }
    });

    return weeks.map((week, i) => ({ date: week, value: counts[i] }));
  } else if (range === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    prescriptions.forEach(p => {
      const yearDiff = now.getFullYear() - p.createdAt.getFullYear();
      if (yearDiff === 0) {
        counts[p.createdAt.getMonth()]++;
      }
    });

    return months.map((month, i) => ({ date: month, value: counts[i] }));
  } else {
    // All time - group by year
    const yearCounts: { [year: string]: number } = {};

    prescriptions.forEach(p => {
      const year = p.createdAt.getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const sortedYears = Object.keys(yearCounts).sort();
    if (sortedYears.length === 0) return [];

    return sortedYears.map(year => ({ date: year, value: yearCounts[year] }));
  }
};

// Old mock function for reference - now replaced with real data above
const generatePrescriptionsDataOld = (range: TimeRange) => {
  if (range === 'week') {
    return [
      { date: 'Mon', value: 45 },
      { date: 'Tue', value: 52 },
      { date: 'Wed', value: 48 },
      { date: 'Thu', value: 61 },
      { date: 'Fri', value: 55 },
      { date: 'Sat', value: 38 },
      { date: 'Sun', value: 35 },
    ];
  } else if (range === 'month') {
    return [
      { date: 'Week 1', value: 156 },
      { date: 'Week 2', value: 189 },
      { date: 'Week 3', value: 234 },
      { date: 'Week 4', value: 298 },
    ];
  } else if (range === 'year') {
    return [
      { date: 'Jan', value: 620 },
      { date: 'Feb', value: 580 },
      { date: 'Mar', value: 695 },
      { date: 'Apr', value: 742 },
      { date: 'May', value: 810 },
      { date: 'Jun', value: 875 },
      { date: 'Jul', value: 920 },
      { date: 'Aug', value: 965 },
      { date: 'Sep', value: 890 },
      { date: 'Oct', value: 1020 },
      { date: 'Nov', value: 980 },
      { date: 'Dec', value: 1045 },
    ];
  } else {
    // All time - show years
    return [
      { date: '2021', value: 4850 },
      { date: '2022', value: 6240 },
      { date: '2023', value: 8120 },
      { date: '2024', value: 9845 },
      { date: '2025', value: 11250 },
    ];
  }
};

const generateHerbsData = (range: TimeRange, customDates?: { start: Date; end: Date }) => {
  const prescriptions = getPrescriptionsSync();
  const now = new Date();

  if (range === 'custom' && customDates) {
    const daysDiff = Math.floor((customDates.end.getTime() - customDates.start.getTime()) / (1000 * 60 * 60 * 24));
    const dateHerbSets: { [date: string]: Set<string> } = {};

    // Generate all dates in range
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(customDates.start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      dateHerbSets[dateStr] = new Set<string>();
    }

    // Count unique herbs for each date
    prescriptions.forEach(p => {
      if (p.createdAt >= customDates.start && p.createdAt <= customDates.end) {
        const dateStr = `${p.createdAt.getMonth() + 1}/${p.createdAt.getDate()}`;
        if (dateHerbSets[dateStr]) {
          p.components.forEach(comp => {
            if (comp.type === 'herb') {
              dateHerbSets[dateStr].add(comp.name);
            }
          });
        }
      }
    });

    return Object.entries(dateHerbSets).map(([date, herbs]) => ({ date, value: herbs.size }));
  } else if (range === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const herbSets = days.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const daysDiff = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const dayIndex = p.createdAt.getDay();
        p.components.forEach(comp => {
          if (comp.type === 'herb') {
            herbSets[dayIndex].add(comp.name);
          }
        });
      }
    });

    return days.map((day, i) => ({ date: day, value: herbSets[i].size }));
  } else if (range === 'month') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const herbSets = weeks.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const daysDiff = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 28) {
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex < 4) {
          p.components.forEach(comp => {
            if (comp.type === 'herb') {
              herbSets[3 - weekIndex].add(comp.name);
            }
          });
        }
      }
    });

    return weeks.map((week, i) => ({ date: week, value: herbSets[i].size }));
  } else if (range === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const herbSets = months.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const yearDiff = now.getFullYear() - p.createdAt.getFullYear();
      if (yearDiff === 0) {
        p.components.forEach(comp => {
          if (comp.type === 'herb') {
            herbSets[p.createdAt.getMonth()].add(comp.name);
          }
        });
      }
    });

    return months.map((month, i) => ({ date: month, value: herbSets[i].size }));
  } else {
    // All time - group by year
    const yearHerbSets: { [year: string]: Set<string> } = {};

    prescriptions.forEach(p => {
      const year = p.createdAt.getFullYear().toString();
      if (!yearHerbSets[year]) {
        yearHerbSets[year] = new Set<string>();
      }
      p.components.forEach(comp => {
        if (comp.type === 'herb') {
          yearHerbSets[year].add(comp.name);
        }
      });
    });

    const sortedYears = Object.keys(yearHerbSets).sort();
    if (sortedYears.length === 0) return [];

    return sortedYears.map(year => ({ date: year, value: yearHerbSets[year].size }));
  }
};

const generateFormulasData = (range: TimeRange, customDates?: { start: Date; end: Date }) => {
  const prescriptions = getPrescriptionsSync();
  const now = new Date();

  if (range === 'custom' && customDates) {
    const daysDiff = Math.floor((customDates.end.getTime() - customDates.start.getTime()) / (1000 * 60 * 60 * 24));
    const dateFormulaSets: { [date: string]: Set<string> } = {};

    // Generate all dates in range
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(customDates.start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      dateFormulaSets[dateStr] = new Set<string>();
    }

    // Count unique formulas for each date
    prescriptions.forEach(p => {
      if (p.createdAt >= customDates.start && p.createdAt <= customDates.end) {
        const dateStr = `${p.createdAt.getMonth() + 1}/${p.createdAt.getDate()}`;
        if (dateFormulaSets[dateStr]) {
          p.components.forEach(comp => {
            if (comp.type === 'formula') {
              dateFormulaSets[dateStr].add(comp.name);
            }
          });
        }
      }
    });

    return Object.entries(dateFormulaSets).map(([date, formulas]) => ({ date, value: formulas.size }));
  } else if (range === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formulaSets = days.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const daysDiff = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const dayIndex = p.createdAt.getDay();
        p.components.forEach(comp => {
          if (comp.type === 'formula') {
            formulaSets[dayIndex].add(comp.name);
          }
        });
      }
    });

    return days.map((day, i) => ({ date: day, value: formulaSets[i].size }));
  } else if (range === 'month') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const formulaSets = weeks.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const daysDiff = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 28) {
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex < 4) {
          p.components.forEach(comp => {
            if (comp.type === 'formula') {
              formulaSets[3 - weekIndex].add(comp.name);
            }
          });
        }
      }
    });

    return weeks.map((week, i) => ({ date: week, value: formulaSets[i].size }));
  } else if (range === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formulaSets = months.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const yearDiff = now.getFullYear() - p.createdAt.getFullYear();
      if (yearDiff === 0) {
        p.components.forEach(comp => {
          if (comp.type === 'formula') {
            formulaSets[p.createdAt.getMonth()].add(comp.name);
          }
        });
      }
    });

    return months.map((month, i) => ({ date: month, value: formulaSets[i].size }));
  } else {
    // All time - group by year
    const yearFormulaSets: { [year: string]: Set<string> } = {};

    prescriptions.forEach(p => {
      const year = p.createdAt.getFullYear().toString();
      if (!yearFormulaSets[year]) {
        yearFormulaSets[year] = new Set<string>();
      }
      p.components.forEach(comp => {
        if (comp.type === 'formula') {
          yearFormulaSets[year].add(comp.name);
        }
      });
    });

    const sortedYears = Object.keys(yearFormulaSets).sort();
    if (sortedYears.length === 0) return [];

    return sortedYears.map(year => ({ date: year, value: yearFormulaSets[year].size }));
  }
};

const generateActiveUsersData = (range: TimeRange, customDates?: { start: Date; end: Date }) => {
  const prescriptions = getPrescriptionsSync();
  const now = new Date();

  if (range === 'custom' && customDates) {
    const daysDiff = Math.floor((customDates.end.getTime() - customDates.start.getTime()) / (1000 * 60 * 60 * 24));
    const dateUserSets: { [date: string]: Set<string> } = {};

    // Generate all dates in range
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(customDates.start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      dateUserSets[dateStr] = new Set<string>();
    }

    // Count unique active users for each date
    prescriptions.forEach(p => {
      if (p.createdAt >= customDates.start && p.createdAt <= customDates.end && p.createdBy?.userEmail) {
        const dateStr = `${p.createdAt.getMonth() + 1}/${p.createdAt.getDate()}`;
        if (dateUserSets[dateStr]) {
          dateUserSets[dateStr].add(p.createdBy.userEmail);
        }
      }
    });

    return Object.entries(dateUserSets).map(([date, users]) => ({ date, value: users.size }));
  } else if (range === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const userSets = days.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const daysDiff = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7 && p.createdBy?.userEmail) {
        const dayIndex = p.createdAt.getDay();
        userSets[dayIndex].add(p.createdBy.userEmail);
      }
    });

    return days.map((day, i) => ({ date: day, value: userSets[i].size }));
  } else if (range === 'month') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const userSets = weeks.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const daysDiff = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 28 && p.createdBy?.userEmail) {
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex < 4) {
          userSets[3 - weekIndex].add(p.createdBy.userEmail);
        }
      }
    });

    return weeks.map((week, i) => ({ date: week, value: userSets[i].size }));
  } else if (range === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const userSets = months.map(() => new Set<string>());

    prescriptions.forEach(p => {
      const yearDiff = now.getFullYear() - p.createdAt.getFullYear();
      if (yearDiff === 0 && p.createdBy?.userEmail) {
        userSets[p.createdAt.getMonth()].add(p.createdBy.userEmail);
      }
    });

    return months.map((month, i) => ({ date: month, value: userSets[i].size }));
  } else {
    // All time - group by year
    const yearUserSets: { [year: string]: Set<string> } = {};

    prescriptions.forEach(p => {
      if (p.createdBy?.userEmail) {
        const year = p.createdAt.getFullYear().toString();
        if (!yearUserSets[year]) {
          yearUserSets[year] = new Set<string>();
        }
        yearUserSets[year].add(p.createdBy.userEmail);
      }
    });

    const sortedYears = Object.keys(yearUserSets).sort();
    if (sortedYears.length === 0) return [];

    return sortedYears.map(year => ({ date: year, value: yearUserSets[year].size }));
  }
};

const generateNewUsersData = (range: TimeRange, customDates?: { start: Date; end: Date }) => {
  const prescriptions = getPrescriptionsSync();
  const now = new Date();

  // Find first prescription date for each user (approximates user creation date)
  const userFirstPrescription: { [email: string]: Date } = {};
  prescriptions.forEach(p => {
    if (p.createdBy?.userEmail) {
      const email = p.createdBy.userEmail;
      if (!userFirstPrescription[email] || p.createdAt < userFirstPrescription[email]) {
        userFirstPrescription[email] = p.createdAt;
      }
    }
  });

  if (range === 'custom' && customDates) {
    const daysDiff = Math.floor((customDates.end.getTime() - customDates.start.getTime()) / (1000 * 60 * 60 * 24));
    const dateCounts: { [date: string]: number } = {};

    // Generate all dates in range
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(customDates.start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      dateCounts[dateStr] = 0;
    }

    // Count new users for each date
    Object.values(userFirstPrescription).forEach(date => {
      if (date >= customDates.start && date <= customDates.end) {
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        if (dateCounts[dateStr] !== undefined) {
          dateCounts[dateStr]++;
        }
      }
    });

    return Object.entries(dateCounts).map(([date, value]) => ({ date, value }));
  } else if (range === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);

    Object.values(userFirstPrescription).forEach(date => {
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const dayIndex = date.getDay();
        counts[dayIndex]++;
      }
    });

    return days.map((day, i) => ({ date: day, value: counts[i] }));
  } else if (range === 'month') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const counts = new Array(4).fill(0);

    Object.values(userFirstPrescription).forEach(date => {
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 28) {
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex < 4) counts[3 - weekIndex]++;
      }
    });

    return weeks.map((week, i) => ({ date: week, value: counts[i] }));
  } else if (range === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = new Array(12).fill(0);

    Object.values(userFirstPrescription).forEach(date => {
      const yearDiff = now.getFullYear() - date.getFullYear();
      if (yearDiff === 0) {
        counts[date.getMonth()]++;
      }
    });

    return months.map((month, i) => ({ date: month, value: counts[i] }));
  } else {
    // All time - group by year
    const yearCounts: { [year: string]: number } = {};

    Object.values(userFirstPrescription).forEach(date => {
      const year = date.getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const sortedYears = Object.keys(yearCounts).sort();
    if (sortedYears.length === 0) return [];

    return sortedYears.map(year => ({ date: year, value: yearCounts[year] }));
  }
};

// Calculate real top herbs and formulas from prescriptions
function calculateTopHerbs() {
  const prescriptions = getPrescriptionsSync();
  const herbCounts: { [name: string]: number } = {};

  prescriptions.forEach(p => {
    p.components.forEach(comp => {
      if (comp.type === 'herb') {
        herbCounts[comp.name] = (herbCounts[comp.name] || 0) + 1;
      }
    });
  });

  const totalHerbUsages = Object.values(herbCounts).reduce((sum, count) => sum + count, 0);

  return Object.entries(herbCounts)
    .map(([name, count], index) => ({
      id: `h${index + 1}`,
      name,
      usageCount: count,
      percentage: totalHerbUsages > 0 ? parseFloat(((count / totalHerbUsages) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 8);
}

function calculateTopFormulas() {
  const prescriptions = getPrescriptionsSync();
  const formulaCounts: { [name: string]: number } = {};

  prescriptions.forEach(p => {
    p.components.forEach(comp => {
      if (comp.type === 'formula') {
        formulaCounts[comp.name] = (formulaCounts[comp.name] || 0) + 1;
      }
    });
  });

  const totalFormulaUsages = Object.values(formulaCounts).reduce((sum, count) => sum + count, 0);

  return Object.entries(formulaCounts)
    .map(([name, count], index) => ({
      id: `f${index + 1}`,
      name,
      usageCount: count,
      percentage: totalFormulaUsages > 0 ? parseFloat(((count / totalFormulaUsages) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);
}

// Calculate real usage averages
function calculateUsageAverages() {
  const prescriptions = getPrescriptionsSync();

  if (prescriptions.length === 0) {
    return {
      avgFormulasPerUser: 0,
      avgHerbsPerFormula: 0,
    };
  }

  // Count prescriptions per user
  const userPrescriptionCounts: { [email: string]: number } = {};
  prescriptions.forEach(p => {
    if (p.createdBy?.userEmail) {
      userPrescriptionCounts[p.createdBy.userEmail] = (userPrescriptionCounts[p.createdBy.userEmail] || 0) + 1;
    }
  });

  const totalUsers = Object.keys(userPrescriptionCounts).length;
  const avgFormulasPerUser = totalUsers > 0 ? prescriptions.length / totalUsers : 0;

  // Count herbs per prescription
  let totalHerbs = 0;
  let prescriptionsWithHerbs = 0;

  prescriptions.forEach(p => {
    const herbCount = p.components.filter(c => c.type === 'herb').length;
    if (herbCount > 0) {
      totalHerbs += herbCount;
      prescriptionsWithHerbs++;
    }
  });

  const avgHerbsPerFormula = prescriptionsWithHerbs > 0 ? totalHerbs / prescriptionsWithHerbs : 0;

  return {
    avgFormulasPerUser: parseFloat(avgFormulasPerUser.toFixed(1)),
    avgHerbsPerFormula: parseFloat(avgHerbsPerFormula.toFixed(1)),
  };
}

// Mock data - User behavior (user distribution not yet implemented with real data)
const userDistribution = [
  { name: 'Low usage', value: 45, count: 56 },
  { name: 'Medium usage', value: 35, count: 43 },
  { name: 'High usage', value: 20, count: 25 },
];

const COLORS = {
  primary: '#0d9488',
  secondary: '#14b8a6',
  tertiary: '#2dd4bf',
  low: '#94a3b8',
  medium: '#64748b',
  high: '#0d9488',
};

export default function AdminUsageAnalytics() {
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  // Calculate real KPI data
  const [kpiData, setKpiData] = useState(calculateRealKPIData());
  const [topHerbs, setTopHerbs] = useState(calculateTopHerbs());
  const [topFormulas, setTopFormulas] = useState(calculateTopFormulas());
  const [usageAverages, setUsageAverages] = useState(calculateUsageAverages());
  const [selectedHerb, setSelectedHerb] = useState<ReturnType<typeof calculateTopHerbs>[0] | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<ReturnType<typeof calculateTopFormulas>[0] | null>(null);

  // Update all data when prescriptions change
  useEffect(() => {
    const updateData = () => {
      setKpiData(calculateRealKPIData());
      setTopHerbs(calculateTopHerbs());
      setTopFormulas(calculateTopFormulas());
      setUsageAverages(calculateUsageAverages());
    };

    updateData();
    window.addEventListener('prescriptions-updated', updateData);
    window.addEventListener('storage', updateData);

    return () => {
      window.removeEventListener('prescriptions-updated', updateData);
      window.removeEventListener('storage', updateData);
    };
  }, []);

  return (
    <>
      <>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage Analytics</h1>
          <p className="hidden sm:block text-gray-600">Comprehensive usage patterns and trends analysis</p>
        </div>

        {/* 1. Global Usage Overview - KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <KPICard
            label="Total prescriptions"
            value={kpiData.totalPrescriptions.current}
            change={kpiData.totalPrescriptions.change}
          />
          <KPICard
            label="Herbs used"
            value={kpiData.herbsUsed.current}
            change={kpiData.herbsUsed.change}
          />
          <KPICard
            label="Formulas used"
            value={kpiData.formulasUsed.current}
            change={kpiData.formulasUsed.change}
          />
          <KPICard
            label="Standard formulas"
            value={`${kpiData.standardFormulas}%`}
            subtitle={`${kpiData.customFormulas}% custom`}
          />
          <KPICard
            label="Active users"
            value={kpiData.activeUsers.current}
            change={kpiData.activeUsers.change}
          />
        </div>

        {/* 2. Time-based Analytics - Line Charts with Individual Selectors */}
        <div className="space-y-6 mb-8">
          <ChartCard key="prescriptions-chart" title="Prescriptions generated over time" dataGenerator={generatePrescriptionsData} color={COLORS.primary} isMobile={isMobile} />
          <ChartCard key="herbs-chart" title="Herbs used over time" dataGenerator={generateHerbsData} color={COLORS.secondary} isMobile={isMobile} />
          <ChartCard key="formulas-chart" title="Formulas used over time" dataGenerator={generateFormulasData} color={COLORS.tertiary} isMobile={isMobile} />
          <ChartCard key="active-users-chart" title="Active users over time" dataGenerator={generateActiveUsersData} color={COLORS.primary} isMobile={isMobile} />
          <ChartCard key="new-users-chart" title="New users over time" dataGenerator={generateNewUsersData} color={COLORS.secondary} isMobile={isMobile} />
        </div>

        {/* 3. Content Usage Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Herbs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top herbs used</h2>
              <Link
                to="/admin/usage-analytics/herbs"
                className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {topHerbs.map((herb) => (
                <button
                  key={herb.id}
                  onClick={() => setSelectedHerb(herb)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <span className="text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                    {herb.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{herb.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-700">{herb.usageCount}</span>
                    <Info className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Formulas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top formulas used</h2>
              <Link
                to="/admin/usage-analytics/formulas"
                className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {topFormulas.map((formula) => (
                <button
                  key={formula.id}
                  onClick={() => setSelectedFormula(formula)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <span className="text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                    {formula.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{formula.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-700">{formula.usageCount}</span>
                    <Info className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Formula Type Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Formula type distribution</h2>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Standard', value: kpiData.standardFormulas },
                      { name: 'Custom', value: kpiData.customFormulas },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell key="cell-standard" fill={COLORS.primary} />
                    <Cell key="cell-custom" fill={COLORS.tertiary} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                  <span className="text-sm text-gray-600">Standard ({kpiData.standardFormulas}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-300"></div>
                  <span className="text-sm text-gray-600">Custom ({kpiData.customFormulas}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. User Behavior Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Average Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Usage averages</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Avg. prescriptions per user</span>
                <span className="text-2xl font-bold text-gray-900">{usageAverages.avgFormulasPerUser}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Avg. herbs per prescription</span>
                <span className="text-2xl font-bold text-gray-900">{usageAverages.avgHerbsPerFormula}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total active users</span>
                <span className="text-2xl font-bold text-teal-600">{kpiData.activeUsers.current}</span>
              </div>
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">User distribution by usage level</h2>
            <div className="space-y-4">
              {userDistribution.map((segment, index) => (
                <div key={segment.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{segment.name}</span>
                    <span className="text-sm text-gray-600">{segment.count} users ({segment.value}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${segment.value}%`,
                        backgroundColor: index === 0 ? COLORS.low : index === 1 ? COLORS.medium : COLORS.high,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>

      {/* Drill-down Modal - Herb Detail */}
      <Dialog.Root open={!!selectedHerb} onOpenChange={(open) => !open && setSelectedHerb(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto z-50">
            <Dialog.Description className="sr-only">Herb usage analytics details</Dialog.Description>
            <div className="p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
                {selectedHerb?.name}
              </Dialog.Title>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total usage count</div>
                  <div className="text-3xl font-bold text-gray-900">{selectedHerb?.usageCount}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Usage percentage</div>
                  <div className="text-3xl font-bold text-teal-600">{selectedHerb?.percentage}%</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Appears in prescriptions</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {selectedHerb ? (() => {
                      const prescriptions = getPrescriptionsSync();
                      return prescriptions.filter(p =>
                        p.components.some(c => c.type === 'herb' && c.name === selectedHerb.name)
                      ).length;
                    })() : 0}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Used by practitioners</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {selectedHerb ? (() => {
                      const prescriptions = getPrescriptionsSync();
                      const users = new Set<string>();
                      prescriptions.forEach(p => {
                        if (p.createdBy?.userEmail &&
                            p.components.some(c => c.type === 'herb' && c.name === selectedHerb.name)) {
                          users.add(p.createdBy.userEmail);
                        }
                      });
                      return users.size;
                    })() : 0}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedHerb(null)}
                className="w-full mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Drill-down Modal - Formula Detail */}
      <Dialog.Root open={!!selectedFormula} onOpenChange={(open) => !open && setSelectedFormula(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto z-50">
            <Dialog.Description className="sr-only">Formula usage analytics details</Dialog.Description>
            <div className="p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
                {selectedFormula?.name}
              </Dialog.Title>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Usage frequency</div>
                  <div className="text-3xl font-bold text-gray-900">{selectedFormula?.usageCount}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Usage percentage</div>
                  <div className="text-3xl font-bold text-teal-600">{selectedFormula?.percentage}%</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Used by practitioners</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {selectedFormula ? (() => {
                      const prescriptions = getPrescriptionsSync();
                      const users = new Set<string>();
                      prescriptions.forEach(p => {
                        if (p.createdBy?.userEmail &&
                            p.components.some(c => c.type === 'formula' && c.name === selectedFormula.name)) {
                          users.add(p.createdBy.userEmail);
                        }
                      });
                      return users.size;
                    })() : 0}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-3">Most common co-prescribed herbs</div>
                  <div className="space-y-2">
                    {selectedFormula ? (() => {
                      const prescriptions = getPrescriptionsSync();
                      const herbCounts: { [name: string]: number } = {};
                      let totalPrescriptionsWithFormula = 0;

                      prescriptions.forEach(p => {
                        const hasFormula = p.components.some(c => c.type === 'formula' && c.name === selectedFormula.name);
                        if (hasFormula) {
                          totalPrescriptionsWithFormula++;
                          p.components.forEach(c => {
                            if (c.type === 'herb') {
                              herbCounts[c.name] = (herbCounts[c.name] || 0) + 1;
                            }
                          });
                        }
                      });

                      const topCoHerbs = Object.entries(herbCounts)
                        .map(([name, count]) => ({
                          name,
                          percentage: totalPrescriptionsWithFormula > 0
                            ? Math.round((count / totalPrescriptionsWithFormula) * 100)
                            : 0,
                        }))
                        .sort((a, b) => b.percentage - a.percentage)
                        .slice(0, 4);

                      if (topCoHerbs.length === 0) {
                        return <div className="text-sm text-gray-500">No herbs co-prescribed</div>;
                      }

                      return topCoHerbs.map(herb => (
                        <div key={herb.name} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{herb.name}</span>
                          <span className="font-medium text-gray-900">{herb.percentage}%</span>
                        </div>
                      ));
                    })() : null}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedFormula(null)}
                className="w-full mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

// KPI Card Component
function KPICard({
  label,
  value,
  change,
  subtitle,
}: {
  label: string;
  value: string | number;
  change?: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {change !== undefined ? (
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{change >= 0 ? '+' : ''}{change}%</span>
        </div>
      ) : subtitle ? (
        <div className="text-xs text-gray-500">{subtitle}</div>
      ) : null}
    </div>
  );
}

// Chart Card Component with Individual Time Selector
function ChartCard({
  title,
  dataGenerator,
  color,
  isMobile,
}: {
  title: string;
  dataGenerator: (range: TimeRange, customDates?: { start: Date; end: Date }) => Array<{ date: string; value: number }>;
  color: string;
  isMobile: boolean;
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDates, setCustomDates] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const datePickerRef = useRef<HTMLDivElement>(null);

  const parsedCustomDates = customDates.start && customDates.end
    ? { start: new Date(customDates.start), end: new Date(customDates.end) }
    : undefined;

  const data = dataGenerator(timeRange, parsedCustomDates);

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="relative" ref={datePickerRef}>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setTimeRange('week');
                setShowDatePicker(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => {
                setTimeRange('month');
                setShowDatePicker(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => {
                setTimeRange('year');
                setShowDatePicker(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === 'year'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => {
                setTimeRange('all');
                setShowDatePicker(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All time
            </button>
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                if (!showDatePicker && customDates.start && customDates.end) {
                  setTimeRange('custom');
                }
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === 'custom'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[280px]">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    value={customDates.start}
                    onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    value={customDates.end}
                    onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  onClick={() => {
                    if (customDates.start && customDates.end) {
                      setTimeRange('custom');
                      setShowDatePicker(false);
                    }
                  }}
                  disabled={!customDates.start || !customDates.end}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 150 : 250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: isMobile ? -20 : 0, bottom: 5 }}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis key="xaxis" dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis key="yaxis" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            key="tooltip"
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
          <Line
            key="line"
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}