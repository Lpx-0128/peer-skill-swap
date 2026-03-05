export type Skill = string;

export interface Achievement {
    id: string;
    title: string;
    subtitle: string;
    type: 'award' | 'education';
}

export interface SwapOffering {
    teach: string;
    learn: string;
}

export interface User {
    id: string;
    name: string;
    universityEmail: string;
    contactNumber: string;
    skillsToTeach: Skill[];
    skillsToLearn: Skill[];
    bio: string;
    avatarUrl: string;
    achievements: Achievement[];
}

export interface Peer extends User {
    connected: boolean;
    requestSent?: boolean;
    badge?: string;
    swapOffering?: SwapOffering;
}

export interface Notification {
    id: string;
    profile_id: string;
    sender_id: string;
    sender: Peer;
    title: string;
    content: string;
    is_read: boolean;
    created_at: string;
    media_url?: string;
    connection_id?: string;
}

export interface Connection {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'declined';
    swap_teach: string;
    swap_learn: string;
}

export interface SwapMedia {
    id: string;
    connection_id: string;
    uploader_id: string;
    file_url: string;
    title: string;
    description: string;
    created_at: string;
}
