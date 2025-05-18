import requests

class LocalLLM:
    def __init__(self, system_prompt_path):
        with open(system_prompt_path, 'r') as f:
            self.system_prompt = f.read()

    def query(self, user_input):
        payload = {
            "model": "llama3.2:1b",
            "messages": [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_input}
            ],
            "stream": False
        }

        response = requests.post("http://localhost:11434/api/chat", json=payload)
        response.raise_for_status()
        data = response.json()
        return data['message']['content'].strip()
