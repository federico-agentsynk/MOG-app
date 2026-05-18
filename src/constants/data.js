export const PUSH_DAY_EXERCISES = [
  { id: 'p1', name: 'Incline Smith Bench', sets: 3 },
  { id: 'p2', name: 'Dips', sets: 3 },
  { id: 'p3', name: 'Cable Flys Lower', sets: 3 },
  { id: 'p4', name: 'Pec Dec', sets: 3 },
  { id: 'p5', name: 'Shoulder Press', sets: 3 },
  { id: 'p6', name: 'Cable Lat Raises', sets: 3 },
  { id: 'p7', name: 'Lat Raise Machine', sets: 3 },
  { id: 'p8', name: 'Tricep Pushdowns', sets: 3 },
  { id: 'p9', name: 'Overhead Cable Extensions', sets: 3 },
  { id: 'p10', name: 'Pushups to Failure', sets: 3 },
];

export const PULL_DAY_EXERCISES = [
  { id: 'l1', name: 'Weighted Pull-ups', sets: 3 },
  { id: 'l2', name: 'Row Machine', sets: 3 },
  { id: 'l3', name: 'Pull Down Machine', sets: 3 },
  { id: 'l4', name: 'Shrugs', sets: 3 },
  { id: 'l5', name: 'Curls', sets: 3 },
  { id: 'l6', name: 'Single Arm Dumbbell Preacher', sets: 3 },
  { id: 'l7', name: 'Single Arm Behind Back Cable Curls', sets: 3 },
  { id: 'l8', name: 'Hammer Curls', sets: 3 },
  { id: 'l9', name: 'Farmer Carries', sets: 3 },
];

export const DAILY_PROTOCOL = [
  { id: 'dp1', name: 'Morning Stack (Creatine, Vitamin D, Omega-3)', icon: '✅' },
  { id: 'dp2', name: 'Pre-workout Meal (High Protein)', icon: '🥩' },
  { id: 'dp3', name: 'Hydration Goal (1 gallon water)', icon: '💧' },
  { id: 'dp4', name: 'Post-workout Protein (50g+)', icon: '🥛' },
  { id: 'dp5', name: 'Nighttime Stack (ZMA, Magnesium)', icon: '🌙' },
];

// daysRestricted uses JS getDay() values: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
export const WEEKLY_HABITS = [
  { id: 'wh1', name: 'Morning Sunlight (10 min)', daysRestricted: null },
  { id: 'wh2', name: 'Cold Shower', daysRestricted: null },
  { id: 'wh3', name: 'Stretch / Mobility Work', daysRestricted: null },
  { id: 'wh4', name: 'Sleep by 10pm', daysRestricted: null },
  { id: 'wh5', name: 'No Alcohol', daysRestricted: null },
  { id: 'wh6', name: 'Dandelion Root Flush', daysRestricted: [4, 5, 6] },
];
