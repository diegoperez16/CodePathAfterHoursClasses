import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Swords, RotateCcw, ArrowLeft, Play, X } from 'lucide-react';
import { useBosses } from '../context/BossContext';
import { simulateFight } from '../utils/fightSimulator';
import { updateBossStatsByName, updateSessionStats } from '../lib/supabaseHelpers';
import { isSupabaseEnabled } from '../lib/supabase';
import AnimatedFightLog from '../components/AnimatedFightLog';
import type { BossData, FightResult } from '../types/boss';

interface Match {
  id: string;
  boss1: BossData | null;
  boss2: BossData | null;
  winner: BossData | null;
  round: number;
  position: number;
}

export default function TournamentPage() {
  const { bosses } = useBosses();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Match[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(0);
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [champion, setChampion] = useState<BossData | null>(null);
  const [activeFight, setActiveFight] = useState<{ matchId: string; result: FightResult } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showStory, setShowStory] = useState<BossData | null>(null);

  useEffect(() => {
    if (bosses.length >= 2) {
      initializeTournament();
    }
  }, [bosses]);

  const initializeTournament = () => {
    const shuffled = [...bosses].sort(() => Math.random() - 0.5);
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));
    const rounds = Math.log2(bracketSize);
    
    setTotalRounds(rounds);
    setCurrentRound(1);
    setTournamentComplete(false);
    setChampion(null);

    // Create first round matches
    const firstRoundMatches: Match[] = [];
    for (let i = 0; i < bracketSize / 2; i++) {
      firstRoundMatches.push({
        id: `r1-m${i}`,
        boss1: shuffled[i * 2] || null,
        boss2: shuffled[i * 2 + 1] || null,
        winner: null,
        round: 1,
        position: i
      });
    }

    // Create placeholder matches for future rounds
    const allMatches = [...firstRoundMatches];
    
    for (let round = 2; round <= rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        allMatches.push({
          id: `r${round}-m${i}`,
          boss1: null,
          boss2: null,
          winner: null,
          round,
          position: i
        });
      }
    }

    setTournament(allMatches);
  };

  const simulateMatch = async (matchId: string) => {
    const match = tournament.find(m => m.id === matchId);
    if (!match || !match.boss1 || !match.boss2 || match.winner) return;

    setIsAnimating(true);
    
    // Add delay for dramatic effect
    setTimeout(async () => {
      // Simulate the fight
      const result = simulateFight(match.boss1!, match.boss2!);
      
      // Show the fight animation
      setActiveFight({ matchId, result });
      setIsAnimating(false);
      
      // Update database stats
      if (isSupabaseEnabled()) {
        try {
          await updateBossStatsByName(result.winner.name, true);
          await updateBossStatsByName(result.loser.name, false);
          await updateSessionStats(result.winner.name, true);
          await updateSessionStats(result.loser.name, false);
        } catch (error) {
          console.error('Error updating stats:', error);
        }
      }

      // Update tournament state
      const updatedTournament = tournament.map(m => {
        if (m.id === matchId) {
          return { ...m, winner: result.winner };
        }
        return m;
      });

      // Advance winner to next round
      const nextRoundMatch = updatedTournament.find(
        m => m.round === match.round + 1 && 
        m.position === Math.floor(match.position / 2)
      );

      if (nextRoundMatch) {
        if (match.position % 2 === 0) {
          nextRoundMatch.boss1 = result.winner;
        } else {
          nextRoundMatch.boss2 = result.winner;
        }
      }

      setTournament(updatedTournament);

      // Check if round is complete
      const currentRoundMatches = updatedTournament.filter(m => m.round === currentRound);
      const allMatchesComplete = currentRoundMatches.every(m => 
        m.winner !== null || m.boss1 === null || m.boss2 === null
      );

      if (allMatchesComplete && currentRound < totalRounds) {
        setTimeout(() => setCurrentRound(currentRound + 1), 1000);
      } else if (allMatchesComplete && currentRound === totalRounds) {
        const finalMatch = updatedTournament.find(m => m.round === totalRounds);
        if (finalMatch?.winner) {
          setChampion(finalMatch.winner);
          setTournamentComplete(true);
        }
      }
    }, 500);
  };

  const closeFightModal = () => {
    setActiveFight(null);
  };

  const simulateAllCurrentRound = async () => {
    const currentMatches = tournament.filter(
      m => m.round === currentRound && 
      m.boss1 && m.boss2 && !m.winner
    );

    for (const match of currentMatches) {
      await simulateMatch(match.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getRoundMatches = (round: number) => {
    return tournament.filter(m => m.round === round);
  };

  if (bosses.length < 2) {
    return (
      <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-mono text-emerald-400 mb-2">TOURNAMENT_MODE</h1>
            <p className="text-sm font-mono text-gray-500">Battle bracket system</p>
          </header>

          <div className="bg-gray-950 border border-yellow-500/30 rounded p-8 text-center">
            <h2 className="text-xl font-mono text-yellow-400 mb-4">INSUFFICIENT_COMBATANTS</h2>
            <p className="text-sm font-mono text-gray-400 mb-6">
              Need at least 2 bosses in session to start tournament
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-6 rounded transition-all"
            >
              <ArrowLeft className="w-3 h-3 inline mr-2" />
              ADD_BOSSES
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-emerald-500/30 pb-6">
          <h1 className="text-2xl md:text-4xl font-light tracking-tight text-white mb-1 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-400" />
            <span>Tournament Mode</span>
          </h1>
          <p className="text-sm text-gray-400 font-mono">
            // {bosses.length} combatants • Round {currentRound} of {totalRounds}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-4 rounded transition-all"
            >
              <ArrowLeft className="w-3 h-3 inline mr-2" />
              BACK
            </button>
            <button
              onClick={initializeTournament}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-4 rounded transition-all"
            >
              <RotateCcw className="w-3 h-3 inline mr-2" />
              RESET_BRACKET
            </button>
            {!tournamentComplete && (
              <button
                onClick={simulateAllCurrentRound}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-4 rounded transition-all"
              >
                <Play className="w-3 h-3 inline mr-2" />
                SIMULATE_ROUND
              </button>
            )}
          </div>
        </header>

        {tournamentComplete && champion && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-emerald-500/10 border border-yellow-500/30 rounded p-8 mb-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-mono text-yellow-400 mb-2">CHAMPION</h2>
            <p className="text-2xl font-mono text-white mb-4">{champion.name}</p>
            <p className="text-sm font-mono text-gray-400">
              HP: {champion.hp} | ATK: {champion.attack} | SPD: {champion.speed}
            </p>
          </div>
        )}

        {/* Story Modal */}
        {showStory && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-950 border border-emerald-500/30 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-gray-950 border-b border-emerald-500/30 p-4 flex justify-between items-center">
                <h3 className="text-lg font-mono text-emerald-400">{showStory.name}_STORY</h3>
                <button
                  onClick={() => setShowStory(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-mono">
                    <div>
                      <span className="text-gray-500">HP:</span> <span className="text-cyan-400">{showStory.hp}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ATK:</span> <span className="text-red-400">{showStory.attack}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">SPD:</span> <span className="text-yellow-400">{showStory.speed}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    {showStory.story}
                  </div>
                </div>
                <button
                  onClick={() => setShowStory(null)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-4 rounded transition-all"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fight Modal */}
        {activeFight && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-950 border border-emerald-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-gray-950 border-b border-emerald-500/30 p-4 flex justify-between items-center">
                <h3 className="text-lg font-mono text-emerald-400">BATTLE_LOG</h3>
                <button
                  onClick={closeFightModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <AnimatedFightLog logs={activeFight.result.logs} />
                <div className="mt-6 text-center">
                  <button
                    onClick={closeFightModal}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-6 rounded transition-all"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tournament Bracket */}
        <div className="bg-gray-950 border border-emerald-500/20 rounded p-6">
          <div className="overflow-x-auto">
            <div className="flex gap-8 min-w-max">
              {Array.from({ length: totalRounds }, (_, roundIndex) => {
                const round = roundIndex + 1;
                const matches = getRoundMatches(round);
                
                return (
                  <div key={round} className="flex flex-col gap-4">
                    <h3 className="text-sm font-mono text-emerald-400 mb-2">
                      {round === totalRounds ? 'FINAL' : `ROUND_${round}`}
                    </h3>
                    
                    <div className="flex flex-col justify-around h-full gap-4">
                      {matches.map(match => (
                        <div
                          key={match.id}
                          className={`bg-gray-900 border rounded p-3 w-64 ${
                            match.winner
                              ? 'border-emerald-500/50'
                              : match.boss1 && match.boss2
                              ? 'border-gray-700'
                              : 'border-gray-800'
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Boss 1 */}
                            <div className="flex items-center gap-1">
                              <div
                                className={`flex-1 p-2 rounded text-sm font-mono ${
                                  match.boss1
                                    ? match.winner?.name === match.boss1.name
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-gray-800 text-gray-300'
                                    : 'bg-gray-800/50 text-gray-600'
                                }`}
                              >
                                {match.boss1?.name || 'TBD'}
                              </div>
                              {match.boss1 && (
                                <button
                                  onClick={() => setShowStory(match.boss1!)}
                                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-emerald-400 p-1.5 rounded transition-all"
                                  title="View Story"
                                >
                                  <Trophy className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* VS or Winner indicator */}
                            <div className="text-center text-xs font-mono text-gray-500">
                              {match.winner ? '✓' : 'VS'}
                            </div>

                            {/* Boss 2 */}
                            <div className="flex items-center gap-1">
                              <div
                                className={`flex-1 p-2 rounded text-sm font-mono ${
                                  match.boss2
                                    ? match.winner?.name === match.boss2.name
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-gray-800 text-gray-300'
                                    : 'bg-gray-800/50 text-gray-600'
                                }`}
                              >
                                {match.boss2?.name || 'TBD'}
                              </div>
                              {match.boss2 && (
                                <button
                                  onClick={() => setShowStory(match.boss2!)}
                                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-emerald-400 p-1.5 rounded transition-all"
                                  title="View Story"
                                >
                                  <Trophy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Fight button */}
                          {match.boss1 && match.boss2 && !match.winner && (
                            <button
                              onClick={() => simulateMatch(match.id)}
                              disabled={isAnimating}
                              className={`w-full mt-3 font-mono text-xs py-1 px-3 rounded transition-all ${
                                isAnimating
                                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                  : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                              }`}
                            >
                              <Swords className="w-3 h-3 inline mr-1" />
                              {isAnimating ? 'FIGHTING...' : 'FIGHT'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
