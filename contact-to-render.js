import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import SibApiV3Sdk from 'sib-api-v3-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configura Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// API POST /submit-form
app.post('/submit-form', async (req, res) => {
  const { name, email, textarea } = req.body;

  const html = `
    <h2>Nuovo messaggio dal sito</h2>
    <p><strong>Nome:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Messaggio:</strong><br>${textarea.replace(/\n/g, '<br>')}</p>
  `;

  const emailData = {
    sender: { name: 'Form Website', email: process.env.MAIL_FROM },
    to: [{ email: process.env.MAIL_TO }],
    subject: 'Nuovo messaggio dal form',
    htmlContent: html,
    textContent: `Nome: ${name}\nEmail: ${email}\nMessaggio:\n${textarea}`
  };

  console.log('📨 POST ricevuto:', { name, email, textarea });
  console.log('📧 Dati email:', emailData);
  if (!name || !email || !textarea) {
    console.error('Errore: dati mancanti');
    return res.status(400).send('Dati mancanti');
  }
  if (!process.env.BREVO_API_KEY) {
    console.error('Errore: chiave API Brevo mancante');
    return res.status(500).send('Chiave API mancante');
  }
  if (!process.env.MAIL_TO || !process.env.MAIL_FROM) {
    console.error('Errore: indirizzi email mancanti');
    return res.status(500).send('Indirizzi email mancanti');
  }

  try {
    await apiInstance.sendTransacEmail(emailData);
    res.status(200).json({ message: 'Email inviata con successo' });
  } catch (err) {
    console.error('Errore invio:', err);
    res.status(500).send('Errore invio');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server avviato su http://localhost:${process.env.PORT || 3000}`);
});
