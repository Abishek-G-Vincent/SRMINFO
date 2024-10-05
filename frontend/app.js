class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
        this.initialMessageSent = false;
    }

    display() {
        const {openButton, chatBox, sendButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;
        if (this.state) {
            chatbox.classList.add('chatbox--active');
            if (!this.initialMessageSent) {
                let msg1 = { name: "SRMINFO", message: "Hi" };
                let msg2 = { name: "SRMINFO", message: "How can I help you?" };
                this.messages.push(msg1, msg2);
                this.initialMessageSent = true;
            }
            this.updateChatText(chatbox);
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "SRMINFO", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            let errorMsg = { name: "SRMINFO", message: "Sorry, something went wrong. Please try again later." };
            this.messages.push(errorMsg);
            this.updateChatText(chatbox);
            textField.value = '';
        });
        
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "SRMINFO")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
        chatmessage.scrollTop = chatmessage.scrollHeight; // Scroll to the bottom

         // links are clickable (without reload)
         const links = chatmessage.querySelectorAll('a');
         links.forEach(link => {
             link.addEventListener('click', function(event) {
                 event.preventDefault(); // to prevent default action
                 window.open(link.href, '_blank'); // to open the link in a new tab
             });
         });
    }
}


const chatbox = new Chatbox();
chatbox.display();
