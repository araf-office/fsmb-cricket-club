// src/components/home/RecentResults.tsx
import { Link } from 'react-router-dom'

function RecentResults() {
  const results = [
    {
      id: 1,
      date: '28 Apr 2025',
      teams: {
        team1: "Team Alpha",
        team2: "Team Beta"
      },
      scores: {
        team1: "187/6",
        team2: "165/9"
      },
      result: "Team Alpha won by 22 runs",
      manOfMatch: "Alex Smith (Team Alpha)"
    },
    {
      id: 2,
      date: '21 Apr 2025',
      teams: {
        team1: "Team Beta",
        team2: "Team Alpha"
      },
      scores: {
        team1: "145/5",
        team2: "142/8"
      },
      result: "Team Beta won by 5 wickets",
      manOfMatch: "David Brown (Team Beta)"
    },
    {
      id: 3,
      date: '14 Apr 2025',
      teams: {
        team1: "Team Alpha",
        team2: "Team Beta"
      },
      scores: {
        team1: "201/5",
        team2: "165/8"
      },
      result: "Team Alpha won by 36 runs",
      manOfMatch: "John Doe (Team Alpha)"
    },
  ]

  return (
    <div className="card recent-results">
      <div className="card-header">
        <h2>Recent Results</h2>
      </div>
      <div className="card-body">
        <div className="results-list">
          {results.map(match => (
            <div key={match.id} className="result-item">
              <div className="result-content">
                <div className="result-info">
                  <span className="result-date">{match.date}</span>
                  <span className="result-teams">
                    {match.teams.team1} vs {match.teams.team2}
                  </span>
                  <span className="result-score">
                    {match.scores.team1} - {match.scores.team2}
                  </span>
                  <span className="result-outcome">{match.result}</span>
                  <span className="man-of-match">MOM: {match.manOfMatch}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <Link to="#" className="btn btn-sm btn-primary">
          View All Results
        </Link>
      </div>
    </div>
  )
}

export default RecentResults