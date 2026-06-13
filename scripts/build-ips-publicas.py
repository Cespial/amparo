#!/usr/bin/env python3
"""
build-ips-publicas.py — Construye public/data/ips-publicas-puntos.json para Amparo.

Genera PUNTOS de la RED PÚBLICA DE SALUD por MUNICIPIO — la red donde se atiende
la población vulnerable (ESE / IPS de naturaleza pública) — geocodificados con
centroides oficiales DANE. Es el complemento "público" de ips-puntos.json.

Criterio de "red pública" (REPS, resource c36g-9fc2):
  - naturalezajuridica = 'Pública'  (3.845 prestadores; la 'Mixta' NO se incluye)
  - AND claseprestador = 'Instituciones Prestadoras de Servicios de Salud - IPS'
    → 3.664 IPS públicas (el resto de prestadores públicos son 'Objeto Social
      Diferente' y 'Transporte Especial', que NO son donde se presta atención).
  - Dentro de esas, las ESE (Empresa Social del Estado, campo ese='SI') son un
    subconjunto: las 3.485 IPS públicas con ese='SI'. Se reporta como `ese` por
    municipio para distinguir la red hospitalaria ESE del resto de IPS públicas.

Verificado contra el dataset (corte mar-2026):
  - naturalezajuridica: Privada=72.905, Pública=3.845, Mixta=71.
  - ese='SI': 3.485 → todas son naturalezajuridica='Pública' y clase IPS.
  - IPS públicas: 3.485 ESE + 179 públicas no-ESE = 3.664.

Fuentes (runtime, datos.gov.co / Socrata):
  1) Red pública por municipio — REPS / MinSalud, resource c36g-9fc2,
     agregado por municipio_prestador (código DANE de 5 dígitos).
  2) Centroides municipales — resource gdxc-w37w (1.122 municipios; lat/lng con
     coma decimal es-CO, normalizada a punto). NO se inventan coordenadas: los
     municipios sin centroide oficial se excluyen.

Salida (public/data/ips-publicas-puntos.json):
  {
    fuente, url_reps, url_centroides, fecha_corte, criterio, nota,
    total_municipios, total_ips_publicas, total_ese,
    total_ips_publicas_nacional, total_ese_nacional,
    puntos: [ { municipio, departamento, cod_dane_mpio, lat, lng,
                ips_publicas, ese }, ... ]
  }

NOTA: este script es independiente de build-ips-puntos.py (no lo modifica ni lo
importa). Reusa el MISMO mapa de centroides (gdxc-w37w) y la MISMA lógica de
titlecase/normalización de coordenadas, copiada aquí para no acoplar archivos.

Uso:  python3 scripts/build-ips-publicas.py
Requiere conexión a internet (Socrata). Usa snapshots en /tmp si existen.
"""
import json
import os
import urllib.request
import urllib.parse

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "public", "data")

URL_REPS = "https://www.datos.gov.co/resource/c36g-9fc2.json"
URL_CENTROIDES = "https://www.datos.gov.co/resource/gdxc-w37w.json"

CLASE_IPS = "Instituciones Prestadoras de Servicios de Salud - IPS"

# Nombres oficiales de departamento por código DANE (2 dígitos).
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
        # Sanity: Colombia continental + insular aprox.
        if not (-4.5 <= lat <= 13.6 and -82.5 <= lng <= -66.5):
            continue
        cent[cod] = (round(lat, 6), round(lng, 6))
    return cent


def build_red_publica_por_municipio():
    """
    { cod_mpio(5) : { 'nom', 'publicas', 'ese' } } desde el REPS.

    publicas = nº de IPS de naturaleza pública (incluye ESE) en el municipio.
    ese      = subconjunto con ese='SI' (Empresa Social del Estado).
    """
    where_pub = ("naturalezajuridica='Pública' AND claseprestador='%s'"
                 % CLASE_IPS)
    where_ese = where_pub + " AND ese='SI'"

    def grouped(where, cache):
        url = (
            URL_REPS
            + "?$select=municipio_prestador,municipioprestadordesc,"
            "departamentoprestadordesc,count(*)"
            "&$where=" + urllib.parse.quote(where)
            + "&$group=municipio_prestador,municipioprestadordesc,"
            "departamentoprestadordesc"
            "&$limit=2000"
        )
        return fetch(url, cache)

    rows_pub = grouped(where_pub, "/tmp/ips_publicas_por_mpio.json")
    rows_ese = grouped(where_ese, "/tmp/ips_ese_por_mpio.json")

    agg = {}
    for r in rows_pub:
        cod = str(r.get("municipio_prestador", "")).zfill(5)
        if len(cod) != 5 or cod == "00000":
            continue
        n = int(r.get("count", 0))
        nom = r.get("municipioprestadordesc") or ""
        prev = agg.get(cod)
        if prev:
            prev["publicas"] += n
        else:
            agg[cod] = {"publicas": n, "ese": 0, "nom": nom}

    for r in rows_ese:
        cod = str(r.get("municipio_prestador", "")).zfill(5)
        if len(cod) != 5 or cod == "00000":
            continue
        n = int(r.get("count", 0))
        if cod in agg:
            agg[cod]["ese"] += n
    return agg


