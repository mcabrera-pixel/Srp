-- POX Zone Risks Seed Data
-- These are zone-specific risks that complement the general fatality risks


-- Create zone_risks table
CREATE TABLE IF NOT EXISTS zone_risks (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    zone TEXT NOT NULL,
    preventive_controls TEXT,
    mitigating_controls TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_zone_risks_zone ON zone_risks(zone);
CREATE INDEX IF NOT EXISTS idx_zone_risks_code ON zone_risks(code);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc01',
  'RC01',
  'Interacción con energía eléctrica',
  'POX',
  'CCP4: Conexión de equipos portátiles y herramientas eléctricas a tableros eléctricos autorizados.\nCCP6: Segregación y control de acceso a instalaciones eléctricas.',
  'CCM3: Kit de rescate eléctrico.\nCCM4: Respuesta ante urgencia médica.'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc02',
  'RC02',
  'Pérdida de equilibrio trabajo en altura física',
  'POX',
  'CCP1: Capacitación y entrenamiento, trabajo en altura física.\nCCP2: Condición de salud física y mental compatible.\nCCP3: Instalación, operatividad y mantenimiento de plataformas fijas temporales\nCCP5: Control de acceso y segregación.',
  'CCM1: Sistemas personales de detención de caídas.\nCCM2: Respuesta ante urgencia médica.\nCCM3: Respuesta a emergencia en caída o rescate en altura.\nCCM4: Dispositivos de anclaje y sus componentes.'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc03',
  'RC03',
  'Pérdida de control de maniobras de  izaje',
  'POX',
  'CCP1: Sistema de comunicación bidireccional entre operador y  rigger .\nCCP2: Sistemas y dispositivos activos de monitoreo condiciones de operación de equipo de  izaje  o levante\nCCP3: Sistema de estabilidad en equipos para realizar maniobras de  izaje\nCCP4: Operatividad y mantenimiento de aparejos y elementos de  izaje .\nCCP5: Diseño de especificaciones técnicas de equipos de  izaje  móviles y fijos.\nCCP6: Competencias para el personal que participa en maniobras de  izaje .\nCCP7: Planificación y ejecución de maniobra de  izaje .',
  'CCM1: Segregación de área de maniobra de  izaje .\nCCM2: Sistema de parada de emergencia.\nCCM3: Respuesta ante urgencia médica.\nCCM4: Respuesta ante emergencias de  izaje .'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc04',
  'RC04',
  'Pérdida de control de energía hidráulica y neumática a alta presión',
  'POX',
  'CCP1: Identificación, aislación, bloqueo y verificación de energía cero.\nCCP2: Dispositivos de detección, medición, regulación y control de presión en los sistema neumáticos e hidráulicos.\nCCP3: Operación y mantenimiento de herramientas, equipos, maquinaria, instalaciones y sistemas neumáticos e hidráulicos.',
  'CCM1: Dispositivos de contención de energía en instalaciones o sistemas hidráulicos y/o neumáticos.\nCCM2: Segregación y control de acceso en pruebas hidráulicas.\nCCM3: Respuesta ante emergencia y urgencia medica'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc06',
  'RC06',
  'Pérdida de control variables del fuego',
  'POX',
  'CCP1: Identificación y mapeo de áreas críticas. (Almacenamiento, zonas inflamables, etc.).\nCCP2: Planificación, segregación y ejecución de trabajos en caliente (oxicorte, soldadura, corte y desbaste, plasma).\nCCP3: Condiciones de almacenamiento, separación y manipulación de materiales inflamables y combustibles.\nCCP4: Sistemas de detección de temperaturas.\nCCP5: Sistemas y protecciones eléctricas de sobretensión y sobre corriente en equipos e instalaciones eléctricas.\nCCP6: Identificación y mantención de equipos y componentes críticos con potencial de general temperatura de ignición.',
  'CCM1: Dispositivos de alarma y extinción de incendios.\nCCM2: Respuesta ante emergencia en caso de incendio.\nCCM3: Respuesta ante urgencia médica.'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc07',
  'RC07',
  'Pérdida de control del manejo de sustancias químicas peligrosas',
  'POX',
  'CCP1: Análisis de factibilidad del uso y manipulación de sustancias químicas peligrosas en el proceso (incluido el cambio).\nCCP2: Identificación, clasificación (peligrosidad) y señalización.\nCCP3: Diseño y especificaciones técnicas para infraestructura, instalaciones y equipos.\nCCP4: Operación y mantenimiento de infraestructura, instalaciones y equipos\nCCP5: Sistemas de monitoreo y alarmas de variables criticas operacionales y de estabilidad química de las sustancias peligrosas.\nCCP6: Aislar, bloquear, verificar energía cero y drenaje (reubicación de material).\nCCP7: Segregación y control de acceso al área.',
  'CCM1: Dispositivos y/o elementos de contención y confinamiento de derrames/fugas.\nCCM2: Elementos de protección personal para el manejo de sustancias peligrosas.\nCCM3: Respuestas ante emergencias químicas y urgencias médicas.'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc09',
  'RC09',
  'Interacción con partes móviles',
  'POX',
  'CCP1: Guardas y protecciones de equipos y maquinas con sistemas con partes móviles. (Incluye la identificación de áreas/equipos con partes móviles y su mantenimiento).\nCCP2: Des energización, bloqueo y verificación de energía cero del sistema de control de equipos y maquinas con partes móviles.\nCCP3: Competencias para el personal que interactúa con equipos y/o maquinas con sistemas con partes móviles.',
  'CCM1: Sistema de parada de emergencia.\nCCM2: Respuesta ante emergencia y urgencia médica.'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc13',
  'RC13',
  'Pérdida de control de objetos en altura',
  'POX',
  'CCP1: Planificación, análisis y autorización para trabajos en la vertical.\nCCP2: Inspección y limpieza de estructuras que contienen objetos en altura.',
  'CCM1: Señalización y segregación de niveles inferiores para trabajos en la vertical.\nCCM2: Sistemas de protección de equipos, elementos de sujeción y contención para caídas de objetos.\nCCM3: Respuesta ante emergencia y urgencia médica.'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc22',
  'RC22',
  'Perdida de control de estructuras para tránsito y uso de personas',
  'POX',
  'CCP2: Operación, autorización y gestión del cambio para modificar o reparar estructuras para tránsito y uso de personas.\nCCP3: Inspección y mantención de estructuras para tránsito y uso de personas.',
  'CCM1: Señalización y segregación en vanos y/0 daños estructurales.\nCCM2: Respuesta ante emergencia y urgencia médica.'
);

INSERT INTO zone_risks (id, code, name, zone, preventive_controls, mitigating_controls) VALUES (
  'zr-pox-rc27',
  'RC27',
  'Interacción de personas con equipos /vehículos',
  'POX',
  'CCP1: Segregación y control de acceso en áreas de interacción.\nCCP2: Infraestructura vial y peatonal (diseño y especificaciones técnicas, ej. Señalética, iluminación entre otros).\nCCP4: Condición de alerta y prácticas peatonales.\nCCP6: Ropa de alta visibilidad (Fluorescente- retro reflectante).',
  'CCM1: Respuesta ante emergencia y urgencia medica'
);

