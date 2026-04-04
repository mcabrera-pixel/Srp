-- Auto-generated seed data for fatality risks

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf01',
  'RF01',
  'ENERGÍA ELÉCTRICA',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°01: ENERGÍA ELÉCTRICA',
  'Interacción entre energía eléctrica y las personas. Esto puede ocurrir en actividades de operación, mantención, servicios, proyectos en donde se puedan observar exposición a AT - BT (AT > 1000 V y BT <1000 V CA). • Salas eléctricas, Subestaciones eléctricas, Equipos mineros eléctricos (móviles y semi móviles). • Herramientas eléctricas, líneas de media y alta tensión. • Intervención de equipos y sistemas eléctricos energizados. • Generadores, exposición a CC circuitos, bancos de baterías. • También incluye equipos de fuente de alimentación, cable de transmisión eléctrica y electrodos',
  'Este evento considera como exclusión los siguientes escenarios: • Trabajos en torres de alta tensión con líneas energizadas. (maniobras de operación, mediciones, pruebas y seguimiento de fallas).'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf01-1',
  'RF01',
  'CCP1',
  'Personal acreditado para trabajos eléctricos',
  'Asegurar que toda persona que realice intervenciones en sistemas eléctricos que puedan estar energizados cuente con calificación y autorización formal vigente (Licencia Eléctrica), conforme a los reglamentos corporativos y divisionales.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf01-2',
  'RF01',
  'CCP2',
  'Acceso restringido a equipos e instalaciones eléctricas',
  'Asegurar que únicamente personal autorizado acceda a equipos e instalaciones eléctricas, mediante barreras físicas y sistemas de custodia y/o control de acceso, según aplique.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf01-3',
  'RF01',
  'CCP3',
  'Equipos y herramientas eléctricas verificadas',
  'Asegurar que todo el personal que interviene sistemas eléctricos utilice exclusivamente herramientas e instrumentos que han sido verificados y se encuentran en buenas condiciones.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf01-4',
  'RF01',
  'CCP4',
  'Intervención de equipos en condición eléctricamente segura',
  'Garantizar que antes de intervenir un sistema eléctrico este se encuentre en condición eléctricamente segura, mediante la aplicación de las 5 Reglas de Oro del Electricista.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf02',
  'RF02',
  'TRABAJO EN ALTURA',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°02: TRABAJO EN ALTURA',
  'Actividades con potencial de caída desde una altura igual o superior a 1,8 metros, en actividades, tales como: • Trabajos sobre plataformas fijas temporales (como andamios u otras estructuras similares). • Puntos de trabajo sobre equipos. • Trabajos en altura realizados en edificios e instalaciones. • Uso de plataformas móviles (equipos elevadores de personas, manipuladores telescópicos con canastillo / jaula). • Presencia en bordes desprotegidos a una altura mayor a 1,8 metros. • Trabajos realizados sobre escalas que cuenten con plataforma. • Uso de escalas verticales fijas. • Techos inclinados, cualquiera sea el ángulo de inclinación.',
  '• Caída a distinto nivel por colapso estructural. • Aberturas (vanos) por ausencia de grating y/o barandas. • Trabajos verticales (cuerdas, saneamiento de taludes).'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf02-1',
  'RF02',
  'CCP1',
  'Plataformas y superficies de trabajo estables e íntegras',
  '-Asegurar que las plataformas y superficies de trabajo sean estructuralmente estables, capaces de soportar de manera segura las cargas previstas (personas, equipos, materiales) sin colapsar, cumpliendo todas las normativas aplicables. -Prevenir la falla estructural o la pérdida de estabilidad de las plataformas y superficies durante su uso.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf02-2',
  'RF02',
  'CCP2',
  'Personal acreditado realiza trabajos en altura',
  'Asegurar que toda persona que realiza trabajos en altura cuenta con formación teórico / práctica aprobada, evaluación médica vigente y autorización formal, mediante credencial, para desempeñar tareas específicas en altura física.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf03',
  'RF03',
  'MANIOBRAS DE IZAJE',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°03: MANIOBRAS DE IZAJE',
  'El escenario de este riesgo de fatalidad incluye: • Actividades con cargas elevadas por medios mecánicos que incluyen grúas fijas (puente grúa) o móviles (grúas articuladas, grúas telescópicas, grúas de celosía y camión pluma). • Cargas en movimiento, incluido el transporte, elevaciones que involucran múltiples grúas, transferencia de cargas a otras y colapso de grúas. • Operaciones con herramientas manuales de levante (tecle de cadena o palanca, entre otros). • Operaciones de levante con grúa torre. • Operaciones con equipo extiende tubos (sidebooms).',
  'Este evento considera como exclusión los siguientes escenarios: • Operaciones con manipulador de neumáticos. • Operaciones con porta contenedores. • Uso de elevadores en plantas. • Operaciones de levante con grúas horquillas.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf03-1',
  'RF03',
  'CCP1',
  'Equipos y elementos de izaje conforme a especificaciones técnicas',
  'Prevenir la falla catastrófica de equipos y elementos de izaje, garantizando que su integridad estructural y funcional se mantiene conforme al diseño del fabricante, a través de un programa de inspección, mantenimiento y certificación.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf04',
  'RF04',
  'LIBERACIÓN DESCONTROLADA DE ENERGÍAS',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°04: LIBERACIÓN DESCONTROLADA DE ENERGÍAS',
  'Su alcance comprende actividades tales como: Construcción, instalación, montaje, intervención, ajustes, inspección, mantención, reparación, pruebas, puesta en marcha, operación y modificaciones en herramientas, equipos, maquinaria, instalaciones y sistemas con presencia de estas energías. Este riesgo aplica a todas aquellas energías que pudieran provocar un accidente grave o fatal, tales como: • Potencial • Mecánica • Neumática • Hidráulica • Entre otras.',
  'Se excluyen de este Riesgo las siguientes energías: • Energía Eléctrica • Energía Cinética de Vehículos y Equipos • Energía Química • Energía Calórica • Interacción Mecánica / Atrapamientos • Tiro y Arrastre • Explosivos • Caída de Objetos y Personas • Sistemas de Baja Energía (que no representen riesgo de accidentes graves y/o fatales)'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf04-1',
  'RF04',
  'CCP1',
  'Identificación, aislación, bloqueo y verificación de energía cero',
  'Garantizar que toda intervención en equipos y sistemas se ejecute bajo una condición verificada de energía cero, asegurando la identificación, aislación, bloqueo y control de energias residuales para eliminar la liberación descontrolada de energía.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf05',
  'RF05',
  'CAÍDA DE ROCAS EN MINA RAJO',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°05: CAÍDA DE ROCAS EN MINA RAJO',
  'Caída de rocas individual o masiva en áreas operativas de minería a cielo abierto, que puede resultar en lesiones graves y/o fatales por aplastamiento o impacto a las personas. Escenarios definidos son: • Carguío de mineral en la frente. • Descarga de mineral en stock. • Carguío de estéril. • Descarga de estéril en botaderos. • Limpieza de taludes. • Limpieza o saneamiento de bancos.',
  'Este evento considera como exclusión los siguientes escenarios. • Deslizamiento de rocas en pilas. • Excavaciones para construcción (proyectos). • Tronaduras de producción y cierre. (Fly rock) • Tronadura secundaria.(Fly rock) • Tronaduras civiles (Fly rock) (proyectos) • Inestabilidades a nivel de banco, inter-rampa y talud global. • Caída de rocas desde CAEX durante el transporte de material.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf05-1',
  'RF05',
  'CCP1',
  'MODELO Y MONITOREO GEOTÉCNICO DE ESTABILIDAD DE TALUDES Y BANCOS',
  'Anticipar y controlar la inestabilidad de taludes y bancos, asegurando que el diseño minero se base en un modelo geotécnico válido y que la monitoreo continua de las zonas de riesgo permita tomar decisiones operacionales oportunas para prevenir la caída de rocas'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf06',
  'RF06',
  'INCENDIO',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°06: INCENDIO',
  'Este documento aplica al riesgo de fatalidad de Incendio, presente en los distintos centros de trabajo, plantas de proceso, minas (rajo y subterránea) y proyectos.  Cubre actividades tales como la ejecución de trabajos en caliente (oxicorte, soldadura, corte, desbaste, plasma); el almacenamiento y manipulación de materiales inflamables y combustibles,considerando su separación e incompatibilidades;  la intervención en sistemas eléctricos y sus protecciones (sobretensión y sobrecorriente) en equipos e instalaciones; el uso de equipos con superficies de alta fricción susceptibles de generar aumentos de temperatura  y el mantenimiento  de equipos y componentes críticos con potencial de generar temperatura de ignición.',
  'Se excluyen del Riesgo de Fatalidad: •Manipulación y manejo de explosivos •Actividades de tronadura •Piromanía'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf06-1',
  'RF06',
  'CCP1',
  'MAPEO DE ÁREAS CRÍTICAS Y GESTIÓN DE MATERIALES COMBUSTIBLES E INFLAMABLES',
  'Establecer las zonas, áreas e instalaciones más susceptibles a la generación de un incendio, asegurando que la organización y el personal las conozcan.  Prevenir incendios controlando el combustible, asegurando que todos los materiales inflamables y combustibles sean almacenados en lugares autorizados, segregados según su compatibilidad, y manipulados de acuerdo a procedimientos para evitar su contacto con fuentes de ignición.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf07',
  'RF07',
  'SUSTANCIAS PELIGROSAS',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°07: SUSTANCIAS PELIGROSAS',
  'Aplica para todas las divisiones y empresas contratistas, las cuales, dentro de sus procesos operativos, existan actividades/tareas con interacción del personal en la carga/descarga, transporte, almacenamiento, muestreo y dosificación, asi como el uso/manipulación de sustancias químicas peligrosas. Se incluyen sustancias químicas peligrosas y sus derivados en los procesos de transporte, almacenamiento, utilización o generación a granel, a presión atmosférica o contenedores presurizados, pudiendo ser estas inflamables, corrosivas, asfixiantes, tóxicas y/o comburentes como: •Sulfhidrato de socio NASH •Cloro - Gas Cloro (Cl₂g) •Ácido Clorhídrico •Ácido Sulfúrico - Ácido Sulfhídrico •Peróxido de Hidrógeno •Hidróxido de Sodio •Ácido Nítrico •Nitrógeno •Óxido de calcio (Cal viva) •Dióxido de Carbono CO₂ (Líquido criogénico) •Sustancias Inflamables. •Sustancias Corrosivas. Sustancias Toxicas  Sustancias envasadas en bodegas, almacenamientos menores o áreas de procesos Las sustancias que no aparezcan en el listado anterior requieren de un análisis para evaluar la necesidad de crear un nuevo Control Crítico Específico. No se permiten almacenamientos irregulares o almacenamientos “temporales” en areas de proceso que no cumplan con los requisitos definidos en presente riesgo de fatalidad. En el caso de las sustancias intermedias no aisladas de los procesos, deberan cumplir con los controles CCP1 y CCP2, de tal manera de asegurar el que las actividades con estas sustancias cumplan con la señalización y otros controles básicos, para evitar desviaciones en su manipulación.',
  'Sustancias Químicas NO peligrosas •Residuos Peligrosos •Sustancias biológicas  •Sustancias explosivas reguladas en el RF08.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf07-1',
  'RF07',
  'CCP1',
  'DISEÑO, OPERACIÓN Y SEÑALIZACIÓN EN PROCESOS DE MANEJO Y ALMACENAMIENTO DE SUSTANCIAS QUÍMICAS PELIGROSAS',
  'Prevenir la liberación (o descontrol) de sustancias químicas peligrosas, asegurando que toda infraestructura de almacenamiento (estanques, bodegas), líneas de transporte y puntos de muestreo / dosificación cumplan con un diseño técnico que contemple la contención/monitoreo preventivo de derrames/fugas, la ventilación de gases, probables generaciones de incendios, señalización de todos los elementos y la segregación según compatibilidad química.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf08',
  'RF08',
  'TRONADURAS Y EXPLOSIVOS',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°08: TRONADURAS Y EXPLOSIVOS',
  'Su alcance abarca la gestión integral del ciclo de vida de los explosivos: almacenamiento, transporte, manipulación, carguío, conexión, iniciación de tronadura y verificación post-tronadura, manteniendo control permanente sobre explosivos y accesorios en cada etapa del proceso. Este riesgo comprende operaciones con explosivos que pueden generar eventos fatales y/o daños materiales tales como: •Iniciación no controlada y/o espontánea de explosivos o agentes de fragmentación •Iniciación no controlada y/o espontánea de tiros quedados o rezagados •Proyección no controlada de fragmentos de roca (Fly Rocks)En el caso de las sustancias intermedias no aisladas de los procesos, deberan cumplir con los  controles CCP1 y CCP2, de tal manera de asegurar el que las actividades con estas sustancias cumplan con la señalización y otros controles básicos, para evitar desviaciones en su manipulación.',
  'Para el carguío automatizado, serán las Divisiones o Proyectos, quienes deberán elaborar un análisis de riesgo, en el cual definan los controles críticos aplicables de este Riesgo de Fatalidad.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf08-1',
  'RF08',
  'CCP1',
  'PERSONAL ACREDITADO EN
