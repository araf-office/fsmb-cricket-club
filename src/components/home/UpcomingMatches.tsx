// src/components/home/UpcomingMatches.tsx
import { Link } from 'react-router-dom'

function UpcomingMatches() {
  const matches = [
    {
      id: 1,
      date: '10 May 2025',
      time: '2:00 PM',
      teams: {
        team1: "Team Alpha",
        team2: "Team Beta"
      },
      venue: 'Office Ground',
      captains: {
        team1: "John Doe",
        team2: "Mike Johnson"
      }
    },
    {
      id: 2,
      date: '17 May 2025',
      time: '3:30 PM',
      teams: {
        team1: "Team Beta",
        team2: "Team Alpha"
      },
      venue: 'Office Ground',
      captains: {
        team1: "Mike Johnson",
        team2: "John Doe"
      }
    },
    {
      id: 3,
      date: '24 May 2025',
      time: '1:00 PM',
      teams: {
        team1: "Team Alpha",
        team2: "Team Beta"
      },
      venue: 'Company Park',
      captains: {
        team1: "John Doe",
        team2: "Mike Johnson"
      }
    },
  ]

  return (
    <div className="card upcoming-matches" id="upcoming-matches">
      <div className="card-header">
        <h2>Upcoming Office Matches</h2>
      </div>
      <div className="card-body">
        <div className="matches-list">
          {matches.map(match => (
            <div key={match.id} className="match-item">
              <div className="match-content">
                <div className="match-info">
                  <span className="match-date">{match.date} • {match.time}</span>
                  <span className="match-teams">
                    {match.teams.team1} vs {match.teams.team2}
                  </span>
                  <span className="match-captains">
                    Captains: {match.captains.team1} & {match.captains.team2}
                  </span>
                  <span className="match-venue">{match.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <Link to="#" className="btn btn-sm btn-primary">
          View All Matches
        </Link>
      </div>
    </div>
  )
}

export default UpcomingMatches