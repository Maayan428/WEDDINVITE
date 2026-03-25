export interface EventDetails {
  coupleName: string;
  brideFirstName: string;
  groomFirstName: string;
  date: string;         // ISO "YYYY-MM-DD" or Hebrew fallback text
  time: string;
  venue: string;
  rsvpDeadline: string; // ISO "YYYY-MM-DD" or Hebrew fallback text
  welcomeMessage?: string;
  invitationImageBase64?: string;
  inviteStyle?: {
    guestNameColor?: string;
    coupleNameColor?: string;
    detailsColor?: string;
    accentColor?: string;
    headingFont?: 'serif' | 'sans' | 'elegant';
    bodyFont?: 'sans' | 'heebo';
  };
}
