"""Modelos 3D a partir de las fotos recortadas (fondo transparente) de juego/fotos/.

Para cada foto se extrae el contorno de la silueta del componente, se extruye con el
grosor de la pieza y la foto se aplica como textura en la cara frontal. Los laterales
y la cara trasera son de plástico oscuro.

Uso (desde la carpeta juego/modelos):
    /Applications/Blender.app/Contents/MacOS/Blender -b -P generar_modelos_foto.py

Las medidas usan las mismas unidades que montaje.js: el ancho de cada pieza coincide
con el que tenía el dibujo anterior, y el centro del modelo está en el origen.
"""
import math
import os

import bmesh
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
FOTOS = os.path.join(HERE, "..", "fotos")
RESOLUCION = 140  # píxeles de la malla de silueta en el lado mayor (más = contorno más fino)
TOLERANCIA = 0.9  # simplificación del contorno, en celdas

# Modelo: foto, ancho en unidades de escena, grosor, si el origen va en la base (CPU).
MODELOS = {
    "gpu": dict(foto="gpu.png", ancho=11.0, grosor=2.0),
    "gpu-blanca": dict(foto="gpu-blanca.png", ancho=11.0, grosor=2.0),
    "gpu-negra": dict(foto="gpu-negra.png", ancho=11.0, grosor=2.0),
    "cpu": dict(foto="cpu-am4.png", ancho=4.1, alto=4.1, grosor=0.14, base=True),
    "cpu-intel": dict(foto="cpu-intel.png", ancho=4.1, alto=4.1, grosor=0.14, base=True),
}

DIRS = [(1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1), (1, -1)]  # sentido horario desde el este


