/**
 * Static Phrase Library - Time-Aware Common Phrases
 * Provides instant fallback phrases when AI is unavailable or caching
 */

import type { AIPrediction } from '../types/conversation';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type PhraseCategory = 'medical' | 'comfort' | 'social' | 'responses' | 'questions' | 'family' | 'food' | 'feelings' | 'entertainment' | 'ideas';

interface StaticPhrase {
  content: string;
  confidence: number;
  timeAware?: boolean; // True if phrase is specific to time of day
}

/**
 * Medical phrases - health and medication needs
 */
const MEDICAL_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'I need my morning medication', confidence: 0.9, timeAware: true },
    { content: 'Time for my morning pills', confidence: 0.85, timeAware: true },
    { content: 'Can you help me with breakfast?', confidence: 0.8, timeAware: true },
  ],
  afternoon: [
    { content: 'I need my afternoon medication', confidence: 0.9, timeAware: true },
    { content: 'Time for my afternoon dose', confidence: 0.85, timeAware: true },
  ],
  evening: [
    { content: 'I need my evening medication', confidence: 0.9, timeAware: true },
    { content: 'Time for my night pills', confidence: 0.85, timeAware: true },
    { content: 'Can you help me get ready for bed?', confidence: 0.8, timeAware: true },
    { content: 'I need my night medication', confidence: 0.9, timeAware: true },
    { content: 'I need help during the night', confidence: 0.85, timeAware: true },
  ],
  anytime: [
    { content: 'I need medication now please', confidence: 0.95 },
    { content: 'I\'m in pain', confidence: 0.9 },
    { content: 'I need my breathing treatment', confidence: 0.85 },
    { content: 'Call the nurse', confidence: 0.85 },
    { content: 'I need the doctor', confidence: 0.8 },
    { content: 'Something feels wrong', confidence: 0.8 },
    { content: 'I\'m having trouble breathing', confidence: 0.85 },
    { content: 'I need to use the bathroom', confidence: 0.8 },
    { content: 'I feel nauseous', confidence: 0.75 },
    { content: 'My pain medication isn\'t working', confidence: 0.75 },
    { content: 'I need water', confidence: 0.9 },
    { content: 'I\'m feeling dizzy', confidence: 0.7 },
    { content: 'I need my inhaler', confidence: 0.85 },
    { content: 'My chest feels tight', confidence: 0.8 },
    { content: 'I\'m having muscle spasms', confidence: 0.8 },
    { content: 'I need to take my vitamins', confidence: 0.75 },
    { content: 'Can you check my blood pressure?', confidence: 0.75 },
    { content: 'I need a pain assessment', confidence: 0.75 },
    { content: 'My head hurts', confidence: 0.8 },
    { content: 'My stomach hurts', confidence: 0.8 },
    { content: 'My legs are cramping', confidence: 0.75 },
    { content: 'I\'m feeling weak', confidence: 0.8 },
    { content: 'I need to rest', confidence: 0.85 },
    { content: 'I\'m thirsty', confidence: 0.9 },
    { content: 'I\'m hungry', confidence: 0.85 },
    { content: 'I need a straw', confidence: 0.8 },
    { content: 'I\'m feeling anxious', confidence: 0.75 },
    { content: 'I\'m feeling stressed', confidence: 0.75 },
    { content: 'Can you help me swallow?', confidence: 0.8 },
    { content: 'I need suction', confidence: 0.85 },
  ],
};

/**
 * Comfort phrases - position and physical comfort
 */
const COMFORT_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'Can you help me sit up?', confidence: 0.85, timeAware: true },
    { content: 'I\'d like to get dressed now', confidence: 0.8, timeAware: true },
  ],
  afternoon: [],
  evening: [
    { content: 'I\'m ready for bed', confidence: 0.85, timeAware: true },
    { content: 'Can you help me get comfortable for sleep?', confidence: 0.8, timeAware: true },
    { content: 'I can\'t sleep', confidence: 0.85, timeAware: true },
    { content: 'I need to adjust my position', confidence: 0.8, timeAware: true },
  ],
  anytime: [
    { content: 'I\'m uncomfortable', confidence: 0.9 },
    { content: 'Please adjust my position', confidence: 0.9 },
    { content: 'I\'m too cold', confidence: 0.85 },
    { content: 'I\'m too warm', confidence: 0.85 },
    { content: 'Can you move my pillow?', confidence: 0.8 },
    { content: 'I need to be repositioned', confidence: 0.85 },
    { content: 'My back hurts', confidence: 0.75 },
    { content: 'I need a blanket', confidence: 0.8 },
    { content: 'Can you adjust the temperature?', confidence: 0.75 },
    { content: 'The light is too bright', confidence: 0.7 },
    { content: 'I need my chair adjusted', confidence: 0.75 },
    { content: 'Can you tilt the bed up?', confidence: 0.75 },
    { content: 'Can you tilt the bed down?', confidence: 0.75 },
    { content: 'Can you move my arm?', confidence: 0.85 },
    { content: 'Can you move my leg?', confidence: 0.85 },
    { content: 'Can you adjust my head?', confidence: 0.8 },
    { content: 'I need more pillows', confidence: 0.8 },
    { content: 'Take away a pillow', confidence: 0.75 },
    { content: 'Can you open the window?', confidence: 0.75 },
    { content: 'Can you close the window?', confidence: 0.75 },
    { content: 'Turn on the light please', confidence: 0.8 },
    { content: 'Turn off the light please', confidence: 0.8 },
    { content: 'I need the fan on', confidence: 0.75 },
    { content: 'I need the fan off', confidence: 0.75 },
    { content: 'Can you close the curtains?', confidence: 0.7 },
    { content: 'Can you open the curtains?', confidence: 0.7 },
    { content: 'The TV is too loud', confidence: 0.75 },
    { content: 'Turn up the volume', confidence: 0.75 },
    { content: 'Turn down the volume', confidence: 0.75 },
    { content: 'It\'s too noisy', confidence: 0.75 },
    { content: 'I need it quieter', confidence: 0.75 },
    { content: 'My neck is stiff', confidence: 0.8 },
    { content: 'My shoulders are tight', confidence: 0.75 },
    { content: 'Can you massage my hand?', confidence: 0.7 },
    { content: 'I need to stretch', confidence: 0.75 },
    { content: 'The sun is in my eyes', confidence: 0.7 },
    { content: 'I need sunglasses', confidence: 0.7 },
  ],
};

