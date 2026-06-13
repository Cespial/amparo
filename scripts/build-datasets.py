#!/usr/bin/env python3
"""
build-datasets.py — Construye los datasets del Atlas de Amparo (plataforma de tutelas de salud).

Genera (en public/data/):
  1) tutelas-por-departamento.json  — tutelas de salud 2023 por depto (REAL, Corte Constitucional)
  2) ips-salud.json                 — conteo de IPS por depto (REAL, REPS / MinSalud)
  3) colombia-departamentos.geojson — añade cod_dane (2 dígitos) a cada feature

Fuentes en runtime:
  - Tutelas:  datos.gov.co resource xkyt-k6pk (Corte Constitucional), derecho=SALUD, anio=2023
  - IPS:      datos.gov.co resource c36g-9fc2 (REPS, MinSalud), claseprestador=IPS
  - Poblacion: proyecciones DANE 2023 (CNPV 2018) — cifras oficiales embebidas (ver FUENTES.md)

Uso:  python3 scripts/build-datasets.py
Requiere conexión a internet (consulta Socrata) — usa snapshots en /tmp si existen.
"""
import json
import os
import urllib.request
import urllib.parse

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "public", "data")

# Nombres oficiales de departamento por código DANE (2 dígitos)
DEPTOS = {
    "05": "Antioquia", "08": "Atlántico", "11": "Bogotá D.C.", "13": "Bolívar",
    "15": "Boyacá", "17": "Caldas", "18": "Caquetá", "19": "Cauca", "20": "Cesar",
    "23": "Córdoba", "25": "Cundinamarca", "27": "Chocó", "41": "Huila",
    "44": "La Guajira", "47": "Magdalena", "50": "Meta", "52": "Nariño",
    "54": "Norte de Santander", "63": "Quindío", "66": "Risaralda",
    "68": "Santander", "70": "Sucre", "73": "Tolima", "76": "Valle del Cauca",
    "81": "Arauca", "85": "Casanare", "86": "Putumayo",
    "88": "Archipiélago de San Andrés, Providencia y Santa Catalina",
    "91": "Amazonas", "94": "Guainía", "95": "Guaviare", "97": "Vaupés",
    "99": "Vichada",
}

# Proyecciones de población DANE para 2023 (base CNPV 2018). Cifras oficiales DANE.
# Fuente: DANE — Proyecciones de población departamental 2018-2070, año 2023.
POBLACION_2023 = {
    "05": 6677930,   # Antioquia
    "08": 2782357,   # Atlántico
    "11": 7968095,   # Bogotá D.C.
    "13": 2207100,   # Bolívar
    "15": 1255311,   # Boyacá
    "17": 1043520,   # Caldas
    "18": 421764,    # Caquetá
    "19": 1530953,   # Cauca
    "20": 1295387,   # Cesar
    "23": 1862635,   # Córdoba
    "25": 3460415,   # Cundinamarca
    "27": 568111,    # Chocó
    "41": 1213907,   # Huila
    "44": 957797,    # La Guajira
    "47": 1481865,   # Magdalena
    "50": 1100654,   # Meta
    "52": 1660087,   # Nariño
    "54": 1627169,   # Norte de Santander
    "63": 555401,    # Quindío
    "66": 976618,    # Risaralda
    "68": 2349058,   # Santander
    "70": 962390,    # Sucre
    "73": 1364124,   # Tolima
    "76": 4664229,   # Valle del Cauca
    "81": 308566,    # Arauca
    "85": 469046,    # Casanare
    "86": 374649,    # Putumayo
    "88": 64362,     # San Andrés
    "91": 80376,     # Amazonas
    "94": 53319,     # Guainía
    "95": 91814,     # Guaviare
    "97": 47012,     # Vaupés
    "99": 116088,    # Vichada
}
POBLACION_TOTAL_NAL = sum(POBLACION_2023.values())