TRONADURA Y MANEJO DE
EXPLOSIVOS',
  'Garantizar que todo el personal que diseña, planifica, manipula, transporta y ejecuta maniobras de tronadura posea las competencias, acreditaciones y autorizaciones vigentes requeridas por la ley y la organización, para asegurar una ejecución experta y sin errores del proceso.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf08-2',
  'RF08',
  'CCP2',
  'TRONADURAS EJECUTADAS
SEGÚN DISEÑO APROBADO',
  'Garantizar que cada tronadura seejecutesiguiendoestrictamente los parámetros definidos en un diseño de ingeniería (conceptual, modelo de bloques), el cual debe estar basado en información geológica, geotécnica y operacional actualizada, y cuyo cumplimiento en terreno sea verificado mediante un riguroso proceso de aseguramiento de calidad (QA/QC).'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf09',
  'RF09',
  'PARTES MÓVILES',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°09: PARTES MÓVILES',
  'Actividades de operación, mantenimiento, construcción y puesta en marcha donde se utilicen máquinas y equipos con sistemas con partes móviles como por ejemplo: rodillos, despegadora de cátodos, correas transportadoras, tambores de aglomeración, equipos con ejes expuestos, conjunto de poleas, sistemas de transmisión por engranajes, sistemas de transmisión por cadenas, sistemas motrices de equipos, entre otros.',
  'Se excluyen los trabajos con: •Herramientas manuales portátiles. •Herramientas eléctricas fijas.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf09-1',
  'RF09',
  'CCP1',
  'GUARDAS Y PROTECCIONES EN
