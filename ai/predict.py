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

def fail(message):
    # Print a JSON error to stdout (not stderr) so the Node server,
    # which only listens on stdout, can see and relay it instead of
    # hanging or getting silently swallowed.
    print(json.dumps({"error": message}))
    sys.exit(1)

if len(sys.argv) < 2:
    fail("no image data provided")

try:
    image_data = sys.argv[1]
    image_data = image_data.split(",")[1] if "," in image_data else image_data
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
except Exception as e:
    fail(f"could not decode image: {e}")

try:
    image = image.convert("L")
    image = image.resize((28, 28))
    # image is a PIL Image here, not a NumPy array yet — .astype()
    # only exists on arrays, so convert with np.array() first.
    img = np.array(image).astype("float32") / 255.0
    img = img.reshape(1, 28, 28, 1)
except Exception as e:
    fail(f"could not preprocess image: {e}")

try:
    model = keras.models.load_model("ai/kibble_model.keras")
except Exception as e:
    fail(f"could not load model: {e}")

try:
    pred = model.predict(img, verbose=0)
    idx = int(np.argmax(pred))
    confidence = float(pred[0][idx])
except Exception as e:
    fail(f"prediction failed: {e}")

result = {
    "label": classes[idx],
    "confidence": confidence
}

print(json.dumps(result))