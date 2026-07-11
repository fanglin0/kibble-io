import numpy as np
import tensorflow as tf
# from tensorflow import keras
import keras
from keras import layers
classes = [
    "cat",
    "dog",
    "duck",
    "hamburger",
    "knee",
]
X=[]
y=[]
for index, name in enumerate(classes):
    data = np.load(
        f"data/full-numpy_bitmap-{name}.npy"
    )
    #only take 2000 examples
    data = data[:2000]
    X.append(data)
    y.extend(
        [index]*len(data)
    )

X = np.concatenate(X)
y=np.array(y)

#normalize pixel
X = X.astype("float32") /255.0

# reshape for cnn
X = X.reshape(
    -1,
    28,
    28,
    1
)

model = keras.Sequential([
    layers.Conv2D(
        32,
        (3,3),
        activation="relu",
        input_shape=(28,28,1)
    ),
    layers.MaxPooling2D(),
    layers.Conv2D(
        64,
        (3,3),
        activation="relu"
    ),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(
        128,
        activation="relu"
    ),
    layers.Dense(
        len(classes),
        activation="softmax"
    )
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)
model.fit(
    X,
    y,
    epochs=5,
    validation_split=.2
)
model.save(
    "kibble_model.keras"
)
print("Training completed")