/**
 * Social phrases - greetings, thanks, conversation
 */
const SOCIAL_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'Good morning', confidence: 0.95, timeAware: true },
    { content: 'How did you sleep?', confidence: 0.8, timeAware: true },
    { content: 'What\'s the plan for today?', confidence: 0.75, timeAware: true },
  ],
  afternoon: [
    { content: 'Good afternoon', confidence: 0.95, timeAware: true },
    { content: 'How\'s your day going?', confidence: 0.8, timeAware: true },
  ],
  evening: [
    { content: 'Good evening', confidence: 0.95, timeAware: true },
    { content: 'How was your day?', confidence: 0.85, timeAware: true },
    { content: 'Good night', confidence: 0.9, timeAware: true },
    { content: 'See you in the morning', confidence: 0.85, timeAware: true },
  ],
  anytime: [
    { content: 'Thank you', confidence: 0.95 },
    { content: 'I love you', confidence: 0.95 },
    { content: 'Please', confidence: 0.9 },
    { content: 'How are you?', confidence: 0.85 },
    { content: 'I appreciate you', confidence: 0.85 },
    { content: 'You\'re wonderful', confidence: 0.8 },
    { content: 'I\'m grateful for your help', confidence: 0.85 },
    { content: 'Can we talk?', confidence: 0.75 },
    { content: 'Tell me about your day', confidence: 0.75 },
    { content: 'I missed you', confidence: 0.8 },
    { content: 'You make me smile', confidence: 0.75 },
    { content: 'I\'m proud of you', confidence: 0.75 },
    { content: 'Thank you so much', confidence: 0.95 },
    { content: 'You\'re amazing', confidence: 0.85 },
    { content: 'I\'m so lucky to have you', confidence: 0.85 },
    { content: 'You\'re the best', confidence: 0.8 },
    { content: 'I appreciate everything you do', confidence: 0.85 },
    { content: 'You mean the world to me', confidence: 0.85 },
    { content: 'I\'m thinking of you', confidence: 0.8 },
    { content: 'You brighten my day', confidence: 0.8 },
    { content: 'I\'m happy to see you', confidence: 0.85 },
    { content: 'You\'re so kind', confidence: 0.8 },
    { content: 'You\'re so patient', confidence: 0.8 },
    { content: 'I couldn\'t do this without you', confidence: 0.85 },
    { content: 'You\'re doing a great job', confidence: 0.8 },
    { content: 'That made me laugh', confidence: 0.75 },
    { content: 'That\'s funny', confidence: 0.75 },
    { content: 'Tell me more', confidence: 0.8 },
    { content: 'That\'s interesting', confidence: 0.8 },
    { content: 'I agree with you', confidence: 0.8 },
    { content: 'That sounds great', confidence: 0.8 },
    { content: 'I\'m listening', confidence: 0.85 },
    { content: 'Keep talking', confidence: 0.75 },
    { content: 'You\'re right', confidence: 0.8 },
    { content: 'I understand', confidence: 0.85 },
    { content: 'That makes sense', confidence: 0.8 },
    { content: 'I feel blessed', confidence: 0.8 },
    { content: 'Life is good', confidence: 0.75 },
    { content: 'I\'m feeling positive today', confidence: 0.75 },
    { content: 'Let\'s spend time together', confidence: 0.8 },
    { content: 'I enjoy your company', confidence: 0.8 },
  ],
};

/**
 * Response phrases - yes, no, maybe
 */
