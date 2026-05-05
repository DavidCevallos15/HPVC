import cv2
import os
import numpy as np

def aplicar_anonimizado_quirurgico():
    # --- CONFIGURACIÓN DE TU FOTO ---
    folder = 'public'
    # Buscamos el archivo que contenga "Puerta 3.1"
    archivos = [f for f in os.listdir(folder) if "Puerta 3.1" in f]
    
    if not archivos:
        print("❌ No encontré ninguna foto que contenga 'Puerta 3.1' en /public")
        return

    nombre_real = archivos[0]
    ruta_completa = os.path.join(folder, nombre_real)
    
    # MÉTODO BLINDADO: Lee la imagen incluso con espacios o puntos en el nombre
    img = cv2.imdecode(np.fromfile(ruta_completa, dtype=np.uint8), cv2.IMREAD_COLOR)
    
    if img is None:
        print(f"❌ Error crítico: No pude leer la imagen {nombre_real}")
        return

    print(f"🎯 Foto encontrada y cargada: {nombre_real}")
    alto, ancho = img.shape[:2]

    # --- COORDENADAS EXACTAS PARA TU PANORAMA ---
    # He ajustado x, y, w, h para que tapen todo el rostro basándome en tu imagen
    objetivos = [
        {
            "desc": "Niña de blanco (frente a ventanilla)", 
            "x": 2210, "y": 530, "w": 50, "h": 70
        },
        {
            "desc": "Anciano (Silla de ruedas)", 
            "x": 2980, "y": 545, "w": 75, "h": 90
        },
        {
            "desc": "Hombre camisa café (fondo)", 
            "x": 2425, "y": 465, "w": 45, "h": 60
        }
    ]

    for obj in objetivos:
        x, y, w, h = obj["x"], obj["y"], obj["w"], obj["h"]
        
        # Seguridad: evitar que el recuadro se salga de los límites de la imagen
        if x + w > ancho or y + h > alto or x < 0 or y < 0:
            print(f"⚠️ El objetivo {obj['desc']} está fuera de los límites.")
            continue

        # Extraer la región de interés (ROI) del rostro
        roi = img[y:y+h, x:x+w]
        
        if roi is not None and roi.size > 0:
            # Aplicar desenfoque fuerte (GaussianBlur) para anonimizar totalmente
            # (99, 99) asegura que el rostro sea irreconocible
            img[y:y+h, x:x+w] = cv2.GaussianBlur(roi, (99, 99), 35)
            print(f"✅ Rostro protegido: {obj['desc']}")

    # --- GUARDAR LA FOTO SOBREESCRIBIENDO EL ORIGINAL ---
    _, extension = os.path.splitext(nombre_real)
    is_success, buffer = cv2.imencode(extension, img, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
    
    if is_success:
        with open(ruta_completa, "wb") as f:
            f.write(buffer)
        print("\n🚀 ¡PROCESO COMPLETADO! Los rostros han sido tapados con precisión quirúrgica.")
    else:
        print("❌ Error: No se pudo guardar la imagen procesada.")

if __name__ == "__main__":
    aplicar_anonimizado_quirurgico()