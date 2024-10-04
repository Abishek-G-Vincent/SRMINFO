class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        };

        this.state = false;
        this.messages = [];
    }

    display() {
        const { openButton, chatBox, sendButton } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox));

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // Show or hide the box
        if (this.state) {
            chatbox.classList.add('chatbox--active');
            this.messages.push({ name: "SRMINFO", message: "Hi" });
            this.messages.push({ name: "SRMINFO", message: "How can I help you?" });
            this.updateChatText(chatbox);
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    typewriterEffect(chatbox, message, callback) {
        const messageItem = { name: "SRMINFO", message: "" };
        this.messages.push(messageItem);
        this.updateChatText(chatbox);

        let charIndex = 0;

        const typeNextChar = () => {
            if (charIndex < message.length) {
                messageItem.message += message[charIndex++];
                this.updateChatText(chatbox);
                setTimeout(typeNextChar, 20); // Adjust typing speed here
            } else {
                if (callback) callback(); // Call the callback function after finishing typing
            }
        };

        typeNextChar();
    }

    onSendButton(chatbox) {
        const textField = chatbox.querySelector('input');
        let userMessage = textField.value;
        if (userMessage === "") {
            return;
        }

        this.messages.push({ name: "User", message: userMessage });
        this.updateChatText(chatbox);
        textField.value = '';

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: userMessage }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            // Instead of pushing the message directly, use the typewriter effect
            this.typewriterEffect(chatbox, r.answer);
        }).catch((error) => {
            console.error('Error:', error);
            this.messages.push({ name: "SRMINFO", message: "Sorry, I didn't understand that." });
            this.updateChatText(chatbox);
        });
    }

    updateChatText(chatbox) {
        let html = '';
        this.messages.slice().reverse().forEach(item => {
            if (item.name === "SRMINFO") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
chatbox.display();