const RESPONSE_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [],
  afternoon: [],
  evening: [],
  anytime: [
    { content: 'Yes', confidence: 0.95 },
    { content: 'No', confidence: 0.95 },
    { content: 'Maybe', confidence: 0.9 },
    { content: 'I don\'t know', confidence: 0.85 },
    { content: 'Not right now', confidence: 0.85 },
    { content: 'Yes please', confidence: 0.9 },
    { content: 'No thank you', confidence: 0.9 },
    { content: 'I\'m not sure', confidence: 0.8 },
    { content: 'That sounds good', confidence: 0.8 },
    { content: 'I\'d like that', confidence: 0.8 },
    { content: 'Not really', confidence: 0.75 },
    { content: 'Definitely', confidence: 0.85 },
    { content: 'Absolutely', confidence: 0.8 },
    { content: 'I agree', confidence: 0.8 },
    { content: 'I disagree', confidence: 0.75 },
    { content: 'Let me think about it', confidence: 0.75 },
    { content: 'Of course', confidence: 0.85 },
    { content: 'Sure', confidence: 0.85 },
    { content: 'Okay', confidence: 0.9 },
    { content: 'Alright', confidence: 0.85 },
    { content: 'That works', confidence: 0.8 },
    { content: 'Sounds perfect', confidence: 0.8 },
    { content: 'I\'d prefer not to', confidence: 0.75 },
    { content: 'Not yet', confidence: 0.8 },
    { content: 'Maybe later', confidence: 0.8 },
    { content: 'Give me a minute', confidence: 0.75 },
    { content: 'I need to think', confidence: 0.75 },
    { content: 'I\'m fine with that', confidence: 0.8 },
    { content: 'That\'s fine', confidence: 0.8 },
    { content: 'Whatever you think', confidence: 0.75 },
    { content: 'You decide', confidence: 0.75 },
    { content: 'I trust you', confidence: 0.8 },
    { content: 'If you think so', confidence: 0.75 },
    { content: 'I suppose so', confidence: 0.7 },
    { content: 'I guess', confidence: 0.7 },
    { content: 'Probably', confidence: 0.75 },
    { content: 'Probably not', confidence: 0.75 },
    { content: 'I doubt it', confidence: 0.7 },
    { content: 'Absolutely not', confidence: 0.8 },
    { content: 'Never mind', confidence: 0.75 },
    { content: 'Forget it', confidence: 0.7 },

    // Quick conversational responses
    { content: 'No ma\'am', confidence: 0.9 },
    { content: 'Mmmhmm', confidence: 0.95 },
    { content: 'Uh huh', confidence: 0.95 },
    { content: 'K', confidence: 0.9 },
    { content: 'Stop talking', confidence: 0.85 },
    { content: 'Tell me more', confidence: 0.85 },
    { content: 'Say that in a different way', confidence: 0.8 },
    { content: 'What do you think I\'m going to say', confidence: 0.75 },
  ],
};

/**
 * Question phrases - asking about things
 */