PARTES MÓVILES',
  'Impedir el contacto con partes móviles, asegurando que todos los equipos y maquinarias cuenten con guardas y protecciones fijas o móviles, diseñadas, instaladas y mantenidas para interponer una barrera física efectiva entre las personas y el peligro.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf10',
  'RF10',
  'VEHÍCULOS',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N° 10: VEHÍCULOS',
  'Este riesgo de fatalidad aplica a vehículos que transitan a través de carreteras, tales como: • Camionetas. • Vehículos de transporte de personal como: • Buses • Mini buses • Vehículos de transporte de carga.',
  'Este evento considera como exclusión los siguientes escenarios: • Operación de equipos mineros • Equipos autónomos • Interacciones de vehículos , equipos móviles con peatones e el sitio, incluido el subterráneo'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf10-1',
  'RF10',
  'CCP1',
  'CONDUCTOR ACREDITADO Y APTO FÍSICA Y
PSICOLÓGICAMENTE',
  'Garantizar que toda persona que conduzca un vehículo cuente con las competencias técnicas, una autorización interna vigente para el tipo de vehículo específico y una condición física y psicológica compatible con la tarea de conducir, asegurando así un estado de alerta y una conducta segura en todo momento.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf10-2',
  'RF10',
  'CCP2',
  'INTEGRIDAD MECÁNICA Y
