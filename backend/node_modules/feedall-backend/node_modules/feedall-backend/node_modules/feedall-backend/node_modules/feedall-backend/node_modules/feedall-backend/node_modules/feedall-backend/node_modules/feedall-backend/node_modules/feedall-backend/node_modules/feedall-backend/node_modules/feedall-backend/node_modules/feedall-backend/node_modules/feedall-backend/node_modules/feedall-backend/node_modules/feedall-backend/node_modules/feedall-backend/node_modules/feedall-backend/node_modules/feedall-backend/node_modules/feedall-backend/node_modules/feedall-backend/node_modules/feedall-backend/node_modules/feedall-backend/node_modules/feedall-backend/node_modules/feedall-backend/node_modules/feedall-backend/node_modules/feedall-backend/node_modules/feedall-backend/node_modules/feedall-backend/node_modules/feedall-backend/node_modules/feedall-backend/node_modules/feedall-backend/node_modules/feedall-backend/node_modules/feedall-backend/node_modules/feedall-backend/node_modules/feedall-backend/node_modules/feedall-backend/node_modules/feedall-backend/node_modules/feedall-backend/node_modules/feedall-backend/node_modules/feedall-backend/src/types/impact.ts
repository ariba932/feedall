export enum ImpactCategory {
  MEALS_SERVED = 'MEALS_SERVED',
  FOOD_SAVED = 'FOOD_SAVED',
  BENEFICIARIES_REACHED = 'BENEFICIARIES_REACHED',
  FOOD_WASTE_REDUCED = 'FOOD_WASTE_REDUCED',
  CARBON_FOOTPRINT_REDUCED = 'CARBON_FOOTPRINT_REDUCED',
  COMMUNITY_ENGAGEMENT = 'COMMUNITY_ENGAGEMENT',
}

export interface ImpactMetric {
  category: ImpactCategory;
  value: number;
  unit: string;
  description: string;
}

export interface ImpactTestimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface ImpactEvidence {
  images: string[];
  description: string;
  testimonials: ImpactTestimonial[];
  metrics: ImpactMetric[];
  timestamp: Date;
}

export interface ImpactBeneficiaries {
  total: number;
  demographics: {
    children: number;
    adults: number;
    elderly: number;
  };
}

export interface ImpactData {
  entityId: string;
  entityType: string;
  category: ImpactCategory;
  metrics: ImpactMetric[];
  evidence: ImpactEvidence;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  date: Date;
  description: string;
  beneficiaries: ImpactBeneficiaries;
  sdgGoals: number[]; // UN Sustainable Development Goals (1-17)
}

export interface ImpactSummaryMetric {
  category: ImpactCategory;
  total: number;
  unit: string;
}

export interface ImpactLocationSummary {
  location: string;
  count: number;
}

export interface ImpactSDGContribution {
  goal: number;
  count: number;
}

export interface ImpactSummary {
  totalBeneficiaries: number;
  metrics: ImpactSummaryMetric[];
  topLocations: ImpactLocationSummary[];
  sdgContributions: ImpactSDGContribution[];
}

export interface ImpactFilter {
  entityType?: string;
  category?: ImpactCategory;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  minBeneficiaries?: number;
  maxBeneficiaries?: number;
  sdgGoal?: number;
}
