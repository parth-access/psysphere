export type PricingTier = {
  id: string;
  name: string;
  price: number;
  classes: number;
  save?: number;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
};

export type CoursePricing = {
  standard: PricingTier[];
  cuet?: PricingTier[];
};

export const pricing: Record<string, CoursePricing> = {
  class11: {
    standard: [
      {
        id: '11-std-monthly',
        name: 'Monthly',
        price: 3000,
        classes: 12,
        features: ['Study Material Included', 'Live Lectures', 'Doubt Support'],
      },
      {
        id: '11-std-quarterly',
        name: 'Quarterly',
        price: 8500,
        classes: 36,
        save: 500,
        popular: true,
        features: ['Everything in Monthly', 'Weekly Tests', 'Performance Reports'],
      },
      {
        id: '11-std-half',
        name: 'Half Yearly',
        price: 16000,
        classes: 72,
        save: 2000,
        features: ['Everything in Quarterly', '1-on-1 Mentorship', 'Revision Strategy'],
      },
      {
        id: '11-std-yearly',
        name: 'Yearly',
        price: 30000,
        classes: 144,
        save: 6000,
        bestValue: true,
        features: ['Priority Support', 'Full Syllabus Coverage', 'Exam Blueprints'],
      },
    ],
    cuet: [
      {
        id: '11-cuet-monthly',
        name: 'Monthly',
        price: 4000,
        classes: 16,
        features: ['Board + CUET Material', 'Live Lectures', 'Doubt Support'],
      },
      {
        id: '11-cuet-quarterly',
        name: 'Quarterly',
        price: 11000,
        classes: 48,
        save: 1000,
        popular: true,
        features: ['Everything in Monthly', 'CUET Mock Tests', 'Performance Reports'],
      },
      {
        id: '11-cuet-half',
        name: 'Half Yearly',
        price: 21000,
        classes: 96,
        save: 3000,
        features: ['Everything in Quarterly', '1-on-1 Mentorship', 'College Counseling'],
      },
      {
        id: '11-cuet-yearly',
        name: 'Yearly',
        price: 40000,
        classes: 192,
        save: 8000,
        bestValue: true,
        features: ['Priority Support', 'Complete CUET Guidance', 'Exam Blueprints'],
      },
    ],
  },
  class12: {
    standard: [
      {
        id: '12-std-monthly',
        name: 'Monthly',
        price: 3500,
        classes: 12,
        features: ['Study Material Included', 'Live Lectures', 'Doubt Support'],
      },
      {
        id: '12-std-quarterly',
        name: 'Quarterly',
        price: 10000,
        classes: 36,
        save: 500,
        popular: true,
        features: ['Everything in Monthly', 'Weekly Tests', 'Board Blueprints'],
      },
      {
        id: '12-std-half',
        name: 'Half Yearly',
        price: 19000,
        classes: 72,
        save: 2000,
        features: ['Everything in Quarterly', '1-on-1 Mentorship', 'Revision Strategy'],
      },
      {
        id: '12-std-yearly',
        name: 'Yearly',
        price: 35000,
        classes: 144,
        save: 7000,
        bestValue: true,
        features: ['Priority Support', 'Full Syllabus Coverage', 'Exam Blueprints'],
      },
    ],
    cuet: [
      {
        id: '12-cuet-monthly',
        name: 'Monthly',
        price: 4500,
        classes: 16,
        features: ['Board + CUET Material', 'Live Lectures', 'Doubt Support'],
      },
      {
        id: '12-cuet-quarterly',
        name: 'Quarterly',
        price: 13000,
        classes: 48,
        save: 500,
        popular: true,
        features: ['Everything in Monthly', 'CUET Mock Tests', 'Performance Reports'],
      },
      {
        id: '12-cuet-half',
        name: 'Half Yearly',
        price: 25000,
        classes: 96,
        save: 2000,
        features: ['Everything in Quarterly', '1-on-1 Mentorship', 'College Counseling'],
      },
      {
        id: '12-cuet-yearly',
        name: 'Yearly',
        price: 45000,
        classes: 192,
        save: 9000,
        bestValue: true,
        features: ['Priority Support', 'Complete CUET Guidance', 'Exam Blueprints'],
      },
    ]
  },
};
