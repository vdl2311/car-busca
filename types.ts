
export enum AppRoute {
    WELCOME = '/',
    LOGIN = '/login',
    HOME = '/home',
    REPORT_RESULT = '/report-result',
    DEFECT_DETAIL = '/defect-detail',
    PROFILE = '/profile',
    REPORT_ISSUE = '/report-issue'
}

export interface Defect {
    id: string;
    title: string;
    description: string;
    severity: 'Alta' | 'Média' | 'Baixa';
    icon: string;
    costMin?: number;
    costMax?: number;
}

export interface Post {
    id: string;
    user: {
        name: string;
        avatar: string;
        car: string;
    };
    timeAgo: string;
    title?: string;
    content: string;
    likes: number;
    comments: number;
    resolved?: boolean;
    hasAudio?: boolean;
    aiInsight?: {
        diagnosis: string;
        confidence: number;
        description: string;
    };
    image?: string;
}

export interface UserProfile {
    name: string;
    role: string;
    evaluations: number;
    precision: number;
    contributions: number;
    avatar: string;
}
