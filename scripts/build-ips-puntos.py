#!/usr/bin/env python3
"""
build-ips-puntos.py — Construye public/data/ips-puntos.json para el Atlas de Amparo.

Genera PUNTOS de IPS por MUNICIPIO (no por departamento), geocodificados con
centroides oficiales DANE, para pintarlos como una capa de círculos en /atlas.

Fuentes (runtime, datos.gov.co / Socrata):
  1) IPS por municipio  — REPS / MinSalud, resource c36g-9fc2
       claseprestador = 'Instituciones Prestadoras de Servicios de Salud - IPS'
       agrupado por municipio_prestador (código DANE de 5 dígitos).
  2) Centroides municipales — resource gdxc-w37w
       ('Municipios de Colombia' con cod_mpio, latitud, longitud — 1.122 municipios).
       lat/lng vienen con coma decimal (es-CO); se normalizan a punto.

Salida (public/data/ips-puntos.json):
  {
    fuente, url_ips, url_centroides, fecha_corte, nota,
    total_municipios, total_ips_en_puntos, total_ips_nacional,
    puntos: [ { municipio, departamento, cod_dane_mpio, lat, lng, ips_total }, ... ]
  }

El array `puntos` se ORDENA por ips_total desc e INCLUYE a TODOS los municipios con
al menos 1 IPS (clase IPS del REPS) que tengan centroide oficial DANE. NO se inventan
coordenadas: solo se incluyen municipios con centroide oficial. El archivo se mantiene
muy por debajo de 400 KB.

Uso:  python3 scripts/build-ips-puntos.py
Requiere conexión a internet (Socrata). Usa snapshots en /tmp si existen.
"""
import json
import os
import urllib.request
import urllib.parse

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "public", "data")

URL_IPS = "https://www.datos.gov.co/resource/c36g-9fc2.json"
URL_CENTROIDES = "https://www.datos.gov.co/resource/gdxc-w37w.json"

# Cap de municipios a incluir como puntos. None = SIN CAP: se incluyen TODOS los
# municipios con al menos 1 IPS (clase IPS del REPS) que tengan centroide oficial DANE.
# ~923 municipios * ~140 bytes/registro ≈ 130 KB → muy por debajo de 400 KB.
CAP_MUNICIPIOS = None

# Nombres oficiales de departamento por código DANE (2 dígitos), para normalizar
# el `departamentoprestadordesc` del REPS (que viene con mayúsculas/typos).
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


