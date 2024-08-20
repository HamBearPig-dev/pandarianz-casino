import React, { useState, useEffect } from 'react';
import { GambaUi, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

const RACE_LENGTH = 10;
const WAGER_OPTIONS = [1, 5, 10, 50, 100];
const RACERS = ['🚗', '🏎️', '🚙', '🚓'];
const BET_ARRAY = [0, 0, 0, 4];

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const [raceProgress, setRaceProgress] = useState(Array(RACERS.length).fill(0));
  const [raceStatus, setRaceStatus] = useState('waiting');
  const [winner, setWinner] = useState(null);
  
  const game = GambaUi.useGame();
  const gamba = useGamba();

  const startRace = async () => {
    try {
      setRaceStatus('racing');
      setRaceProgress(Array(RACERS.length).fill(0));
      setWinner(null);

      const result = await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });

      // Use the result to determine race progression
      for (let i = 0; i < RACE_LENGTH; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setRaceProgress(prev => {
          const newProgress = [...prev];
          for (let j = 0; j < RACERS.length; j++) {
            if (j === result.resultIndex) {
              newProgress[j] = Math.min(newProgress[j] + 2, RACE_LENGTH);
            } else {
              newProgress[j] = Math.min(newProgress[j] + 1, RACE_LENGTH);
            }
          }
          return newProgress;
        });
      }

      setWinner(result.resultIndex);
      setRaceStatus(result.payout > 0 ? 'won' : 'lost');
    } catch (error) {
      console.error('Race error:', error);
      setRaceStatus('error');
    }
  };

  return (
    <>
      <GambaUi.Portal target="screen">
        <div style={{ fontFamily: 'monospace', fontSize: '20px', textAlign: 'center' }}>
          <h2>🏁 Racing Game 🏁</h2>
          {RACERS.map((racer, index) => (
            <div key={index} style={{ margin: '10px 0' }}>
              {racer} {'-'.repeat(raceProgress[index])}
              {raceProgress[index] === RACE_LENGTH && '🏆'}
            </div>
          ))}
          {raceStatus === 'won' && <div style={{ color: 'green' }}>You won! 🎉</div>}
          {raceStatus === 'lost' && <div style={{ color: 'red' }}>You lost! 😢</div>}
        </div>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={setWager}
        />
        <GambaUi.Button 
          disabled={gamba.isPlaying} 
          onClick={() => setSelectedRacer((selectedRacer + 1) % RACERS.length)}
        >
          Selected: {RACERS[selectedRacer]}
        </GambaUi.Button>
        <GambaUi.PlayButton onClick={startRace} disabled={raceStatus === 'racing'}>
          {raceStatus === 'racing' ? 'Racing...' : 'Start Race'}
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  );
};

export default RacingGame;
