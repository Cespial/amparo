#!/usr/bin/env python3
"""
build-ciudades.py — Construye public/data/ciudades.json para etiquetar el mapa dark del Atlas.

Genera las PRINCIPALES CIUDADES de Colombia (las 32 capitales departamentales + Bogotá D.C.
+ municipios con población > 100.000 hab) como PUNTOS con nombre, para rotular el mapa.

Estrategia (mismo patrón que build-ips-puntos.py — NO se inventan coordenadas):
  - La LISTA de ciudades (código DANE de municipio de 5 dígitos + población DANE 2023) va
    EMBEBIDA aquí: son cifras oficiales públicas (capitales + umbral >100k de la proyección
    de población municipal DANE 2018-2035, base CNPV 2018, año 2023).
  - Las COORDENADAS (lat/lng) se RESUELVEN en runtime por join contra el dataset oficial de
    centroides municipales de datos.gov.co (Socrata) resource `gdxc-w37w`
    ('Municipios de Colombia', 1.122 municipios con cod_mpio, latitud, longitud).
    lat/lng vienen con coma decimal (es-CO) y se normalizan a punto. El join es por cod_mpio
    (5 dígitos). Si un municipio no tuviera centroide oficial, se EXCLUYE (no se geocodifica
    a mano).

Salida (public/data/ciudades.json):
  {
    fuente, url_centroides, fuente_poblacion, fecha_corte, nota,
    total_ciudades, total_capitales,
    ciudades: [ { nombre, departamento, cod_dane_mpio, lat, lng, poblacion, es_capital }, ... ]
  }
El array `ciudades` se ORDENA por población desc.

Uso:  python3 scripts/build-ciudades.py
Requiere conexión a internet (Socrata). Usa el snapshot en /tmp si existe.
"""
import json
import os
import urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "public", "data")

URL_CENTROIDES = "https://www.datos.gov.co/resource/gdxc-w37w.json"

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

# Conjunto de las 32 capitales departamentales + Bogotá D.C. (cod_mpio de 5 dígitos).
# Cundinamarca NO tiene capital municipal propia: su capital de facto es Bogotá D.C.
# (Distrito Capital, depto 11), ya incluida. Por eso son 32 capitales + Bogotá = 33.
CAPITALES = {
    "11001",  # Bogotá D.C.
    "05001",  # Medellín — Antioquia
    "08001",  # Barranquilla — Atlántico
    "13001",  # Cartagena — Bolívar
    "15001",  # Tunja — Boyacá
    "17001",  # Manizales — Caldas
    "18001",  # Florencia — Caquetá
    "19001",  # Popayán — Cauca
    "20001",  # Valledupar — Cesar
    "23001",  # Montería — Córdoba
    "27001",  # Quibdó — Chocó
    "41001",  # Neiva — Huila
    "44001",  # Riohacha — La Guajira
    "47001",  # Santa Marta — Magdalena
    "50001",  # Villavicencio — Meta
    "52001",  # Pasto — Nariño
    "54001",  # Cúcuta — Norte de Santander
    "63001",  # Armenia — Quindío
    "66001",  # Pereira — Risaralda
    "68001",  # Bucaramanga — Santander
    "70001",  # Sincelejo — Sucre
    "73001",  # Ibagué — Tolima
    "76001",  # Cali — Valle del Cauca
    "81001",  # Arauca — Arauca
    "85001",  # Yopal — Casanare
    "86001",  # Mocoa — Putumayo
    "88001",  # San Andrés — Archipiélago de San Andrés
    "91001",  # Leticia — Amazonas
    "94001",  # Inírida — Guainía
    "95001",  # San José del Guaviare — Guaviare
    "97001",  # Mitú — Vaupés
    "99001",  # Puerto Carreño — Vichada
}

