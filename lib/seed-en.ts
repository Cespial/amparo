// lib/seed-en.ts — Display-time English translations of the seed narratives.
//
// WHY THIS EXISTS
// The seed casos (lib/seed.ts) carry their narrative fields (servicioNegado,
// diagnostico, hechos, pretension, derechosInvocados…) in Spanish only, because
// the same fields feed prediction/generation pipelines (lib/ai) and the Caso
// type must not change. To keep the respondent (/demandado) and judge (/juez)
// screens fully bilingual without touching that type, we translate the SHOWN
// narrative strings at DISPLAY TIME against this map.
//
// HOW TO USE
//   import { tCaso } from "@/lib/seed-en";
//   import { useLang } from "@/lib/i18n";
//   const { lang } = useLang();
//   <p>{tCaso(caso.servicioNegado, lang)}</p>
//
// The map is keyed by the EXACT Spanish string in lib/seed.ts. If a key is
// missing or lang === "es", tCaso returns the original string untouched.
//
// Glossary (native, Colombian legal-health context):
//   tutela        → tutela (constitutional injunction) — keep the term, gloss once
//   EPS           → EPS (health insurer)
//   demandante    → claimant   ·  demandado → respondent
//   fallo         → ruling
//   ICD-10 codes  → kept verbatim (e.g. "(M16.1)")

import type { Lang } from "./i18n";

