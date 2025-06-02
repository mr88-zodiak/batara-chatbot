from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix, ConfusionMatrixDisplay
import pandas as pd
import matplotlib.pyplot as plt

# Load data
data = pd.read_json('./dataset/command_cleaned.json')
df = pd.DataFrame(data)

# Vectorize 'command' kolom jadi fitur numerik
vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_df=0.95)
X = vectorizer.fit_transform(df['command'])  # Ini hasil fit_transform nya, bukan vectorizer nya sendiri

# Encode label dari 'type_command'
le = LabelEncoder()
y_encode = le.fit_transform(df['type_command'])

# Split data fitur dan label
x_train, x_test, y_train, y_test = train_test_split(X, y_encode, test_size=0.2, random_state=42)

# Inisialisasi dan train KNN
knn = KNeighborsClassifier(n_neighbors=3,metric='cosine')
knn.fit(x_train, y_train)

train_acc = knn.predict(x_train)
test_acc = knn.predict(x_test)

# Hitung akurasi model berdasarkan seluruh data uji
# accuracy_test = accuracy_score(y_test, test_acc)
# accuracy_train = accuracy_score(y_train, train_acc)
# print("Akurasi model (train):", accuracy_train)
# print("Akurasi model (test):", accuracy_test)

# text = ["makasih"]  # harus list/iterable
# # y_pred = knn.predict(vectorizer.transform(text))
# y_pred = knn.predict(x_test)
# print("Prediksi:", le.inverse_transform(y_pred))
def prediksi(text):
    text_vect = vectorizer.transform(text)
    y_pred = knn.predict(text_vect)
    return le.inverse_transform(y_pred)



# cm = confusion_matrix(y_test, y_pred, labels=knn.classes_)
# disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=le.inverse_transform(knn.classes_))

# plt.figure(figsize=(8, 6))
# disp.plot(cmap=plt.cm.Blues, values_format='d')
# plt.title(f'Akurasi KNN: {accuracy_test:.2f}')
# plt.show()