SISTEMAS ACTIVOS DEL VEHÍCULO',
  'Asegurar que todos los vehículos que transitan en faena cumplan con las especificaciones técnicas definidas para el entorno minero y que sus sistemas de seguridad activos (frenos, dirección, neumáticos) sean mantenidos e inspeccionados sistemáticamente para garantizar su correcto funcionamiento en todo momento.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf10-3',
  'RF10',
  'CCP3',
  'SISTEMA INTEGRAL DE ASISTENCIA Y
MONITOREO A LA CONDUCCIÓN',
  'Garantizar que la conducción de vehículos sea monitoreada y regulada permanentemente a través de sistemas tecnológicos y reglas operacionales claras, gestionando activamente la velocidad, la fatiga del conductor y las condiciones del entorno para prevenir la pérdida de control.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf10-4',
  'RF10',
  'CCP4',
  'INFRAESTRUCTURA VIAL
CONFORME A DISEÑO',
  'Asegurar que todas las rutas y caminos utilizados en la faena sean diseñados, construidos y mantenidos de acuerdo a estándares definidos, garantizando que elementos como bermas, pretiles, señalización y lechos de frenado estén siempre operativos para prevenir la pérdida de control o mitigar sus consecuencias.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf11',
  'RF11',
  'ESPACIOS CONFINADOS',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N° 11: ESPACIOS CONFINADOS',
  'Espacio confinado es cualquier espacio con aberturas limitadas de entrada y salida, no diseñados para ocupación continua por uno o más trabajadores, donde se encuentran con una ventilación natural desfavorable en el que pueden acumularse contaminantes tóxicos, inflamables, explosivos o que tengan una atmósfera deficiente o enriquecida de oxígeno. Aplica para: • Espacios confinados abiertos: Son aquellos que son abiertos en su parte superior y de una profundidad tal que dificulta su ventilación natural, donde se incluyen depósitos abiertos, cubas o cubetas, cubas de desengrasado, pozos abiertos, fosos, bóvedas, cámaras, alcantarillas, zanjas, etc. de más de 1,2 m de profundidad. • Espacios confinados cerrados: Es cualquier espacio, recinto o estructura donde exista un potencial de deficiencia o enriquecimiento de oxígeno generado por partículas, ambientes con atmósferas explosivas, inflamables o tóxicas, y que además tiene la particularidad de que su ingreso se debe hacer a través de un manhole. Según clasificación: • Clase A: Corresponde a aquellos donde existe un inminente peligro para la vida. Generalmente riesgos atmosféricos como gases inflamables y/o tóxicos, deficiencia o enriquecimiento de oxígeno y también riesgos de atrapamiento y/o de derrumbe. • Clase B: En esta clase, los peligros potenciales dentro del espacio confinado pueden ser de lesiones y/o enfermedades que no comprometen la vida ni la salud y pueden controlarse a través de los elementos de protección personal. • Clase C: Esta categoría corresponde a los espacios confinados donde las situaciones de peligro no exigen modificaciones especiales a los procedimientos normales de trabajo o el uso de EPP. Escenarios definidos: Procesos productivos en: Planta ácido, planta oxígeno, planta de gases, fundición, tostación de minerales y plantas concentradoras (incluye molinos, celdas de flotación, chutes), plantas de chancado (primario, secundario, terciario), plantas SX-EW, incluir acidificación o aglomeración y, en general, aquellos procesos donde existan instalaciones o equipos que cumplan con la definición de espacios confinados. También se consideran las excavaciones de más de 1,2 metros de profundidad.',
  'Este evento considera como exclusión los siguientes escenarios. 1.- Desarrollo minero subterráneo. 2.- Convertidor (Reactor). 3.- Domos y stock pile.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf11-1',
  'RF11',
  'CCP1',
  'SISTEMA DE INGRESO
