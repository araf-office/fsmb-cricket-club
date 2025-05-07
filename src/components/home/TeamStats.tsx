// src/components/home/TeamStats.tsx
function TeamStats() {
  // This will eventually be loaded from Google Sheets
  const teamStats = {
    team1: {
      name: "Team Alpha",
      totalPlayers: 18,
      matchesWon: 12,
      topScorer: "John Doe",
      topScorerRuns: 342,
      topWicketTaker: "Alex Smith",
      topWicketTakerWickets: 15
    },
    team2: {
      name: "Team Beta",
      totalPlayers: 18,
      matchesWon: 10,
      topScorer: "Mike Johnson",
      topScorerRuns: 306,
      topWicketTaker: "David Brown",
      topWicketTakerWickets: 14
    },
    season: {
      totalMatches: 22,
      matchesPlayed: 22,
      highestTeamScore: 186,
      lowestTeamScore: 89
    }
  };

  return (
    <section className="team-stats" id="team-stats">
      <h2>Office League Statistics</h2>
      
      <div className="season-stats">
        <h3>Current Season</h3>
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-label">Total Matches</span>
            <span className="stat-value">{teamStats.season.totalMatches}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Matches Played</span>
            <span className="stat-value">{teamStats.season.matchesPlayed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest Team Score</span>
            <span className="stat-value">{teamStats.season.highestTeamScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lowest Team Score</span>
            <span className="stat-value">{teamStats.season.lowestTeamScore}</span>
          </div>
        </div>
      </div>
      
      <div className="teams-comparison">
        <div className="team-column">
          <h3>{teamStats.team1.name}</h3>
          <div className="team-stat">
            <span className="stat-label">Players</span>
            <span className="stat-value">{teamStats.team1.totalPlayers}</span>
          </div>
          <div className="team-stat">
            <span className="stat-label">Matches Won</span>
            <span className="stat-value">{teamStats.team1.matchesWon}</span>
          </div>
          <div className="team-stat">
            <span className="stat-label">Top Scorer</span>
            <span className="stat-value">{teamStats.team1.topScorer} ({teamStats.team1.topScorerRuns})</span>
          </div>
          <div className="team-stat">
            <span className="stat-label">Top Wicket Taker</span>
            <span className="stat-value">{teamStats.team1.topWicketTaker} ({teamStats.team1.topWicketTakerWickets})</span>
          </div>
        </div>
        
        <div className="vs-divider">VS</div>
        
        <div className="team-column">
          <h3>{teamStats.team2.name}</h3>
          <div className="team-stat">
            <span className="stat-label">Players</span>
            <span className="stat-value">{teamStats.team2.totalPlayers}</span>
          </div>
          <div className="team-stat">
            <span className="stat-label">Matches Won</span>
            <span className="stat-value">{teamStats.team2.matchesWon}</span>
          </div>
          <div className="team-stat">
            <span className="stat-label">Top Scorer</span>
            <span className="stat-value">{teamStats.team2.topScorer} ({teamStats.team2.topScorerRuns})</span>
          </div>
          <div className="team-stat">
            <span className="stat-label">Top Wicket Taker</span>
            <span className="stat-value">{teamStats.team2.topWicketTaker} ({teamStats.team2.topWicketTakerWickets})</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeamStats