export interface BracketData {
  regions: Region[];
  first_four: FirstFourGame[];
  final_four: FinalFourSetup;
}

export interface Region {
  name: string;
  location: string;
  color: string;
  matchups: Matchup[];
}

export interface Matchup {
  top_seed: number;
  top_team: string;
  top_record: string;
  top_conference: string;
  bottom_seed: number;
  bottom_team: string;
  bottom_record: string;
  bottom_conference: string;
  first_four_placeholder: boolean;
}

export interface FirstFourGame {
  seed: number;
  team_a: string;
  team_b: string;
  winner_plays_seed: number;
  winner_plays_team: string;
  winner_plays_region: string;
}

export interface FinalFourSetup {
  semifinal_1: [string, string];
  semifinal_2: [string, string];
  championship_location: string;
  championship_date: string;
}
