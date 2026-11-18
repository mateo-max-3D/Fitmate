import React from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { MUSCLE_DATABASE } from '../../data/muscleDatabase';

export const AnatomicalBody = () => {
  const { selectedMuscle, setSelectedMuscle, bodyView, setBodyView } = useFitmate();

  const handleMuscleClick = (muscleKey) => {
    setSelectedMuscle(muscleKey);
    const muscleInfo = MUSCLE_DATABASE[muscleKey];
    if (muscleInfo && muscleInfo.view !== bodyView && muscleInfo.view !== 'both') {
      setBodyView(muscleInfo.view);
    }
  };

  const isZoneActive = (muscleKey) => selectedMuscle === muscleKey;

  return (
    <div className="relative bg-carbonCard rounded-3xl border border-forest/70 p-4 flex flex-col items-center justify-center shadow-xl overflow-hidden">
      {/* Quick Rotate Floating Button */}
      <button
        onClick={() => setBodyView(bodyView === 'front' ? 'back' : 'front')}
        title="Girar cuerpo"
        className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-forest/80 hover:bg-forest text-moss border border-moss/40 flex items-center justify-center shadow-lg active:scale-95 transition-all z-10"
      >
        <i className="fa-solid fa-arrows-rotate text-sm"></i>
      </button>

      {/* Selected Muscle Pill Indicator */}
      <div className="absolute top-3 left-3 bg-carbon/90 border border-forest/80 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-moss shadow-[0_0_8px_#A5C978]"></span>
        <span className="text-xs font-heading font-extrabold text-cream">
          {MUSCLE_DATABASE[selectedMuscle]?.name || 'Seleccioná un músculo'}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. FRONT VIEW SVG (Realistic Human Anatomy) */}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 260 450"
        className={`w-full max-w-[260px] h-auto mt-6 transition-all duration-300 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
          bodyView === 'front' ? 'block' : 'hidden'
        }`}
      >
        {/* Base Silhouette Front (Head, Neck, Hands, Groin, Knees, Feet) */}
        <g className="body-silhouette">
          {/* Head & Neck */}
          <path d="M130 14 C117 14 110 24 111 38 C112 50 120 58 130 58 C140 58 148 50 149 38 C150 24 143 14 130 14 Z" />
          <path d="M119 56 L116 74 L144 74 L141 56 Z" />
          {/* Hands */}
          <path d="M46 222 L38 244 L44 250 L54 232 Z" />
          <path d="M214 222 L222 244 L216 250 L206 232 Z" />
          {/* Knees */}
          <ellipse cx="106" cy="324" rx="10" ry="8" />
          <ellipse cx="154" cy="324" rx="10" ry="8" />
          {/* Feet */}
          <path d="M97 416 L90 436 L112 436 L112 416 Z" />
          <path d="M163 416 L170 436 L148 436 L148 416 Z" />
          {/* Groin Central V */}
          <path d="M124 204 L136 204 L130 220 Z" />
        </g>

        {/* TRAPECIOS (Front) */}
        <g
          className={`muscle-zone ${isZoneActive('traps') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('traps')}
        >
          <path d="M116 66 L94 80 L114 82 Z" />
          <path d="M144 66 L166 80 L146 82 Z" />
        </g>

        {/* HOMBROS (Front Deltoids) */}
        <g
          className={`muscle-zone ${isZoneActive('shoulders') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('shoulders')}
        >
          <path d="M93 81 C78 83 71 96 72 113 C80 112 88 105 93 94 Z" />
          <path d="M167 81 C182 83 189 96 188 113 C180 112 172 105 167 94 Z" />
        </g>

        {/* PECHO / PECTORALES */}
        <g
          className={`muscle-zone ${isZoneActive('chest') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('chest')}
        >
          <path d="M95 83 L128 86 L128 122 C114 124 98 119 93 108 C91 98 92 89 95 83 Z" />
          <path d="M165 83 L132 86 L132 122 C146 124 162 119 167 108 C169 98 168 89 165 83 Z" />
        </g>

        {/* BÍCEPS */}
        <g
          className={`muscle-zone ${isZoneActive('biceps') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('biceps')}
        >
          <path d="M72 115 C66 128 65 145 71 158 L84 155 C87 141 87 125 83 114 Z" />
          <path d="M188 115 C194 128 195 145 189 158 L176 155 C173 141 173 125 177 114 Z" />
        </g>

        {/* ANTEBRAZOS (Front) */}
        <g
          className={`muscle-zone ${isZoneActive('forearms') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('forearms')}
        >
          <path d="M69 161 C60 178 53 198 48 218 L58 221 C67 203 76 182 82 159 Z" />
          <path d="M191 161 C200 178 207 198 212 218 L202 221 C193 203 184 182 178 159 Z" />
        </g>

        {/* ABDOMEN & OBLICUOS (Defined Six-Pack) */}
        <g
          className={`muscle-zone ${isZoneActive('abs') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('abs')}
        >
          {/* Upper Pack */}
          <rect x="115" y="126" width="13" height="14" rx="3" />
          <rect x="132" y="126" width="13" height="14" rx="3" />
          {/* Middle Pack */}
          <rect x="115" y="143" width="13" height="14" rx="3" />
          <rect x="132" y="143" width="13" height="14" rx="3" />
          {/* Lower Pack */}
          <rect x="116" y="160" width="12" height="15" rx="3" />
          <rect x="132" y="160" width="12" height="15" rx="3" />
          {/* Lower V-abs */}
          <path d="M117 178 L128 178 L128 204 L121 198 Z" />
          <path d="M143 178 L132 178 L132 204 L139 198 Z" />
          {/* Obliques */}
          <path d="M96 122 L112 127 L113 188 L99 178 C96 158 95 138 96 122 Z" />
          <path d="M164 122 L148 127 L147 188 L161 178 C164 158 165 138 164 122 Z" />
        </g>

        {/* ADUCTORES */}
        <g
          className={`muscle-zone ${isZoneActive('adductors') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('adductors')}
        >
          <path d="M126 210 L113 218 L116 294 L125 270 Z" />
          <path d="M134 210 L147 218 L144 294 L135 270 Z" />
        </g>

        {/* CUÁDRICEPS */}
        <g
          className={`muscle-zone ${isZoneActive('quads') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('quads')}
        >
          <path d="M97 192 L112 204 L114 310 L98 312 C89 280 88 235 97 192 Z" />
          <path d="M163 192 L148 204 L146 310 L162 312 C171 280 172 235 163 192 Z" />
        </g>

        {/* GEMELOS (Front) */}
        <g
          className={`muscle-zone ${isZoneActive('calves') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('calves')}
        >
          <path d="M96 334 C89 356 91 386 98 413 L111 413 C114 386 115 356 111 334 Z" />
          <path d="M164 334 C171 356 169 386 162 413 L149 413 C146 386 145 356 149 334 Z" />
        </g>
      </svg>

      {/* ========================================================================= */}
      {/* 2. BACK VIEW SVG (Realistic Human Anatomy) */}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 260 450"
        className={`w-full max-w-[260px] h-auto mt-6 transition-all duration-300 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
          bodyView === 'back' ? 'block' : 'hidden'
        }`}
      >
        {/* Base Silhouette Back (Head, Hands, Feet) */}
        <g className="body-silhouette">
          <path d="M130 14 C117 14 110 24 111 38 C112 50 120 56 130 56 C140 56 148 50 149 38 C150 24 143 14 130 14 Z" />
          <path d="M46 222 L38 244 L44 250 L54 232 Z" />
          <path d="M214 222 L222 244 L216 250 L206 232 Z" />
          <path d="M97 416 L90 436 L112 436 L112 416 Z" />
          <path d="M163 416 L170 436 L148 436 L148 416 Z" />
        </g>

        {/* TRAPECIOS (Back Diamond / Kite) */}
        <g
          className={`muscle-zone ${isZoneActive('traps') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('traps')}
        >
          <path d="M119 56 L141 56 L162 82 L130 124 L98 82 Z" />
        </g>

        {/* DELTOIDES POSTERIOR (Rear Delts) */}
        <g
          className={`muscle-zone ${isZoneActive('shoulders') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('shoulders')}
        >
          <path d="M95 82 C78 84 71 97 72 114 C81 112 89 105 95 94 Z" />
          <path d="M165 82 C182 84 189 97 188 114 C179 112 171 105 165 94 Z" />
        </g>

        {/* ESPALDA / DORSALES (Lats) */}
        <g
          className={`muscle-zone ${isZoneActive('back') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('back')}
        >
          <path d="M96 96 L128 126 L128 166 L104 162 C94 142 91 118 96 96 Z" />
          <path d="M164 96 L132 126 L132 166 L156 162 C166 142 169 118 164 96 Z" />
        </g>

        {/* TRÍCEPS */}
        <g
          className={`muscle-zone ${isZoneActive('triceps') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('triceps')}
        >
          <path d="M72 116 C65 130 65 147 72 160 L85 156 C89 141 88 125 83 115 Z" />
          <path d="M188 116 C195 130 195 147 188 160 L175 156 C171 141 172 125 177 115 Z" />
        </g>

        {/* ANTEBRAZOS (Back) */}
        <g
          className={`muscle-zone ${isZoneActive('forearms') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('forearms')}
        >
          <path d="M69 162 C60 179 53 198 48 218 L58 221 C67 203 76 182 82 160 Z" />
          <path d="M191 162 C200 179 207 198 212 218 L202 221 C193 203 184 182 178 160 Z" />
        </g>

        {/* ESPALDA BAJA / LUMBARES */}
        <g
          className={`muscle-zone ${isZoneActive('lower_back') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('lower_back')}
        >
          <path d="M107 166 L128 169 L128 194 L109 190 Z" />
          <path d="M153 166 L132 169 L132 194 L151 190 Z" />
        </g>

        {/* GLÚTEOS (Dual Defined Curved Buttocks) */}
        <g
          className={`muscle-zone ${isZoneActive('glutes') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('glutes')}
        >
          <path d="M101 193 L128 197 L128 242 C112 245 96 235 95 217 C94 206 97 198 101 193 Z" />
          <path d="M159 193 L132 197 L132 242 C148 245 164 235 165 217 C166 206 163 198 159 193 Z" />
        </g>

        {/* ISQUIOTIBIALES (Hamstrings) */}
        <g
          className={`muscle-zone ${isZoneActive('hamstrings') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('hamstrings')}
        >
          <path d="M96 240 C108 248 120 248 127 245 L123 316 L99 314 C92 288 91 262 96 240 Z" />
          <path d="M164 240 C152 248 140 248 133 245 L137 316 L161 314 C168 288 169 262 164 240 Z" />
        </g>

        {/* GEMELOS (Back Gastrocnemius) */}
        <g
          className={`muscle-zone ${isZoneActive('calves') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('calves')}
        >
          <path d="M97 330 C87 354 89 382 98 413 L113 413 C118 382 119 354 114 330 Z" />
          <path d="M163 330 C173 354 171 382 162 413 L147 413 C142 382 141 354 146 330 Z" />
        </g>
      </svg>

      {/* Helpful Hint */}
      <p className="text-[11px] text-cream/50 mt-3 text-center font-medium">
        Tocá cualquier músculo para ver sus ejercicios específicos.
      </p>
    </div>
  );
};
