const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
require("dotenv").config();

const filePathBancoPequeno = process.env.PATH_BANCO_PEQUENO;
const filePathBancoCompleto = process.env.PATH_BANCO_COMPLETO;
const filePathEstrutura = process.env.PATH_ESTRUTURA;

const absolutePathBancoPequeno = path.resolve(filePathBancoPequeno);
const absolutePathBancoCompleto = path.resolve(filePathBancoCompleto);
const absolutePathEstrutura = path.resolve(filePathEstrutura);

let timeoutIdPequeno;
let timeoutIdCompleto;
let timeoutIdEstrutura;

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

function determineFileState(stats) {
  const now = new Date();
  const lastModified = new Date(stats.mtime);
  const timeDiff = (now - lastModified) / 1000;

  if (lastModified.toDateString() !== now.toDateString()) {
    return "anterior";
  }
  if (timeDiff > 10) {
    return "atualizado";
  }
  return "atualizando";
}

async function collectFileStats(filePath) {
  return new Promise((resolve) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === "ENOENT") {
          return resolve({ error: "Arquivo não encontrado." });
        }
        return resolve({ error: "Erro ao acessar o arquivo." });
      }

      const estado = determineFileState(stats);
      resolve({
        tamanho: stats.size,
        unidade: "bytes",
        ultimaAtualizacao: stats.mtime,
        estado: estado,
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

fs.watchFile(absolutePathBancoPequeno, { interval: 500 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log("Arquivo bancoPequeno alterado");
    if (timeoutIdPequeno) {
      clearTimeout(timeoutIdPequeno);
    } else {
      broadcastUpdates();
    }

    timeoutIdPequeno = setTimeout(() => {
      console.log("Arquivo pronto");
      broadcastUpdates();
    }, 30000); // 30 seg
  }
});

fs.watchFile(absolutePathBancoCompleto, { interval: 500 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log("Arquivo bancoCompleto alterado");
    if (timeoutIdCompleto) {
      clearTimeout(timeoutIdCompleto);
    } else {
      broadcastUpdates();
    }

    timeoutIdCompleto = setTimeout(() => {
      console.log("Arquivo pronto");
      broadcastUpdates();
    }, 240000); // 4 min
  }
});

fs.watchFile(absolutePathEstrutura, { interval: 500 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log("Arquivo estrutura alterado");
    if (timeoutIdEstrutura) {
      clearTimeout(timeoutIdEstrutura);
    } else {
      broadcastUpdates();
    }

    timeoutIdEstrutura = setTimeout(() => {
      console.log("Arquivo pronto");
      broadcastUpdates();
    }, 10000); // 10 seg
  }
});