CONTROLADO Y VIGILADO',
  'Prevenir el ingreso no autorizado o en condiciones inseguras a un espacio confinado, asegurando que toda entrada sea autorizada mediante un permiso de trabajo, con la presencia permanente de un vigía y un sistema de comunicación efectivo.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf12',
  'RF12',
  'METALES FUNDIDOS',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N° 12: METALES FUNDIDOS',
  'Interacción de metal fundidos en tareas realizadas en procesos de fusión, conversión, refino moldeo y transporte, donde los trabajadores estén expuestos a derrames, proyección de material fundido, temperaturas elevadas:',
  'Este evento considera como exclusión los siguientes escenarios: • Liberación descontrolada de vapor a alta presión en los procesos de fundición. • Explosiones en Planta de oxígeno. • Exposición de gases SO3 y SO2 en Planta de ácido. • Exposición a ácido sulfúrico. • Procesos de almacenamiento y secado de concentrado de cobre.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf12-1',
  'RF12',
  'CCP1',
  'PERSONAL CAPACITADO PARA
TRABAJAR CON METALES FUNDIDOS',
  'Todo trabajador que desarrolle actividades en contacto directo con metales fundidos debe estar capacitado y autorizado por la administración, demostrando conocimiento en los riesgos y controles de los equipos y procesos específicos del área.'
);
INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf12-2',
  'RF12',
  'CCP2',
  'CONTROL DE ACCESO A ÁREAS DE
FUNDICIÓN',
  'Prevenir la exposición de personal a la línea de fuego del metal fundido, asegurando que todo ingreso y tránsito por las naves de fundición sea estrictamente controlado, comunicado y autorizado, siguiendo un plan de tránsito establecido.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf13',
  'RF13',
  'CAÍDA DE OBJETOS',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N° 13: CAÍDA DE OBJETOS',
  'Caídas de objetos en áreas de proyectos y/o operaciones mineras, esto incluye procesos, plantas y área mina que puede resultar en lesiones graves y/o fatales a personas. Escenarios definidos son: •Trabajos en la vertical sobre andamios y/o estructuras en etapa de construcción y mantención. • Procesos productivos en plantas concentradoras, incluye molinos, cajones, correas, electroimán, etc. • Procesos productivos exterior planta. Ejemplos: aglomeradores, chancadores, alimentador, harneros, correas, etc. • Almacenamiento en bodega. • Procesos productivos en fundiciones: almacenamiento y transporte de concentrado, área fusión, conversión, refino y moldeo, planta de gases, planta de ácidos y planta de oxígeno. • Proceso de Inspección y mantención a equipos donde material pueda deprenderse desde equipos de carguío y transporte.',
  'Este evento considera como exclusión los siguientes escenarios: • Operaciones con aeronaves no tripuladas (drones). • Operaciones con aeronaves tripuladas. • Caídas de rocas por falla de terreno. • Procesos productivos en minería subterráneas. • Falla o colapso estructural. • Perforación en sondaje. • Proyección de rocas en tronaduras.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf13-1',
  'RF13',
  'CCP1',
  'ESTRUCTURAS Y MATERIALES
SUJETOS EN ALTURA',
  'Prevenir la caída de objetos por fallas estructurales, almacenamiento incorrecto o condiciones ambientales, asegurando que todas las estructuras en altura sean inspeccionadas, los materiales acopiados estén asegurados y se controlen los trabajos ante vibraciones o clima adverso.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf14',
  'RF14',
  'OPERACIÓN FERROVIARIA',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°14: OPERACIÓN FERROVIARIA',
  'Este riesgo de fatalidad aplica a las siguientes actividades: •Transporte de mineral vía ferroviaria •Transporte de pasajeros vía ferroviaria •Servicios de apoyo a operaciones ferroviarias •Mantención vías •Mantención de equipos ferroviarios',
  'Este riesgo de fatalidad considera como exclusión los siguientes escenarios: Movimientos ferroviarios fuera de instalaciones de la empresa (áreas de terceros, vías públicas).'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf14-1',
  'RF14',
  'CCP1',
  'PERSONAL FERROVIARIO