const QUESTION_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'What time is it?', confidence: 0.9, timeAware: true },
    { content: 'What\'s for breakfast?', confidence: 0.8, timeAware: true },
    { content: 'What\'s the plan today?', confidence: 0.75, timeAware: true },
  ],
  afternoon: [
    { content: 'What\'s for lunch?', confidence: 0.8, timeAware: true },
    { content: 'Any plans this afternoon?', confidence: 0.7, timeAware: true },
  ],
  evening: [
    { content: 'What\'s for dinner?', confidence: 0.8, timeAware: true },
    { content: 'What are we watching tonight?', confidence: 0.7, timeAware: true },
    { content: 'Can I sleep now?', confidence: 0.75, timeAware: true },
    { content: 'Will you check on me later?', confidence: 0.7, timeAware: true },
  ],
  anytime: [
    { content: 'Who\'s here?', confidence: 0.85 },
    { content: 'Where am I?', confidence: 0.75 },
    { content: 'What\'s going on?', confidence: 0.8 },
    { content: 'Can you help me?', confidence: 0.9 },
    { content: 'Is someone there?', confidence: 0.8 },
    { content: 'What day is it?', confidence: 0.75 },
    { content: 'How long until...?', confidence: 0.7 },
    { content: 'When will you be back?', confidence: 0.75 },
    { content: 'Can we go outside?', confidence: 0.7 },
    { content: 'What\'s the weather like?', confidence: 0.7 },
    { content: 'Do I have visitors today?', confidence: 0.75 },
    { content: 'Can I have some privacy?', confidence: 0.75 },
    { content: 'What time is it?', confidence: 0.85 },
    { content: 'What are we doing today?', confidence: 0.75 },
    { content: 'When is my appointment?', confidence: 0.75 },
    { content: 'Where is everyone?', confidence: 0.8 },
    { content: 'Who was that?', confidence: 0.75 },
    { content: 'What did they say?', confidence: 0.75 },
    { content: 'Can you repeat that?', confidence: 0.85 },
    { content: 'What did I miss?', confidence: 0.75 },
    { content: 'What\'s happening?', confidence: 0.8 },
    { content: 'What\'s new?', confidence: 0.75 },
    { content: 'Any news?', confidence: 0.75 },
    { content: 'Did anyone call?', confidence: 0.75 },
    { content: 'Do I have any messages?', confidence: 0.75 },
    { content: 'Can you check my phone?', confidence: 0.75 },
    { content: 'What\'s on TV?', confidence: 0.7 },
    { content: 'Can we change the channel?', confidence: 0.7 },
    { content: 'What are we watching?', confidence: 0.7 },
    { content: 'Is it raining?', confidence: 0.7 },
    { content: 'Is it sunny?', confidence: 0.7 },
    { content: 'How\'s the temperature outside?', confidence: 0.7 },
    { content: 'When is lunch?', confidence: 0.75 },
    { content: 'When is dinner?', confidence: 0.75 },
    { content: 'What are we eating?', confidence: 0.75 },
    { content: 'Can I have a snack?', confidence: 0.75 },
    { content: 'Where did you put...?', confidence: 0.7 },
    { content: 'Can you find my...?', confidence: 0.75 },
    { content: 'Did you see my...?', confidence: 0.75 },
    { content: 'How much longer?', confidence: 0.75 },
    { content: 'Are we done yet?', confidence: 0.7 },
    { content: 'What\'s next?', confidence: 0.75 },
    // Deeper/philosophical questions
    { content: 'What do you think happens after death?', confidence: 0.7 },
    { content: 'Do you believe in heaven?', confidence: 0.7 },
    { content: 'What do you think my legacy will be?', confidence: 0.7 },
    { content: 'How do you want to remember me?', confidence: 0.75 },
    { content: 'What have I taught you?', confidence: 0.75 },
    { content: 'Do you think I\'m still the same person?', confidence: 0.7 },
    { content: 'What gives your life meaning?', confidence: 0.7 },
    { content: 'Are you afraid of death?', confidence: 0.65 },
    { content: 'What do you hope for?', confidence: 0.75 },
    { content: 'Do you think I\'ve lived a good life?', confidence: 0.7 },
    { content: 'What would you do in my situation?', confidence: 0.7 },
    { content: 'How do you cope with this?', confidence: 0.75 },
    { content: 'Do you think about the future?', confidence: 0.7 },
    { content: 'What are you most afraid of?', confidence: 0.7 },
    { content: 'What makes you happy?', confidence: 0.8 },
    { content: 'Do you have regrets?', confidence: 0.7 },
    { content: 'What would you change if you could?', confidence: 0.7 },
    { content: 'Am I a burden?', confidence: 0.75 },
    { content: 'Do you resent this situation?', confidence: 0.65 },
    { content: 'Are you taking care of yourself?', confidence: 0.8 },
    { content: 'What do you need?', confidence: 0.8 },
    { content: 'How are you really doing?', confidence: 0.8 },
  ],
};

/**
 * Family phrases - messages for Tony, Michael, and Claire
 */
