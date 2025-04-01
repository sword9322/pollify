export interface Option {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: Option[];
  totalVotes: number;
  createdAt: string;
  userVoted?: boolean;
}

export interface CreatePollData {
  question: string;
  options: string[];
}

export interface VoteData {
  pollId: string;
  optionId: string;
}