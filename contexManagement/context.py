import json
import random
from mtranslate import translate
import spacy
nlp = spacy.load("en_core_web_sm")

with open("./contextMmanagement/ask_help.json",'r',encoding='utf-8') as file:
    ask_user = json.load(file)
def chat_ask_user(intent, text):
    # Load data respon dan context
    with open("./dataset/respon.json", 'r', encoding='utf-8') as f:
        respon = json.load(f)
    with open('./contextMmanagement/context.json', 'r', encoding='utf-8') as f:
        state = json.load(f)

    ask_user = ["greeting"]  # contoh intent yang bikin chatbot tanya user
    # Misal intent "ask_help" adalah chatbot tanya "Kamu butuh bantuan?"

    # Kalau intent chatbot adalah intent yang meminta user merespon
    if intent in ask_user:
        # Simpan state menunggu user respon
        state['state'] = 'waiting_user_response'
        state['intent'] = intent

        # Simpan kembali ke file context.json
        with open('./contextMmanagement/context.json', 'w', encoding='utf-8') as f:
            json.dump(state, f, indent=2)

        return respon[intent]  # misal "Kamu butuh bantuan?"

    # Kalau chatbot sedang menunggu jawaban user dan user jawab "yes_response"  intent == "yes_response"
    elif state.get('state') == 'waiting_user_response' and text in ['boleh',"iya","ok","oke"]:
        state['state'] = 'response'  # pindah ke state berikutnya, misal minta detail bantuan
        state['intent'] = intent

        # Update file context.json
        with open('./contextMmanagement/context.json', 'w', encoding='utf-8') as f:
            json.dump(state, f, indent=2)
        with open('./contextMmanagement/context.json', 'r', encoding='utf-8') as f:
            state = json.load(f)
        response = state['state']
        with open('./contextMmanagement/chat_bot_respon.json','r',encoding='utf-8') as f:
            data = json.load(f)
        return data[response]

    # Kalau chatbot sudah dalam state response dan user jawab sesuatu (bantuan detail)
    elif state.get('state') == 'response':
        # Simpan detail bantuan user di context
        # state['last_help_request'] = text
        state['state'] = None  # reset state
        state['intent'] = None

        with open('./contextMmanagement/context.json', 'w', encoding='utf-8') as f:
            json.dump(state, f, indent=2)

        return f"Oke, saya akan coba bantu tentang '{text}'."

    else:
        return "Maaf, saya belum mengerti. Bisa ulangi?"


# def chat_ask_user(intent,text):
#     with open("./dataset/respon.json",'r',encoding='utf-8') as f:
#         respon = json.load(f)
#     with open('./contextMmanagement/context.json', 'r', encoding='utf-8') as f:
#         state = json.load(f)
#     if respon in ask_user:
#         if state.get('state') == 'waiting_user_response':
#             if intent == "yes_response":
#                 state['intent'] = "yes_response"
#                 state['state'] = "response"



def Ner_context(text):
    text_translate = translate(text, "en", "id")
    doc = nlp(text_translate)
    
    with open("./contextMmanagement/context.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    if "entities" not in data:
        data["entities"] = {}

    for ent in doc.ents:
        label = ent.label_
        value = ent.text

        if label not in data["entities"]:
            data["entities"][label] = []

        if value not in data["entities"][label]:
            data["entities"][label].append(value)

    with open("./contextMmanagement/context.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


def context_manager(prediksi, text):
    Ner_context(text)
    chat_ask_user(prediksi, text)
    with open("./contextMmanagement/context.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    entitas = data.get('entities', {})
    list_nama = entitas.get("PERSON", [])
    if list_nama:
        with open("./dataset/respon.json", "r", encoding="utf-8") as f:
            respon = json.load(f)
        nama = list_nama[0]
        return random.choice(respon[prediksi]).format(nama)
    else:
        with open("./contextMmanagement/aware.json", "r", encoding="utf-8") as f:
            respon = json.load(f)
        return random.choice(respon['aware_message'])