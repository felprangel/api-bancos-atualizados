const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const filePathBancoPequeno = ""; // adicionar o caminho aqui
const filePathBancoCompleto = ""; // adicionar o caminho aqui
const filePathEstrutura = ""; // adicionar o caminho aqui

const absolutePathBancoPequeno = path.resolve(filePathBancoPequeno);
const absolutePathBancoCompleto = path.resolve(filePathBancoCompleto);
const absolutePathEstrutura = path.resolve(filePathEstrutura);

const wss = new WebSocket.Server({ port: 3333 }, () => {
  console.log("Servidor WebSocket ouvindo na porta 3333");
});

wss.on("connection", (ws) => {
  console.log("Novo cliente conectado");

  sendUpdates(ws);

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

function collectFileStats(filePath) {
  return new Promise((resolve) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === "ENOENT") {
          return resolve({ error: "Arquivo não encontrado." });
        }
        return resolve({ error: "Erro ao acessar o arquivo." });
      }

      resolve({
        tamanho: stats.size,
        unidade: "bytes",
        ultimaAtualizacao: stats.mtime,
      });
    });
  });
}

async function sendUpdates(ws) {
  const resposta = {
    bancoPequeno: {},
    bancoCompleto: {},
    estrutura: {},
  };

  resposta.bancoPequeno = await collectFileStats(absolutePathBancoPequeno);
  resposta.bancoCompleto = await collectFileStats(absolutePathBancoCompleto);
  resposta.estrutura = await collectFileStats(absolutePathEstrutura);

  ws.send(JSON.stringify(resposta));
}

async function broadcastUpdates() {
  const resposta = {
    bancoPequeno: {},
    bancoCompleto: {},
    estrutura: {},
  };

  resposta.bancoPequeno = await collectFileStats(absolutePathBancoPequeno);
  resposta.bancoCompleto = await collectFileStats(absolutePathBancoCompleto);
  resposta.estrutura = await collectFileStats(absolutePathEstrutura);

  const message = JSON.stringify(resposta);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

fs.watch(absolutePathBancoPequeno, (eventType) => {
  if (eventType === "change") {
    console.log("Arquivo bancoPequeno alterado");
    broadcastUpdates();
  }
});

fs.watch(absolutePathBancoCompleto, (eventType) => {
  if (eventType === "change") {
    console.log("Arquivo bancoCompleto alterado");
    broadcastUpdates();
  }
});

fs.watch(absolutePathEstrutura, (eventType) => {
  if (eventType === "change") {
    console.log("Arquivo estrutura alterado");
    broadcastUpdates();
  }
});
