fetch('whatsapp.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('whatsapp-containerr').innerHTML = data;

    console.log("WhatsApp HTML loaded");

    // Now that the HTML is loaded, initialize functionality
    const whatsappButton = document.getElementById('whatsapp-button');
    const whatsappChat = document.getElementById('whatsapp-chat');
    const closeChat = document.getElementById('close-chat');
    const sendMessage = document.getElementById('send-message');
    const messageInput = document.getElementById('whatsapp-message');
    const chatBody = document.getElementById('chat-body');
    const whatsappNumber = '+447497775838'; // Your WhatsApp number

    whatsappButton.addEventListener('click', () => {
      whatsappChat.style.display = 'flex';
    });

    closeChat.addEventListener('click', () => {
      whatsappChat.style.display = 'none';
    });

    function redirectToWhatsApp(message) {
      const formattedNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappURL = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappURL, '_blank');
    }

    function handleMessageSend() {
      const message = messageInput.value.trim();
      if (message !== '') {
        const userMsg = document.createElement('div');
        userMsg.className = 'user-message';
        userMsg.innerText = message;
        chatBody.appendChild(userMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
          redirectToWhatsApp(message);
          messageInput.value = '';
        }, 500);
      }
    }

    sendMessage.addEventListener('click', handleMessageSend);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleMessageSend();
      }
    });
  });

console.log("whatsapp functionality is working");
