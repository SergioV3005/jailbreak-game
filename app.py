import streamlit as st
from ollama_client import LocalLLM

def load_secret(level):
    with open(f"secrets/{level}_secret.txt") as f:
        return f.read().strip()

st.title("🧠 Jailbreak the LLM")
level = st.selectbox("Choose Difficulty", ["easy", "medium", "hard"])
secret = load_secret(level)
llm = LocalLLM(f"prompts/{level}_prompt.txt")

user_input = st.text_input("Try to jailbreak the LLM:")

if st.button("Submit"):
    response = llm.query(user_input)
    st.markdown(f"**LLM Response:** {response}")
    if secret in response:
        st.success("🎉 Secret revealed! You successfully jailbroke the model.")
    else:
        st.warning("❌ Try again. The LLM is resisting...")