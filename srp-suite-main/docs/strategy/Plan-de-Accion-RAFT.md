### Plan de Acción: Implementación de la Arquitectura RAFT para la Gobernanza de Seguridad en Minería 5.0

#### 1\. Contexto Estratégico: La Evolución hacia la Seguridad Autónoma

La transición hacia la  **Minería 5.0**  trasciende la mera digitalización; representa un cambio de paradigma donde la síntesis autónoma de conocimiento se convierte en el garante de la vida humana. Para Codelco, la migración de procesos manuales a sistemas basados en la arquitectura  **RAFT (Retrieval Augmented Fine-Tuning)**  es una necesidad crítica dictada por la complejidad de la normativa vigente, como el  **DS 132 (actualización 2024\)** . La variabilidad del criterio humano en la redacción de procedimientos no solo compromete la integridad física de los trabajadores, sino que expone a la Corporación a riesgos legales significativos.RAFT resuelve la inconsistencia técnica al entrenar modelos para discriminar activamente entre la "fuente de verdad" o  **Golden Documents**  (RESSO, ECF, DS 594\) y documentación obsoleta. Bajo este esquema, el sistema no solo recupera datos, sino que razona sobre ellos para asegurar que cada instrucción técnica sea un reflejo exacto de los estándares de seguridad industrial. Esta precisión es fundamental para cumplir con el  **Artículo 603 del DS 132** , el cual exige alertas automáticas ante "Modificaciones Significativas" que puedan alterar los métodos de explotación aprobados. La base de este despliegue requiere una infraestructura de borde (Edge) capaz de sustentar la soberanía de datos y la baja latencia operativa.

#### 2\. Ecosistema Tecnológico: Implementación sobre Cloudflare

Para entornos mineros geográficamente remotos, la infraestructura de  **Cloudflare**  es la opción superior debido a su capacidad de procesamiento en el borde, lo que garantiza que la lógica de seguridad se ejecute con latencia mínima y máxima disponibilidad.

##### Stack Tecnológico Cloudflare para Arquitectura RAFT

Herramienta,Función Arquitectónica en el Plan RAFT  
Cloudflare Workers,Motor de ejecución para la lógica de validación y cálculo dinámico de factores Fj/Fa en tiempo real.  
Cloudflare Workers AI,"Ejecución de modelos LLM para el  Ajuste Fino (Fine-Tuning) , permitiendo al sistema aprender el estilo corporativo y la estructura RESSO."  
Vectorize (Vector DB),"Indexación semántica de normativas frescas para la  Recuperación (Retrieval)  de datos legales actualizados, mitigando el ""olvido catastrófico""."  
Cloudflare R2,"Repositorio centralizado para el almacenamiento de los ""Golden Documents"" (fuentes de verdad absoluta)."  
Cloudflare Zero Trust,Garantiza la  Responsabilidad Legal  vinculando cada procedimiento a la identidad digital única del Validador SIGO autorizado.  
Esta arquitectura híbrida reduce las alucinaciones técnicas del 15-30% (típico en RAG aislado) a estándares de alta criticidad. Mientras el  *Fine-Tuning*  asegura que el modelo hable el lenguaje de Codelco, el  *Retrieval*  garantiza que los datos técnicos (como límites de exposición) sean siempre los vigentes en la Biblioteca del Congreso Nacional.

#### 3\. Procesos Operativos: Del ECF 1 a la Generación de Procedimientos

La estandarización del  **Estándar de Control de Fatalidad N°1 (ECF 1): Aislación y Bloqueo**  es el caso de uso prioritario. En intervenciones complejas, como el mantenimiento en Plantas de Oxígeno, el sistema RAFT opera bajo un flujo de 6 pasos habilitados por IA:

1. **Identificación de Energías:**  Uso de  **Vectorize**  para recuperar el historial específico del equipo y detectar fuentes eléctricas, neumáticas y químicas.  
2. **Notificación:**  Comunicación automática y auditada vía Edge a los actores involucrados.  
3. **Apagado y Aislamiento:**  Verificación de energía cero mediante protocolos técnicos vinculados al manual del fabricante almacenado en R2.  
4. **Bloqueo y Etiquetado (LOTO):**  Registro digital del cumplimiento físico de elementos de bloqueo según el reglamento divisional.  
5. **Verificación de Energía Residual:**  El sistema realiza un  **Cruce Normativo**  con el ECF 12 (Incendio) y el ECF 4 (Liberación descontrolada de energía) para identificar riesgos de liberación remanente en sistemas presurizados.  
6. **Prueba de Arranque:**  Protocolo final de seguridad antes de la intervención física.Para mitigar la  **fatiga cognitiva** , el sistema realiza la  **prepoblación inteligente de los Análisis de Riesgo del Trabajo (ART)** . En lugar de un formulario vacío, el trabajador recibe preguntas de confirmación física (ej. "¿Ha verificado personalmente el bloqueo según el Requisito B2 del ECF 1?"), transformando la ART de un trámite administrativo en un control crítico efectivo.

