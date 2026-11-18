import React from 'react';
import { useFitmate } from '../../context/FitmateContext';
import { MUSCLE_DATABASE } from '../../data/muscleDatabase';

export const AnatomicalBody = () => {
  const { selectedMuscle, setSelectedMuscle, bodyView, setBodyView } = useFitmate();

  const handleMuscleClick = (muscleKey) => {
    setSelectedMuscle(muscleKey);
    // If muscle belongs to opposite view, switch smoothly
    const muscleInfo = MUSCLE_DATABASE[muscleKey];
    if (muscleInfo && muscleInfo.view !== bodyView) {
      setBodyView(muscleInfo.view);
    }
  };

  const isZoneActive = (muscleKey) => selectedMuscle === muscleKey;

  return (
    <div className="relative bg-carbonCard rounded-3xl border border-forest p-4 flex flex-col items-center justify-center shadow-inner overflow-hidden">
      {/* Quick Rotate Floating Button */}
      <button
        onClick={() => setBodyView(bodyView === 'front' ? 'back' : 'front')}
        title="Girar cuerpo"
        className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-forest/80 hover:bg-forest text-moss border border-moss/30 flex items-center justify-center shadow-md active:scale-95 transition-all z-10"
      >
        <i className="fa-solid fa-arrows-rotate text-sm"></i>
      </button>

      {/* Selected Muscle Pill Indicator */}
      <div className="absolute top-3 left-3 bg-carbon/90 border border-forest px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
        <span className="w-2 h-2 rounded-full bg-moss animate-pulse"></span>
        <span className="text-xs font-heading font-bold text-cream">
          {MUSCLE_DATABASE[selectedMuscle]?.name || 'Músculo'}
        </span>
      </div>

      {/* FRONT VIEW SVG */}
      <svg
        viewBox="0 0 260 440"
        className={`w-full max-w-[250px] h-auto mt-4 drop-shadow-xl transition-opacity duration-300 ${
          bodyView === 'front' ? 'block' : 'hidden'
        }`}
      >
        {/* Base Silhouette Front */}
        <g className="body-silhouette">
          <path d="M130 14 C117 14 110 24 111 38 C112 50 120 58 130 58 C140 58 148 50 149 38 C150 24 143 14 130 14 Z" />
          <path d="M119 56 L116 74 L144 74 L141 56 Z" />
          <path d="M46 218 L38 238 L44 244 L54 226 Z" />
          <path d="M214 218 L222 238 L216 244 L206 226 Z" />
          <ellipse cx="106" cy="316" rx="11" ry="9" />
          <ellipse cx="154" cy="316" rx="11" ry="9" />
          <path d="M97 406 L90 426 L112 426 L112 406 Z" />
          <path d="M163 406 L170 426 L148 426 L148 406 Z" />
        </g>

        {/* Trapecios Front */}
        <g
          className={`muscle-zone ${isZoneActive('traps') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('traps')}
        >
          <path d="M116 66 L94 80 L114 82 Z" />
          <path d="M144 66 L166 80 L146 82 Z" />
        </g>

        {/* Hombros Front */}
        <g
          className={`muscle-zone ${isZoneActive('shoulders') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('shoulders')}
        >
          <path d="M93 81 C78 83 71 96 72 113 C80 112 88 105 93 94 Z" />
          <path d="M167 81 C182 83 189 96 188 113 C180 112 172 105 167 94 Z" />
        </g>

        {/* Pecho */}
        <g
          className={`muscle-zone ${isZoneActive('chest') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('chest')}
        >
          <path d="M95 83 L128 86 L128 122 C114 124 98 119 93 108 C91 98 92 89 95 83 Z" />
          <path d="M165 83 L132 86 L132 122 C146 124 162 119 167 108 C169 98 168 89 165 83 Z" />
        </g>

        {/* Bíceps */}
        <g
          className={`muscle-zone ${isZoneActive('biceps') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('biceps')}
        >
          <path d="M72 115 C66 128 65 145 71 158 L84 155 C87 141 87 125 83 114 Z" />
          <path d="M188 115 C194 128 195 145 189 158 L176 155 C173 141 173 125 177 114 Z" />
        </g>

        {/* Antebrazos */}
        <g
          className={`muscle-zone ${isZoneActive('forearms') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('forearms')}
        >
          <path d="M69 161 C60 178 53 198 48 216 L57 219 C66 202 76 181 82 159 Z" />
          <path d="M191 161 C200 178 207 198 212 216 L203 219 C194 202 184 181 178 159 Z" />
        </g>

        {/* Abdomen */}
        <g
          className={`muscle-zone ${isZoneActive('abs') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('abs')}
        >
          <rect x="115" y="126" width="13" height="14" rx="3" />
          <rect x="132" y="126" width="13" height="14" rx="3" />
          <rect x="115" y="143" width="13" height="14" rx="3" />
          <rect x="132" y="143" width="13" height="14" rx="3" />
          <rect x="116" y="160" width="12" height="15" rx="3" />
          <rect x="132" y="160" width="12" height="15" rx="3" />
          <path d="M117 178 L128 178 L128 202 L121 196 Z" />
          <path d="M143 178 L132 178 L132 202 L139 196 Z" />
          <path d="M96 122 L112 127 L113 188 L99 178 C96 158 95 138 96 122 Z" />
          <path d="M164 122 L148 127 L147 188 L161 178 C164 158 165 138 164 122 Z" />
        </g>

        {/* Aductores */}
        <g
          className={`muscle-zone ${isZoneActive('adductors') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('adductors')}
        >
          <path d="M126 208 L113 216 L116 286 L125 262 Z" />
          <path d="M134 208 L147 216 L144 286 L135 262 Z" />
        </g>

        {/* Cuádriceps */}
        <g
          className={`muscle-zone ${isZoneActive('quads') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('quads')}
        >
          <path d="M97 192 L112 204 L114 302 L98 304 C89 275 88 232 97 192 Z" />
          <path d="M163 192 L148 204 L146 302 L162 304 C171 275 172 232 163 192 Z" />
        </g>

        {/* Gemelos Front */}
        <g
          className={`muscle-zone ${isZoneActive('calves') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('calves')}
        >
          <path d="M96 326 C89 348 91 376 98 403 L111 403 C114 376 115 348 111 326 Z" />
          <path d="M164 326 C171 348 169 376 162 403 L149 403 C146 376 145 348 149 326 Z" />
        </g>
      </svg>

      {/* BACK VIEW SVG */}
      <svg
        viewBox="0 0 260 440"
        className={`w-full max-w-[250px] h-auto mt-4 drop-shadow-xl transition-opacity duration-300 ${
          bodyView === 'back' ? 'block' : 'hidden'
        }`}
      >
        {/* Base Silhouette Back */}
        <g className="body-silhouette">
          <path d="M130 14 C117 14 110 24 111 38 C112 50 120 56 130 56 C140 56 148 50 149 38 C150 24 143 14 130 14 Z" />
          <path d="M46 218 L38 238 L44 244 L54 226 Z" />
          <path d="M214 218 L222 238 L216 244 L206 226 Z" />
          <path d="M97 406 L90 426 L112 426 L112 406 Z" />
          <path d="M163 406 L170 426 L148 426 L148 406 Z" />
        </g>

        {/* Trapecios Back Diamond */}
        <g
          className={`muscle-zone ${isZoneActive('traps') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('traps')}
        >
          <path d="M119 56 L141 56 L162 82 L130 124 L98 82 Z" />
        </g>

        {/* Hombros Deltoides Posterior */}
        <g
          className={`muscle-zone ${isZoneActive('shoulders') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('shoulders')}
        >
          <path d="M95 82 C78 84 71 97 72 114 C81 112 89 105 95 94 Z" />
          <path d="M165 82 C182 84 189 97 188 114 C179 112 171 105 165 94 Z" />
        </g>

        {/* Espalda Dorsales */}
        <g
          className={`muscle-zone ${isZoneActive('back') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('back')}
        >
          <path d="M96 96 L128 126 L128 166 L104 162 C94 142 91 118 96 96 Z" />
          <path d="M164 96 L132 126 L132 166 L156 162 C166 142 169 118 164 96 Z" />
        </g>

        {/* Tríceps */}
        <g
          className={`muscle-zone ${isZoneActive('triceps') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('triceps')}
        >
          <path d="M72 116 C65 130 65 147 72 160 L85 156 C89 141 88 125 83 115 Z" />
          <path d="M188 116 C195 130 195 147 188 160 L175 156 C171 141 172 125 177 115 Z" />
        </g>

        {/* Antebrazos Back */}
        <g
          className={`muscle-zone ${isZoneActive('forearms') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('forearms')}
        >
          <path d="M69 162 C60 179 53 198 48 216 L57 219 C66 202 76 181 82 160 Z" />
          <path d="M191 162 C200 179 207 198 212 216 L203 219 C194 202 184 181 178 160 Z" />
        </g>

        {/* Espalda Baja / Lumbares */}
        <g
          className={`muscle-zone ${isZoneActive('lower_back') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('lower_back')}
        >
          <path d="M107 166 L128 169 L128 194 L109 190 Z" />
          <path d="M153 166 L132 169 L132 194 L151 190 Z" />
        </g>

        {/* Glúteos */}
        <g
          className={`muscle-zone ${isZoneActive('glutes') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('glutes')}
        >
          <path d="M101 193 L128 197 L128 238 C112 241 96 232 95 215 C94 205 97 198 101 193 Z" />
          <path d="M159 193 L132 197 L132 238 C148 241 164 232 165 215 C166 205 163 198 159 193 Z" />
        </g>

        {/* Isquiotibiales */}
        <g
          className={`muscle-zone ${isZoneActive('hamstrings') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('hamstrings')}
        >
          <path d="M96 236 C108 244 120 244 127 241 L123 308 L99 306 C92 282 91 258 96 236 Z" />
          <path d="M164 236 C152 244 140 244 133 241 L137 308 L161 306 C168 282 169 258 164 236 Z" />
        </g>

        {/* Gemelos Back */}
        <g
          className={`muscle-zone ${isZoneActive('calves') ? 'active' : ''}`}
          onClick={() => handleMuscleClick('calves')}
        >
          <path d="M97 322 C87 346 89 374 98 403 L113 403 C118 374 119 346 114 322 Z" />
          <path d="M163 322 C173 346 171 374 162 403 L147 403 C142 374 141 346 146 322 Z" />
        </g>
      </svg>
    </div>
  );
};