ACREDITADO',
  'Garantizar que toda persona que interactúe directamente con la operación ferroviaria posea las competencias técnicas, la aptitud física/psicológica requerida y la autorización formal y vigente para ingresar y ejecutar sus funciones en la vía férrea, previniendo errores operacionales por falta de capacitación o ingreso no controlado'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf16',
  'RF16',
  'VACIADOS, CHIMENEAS, PIQUES',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°16: VACIADOS, CHIMENEAS, PIQUES',
  'Actividades que se realizan en áreas de desarrollo verticales e inclinadas en las que exista el potencial de caída de personas y/o equipos mineros e industriales, que pueden resultar en lesiones graves y/o fatales hacia las personas, estos incluyen: • Uso de escalas verticales fijas. • Operación de piques y chimeneas • Caídas de equipos y personas. • Construcción, operación y mantenimiento.',
  'Este evento considera como exclusión los siguientes escenarios: • Montaje de plataforma • Túneles horizontales.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf16-1',
  'RF16',
  'CCP1',
  'CONDICIONES SEGURAS DE
INGRESO Y OPERACIÓN EN PIQUES Y CHIMENEAS',
  'Prevenir caídas, asfixia o atrapamiento, asegurando que el ingreso y operación en puntos de vaciado, piques y chimeneas se realice únicamente tras aislar y bloquear energías, monitorear la atmósfera, y controlar el acceso con segregación y señalización adecuadas.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf18',
  'RF18',
  'PLANCHONEO',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°18: PLANCHONEO',
  'Aplica a operaciones subterráneas de: • Desarrollo • Construcción de túneles, galerías. • Operaciones de producción, limpieza. • Acuñadura, saneamiento, fortificación. • Mantenimiento',
  'Este evento considera como exclusión los siguientes escenarios. •  Hundimiento significativo (estructural) o falla geotécnica mayor (colapso). •  Estallido de rocas'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf18-1',
  'RF18',
  'CCP1',
  'ESTABILIZACIÓN CONFORME A DISEÑO GEOTÉCNICO (SOSTENIMIENTO, FORTIFICACIÓN Y ACUÑADURA',
  'Controlar el desprendimiento de rocas y prevenir colapsos, asegurando que toda excavación subterránea sea estabilizada oportunamente mediante acuñadura y fortificación conforme a un diseño geotécnico validado'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf20',
  'RF20',
  'SÍLICE',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°20: SÍLICE',
  'Mantener las fuentes de emisión de polvo respirable con sílice con controles disponibles y eficientes para evitar concentraciones ambientales peligrosas y cumplir con el LPP. La implementación del RF 20 aplica en los procesos de Codelco y de empresas contratistas que presenten trabajadores expuestos a sílice, definidos cualitativa cuantitativamente.  Las empresas que no presentan exposición a sílice en sus trabajadores pero que ingresan a procesos donde existe exposición, deberán adoptar las medidas de control que les apliquen de dichos procesos, como: Protección respiratoria efectiva y presurización de cabinas. Fuentes de emisión: • Equipo o punto desde donde se genera o emite polvo respirable con contenido de sílice al ambiente de trabajo y que tiene el potencial de impactar la exposición a sílice del personal. • (Ejemplos de fuentes de emisión: extracción, traspasos, puntos de carguío, puntos devaciado-carguío, acopios, stock pile, chancadores, harneros, correas en puntos de transferencias, etc.)',
  'Se excluye: • Emisión de polvo por tronaduras en mina rajo/superficie. • Procesos de aseo no industrial.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf20-1',
  'RF20',
  'CCP1',
  'SUPRESIÓN, HUMECTACIÓN,
COLECCIÓN Y CONFINAMIENTO DE FUENTES',
  'Garantizar el control efectivo de polvo respirable con contenido de sílice en las fuentes críticas de emisión, mediante sistemas de supresión, humectación, colección y confinamiento, asegurando eficiencias operativas superiores al 90% del estándar de diseño definido por el proyecto o fabricante del equipo o sistema.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf21',
  'RF21',
  'ARSÉNICO',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°21: ARSÉNICO',
  'Mantener las fuentes de emisión de arsénico soluble con controles disponibles y eficientes para evitar concentraciones ambientales peligrosas y cumplir con el LPP y disponer de controles higiénico sanitarios, administrativos y de protección personal para prevenir que cuando el trabajador entre en contacto con el agente, este no ingrese a su organismo en una cantidad tal que su índice de tolerancia biológica supere el límite respectivo (LTB). La implementación del RF 21 aplica en los procesos de Codelco y de empresas contratistas que presenten trabajadores expuestos a arsénico según lo establece el PNS de Metales y Metaloides. Fuentes de emisión: • Equipo o unidades de proceso desde donde se emite arsénico soluble como polvo ensuspensión, material húmedo (borra) o como solución arsenical (líquida) donde el trabajador puede exponerse al agente por vía inhalatoria, digestiva o dérmica. (Ejemplos de fuentes de emisión: Hornos de fundición, Precipitador Electrostático de polvos metalúrgicos, sistema de carguío y filtros de plantas de tratamiento de efluentes, barros anódicos en celdas de refinación, sistema de carguío de polvos  metalúrgicos, acopios de residuos arsenicales en botaderos de disposición final, etc.). •Pérdida de Control de la Exposición a Arsénico Aquella que se produce en procesos, áreas o tareas en presencia de arsénico soluble y se superan los límites permisibles ambientales y/o se mantiene contacto directo con el agente',
  'Se excluyen los procesos donde el arsénico se encuentre en compuestos insolubles (ejemplo: enargita, arsenopirita), por lo tanto, no se considera el arsénico presente en los procesos de extracción (Mina Rajo o subterránea), los procesos de concentración desulfuros (Molienda, Flotación, Espesamiento, Filtrado y Relaves) y los procesos minero metalúrgicos de obtención de cobre a partir de sus compuestos oxidados (Chancados, Apilamiento y regado, Electro obtención). También se excluye la exposición a gas arsina (AsH3), el cual es una agente de generación accidental y potencialmente fatal a bajas concentraciones que debe ser abordado en el marco del RF11: Espacios Confinados.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf21-1',
  'RF21',
  'CCP1',
  'FUENTES DE ARSÉNICO