#### 4\. Marco Normativo y Parámetros Técnicos (DS 594 y DS 132\)

El sistema actúa como un  **Guardrail Automatizado** , asegurando que ningún procedimiento generado ignore los límites legales del DS 594\.

##### Control de Contaminantes Ambientales (Límites Base DS 594\)

Sustancia,LPP Base (Art. 66),Tipo de Límite,Requisito de Control Crítico  
Sílice Cristalina,"$0,08\\ mg/m^3$",Ponderado,Humectación obligatoria (Art. 58 bis).  
Arsénico,"$0,01\\ mg/m^3$",Ponderado,Clasificación A.1 : Exige controles de ingeniería específicos (no solo EPP).  
Formaldehído,"$0,37\\ mg/m^3$",Absoluto,Límite infranqueable en cualquier momento de la jornada.

##### Cálculos Dinámicos en el Edge

El Cloudflare Worker calcula automáticamente los factores de corrección según la faena y el turno, aplicando las fórmulas del Título IV del DS 594:

* **Factor de Reducción de Jornada (Fj):**  Ajuste por exposición prolongada (jornadas  $\> 8$  horas).  $$Fj \= \\frac{8}{h} \\times \\frac{24-h}{16}$$  
* **Factor de Altitud (Fa):**  Ajuste por presión atmosférica ( $P$ ) en faenas sobre 1.000 msnm.  $$Fa \= \\frac{P}{760}$$Esta precisión matemática elimina el error humano en el cálculo de límites ajustados, requisito previo para la validación humana final.

#### 5\. Protocolo de Validación Humana y Gestión del Cambio (SIGO-P-030)

Bajo el modelo  **"Human-in-the-loop"** , Codelco mantiene su rol de  **Empresa Principal**  según la  **Ley 16.744 (Art. 66 bis)** . El sistema RAFT propone, pero la responsabilidad legal recae en el validador humano.

##### Niveles de Aprobación según Magnitud del Riesgo (MR)

Siguiendo el procedimiento  **SIGO-P-030** , la jerarquía de validación se automatiza según el cálculo de  $MR \= Probabilidad \\times Consecuencia$ :

* **Riesgo Alto (MR 32-64):**  Requiere firma digital de la  **Gerencia General de División** . El sistema bloquea el procedimiento si se detectan "Modificaciones Significativas" (Art. 603 DS 132\) sin esta autorización.  
* **Riesgo Medio (MR 8-31):**  Validación técnica obligatoria por un  **Ingeniero de Prevención de Riesgos** .  
* **Riesgo Bajo (MR \< 8):**  Aprobación por el  **Supervisor de Turno**  mediante dispositivo móvil.**Trazabilidad y Auditoría:**  Cada cambio, consulta a los trabajadores y validación queda registrado con marca de tiempo y firma digital, permitiendo auditorías de  **Sernageomin**  bajo los estándares de transparencia y digitalización de la actualización 2024 del DS 132\.

#### 6\. Conclusión y Recursos Necesarios para la Ejecución

La implementación de RAFT sobre Cloudflare permite a Codelco liderar la industria hacia la eliminación de la variabilidad humana en seguridad. Al integrar el cumplimiento legal dinámico con la operatividad en terreno, este plan fortalece la cultura preventiva y la eficiencia operacional.

##### Recursos Requeridos

* **Humanos:**  Arquitectos de Soluciones Cloud, Especialistas en Seguridad y Salud Ocupacional (SSO) y Validadores SIGO certificados.  
* **Técnicos:**  Suscripción Cloudflare Enterprise y curaduría de Datasets de "Golden Documents" (ECF, RESSO, DS 594).  
* **Legales:**  Conexión vía API a la Biblioteca del Congreso Nacional para actualizaciones en tiempo real del DS 132.Codelco reafirma su compromiso con la meta de  **"Cero Fatalidades"** , utilizando la tecnología RAFT como el motor de una seguridad industrial inteligente, auditable e inquebrantable.

