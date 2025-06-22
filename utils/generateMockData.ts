import { Note, Mood } from '../types';
import { StorageService } from '../services/storage';

const juneEntries = [
  { day: 1, mood: 4, content: "First day of June! Summer is finally here. Went for a long walk in the park and enjoyed the warm weather. The flowers are blooming everywhere. Made plans to visit the beach this weekend." },
  { day: 2, mood: 5, content: "Amazing day at the beach! The water was perfect. Built sandcastles with the kids and had ice cream. Saw dolphins in the distance. Perfect sunset to end the day. Feeling grateful for these moments." },
  { day: 3, mood: 3, content: "Back to work after the weekend. Lots of emails to catch up on. Had a productive meeting about the new project. Feeling a bit tired but optimistic about the week ahead." },
  { day: 4, mood: 4, content: "Tried that new coffee shop downtown - amazing cappuccino! Met Sarah for lunch and we talked about her wedding plans. Evening yoga class was exactly what I needed." },
  { day: 5, mood: 2, content: "Rough day. The project deadline got moved up and everyone is stressed. Had to skip lunch to finish the presentation. At least tomorrow is Friday..." },
  { day: 6, mood: 4, content: "TGIF! Presentation went well despite yesterday's stress. Team celebrated with drinks after work. Looking forward to sleeping in tomorrow." },
  { day: 7, mood: 5, content: "Lazy Saturday morning. Made pancakes and read the newspaper. Went to the farmer's market - bought fresh strawberries and flowers. Movie night with friends." },
  { day: 8, mood: 4, content: "Sunday brunch with the family. Mom made her famous lasagna. Played board games with my nephew - he's getting so big! Prepared meals for the week." },
  { day: 9, mood: 3, content: "Monday blues. Woke up late and rushed to work. At least the weather is nice. Started reading a new book during lunch break - 'The Midnight Library'." },
  { day: 10, mood: 4, content: "Productive day! Finished two major tasks and felt accomplished. Went for a run after work - managed 5K without stopping. Healthy dinner and early to bed." },
  { day: 11, mood: 5, content: "Got the promotion! All the hard work paid off. Team surprised me with a cake. Called parents to share the good news. Celebrating tonight!" },
  { day: 12, mood: 3, content: "Bit hungover from last night's celebration. Worth it though! Light day at work. Lots of congratulations from colleagues. Need to start planning for new role." },
  { day: 13, mood: 4, content: "Friday the 13th - but it was actually lucky! Found $20 on the street. Had a great lunch with an old friend. Weekend plans: hiking trip to the mountains." },
  { day: 14, mood: 5, content: "Mountain hiking was incredible! The views from the top were breathtaking. Saw a family of deer. Legs are sore but soul is happy. Nature is the best therapy." },
  { day: 15, mood: 4, content: "Father's Day! Spent quality time with dad. We went fishing like old times. Didn't catch much but the conversation was priceless. BBQ dinner with the whole family." },
  { day: 16, mood: 3, content: "Back to reality. New responsibilities at work are challenging but exciting. Learning curve is steep. Mentor session was helpful. One day at a time." },
  { day: 17, mood: 4, content: "Getting the hang of things. Successfully led my first team meeting. Received positive feedback. Treated myself to sushi for dinner. Progress feels good." },
  { day: 18, mood: 2, content: "Stressful day. Technical issues delayed everything. Stayed late to fix problems. Missed dinner plans with friends. Tomorrow will be better." },
  { day: 19, mood: 4, content: "Much better day! Problems from yesterday resolved. Team pulled together. Rescheduled dinner with friends - great conversations and lots of laughs." },
  { day: 20, mood: 5, content: "SUMMER SOLSTICE! Longest day of the year. Watched sunrise from the rooftop. Evening picnic in the park with live music. Danced until sunset. Magical day." },
  { day: 21, mood: 4, content: "Farmer's market finds: heirloom tomatoes, fresh basil, local honey. Made bruschetta for lunch. Started learning Italian on app. Planning trip to Italy next year?" },
  { day: 22, mood: 3, content: "Rainy Saturday. Perfect for staying in. Organized closet and donated old clothes. Binge-watched new series. Made soup from scratch. Cozy day." },
  { day: 23, mood: 4, content: "Sunday adventure: discovered new hiking trail. Waterfall at the end was worth the climb. Picnic by the stream. Nature photography practice. Feeling refreshed." },
  { day: 24, mood: 4, content: "Great start to the week. New project kickoff went smoothly. Team seems enthusiastic. Gym after work - personal trainer pushed me hard. Feeling strong." },
  { day: 25, mood: 3, content: "Mid-week slump. Lots of meetings, not much actual work done. At least lunch was good - tried the new Thai place. Early to bed tonight." },
  { day: 26, mood: 5, content: "Surprise visit from college roommate! Hadn't seen her in 2 years. Stayed up late catching up. So many memories and laughs. Friendship goals." },
  { day: 27, mood: 4, content: "Tired but happy from yesterday. Short day at work for dentist appointment. Clean bill of health! Ice cream to celebrate (ironic, I know)." },
  { day: 28, mood: 4, content: "Friday vibes! Casual day at office. Team lunch for birthdays this month. Evening concert in the park - jazz under the stars. Summer nights are the best." },
  { day: 29, mood: 5, content: "Beach day with friends! Volleyball, swimming, sandcastles. Got a bit sunburned but worth it. BBQ at sunset. These are the days to remember." },
  { day: 30, mood: 4, content: "Last day of June already! Reflecting on a great month. So many good memories. Cleaned apartment, meal prepped for next week. Ready for July adventures!" }
];

export async function generateJuneMockData() {
  const year = new Date().getFullYear();
  
  for (const entry of juneEntries) {
    const date = `${year}-06-${entry.day.toString().padStart(2, '0')}`;
    const note: Note = {
      id: `note_june_${entry.day}`,
      date: date,
      content: entry.content,
      mood: entry.mood as Mood,
      images: [],
      createdAt: new Date(date),
      updatedAt: new Date(date),
    };
    
    await StorageService.saveNote(note);
  }
  
  console.log('Mock data for June generated successfully!');
}