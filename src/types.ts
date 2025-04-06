export interface Option {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  short_id?: string;
  question: string;
  options: Option[];
  totalVotes: number;
  userVoted: boolean;
  created_at: string;
}

export interface CreatePollData {
  question: string;
  options: string[];
}

export interface VoteData {
  pollId: string;
  optionId: string;
}