IDENTIFICADAS, SEGREGADAS Y
RESTRINGIDAS',
  'Garantizar que todas las fuentes de emisión de compuestos solubles de arsénico sean identificadas, caracterizadas respecto del riesgo de exposición, señalizada y segregada el área donde se encuentran y de acceso restringido para asegurar que solo personal autorizado respecto del control de la exposición, interactúe con las fuentes de arsénico peligroso.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf23',
  'RF23',
  'COLAPSO ESTRUCTURAL DEL MACIZO ROCOSO',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°23: COLAPSO ESTRUCTURAL DEL MACIZO ROCOSO',
  'Este riesgo considera la pérdida del control de estabilidad y soporte subterráneo en forma lenta y progresiva, generando un desprendimiento y/o colapso mayor de rocas en labores mineras, resultando en lesiones graves/fatales por atrapamiento, impacto o aplastamiento. Daños en la infraestructura y continuidad operacional. Algunos ejemplos son: Desprendimientos o deformaciones lo suficientemente grandes como para evitar el acceso físico a una excavación subterránea o una unidad.',
  'Las exclusiones son: • Desprendimientos en rajo/superficie. • Desprendimientos de rocas subterráneos inducidos por sísmicos (Estallidos de rocas). • Desprendimientos de rocas individuales (PCERS).'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf23-1',
  'RF23',
  'CCP1',
  'SISTEMA DE MONITOREO
GEOMECÁNICO Y CONTROL DE LA PRODUCCIÓN',
  'Anticipar un colapso estructural del macizo rocoso, mediante el monitoreo continuo de la deformación y sismicidad del macizo rocoso y el control de la secuencia de extracción, para generar alertas tempranas y tomar decisiones operacionales que eviten la inestabilidad.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf24',
  'RF24',
  'TALUDES',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°24: TALUDES',
  'Deslizamiento de material a nivel de talud interrampa y global en áreas operativas de minería a cielo abierto, que puede resultar en lesiones graves y/o fatales hacia las personas. Escenarios definidos son: • Inestabilidad a nivel de banco, interrampa y al nivel global • Limpieza de taludes. • Limpieza o saneamiento de bancos. • Movimiento de tierra (rampa, pretiles, etc.). • Traslado de camionetas y equipos interior mina. • Actividades de marcación y/o supervisión en terreno. • Actividades de tronadura. • Actividades de perforación, operación y mantención que contemplen instalaciones y/o posturas prolongadas',
  'Este evento considera como exclusión los siguientes escenarios. • Excavaciones para construcción (obras civiles en proyectos). • Carguío de mineral en la frente no rematada. • Inestabilidades en pilas y botaderos de lixiviación • Caída de rocas. • Interacción de rajo con cavidades. • Interacción de rajo con cráter.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf24-1',
  'RF24',
  'CCP1',
  'SISTEMA INTEGRAL DE
