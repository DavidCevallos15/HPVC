import cv2
from ultralytics import YOLO
import os

# Nombre del archivo que ya tienes en la carpeta
MODELO = "yolov8n-face.pt"

print("--- INICIANDO PROCESO ---")

if not os.path.exists(MODELO):
    print(f"❌ ERROR: No encuentro el archivo {MODELO} en la carpeta.")
else:
    print("✅ Archivo detectado. Cargando IA...")
    model = YOLO(MODELO) 

    def procesar(nombre):
        # Buscamos en la carpeta public
        ruta = os.path.join('public', nombre)
        if not os.path.exists(ruta):
            print(f"⚠️ No existe la foto: {ruta}")
            return

        img = cv2.imread(ruta)
        results = model(img)

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                # Aplicamos el borroso
                img[y1:y2, x1:x2] = cv2.GaussianBlur(img[y1:y2, x1:x2], (99, 99), 30)

        resultado = os.path.join('public', "LISTA_" + nombre)
        cv2.imwrite(resultado, img)
        print(f"✅ CARA BORRADA en: {resultado}")

    # Tus fotos
    fotos = [
        'entrada puerta 3.jpeg', 
        'entrada puerta 4.jpeg', 
        'puerta 1 para entrar a triaje.emergencia.jpeg'
    ]

    for f in fotos:
        procesar(f)

print("--- FIN DEL PROCESO ---")