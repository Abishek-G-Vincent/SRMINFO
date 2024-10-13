import random
import json
import torch
from model import Neuralnet  #'Neuralnet' class from model.py
from nltk_utils import bag_of_words, tokenize  # 'nltk_utils.py'

# for CUDA availability
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load intents from JSON file
with open('intents.json', 'r') as f:
    intents = json.load(f)

# Add safe globals if needed
torch.serialization.add_safe_globals([Neuralnet])


# Load pre-trained data
FILE = "data.pth"
data = torch.load(FILE,weights_only=True,map_location=device)

# Extract data from loaded file
input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data["all_words"]
tags = data["tags"]
model_state = data["model_state"]

# Initialize model and load its state
model = Neuralnet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "SRMINFO"
def get_response(msg):
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])
    elif prob.item() > 0.5:
        return "I'm not sure I fully understand. Could you clarify your question?"
    
    return "I don't know the answer to that. Maybe try rephrasing?"


if __name__ == "__main__":
    print("Let's chat! (type 'quit' to exit)")
    while True:
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)
