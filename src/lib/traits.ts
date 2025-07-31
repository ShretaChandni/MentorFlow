
import { Palette, Users, Brain, Swords, Briefcase, Circle, Square, Triangle, Hexagon, Star, Calculator, Languages, Lightbulb, Grid3x3, CheckSquare, Gem, Shield, Heart, Rocket } from "lucide-react";

export const TRAITS = [
  { id: "openness", name: "Openness"},
  { id: "conscientiousness", name: "Conscientiousness"},
  { id: "extraversion", name: "Extraversion"},
  { id: "agreeableness", name: "Agreeableness"},
  { id: "neuroticism", name: "Neuroticism"},
  
  { id: "realistic", name: "Realistic"},
  { id: "investigative", name: "Investigative"},
  { id: "artistic", name: "Artistic"},
  { id: "social", name: "Social"},
  { id: "enterprising", name: "Enterprising"},
  { id: "conventional", name: "Conventional"},

  { id: "self_awareness", name: "Self-awareness"},
  { id: "self_regulation", name: "Self-regulation"},
  { id: "motivation", name: "Motivation"},
  { id: "empathy", name: "Empathy"},
  { id: "social_skills", name: "Social Skills"},

  { id: "analytical", name: "Analytical"},
  { id: "problem_solving", name: "Problem Solving"},
  { id: "creativity", name: "Creativity"},

  { id: "sjt_problem_solving", name: "SJT Problem Solving"},
  { id: "sjt_interpersonal", name: "SJT Interpersonal"},
  { id: "sjt_communication", name: "SJT Communication"},
  
  { id: "puzzle_solving", name: "Puzzle Solving" },

  // New Traits for Aptitude and Work Values
  { id: "numerical_reasoning", name: "Numerical Reasoning" },
  { id: "verbal_reasoning", name: "Verbal Reasoning" },
  { id: "logical_reasoning", name: "Logical Reasoning" },
  { id: "spatial_reasoning", name: "Spatial Reasoning" },
  { id: "work_value_prosperity", name: "Work Value: Prosperity" },
  { id: "work_value_harmony", name: "Work Value: Harmony" },
  { id: "work_value_pioneer", name: "Work Value: Pioneer" },
  { id: "work_value_guardian", name: "Work Value: Guardian" },
  { id: "work_value_autonomy", name: "Work Value: Autonomy" },
  { id: "work_value_impact", name: "Work Value: Impact" },
] as const;

export type TraitId = (typeof TRAITS)[number]["id"];
export type CategoryId = 'holland-code' | 'big-five' | 'eq' | 'swot' | 'sjt' | 'puzzles' | 'aptitude' | 'work-values';
type QuestionType = 'slider' | 'multiple_choice' | 'text_input' | 'points_allocation' | 'top_three';

let questionCounter = 0;
const nextId = () => `q_${questionCounter++}`;

export interface Question {
    id: string;
    text: string;
    trait: TraitId | TraitId[];
    reversed?: boolean;
    category: CategoryId;
    type: QuestionType;
    imageUrl: string;
    options?: { id: string; content: string; type: 'shape' | 'text'; icon?: React.ElementType; description?: string; trait?: TraitId; }[];
    answer?: string;
    swot?: 'strength' | 'weakness' | 'opportunity' | 'threat';
}

export const QUESTION_CATEGORIES: Record<CategoryId, {name: string, icon: React.ElementType }> = {
    'holland-code': { name: 'Holland Code Career Explorer', icon: Users },
    'big-five': { name: 'Big Five Personality', icon: Brain },
    'sjt': { name: 'Situational Judgment Test', icon: Briefcase },
    'eq': { name: 'Emotional Intelligence', icon: Palette },
    'swot': { name: 'Personal SWOT Analysis', icon: Swords },
    'puzzles': { name: 'Cognitive Puzzles', icon: Star },
    'aptitude': { name: 'Core Aptitude', icon: Lightbulb },
    'work-values': { name: 'Work Values', icon: CheckSquare }
};