const FAMILY_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'Good morning Tony', confidence: 0.95, timeAware: true },
    { content: 'Good morning Michael', confidence: 0.95, timeAware: true },
    { content: 'Good morning Claire', confidence: 0.95, timeAware: true },
    { content: 'Did the kids sleep well?', confidence: 0.8, timeAware: true },
    { content: 'Have a great day at school', confidence: 0.85, timeAware: true },
    { content: 'Good morning my loves', confidence: 0.9, timeAware: true },
    { content: 'Hope you all slept well', confidence: 0.8, timeAware: true },
    { content: 'Time to wake up everyone', confidence: 0.75, timeAware: true },
    { content: 'Have a wonderful day Tony', confidence: 0.85, timeAware: true },
    { content: 'I love you all, have a great day', confidence: 0.85, timeAware: true },
    { content: 'Be good at school today', confidence: 0.8, timeAware: true },
    { content: 'I\'ll be thinking about you today', confidence: 0.8, timeAware: true },
  ],
  afternoon: [
    { content: 'How was school today?', confidence: 0.85, timeAware: true },
    { content: 'Tell me about your day', confidence: 0.8, timeAware: true },
    { content: 'Did you have a good day at work Tony?', confidence: 0.8, timeAware: true },
    { content: 'Welcome home!', confidence: 0.85, timeAware: true },
    { content: 'I\'m glad you\'re home', confidence: 0.85, timeAware: true },
    { content: 'Tell me everything about school', confidence: 0.8, timeAware: true },
    { content: 'How was your day Tony?', confidence: 0.8, timeAware: true },
    { content: 'Did you have fun today?', confidence: 0.75, timeAware: true },
    { content: 'What did you learn today?', confidence: 0.75, timeAware: true },
  ],
  evening: [
    { content: 'Good night Tony', confidence: 0.95, timeAware: true },
    { content: 'Good night Michael', confidence: 0.95, timeAware: true },
    { content: 'Good night Claire', confidence: 0.95, timeAware: true },
    { content: 'Sweet dreams', confidence: 0.9, timeAware: true },
    { content: 'Time for bed kids', confidence: 0.85, timeAware: true },
    { content: 'Sleep well my loves', confidence: 0.9, timeAware: true },
    { content: 'I love you all, good night', confidence: 0.95, timeAware: true },
    { content: 'Sweet dreams everyone', confidence: 0.9, timeAware: true },
    { content: 'See you in the morning', confidence: 0.85, timeAware: true },
    { content: 'Have a good rest Tony', confidence: 0.85, timeAware: true },
    { content: 'Sleep tight kids', confidence: 0.85, timeAware: true },
    { content: 'Dream of good things', confidence: 0.8, timeAware: true },
    { content: 'Good night everyone', confidence: 0.9, timeAware: true },
  ],
  anytime: [
    { content: 'I love you Tony', confidence: 0.95 },
    { content: 'I love you Michael', confidence: 0.95 },
    { content: 'I love you Claire', confidence: 0.95 },
    { content: 'I love you all so much', confidence: 0.95 },
    { content: 'Where is Tony?', confidence: 0.85 },
    { content: 'Where are the kids?', confidence: 0.85 },
    { content: 'Can I talk to Tony?', confidence: 0.85 },
    { content: 'Can Michael come here?', confidence: 0.85 },
    { content: 'Can Claire come here?', confidence: 0.85 },
    { content: 'I want to spend time with the family', confidence: 0.85 },
    { content: 'Tony you\'re amazing', confidence: 0.9 },
    { content: 'I\'m so proud of Michael', confidence: 0.9 },
    { content: 'I\'m so proud of Claire', confidence: 0.9 },
    { content: 'Tell Tony I need him', confidence: 0.85 },
    { content: 'The kids make me so happy', confidence: 0.85 },
    { content: 'Can we have family time?', confidence: 0.8 },
    { content: 'I miss you all', confidence: 0.85 },
    { content: 'You\'re the best husband Tony', confidence: 0.9 },
    { content: 'Michael you\'re such a good kid', confidence: 0.85 },
    { content: 'Claire you\'re such a good kid', confidence: 0.85 },
    { content: 'I\'m grateful for my family', confidence: 0.9 },
    { content: 'Tell the kids I love them', confidence: 0.9 },
    { content: 'Can you get Tony for me?', confidence: 0.85 },
    { content: 'I miss Tony', confidence: 0.85 },
    { content: 'I miss Michael', confidence: 0.85 },
    { content: 'I miss Claire', confidence: 0.85 },
    { content: 'Give Tony a hug for me', confidence: 0.8 },
    { content: 'Give the kids hugs for me', confidence: 0.8 },
    { content: 'Tell Michael I love him', confidence: 0.9 },
    { content: 'Tell Claire I love her', confidence: 0.9 },
    { content: 'How are the kids doing?', confidence: 0.8 },
    { content: 'How is Tony doing?', confidence: 0.8 },
    { content: 'Is Tony okay?', confidence: 0.8 },
    { content: 'Are the kids okay?', confidence: 0.8 },
    { content: 'Where did Michael go?', confidence: 0.75 },
    { content: 'Where did Claire go?', confidence: 0.75 },
    { content: 'When will Tony be home?', confidence: 0.8 },
    { content: 'When will the kids be home?', confidence: 0.8 },
    { content: 'I want to see the family', confidence: 0.85 },
    { content: 'Can we all watch a movie together?', confidence: 0.75 },
    { content: 'Can we play a game together?', confidence: 0.75 },
    { content: 'Tell Tony I\'m thinking of him', confidence: 0.8 },
    { content: 'Tell the kids I\'m thinking of them', confidence: 0.8 },
    { content: 'Michael makes me proud', confidence: 0.85 },
    { content: 'Claire makes me proud', confidence: 0.85 },
    { content: 'Tony takes such good care of me', confidence: 0.85 },
    { content: 'I\'m blessed to have Tony', confidence: 0.85 },
    { content: 'I\'m blessed to have such great kids', confidence: 0.85 },
    { content: 'Our family is everything to me', confidence: 0.9 },
    { content: 'I love watching the kids grow', confidence: 0.8 },
    { content: 'Tony you\'re my rock', confidence: 0.9 },
    { content: 'The kids bring me joy', confidence: 0.85 },
    { content: 'Family time is the best time', confidence: 0.8 },
    { content: 'I couldn\'t do this without Tony', confidence: 0.85 },
    { content: 'Tell Michael good luck', confidence: 0.75 },
    { content: 'Tell Claire good luck', confidence: 0.75 },
    { content: 'How was Michael\'s day?', confidence: 0.8 },
    { content: 'How was Claire\'s day?', confidence: 0.8 },
    { content: 'I want to hear about the kids\' day', confidence: 0.8 },
  ],
};

/**
 * Food/Drink phrases - hunger, thirst, and meal needs
 */