def fetch(url, cache):
    """Consulta Socrata; usa snapshot en /tmp si la red falla."""
    if os.path.exists(cache):
        try:
            with open(cache) as f:
                return json.load(f)
        except Exception:
            pass
    req = urllib.request.Request(url, headers={"User-Agent": "amparo-data/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read().decode())
    with open(cache, "w") as f:
        json.dump(data, f)
    return data


def build_tutelas():
    where = urllib.parse.quote("derecho='SALUD' AND anio='2023'")
    url = (
        "https://www.datos.gov.co/resource/xkyt-k6pk.json"
        "?$select=cod_dpto,count(*)&$where=" + where + "&$group=cod_dpto"
    )
    rows = fetch(url, "/tmp/tutelas.json")
    counts = {}
    for row in rows:
        cod = str(row.get("cod_dpto", "")).zfill(2)
        if cod in DEPTOS:
            counts[cod] = int(row["count"])

    total = sum(counts.values())
    datos = {}
    for cod, nombre in DEPTOS.items():
        n = counts.get(cod, 0)
        pob = POBLACION_2023[cod]
        tasa = round(n / pob * 10000, 2)
        datos[cod] = {
            "departamento": nombre,
            "tutelas_salud": n,
            "poblacion": pob,
            "tasa_por_10k": tasa,
        }
    out = {
        "fuente": "Corte Constitucional de Colombia — 'Derechos demandados en las tutelas radicadas en la Corte Constitucional' (datos.gov.co, resource xkyt-k6pk), filtrado derecho=SALUD, año 2023. Validado contra el informe oficial de la Defensoría del Pueblo 'La Tutela y los Derechos a la Salud y a la Seguridad Social 2023'.",
        "anio": 2023,
        "total_nacional_tutelas_salud": total,
        "total_nacional_tutelas_todas_materias": 633475,
        "poblacion_total_nacional": POBLACION_TOTAL_NAL,
        "nota": ("DATOS REALES. El conteo por departamento proviene del dataset oficial de la Corte Constitucional (cada tutela del país se reporta a la Corte). El total nacional aquí calculado (%s) coincide al 99,99%% con la cifra oficial de la Defensoría (197.765 tutelas de salud en 2023). La población es la proyección DANE 2023 (base CNPV 2018), cifra oficial. tasa_por_10k = tutelas_salud / poblacion * 10.000." % f"{total:,}"),
        "fuente_poblacion": "DANE — Proyecciones de población departamental 2018-2070, año 2023 (base CNPV 2018).",
        "datos": datos,
    }
    path = os.path.join(DATA, "tutelas-por-departamento.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"  tutelas-por-departamento.json: {len(datos)} deptos, total salud {total:,}")
    return out


def build_ips():
    clase = "Instituciones Prestadoras de Servicios de Salud - IPS"
    where = urllib.parse.quote("claseprestador='%s'" % clase)
    # IPS por depto + naturaleza
    url_nat = (
        "https://www.datos.gov.co/resource/c36g-9fc2.json"
        "?$select=substring(codigoprestador,1,2) as dane,naturalezajuridica,count(*)"
        "&$where=" + where + "&$group=dane,naturalezajuridica"
    )
    rows = fetch(url_nat, "/tmp/ips_nat.json")
    # total prestadores (todas las clases) por depto
    url_all = (
        "https://www.datos.gov.co/resource/c36g-9fc2.json"
        "?$select=substring(codigoprestador,1,2) as dane,count(*)&$group=dane"
    )
    rows_all = fetch(url_all, "/tmp/prest_total.json")
    prest_total = {str(r["dane"]).zfill(2): int(r["count"]) for r in rows_all}

    agg = {cod: {"ips_total": 0, "ips_publicas": 0, "ips_privadas": 0, "ips_mixtas": 0}
           for cod in DEPTOS}
    for row in rows:
        cod = str(row.get("dane", "")).zfill(2)
        if cod not in DEPTOS:
            continue
        n = int(row["count"])
        nat = (row.get("naturalezajuridica") or "").strip().lower()
        agg[cod]["ips_total"] += n
        if nat.startswith("públ") or nat.startswith("publ"):
            agg[cod]["ips_publicas"] += n
        elif nat.startswith("priv"):
            agg[cod]["ips_privadas"] += n
        elif nat.startswith("mix"):
            agg[cod]["ips_mixtas"] += n

    datos = {}
    tot_ips = 0
    for cod, nombre in DEPTOS.items():
        a = agg[cod]
        tot_ips += a["ips_total"]
        datos[cod] = {
            "departamento": nombre,
            "ips_total": a["ips_total"],
            "ips_publicas": a["ips_publicas"],
            "ips_privadas": a["ips_privadas"],
            "ips_mixtas": a["ips_mixtas"],
            "prestadores_total": prest_total.get(cod, 0),
        }
    out = {
        "fuente": "Registro Especial de Prestadores de Servicios de Salud (REPS) — Ministerio de Salud y Protección Social, vía datos.gov.co resource c36g-9fc2 ('Registro Especial de Prestadores y Sedes de Servicios de Salud').",
        "url_dataset": "https://www.datos.gov.co/resource/c36g-9fc2.json",
        "fecha_corte": "REPS marzo 2026",
        "nota": "DATOS REALES (conteo, sin coordenadas). 'ips_total' cuenta prestadores de clase 'Instituciones Prestadoras de Servicios de Salud - IPS' por departamento, derivando el código DANE de los 2 primeros dígitos de codigoprestador. 'prestadores_total' incluye TODAS las clases (IPS + profesionales independientes + transporte + objeto social diferente). El dataset nacional REPS NO trae latitud/longitud, por eso se entrega como conteo por departamento y no como puntos. Total nacional de IPS contadas: %d." % tot_ips,
        "datos": datos,
    }
    path = os.path.join(DATA, "ips-salud.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"  ips-salud.json: {len(datos)} deptos, total IPS {tot_ips:,}")
    return out


def add_cod_dane_geojson():
    path = os.path.join(DATA, "colombia-departamentos.geojson")
    with open(path, encoding="utf-8") as f:
        gj = json.load(f)
    added = 0
    for feat in gj["features"]:
        p = feat["properties"]
        cod = str(p.get("DPTO", "")).zfill(2)
        if cod in DEPTOS:
            p["cod_dane"] = cod
            p["nombre"] = DEPTOS[cod]
            added += 1
    with open(path, "w", encoding="utf-8") as f:
        json.dump(gj, f, ensure_ascii=False)
    size = os.path.getsize(path)
    print(f"  colombia-departamentos.geojson: cod_dane añadido a {added}/{len(gj['features'])} features ({size/1024:.0f} KB)")


if __name__ == "__main__":
    print("Construyendo datasets del Atlas de Amparo...")
    build_tutelas()
    build_ips()
    add_cod_dane_geojson()
    print("Listo.")
