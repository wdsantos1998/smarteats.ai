import json
import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # Loads the .env file into environment variables

load_dotenv()  # Load environment variables from .env
api_key = os.getenv('OPENAI_API_KEY')

client = OpenAI(api_key=api_key)

def chat_with_model(conversation_history):
    try:
        response = client.chat.completions.create(model="gpt-4",
        messages=conversation_history)
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No conversation history provided.")
        sys.exit(1)

    conversation_history = json.loads(sys.argv[1])
    ai_response = chat_with_model(conversation_history)
    print(ai_response)
