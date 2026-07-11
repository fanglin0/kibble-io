import sys
import json
import base64
import io
import numpy as np
from PIL import Image
import keras

classes = [
    "cat",
    "dog",
    "duck",
    "hamburger",
    "knee",
]

model = keras.models.load_model("ai/kibble_model.keras")
image_data = sys.argv[1]

image_data = image_data.split(",")[1]
image_bytes = base64.b64decode(image_data)
image = Image.open(io.BytesIO(image_bytes))
image_bytes = base64.b64decode(image_data)
image = Image.open(io.BytesIO(image_bytes))

image = image.convert("L")
image = image.resize((28,28))
img = image.astype("float32")/255.0
img = img.reshape(1,28,28,1)
pred = model.predict(img,verbose=0)
idx = np.argmax(pred)
confidence = float(pred[0][idx])
result = {
    "label": classes[idx],
    "confidence": confidence
}

print(json.dumps(result))