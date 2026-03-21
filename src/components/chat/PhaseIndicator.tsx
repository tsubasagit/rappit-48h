import { Check } from 'lucide-react';
import { HEARING_PHASES, type HearingPhase } from '../../types';

interface PhaseIndicatorProps {
  currentPhase: HearingPhase;
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = HEARING_PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {HEARING_PHASES.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={phase.key} className="flex items-center">
            {/* ステップ */}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  isCompleted
                    ? 'bg-rabit-600 text-white'
                    : isCurrent
                      ? 'animate-pulse bg-rabit-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </div>
              <span
                className={`hidden whitespace-nowrap text-xs sm:inline ${
                  isCompleted || isCurrent
                    ? 'font-medium text-rabit-700'
                    : 'text-gray-400'
                }`}
              >
                {phase.label}
              </span>
            </div>

            {/* コネクター */}
            {index < HEARING_PHASES.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-4 sm:w-6 ${
                  isCompleted ? 'bg-rabit-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
