import random
import json
import torch
from model import Neuralnet  # Ensure 'model.py' contains 'Neuralnet' class
from nltk_utils import bag_of_words, tokenize  # Ensure 'nltk_utils.py' contains these functions

# Check for CUDA availability
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load intents from JSON file
with open('intents.json', 'r') as f:
    intents = json.load(f)

# Add safe globals if needed (e.g., for custom objects)
torch.serialization.add_safe_globals([Neuralnet])

# Suppress the specific FutureWarning about weights_only locally

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

bot_name = "SRM_Assist"
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
    
    return "I do not understand..."


if __name__ == "__main__":
    print("Let's chat! (type 'quit' to exit)")
    while True:
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)