use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct BracketData {
    pub regions: Vec<Region>,
    pub first_four: Vec<FirstFourGame>,
    pub final_four: FinalFourSetup,
}

#[derive(Serialize, Clone)]
pub struct Region {
    pub name: String,
    pub location: String,
    pub color: String,
    pub matchups: Vec<Matchup>,
}

#[derive(Serialize, Clone)]
pub struct Matchup {
    pub top_seed: u8,
    pub top_team: String,
    pub top_record: String,
    pub top_conference: String,
    pub bottom_seed: u8,
    pub bottom_team: String,
    pub bottom_record: String,
    pub bottom_conference: String,
    pub first_four_placeholder: bool,
}

#[derive(Serialize, Clone)]
pub struct FirstFourGame {
    pub seed: u8,
    pub team_a: String,
    pub team_b: String,
    pub winner_plays_seed: u8,
    pub winner_plays_team: String,
    pub winner_plays_region: String,
}

#[derive(Serialize, Clone)]
pub struct FinalFourSetup {
    pub semifinal_1: [String; 2],
    pub semifinal_2: [String; 2],
    pub championship_location: String,
    pub championship_date: String,
}

pub fn get_bracket_data() -> BracketData {
    BracketData {
        regions: vec![
            // EAST REGION
            Region {
                name: "East".into(),
                location: "Capital One Arena, Washington, D.C.".into(),
                color: "#1a5276".into(),
                matchups: vec![
                    Matchup {
                        top_seed: 1, top_team: "Duke".into(), top_record: "32-2".into(), top_conference: "ACC".into(),
                        bottom_seed: 16, bottom_team: "Siena".into(), bottom_record: "23-11".into(), bottom_conference: "MAAC".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 8, top_team: "Ohio State".into(), top_record: "21-12".into(), top_conference: "Big Ten".into(),
                        bottom_seed: 9, bottom_team: "TCU".into(), bottom_record: "22-11".into(), bottom_conference: "Big 12".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 5, top_team: "St. John's".into(), top_record: "28-6".into(), top_conference: "Big East".into(),
                        bottom_seed: 12, bottom_team: "Northern Iowa".into(), bottom_record: "23-12".into(), bottom_conference: "Missouri Valley".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 4, top_team: "Kansas".into(), top_record: "23-10".into(), top_conference: "Big 12".into(),
                        bottom_seed: 13, bottom_team: "California Baptist".into(), bottom_record: "25-8".into(), bottom_conference: "WAC".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 6, top_team: "Louisville".into(), top_record: "23-10".into(), top_conference: "ACC".into(),
                        bottom_seed: 11, bottom_team: "South Florida".into(), bottom_record: "25-8".into(), bottom_conference: "American".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 3, top_team: "Michigan State".into(), top_record: "25-7".into(), top_conference: "Big Ten".into(),
                        bottom_seed: 14, bottom_team: "North Dakota State".into(), bottom_record: "27-7".into(), bottom_conference: "Summit".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 7, top_team: "UCLA".into(), top_record: "23-11".into(), top_conference: "Big Ten".into(),
                        bottom_seed: 10, bottom_team: "UCF".into(), bottom_record: "21-11".into(), bottom_conference: "Big 12".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 2, top_team: "UConn".into(), top_record: "29-5".into(), top_conference: "Big East".into(),
                        bottom_seed: 15, bottom_team: "Furman".into(), bottom_record: "22-12".into(), bottom_conference: "Southern".into(),
                        first_four_placeholder: false,
                    },
                ],
            },
            // WEST REGION
            Region {
                name: "West".into(),
                location: "SAP Center, San Jose, CA".into(),
                color: "#922b21".into(),
                matchups: vec![
                    Matchup {
                        top_seed: 1, top_team: "Arizona".into(), top_record: "32-2".into(), top_conference: "Big 12".into(),
                        bottom_seed: 16, bottom_team: "LIU".into(), bottom_record: "24-10".into(), bottom_conference: "NEC".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 8, top_team: "Villanova".into(), top_record: "24-8".into(), top_conference: "Big East".into(),
                        bottom_seed: 9, bottom_team: "Utah State".into(), bottom_record: "28-6".into(), bottom_conference: "Mountain West".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 5, top_team: "Wisconsin".into(), top_record: "24-10".into(), top_conference: "Big Ten".into(),
                        bottom_seed: 12, bottom_team: "High Point".into(), bottom_record: "30-4".into(), bottom_conference: "Big South".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 4, top_team: "Arkansas".into(), top_record: "26-8".into(), top_conference: "SEC".into(),
                        bottom_seed: 13, bottom_team: "Hawai'i".into(), bottom_record: "24-8".into(), bottom_conference: "Big West".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 6, top_team: "BYU".into(), top_record: "23-11".into(), top_conference: "Big 12".into(),
                        bottom_seed: 11, bottom_team: "TBD (First Four)".into(), bottom_record: "".into(), bottom_conference: "".into(),
                        first_four_placeholder: true,
                    },
                    Matchup {
                        top_seed: 3, top_team: "Gonzaga".into(), top_record: "30-3".into(), top_conference: "WCC".into(),
                        bottom_seed: 14, bottom_team: "Kennesaw State".into(), bottom_record: "21-13".into(), bottom_conference: "C-USA".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 7, top_team: "Miami FL".into(), top_record: "25-8".into(), top_conference: "ACC".into(),
                        bottom_seed: 10, bottom_team: "Missouri".into(), bottom_record: "20-12".into(), bottom_conference: "SEC".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 2, top_team: "Purdue".into(), top_record: "27-8".into(), top_conference: "Big Ten".into(),
                        bottom_seed: 15, bottom_team: "Queens".into(), bottom_record: "21-13".into(), bottom_conference: "ASUN".into(),
                        first_four_placeholder: false,
                    },
                ],
            },
            // SOUTH REGION
            Region {
                name: "South".into(),
                location: "Toyota Center, Houston, TX".into(),
                color: "#196f3d".into(),
                matchups: vec![
                    Matchup {
                        top_seed: 1, top_team: "Florida".into(), top_record: "26-7".into(), top_conference: "SEC".into(),
                        bottom_seed: 16, bottom_team: "TBD (First Four)".into(), bottom_record: "".into(), bottom_conference: "".into(),
                        first_four_placeholder: true,
                    },
                    Matchup {
                        top_seed: 8, top_team: "Clemson".into(), top_record: "24-10".into(), top_conference: "ACC".into(),
                        bottom_seed: 9, bottom_team: "Iowa".into(), bottom_record: "21-12".into(), bottom_conference: "Big Ten".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 5, top_team: "Vanderbilt".into(), top_record: "26-8".into(), top_conference: "SEC".into(),
                        bottom_seed: 12, bottom_team: "McNeese".into(), bottom_record: "28-5".into(), bottom_conference: "Southland".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 4, top_team: "Nebraska".into(), top_record: "26-6".into(), top_conference: "Big Ten".into(),
                        bottom_seed: 13, bottom_team: "Troy".into(), bottom_record: "22-11".into(), bottom_conference: "Sun Belt".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 6, top_team: "North Carolina".into(), top_record: "24-8".into(), top_conference: "ACC".into(),
                        bottom_seed: 11, bottom_team: "VCU".into(), bottom_record: "27-7".into(), bottom_conference: "Atlantic 10".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 3, top_team: "Illinois".into(), top_record: "24-7".into(), top_conference: "Big Ten".into(),
                        bottom_seed: 14, bottom_team: "Penn".into(), bottom_record: "18-11".into(), bottom_conference: "Ivy".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 7, top_team: "Saint Mary's".into(), top_record: "27-5".into(), top_conference: "WCC".into(),
                        bottom_seed: 10, bottom_team: "Texas A&M".into(), bottom_record: "21-11".into(), bottom_conference: "SEC".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 2, top_team: "Houston".into(), top_record: "28-6".into(), top_conference: "Big 12".into(),
                        bottom_seed: 15, bottom_team: "Idaho".into(), bottom_record: "21-14".into(), bottom_conference: "Big Sky".into(),
                        first_four_placeholder: false,
                    },
                ],
            },
            // MIDWEST REGION
            Region {
                name: "Midwest".into(),
                location: "United Center, Chicago, IL".into(),
                color: "#7d3c98".into(),
                matchups: vec![
                    Matchup {
                        top_seed: 1, top_team: "Michigan".into(), top_record: "31-3".into(), top_conference: "Big Ten".into(),
                        bottom_seed: 16, bottom_team: "TBD (First Four)".into(), bottom_record: "".into(), bottom_conference: "".into(),
                        first_four_placeholder: true,
                    },
                    Matchup {
                        top_seed: 8, top_team: "Georgia".into(), top_record: "22-10".into(), top_conference: "SEC".into(),
                        bottom_seed: 9, bottom_team: "Saint Louis".into(), bottom_record: "28-5".into(), bottom_conference: "Atlantic 10".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 5, top_team: "Texas Tech".into(), top_record: "22-10".into(), top_conference: "Big 12".into(),
                        bottom_seed: 12, bottom_team: "Akron".into(), bottom_record: "29-5".into(), bottom_conference: "MAC".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 4, top_team: "Alabama".into(), top_record: "23-9".into(), top_conference: "SEC".into(),
                        bottom_seed: 13, bottom_team: "Hofstra".into(), bottom_record: "24-10".into(), bottom_conference: "CAA".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 6, top_team: "Tennessee".into(), top_record: "22-11".into(), top_conference: "SEC".into(),
                        bottom_seed: 11, bottom_team: "TBD (First Four)".into(), bottom_record: "".into(), bottom_conference: "".into(),
                        first_four_placeholder: true,
                    },
                    Matchup {
                        top_seed: 3, top_team: "Virginia".into(), top_record: "29-5".into(), top_conference: "ACC".into(),
                        bottom_seed: 14, bottom_team: "Wright State".into(), bottom_record: "23-11".into(), bottom_conference: "Horizon".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 7, top_team: "Kentucky".into(), top_record: "21-13".into(), top_conference: "SEC".into(),
                        bottom_seed: 10, bottom_team: "Santa Clara".into(), bottom_record: "26-8".into(), bottom_conference: "WCC".into(),
                        first_four_placeholder: false,
                    },
                    Matchup {
                        top_seed: 2, top_team: "Iowa State".into(), top_record: "27-7".into(), top_conference: "Big 12".into(),
                        bottom_seed: 15, bottom_team: "Tennessee State".into(), bottom_record: "23-9".into(), bottom_conference: "Ohio Valley".into(),
                        first_four_placeholder: false,
                    },
                ],
            },
        ],
        first_four: vec![
            FirstFourGame {
                seed: 16,
                team_a: "UMBC".into(),
                team_b: "Howard".into(),
                winner_plays_seed: 1,
                winner_plays_team: "Michigan".into(),
                winner_plays_region: "Midwest".into(),
            },
            FirstFourGame {
                seed: 11,
                team_a: "Texas".into(),
                team_b: "NC State".into(),
                winner_plays_seed: 6,
                winner_plays_team: "BYU".into(),
                winner_plays_region: "West".into(),
            },
            FirstFourGame {
                seed: 16,
                team_a: "Prairie View A&M".into(),
                team_b: "Lehigh".into(),
                winner_plays_seed: 1,
                winner_plays_team: "Florida".into(),
                winner_plays_region: "South".into(),
            },
            FirstFourGame {
                seed: 11,
                team_a: "Miami OH".into(),
                team_b: "SMU".into(),
                winner_plays_seed: 6,
                winner_plays_team: "Tennessee".into(),
                winner_plays_region: "Midwest".into(),
            },
        ],
        final_four: FinalFourSetup {
            semifinal_1: ["East".into(), "South".into()],
            semifinal_2: ["West".into(), "Midwest".into()],
            championship_location: "Lucas Oil Stadium, Indianapolis".into(),
            championship_date: "April 6".into(),
        },
    }
}
