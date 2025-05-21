from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
import json, random,os,re


base_dir = os.path.dirname(__file__)
def normalize_text(text):
    text = text.lower()
    text = re.sub(r'terimakasih', 'terima kasih', text)
    return text

with open('./dataset/command_cleaned.json', 'r') as file:
    data = json.load(file)
    X = [normalize_text(' '.join(item["command"])) for item in data] #' '.join(item["command"]) for item in data]
    y = [item["type_command"] for item in data]


model = make_pipeline(
    TfidfVectorizer(),
    KNeighborsClassifier(n_neighbors=3)
)


model.fit(X, y)

# Prediksi contoh input
# test_input = "aku boleh kenalan"
# predicted = model.predict([test_input])[0]
# print(f"command: {test_input}")
# print(f"Predicted: {predicted}")
def predicted_respon(command):
    predicted = model.predict([command])[0]
    if predicted == 'math':
        try:
            command = eval(command)
            respon = predicted_math(command)
        except:
            respon = predicted_math(command)
        return respon
    with open('./dataset/respon.json', 'r',encoding='utf-8') as file:
        responses = json.load(file)
        respon = random.choice(responses[predicted])

    return respon
def predicted_math(command):
    new_respon = []
    with open('./dataset/respon.json','r',encoding='utf-8') as file:
        data = json.load(file)
        for x in data['math']:
            new_respon.append(x.replace("{}",str(command)))
    respon = random.choice(new_respon)
    return respon
