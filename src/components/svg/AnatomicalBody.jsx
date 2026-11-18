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
    <div className="relative bg-black rounded-3xl border border-forest/60 p-5 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
      {/* Top Controls Bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-2 z-10">
        {/* Selected Muscle Pill */}
        <div className="bg-carbon/90 border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-moss shadow-[0_0_8px_#A5C978]"></span>
          <span className="text-xs font-heading font-extrabold text-white tracking-wide">
            {MUSCLE_DATABASE[selectedMuscle]?.name || 'Seleccioná un músculo'}
          </span>
        </div>

        {/* View Switcher Toggle (Front / Back) */}
        <div className="flex bg-carbon border border-white/20 p-1 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setBodyView('front')}
            className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition-all ${
              bodyView === 'front'
                ? 'bg-moss text-carbon shadow-[0_0_10px_rgba(165,201,120,0.5)]'
                : 'text-cream/60 hover:text-white'
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => setBodyView('back')}
            className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition-all ${
              bodyView === 'back'
                ? 'bg-moss text-carbon shadow-[0_0_10px_rgba(165,201,120,0.5)]'
                : 'text-cream/60 hover:text-white'
            }`}
          >
            Espalda
          </button>
        </div>
      </div>

      {/* SVG WRAPPER CONTAINER */}
      <div className="w-full flex justify-center py-2">
        {/* ========================================================================= */}
        {/* 1. FRONT VIEW SVG (Matching reference image) */}
        {/* ========================================================================= */}
        <svg
          viewBox="0 0 300 500"
          className={`w-full max-w-[270px] h-auto transition-all duration-300 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] ${
            bodyView === 'front' ? 'block' : 'hidden'
          }`}
        >
          {/* Base Neutral Silhouette: Head, Neck Center, Hands, Groin, Knees, Feet */}
          <g className="body-silhouette">
            {/* Head & Cranium */}
            <path d="M150 16 C136 16 128 28 128 42 C128 54 135 63 140 68 L142 76 L158 76 L160 68 C165 63 172 54 172 42 C172 28 164 16 150 16 Z" />
            {/* Left Hand */}
            <path d="M46 250 C40 262 36 274 34 286 C36 288 40 286 42 278 C44 284 48 286 50 280 L52 264 Z" />
            {/* Right Hand */}
            <path d="M254 250 C260 262 264 274 266 286 C264 288 260 286 258 278 C256 284 252 286 250 280 L248 264 Z" />
            {/* Groin / Pelvis Cutout */}
            <path d="M136 244 C140 270 146 292 150 292 C154 292 160 270 164 244 C158 248 142 248 136 244 Z" />
            {/* Knees Cutouts */}
            <path d="M116 376 C112 384 114 394 122 398 C128 394 132 386 130 376 C124 380 120 380 116 376 Z" />
            <path d="M184 376 C188 384 186 394 178 398 C172 394 168 386 170 376 C176 380 180 380 184 376 Z" />
            {/* Feet */}
            <path d="M114 472 L108 492 L132 492 L130 472 Z" />
            <path d="M186 472 L192 492 L168 492 L170 472 Z" />
          </g>

          {/* TRAPECIOS (Front) */}
          <g
            className={`muscle-zone ${isZoneActive('traps') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('traps')}
          >
            <path d="M142 76 L124 94 C122 96 128 100 136 98 L144 76 Z" />
            <path d="M158 76 L176 94 C178 96 172 100 164 98 L156 76 Z" />
          </g>

          {/* HOMBROS / DELTOIDES (Front) */}
          <g
            className={`muscle-zone ${isZoneActive('shoulders') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('shoulders')}
          >
            {/* Left Deltoid */}
            <path d="M122 95 C102 98 88 116 88 134 C94 144 104 146 112 138 C118 126 124 110 122 95 Z" />
            {/* Right Deltoid */}
            <path d="M178 95 C198 98 212 116 212 134 C206 144 196 146 188 138 C182 126 176 110 178 95 Z" />
          </g>

          {/* PECHO / PECTORALES */}
          <g
            className={`muscle-zone ${isZoneActive('chest') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('chest')}
          >
            {/* Left Pec */}
            <path d="M148 100 L124 98 C116 114 116 140 122 148 C132 154 146 150 148 144 Z" />
            {/* Right Pec */}
            <path d="M152 100 L176 98 C184 114 184 140 178 148 C168 154 154 150 152 144 Z" />
          </g>

          {/* BÍCEPS */}
          <g
            className={`muscle-zone ${isZoneActive('biceps') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('biceps')}
          >
            {/* Left Bicep */}
            <path d="M88 136 C80 150 78 174 86 188 C94 186 102 178 104 164 C106 152 102 140 92 136 Z" />
            {/* Right Bicep */}
            <path d="M212 136 C220 150 222 174 214 188 C206 186 198 178 196 164 C194 152 198 140 208 136 Z" />
          </g>

          {/* ANTEBRAZOS (Front) */}
          <g
            className={`muscle-zone ${isZoneActive('forearms') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('forearms')}
          >
            {/* Left Forearm */}
            <path d="M84 190 C72 210 60 234 50 252 L62 254 C74 238 88 214 96 192 Z" />
            {/* Right Forearm */}
            <path d="M216 190 C228 210 240 234 250 252 L238 254 C226 238 212 214 204 192 Z" />
          </g>

          {/* ABDOMINALES & OBLICUOS (Distinct Six-Pack + Linea Alba) */}
          <g
            className={`muscle-zone ${isZoneActive('abs') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('abs')}
          >
            {/* Top Pair */}
            <path d="M136 154 L148 153 L148 168 L134 167 Z" />
            <path d="M164 154 L152 153 L152 168 L166 167 Z" />
            {/* Middle Pair */}
            <path d="M134 171 L148 171 L148 188 L133 186 Z" />
            <path d="M166 171 L152 171 L152 188 L167 186 Z" />
            {/* Lower Pair */}
            <path d="M134 191 L148 191 L148 210 L136 208 Z" />
            <path d="M166 191 L152 191 L152 210 L164 208 Z" />
            {/* Lower V-Taper Cutout */}
            <path d="M138 212 L148 212 L148 240 L138 230 Z" />
            <path d="M162 212 L152 212 L152 240 L162 230 Z" />
            {/* Left Oblique Flank */}
            <path d="M120 156 C114 176 114 202 122 222 C128 226 132 220 132 208 C128 190 126 172 130 158 Z" />
            {/* Right Oblique Flank */}
            <path d="M180 156 C186 176 186 202 178 222 C172 226 168 220 168 208 C172 190 174 172 170 158 Z" />
          </g>

          {/* White Accent Lines for Abs Definition */}
          <g className="body-outline-line pointer-events-none">
            <line x1="150" y1="150" x2="150" y2="242" />
            <line x1="134" y1="170" x2="166" y2="170" />
            <line x1="133" y1="190" x2="167" y2="190" />
            <line x1="135" y1="211" x2="165" y2="211" />
          </g>

          {/* ADUCTORES (Inner Thigh) */}
          <g
            className={`muscle-zone ${isZoneActive('adductors') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('adductors')}
          >
            <path d="M144 288 C140 316 138 344 134 370 L140 372 C146 344 148 316 148 288 Z" />
            <path d="M156 288 C160 316 162 344 166 370 L160 372 C154 344 152 316 152 288 Z" />
          </g>

          {/* CUÁDRICEPS */}
          <g
            className={`muscle-zone ${isZoneActive('quads') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('quads')}
          >
            {/* Left Quad */}
            <path d="M118 238 C108 266 106 312 114 372 C120 376 128 376 132 368 C138 334 140 294 136 244 Z" />
            {/* Right Quad */}
            <path d="M182 238 C192 266 194 312 186 372 C180 376 172 376 168 368 C162 334 160 294 164 244 Z" />
          </g>

          {/* GEMELOS / PANTORRILLAS (Front) */}
          <g
            className={`muscle-zone ${isZoneActive('calves') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('calves')}
          >
            {/* Left Calf */}
            <path d="M118 402 C108 424 108 448 116 470 L128 470 C132 448 132 424 126 402 Z" />
            {/* Right Calf */}
            <path d="M182 402 C192 424 192 448 184 470 L172 470 C168 448 168 424 174 402 Z" />
          </g>
        </svg>

        {/* ========================================================================= */}
        {/* 2. BACK VIEW SVG (Matching reference image) */}
        {/* ========================================================================= */}
        <svg
          viewBox="0 0 300 500"
          className={`w-full max-w-[270px] h-auto transition-all duration-300 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] ${
            bodyView === 'back' ? 'block' : 'hidden'
          }`}
        >
          {/* Base Neutral Silhouette: Head Rear, Hands, Popliteal Fossa, Feet */}
          <g className="body-silhouette">
            {/* Head & Neck Rear */}
            <path d="M150 16 C136 16 128 28 128 42 C128 54 136 64 142 70 L144 76 L156 76 L158 70 C164 64 172 54 172 42 C172 28 164 16 150 16 Z" />
            {/* Left Hand */}
            <path d="M46 250 C40 262 36 274 34 286 C36 288 40 286 42 278 C44 284 48 286 50 280 L52 264 Z" />
            {/* Right Hand */}
            <path d="M254 250 C260 262 264 274 266 286 C264 288 260 286 258 278 C256 284 252 286 250 280 L248 264 Z" />
            {/* Back of Knees (Popliteal Fossa) */}
            <path d="M116 376 C112 384 114 394 122 398 C128 394 132 386 130 376 Z" />
            <path d="M184 376 C188 384 186 394 178 398 C172 394 168 386 170 376 Z" />
            {/* Feet */}
            <path d="M114 472 L108 492 L132 492 L130 472 Z" />
            <path d="M186 472 L192 492 L168 492 L170 472 Z" />
          </g>

          {/* TRAPECIOS (Back Diamond / Kite) */}
          <g
            className={`muscle-zone ${isZoneActive('traps') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('traps')}
          >
            {/* Trapezius Kite from neck down spine */}
            <path d="M144 76 L124 96 L150 148 L176 96 L156 76 Z" />
          </g>

          {/* DELTOIDES POSTERIOR (Rear Delts) */}
          <g
            className={`muscle-zone ${isZoneActive('shoulders') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('shoulders')}
          >
            {/* Left Rear Delt */}
            <path d="M122 96 C102 98 88 116 88 134 C94 144 104 146 114 136 C120 124 124 108 122 96 Z" />
            {/* Right Rear Delt */}
            <path d="M178 96 C198 98 212 116 212 134 C206 144 196 146 186 136 C180 124 176 108 178 96 Z" />
          </g>

          {/* TRÍCEPS (Horseshoe) */}
          <g
            className={`muscle-zone ${isZoneActive('triceps') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('triceps')}
          >
            {/* Left Tricep */}
            <path d="M86 136 C78 152 78 176 86 190 C96 186 102 176 102 162 C104 150 98 138 86 136 Z" />
            {/* Right Tricep */}
            <path d="M214 136 C222 152 222 176 214 190 C204 186 198 176 198 162 C196 150 202 138 214 136 Z" />
          </g>

          {/* ANTEBRAZOS (Back) */}
          <g
            className={`muscle-zone ${isZoneActive('forearms') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('forearms')}
          >
            {/* Left Forearm */}
            <path d="M84 192 C72 212 60 236 50 252 L62 254 C74 238 88 216 96 194 Z" />
            {/* Right Forearm */}
            <path d="M216 192 C228 212 240 236 250 252 L238 254 C226 238 212 216 204 194 Z" />
          </g>

          {/* ESPALDA / DORSALES (Lats Wings) */}
          <g
            className={`muscle-zone ${isZoneActive('back') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('back')}
          >
            {/* Left Lat Wing */}
            <path d="M122 108 L146 150 L146 206 L130 204 C116 182 112 144 122 108 Z" />
            {/* Right Lat Wing */}
            <path d="M178 108 L154 150 L154 206 L170 204 C184 182 188 144 178 108 Z" />
          </g>

          {/* ESPALDA BAJA / LUMBARES (Erector Spinae) */}
          <g
            className={`muscle-zone ${isZoneActive('lower_back') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('lower_back')}
          >
            <path d="M136 206 L148 206 L148 238 L138 236 Z" />
            <path d="M164 206 L152 206 L152 238 L162 236 Z" />
          </g>

          {/* GLÚTEOS (Dual Defined Buttock Spheres) */}
          <g
            className={`muscle-zone ${isZoneActive('glutes') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('glutes')}
          >
            {/* Left Glute */}
            <path d="M148 238 C130 238 112 248 112 272 C112 296 130 306 148 304 Z" />
            {/* Right Glute */}
            <path d="M152 238 C170 238 188 248 188 272 C188 296 170 306 152 304 Z" />
          </g>

          {/* ISQUIOTIBIALES (Hamstrings) */}
          <g
            className={`muscle-zone ${isZoneActive('hamstrings') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('hamstrings')}
          >
            {/* Left Hamstring */}
            <path d="M114 306 C110 330 112 354 116 374 C124 378 132 378 136 370 C144 348 146 326 146 306 Z" />
            {/* Right Hamstring */}
            <path d="M186 306 C190 330 188 354 184 374 C176 378 168 378 164 370 C156 348 154 326 154 306 Z" />
          </g>

          {/* GEMELOS POSTERIORES (Twin Belly Gastrocnemius) */}
          <g
            className={`muscle-zone ${isZoneActive('calves') ? 'active' : ''}`}
            onClick={() => handleMuscleClick('calves')}
          >
            {/* Left Rear Calf Dual Lobes */}
            <path d="M118 402 C108 424 108 448 116 470 L128 470 C132 448 134 424 126 402 Z" />
            {/* Right Rear Calf Dual Lobes */}
            <path d="M182 402 C192 424 192 448 184 470 L172 470 C168 448 166 424 174 402 Z" />
          </g>

          {/* Center Spine & Gluteal Cleft Line */}
          <g className="body-outline-line pointer-events-none">
            <line x1="150" y1="206" x2="150" y2="304" />
          </g>
        </svg>
      </div>

      {/* Muscle Wiki Quick Help Footnote */}
      <p className="text-[11px] text-cream/50 mt-1 text-center font-medium">
        Tocá cualquier grupo muscular para filtrar sus ejercicios específicos.
      </p>
    </div>
  );
};
