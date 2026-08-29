const { v4: uuid } = require('uuid');
const db = require('./db');

function run() {
  const examCount = db.prepare('SELECT COUNT(*) c FROM exams').get().c;
  if (examCount > 0) {
    console.log('Already seeded. Skipping.');
    return;
  }

  const exams = [
    {
      id: uuid(), name: 'Staff Selection Commission - Combined Graduate Level', short_name: 'SSC CGL',
      category: 'SSC', conducting_body: 'Staff Selection Commission',
      description: 'Recruitment to Group B and C posts in various Ministries/Departments of the Government of India.',
      min_age: 18, max_age: 32, age_relaxation: '{}', min_qualification: 'Graduate', min_percentage: 0,
      requires_physical: 0, physical_standards: '{}',
      application_start: '2026-05-01', application_end: '2026-06-15', exam_date: '2026-08-20',
      fee_general: 100, fee_reserved: 0, vacancies: 17727, accent_color: '#1E3A8A',
      official_link: 'https://ssc.nic.in'
    },
    {
      id: uuid(), name: 'Institute of Banking Personnel Selection - Probationary Officer', short_name: 'IBPS PO',
      category: 'Banking', conducting_body: 'IBPS',
      description: 'Recruitment of Probationary Officers/Management Trainees for participating public sector banks.',
      min_age: 20, max_age: 30, age_relaxation: '{}', min_qualification: 'Graduate', min_percentage: 0,
      requires_physical: 0, physical_standards: '{}',
      application_start: '2026-08-01', application_end: '2026-08-25', exam_date: '2026-10-05',
      fee_general: 850, fee_reserved: 175, vacancies: 4500, accent_color: '#4059AA',
      official_link: 'https://ibps.in'
    },
    {
      id: uuid(), name: 'Railway Recruitment Board - Non-Technical Popular Categories', short_name: 'RRB NTPC',
      category: 'Railways', conducting_body: 'Railway Recruitment Board',
      description: 'Recruitment to non-technical popular categories such as Station Master, Goods Guard, and Clerk.',
      min_age: 18, max_age: 33, age_relaxation: '{}', min_qualification: '12th', min_percentage: 0,
      requires_physical: 0, physical_standards: '{}',
      application_start: '2026-04-10', application_end: '2026-05-10', exam_date: '2026-09-01',
      fee_general: 500, fee_reserved: 250, vacancies: 11558, accent_color: '#0B192C',
      official_link: 'https://rrbcdg.gov.in'
    },
    {
      id: uuid(), name: 'Union Public Service Commission - Combined Defence Services', short_name: 'UPSC CDS',
      category: 'Defence', conducting_body: 'UPSC',
      description: 'Entry into Indian Military Academy, Indian Naval Academy, Air Force Academy and Officers Training Academy.',
      min_age: 19, max_age: 24, age_relaxation: '{}', min_qualification: 'Graduate', min_percentage: 0,
      requires_physical: 1, physical_standards: '{"male":{"height":157,"chest":81},"female":{"height":152,"chest":0}}',
      application_start: '2026-06-05', application_end: '2026-06-25', exam_date: '2026-09-14',
      fee_general: 200, fee_reserved: 0, vacancies: 459, accent_color: '#0B192C',
      official_link: 'https://upsc.gov.in'
    },
    {
      id: uuid(), name: 'State Police Constable Recruitment', short_name: 'State Police Constable',
      category: 'Police', conducting_body: 'State Police Recruitment Board',
      description: 'Direct recruitment to the post of Police Constable (Civil Police) across district units.',
      min_age: 18, max_age: 25, age_relaxation: '{}', min_qualification: '12th', min_percentage: 0,
      requires_physical: 1, physical_standards: '{"male":{"height":168,"chest":81},"female":{"height":152,"chest":0}}',
      application_start: '2026-03-01', application_end: '2026-03-31', exam_date: '2026-07-10',
      fee_general: 350, fee_reserved: 150, vacancies: 8000, accent_color: '#1E3A8A',
      official_link: 'https://state-police.gov.in'
    },
    {
      id: uuid(), name: 'Central Teacher Eligibility Test', short_name: 'CTET', category: 'Teaching',
      conducting_body: 'CBSE',
      description: 'Eligibility test for teachers of classes I-VIII in schools under the Central Government.',
      min_age: 18, max_age: 0, age_relaxation: '{}', min_qualification: 'Graduate', min_percentage: 50,
      requires_physical: 0, physical_standards: '{}',
      application_start: '2026-09-01', application_end: '2026-09-30', exam_date: '2026-12-14',
      fee_general: 1000, fee_reserved: 500, vacancies: 0, accent_color: '#4059AA',
      official_link: 'https://ctet.nic.in'
    },
    {
      id: uuid(), name: 'SSC Multi Tasking Staff', short_name: 'SSC MTS', category: 'SSC',
      conducting_body: 'Staff Selection Commission',
      description: 'Recruitment to Multi Tasking (Non-Technical) Staff posts in Group C.',
      min_age: 18, max_age: 25, age_relaxation: '{}', min_qualification: '10th', min_percentage: 0,
      requires_physical: 0, physical_standards: '{}',
      application_start: '2026-07-01', application_end: '2026-07-30', exam_date: '2026-10-12',
      fee_general: 100, fee_reserved: 0, vacancies: 9500, accent_color: '#1E3A8A',
      official_link: 'https://ssc.nic.in'
    },
    {
      id: uuid(), name: 'National Defence Academy Examination', short_name: 'NDA', category: 'Defence',
      conducting_body: 'UPSC',
      description: 'Entry for unmarried candidates into the Army, Navy and Air Force wings of the National Defence Academy.',
      min_age: 16, max_age: 19, age_relaxation: '{}', min_qualification: '12th', min_percentage: 0,
      requires_physical: 1, physical_standards: '{"male":{"height":157,"chest":81},"female":{"height":152,"chest":0}}',
      application_start: '2026-06-10', application_end: '2026-07-01', exam_date: '2026-09-07',
      fee_general: 100, fee_reserved: 0, vacancies: 400, accent_color: '#0B192C',
      official_link: 'https://upsc.gov.in'
    }
  ];

  const insertExam = db.prepare(`INSERT INTO exams (id,name,short_name,category,conducting_body,description,min_age,max_age,
    age_relaxation,min_qualification,min_percentage,requires_physical,physical_standards,application_start,
    application_end,exam_date,fee_general,fee_reserved,vacancies,accent_color,official_link)
    VALUES (@id,@name,@short_name,@category,@conducting_body,@description,@min_age,@max_age,@age_relaxation,
    @min_qualification,@min_percentage,@requires_physical,@physical_standards,@application_start,@application_end,
    @exam_date,@fee_general,@fee_reserved,@vacancies,@accent_color,@official_link)`);
  const insertMany = db.transaction((rows) => rows.forEach(r => insertExam.run(r)));
  insertMany(exams);

  const subjects = [
    { id: uuid(), name: 'Quantitative Aptitude', icon: 'calculate', category: 'General', color: '#1E3A8A' },
    { id: uuid(), name: 'General English', icon: 'menu_book', category: 'General', color: '#4059AA' },
    { id: uuid(), name: 'Reasoning Ability', icon: 'psychology', category: 'General', color: '#0B192C' },
    { id: uuid(), name: 'General Awareness & Current Affairs', icon: 'public', category: 'General', color: '#1E3A8A' },
    { id: uuid(), name: 'Indian Polity & Constitution', icon: 'gavel', category: 'GK', color: '#4059AA' },
    { id: uuid(), name: 'Physical Efficiency & Fitness', icon: 'fitness_center', category: 'Physical', color: '#0B192C' }
  ];
  const insertSubject = db.prepare('INSERT INTO subjects (id,name,icon,category,color) VALUES (@id,@name,@icon,@category,@color)');
  db.transaction((rows) => rows.forEach(r => insertSubject.run(r)))(subjects);

  const noteTitles = [
    ['Number Systems & Simplification', 24], ['Percentage, Profit & Loss', 18], ['Time, Speed & Distance', 20],
    ['Data Interpretation Masterclass', 30], ['Grammar Rules & Common Errors', 16], ['Reading Comprehension Strategy', 14],
    ['Vocabulary Builder - 500 Words', 22], ['Syllogism & Venn Diagrams', 18], ['Blood Relations & Puzzles', 20],
    ['Coding-Decoding Techniques', 12], ['Static GK Compendium 2026', 40], ['Banking & Financial Awareness', 26],
    ['Preamble & Fundamental Rights', 15], ['Union & State Executive', 18], ['Physical Standards Test Guide', 10]
  ];
  const insertNote = db.prepare(`INSERT INTO notes (id,subject_id,title,description,content,pages,downloads)
    VALUES (@id,@subject_id,@title,@description,@content,@pages,@downloads)`);
  db.transaction(() => {
    noteTitles.forEach(([title, pages], i) => {
      const subject = subjects[i % subjects.length];
      insertNote.run({
        id: uuid(), subject_id: subject.id, title,
        description: `Concise, exam-focused notes on ${title.toLowerCase()} with solved examples and practice questions.`,
        content: `# ${title}\n\nThis study note covers the core concepts, formulas, shortcuts and previous-year question patterns for **${title}**.\n\n## Key Points\n- Concept overview and definitions\n- Important formulas and tricks\n- 10 solved examples\n- 15 practice questions with answer key\n\n## Summary\nRevise this note a day before your exam for quick recall.`,
        pages, downloads: Math.floor(Math.random() * 5000) + 200
      });
    });
  })();

  const videoTitles = [
    ['Number System Foundations', 42], ['Time & Work Shortcuts', 35], ['Complete English Grammar in One Shot', 58],
    ['Reasoning: Puzzles Deep Dive', 47], ['Current Affairs - August 2026 Roundup', 25], ['Indian Constitution Explained', 51],
    ['Data Interpretation Live Class', 39], ['Physical Test Preparation Guide', 20]
  ];
  const insertVideo = db.prepare(`INSERT INTO videos (id,subject_id,title,instructor,duration_min,views,thumbnail_color,description)
    VALUES (@id,@subject_id,@title,@instructor,@duration_min,@views,@thumbnail_color,@description)`);
  const instructors = ['Priya Sharma', 'Rakesh Verma', 'Anjali Nair', 'Manoj Tiwari'];
  db.transaction(() => {
    videoTitles.forEach(([title, dur], i) => {
      const subject = subjects[i % subjects.length];
      insertVideo.run({
        id: uuid(), subject_id: subject.id, title,
        instructor: instructors[i % instructors.length], duration_min: dur,
        views: Math.floor(Math.random() * 90000) + 1000, thumbnail_color: subject.color,
        description: `A structured video lecture on ${title.toLowerCase()}, designed for competitive exam aspirants.`
      });
    });
  })();

  console.log('Seed complete:', exams.length, 'exams,', subjects.length, 'subjects,', noteTitles.length, 'notes,', videoTitles.length, 'videos.');
}

run();