/** Spanish-seed-string → native English. Keys must match lib/seed.ts exactly. */
export const TRAD_EN: Record<string, string> = {
  // ── servicioNegado (denied service) ──────────────────────────────────────
  "Artroplastia total de cadera": "Total hip replacement",
  "Pembrolizumab (medicamento oncológico de alto costo)":
    "Pembrolizumab (high-cost oncology drug)",
  "Resonancia magnética cerebral con contraste":
    "Brain MRI with contrast",
  "Traslado en ambulancia medicalizada intermunicipal":
    "Intercity medicalized ambulance transport",
  "Terapias integrales de neurodesarrollo (no incluidas en PBS)":
    "Comprehensive neurodevelopmental therapies (not covered by the benefits plan)",
  "Insulina glargina y tiras reactivas (suministro continuo)":
    "Glargine insulin and test strips (continuous supply)",
  "Cirugía de reconstrucción de ligamento cruzado anterior":
    "Anterior cruciate ligament reconstruction surgery",
  "Ecografía obstétrica de detalle y controles de alto riesgo":
    "Detailed obstetric ultrasound and high-risk prenatal monitoring",
  "Marcapasos cardíaco e implante": "Cardiac pacemaker and implantation",
  "Quimioterapia y red oncológica de referencia":
    "Chemotherapy and access to an oncology referral network",
  "Cirugía de cataratas en ambos ojos": "Cataract surgery in both eyes",
  "Hormona de crecimiento (medicamento NO-PBS)":
    "Growth hormone (drug outside the benefits plan)",
  "Oxígeno domiciliario y concentrador":
    "Home oxygen and oxygen concentrator",
  "Prótesis de miembro inferior y rehabilitación":
    "Lower-limb prosthesis and rehabilitation",
  "Terapias de rehabilitación física (fisioterapia)":
    "Physical rehabilitation therapy (physiotherapy)",
  "Resonancia magnética de columna y valoración por neurocirugía":
    "Spinal MRI and neurosurgical assessment",
  "Rivaroxabán (anticoagulante)": "Rivaroxaban (anticoagulant)",
  "Tomografía por emisión de positrones (PET-CT)":
    "Positron emission tomography (PET-CT)",
  "Cesárea programada por riesgo obstétrico":
    "Scheduled cesarean section for obstetric risk",
  "Pañales y suplementos nutricionales (paciente postrado)":
    "Diapers and nutritional supplements (bedridden patient)",
  "Cirugía de apendicitis (urgencia)": "Appendectomy (emergency)",
  "Diálisis peritoneal e insumos": "Peritoneal dialysis and supplies",
  "Audífonos e implante para hipoacusia":
    "Hearing aids and implant for hearing loss",
  "Medicamento para artritis reumatoide (biológico NO-PBS)":
    "Rheumatoid arthritis drug (biologic outside the benefits plan)",
  "Cirugía de reemplazo de rodilla": "Knee replacement surgery",
  "Tratamiento de fertilidad de baja complejidad":
    "Low-complexity fertility treatment",
  "Medicamento antirretroviral (VIH)": "Antiretroviral drug (HIV)",
  "Traslado intermunicipal para radioterapia":
    "Intercity transport for radiation therapy",
  "Cuidador domiciliario y terapias para parálisis cerebral":
    "Home caregiver and therapies for cerebral palsy",

  // ── diagnostico (diagnosis) — ICD-10 codes kept verbatim ─────────────────
  "Coxartrosis severa de cadera derecha (M16.1)":
    "Severe osteoarthritis of the right hip (M16.1)",
  "Carcinoma pulmonar no microcítico avanzado (C34.9)":
    "Advanced non-small-cell lung carcinoma (C34.9)",
  "Cefalea persistente en estudio (R51) — descartar masa intracraneal":
    "Persistent headache under investigation (R51) — rule out intracranial mass",
  "Insuficiencia renal crónica terminal (N18.6) en hemodiálisis":
    "End-stage chronic kidney failure (N18.6) on hemodialysis",
  "Trastorno del espectro autista (F84.0)":
    "Autism spectrum disorder (F84.0)",
  "Diabetes mellitus tipo 2 insulinodependiente (E11.9)":
    "Insulin-dependent type 2 diabetes mellitus (E11.9)",
  "Ruptura completa de LCA rodilla izquierda (S83.5)":
    "Complete ACL tear of the left knee (S83.5)",
  "Embarazo de alto riesgo (O09.9) con antecedente de preeclampsia":
    "High-risk pregnancy (O09.9) with a history of preeclampsia",
  "Bloqueo auriculoventricular completo (I44.2)":
    "Complete atrioventricular block (I44.2)",
  "Carcinoma de mama (C50.9) en estadio II":
    "Breast carcinoma (C50.9), stage II",
  "Catarata senil bilateral (H25.0)":
    "Bilateral senile cataract (H25.0)",
  "Deficiencia de hormona de crecimiento (E23.0)":
    "Growth hormone deficiency (E23.0)",
  "EPOC severa con insuficiencia respiratoria crónica (J44.9)":
    "Severe COPD with chronic respiratory failure (J44.9)",
  "Amputación transtibial por pie diabético (Z89.5)":
    "Transtibial amputation due to diabetic foot (Z89.5)",
  "Secuelas de accidente cerebrovascular (I69.4)":
    "Sequelae of a stroke (I69.4)",
  "Hernia discal lumbar con radiculopatía (M51.1)":
    "Lumbar disc herniation with radiculopathy (M51.1)",
  "Fibrilación auricular no valvular (I48.0)":
    "Non-valvular atrial fibrillation (I48.0)",
  "Linfoma en estudio de extensión (C85.9)":
    "Lymphoma undergoing staging (C85.9)",
  "Placenta previa (O44.1)": "Placenta previa (O44.1)",
  "Secuelas de ACV con dependencia funcional (I69.3)":
    "Stroke sequelae with functional dependence (I69.3)",
  "Apendicitis aguda (K35.8)": "Acute appendicitis (K35.8)",
  "Enfermedad renal crónica estadio 5 (N18.5)":
    "Stage 5 chronic kidney disease (N18.5)",
  "Hipoacusia neurosensorial bilateral (H90.3)":
    "Bilateral sensorineural hearing loss (H90.3)",
  "Artritis reumatoide seropositiva (M05.9)":
    "Seropositive rheumatoid arthritis (M05.9)",
  "Gonartrosis severa bilateral (M17.0)":
    "Severe bilateral knee osteoarthritis (M17.0)",
  "Infertilidad por factor tubárico (N97.1)":
    "Infertility of tubal origin (N97.1)",
  "Infección por VIH (B24)": "HIV infection (B24)",
  "Carcinoma de cuello uterino (C53.9)":
    "Cervical carcinoma (C53.9)",
  "Parálisis cerebral infantil (G80.9)":
    "Infantile cerebral palsy (G80.9)",

  // ── hechos (facts) ───────────────────────────────────────────────────────
  "La señora Amparo Restrepo, de 68 años, padece coxartrosis severa que le causa dolor incapacitante y limitación funcional. Su médico tratante ordenó una artroplastia total de cadera. La EPS Sura no ha autorizado el procedimiento alegando trámites de pertinencia, pese a la prescripción y al deterioro progresivo de la paciente.":
    "Ms. Amparo Restrepo, 68, suffers from severe hip osteoarthritis that causes disabling pain and limited mobility. Her treating physician ordered a total hip replacement. EPS Sura (her health insurer) has not authorized the procedure, citing pending appropriateness review, despite the prescription and the patient's progressive deterioration.",
  "El paciente, diagnosticado con cáncer de pulmón avanzado, requiere un medicamento biológico de alto costo no financiado con la UPC. La EPS negó el suministro argumentando que no está incluido en el plan de beneficios, pese a la prescripción del oncólogo tratante por Mipres.":
    "The patient, diagnosed with advanced lung cancer, needs a high-cost biologic drug not funded by the capitation payment (UPC). The health insurer denied the supply on the grounds that it is not in the benefits plan, despite the treating oncologist's prescription through Mipres.",
  "La paciente presenta cefalea persistente y su neurólogo ordenó una resonancia magnética cerebral. La EPS ha demorado más de 30 días la autorización del examen, impidiendo el diagnóstico oportuno de su condición.":
    "The patient has a persistent headache and her neurologist ordered a brain MRI. The health insurer has delayed authorization of the scan for more than 30 days, preventing a timely diagnosis of her condition.",
  "El paciente, en hemodiálisis tres veces por semana, vive en zona rural apartada y carece de recursos para trasladarse a la unidad renal en otra ciudad. La EPS negó el transporte, poniendo en riesgo la continuidad de su tratamiento vital.":
    "The patient, on hemodialysis three times a week, lives in a remote rural area and lacks the means to travel to the dialysis unit in another city. The health insurer denied transport, jeopardizing the continuity of his life-sustaining treatment.",
  "La menor requiere un programa integral de terapias de neurodesarrollo (fonoaudiología, ocupacional, ABA) no financiado con la UPC. La EPS negó parte de las terapias. Por tratarse de una niña, se aplica protección reforzada.":
    "The minor needs a comprehensive neurodevelopmental therapy program (speech, occupational, ABA) not funded by the capitation payment (UPC). The health insurer denied part of the therapies. Because she is a child, heightened constitutional protection applies.",
  "La paciente requiere insulina glargina y tiras reactivas de forma continua para controlar su diabetes. La EPS ha entregado el insumo de manera intermitente, generando descompensaciones y riesgo para su salud.":
    "The patient needs glargine insulin and test strips on a continuous basis to control her diabetes. The health insurer has delivered the supplies only intermittently, causing destabilization and risk to her health.",
  "El paciente sufrió ruptura del ligamento cruzado anterior y el ortopedista ordenó cirugía reconstructiva. La EPS ha demorado la autorización más de un mes, prolongando la incapacidad laboral y el dolor.":
    "The patient tore his anterior cruciate ligament and the orthopedic surgeon ordered reconstructive surgery. The health insurer has delayed authorization for more than a month, prolonging his work disability and pain.",
  "La gestante con embarazo de alto riesgo requiere ecografía de detalle y controles especializados. La EPS ha negado la red de atención adecuada, exponiendo a la madre y al feto.":
    "The expectant mother with a high-risk pregnancy needs a detailed ultrasound and specialized monitoring. The health insurer has denied access to an adequate care network, putting both mother and fetus at risk.",
  "El paciente presenta bloqueo cardíaco completo con riesgo de síncope y el cardiólogo ordenó el implante de marcapasos. La EPS condicionó la autorización a trámites de auditoría que han retrasado el procedimiento.":
    "The patient has complete heart block with a risk of syncope, and the cardiologist ordered a pacemaker implant. The health insurer conditioned authorization on audit procedures that have delayed the operation.",
  "La paciente, diagnosticada con cáncer de mama, requiere quimioterapia en una red oncológica que no existe en su municipio. La EPS no ha garantizado el traslado ni la atención en la ciudad de referencia.":
    "The patient, diagnosed with breast cancer, needs chemotherapy through an oncology network that does not exist in her municipality. The health insurer has not arranged transport or care in the referral city.",
  "La paciente adulta mayor presenta pérdida progresiva de visión por cataratas bilaterales. El oftalmólogo ordenó cirugía y la EPS la negó alegando lista de espera, afectando su autonomía y seguridad.":
    "The elderly patient is losing her sight progressively due to bilateral cataracts. The ophthalmologist ordered surgery, and the health insurer denied it citing a waiting list, undermining her independence and safety.",
  "El menor requiere hormona de crecimiento prescrita por endocrinología pediátrica, no financiada con la UPC. La EPS negó el suministro pese a tratarse de un niño con protección reforzada.":
    "The minor needs growth hormone prescribed by pediatric endocrinology and not funded by the capitation payment (UPC). The health insurer denied the supply even though he is a child entitled to heightened protection.",
  "El paciente con EPOC severa requiere oxígeno domiciliario permanente. La EPS suspendió el servicio del concentrador, poniendo en riesgo inminente su vida.":
    "The patient with severe COPD needs permanent home oxygen. The health insurer cut off the oxygen-concentrator service, placing his life in imminent danger.",
  "La paciente perdió su pierna por complicaciones de diabetes y requiere prótesis y rehabilitación para recuperar su movilidad. La EPS negó la prótesis funcional argumentando que no estaba cubierta.":
    "The patient lost her leg to diabetes complications and needs a prosthesis and rehabilitation to regain mobility. The health insurer denied the functional prosthesis, arguing it was not covered.",
  "La paciente, tras un ACV, requiere un plan continuo de fisioterapia para recuperar funcionalidad. La EPS autorizó solo unas pocas sesiones e interrumpió el tratamiento.":
    "After a stroke, the patient needs an ongoing physiotherapy plan to recover function. The health insurer authorized only a few sessions and then cut off the treatment.",
  "El paciente sufre dolor lumbar incapacitante y radiculopatía. El médico ordenó resonancia y valoración por neurocirugía, pero la EPS ha demorado las autorizaciones por más de 45 días.":
    "The patient has disabling lower-back pain and radiculopathy. The physician ordered an MRI and a neurosurgical assessment, but the health insurer has delayed the authorizations for more than 45 days.",
  "La paciente requiere anticoagulante para prevenir un evento embólico. La EPS inicialmente negó el medicamento, pero tras la reclamación de Amparo autorizó el suministro continuo.":
    "The patient needs an anticoagulant to prevent an embolic event. The health insurer initially denied the drug, but after Amparo's claim it authorized continuous supply.",
  "El paciente requería un PET-CT para estadificar su linfoma. La EPS demoró la autorización, pero ante el análisis de riesgo accedió a autorizar el examen sin necesidad de tutela.":
    "The patient needed a PET-CT to stage his lymphoma. The health insurer delayed authorization but, in light of the risk analysis, agreed to authorize the scan without the need for a tutela.",
  "La gestante con placenta previa requería cesárea programada. La EPS resolvió favorablemente la reclamación y garantizó la atención del parto sin litigio.":
    "The expectant mother with placenta previa needed a scheduled cesarean section. The health insurer resolved the claim favorably and arranged delivery care without litigation.",
  "El paciente postrado requería pañales y suplementos nutricionales. La EPS, tras la reclamación, reconoció el deber de garantizar estos insumos como parte del tratamiento integral.":
    "The bedridden patient needed diapers and nutritional supplements. After the claim, the health insurer acknowledged its duty to provide these supplies as part of comprehensive care.",
  "La paciente acudió por dolor abdominal y se diagnosticó apendicitis aguda. Tras la intervención de Amparo, la EPS autorizó de inmediato la cirugía de urgencia.":
    "The patient presented with abdominal pain and was diagnosed with acute appendicitis. After Amparo stepped in, the health insurer immediately authorized the emergency surgery.",
  "El paciente requería diálisis peritoneal continua. La EPS resolvió la reclamación garantizando el tratamiento y los insumos sin acudir a la vía judicial.":
    "The patient needed continuous peritoneal dialysis. The health insurer resolved the claim by securing the treatment and supplies without resorting to the courts.",
  "El menor con hipoacusia requería audífonos para su desarrollo del lenguaje. La EPS, ante la protección reforzada de la niñez, autorizó el dispositivo sin litigio.":
    "The hearing-impaired minor needed hearing aids for his language development. Given the heightened protection owed to children, the health insurer authorized the device without litigation.",
  "La paciente requería un medicamento biológico para controlar su artritis. La EPS autorizó el suministro tras el análisis de costo/riesgo de Amparo, evitando la tutela.":
    "The patient needed a biologic drug to control her arthritis. The health insurer authorized the supply following Amparo's cost/risk analysis, avoiding a tutela.",
  "La paciente adulta mayor con gonartrosis severa requería reemplazo de rodilla. La EPS sostuvo la negación y el juez tuteló su derecho a la salud, ordenando la cirugía.":
    "The elderly patient with severe knee osteoarthritis needed a knee replacement. The health insurer upheld the denial, and the judge granted relief on her right to health, ordering the surgery.",
  "La paciente solicitó tratamiento de fertilidad. El juez analizó el precedente y tuteló parcialmente, ordenando los estudios y manejo de baja complejidad relacionados con su salud.":
    "The patient sought fertility treatment. The judge reviewed the precedent and granted partial relief, ordering the low-complexity tests and care connected to her health.",
  "El paciente con VIH sufrió interrupciones en la entrega de su antirretroviral. El juez tuteló su derecho a la salud y a la vida, ordenando el suministro continuo e ininterrumpido.":
    "The patient with HIV experienced interruptions in the delivery of his antiretroviral medication. The judge granted relief on his rights to health and life, ordering continuous, uninterrupted supply.",
  "La paciente requería traslados frecuentes a otra ciudad para radioterapia y carecía de recursos. El juez tuteló y ordenó a la EPS garantizar el transporte para no interrumpir el tratamiento.":
    "The patient needed frequent trips to another city for radiation therapy and could not afford them. The judge granted relief and ordered the health insurer to provide transport so the treatment would not be interrupted.",
  "El menor con parálisis cerebral requería cuidador domiciliario y terapias integrales. El juez tuteló los derechos de la niñez y ordenó el plan integral de atención.":
    "The minor with cerebral palsy needed a home caregiver and comprehensive therapies. The judge granted relief on the rights of the child and ordered the comprehensive care plan.",

  // ── pretension (claim / relief sought) ───────────────────────────────────
  "Que se ordene a la EPS Sura autorizar y practicar de manera oportuna la artroplastia total de cadera prescrita por el médico tratante, junto con la atención integral del postoperatorio.":
    "That EPS Sura be ordered to authorize and perform, in a timely manner, the total hip replacement prescribed by the treating physician, together with comprehensive postoperative care.",
  "Ordenar el suministro inmediato e ininterrumpido del medicamento prescrito y la atención integral del tratamiento oncológico.":
    "To order the immediate, uninterrupted supply of the prescribed drug and comprehensive care for the oncology treatment.",
  "Ordenar la práctica inmediata de la resonancia magnética y las valoraciones derivadas para definir el diagnóstico y tratamiento.":
    "To order the immediate performance of the MRI and the resulting assessments needed to establish the diagnosis and treatment.",
  "Ordenar el transporte del paciente (y acompañante cuando proceda) hacia la unidad renal para garantizar la continuidad de la hemodiálisis.":
    "To order transport for the patient (and a companion where appropriate) to the dialysis unit so as to ensure continuity of hemodialysis.",
  "Ordenar el tratamiento integral de neurodesarrollo prescrito, incluyendo todas las terapias requeridas para el desarrollo de la menor.":
    "To order the comprehensive neurodevelopmental treatment prescribed, including all therapies needed for the child's development.",
  "Ordenar el suministro continuo e ininterrumpido de la insulina y los insumos prescritos por el médico tratante.":
    "To order the continuous, uninterrupted supply of the insulin and supplies prescribed by the treating physician.",
  "Ordenar la autorización y práctica oportuna de la cirugía reconstructiva de ligamento prescrita.":
    "To order the timely authorization and performance of the prescribed ligament reconstruction surgery.",
  "Ordenar la atención integral del embarazo de alto riesgo, incluyendo ecografías y controles especializados.":
    "To order comprehensive care for the high-risk pregnancy, including ultrasounds and specialized monitoring.",
  "Ordenar el implante oportuno del marcapasos y la atención integral cardiológica derivada.":
    "To order the timely pacemaker implantation and the related comprehensive cardiac care.",
  "Ordenar la atención oncológica integral, incluyendo quimioterapia y el traslado a la red de referencia.":
    "To order comprehensive oncology care, including chemotherapy and transport to the referral network.",
  "Ordenar la práctica oportuna de la cirugía de cataratas en ambos ojos prescrita por el especialista.":
    "To order the timely performance of the cataract surgery in both eyes prescribed by the specialist.",
  "Ordenar el suministro de la hormona de crecimiento y el tratamiento integral prescrito para el menor.":
    "To order the supply of the growth hormone and the comprehensive treatment prescribed for the minor.",
  "Ordenar el restablecimiento inmediato del oxígeno domiciliario y la atención integral respiratoria.":
    "To order the immediate restoration of home oxygen and comprehensive respiratory care.",
  "Ordenar el suministro de la prótesis funcional y el programa de rehabilitación integral.":
    "To order the supply of the functional prosthesis and the comprehensive rehabilitation program.",
  "Ordenar la continuidad del plan de terapias de rehabilitación física prescrito sin interrupciones.":
    "To order the uninterrupted continuation of the prescribed physical rehabilitation therapy plan.",
  "Ordenar la práctica de la resonancia y la valoración por neurocirugía para definir el tratamiento.":
    "To order the MRI and the neurosurgical assessment needed to establish the treatment.",
  "Ordenar el suministro continuo del anticoagulante prescrito por cardiología.":
    "To order the continuous supply of the anticoagulant prescribed by cardiology.",
  "Ordenar la práctica del PET-CT para la estadificación y el tratamiento oncológico.":
    "To order the PET-CT for staging and the oncology treatment.",
  "Ordenar la programación de la cesárea y la atención integral del parto y el recién nacido.":
    "To order the scheduling of the cesarean section and comprehensive care for the delivery and the newborn.",
  "Ordenar el suministro de pañales y suplementos nutricionales prescritos para el paciente postrado.":
    "To order the supply of the diapers and nutritional supplements prescribed for the bedridden patient.",
  "Ordenar la atención quirúrgica inmediata de la apendicitis y el postoperatorio.":
    "To order immediate surgical care for the appendicitis and the postoperative period.",
  "Ordenar la continuidad de la diálisis peritoneal y el suministro de insumos.":
    "To order the continuation of peritoneal dialysis and the supply of materials.",
  "Ordenar el suministro de audífonos y la atención integral auditiva del menor.":
    "To order the supply of hearing aids and comprehensive hearing care for the minor.",
  "Ordenar el suministro continuo del medicamento biológico prescrito por reumatología.":
    "To order the continuous supply of the biologic drug prescribed by rheumatology.",
  "Ordenar a la EPS practicar el reemplazo de rodilla y la atención integral del postoperatorio.":
    "To order the health insurer to perform the knee replacement and provide comprehensive postoperative care.",
  "Ordenar la valoración integral y el manejo de baja complejidad de la infertilidad.":
    "To order a comprehensive assessment and low-complexity management of the infertility.",
  "Ordenar el suministro continuo e ininterrumpido del antirretroviral prescrito.":
    "To order the continuous, uninterrupted supply of the prescribed antiretroviral.",
  "Ordenar el transporte de la paciente y un acompañante hacia el centro de radioterapia.":
    "To order transport for the patient and a companion to the radiation-therapy center.",
  "Ordenar el cuidador domiciliario y el plan integral de terapias para el menor.":
    "To order the home caregiver and the comprehensive therapy plan for the minor.",

  // ── sentencia.tema (case-law topic labels, shown in precedent cards) ──────
  "Reconocimiento de la salud como derecho fundamental autónomo":
    "Recognition of health as a stand-alone fundamental right",
  "Principio de integralidad en salud":
    "Principle of comprehensive healthcare",
  "Continuidad / no interrupción del tratamiento":
    "Continuity / non-interruption of treatment",
  "Cirugías y procedimientos negados o demorados":
    "Denied or delayed surgeries and procedures",
  "Medicamentos NO-POS / NO-PBS y de alto costo":
    "Drugs outside the benefits plan and high-cost drugs",
  "Exámenes diagnósticos demorados": "Delayed diagnostic tests",
  "Transporte, viáticos y acompañante para acceder al servicio":
    "Transport, travel allowance and a companion to access care",
  "Atención de urgencias": "Emergency care",
  "Enfermedades catastróficas / ruinosas":
    "Catastrophic / ruinous illnesses",
  "Salud de niños, niñas y adolescentes (interés superior)":
    "Health of children and adolescents (best interests of the child)",
  "Salud mental": "Mental health",
  "Tratamientos o medicamentos en el exterior":
    "Treatments or medications abroad",

  // ── derechosInvocados (fundamental rights invoked) ───────────────────────
  salud: "health",
  vida: "life",
  "vida digna": "a dignified life",
  "seguridad social": "social security",
  "integridad personal": "personal integrity",
  igualdad: "equality",
  petición: "right to petition",
  "mínimo vital": "minimum subsistence",
  niñez: "rights of the child",
};

/**
 * Display-time translation of a seed narrative string.
 * Returns the native English rendering when lang === "en" and a mapping exists;
 * otherwise returns the original string unchanged (Spanish seed or unmapped).
 */
export function tCaso(texto: string, lang: Lang): string {
  if (lang === "en") {
    const en = TRAD_EN[texto];
    if (en !== undefined) return en;
  }
  return texto;
}
