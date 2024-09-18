const express = require("express");
const app = express();

app.get("/status", (req, res) => {
  const filePathBancoPequeno = ""; // adicionar o caminho aqui
  const filePathBancoCompleto = ""; // adicionar o caminho aqui
  const filePathEstrutura = ""; // adicionar o caminho aqui

  const absolutePathBancoPequeno = path.resolve(filePathBancoPequeno);
  const absolutePathBancoCompleto = path.resolve(filePathBancoCompleto);
  const absolutePathEstrutura = path.resolve(filePathEstrutura);

  const resposta = {
    bancoPequeno: {},
    bancoCompleto: {},
    estrutura: {},
  };

  fs.stat(absolutePathBancoPequeno, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ error: "Arquivo não encontrado." });
      }
      return res.status(500).json({ error: "Erro ao acessar o arquivo." });
    }

    resposta.bancoPequeno = {
      tamanho: stats.size,
      unidade: "bytes",
      ultimaAtualizacao: stats.mtime,
    };
  });

  fs.stat(absolutePathBancoCompleto, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ error: "Arquivo não encontrado." });
      }
      return res.status(500).json({ error: "Erro ao acessar o arquivo." });
    }

    resposta.bancoCompleto = {
      tamanho: stats.size,
      unidade: "bytes",
      ultimaAtualizacao: stats.mtime,
    };
  });

  fs.stat(absolutePathEstrutura, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ error: "Arquivo não encontrado." });
      }
      return res.status(500).json({ error: "Erro ao acessar o arquivo." });
    }

    resposta.estrutura = {
      tamanho: stats.size,
      unidade: "bytes",
      ultimaAtualizacao: stats.mtime,
    };
  });
});

app.listen(3333, () => {
  console.log("listening on port 3333");
});
