import mongoose from 'mongoose';
import { Place } from '../models/Place.js';
import { WaitReport } from '../models/WaitReport.js';
import { connectDB, disconnectDB } from '../config/db.js';

const samplePlaces = [
  {
    name: 'Central Copy & Print Hub',
    category: 'Copy Shop',
    address: '14 University Square, Main Block'
  },
  {
    name: 'State Bank Customer Service Branch',
    category: 'Bank',
    address: '102 Financial District, 2nd Avenue'
  },
  {
    name: 'Downtown General Post Office',
    category: 'Post Office',
    address: '45 Old Postal Road, Sector 1'
  },
  {
    name: 'District Citizen Service & Passport Desk',
    category: 'Government Office',
    address: '7 Civic Center Plaza, East Wing'
  },
  {
    name: 'Apollo MedPlus Pharmacy & Walk-in Desk',
    category: 'Clinic/Pharmacy',
    address: '88 Ring Road, Near Metro Pillar 12'
  }
];

// Helper to construct visited dates within the last 25 days with specific hours
function createPastDate(daysAgo, targetHour, minute = 15) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(targetHour, minute, 0, 0);
  return d;
}

export async function runSeed() {
  console.log('--- Starting LocalWait Times Seed Script ---');
  await connectDB();

  // Clear existing data
  await Place.deleteMany({});
  await WaitReport.deleteMany({});
  console.log('Cleared existing places and reports.');

  // Insert sample places
  const createdPlaces = await Place.insertMany(samplePlaces);
  console.log(`Created ${createdPlaces.length} sample places.`);

  const bank = createdPlaces.find((p) => p.name.includes('Bank'));
  const post = createdPlaces.find((p) => p.name.includes('Post'));
  const copy = createdPlaces.find((p) => p.name.includes('Copy'));
  const govt = createdPlaces.find((p) => p.name.includes('Citizen'));
  const clinic = createdPlaces.find((p) => p.name.includes('Apollo'));

  const reports = [
    // --- Bank Reports (Demonstrating dense reports for Morning & Afternoon, sparse for Early Morning/Late) ---
    // Early Morning (6-9): 1 report (demonstrates insufficient: true)
    { place: bank._id, waitMinutes: 8, visitedAt: createPastDate(2, 8, 30), note: 'Doors opened early, only 2 people ahead' },
    // Morning (9-12): 5 reports
    { place: bank._id, waitMinutes: 18, visitedAt: createPastDate(1, 10, 15), note: '3 counters operational, token system active' },
    { place: bank._id, waitMinutes: 25, visitedAt: createPastDate(3, 11, 0), note: 'Peak morning crowd for cash deposits' },
    { place: bank._id, waitMinutes: 15, visitedAt: createPastDate(4, 9, 45), note: 'Prompt service at counter 2' },
    { place: bank._id, waitMinutes: 22, visitedAt: createPastDate(7, 10, 30), note: 'Passbook updating machine took 5 min' },
    { place: bank._id, waitMinutes: 30, visitedAt: createPastDate(10, 11, 45), note: 'Heavy rush before lunch break' },
    // Afternoon (12-16): 6 reports
    { place: bank._id, waitMinutes: 35, visitedAt: createPastDate(2, 13, 15), note: 'Lunch shift; only one clerk available' },
    { place: bank._id, waitMinutes: 40, visitedAt: createPastDate(5, 14, 0), note: 'Staff on rotation, slow queue' },
    { place: bank._id, waitMinutes: 28, visitedAt: createPastDate(6, 12, 30), note: 'Waited around 30 min for draft clearance' },
    { place: bank._id, waitMinutes: 20, visitedAt: createPastDate(8, 15, 15), note: 'Quick verification at helpdesk' },
    { place: bank._id, waitMinutes: 32, visitedAt: createPastDate(12, 13, 45), note: 'Crowded near the front desks' },
    { place: bank._id, waitMinutes: 25, visitedAt: createPastDate(15, 14, 30), note: 'Average wait for KYC update' },
    // Evening (16-20): 4 reports
    { place: bank._id, waitMinutes: 12, visitedAt: createPastDate(1, 16, 30), note: 'Fast clearance before branch closing' },
    { place: bank._id, waitMinutes: 15, visitedAt: createPastDate(3, 17, 15), note: 'Staff hurried through remaining tokens' },
    { place: bank._id, waitMinutes: 10, visitedAt: createPastDate(9, 16, 45), note: 'Light crowd' },
    { place: bank._id, waitMinutes: 18, visitedAt: createPastDate(14, 18, 0), note: 'Last batch before counter shut' },

    // --- Post Office Reports ---
    // Early Morning: 2 reports (insufficient)
    { place: post._id, waitMinutes: 5, visitedAt: createPastDate(3, 7, 30), note: 'Drop-off box available outside' },
    { place: post._id, waitMinutes: 7, visitedAt: createPastDate(6, 8, 15), note: 'Early queue before official stamp counter opened' },
    // Morning (9-12): 4 reports
    { place: post._id, waitMinutes: 20, visitedAt: createPastDate(2, 10, 0), note: 'Speed post line had 8 people' },
    { place: post._id, waitMinutes: 28, visitedAt: createPastDate(5, 11, 15), note: 'Parcel weighing scale was glitching' },
    { place: post._id, waitMinutes: 18, visitedAt: createPastDate(9, 9, 30), note: 'Registered mail counter moved steadily' },
    { place: post._id, waitMinutes: 24, visitedAt: createPastDate(13, 10, 45), note: 'Postal savings counter was packed' },
    // Afternoon (12-16): 3 reports
    { place: post._id, waitMinutes: 14, visitedAt: createPastDate(4, 13, 30), note: 'Lunch time, but 2 windows stayed open' },
    { place: post._id, waitMinutes: 19, visitedAt: createPastDate(8, 14, 15), note: 'Customs forms took extra time' },
    { place: post._id, waitMinutes: 16, visitedAt: createPastDate(11, 15, 0), note: 'Regular parcel booking' },
    // Evening (16-20): 3 reports
    { place: post._id, waitMinutes: 9, visitedAt: createPastDate(2, 17, 0), note: 'Fast processing near closing' },
    { place: post._id, waitMinutes: 12, visitedAt: createPastDate(7, 18, 15), note: 'No line for stamps' },
    { place: post._id, waitMinutes: 15, visitedAt: createPastDate(16, 17, 30), note: 'Last minute parcel dispatch' },

    // --- Copy Shop Reports ---
    // Morning: 3 reports
    { place: copy._id, waitMinutes: 6, visitedAt: createPastDate(1, 9, 30), note: 'Binding job done in 6 minutes' },
    { place: copy._id, waitMinutes: 12, visitedAt: createPastDate(4, 11, 0), note: 'College students printing project reports' },
    { place: copy._id, waitMinutes: 8, visitedAt: createPastDate(7, 10, 15), note: 'Color prints ready quickly' },
    // Afternoon: 4 reports
    { place: copy._id, waitMinutes: 15, visitedAt: createPastDate(2, 13, 30), note: 'Photocopy queue of 5 people' },
    { place: copy._id, waitMinutes: 20, visitedAt: createPastDate(5, 14, 45), note: 'Poster printing in progress' },
    { place: copy._id, waitMinutes: 10, visitedAt: createPastDate(9, 12, 15), note: 'Single counter operator' },
    { place: copy._id, waitMinutes: 14, visitedAt: createPastDate(12, 15, 30), note: 'Architectural blueprint printing took time' },
    // Evening: 3 reports
    { place: copy._id, waitMinutes: 22, visitedAt: createPastDate(3, 18, 0), note: 'Rush hour after evening classes' },
    { place: copy._id, waitMinutes: 18, visitedAt: createPastDate(6, 19, 15), note: 'Lamination machine warming up' },
    { place: copy._id, waitMinutes: 25, visitedAt: createPastDate(10, 17, 45), note: 'High volume bulk orders' },
    // Late (20-6): 2 reports
    { place: copy._id, waitMinutes: 10, visitedAt: createPastDate(1, 20, 30), note: 'Late night thesis prints' },
    { place: copy._id, waitMinutes: 5, visitedAt: createPastDate(4, 21, 0), note: 'Zero wait, instant print' },

    // --- Government Service Office Reports ---
    // Morning: 4 reports
    { place: govt._id, waitMinutes: 45, visitedAt: createPastDate(2, 9, 30), note: 'Long biometric verification queue' },
    { place: govt._id, waitMinutes: 60, visitedAt: createPastDate(5, 10, 15), note: 'Document scanning server was lagging' },
    { place: govt._id, waitMinutes: 50, visitedAt: createPastDate(8, 11, 0), note: 'Token 104; took nearly an hour' },
    { place: govt._id, waitMinutes: 40, visitedAt: createPastDate(14, 9, 45), note: 'Arrived early, moderate wait' },
    // Afternoon: 3 reports
    { place: govt._id, waitMinutes: 70, visitedAt: createPastDate(3, 13, 0), note: 'Peak afternoon backlog' },
    { place: govt._id, waitMinutes: 55, visitedAt: createPastDate(7, 14, 30), note: 'Officer on round inspection' },
    { place: govt._id, waitMinutes: 65, visitedAt: createPastDate(11, 15, 15), note: 'Wait time before counter call was long' },

    // --- Pharmacy Reports ---
    // Morning: 3 reports
    { place: clinic._id, waitMinutes: 5, visitedAt: createPastDate(1, 9, 15), note: 'Prescription filled immediately' },
    { place: clinic._id, waitMinutes: 8, visitedAt: createPastDate(3, 10, 30), note: 'Brief insurance approval wait' },
    { place: clinic._id, waitMinutes: 6, visitedAt: createPastDate(6, 11, 15), note: 'Staff checked computer stock' },
    // Evening: 4 reports
    { place: clinic._id, waitMinutes: 15, visitedAt: createPastDate(2, 17, 30), note: 'Doctor clinic nearby caused sudden crowd' },
    { place: clinic._id, waitMinutes: 18, visitedAt: createPastDate(4, 18, 45), note: 'Billing counter backup' },
    { place: clinic._id, waitMinutes: 12, visitedAt: createPastDate(8, 19, 0), note: 'Only 1 pharmacist on duty' },
    { place: clinic._id, waitMinutes: 14, visitedAt: createPastDate(13, 18, 15), note: 'Waited for compounding syrup' }
  ];

  // Insert reports using model so pre-validate derivation hooks run
  let insertedCount = 0;
  for (const reportData of reports) {
    await WaitReport.create(reportData);
    insertedCount++;
  }

  console.log(`Successfully created ${insertedCount} realistic wait reports across all time buckets.`);
  console.log('All data is marked community/user-reported.');
  console.log('--- Seed Completed Successfully ---');

  await disconnectDB();
}

// Run directly if invoked via node
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
