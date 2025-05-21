import customtkinter as ctk
import sys
import os


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from knn import predicted_respon

class ChatApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("error 404")
        self.geometry("400x600")
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("green")

   
        self.chat_frame = ctk.CTkScrollableFrame(self, width=380, height=500)
        self.chat_frame.pack(pady=(10, 0), padx=10, fill="both", expand=False)

  
        self.input_frame = ctk.CTkFrame(self)
        self.input_frame.pack(side="bottom", fill="x", pady=(10, 20), padx=10)

        self.text_input = ctk.CTkEntry(self.input_frame, width=280, height=40, placeholder_text="Ketik pesan...")
        self.text_input.pack(side="left", padx=(0, 10))

        self.send_button = ctk.CTkButton(self.input_frame, text="Send", width=60, command=self.send_message)
        self.send_button.pack(side="right")

    def send_message(self):
        message = self.text_input.get().strip()
        if message:
            self.add_bubble(message, is_user=True)
            self.text_input.delete(0, "end")
            self.after(1000, lambda: self.add_bubble(predicted_respon(message), is_user=False))


    def add_bubble(self, message, is_user=True):
        bubble = ctk.CTkLabel(
            self.chat_frame,
            text=message,
            anchor="w",
            justify="left",
            wraplength=250,
            corner_radius=12,
            font=("Arial", 14),
            fg_color="#25D366" if is_user else "#363434",
            text_color="white",
            padx=10,
            pady=8,
        )
        bubble.pack(
            anchor="w" if is_user else "e",
            padx=10,
            pady=5,
        )
   
        self.chat_frame.update_idletasks()
        self.chat_frame._parent_canvas.yview_moveto(1.0)



if __name__ == "__main__":
    app = ChatApp()
    app.mainloop()