def main():
    print("Construyendo ips-publicas-puntos.json (red pública por municipio)...")
    centroides = build_centroides()
    print(f"  centroides municipales (gdxc-w37w): {len(centroides)}")

    red = build_red_publica_por_municipio()
    total_pub_nac = sum(v["publicas"] for v in red.values())
    total_ese_nac = sum(v["ese"] for v in red.values())
    print(f"  municipios con red pública en REPS: {len(red)}, "
          f"IPS públicas: {total_pub_nac:,} (ESE: {total_ese_nac:,})")

    puntos = []
    sin_centroide = []
    for cod, v in red.items():
        cent = centroides.get(cod)
        if cent is None:
            sin_centroide.append((cod, v["nom"], v["publicas"]))
            continue
        lat, lng = cent
        puntos.append({
            "municipio": titlecase_mpio(v["nom"]),
            "departamento": DEPTOS.get(cod[:2], cod[:2]),
            "cod_dane_mpio": cod,
            "lat": lat,
            "lng": lng,
            "ips_publicas": v["publicas"],
            "ese": v["ese"],
        })

    # Orden por ips_publicas desc. Se incluyen TODOS los municipios con red
    # pública y centroide (la red pública nacional es liviana: ~860 municipios).
    puntos.sort(key=lambda p: p["ips_publicas"], reverse=True)

    total_pub_pts = sum(p["ips_publicas"] for p in puntos)
    total_ese_pts = sum(p["ese"] for p in puntos)
    pub_sin_cent = sum(n for _, _, n in sin_centroide)

    out = {
        "fuente": (
            "Registro Especial de Prestadores de Servicios de Salud (REPS) — "
            "MinSalud, datos.gov.co (Socrata) resource c36g-9fc2. Red PÚBLICA "
            "de salud: prestadores con naturalezajuridica='Pública' y "
            "claseprestador='Instituciones Prestadoras de Servicios de Salud - "
            "IPS', agregados por municipio_prestador (código DANE de 5 dígitos). "
            "Geocodificación por centroide municipal oficial DANE (resource "
            "gdxc-w37w, 1.122 municipios)."
        ),
        "url_reps": URL_REPS,
        "url_centroides": URL_CENTROIDES,
        "fecha_corte": "REPS marzo 2026; centroides DANE",
        "criterio": (
            "naturalezajuridica='Pública' AND claseprestador='%s'. "
            "ese = subconjunto con ese='SI' (Empresa Social del Estado). "
            "Se excluye naturaleza 'Mixta' y 'Privada', y los prestadores "
            "públicos que no son IPS (Objeto Social Diferente, Transporte)."
        ) % CLASE_IPS,
        "nota": (
            "RED PÚBLICA REAL geocodificada por MUNICIPIO. ips_publicas = nº de "
            "IPS públicas con sede en el municipio; ese = cuántas de ellas son "
            "Empresa Social del Estado. lat/lng = centroide oficial del "
            "municipio (cod_dane_mpio, 5 dígitos), NO la ubicación exacta de "
            "cada sede (el REPS nacional no trae lat/lng por sede). "
            "Se incluyen TODOS los municipios con red pública y centroide "
            "oficial: %d municipios concentran %d de las %d IPS públicas "
            "nacionales (%.1f%%) y %d de las %d ESE. "
            "Municipios con red pública pero sin centroide oficial: %d "
            "(%d IPS públicas, excluidos para no inventar coordenadas)."
        ) % (
            len(puntos), total_pub_pts, total_pub_nac,
            100.0 * total_pub_pts / total_pub_nac if total_pub_nac else 0.0,
            total_ese_pts, total_ese_nac,
            len(sin_centroide), pub_sin_cent,
        ),
        "total_municipios": len(puntos),
        "total_ips_publicas": total_pub_pts,
        "total_ese": total_ese_pts,
        "total_ips_publicas_nacional": total_pub_nac,
        "total_ese_nacional": total_ese_nac,
        "puntos": puntos,
    }

    path = os.path.join(DATA, "ips-publicas-puntos.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    size = os.path.getsize(path)
    print(f"  ips-publicas-puntos.json: {len(puntos)} municipios, "
          f"{total_pub_pts:,} IPS públicas ({total_ese_pts:,} ESE), "
          f"{size/1024:.0f} KB")
    if sin_centroide:
        top = sorted(sin_centroide, key=lambda x: x[2], reverse=True)[:5]
        print("  (sin centroide, top:",
              ", ".join(f"{c}={n}" for c, _, n in top), ")")
    print("Listo.")


if __name__ == "__main__":
    main()