const FOOD_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'Can I have breakfast?', confidence: 0.9, timeAware: true },
    { content: 'I\'d like some coffee', confidence: 0.85, timeAware: true },
    { content: 'Can I have orange juice?', confidence: 0.8, timeAware: true },
    { content: 'I\'d like some cereal', confidence: 0.8, timeAware: true },
    { content: 'Can I have toast?', confidence: 0.75, timeAware: true },
    { content: 'I need my morning coffee', confidence: 0.85, timeAware: true },
  ],
  afternoon: [
    { content: 'Can I have lunch?', confidence: 0.9, timeAware: true },
    { content: 'I\'d like a sandwich', confidence: 0.8, timeAware: true },
    { content: 'Can I have a snack?', confidence: 0.85, timeAware: true },
    { content: 'I\'d like some soup', confidence: 0.75, timeAware: true },
  ],
  evening: [
    { content: 'Can I have dinner?', confidence: 0.9, timeAware: true },
    { content: 'I\'m ready for dinner', confidence: 0.85, timeAware: true },
    { content: 'What\'s for dinner?', confidence: 0.8, timeAware: true },
    { content: 'Can I have dessert?', confidence: 0.75, timeAware: true },
  ],
  anytime: [
    { content: 'I\'m hungry', confidence: 0.95 },
    { content: 'I\'m thirsty', confidence: 0.95 },
    { content: 'Can I have water?', confidence: 0.9 },
    { content: 'Can I have something to eat?', confidence: 0.9 },
    { content: 'Can I have something to drink?', confidence: 0.9 },
    { content: 'I need a straw', confidence: 0.85 },
    { content: 'Can you help me eat?', confidence: 0.85 },
    { content: 'Can you help me drink?', confidence: 0.85 },
    { content: 'I\'d like some ice water', confidence: 0.8 },
    { content: 'Can I have juice?', confidence: 0.8 },
    { content: 'Can I have tea?', confidence: 0.75 },
    { content: 'I\'d like a smoothie', confidence: 0.7 },
    { content: 'Can I have milk?', confidence: 0.75 },
    { content: 'Can I have soda?', confidence: 0.7 },
    { content: 'I\'m full', confidence: 0.8 },
    { content: 'I can\'t eat anymore', confidence: 0.75 },
    { content: 'This tastes good', confidence: 0.8 },
    { content: 'I don\'t like this', confidence: 0.75 },
    { content: 'Can I have more?', confidence: 0.8 },
    { content: 'That\'s enough, thank you', confidence: 0.85 },
    { content: 'Can I have a different flavor?', confidence: 0.7 },
    { content: 'Too much ice', confidence: 0.7 },
    { content: 'Not enough ice', confidence: 0.7 },
    { content: 'Can you warm this up?', confidence: 0.75 },
    { content: 'This is too hot', confidence: 0.75 },
    { content: 'This is too cold', confidence: 0.75 },
  ],
};

/**
 * Feelings phrases - emotional expression
 */
const FEELINGS_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'I slept well', confidence: 0.85, timeAware: true },
    { content: 'I didn\'t sleep well', confidence: 0.8, timeAware: true },
    { content: 'I feel refreshed', confidence: 0.75, timeAware: true },
    { content: 'I\'m still tired', confidence: 0.8, timeAware: true },
  ],
  afternoon: [],
  evening: [
    { content: 'I\'m tired', confidence: 0.85, timeAware: true },
    { content: 'I\'m exhausted', confidence: 0.8, timeAware: true },
    { content: 'I\'m ready to rest', confidence: 0.8, timeAware: true },
  ],
  anytime: [
    { content: 'I\'m happy', confidence: 0.9 },
    { content: 'I\'m sad', confidence: 0.85 },
    { content: 'I\'m frustrated', confidence: 0.85 },
    { content: 'I\'m scared', confidence: 0.8 },
    { content: 'I\'m anxious', confidence: 0.8 },
    { content: 'I\'m worried', confidence: 0.8 },
    { content: 'I\'m angry', confidence: 0.75 },
    { content: 'I\'m upset', confidence: 0.8 },
    { content: 'I\'m lonely', confidence: 0.75 },
    { content: 'I\'m grateful', confidence: 0.85 },
    { content: 'I\'m thankful', confidence: 0.85 },
    { content: 'I\'m proud', confidence: 0.8 },
    { content: 'I\'m excited', confidence: 0.8 },
    { content: 'I\'m nervous', confidence: 0.75 },
    { content: 'I\'m overwhelmed', confidence: 0.8 },
    { content: 'I\'m calm', confidence: 0.8 },
    { content: 'I\'m peaceful', confidence: 0.75 },
    { content: 'I\'m stressed', confidence: 0.8 },
    { content: 'I\'m bored', confidence: 0.75 },
    { content: 'I\'m content', confidence: 0.8 },
    { content: 'I feel loved', confidence: 0.85 },
    { content: 'I feel safe', confidence: 0.8 },
    { content: 'I feel uncomfortable', confidence: 0.8 },
    { content: 'I\'m feeling down', confidence: 0.8 },
    { content: 'I\'m feeling better', confidence: 0.85 },
    { content: 'I\'m feeling worse', confidence: 0.8 },
    { content: 'I need someone to talk to', confidence: 0.8 },
    { content: 'I just need a moment', confidence: 0.75 },
    { content: 'I\'m okay', confidence: 0.85 },
    { content: 'I\'m not okay', confidence: 0.85 },
    // Complex/deep emotions
    { content: 'I feel conflicted', confidence: 0.75 },
    { content: 'I\'m feeling hopeful', confidence: 0.8 },
    { content: 'I feel numb', confidence: 0.75 },
    { content: 'I\'m feeling invisible', confidence: 0.7 },
    { content: 'I feel seen and heard', confidence: 0.75 },
    { content: 'I\'m feeling trapped', confidence: 0.75 },
    { content: 'I feel surprisingly free', confidence: 0.7 },
    { content: 'I\'m grieving', confidence: 0.75 },
    { content: 'I feel nostalgic', confidence: 0.75 },
    { content: 'I\'m feeling tender', confidence: 0.7 },
    { content: 'I feel raw', confidence: 0.7 },
    { content: 'I\'m feeling vulnerable', confidence: 0.75 },
    { content: 'I feel resilient', confidence: 0.75 },
    { content: 'I\'m amazed I\'m still here', confidence: 0.75 },
    { content: 'I feel like a burden', confidence: 0.75 },
    { content: 'I feel loved despite everything', confidence: 0.8 },
    { content: 'I\'m afraid of being forgotten', confidence: 0.75 },
    { content: 'I feel at peace sometimes', confidence: 0.8 },
    { content: 'I\'m struggling to accept this', confidence: 0.8 },
    { content: 'I feel guilty about needing help', confidence: 0.75 },
    { content: 'I\'m surprisingly content right now', confidence: 0.75 },
    { content: 'I feel disconnected from myself', confidence: 0.7 },
    { content: 'I\'m more myself than ever', confidence: 0.7 },
    { content: 'I feel bittersweet', confidence: 0.75 },
    { content: 'I\'m experiencing mixed emotions', confidence: 0.75 },
  ],
};

