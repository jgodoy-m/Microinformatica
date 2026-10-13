"""Genera los modelos 3D de las piezas del montaje y los exporta como .glb.

Uso (desde la carpeta juego/modelos):
    /Applications/Blender.app/Contents/MacOS/Blender -b -P generar_modelos.py

Las medidas están en las mismas unidades que la escena de montaje.js.
Convención: en la escena, x = derecha, y = arriba, z = hacia la cámara.
En Blender se modela con Z = arriba, así que (x, y, z) de escena equivale a (x, -z, y) de Blender.
El exportador convierte a glTF (Y arriba) sin cambiar esa correspondencia.

Nombres que usa montaje.js:
  Fan   nodo que gira (ventilador); su origen está en el centro del ventilador.
  Aro   material del aro del ventilador (se ilumina solo con RGB).
  LED   material de la tira de luz (se muestra solo con RGB).
"""
import math
import os

import bpy

SALIDA = os.path.dirname(os.path.abspath(__file__))


def S(x, y, z):
    """Coordenadas de escena -> Blender."""
    return (x, -z, y)


def D(sx, sy, sz):
    """Tamaño de escena -> dimensiones de Blender."""
    return (sx, sz, sy)


def nuevo_material(nombre, color, rugosidad=0.5, metalico=0.0, emision=None, fuerza=0.0):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    r, g, bl = (int(color[i:i + 2], 16) / 255 for i in (1, 3, 5))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    b.inputs["Base Color"].default_value = (lin(r), lin(g), lin(bl), 1.0)
    b.inputs["Roughness"].default_value = rugosidad
    b.inputs["Metallic"].default_value = metalico
    if emision:
        er, eg, eb = (int(emision[i:i + 2], 16) / 255 for i in (1, 3, 5))
        b.inputs["Emission Color"].default_value = (lin(er), lin(eg), lin(eb), 1.0)
        b.inputs["Emission Strength"].default_value = fuerza
    return m


MATERIALES = {}


def mat(nombre, *args, **kwargs):
    if nombre not in MATERIALES:
        MATERIALES[nombre] = nuevo_material(nombre, *args, **kwargs)
    return MATERIALES[nombre]


ORO = dict(color="#D9B25F", rugosidad=0.3, metalico=1.0)


def caja(nombre, centro, tam, material, padre=None, rel=False):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.name = nombre
    o.scale = D(*tam)
    o.location = S(*centro) if not rel else rel_b(centro)
    o.data.materials.append(material)
    if padre is not None:
        o.parent = padre
    return o


def rel_b(c):
    """Desplazamiento relativo (sin origen de escena) en coordenadas de Blender."""
    return (c[0], -c[2], c[1])


def cilindro(nombre, centro, radio, grosor, material, padre=None, rel=False, vertices=40):
    bpy.ops.mesh.primitive_cylinder_add(radius=radio, depth=grosor, vertices=vertices)
    o = bpy.context.active_object
    o.name = nombre
    o.rotation_euler = (math.pi / 2, 0, 0)  # eje del cilindro a lo largo de z de escena
    o.location = rel_b(centro) if rel else S(*centro)
    o.data.materials.append(material)
    if padre is not None:
        o.parent = padre
    return o


def aro(nombre, centro, radio, grosor, padre, rel=True):
    bpy.ops.mesh.primitive_torus_add(major_radius=radio, minor_radius=grosor, major_segments=48, minor_segments=8)
    o = bpy.context.active_object
    o.name = nombre
    o.rotation_euler = (math.pi / 2, 0, 0)
    o.location = rel_b(centro) if rel else S(*centro)
    o.data.materials.append(mat("Aro", "#88C0D0", rugosidad=0.4, emision="#88C0D0", fuerza=0.0))
    o.parent = padre
    return o