export const QUESTIONS: readonly Question[] = [
    // === Holland Code (RIASEC) - 12 questions ===
    { id: nextId(), text: "I like to work with my hands and use tools to build or repair things.", trait: "realistic", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/E8D5B5/C0A080.png' },
    { id: nextId(), text: "I enjoy solving complex problems and understanding how things work.", trait: "investigative", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/A2D2FF/BDE0FE.png' },
    { id: nextId(), text: "I am creative and enjoy expressing myself through art, music, or writing.", trait: "artistic", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/FFC8DD/FFAFCC.png' },
    { id: nextId(), text: "I like helping people, teaching them, or providing care.", trait: "social", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/CDB4DB/BDE0FE.png' },
    { id: nextId(), text: "I am ambitious and enjoy leading people and making decisions.", trait: "enterprising", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/F4A261/E76F51.png' },
    { id: nextId(), text: "I like to work with data, have clear instructions, and keep things organized.", trait: "conventional", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/DDEFE3/B2D0C8.png' },
    { id: nextId(), text: "I prefer practical, hands-on tasks over theoretical ones.", trait: "realistic", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/C0A080/E8D5B5.png' },
    { id: nextId(), text: "I am curious and enjoy conducting research or experiments.", trait: "investigative", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/BDE0FE/A2D2FF.png' },
    { id: nextId(), text: "I prefer unstructured situations that allow for self-expression.", trait: "artistic", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/FFAFCC/FFC8DD.png' },
    { id: nextId(), text: "I am a good listener and enjoy working in teams.", trait: "social", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/BDE0FE/CDB4DB.png' },
    { id: nextId(), text: "I am persuasive and enjoy selling ideas or products.", trait: "enterprising", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/E76F51/F4A261.png' },
    { id: nextId(), text: "I am detail-oriented and enjoy following established procedures.", trait: "conventional", category: 'holland-code', type: 'slider', imageUrl: 'https://placehold.co/600x800/B2D0C8/DDEFE3.png' },

    // === Big Five Personality - 15 questions ===
    { id: nextId(), text: "I am the life of the party.", trait: "extraversion", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/FFC8DD/A2D2FF.png' },
    { id: nextId(), text: "I prefer to spend my time alone or with a small group of close friends.", trait: "extraversion", reversed: true, category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/A2D2FF/FFC8DD.png' },
    { id: nextId(), text: "I am sympathetic towards others' feelings.", trait: "agreeableness", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/BDE0FE/FFAFCC.png' },
    { id: nextId(), text: "I tend to be critical of others.", trait: "agreeableness", reversed: true, category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/FFAFCC/BDE0FE.png' },
    { id: nextId(), text: "I am always prepared and organized.", trait: "conscientiousness", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/DDEFE3/C0A080.png' },
    { id: nextId(), text: "I tend to be messy and disorganized.", trait: "conscientiousness", reversed: true, category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/C0A080/DDEFE3.png' },
    { id: nextId(), text: "I am relaxed most of the time.", trait: "neuroticism", reversed: true, category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/A2D2FF/CDB4DB.png' },
    { id: nextId(), text: "I get stressed out easily.", trait: "neuroticism", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/CDB4DB/A2D2FF.png' },
    { id: nextId(), text: "I have a vivid imagination and enjoy abstract ideas.", trait: "openness", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/F4A261/BDE0FE.png' },
    { id: nextId(), text: "I am not interested in abstract ideas and prefer concrete facts.", trait: "openness", reversed: true, category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/BDE0FE/F4A261.png' },
    { id: nextId(), text: "I start conversations with new people.", trait: "extraversion", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/FFC8DD/C0A080.png' },
    { id: nextId(), text: "I am interested in people's problems.", trait: "agreeableness", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/BDE0FE/DDEFE3.png' },
    { id: nextId(), text: "I pay attention to details.", trait: "conscientiousness", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/DDEFE3/BDE0FE.png' },
    { id: nextId(), text: "I often feel sad or down.", trait: "neuroticism", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/CDB4DB/B2D0C8.png' },
    { id: nextId(), text: "I am full of new, good ideas.", trait: "openness", category: 'big-five', type: 'slider', imageUrl: 'https://placehold.co/600x800/F4A261/E76F51.png' },
    
    // === Emotional Intelligence - 10 questions ===
    { id: nextId(), text: "I can recognize my own emotions as they happen.", trait: "self_awareness", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/A2D2FF/CDB4DB.png' },
    { id: nextId(), text: "I am good at managing my impulses and staying calm under pressure.", trait: "self_regulation", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/B2D0C8/A2D2FF.png' },
    { id: nextId(), text: "I am driven to achieve my goals, even when faced with obstacles.", trait: "motivation", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/E76F51/DDEFE3.png' },
    { id: nextId(), text: "I can easily understand and share the feelings of others.", trait: "empathy", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/CDB4DB/FFC8DD.png' },
    { id: nextId(), text: "I am skilled at handling relationships and building networks.", trait: "social_skills", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/FFC8DD/CDB4DB.png' },
    { id: nextId(), text: "I have a clear understanding of my personal strengths and weaknesses.", trait: "self_awareness", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/CDB4DB/A2D2FF.png' },
    { id: nextId(), text: "I can adapt to changing situations and overcome setbacks.", trait: "self_regulation", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/A2D2FF/B2D0C8.png' },
    { id: nextId(), text: "I am optimistic about the future.", trait: "motivation", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/DDEFE3/E76F51.png' },
    { id: nextId(), text: "I am sensitive to the emotional needs of others.", trait: "empathy", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/FFC8DD/BDE0FE.png' },
    { id: nextId(), text: "I can communicate my ideas clearly and persuasively.", trait: "social_skills", category: 'eq', type: 'slider', imageUrl: 'https://placehold.co/600x800/BDE0FE/FFC8DD.png' },

    // === Personal SWOT Analysis - 8 questions ===
    { id: nextId(), text: "What are your key professional strengths? (e.g., specific skills, knowledge, network)", trait: "analytical", category: 'swot', type: 'text_input', swot: 'strength', imageUrl: 'https://placehold.co/600x800/B2D0C8/F4A261.png' },
    { id: nextId(), text: "What skills or professional areas do you need to improve?", trait: "analytical", category: 'swot', type: 'text_input', swot: 'weakness', imageUrl: 'https://placehold.co/600x800/F4A261/B2D0C8.png' },
    { id: nextId(), text: "What are your proudest professional achievements?", trait: "analytical", category: 'swot', type: 'text_input', swot: 'strength', imageUrl: 'https://placehold.co/600x800/DDEFE3/C0A080.png' },
    { id: nextId(), text: "What tasks do you usually avoid because you don't feel confident doing them?", trait: "analytical", category: 'swot', type: 'text_input', swot: 'weakness', imageUrl: 'https://placehold.co/600x800/C0A080/DDEFE3.png' },
    { id: nextId(), text: "What industry trends or new technologies can you leverage for your career?", trait: "problem_solving", category: 'swot', type: 'text_input', swot: 'opportunity', imageUrl: 'https://placehold.co/600x800/A2D2FF/FFAFCC.png' },
    { id: nextId(), text: "What new skills could you learn to become more valuable in your field?", trait: "problem_solving", category: 'swot', type: 'text_input', swot: 'opportunity', imageUrl: 'https://placehold.co/600x800/FFAFCC/A2D2FF.png' },
    { id: nextId(), text: "What obstacles are currently hindering your professional growth?", trait: "creativity", category: 'swot', type: 'text_input', swot: 'threat', imageUrl: 'https://placehold.co/600x800/E76F51/BDE0FE.png' },
    { id: nextId(), text: "What are your competitors (peers, other companies) doing that you should be aware of?", trait: "creativity", category: 'swot', type: 'text_input', swot: 'threat', imageUrl: 'https://placehold.co/600x800/BDE0FE/E76F51.png' },

    // === Situational Judgment Test - 8 scenarios ===
    { id: nextId(), text: "You are leading a project, and a key team member is consistently missing deadlines. This is delaying the entire project. What do you do?", trait: ["sjt_communication", "sjt_problem_solving"], category: 'sjt', type: 'text_input', imageUrl: 'https://placehold.co/600x800/E76F51/A2D2FF.png'},
    { id: nextId(), text: "You notice a junior colleague is struggling with their tasks and seems afraid to ask for help. How do you approach the situation?", trait: ["sjt_interpersonal", "sjt_communication"], category: 'sjt', type: 'text_input', imageUrl: 'https://placehold.co/600x800/CDB4DB/DDEFE3.png' },
    { id: nextId(), text: "You are in a meeting, and a senior colleague presents an idea that you know is based on incorrect data. What is your course of action?", trait: "sjt_communication", category: 'sjt', type: 'text_input', imageUrl: 'https://placehold.co/600x800/F4A261/B2D0C8.png' },
    { id: nextId(), text: "Your team has been given a new, urgent project with a tight deadline, but everyone is already at full capacity. How do you handle this?", trait: "sjt_problem_solving", category: 'sjt', type: 'text_input', imageUrl: 'https://placehold.co/600x800/FFC8DD/C0A080.png' },
    { id: nextId(), text: "You receive negative feedback from a client about your work. How do you respond?", trait: ["sjt_interpersonal", "sjt_communication"], category: 'sjt', type: 'text_input', imageUrl: 'https://placehold.co/600x800/A2D2FF/E76F51.png' },
    { id: nextId(), text: "You discover a more efficient way to do a routine task, but it goes against the established process. What do you do?", trait: "sjt_problem_solving", category: 'sjt', type: 'text_input', imageUrl: 'https://placehold.co/600x800/DDEFE3/CDB4DB.png' },
    { id: nextId(), text: "A colleague from another department asks for your help on a task that is not your responsibility and will take up a significant amount of your time. How do you reply?", trait: ["sjt_interpersonal", "sjt_communication"], category: 'sjt', type: 'text_input', imageUrl: 'https://placehold.co/600x800/B2D0C8/F4A261.png' },
    { id: nextId(), text: "You have made a mistake that will impact the project timeline. What are your immediate next steps?", trait: ["sjt_problem_solving", "sjt_communication"], category: 'sjt', type: 'text_input', imageUrl: 'https://placehold.co/600x800/C0A080/FFC8DD.png' },

    // === Cognitive Puzzles - 5 puzzles ===
    { id: nextId(), text: "What has an eye, but cannot see?", trait: "puzzle_solving", category: 'puzzles', type: 'text_input', imageUrl: 'https://placehold.co/600x800/264653/ffffff.png' },
    { id: nextId(), text: "You have a 3-gallon jug and a 5-gallon jug. How can you measure out exactly 4 gallons of water?", trait: "puzzle_solving", category: 'puzzles', type: 'text_input', imageUrl: 'https://placehold.co/600x800/2a9d8f/ffffff.png' },
    { id: nextId(), text: "A man is looking at a portrait. Someone asks him whose portrait he is looking at, and he replies, 'Brothers and sisters I have none, but that man's father is my father's son.' Who is in the portrait?", trait: "puzzle_solving", category: 'puzzles', type: 'text_input', imageUrl: 'https://placehold.co/600x800/e9c46a/ffffff.png' },
    { id: nextId(), text: "What is full of holes but still holds water?", trait: "puzzle_solving", category: 'puzzles', type: 'text_input', imageUrl: 'https://placehold.co/600x800/f4a261/ffffff.png' },
    { id: nextId(), text: "Which word in the dictionary is spelled incorrectly?", trait: "puzzle_solving", category: 'puzzles', type: 'text_input', imageUrl: 'https://placehold.co/600x800/e76f51/ffffff.png' },
    
    // === NEW: Aptitude Questions (24 questions total, 6 per section) ===
    // Numerical Reasoning
    { id: nextId(), text: "If a car travels at 60 km/h, how far will it travel in 2.5 hours?", trait: 'numerical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/a8dadc/1d3557.png' },
    { id: nextId(), text: "A shirt originally priced at ₹1200 is on sale for 25% off. What is the sale price?", trait: 'numerical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/f1faee/e63946.png' },
    { id: nextId(), text: "What is the next number in the sequence: 2, 5, 11, 23, ...?", trait: 'numerical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/457b9d/f1faee.png' },
    { id: nextId(), text: "If 5 workers can build a wall in 8 hours, how long would it take 4 workers?", trait: 'numerical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/1d3557/a8dadc.png' },
    { id: nextId(), text: "The average of three numbers is 15. If two of the numbers are 12 and 18, what is the third number?", trait: 'numerical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/e63946/f1faee.png' },
    { id: nextId(), text: "A company's profit increased from ₹50,000 to ₹70,000. What is the percentage increase?", trait: 'numerical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/f1faee/457b9d.png' },
    // Verbal Reasoning
    { id: nextId(), text: "Which word is the odd one out: apple, banana, rose, orange?", trait: 'verbal_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/6d597a/b56576.png' },
    { id: nextId(), text: "Complete the analogy: Doctor is to Hospital as Teacher is to ________.", trait: 'verbal_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/b56576/6d597a.png' },
    { id: nextId(), text: "Rearrange the letters 'RTAEWH' to form a meaningful word.", trait: 'verbal_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/e85d04/ffba08.png' },
    { id: nextId(), text: "Choose the word that is most nearly opposite in meaning to 'generous'.", trait: 'verbal_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/ffba08/e85d04.png' },
    { id: nextId(), text: "If 'CAT' is coded as 'DBU', how is 'DOG' coded?", trait: 'verbal_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/03071e/9d0208.png' },
    { id: nextId(), text: "What is the main idea of the proverb 'A stitch in time saves nine'?", trait: 'verbal_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/9d0208/03071e.png' },
    // Logical Reasoning
    { id: nextId(), text: "All artists are creative. Some creative people are introverts. Can we conclude that some artists are introverts?", trait: 'logical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/5f0f40/9a031e.png' },
    { id: nextId(), text: "If A is the brother of B, B is the sister of C, and C is the father of D, how is D related to A?", trait: 'logical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/9a031e/5f0f40.png' },
    { id: nextId(), text: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", trait: 'logical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/0f4c5c/fb8500.png' },
    { id: nextId(), text: "Statements: 1. All clouds are white. 2. Some white things are birds. Conclusion: Some clouds are birds. Is the conclusion valid?", trait: 'logical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/fb8500/0f4c5c.png' },
    { id: nextId(), text: "There are five houses in a row. The red house is to the left of the green house. The blue house is to the right of the red house and to the left of the yellow house. The green house is between the white and blue houses. Which house is in the middle?", trait: 'logical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/023047/8ecae6.png' },
    { id: nextId(), text: "If you are facing North and you turn right, then turn 180 degrees, which direction are you facing now?", trait: 'logical_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/8ecae6/023047.png' },
    // Spatial Reasoning
    { id: nextId(), text: "Which of the 2D shapes below can be folded to form a cube?", trait: 'spatial_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/219ebc/ffb703.png' },
    { id: nextId(), text: "Imagine a 3x3 grid. If you place a dot in the top-left corner and it moves one step right and then one step down, where is it now?", trait: 'spatial_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/ffb703/219ebc.png' },
    { id: nextId(), text: "You see a shape in a mirror. It looks like the letter 'b'. What is the actual letter?", trait: 'spatial_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/3a5a40/588157.png' },
    { id: nextId(), text: "If you rotate a square by 45 degrees, what shape does it become?", trait: 'spatial_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/588157/3a5a40.png' },
    { id: nextId(), text: "Which shape completes the pattern: [Circle, Triangle, Square, Circle, ... ]?", trait: 'spatial_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/a3b18a/344e41.png' },
    { id: nextId(), text: "A cube is painted red on all sides. It is then cut into 27 smaller cubes. How many of the smaller cubes have exactly one side painted red?", trait: 'spatial_reasoning', category: 'aptitude', type: 'text_input', imageUrl: 'https://placehold.co/600x800/344e41/a3b18a.png' },

    // === NEW: Work Values Question ===
    {
        id: nextId(),
        text: "You have been granted 100 'Influence Points' to shape the future of your ideal workplace. Allocate these points across the following 'City Edicts' based on what you value most in a career. You must use all 100 points.",
        trait: ['work_value_prosperity', 'work_value_harmony', 'work_value_pioneer', 'work_value_guardian', 'work_value_autonomy', 'work_value_impact'],
        category: 'work-values',
        type: 'points_allocation',
        imageUrl: 'https://placehold.co/600x800/8d99ae/edf2f4.png',
        options: [
            { id: 'prosperity', content: 'Prosperity', type: 'text', description: 'Boost economic growth and financial success.', icon: Gem },
            { id: 'harmony', content: 'Harmony', type: 'text', description: 'Foster a collaborative and supportive community.', icon: Users },
            { id: 'pioneer', content: 'Pioneer', type: 'text', description: 'Drive innovation and cutting-edge discovery.', icon: Lightbulb },
            { id: 'guardian', content: 'Guardian', type: 'text', description: 'Ensure stability, security, and tradition.', icon: Shield },
            { id: 'autonomy', content: 'Autonomy', type: 'text', description: 'Promote independence and creative freedom.', icon: Palette },
            { id: 'impact', content: 'Impact', type: 'text', description: 'Make a tangible difference and help others.', icon: Heart }
        ]
    }
];
