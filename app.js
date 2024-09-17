const express = require("express");
const app = express();

app.get("/status", (req, res) => {
  const filePath = ""; // adicionar o caminho aqui

  const absolutePath = path.resolve(filePath);

  fs.stat(absolutePath, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ error: "Arquivo não encontrado." });
      }
      return res.status(500).json({ error: "Erro ao acessar o arquivo." });
    }

    res.json({ tamanho: stats.size, unidade: "bytes" });
  });
});

app.listen(3333, () => {
  console.log("listening on port 3333");
});
