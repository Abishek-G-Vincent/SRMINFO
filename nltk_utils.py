import nltk
import numpy as np
from nltk.stem import WordNetLemmatizer

lemmatizer = WordNetLemmatizer()

def tokenize(sentence):
    return nltk.word_tokenize(sentence)

def lemmatize(word):
    return lemmatizer.lemmatize(word.lower())

def bag_of_words(tokenized_sentence, all_words):
    tokenized_sentence = [lemmatize(w) for w in tokenized_sentence]  # Use lemmatization
    bag = np.zeros(len(all_words), dtype=np.float32)
    for idx, w in enumerate(all_words):
        if w in tokenized_sentence:
            bag[idx] = 1.0
    return bag
