export const MUSCLE_DATABASE = {
  chest: {
    name: 'Pecho',
    subtitle: 'Pectoral mayor, superior e inferior',
    view: 'front',
    exercises: [
      {
        id: 'ex_c1',
        name: 'Press de Banca Plano',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Intermedio',
        steps: [
          'Acostate con los ojos debajo de la barra y los pies firmes en el piso.',
          'Retraé los omóplatos y agarrá la barra un poco más ancho que tus hombros.',
          'Bajá la barra de forma controlada hasta tocar el pecho medio y empujá con fuerza.'
        ],
        tip: 'Mantené los codos a unos 45° respecto al torso para cuidar tus hombros.'
      },
      {
        id: 'ex_c2',
        name: 'Press Inclinado con Mancuernas',
        equipment: 'dumbbell',
        eqLabel: 'Mancuernas',
        level: 'Intermedio',
        steps: [
          'Ajustá el banco a 30° o 45° de inclinación.',
          'Subí las mancuernas alineadas con la parte superior de tu pecho.',
          'Bajá estirando bien el pectoral y volvé a subir sin chocar las pesas arriba.'
        ],
        tip: 'Enfocate en empujar con la parte alta del pecho sin despegar la espalda.'
      },
      {
        id: 'ex_c3',
        name: 'Cruce en Polea Alta (Crossover)',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Colocá las poleas en la posición más alta y da un paso adelante.',
          'Con los codos levemente flexionados, juntá las manos frente a tu abdomen.',
          'Volvé despacio sintiendo el estiramiento completo.'
        ],
        tip: 'Apretá el pecho 1 segundo al juntar las manos para máxima congestión.'
      },
      {
        id: 'ex_c4',
        name: 'Flexiones de Brazos (Push-Ups)',
        equipment: 'bodyweight',
        eqLabel: 'Peso Corporal',
        level: 'Principiante',
        steps: [
          'Apoyá las manos al ancho de hombros y mantené el cuerpo en línea recta.',
          'Bajá el pecho hasta casi rozar el suelo.',
          'Empujá el piso hasta extender los brazos por completo.'
        ],
        tip: 'Apretá glúteos y abdomen para que no caiga la cadera.'
      }
    ]
  },
  shoulders: {
    name: 'Hombros',
    subtitle: 'Deltoides anterior, lateral y posterior',
    view: 'front',
    exercises: [
      {
        id: 'ex_s1',
        name: 'Press Militar con Barra',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Intermedio',
        steps: [
          'De pie, apoyá la barra sobre la parte frontal de tus hombros.',
          'Apretá abdomen y glúteos, y empujá la barra verticalmente sobre tu cabeza.',
          'Bajá con control hasta la clavícula.'
        ],
        tip: 'Meté la cabeza ligeramente hacia adelante apenas la barra pasa tu frente.'
      },
      {
        id: 'ex_s2',
        name: 'Vuelos Laterales con Mancuernas',
        equipment: 'dumbbell',
        eqLabel: 'Mancuernas',
        level: 'Principiante',
        steps: [
          'Parate derecho con una mancuerna a cada lado.',
          'Elevá los brazos hacia los costados hasta formar una T con tu cuerpo.',
          'Bajá lentamente sin dejar caer el peso.'
        ],
        tip: 'Liderá el movimiento con los codos, no con las muñecas.'
      },
      {
        id: 'ex_s3',
        name: 'Face Pull en Polea',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Colocá la soga a la altura de tu cara.',
          'Tirá hacia tu frente separando las manos y rotando los hombros hacia atrás.',
          'Controlá el regreso.'
        ],
        tip: 'Clave para el deltoides posterior y una postura saludable.'
      }
    ]
  },
  biceps: {
    name: 'Bíceps',
    subtitle: 'Cabeza larga, corta y braquial',
    view: 'front',
    exercises: [
      {
        id: 'ex_bi1',
        name: 'Curl con Barra Recta o EZ',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Principiante',
        steps: [
          'De pie con los codos pegados a los costados del torso.',
          'Flexioná los codos subiendo la barra sin balancear la espalda.',
          'Bajá en 2 o 3 segundos.'
        ],
        tip: 'Mantené las muñecas firmes y neutras durante todo el recorrido.'
      },
      {
        id: 'ex_bi2',
        name: 'Curl Alternado con Mancuernas',
        equipment: 'dumbbell',
        eqLabel: 'Mancuernas',
        level: 'Principiante',
        steps: [
          'Subí una mancuerna a la vez girando la palma hacia arriba (supinación).',
          'Apretá el bíceps arriba y bajá controlado.'
        ],
        tip: 'Evitá adelantar el codo para no quitarle tensión al bíceps.'
      },
      {
        id: 'ex_bi3',
        name: 'Curl en Polea Baja',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Enganchá la barra corta en la polea inferior.',
          'Realizá el curl manteniendo tensión constante de inicio a fin.'
        ],
        tip: 'Ideal para mantener el músculo bajo tensión incluso en la parte baja.'
      }
    ]
  },
  triceps: {
    name: 'Tríceps',
    subtitle: 'Cabeza larga, lateral y medial',
    view: 'back',
    exercises: [
      {
        id: 'ex_tr1',
        name: 'Extensiones en Polea con Soga',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Fijá los codos a los costados de tu cuerpo.',
          'Empujá la soga hacia abajo abriendo las puntas al final del recorrido.',
          'Subí solo hasta que los antebrazos queden paralelos al piso.'
        ],
        tip: 'No muevas los hombros; el único movimiento ocurre en el codo.'
      },
      {
        id: 'ex_tr2',
        name: 'Press Francés con Barra EZ',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Intermedio',
        steps: [
          'Acostado en banco plano, llevá la barra por detrás de tu frente flexionando codos.',
          'Extendé los brazos con potencia hacia el techo.'
        ],
        tip: 'Mantené los codos apuntando hacia arriba sin abrirlos demasiado.'
      },
      {
        id: 'ex_tr3',
        name: 'Fondos en Paralelas (Dips)',
        equipment: 'bodyweight',
        eqLabel: 'Peso Corporal',
        level: 'Intermedio',
        steps: [
          'Sostenete en las barras paralelas con el torso erguido.',
          'Bajá flexionando los codos hasta 90° y empujá hacia arriba.'
        ],
        tip: 'Cuanto más vertical el torso, más trabaja el tríceps.'
      }
    ]
  },
  forearms: {
    name: 'Antebrazos',
    subtitle: 'Flexores, extensores y fuerza de agarre',
    view: 'front',
    exercises: [
      {
        id: 'ex_fo1',
        name: 'Curl Martillo con Mancuernas',
        equipment: 'dumbbell',
        eqLabel: 'Mancuernas',
        level: 'Principiante',
        steps: [
          'Sujetá las mancuernas con agarre neutro (palmas enfrentadas).',
          'Subí las pesas manteniendo las muñecas rectas.'
        ],
        tip: 'Trabaja tanto el braquiorradial como el bíceps.'
      },
      {
        id: 'ex_fo2',
        name: 'Curl de Muñeca con Barra',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Principiante',
        steps: [
          'Apoyá los antebrazos sobre un banco con las muñecas fuera del borde.',
          'Flexioná las muñecas hacia arriba y bajá controlado.'
        ],
        tip: 'Hacé repeticiones altas (15-20) para estimular bien el antebrazo.'
      }
    ]
  },
  abs: {
    name: 'Abdomen',
    subtitle: 'Recto abdominal, oblicuos y core profundo',
    view: 'front',
    exercises: [
      {
        id: 'ex_ab1',
        name: 'Crunch en Polea Alta',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Intermedio',
        steps: [
          'Arrodillate frente a la polea con la soga detrás de tu cabeza.',
          'Enrollá el torso hacia abajo contrayendo el abdomen (no tires con los brazos).'
        ],
        tip: 'Exhalá todo el aire al bajar para una contracción máxima.'
      },
      {
        id: 'ex_ab2',
        name: 'Elevaciones de Piernas Colgado',
        equipment: 'bodyweight',
        eqLabel: 'Peso Corporal',
        level: 'Intermedio',
        steps: [
          'Colgate de la barra fija con agarre firme.',
          'Subí las rodillas o piernas extendidas llevando la pelvis hacia arriba.'
        ],
        tip: 'Evitá balancearte; controlá la bajada en 2 segundos.'
      },
      {
        id: 'ex_ab3',
        name: 'Plancha Abdominal (Plank)',
        equipment: 'bodyweight',
        eqLabel: 'Peso Corporal',
        level: 'Principiante',
        steps: [
          'Apoyá antebrazos y puntas de los pies.',
          'Mantené abdomen y glúteos contraídos al máximo durante 45-60 seg.'
        ],
        tip: 'Imaginá que querés juntar los codos con la punta de los pies.'
      }
    ]
  },
  traps: {
    name: 'Trapecios',
    subtitle: 'Fibras superiores y medias',
    view: 'front',
    exercises: [
      {
        id: 'ex_tp1',
        name: 'Encogimientos con Mancuernas',
        equipment: 'dumbbell',
        eqLabel: 'Mancuernas',
        level: 'Principiante',
        steps: [
          'De pie con mancuernas pesadas a los lados.',
          'Elevá los hombros directo hacia tus orejas sin rotarlos.',
          'Sostené 1 segundo arriba y bajá.'
        ],
        tip: 'No gires los hombros en círculos; el movimiento es estrictamente vertical.'
      },
      {
        id: 'ex_tp2',
        name: 'Remo al Mentón con Barra',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Intermedio',
        steps: [
          'Agarrá la barra al ancho de tus hombros.',
          'Subí los codos por encima de la línea de las manos hacia el pecho alto.'
        ],
        tip: 'Un agarre un poco más abierto es mucho más cómodo para las muñecas.'
      }
    ]
  },
  back: {
    name: 'Espalda (Dorsales)',
    subtitle: 'Dorsal ancho, redondo mayor y romboides',
    view: 'back',
    exercises: [
      {
        id: 'ex_bk1',
        name: 'Remo con Barra Pendlay / Inclinado',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Intermedio',
        steps: [
          'Incliná el torso a 45° manteniendo la espalda totalmente recta.',
          'Tirá de la barra hacia la parte baja de tu abdomen juntando escápulas.',
          'Bajá controlando el peso.'
        ],
        tip: 'Tirá con los codos hacia atrás, no con los bíceps.'
      },
      {
        id: 'ex_bk2',
        name: 'Jalón al Pecho en Polea',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Sentate firme y agarrá la barra un poco más ancho que los hombros.',
          'Llevá la barra hacia la parte superior del pecho sacando pecho.'
        ],
        tip: 'Pensá en guardar los codos en los bolsillos de tu pantalón.'
      },
      {
        id: 'ex_bk3',
        name: 'Dominadas Pronas (Pull-Ups)',
        equipment: 'bodyweight',
        eqLabel: 'Peso Corporal',
        level: 'Avanzado',
        steps: [
          'Colgate con agarre prono abierto.',
          'Subí hasta pasar la barbilla por encima de la barra.'
        ],
        tip: 'Iniciá el tirón bajando y juntando los hombros.'
      }
    ]
  },
  lower_back: {
    name: 'Espalda Baja (Lumbares)',
    subtitle: 'Erectores espinales y cadena posterior',
    view: 'back',
    exercises: [
      {
        id: 'ex_lb1',
        name: 'Peso Muerto Convencional',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Avanzado',
        steps: [
          'Pies al ancho de cadera, barra pegada a las tibias.',
          'Espalda neutra, pecho alto y empujá el piso con las piernas para subir.'
        ],
        tip: 'La barra debe viajar pegada a tus piernas durante todo el recorrido.'
      },
      {
        id: 'ex_lb2',
        name: 'Hiperextensiones en Banco Romano',
        equipment: 'bodyweight',
        eqLabel: 'Peso Corporal',
        level: 'Principiante',
        steps: [
          'Apoyá la cadera en el soporte y bajá el torso con espalda recta.',
          'Subí hasta alinear el cuerpo sin hiperextender de más.'
        ],
        tip: 'Apretá glúteos y lumbares al llegar a la horizontal.'
      }
    ]
  },
  glutes: {
    name: 'Glúteos',
    subtitle: 'Glúteo mayor y medio',
    view: 'back',
    exercises: [
      {
        id: 'ex_gl1',
        name: 'Hip Thrust con Barra',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Intermedio',
        steps: [
          'Apoyá la parte baja de tus escápulas en un banco.',
          'Colocá la barra sobre la cadera y empujá hacia arriba apretando glúteos 1 seg.'
        ],
        tip: 'Mantené la barbilla pegada al pecho y las tibias verticales arriba.'
      },
      {
        id: 'ex_gl2',
        name: 'Zancadas / Estocadas con Mancuernas',
        equipment: 'dumbbell',
        eqLabel: 'Mancuernas',
        level: 'Intermedio',
        steps: [
          'Da un paso largo hacia adelante y bajá la rodilla trasera cerca del suelo.',
          'Empujá con el talón delantero para volver.'
        ],
        tip: 'Un paso ligeramente más largo enfatiza aún más el glúteo.'
      }
    ]
  },
  quads: {
    name: 'Cuádriceps',
    subtitle: 'Vasto lateral, medial, intermedio y recto femoral',
    view: 'front',
    exercises: [
      {
        id: 'ex_qd1',
        name: 'Sentadilla Libre con Barra',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Avanzado',
        steps: [
          'Barra apoyada sobre los trapecios, pies al ancho de hombros.',
          'Bajá controladamente rompiendo el paralelo de 90° con espalda firme.',
          'Subí empujando fuerte con toda la planta del pie.'
        ],
        tip: 'Alineá siempre tus rodillas con la dirección de la punta de tus pies.'
      },
      {
        id: 'ex_qd2',
        name: 'Prensa de Piernas 45°',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Colocá los pies al medio de la plataforma.',
          'Bajá hasta que las rodillas formen 90° sin despegar el sacro del respaldo.'
        ],
        tip: 'No bloquees por completo las rodillas al extender arriba.'
      },
      {
        id: 'ex_qd3',
        name: 'Sillón de Cuádriceps (Extensiones)',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Ajustá el rodillo sobre tus tobillos.',
          'Extendé las piernas por completo y aguantá 1 segundo arriba.'
        ],
        tip: 'Controlá la bajada en 2 segundos para máxima hipertrofia.'
      }
    ]
  },
  adductors: {
    name: 'Aductores',
    subtitle: 'Cara interna del muslo y estabilidad de cadera',
    view: 'front',
    exercises: [
      {
        id: 'ex_ad1',
        name: 'Máquina de Aductores Sentado',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Sentate con la espalda apoyada y abrí las piernas hasta un estiramiento cómodo.',
          'Juntá las piernas con control y volvé despacio.'
        ],
        tip: 'Evitá golpes bruscos al cerrar o abrir la máquina.'
      },
      {
        id: 'ex_ad2',
        name: 'Sentadilla Sumo con Mancuerna',
        equipment: 'dumbbell',
        eqLabel: 'Mancuernas',
        level: 'Principiante',
        steps: [
          'Separá los pies bastante más ancho que tus hombros con puntas hacia afuera.',
          'Bajá verticalmente sosteniendo una mancuerna pesada al centro.'
        ],
        tip: 'Excelente ejercicio compuesto para aductores y glúteos.'
      }
    ]
  },
  hamstrings: {
    name: 'Isquiotibiales',
    subtitle: 'Bíceps femoral, semitendinoso y semimembranoso',
    view: 'back',
    exercises: [
      {
        id: 'ex_hm1',
        name: 'Peso Muerto Rumano con Barra',
        equipment: 'barbell',
        eqLabel: 'Barra',
        level: 'Intermedio',
        steps: [
          'Con rodillas semi-flexionadas fijas, llevá la cadera hacia atrás.',
          'Bajá la barra pegada a los muslos hasta sentir un estiramiento profundo atrás.',
          'Subí empujando la cadera hacia adelante.'
        ],
        tip: 'El movimiento termina cuando tu cadera deja de ir hacia atrás.'
      },
      {
        id: 'ex_hm2',
        name: 'Camilla Femoral Acostado / Sentado',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Alineá la articulación de tu rodilla con el eje de la máquina.',
          'Flexioná llevando los talones hacia los glúteos.'
        ],
        tip: 'Mantené la cadera pegada al banco durante toda la serie.'
      }
    ]
  },
  calves: {
    name: 'Gemelos',
    subtitle: 'Gastrocnemio y sóleo',
    view: 'back',
    exercises: [
      {
        id: 'ex_cv1',
        name: 'Elevación de Talones de Pie',
        equipment: 'cable',
        eqLabel: 'Polea / Máq.',
        level: 'Principiante',
        steps: [
          'Apoyá la punta de los pies en el escalón y dejá caer los talones abajo.',
          'Subí lo más alto posible en puntas de pie y sostené 1 segundo.'
        ],
        tip: 'Hacé una pausa abajo para eliminar el rebote del tendón de Aquiles.'
      },
      {
        id: 'ex_cv2',
        name: 'Elevación de Talones a Una Pierna',
        equipment: 'dumbbell',
        eqLabel: 'Mancuernas',
        level: 'Principiante',
        steps: [
          'Sostené una mancuerna en una mano y apoyate con la otra para equilibrio.',
          'Subí y bajá con rango completo en un solo pie.'
        ],
        tip: 'Ideal para corregir asimetrías entre pierna izquierda y derecha.'
      }
    ]
  }
};

