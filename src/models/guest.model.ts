export type RSVPStatus = 'pending' | 'confirmed' | 'declined';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  group: string;
  plannedGuests: number;
  status: RSVPStatus;
  actualGuests?: number;
  dietaryNeeds: string[];
  dietaryNote?: string;
  personalMessage?: string;
  gender?: 'male' | 'female' | 'unspecified';
  inviteToken: string;
  respondedAt?: Date;
  createdAt: Date;
}

export interface RSVPSubmission {
  actualGuests: number;
  dietaryNeeds: string[];
  dietaryNote?: string;
  personalMessage?: string;
}

export type GuestFormData = Omit<Guest, 'id' | 'inviteToken' | 'createdAt' | 'respondedAt' | 'status' | 'actualGuests'>;