/**
 * Ideas/Observations phrases - thoughts about the world, observations, reflections
 */
const IDEAS_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'I have an idea', confidence: 0.8, timeAware: true },
    { content: 'I was thinking overnight', confidence: 0.75, timeAware: true },
  ],
  afternoon: [
    { content: 'I\'ve been observing something', confidence: 0.75, timeAware: true },
  ],
  evening: [
    { content: 'I had a thought today', confidence: 0.75, timeAware: true },
  ],
  anytime: [
    { content: 'I have something to say', confidence: 0.85 },
    { content: 'I\'ve been thinking about something', confidence: 0.8 },
    { content: 'I want to share a thought', confidence: 0.8 },
    { content: 'I noticed something interesting', confidence: 0.75 },
    { content: 'Can I share an observation?', confidence: 0.75 },
    { content: 'I have a perspective on this', confidence: 0.75 },
    { content: 'I see things differently now', confidence: 0.75 },
    { content: 'I\'ve learned something', confidence: 0.8 },
    { content: 'This experience has taught me', confidence: 0.8 },
    { content: 'I want to talk about ideas', confidence: 0.75 },
    { content: 'What do you think about this?', confidence: 0.8 },
    { content: 'I wonder what would happen if', confidence: 0.75 },
    { content: 'Have you considered this?', confidence: 0.75 },
    { content: 'I see patterns in things', confidence: 0.7 },
    { content: 'I\'ve noticed how people behave', confidence: 0.7 },
    { content: 'The world is interesting', confidence: 0.75 },
    { content: 'I still think deeply', confidence: 0.75 },
    { content: 'My mind is still sharp', confidence: 0.8 },
    { content: 'I have insights to share', confidence: 0.75 },
    { content: 'I want to discuss this topic', confidence: 0.75 },
    { content: 'Let\'s talk about something meaningful', confidence: 0.8 },
    { content: 'I\'m curious about your thoughts', confidence: 0.8 },
    { content: 'What\'s your opinion on this?', confidence: 0.8 },
    { content: 'I disagree with that', confidence: 0.75 },
    { content: 'That\'s an interesting perspective', confidence: 0.8 },
    { content: 'I never thought of it that way', confidence: 0.75 },
    { content: 'You\'ve changed my mind', confidence: 0.75 },
    { content: 'I want to challenge that idea', confidence: 0.7 },
    { content: 'Let me play devil\'s advocate', confidence: 0.7 },
    { content: 'What if we looked at it differently?', confidence: 0.75 },
    { content: 'I see both sides', confidence: 0.75 },
    { content: 'This is complex', confidence: 0.75 },
    { content: 'There\'s nuance here', confidence: 0.7 },
    { content: 'I think we need to consider', confidence: 0.75 },
    { content: 'What are the implications?', confidence: 0.7 },
    { content: 'I\'m thinking critically about this', confidence: 0.75 },
    { content: 'Let\'s explore this together', confidence: 0.8 },
    { content: 'I want to understand better', confidence: 0.8 },
    { content: 'Explain that to me', confidence: 0.8 },
    { content: 'Tell me more about your thinking', confidence: 0.75 },
    { content: 'That\'s fascinating', confidence: 0.8 },
    { content: 'I hadn\'t considered that', confidence: 0.75 },
    { content: 'You make a good point', confidence: 0.8 },
  ],
};

