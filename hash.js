// Salve este código como hash.js e execute com: node hash.js
import bcrypt from "bcryptjs";

const senha = "admin";
const saltRounds = 10;

bcrypt.hash(senha, saltRounds, function (err, hash) {
  if (err) {
    console.error("Erro ao gerar hash:", err);
  } else {
    console.log('Hash gerado para "admin":', hash);
  }
});
