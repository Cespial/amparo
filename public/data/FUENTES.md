# Fuentes de datos — Atlas de Amparo

Tres datasets para el mapa coroplético MapLibre. Claves por **código DANE de departamento (2 dígitos, string)**: `"05"`=Antioquia, `"11"`=Bogotá, `"76"`=Valle del Cauca, etc. (33 departamentos).

Regenerar todo: `python3 scripts/build-datasets.py` (requiere internet; consulta Socrata/datos.gov.co).

---

## 1. `tutelas-por-departamento.json` — **REAL**

Tutelas de salud por departamento, año 2023.

- **Fuente:** Corte Constitucional de Colombia — dataset *"Derechos demandados en las tutelas radicadas en la Corte Constitucional"*.
- **Origen:** datos.gov.co (Socrata), **resource id `xkyt-k6pk`**.
- **URL de datos:** `https://www.datos.gov.co/resource/xkyt-k6pk.json`
- **Consulta usada:** `?$select=cod_dpto,count(*)&$where=derecho='SALUD' AND anio='2023'&$group=cod_dpto`
- **Año:** 2023.
- **Validación:** el total nacional calculado (197.737) coincide al **99,99 %** con la cifra oficial publicada por la **Defensoría del Pueblo** en su informe *"La Tutela y los Derechos a la Salud y a la Seguridad Social 2023"* (197.765 tutelas de salud en 2023 — tercera cifra más alta en 32 años).
  - Comunicado Defensoría: https://www.defensoria.gov.co/-/con-197.765-registros-cifra-de-tutelas-por-salud-en-2023-fue-la-tercera-m%C3%A1s-alta-en-32-a%C3%B1os-defensor%C3%ADa
  - Informe (repositorio): https://repositorio.defensoria.gov.co/items/42d74830-83a8-4efb-bf7c-3bc832476a9a/full
- **Total nacional tutelas (todas las materias) 2023:** 633.475 (cifra oficial Defensoría).
- **Población:** proyecciones **DANE 2023** (base CNPV 2018) — cifras oficiales embebidas en `scripts/build-datasets.py`. `tasa_por_10k = tutelas_salud / poblacion * 10000`.

Estructura: `{ fuente, anio, total_nacional_tutelas_salud, total_nacional_tutelas_todas_materias, nota, datos: { "05": { departamento, tutelas_salud, poblacion, tasa_por_10k }, ... } }`

**Estado: REAL** (conteo oficial por departamento; población oficial DANE).

---

## 2. `ips-salud.json` — **REAL (conteo por departamento, sin coordenadas)**

Instituciones Prestadoras de Servicios de Salud (IPS) por departamento.

- **Fuente:** Registro Especial de Prestadores de Servicios de Salud (**REPS**) — Ministerio de Salud y Protección Social.
- **Origen:** datos.gov.co (Socrata), **resource id `c36g-9fc2`** (*"Registro Especial de Prestadores y Sedes de Servicios de Salud"*, 76.821 registros, corte marzo 2026).
- **URL de datos:** `https://www.datos.gov.co/resource/c36g-9fc2.json`
- **Consultas usadas:**
  - IPS por depto y naturaleza: `?$select=substring(codigoprestador,1,2) as dane,naturalezajuridica,count(*)&$where=claseprestador='Instituciones Prestadoras de Servicios de Salud - IPS'&$group=dane,naturalezajuridica`
  - Total prestadores por depto: `?$select=substring(codigoprestador,1,2) as dane,count(*)&$group=dane`
- **Código DANE:** derivado de los 2 primeros dígitos de `codigoprestador` (verificado: coincide 1:1 con `departamentoprestadordesc` para los 33 departamentos).
- **`ips_total`:** solo clase *"Instituciones Prestadoras de Servicios de Salud - IPS"* (19.551 a nivel nacional).
- **`prestadores_total`:** TODAS las clases del REPS (IPS + Profesionales Independientes + Transporte Especial + Objeto Social Diferente) = 76.821 a nivel nacional.
- **Sin coordenadas:** el dataset nacional REPS **no** trae latitud/longitud. Por eso se entrega como **conteo por departamento**, no como puntos. (Existen datasets georreferenciados regionales sueltos, p.ej. Valle/Guajira `7r2w-27jm`, pero no hay un dataset nacional geocodificado limpio.)