def fetch(url, cache):
    """Consulta Socrata; usa snapshot en /tmp si existe; cachea la respuesta."""
    if os.path.exists(cache):
        try:
            with open(cache) as f:
                return json.load(f)
        except Exception:
            pass
    req = urllib.request.Request(url, headers={"User-Agent": "amparo-data/1.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        data = json.loads(r.read().decode())
    with open(cache, "w") as f:
        json.dump(data, f)
    return data


def titlecase_mpio(name):
    """Convierte 'MEDELLÍN' → 'Medellín' respetando preposiciones cortas."""
    minus = {"de", "del", "la", "las", "los", "el", "y", "san", "santa"}
    palabras = name.strip().lower().split()
    out = []
    for i, w in enumerate(palabras):
        if i > 0 and w in minus and w not in ("san", "santa"):
            out.append(w)
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)


def parse_coord(raw):
    """Normaliza '-75,581775' (coma decimal es-CO) → float -75.581775."""
    if raw is None:
        return None
    s = str(raw).strip().replace(",", ".")
    try:
        v = float(s)
    except ValueError:
        return None
    return v


def build_centroides():
    """{ cod_mpio(5) : (lat, lng) } desde gdxc-w37w. Solo coords válidas."""
    rows = fetch(URL_CENTROIDES + "?$limit=2000", "/tmp/ips_centroides.json")
    cent = {}
    for r in rows:
        cod = str(r.get("cod_mpio", "")).zfill(5)
        lat = parse_coord(r.get("latitud"))
        lng = parse_coord(r.get("longitud"))
        if len(cod) != 5 or lat is None or lng is None:
            continue
        # Sanity: Colombia continental + insular aprox. (-4.3..13.5 lat, -82..-66.8 lng)
        if not (-4.5 <= lat <= 13.6 and -82.5 <= lng <= -66.5):
            continue
        cent[cod] = (round(lat, 6), round(lng, 6))
    return cent


def build_ips_por_municipio():
    """{ cod_mpio(5) : { 'nom': desc, 'n': count } } desde REPS (clase IPS)."""
    clase = "Instituciones Prestadoras de Servicios de Salud - IPS"
    where = urllib.parse.quote("claseprestador='%s'" % clase)
    url = (
        URL_IPS
        + "?$select=municipio_prestador,municipioprestadordesc,"
        "departamentoprestadordesc,count(*)"
        "&$where=" + where
        + "&$group=municipio_prestador,municipioprestadordesc,departamentoprestadordesc"
        "&$limit=2000"
    )
    rows = fetch(url, "/tmp/ips_por_mpio.json")
    agg = {}
    for r in rows:
        cod = str(r.get("municipio_prestador", "")).zfill(5)
        if len(cod) != 5 or cod == "00000":
            continue
        n = int(r.get("count", 0))
        prev = agg.get(cod)
        nom = r.get("municipioprestadordesc") or ""
        if prev:
            prev["n"] += n
        else:
            agg[cod] = {"n": n, "nom": nom}
    return agg


def main():
    print("Construyendo ips-puntos.json (puntos de IPS por municipio)...")
    centroides = build_centroides()
    print(f"  centroides municipales (gdxc-w37w): {len(centroides)}")

    ips = build_ips_por_municipio()
    total_ips_nacional = sum(v["n"] for v in ips.values())
    print(f"  municipios con IPS en REPS: {len(ips)}, IPS totales: {total_ips_nacional:,}")

    puntos = []
    sin_centroide = []
    for cod, v in ips.items():
        cod_dpto = cod[:2]
        cent = centroides.get(cod)
        if cent is None:
            sin_centroide.append((cod, v["nom"], v["n"]))
            continue
        lat, lng = cent
        puntos.append({
            "municipio": titlecase_mpio(v["nom"]),
            "departamento": DEPTOS.get(cod_dpto, cod_dpto),
            "cod_dane_mpio": cod,
            "lat": lat,
            "lng": lng,
            "ips_total": v["n"],
        })

    # Orden por ips_total desc. Sin CAP (CAP_MUNICIPIOS=None) se incluyen TODOS los
    # municipios con >=1 IPS y centroide oficial.
    puntos.sort(key=lambda p: p["ips_total"], reverse=True)
    if CAP_MUNICIPIOS is not None and len(puntos) > CAP_MUNICIPIOS:
        puntos = puntos[:CAP_MUNICIPIOS]

    total_ips_en_puntos = sum(p["ips_total"] for p in puntos)
    ips_sin_centroide = sum(n for _, _, n in sin_centroide)

    out = {
        "fuente": "Cruce de dos datasets oficiales de datos.gov.co: (1) Registro Especial de Prestadores de Servicios de Salud (REPS) — MinSalud, resource c36g-9fc2, clase 'Instituciones Prestadoras de Servicios de Salud - IPS', agregado por municipio_prestador (código DANE de 5 dígitos); (2) centroides municipales oficiales, resource gdxc-w37w (1.122 municipios de Colombia con cod_mpio, latitud y longitud).",
        "url_ips": URL_IPS,
        "url_centroides": URL_CENTROIDES,
        "fecha_corte": "REPS marzo 2026; centroides DANE",
        "nota": (
            "DATOS REALES geocodificados por MUNICIPIO. ips_total = nº de IPS (clase IPS del REPS) "
            "con sede en ese municipio. lat/lng = centroide oficial del municipio (cod_dane_mpio, 5 dígitos), "
            "NO la ubicación exacta de cada IPS (el REPS nacional no trae lat/lng por sede). "
            "El array 'puntos' está ordenado por ips_total desc e incluye TODOS los %d municipios con al menos "
            "1 IPS y centroide oficial; estos puntos concentran %d de las %d IPS nacionales (%.1f%%). "
            "Municipios con IPS pero sin centroide oficial: %d (%d IPS, excluidos para no inventar coordenadas)."
        ) % (
            len(puntos), total_ips_en_puntos, total_ips_nacional,
            100.0 * total_ips_en_puntos / total_ips_nacional if total_ips_nacional else 0.0,
            len(sin_centroide), ips_sin_centroide,
        ),
        "total_municipios": len(puntos),
        "total_ips_en_puntos": total_ips_en_puntos,
        "total_ips_nacional": total_ips_nacional,
        "puntos": puntos,
    }

    path = os.path.join(DATA, "ips-puntos.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    size = os.path.getsize(path)
    print(f"  ips-puntos.json: {len(puntos)} puntos, {total_ips_en_puntos:,} IPS, {size/1024:.0f} KB")
    if sin_centroide:
        top = sorted(sin_centroide, key=lambda x: x[2], reverse=True)[:5]
        print("  (sin centroide, top:", ", ".join(f"{c}={n}" for c, _, n in top), ")")
    print("Listo.")


if __name__ == "__main__":
    main()
