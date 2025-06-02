import json, os, random
from main import prediksi
from contextMmanagement.context import context_manager as run_context

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

def test():
    user = input("kamu: ")
    intent = prediksi([user])
    intent_key = intent[0]  
    print("intent:", intent_key)

    with open("./dataset/respon.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    if intent_key in data:
        if intent_key == 'guess_name_user':
            print("batara:", run_context(intent_key, user))
        else:
            print("batara:", random.choice(data[intent_key]))
if __name__ == "__main__":
    while True:
        test()