def ventilador(centro_rel, radio, padre, color_aro="#88C0D0"):
    """Ventilador con nodo 'Fan' que gira alrededor de z de escena."""
    raiz = bpy.data.objects.new("Fan", None)
    bpy.context.collection.objects.link(raiz)
    raiz.empty_display_size = radio * 0.3
    raiz.location = rel_b(centro_rel)
    raiz.parent = padre
    cilindro("Disco", (0, 0, 0), radio, 0.18, mat("Disco", "#0E1014", rugosidad=0.65), padre=raiz, rel=True)
    for i in range(7):
        piv = bpy.data.objects.new(f"Pala{i}", None)
        bpy.context.collection.objects.link(piv)
        piv.rotation_euler = (0, i * 2 * math.pi / 7, 0)
        piv.parent = raiz
        bpy.ops.mesh.primitive_cube_add(size=1)
        pala = bpy.context.active_object
        pala.name = f"Pala{i}_mesh"
        pala.scale = (0.36 * radio, 0.05, 0.72 * radio)
        pala.location = rel_b((0, 0.46 * radio, 0.1))
        pala.data.materials.append(mat("Pala", "#2B3038", rugosidad=0.6))
        pala.parent = piv
    cilindro("Cubo", (0, 0, 0.1), radio * 0.3, 0.2, mat("Metal", "#3B4252", rugosidad=0.3, metalico=0.8), padre=raiz, rel=True, vertices=24)
    aro("Aro", (0, 0, 0.1), radio * 0.94, radio * 0.06, padre=raiz)
    return raiz


def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATERIALES.clear()


def exportar(nombre):
    ruta = os.path.join(SALIDA, f"{nombre}.glb")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=ruta, export_format="GLB", use_selection=True, export_yup=True)
    print("exportado", ruta)


# ---------- Modelos ----------

def modelo_cpu():
    limpiar()
    caja("Sustrato", (0, 0, 0.07), (4.1, 4.1, 0.14), mat("Sustrato", "#1F2A24", rugosidad=0.6))
    caja("Tapa", (0, 0, 0.22), (3.4, 3.4, 0.16), mat("Tapa", "#C9D1DC", rugosidad=0.35, metalico=0.6))
    exportar("cpu")


def modelo_ram(gen):
    limpiar()
    ddr5 = gen == "DDR5"
    caja("PCB", (0, 0, 0), (0.45, 13, 1.0), mat("PCB", "#15181E", rugosidad=0.6))
    caja("Disipador", (0, 1.0, 0.45), (0.5, 10.6, 0.5),
         mat("Disipador", "#1B1F27" if ddr5 else "#1E222A", rugosidad=0.4))
    caja("Acento", (0, 4.9, 0.45), (0.52, 1.6, 0.52),
         mat("Acento", "#2E3440" if ddr5 else "#8B2E2E", rugosidad=0.4))
    caja("Contactos", (0, -6.2, -0.5), (0.45, 0.8, 0.1), mat("Oro", **ORO))
    if ddr5:
        caja("Tira", (0.26, 1.0, 0.72), (0.1, 9.8, 0.1), mat("LED", "#88C0D0", emision="#88C0D0", fuerza=1.5))
    exportar("ram-ddr5" if ddr5 else "ram-ddr4")


def modelo_gpu():
    limpiar()
    caja("Carcasa", (0, 0, 0), (11, 4.6, 2.0), mat("Carcasa", "#1C2029", rugosidad=0.5, metalico=0.3))
    caja("Tapa", (0, 2.4, 0), (11, 0.2, 2.05), mat("Plastico", "#2B3038", rugosidad=0.6))
    caja("Soporte", (-5.6, 0, -0.4), (0.5, 4.6, 0.3), mat("Soporte", "#A8B0BD", rugosidad=0.3, metalico=0.75))
    caja("Contacto", (0, -2.45, -1.0), (9.5, 0.25, 0.05), mat("Oro", **ORO))
    caja("Conector", (4.6, 1.6, 1.25), (1.0, 1.3, 0.5), mat("Negro", "#15181E", rugosidad=0.6))
    ventilador((-2.6, 0, 1.0), 1.6, None)
    ventilador((2.6, 0, 1.0), 1.6, None)
    exportar("gpu")


def modelo_nvme():
    limpiar()
    caja("PCB", (0, 0, 0), (7.9, 2.2, 0.25), mat("PCB", "#2C4B3E", rugosidad=0.5, metalico=0.4))
    caja("Chip", (-2.2, 0, 0.18), (1.6, 1.2, 0.12), mat("Negro", "#15181E", rugosidad=0.6))
    caja("Contactos", (3.6, 0, -0.14), (0.7, 2.2, 0.05), mat("Oro", **ORO))
    exportar("nvme")


def modelo_psu():
    limpiar()
    caja("Carcasa", (0, 0, 0), (16, 6.5, 7), mat("Carcasa", "#1E222A", rugosidad=0.5))
    ventilador((3.6, -0.2, 3.52), 2.4, None)
    exportar("psu")


if __name__ == "__main__":
    modelo_cpu()
    modelo_ram("DDR4")
    modelo_ram("DDR5")
    modelo_gpu()
    modelo_nvme()
    modelo_psu()