/**
 * Entertainment phrases - TV, music, movies, activities
 */
const ENTERTAINMENT_PHRASES: Record<TimeOfDay | 'anytime', StaticPhrase[]> = {
  morning: [
    { content: 'Can we watch the morning news?', confidence: 0.8, timeAware: true },
    { content: 'Can you turn on morning TV?', confidence: 0.75, timeAware: true },
  ],
  afternoon: [
    { content: 'Can we watch a movie?', confidence: 0.8, timeAware: true },
    { content: 'I\'d like to watch TV', confidence: 0.85, timeAware: true },
  ],
  evening: [
    { content: 'Can we watch our show?', confidence: 0.85, timeAware: true },
    { content: 'What\'s on TV tonight?', confidence: 0.8, timeAware: true },
    { content: 'Can we watch a movie tonight?', confidence: 0.8, timeAware: true },
  ],
  anytime: [
    { content: 'Can you turn on the TV?', confidence: 0.9 },
    { content: 'Can you change the channel?', confidence: 0.85 },
    { content: 'Turn the volume up', confidence: 0.85 },
    { content: 'Turn the volume down', confidence: 0.85 },
    { content: 'Can you turn on music?', confidence: 0.85 },
    { content: 'Can you play my favorite song?', confidence: 0.8 },
    { content: 'I\'d like to listen to music', confidence: 0.85 },
    { content: 'Can we watch a movie?', confidence: 0.85 },
    { content: 'What\'s on TV?', confidence: 0.8 },
    { content: 'Can you turn off the TV?', confidence: 0.8 },
    { content: 'Can you pause this?', confidence: 0.8 },
    { content: 'Can you turn off the music?', confidence: 0.75 },
    { content: 'Let\'s watch something funny', confidence: 0.75 },
    { content: 'I want to watch the news', confidence: 0.8 },
    { content: 'Can we watch sports?', confidence: 0.75 },
    { content: 'Can you find a good show?', confidence: 0.75 },
    { content: 'I like this show', confidence: 0.8 },
    { content: 'I don\'t like this', confidence: 0.75 },
    { content: 'Can you change this?', confidence: 0.8 },
    { content: 'Can we watch Netflix?', confidence: 0.8 },
    { content: 'I\'d like to read', confidence: 0.75 },
    { content: 'Can you read to me?', confidence: 0.75 },
    { content: 'Can we play a game?', confidence: 0.7 },
    { content: 'This is too loud', confidence: 0.8 },
    { content: 'I can\'t hear it', confidence: 0.8 },
    { content: 'Can you rewind that?', confidence: 0.7 },
    { content: 'Turn on closed captions', confidence: 0.75 },
    { content: 'Turn off closed captions', confidence: 0.7 },
  ],
};

/**
 * Get current time of day based on hour
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'anytime';
}

/**
 * Export all phrase sets for database seeding
 */
export const ALL_STATIC_PHRASES: Record<PhraseCategory, Record<TimeOfDay | 'anytime', StaticPhrase[]>> = {
  medical: MEDICAL_PHRASES,
  comfort: COMFORT_PHRASES,
  social: SOCIAL_PHRASES,
  responses: RESPONSE_PHRASES,
  questions: QUESTION_PHRASES,
  family: FAMILY_PHRASES,
  food: FOOD_PHRASES,
  feelings: FEELINGS_PHRASES,
  entertainment: ENTERTAINMENT_PHRASES,
  ideas: IDEAS_PHRASES,
};

/**
 * Get static phrases for a category, time-aware
 */
export function getStaticPhrases(
  category: PhraseCategory,
  timeOfDay?: TimeOfDay
): AIPrediction[] {
  const time = timeOfDay || getCurrentTimeOfDay();

  const categoryPhrases = ALL_STATIC_PHRASES[category];
  if (!categoryPhrases) return [];

  // Merge time-specific and anytime phrases
  const timeSpecific = categoryPhrases[time] || [];
  const anytime = categoryPhrases['anytime'] || [];
  const combined = [...timeSpecific, ...anytime];

  // Convert to AIPrediction format
  return combined.map((phrase, index) => ({
    id: `static-${category}-${time}-${index}`,
    content: phrase.content,
    confidence: phrase.confidence,
    category,
    source: 'static' as const,
  }));
}

/**
 * Get all static phrases for all categories
 */
export function getAllStaticPhrases(
  categories: PhraseCategory[],
  timeOfDay?: TimeOfDay
): Record<string, AIPrediction[]> {
  const result: Record<string, AIPrediction[]> = {};

  for (const category of categories) {
    result[category] = getStaticPhrases(category, timeOfDay);
  }

  return result;
}