def mascara(ruta):
    img = bpy.data.images.load(ruta, check_existing=False)
    w, h = img.size
    px = list(img.pixels)  # RGBA, por filas desde abajo
    paso = max(1, max(w, h) // RESOLUCION)
    gw, gh = w // paso, h // paso
    m = [[False] * gw for _ in range(gh)]
    for gy in range(gh):
        for gx in range(gw):
            x, y = gx * paso + paso // 2, gy * paso + paso // 2
            a = px[(y * w + x) * 4 + 3]
            m[gh - 1 - gy][gx] = a > 0.5  # fila 0 = arriba de la imagen
    bpy.data.images.remove(img)
    return m, gw, gh


def contorno(m, gw, gh):
    """Seguimiento del borde exterior (vecindad de Moore) del primer componente."""
    inicio = None
    for y in range(gh):
        for x in range(gw):
            if m[y][x]:
                inicio = (x, y)
                break
        if inicio:
            break
    if inicio is None:
        return []

    def dentro(p):
        return 0 <= p[0] < gw and 0 <= p[1] < gh and m[p[1]][p[0]]

    puntos = [inicio]
    c = inicio
    b = (inicio[0] - 1, inicio[1])
    for _ in range(gw * gh * 4):
        d0 = DIRS.index((b[0] - c[0], b[1] - c[1])) if (b[0] - c[0], b[1] - c[1]) in DIRS else 4
        siguiente = None
        for k in range(1, 9):
            idx = (d0 + k) % 8
            n = (c[0] + DIRS[idx][0], c[1] + DIRS[idx][1])
            if dentro(n):
                prev = (c[0] + DIRS[(idx - 1) % 8][0], c[1] + DIRS[(idx - 1) % 8][1])
                siguiente = (prev, n)
                break
        if siguiente is None:
            break
        b, c = siguiente
        if c == inicio:
            break
        puntos.append(c)
    return puntos


def rdp(pts, eps):
    if len(pts) < 3:
        return pts

    def dist(p, a, b):
        (x, y), (x1, y1), (x2, y2) = p, a, b
        dx, dy = x2 - x1, y2 - y1
        if dx == 0 and dy == 0:
            return math.hypot(x - x1, y - y1)
        t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
        return math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))

    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = dist(pts[i], pts[0], pts[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        izq = rdp(pts[: idx + 1], eps)
        der = rdp(pts[idx:], eps)
        return izq[:-1] + der
    return [pts[0], pts[-1]]


def nuevo_material(nombre, color, rugosidad=0.5, metalico=0.0):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    r, g, bl = (int(color[i:i + 2], 16) / 255 for i in (1, 3, 5))
    b.inputs["Base Color"].default_value = (r, g, bl, 1.0)
    b.inputs["Roughness"].default_value = rugosidad
    b.inputs["Metallic"].default_value = metalico
    return m


def material_foto(nombre, ruta):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    arbol = m.node_tree
    bsdf = arbol.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.45
    tex = arbol.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(ruta, check_existing=False)
    arbol.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return m


def construir(nombre, cfg):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    ruta_foto = os.path.abspath(os.path.join(FOTOS, cfg["foto"]))
    m, gw, gh = mascara(ruta_foto)
    pts = contorno(m, gw, gh)
    if len(pts) < 3:
        print("sin silueta", nombre)
        return
    pts = rdp(pts, TOLERANCIA)
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts = pts[:-1]

    minx = min(p[0] for p in pts)
    maxx = max(p[0] for p in pts)
    miny = min(p[1] for p in pts)
    maxy = max(p[1] for p in pts)
    # Escala: ancho fijo, o encajar en un cuadrado de "alto" si se indica (CPU en su zócalo).
    k = cfg["ancho"] / (maxx - minx)
    if "alto" in cfg:
        k = min(k, cfg["alto"] / (maxy - miny))
    cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
    alto_u = (maxy - miny) * k
    base = cfg.get("base", False)
    z_ini = 0.0 if base else -cfg["grosor"] / 2
    z_fin = cfg["grosor"] if base else cfg["grosor"] / 2
    # Coordenadas de escena: x derecha, y arriba, z hacia la cámara -> Blender (x, -z, y)
    contorno_xy = [((p[0] - cx) * k, -(p[1] - cy) * k) for p in pts]

    bm = bmesh.new()
    frente = [bm.verts.new((x, -z_fin, y)) for x, y in contorno_xy]
    # Cara frontal (hacia la cámara = escena +z = Blender -y)
    cara_f = bm.faces.new(frente)
    atras = [bm.verts.new((x, -(z_ini), y)) for x, y in contorno_xy]
    cara_b = bm.faces.new(list(reversed(atras)))
    for i in range(len(contorno_xy)):
        j = (i + 1) % len(contorno_xy)
        bm.faces.new([frente[i], frente[j], atras[j], atras[i]])
    bm.normal_update()
    # La cara frontal debe mirar a la cámara (Blender -Y). Si el contorno sale al revés, se invierte.
    if cara_f.normal.y > 0:
        cara_f.normal_flip()
        cara_b.normal_flip()
    bm.normal_update()

    capa_uv = bm.loops.layers.uv.new("UVMap")
    for loop in cara_f.loops:
        x, y = loop.vert.co.x, loop.vert.co.z
        u = (x / k + cx - minx) / (maxx - minx)
        v = (-y / k + cy - miny) / (maxy - miny)
        loop[capa_uv].uv = (u, 1.0 - v)
    for loop in cara_b.loops:
        loop[capa_uv].uv = (0.0, 0.0)

    malla = bpy.data.meshes.new(nombre)
    bm.to_mesh(malla)
    bm.free()
    obj = bpy.data.objects.new(nombre, malla)
    bpy.context.collection.objects.link(obj)

    frente_mat = material_foto(f"{nombre}_foto", ruta_foto)
    malla.materials.append(frente_mat)  # índice 0: las caras de la foto
    malla.materials.append(nuevo_material("Carcasa", "#1E222A", rugosidad=0.5))
    for poly in malla.polygons:
        poly.material_index = 0 if abs(poly.normal.y) > 0.9 and poly.normal.y < 0 else 1
    for m_ in malla.materials:
        m_.use_backface_culling = False  # glTF doubleSided: el contorno puede salir con otro sentido

    # Cara frontal: la foto. Cara trasera: plástico. Laterales: plástico (ya por material_index).
    exportar(nombre)


def exportar(nombre):
    ruta = os.path.join(HERE, f"{nombre}.glb")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=ruta, export_format="GLB", use_selection=True, export_yup=True)
    print("exportado", ruta)


if __name__ == "__main__":
    for nombre, cfg in MODELOS.items():
        construir(nombre, cfg)
