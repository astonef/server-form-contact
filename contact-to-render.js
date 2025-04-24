import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/submit-form', async (req, res) => {
  const { name, email, textarea } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: 'Nuovo messaggio dal form',
      text: `Nome: ${name}\nEmail: ${email}\nMessaggio:\n${textarea}`,
      html: `
        <h2>Nuovo messaggio dal sito</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Messaggio:</strong><br>${textarea.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.status(200).json({ message: 'Email inviata con successo' });
  } catch (err) {
    console.error('Errore invio:', err);
    res.status(500).send('Errore invio');
  }
});

app.listen(process.env.PORT || 3000);