CARACTERIZACIÓN, MODELAMIENTO Y
MONITOREO GEOTÉCNICO',
  'Asegurar la estabilidad de los taludes, mediante un sistema integrado que garantice la captura de datos, la actualización de modelos, el análisis de estabilidad y el monitoreo continuo para anticipar inestabilidades y tomar decisiones operacionales informadas.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf25',
  'RF25',
  'EQUIPOS MINEROS E INDUSTRIALES',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°25: EQUIPOS MINEROS E INDUSTRIALES',
  'Equipos de acuñadura - Equipos de Fortificación - Cargador LHD (Carga, acarreo y descarga) Camión de extracción mina subterránea - Roboshot (Equipo shotcrete) - Camión articulado mina subterránea - Camión de extracción mina rajo (CAEX) - Camión aljibe mina - Pala electromecánica, diésel o hidráulica - Rotopala - Equipos de perforación (sobre orugas o neumáticos) - Camión de transporte de escoria - Camión mixer (minería subterránea) - Camión fábrica (explosivos) - Camión + tractor tapa pozos - Tractor sobre neumáticos (wheeldozer) - Tractor sobre orugas (bulldozer) - Equipos de sondaje (orugas o neumáticos) - Equipos cargador frontal carguío y/o de apoyo - Equipos excavadoras - Equipos retroexcavadoras - Equipos minicargador - Equipos minicargador tapa pozos- Equipos motoniveladora - Equipos manipulador de neumáticos - Equipos manipulador telescópico- Equipo rodillo compactador-aplanador - Pavimentadora - Grúa horquilla (montacarga) - Grúa telescópica - Camión barre nieve - Camión barredor - Camión aspirador (supersucker) - Otros cuya operación requiera licencia tipo D o casos especiales que determine cada Centro de Trabajo',
  'Este evento considera como exclusión los siguientes escenarios. • Operaciones ferroviarias dentro y fuera de los recintos industriales de CODELCO • Equipos o maquinarias no autopropulsados • Equipos alza-hombres (man-lift) • Grúa articulada • Grúa torre • Pérdida de control Vehículos livianos • Pérdida de control maniobras de izaje • Equipos autónomo'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf25-1',
  'RF25',
  'CCP1',
  'CONDUCTOR ACREDITADO Y APTO FÍSICA Y PSICOLÓGICAMENTE',
  'Garantizar que toda persona que opere equipos mineros esté debidamente formada, evaluada,   por la organización y con aptitud médica vigente, reduciendo el riesgo de errores operacionales derivados de fallas humanas o falta de capacitación.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf27',
  'RF27',
  'ATROPELLO',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°27: ATROPELLO',
  'Aplica a todas las operaciones, instalaciones y recintos industriales de Codelco, donde exista interacción directa entre personas con equipos/vehículos. Ejemplos: • Bodegas (Operación logística y gestión de insumos y materiales) • Plantas de Molibdeno (Operación en traslado de maxi sacos) • Patios de manejo de cátodos o ánodos. Otros',
  'Este evento considera como exclusión los siguientes escenarios. • Pérdida de control maniobras de izaje. • Pérdida de control de vehículos livianos • Pérdida de control de equipos mineros e industriales • Pérdida de control de equipos autónomos'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf27-1',
  'RF27',
  'CCP1',
  'RUTAS VEHICULARES Y PEATONALES CONFORME A DISEÑO (SEGREGACIÓN,
SEÑALÉTICA, ILUMINACIÓN)',
  'Asegurar que toda la infraestructura vial y peatonal destinada al tránsito de equipos y personas, como por ejemplo: rampas, caminos, accesos, senderos, segregaciones, iluminación, semáforos, refugios, otros, esté implementada para mantener en control las condiciones de circulación y visibilidad en todas las zonas de interacción.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf28',
  'RF28',
  'CAVING',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°28: CAVING',
  'Aplica a la Pérdida del Control de Caving durante la explotación subterránea. En este escenario se puede producir la colgadura de un área determinada por falta de propagación de la cavidad.  Posteriormente la pérdida de control puede generar un desprendimiento y/o colapso súbito de material, resultando en un efecto de compresión de aire generando lesiones graves o fatales a personas y daños en la infraestructura y equipos mineros',
  'Se excluyen los siguientes escenarios: • Pérdida de control estructural de macizo rocoso. • Pérdida de control estabilidad de roca subterránea. • Fallas inducidas por sísmica. Pérdida instantánea de la estabilidad de excavaciones en labores subterráneas.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf28-1',
  'RF28',
  'CCP1',
  'SISTEMA DE MONITOREO
GEOMECÁNICO Y CONTROL DE LA PRODUCCIÓN',
  'Prevenir la formación de colgaduras y el crecimiento descontrolado del airgap, mediante el monitoreo continuo de la sismicidad y la subsidencia del macizo rocoso, y el control estricto de la secuencia y velocidad de extracción.'
);

INSERT INTO fatality_risks (id, code, name, full_title, scope, exclusions) VALUES (
  'fr-rf29',
  'RF29',
  'CAÍDA A CUERPOS LÍQUIDOS',
  'LISTADO DE AUTODIAGNÓSTICO RIESGO DE FATALIDAD N°29: CAÍDA A CUERPOS LÍQUIDOS',
  '• Plantas de procesamiento de mineral  • Espesadores  • Estanques y piscinas de almacenamiento de aguas industriales • Canaletas de conducción y alimentación de relaves al interior de plantas concentradoras • Tranques de relaves  • Embalses de agua y de relave',
  'Este evento considera como exclusión los siguientes escenarios: • Estanques y piscinas que almacenan SUSPEL, SX-EW.'
);

INSERT INTO fatality_risk_controls (id, risk_code, control_code, control_name, objective) VALUES (
  'frc-rf29-1',
  'RF29',
  'CCP1',
  'ZONAS DE CUERPOS LÍQUIDOS
AISLADAS Y SEÑALIZADAS',
  'Garantizar que todos los cuerpos de líquidos contenidos estén físicamente segregados mediante cierres perimetrales efectivos y señalización de advertencia visible, aplicando un estricto protocolo de control de acceso para prevenir el ingreso no autorizado de personas o equipos a zonas de riesgo de caída.'
);