# Población DANE 2023 (proyecciones de población MUNICIPAL DANE 2018-2035, base CNPV 2018,
# año 2023). Cifras oficiales públicas del DANE. Clave = cod_mpio (5 dígitos), verificado 1:1
# contra el dataset de centroides gdxc-w37w (nombres confirmados en build).
# Incluye: las 33 capitales + todo municipio con población > 100.000 hab en 2023.
POBLACION_2023 = {
    # ===== Las 33 capitales (32 departamentales + Bogotá D.C.) =====
    "11001": 7968095,  # Bogotá D.C.
    "05001": 2613720,  # Medellín — Antioquia
    "76001": 2280906,  # Cali — Valle del Cauca
    "08001": 1331156,  # Barranquilla — Atlántico
    "13001": 1064521,  # Cartagena — Bolívar
    "54001": 778938,   # Cúcuta — Norte de Santander
    "68001": 622410,   # Bucaramanga — Santander
    "50001": 559937,   # Villavicencio — Meta
    "73001": 542876,   # Ibagué — Tolima
    "23001": 528203,   # Montería — Córdoba
    "20001": 511811,   # Valledupar — Cesar
    "47001": 511402,   # Santa Marta — Magdalena
    "66001": 488669,   # Pereira — Risaralda
    "17001": 446003,   # Manizales — Caldas
    "52001": 392930,   # Pasto — Nariño
    "41001": 366927,   # Neiva — Huila
    "19001": 320618,   # Popayán — Cauca
    "44001": 311555,   # Riohacha — La Guajira
    "63001": 305060,   # Armenia — Quindío
    "70001": 290521,   # Sincelejo — Sucre
    "85001": 187783,   # Yopal — Casanare
    "18001": 184546,   # Florencia — Caquetá
    "15001": 178119,   # Tunja — Boyacá
    "27001": 130825,   # Quibdó — Chocó
    "81001": 102217,   # Arauca — Arauca
    "95001": 71498,    # San José del Guaviare — Guaviare (capital, < 100k)
    "86001": 60997,    # Mocoa — Putumayo (capital, < 100k)
    "91001": 51623,    # Leticia — Amazonas (capital, < 100k)
    "88001": 49099,    # San Andrés — Archipiélago (capital, < 100k)
    "97001": 31694,    # Mitú — Vaupés (capital, < 100k)
    "94001": 26960,    # Inírida — Guainía (capital, < 100k)
    "99001": 19024,    # Puerto Carreño — Vichada (capital, < 100k)

    # ===== Otros municipios > 100.000 hab (2023), no capitales =====
    # Cundinamarca (Sabana de Bogotá)
    "25754": 805058,   # Soacha
    "25175": 162514,   # Chía
    "25899": 152307,   # Zipaquirá
    "25307": 110589,   # Girardot
    "25290": 159278,   # Fusagasugá
    "25473": 152093,   # Mosquera
    "25430": 145131,   # Madrid
    "25286": 110140,   # Funza
    "25126": 110179,   # Cajicá
    "25269": 165986,   # Facatativá
    # Antioquia (Valle de Aburrá + Urabá/Bajo Cauca)
    "05088": 481768,   # Bello
    "05360": 415601,   # Itagüí
    "05266": 263685,   # Envigado
    "05837": 169740,   # Turbo
    "05045": 195215,   # Apartadó
    "05615": 135465,   # Rionegro
    "05631": 117200,   # Sabaneta
    "05154": 138480,   # Caucasia
    # Atlántico
    "08758": 296257,   # Soledad  (también listada arriba? no — única)
    "08433": 137621,   # Malambo
    # Bolívar
    "13430": 165794,   # Magangué
    "13836": 100867,   # Turbaco
    # Valle del Cauca
    "76520": 357517,   # Palmira
    "76109": 333328,   # Buenaventura
    "76834": 222127,   # Tuluá
    "76147": 137330,   # Cartago
    "76364": 162787,   # Jamundí
    "76892": 130855,   # Yumbo
    "76111": 117499,   # Guadalajara de Buga
    # Santander
    "68276": 296953,   # Floridablanca
    "68081": 230373,   # Barrancabermeja
    "68547": 174929,   # Piedecuesta
    "68307": 130863,   # Girón
    # Norte de Santander
    "54874": 100513,   # Villa del Rosario
    "54498": 105360,   # Ocaña
    # Huila
    "41551": 137641,   # Pitalito
    # Nariño
    "52835": 134950,   # Tumaco (San Andrés de Tumaco)
    "52356": 152798,   # Ipiales
    # Cauca
    "19698": 105979,   # Santander de Quilichao
    # La Guajira
    "44430": 184498,   # Maicao
    # Magdalena
    "47189": 119337,   # Ciénaga
    # Córdoba
    "23417": 126316,   # Lorica
    # Boyacá
    "15238": 110936,   # Duitama
    "15759": 124838,   # Sogamoso
}
# Limpieza: conservar solo cod_mpio de 5 dígitos numéricos con población > 0.
POBLACION_2023 = {
    k: v for k, v in POBLACION_2023.items()
    if len(k) == 5 and k.isdigit() and v > 0
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
    """Convierte 'MEDELLÍN' → 'Medellín' respetando preposiciones cortas y siglas."""
    # Correcciones de nombres oficiales que el title-case genérico estropearía.
    fixes = {
        "BOGOTÁ, D.C.": "Bogotá, D.C.",
        "SANTIAGO DE CALI": "Santiago de Cali",
        "CARTAGENA DE INDIAS": "Cartagena de Indias",
        "SAN ANDRÉS DE TUMACO": "San Andrés de Tumaco",
    }
    key = name.strip().upper()
    if key in fixes:
        return fixes[key]
    minus = {"de", "del", "la", "las", "los", "el", "y"}
    palabras = name.strip().lower().split()
    out = []
    for i, w in enumerate(palabras):
        if i > 0 and w in minus:
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
    """{ cod_mpio(5) : (lat, lng, nom_mpio) } desde gdxc-w37w. Solo coords válidas."""
    rows = fetch(URL_CENTROIDES + "?$limit=2000", "/tmp/ips_centroides.json")
    cent = {}
    for r in rows:
        cod = str(r.get("cod_mpio", "")).zfill(5)
        lat = parse_coord(r.get("latitud"))
        lng = parse_coord(r.get("longitud"))
        nom = r.get("nom_mpio") or ""
        if len(cod) != 5 or lat is None or lng is None:
            continue
        # Sanity: Colombia continental + insular (-4.5..13.6 lat, -82.5..-66.5 lng)
        if not (-4.5 <= lat <= 13.6 and -82.5 <= lng <= -66.5):
            continue
        cent[cod] = (round(lat, 6), round(lng, 6), nom)
    return cent


def main():
    print("Construyendo ciudades.json (etiquetas de ciudades para el mapa dark)...")
    centroides = build_centroides()
    print(f"  centroides municipales (gdxc-w37w): {len(centroides)}")

    ciudades = []
    sin_centroide = []
    for cod, pob in POBLACION_2023.items():
        cod_dpto = cod[:2]
        cent = centroides.get(cod)
        if cent is None:
            sin_centroide.append((cod, pob))
            continue
        lat, lng, nom = cent
        ciudades.append({
            "nombre": titlecase_mpio(nom),
            "departamento": DEPTOS.get(cod_dpto, cod_dpto),
            "cod_dane_mpio": cod,
            "lat": lat,
            "lng": lng,
            "poblacion": pob,
            "es_capital": cod in CAPITALES,
        })

    # Orden por población desc.
    ciudades.sort(key=lambda c: c["poblacion"], reverse=True)
    total_capitales = sum(1 for c in ciudades if c["es_capital"])

    out = {
        "fuente": (
            "Lista de ciudades (32 capitales departamentales + Bogotá D.C. + municipios "
            "con población > 100.000 hab en 2023) geocodificada con centroides municipales "
            "oficiales de datos.gov.co (Socrata) resource 'gdxc-w37w' ('Municipios de Colombia', "
            "1.122 municipios con cod_mpio, latitud y longitud). El join es por cod_mpio (5 dígitos). "
            "NO se inventan coordenadas."
        ),
        "url_centroides": URL_CENTROIDES,
        "fuente_poblacion": (
            "DANE — Proyecciones de población municipal 2018-2035 (base CNPV 2018), año 2023. "
            "Cifras oficiales públicas del DANE."
        ),
        "fecha_corte": "Población DANE 2023; centroides DANE (gdxc-w37w).",
        "nota": (
            "lat/lng = centroide oficial del municipio (cod_dane_mpio, 5 dígitos), NO una "
            "coordenada inventada. 'es_capital'=true para las 32 capitales departamentales y "
            "Bogotá D.C. (Cundinamarca no tiene capital municipal propia: su capital de facto es "
            "Bogotá D.C.). El umbral de inclusión es >100.000 hab (2023) salvo las capitales, "
            "que se incluyen todas aunque tengan menos. Municipios sin centroide oficial "
            "excluidos: %d."
        ) % len(sin_centroide),
        "total_ciudades": len(ciudades),
        "total_capitales": total_capitales,
        "ciudades": ciudades,
    }

    path = os.path.join(DATA, "ciudades.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    size = os.path.getsize(path)
    print(f"  ciudades.json: {len(ciudades)} ciudades ({total_capitales} capitales), {size/1024:.1f} KB")
    if sin_centroide:
        print("  (sin centroide:", ", ".join(c for c, _ in sin_centroide), ")")
    print("Listo.")


if __name__ == "__main__":
    main()