Estructura: `{ fuente, url_dataset, fecha_corte, nota, datos: { "05": { departamento, ips_total, ips_publicas, ips_privadas, ips_mixtas, prestadores_total }, ... } }`

**Estado: REAL** (conteo, no puntos).

---

## 3. `colombia-departamentos.geojson` — **REAL (geometría) + cod_dane añadido**

Límites de los 33 departamentos de Colombia.

- **Origen:** GeoJSON preexistente en el repo (props originales: `DPTO`, `NOMBRE_DPT`, `AREA`, `PERIMETER`, `HECTARES`). Geometrías tipo Polygon.
- **Mejora aplicada por `scripts/build-datasets.py`:** a cada feature se le añadió:
  - `cod_dane`: código DANE de 2 dígitos (string, derivado de `DPTO`).
  - `nombre`: nombre oficial del departamento.
- **Tamaño:** ~1,35 MB (< 2 MB). 33 features.

**Estado: REAL.** Usar `cod_dane` para hacer join con los dos JSON anteriores.

---

## 4. `ips-puntos.json` — **REAL (puntos por municipio, geocodificados con centroides DANE)**

IPS por **municipio** como **puntos** para la capa de círculos del Atlas (`/atlas`).

- **Conteo de IPS:** Registro Especial de Prestadores de Servicios de Salud (**REPS**) — MinSalud, datos.gov.co (Socrata) **resource `c36g-9fc2`**. Se filtra `claseprestador='Instituciones Prestadoras de Servicios de Salud - IPS'` y se agrega por `municipio_prestador` (código DANE de **5 dígitos**) con su `municipioprestadordesc`.
  - Consulta: `?$select=municipio_prestador,municipioprestadordesc,departamentoprestadordesc,count(*)&$where=claseprestador='Instituciones Prestadoras de Servicios de Salud - IPS'&$group=municipio_prestador,municipioprestadordesc,departamentoprestadordesc`
- **Coordenadas (geocodificación por municipio):** **centroides municipales oficiales** de datos.gov.co (Socrata) **resource `gdxc-w37w`** (*"Municipios de Colombia"*, **1.122 municipios** con `cod_mpio`, `latitud`, `longitud`). lat/lng vienen con **coma decimal** (es-CO) y se normalizan a punto. Join REPS↔centroide por `cod_mpio` (5 dígitos). **No se inventa ninguna coordenada**: los municipios sin centroide oficial se excluyen.
  - URL: `https://www.datos.gov.co/resource/gdxc-w37w.json`
- **Cobertura:** de los 923 municipios con IPS en el REPS, el array `puntos` se ordena por `ips_total` desc y se **limita (CAP) a los 500 con más IPS** para mantener el archivo liviano. Esos 500 puntos concentran **19.047 de 19.551 IPS nacionales (~97,4 %)**. 1 municipio (`27086`, 3 IPS) no tenía centroide y se excluyó.
- **Tamaño:** ~90 KB (< 400 KB). **500** puntos.

Estructura: `{ fuente, url_ips, url_centroides, fecha_corte, nota, total_municipios, total_ips_en_puntos, total_ips_nacional, puntos: [ { municipio, departamento, cod_dane_mpio, lat, lng, ips_total }, ... ] }`

Regenerar: `python3 scripts/build-ips-puntos.py` (requiere internet; consulta Socrata).

> **Importante:** `lat`/`lng` son el **centroide del municipio**, NO la ubicación exacta de cada IPS (el REPS nacional no trae lat/lng por sede). El punto representa "este municipio tiene N IPS", no la dirección de cada institución.

**Estado: REAL** (conteo REPS + centroides DANE oficiales).

---

## Notas

- Todos los JSON son válidos (verificado con `json.load`).
- Las claves de departamento son strings de 2 dígitos con cero a la izquierda (`"05"`, no `5`; `"08"`, no `8`).
- El único componente *estimado/embebido* (no consultado en runtime) es la **población DANE 2023**, que son cifras oficiales públicas del DANE, no estimaciones propias.
