

export const services = [
    { 
        title: 'Student Counseling', 
        value: 'student-counseling',
    },
    { 
        title: 'Individual Counseling', 
        value: 'individual-counseling',
    },
    { 
        title: 'Couple Counseling', 
        value: 'couple-counseling',
    },
    { 
        title: 'Family Counseling', 
        value: 'family-counseling',
    },
];


export const counselors = [
    { 
        value: 'afjal-hossain-hridoy', 
        name: 'Afjal Hossain Hridoy', 
        title: 'B.Sc and M.S in Psychology\nUniversity of Chittagong',
        image: '/team/hridoy.jpeg',
        dataAiHint: 'man professional',
        bio: 'Afjal specializes in providing support for anxiety, depression, and stress management. He employs a client-centered approach, combining evidence-based techniques to help individuals develop coping mechanisms and foster resilience. His goal is to create a safe, empathetic space where clients feel empowered to explore their challenges and work towards lasting mental wellness.',
        services: ['student-counseling', 'individual-counseling', 'couple-counseling', 'family-counseling'], 
        times: ['08:00 PM', '10:00 PM'],
        expertise: ['Anxiety & Depression', 'Stress Management', 'Trauma-Informed Care', 'Coping Skills'],
        education: [
            'M.S. in Psychology, University of Chittagong',
            'B.Sc in Psychology, University of Chittagong'
        ],
        experience: [
            'Counselor, Wellbeing Clinic (2022-Present)',
            'Research Assistant, Psychology Dept, CU (2021-2022)'
        ],
        social: {
            linkedin: 'https://linkedin.com/in/afjal-hossain-hridoy',
            facebook: 'https://facebook.com/afjal.hossain.hridoy'
        }
    },
    { 
        value: 'bibi-hazera', 
        name: 'Bibi Hazera', 
        title: 'B.Sc and M.S in Psychology\nUniversity of Chittagong',
        image: '/team/hazera.jpeg',
        dataAiHint: 'woman professional',
        bio: 'Bibi Hazera focuses on relationship issues, helping both individuals and couples improve their communication and connection. She is skilled in navigating complex family dynamics and provides practical tools to foster healthier interactions. Her therapeutic style is warm, collaborative, and tailored to the unique needs of her clients, creating a supportive environment for growth.',
        services: ['student-counseling', 'individual-counseling', 'couple-counseling'], 
        times: ['06:00 PM', '08:00 PM', '10:00 PM'],
        expertise: ['Relationship Counseling', 'Family Dynamics', 'Communication Skills', 'Couples Therapy'],
        education: [
            'M.S. in Psychology, University of Chittagong',
            'B.Sc in Psychology, University of Chittagong'
        ],
        experience: [
            'Counselor, Wellbeing Clinic (2023-Present)'
        ],
        social: {}
    },
    { 
        value: 'md-asifuzzaman-reyad', 
        name: 'Md Asifuzzaman Reyad', 
        title: 'B.Sc and M.S in Psychology\nUniversity of Chittagong',
        image: '/team/reyad.jpeg',
        dataAiHint: 'man friendly',
        bio: 'As a co-founder, Reyad is dedicated to helping young adults navigate life transitions and career challenges. He provides strategic guidance and support, empowering clients to build confidence and pursue their goals. His approach is practical, solution-focused, and aimed at fostering long-term personal and professional growth for students and young professionals alike.',
        services: ['student-counseling', 'individual-counseling', 'couple-counseling'], 
        times: ['06:00 PM', '08:00 PM', '10:00 PM'],
        expertise: ['Student Counseling', 'Career Guidance', 'Life Transitions', 'Personal Development'],
        education: [
            'M.S. in Psychology, University of Chittagong',
            'B.Sc in Psychology, University of Chittagong'
        ],
        experience: [
            'Co-founder & Counselor, Wellbeing Clinic (2022-Present)'
        ],
        social: {
            linkedin: 'https://linkedin.com/in/reyad-cu',
        }
    },
    { 
        value: 'sabiha-islam', 
        name: 'Sabiha Islam', 
        title: 'B.Sc and M.S in Psychology\nUniversity of Chittagong',
        image: '/team/muna.jpeg',
        dataAiHint: 'woman smiling',
        bio: 'As Lead Counselor, Sabiha brings expertise in cognitive-behavioral therapy (CBT) and mindfulness-based interventions. She is committed to providing high-quality, evidence-based care and leading the clinical team with integrity. Her focus is on creating a supportive atmosphere for both clients and fellow counselors to thrive while ensuring the best clinical outcomes.',
        services: ['student-counseling', 'individual-counseling', 'couple-counseling', 'family-counseling'], 
        times: ['08:00 PM', '10:00 PM'],
        expertise: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness', 'Clinical Supervision', 'Evidence-Based Practice'],
        education: [
            'M.S. in Psychology, University of Chittagong',
            'B.Sc in Psychology, University of Chittagong'
        ],
        experience: [
            'Lead Counselor, Wellbeing Clinic (2022-Present)'
        ],
        social: {}
    },
    { 
        value: 'upoma-islam-eti', 
        name: 'Upoma Islam Eti', 
        title: 'B.Sc and M.S in Psychology\nUniversity of Chittagong',
        image: '/team/eti.jpeg',
        dataAiHint: 'woman professional smiling',
        bio: 'Upoma provides a safe, non-judgmental space for individuals to explore personal growth and enhance their self-esteem. She uses an integrative approach, drawing from various therapeutic modalities to best suit the client. Her passion is helping people build a stronger sense of self, overcome personal barriers, and ultimately live more authentic and fulfilling lives.',
        services: ['student-counseling', 'individual-counseling', 'couple-counseling', 'family-counseling'], 
        times: ['06:00 PM', '08:00 PM', '10:00 PM'],
        expertise: ['Personal Growth', 'Self-Esteem', 'Integrative Therapy', 'Women\'s Issues'],
        education: [
            'M.S. in Psychology, University of Chittagong',
            'B.Sc in Psychology, University of Chittagong'
        ],
        experience: [
            'Counselor, Wellbeing Clinic (2023-Present)'
        ],
        social: {}
    }
] as const;

export type Counselor = typeof counselors[number];
export type CounselorValue = Counselor['value'];

// Example holidays, can be moved to a CMS or Firestore later
export const holidays = ['2024-12-25', '2025-01-01', '2025-01-17'];
