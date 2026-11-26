import React from 'react';
import { EXERCISE_ART } from '../data/exerciseArt';

interface ExerciseArtProps {
  exerciseId?: string | null;
  /** Tailwind size classes for the tile, e.g. "w-12 h-12". */
  className?: string;
  /** Optional accent used to tint the tile; falls back to a neutral tile. */
  accent?: string;
}

/** Pictogram tile showing the movement for an exercise. Renders an empty tile if no art exists. */
export const ExerciseArt: React.FC<ExerciseArtProps> = ({
  exerciseId,
  className = 'w-12 h-12',
  accent,
}) => {
  const svg = exerciseId ? EXERCISE_ART[exerciseId] ?? '' : '';
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-xl border p-1 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: accent ? `${accent}14` : '#161B24',
        borderColor: accent ? `${accent}40` : 'rgba(255,255,255,0.10)',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
