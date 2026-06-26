import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { Survey } from '../types';

export async function seedSurveys() {
  const db = getFirebaseDb();
  if (!db) return;

  const surveysCol = collection(db, 'surveys');

  const sampleSurveys: Omit<Survey, 'id'>[] = [
    {
      title: 'Protocol Security Review',
      description: 'Help us improve our smart contract safety standards and governance security.',
      reward: 50,
      type: 'text',
      createdAt: serverTimestamp(),
      questions: [
        {
          id: 'q1',
          text: 'How often do you audit your smart contract interactions?',
          type: 'multiple-choice',
          options: ['Every transaction', 'Weekly', 'Monthly', 'Never']
        },
        {
          id: 'q2',
          text: 'Which security feature do you value most in a DeFi protocol?',
          type: 'multiple-choice',
          options: ['Multi-sig Treasury', 'Time-locks', 'Open Source Code', 'Insurance Fund']
        },
        {
          id: 'q3',
          text: 'Describe any security concerns you have with current L2 bridges.',
          type: 'text'
        }
      ]
    },
    {
      title: 'UI/UX Visual Testing',
      description: 'Review our latest dashboard designs and provide feedback on the aesthetic and layout.',
      reward: 35,
      type: 'image',
      createdAt: serverTimestamp(),
      questions: [
        {
          id: 'q1',
          text: 'Is the dark-mode aesthetic clear and readable?',
          type: 'multiple-choice',
          options: ['Perfect', 'Too Dark', 'Too Bright', 'Needs more contrast']
        },
        {
          id: 'q2',
          text: 'How intuitive is the sidebar navigation on a scale of 1-5?',
          type: 'multiple-choice',
          options: ['1', '2', '3', '4', '5']
        }
      ]
    },
    {
      title: 'Community Voice Survey',
      description: 'Provide voice-inspired feedback on our upcoming roadmap and feature priorities.',
      reward: 75,
      type: 'voice',
      createdAt: serverTimestamp(),
      questions: [
        {
          id: 'q1',
          text: 'What feature should be our #1 priority for Q3?',
          type: 'multiple-choice',
          options: ['Mobile App', 'Staking v2', 'Cross-chain Bridge', 'DAO Governance']
        },
        {
          id: 'q2',
          text: 'Would you participate in a weekly community call?',
          type: 'multiple-choice',
          options: ['Yes, definitely', 'Maybe', 'No time', 'Only if rewarded']
        }
      ]
    }
  ];

  console.log('Seeding surveys...');
  for (const survey of sampleSurveys) {
    // Use a deterministic ID derived from the title so re-runs are idempotent
    const slug = survey.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const surveyRef = doc(surveysCol, slug);
    await setDoc(surveyRef, survey, { merge: true });
  }
  console.log('Seeding complete!');
}
