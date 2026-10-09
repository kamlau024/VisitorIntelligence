/*
 * Visitor Intelligence — embeddable widget loader.
 * CMS-agnostic: drop one <script src=".../vi-widget.js" data-site-id="..."> on any
 * site (WordPress, Squarespace, Ghost, Webflow, Shopify, plain HTML). It self-mounts
 * into an isolated Shadow DOM so it cannot clash with the host theme's styles.
 *
 * This is the real embed mechanism used to prove the install model. The rich product
 * UI lives in the React app; this standalone build carries a faithful subset.
 */
(function () {
  "use strict";
  if (window.__viWidgetMounted) return;
  window.__viWidgetMounted = true;

  // Escape for HTML text/attribute contexts. The widget builds markup with
  // innerHTML, so anything sourced from the host page must pass through here.
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var script = document.currentScript;
  var siteId = (script && script.getAttribute("data-site-id")) || "demo";
  // Every use of `brand` below is an HTML sink, so it is stored pre-escaped.
  var brand = esc((script && script.getAttribute("data-brand")) || "Maya");

  // --- tiny knowledge base (mirrors the app's canned answers) ---
  var SUGGESTIONS = [
    "I don't have a Dutch oven — what can I use?",
    "No buttermilk. What's the best swap?",
    "Can I make this dairy-free?",
    "How do I adjust the bread for high altitude?"
  ];
  var ANSWERS = [
    {
      match: ["dutch oven", "pot", "no dutch"],
      text: [
        "You don't strictly need one! The Dutch oven just traps steam so the crust sets slowly. Any heavy oven-safe pot with a tight lid will get you most of the way there.",
        "That said, if you bake even a few times a year, an enameled one is the single tool I'd actually buy — it's what I've used for every loaf here."
      ],
      confidence: "high",
      cites: 2,
      affiliate: { product: "Lodge 6qt Enameled Dutch Oven", price: "$79.90", retailer: "Amazon", since: 2019 }
    },
    {
      match: ["buttermilk", "butter milk"],
      text: [
        "Easy fix: stir 1 tbsp lemon juice or white vinegar into 1 cup of regular milk and let it sit 5 minutes until slightly curdled. Same tang and lift in the pancakes.",
        "Plain yogurt thinned with milk works too, but the lemon-milk trick is the one I reach for first."
      ],
      confidence: "high",
      cites: 1
    },
    {
      match: ["dairy", "lactose", "without cream"],
      text: [
        "Yes — unsweetened oat cream or cashew cream both hold up well and won't split if you keep it at a gentle simmer. I'd skip coconut milk here unless you like a hint of coconut."
      ],
      confidence: "medium",
      cites: 1
    },
    {
      match: ["altitude", "elevation", "denver", "6000", "ft"],
      text: [
        "I want to be straight with you — I bake at sea level, so I don't have a tested high-altitude version of this loaf. The usual starting points are slightly less yeast and a touch more water, but I'd rather not guess exact numbers for your elevation."
      ],
      confidence: "low",
      cites: 1
    }
  ];
  var FALLBACK = {
    text: ["That's a great question — and I don't want to give you a confident answer I haven't tested. Here's my best general take, but you may want to ask " + brand + " directly to be sure."],
    confidence: "low",
    cites: 0
  };
  function findAnswer(q) {
    q = q.toLowerCase();
    for (var i = 0; i < ANSWERS.length; i++) {
      var a = ANSWERS[i];
      for (var j = 0; j < a.match.length; j++) {
        if (q.indexOf(a.match[j]) !== -1) return a;
      }
    }
    return FALLBACK;
  }

  // --- shadow host ---
  var host = document.createElement("div");
  host.id = "vi-widget-host";
  host.setAttribute("data-site-id", siteId);
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  var CONF = {
    high: { label: "High confidence", color: "#5c7c5a", bars: 3 },
    medium: { label: "Medium confidence", color: "#b07d2b", bars: 2 },
    low: { label: "Low confidence", color: "#a8634a", bars: 1 }
  };

  var css =
    ":host{all:initial}" +
    "*{box-sizing:border-box;font-family:'Hanken Grotesk',ui-sans-serif,system-ui,-apple-system,sans-serif}" +
    ".launcher{position:fixed;bottom:20px;right:20px;z-index:2147483000;display:flex;align-items:center;gap:9px;background:#c2552f;color:#fbf7f0;border:none;border-radius:999px;padding:12px 16px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 8px 30px -8px rgba(194,85,47,.6);transition:transform .15s}" +
    ".launcher:hover{transform:scale(1.03)}" +
    ".panel{position:fixed;bottom:88px;right:20px;z-index:2147483000;width:380px;max-width:calc(100vw - 40px);height:560px;max-height:calc(100vh - 130px);display:flex;flex-direction:column;background:#fffdf9;border:1px solid #e7ded1;border-radius:16px;overflow:hidden;box-shadow:0 24px 60px -28px rgba(33,28,24,.45);animation:rise .4s cubic-bezier(.22,1,.36,1)}" +
    "@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
    ".hidden{display:none}" +
    ".hd{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#fbf7f0;border-bottom:1px solid #e7ded1}" +
    ".av{width:36px;height:36px;border-radius:999px;background:#f3e0d4;display:flex;align-items:center;justify-content:center;flex-shrink:0}" +
    ".hd .t{font-size:14px;font-weight:600;color:#211c18;line-height:1.2}" +
    ".hd .s{font-size:12px;color:#6f655b}" +
    ".x{margin-left:auto;background:none;border:none;cursor:pointer;color:#9c9085;padding:4px;border-radius:6px;font-size:18px;line-height:1}" +
    ".body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}" +
    ".row{display:flex;gap:10px}" +
    ".row.me{justify-content:flex-end}" +
    ".bot-av{width:28px;height:28px;border-radius:999px;background:#f3e0d4;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}" +
    ".bub{font-size:14px;line-height:1.55;color:#211c18}" +
    ".bub.bot{background:#f6f1e9;border:1px solid #e7ded1;border-radius:16px 16px 16px 4px;padding:11px 14px;max-width:84%}" +
    ".bub.me{background:#211c18;color:#fbf7f0;border-radius:16px 16px 4px 16px;padding:8px 14px;max-width:82%}" +
    ".bub p+p{margin-top:10px}" +
    ".chip{display:flex;align-items:center;gap:10px;margin-top:12px;border:1px solid #e7ded1;background:#fffdf9;border-radius:10px;padding:8px 10px;text-decoration:none}" +
    ".chip .ic{width:32px;height:32px;border-radius:8px;background:#f3e0d4;color:#c2552f;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}" +
    ".chip .pn{font-size:13px;font-weight:600;color:#211c18;display:block}" +
    ".chip .pm{font-size:11px;color:#6f655b}" +
    ".meta{display:flex;align-items:center;gap:8px;padding:0 4px;margin-top:8px}" +
    ".bars{display:flex;align-items:flex-end;gap:3px}" +
    ".bars i{width:5px;border-radius:2px;background:#d8ccba}" +
    ".bars i:nth-child(1){height:8px}.bars i:nth-child(2){height:10px}.bars i:nth-child(3){height:12px}" +
    ".cl{font-size:12px;font-weight:600}" +
    ".cite{font-size:11px;color:#9c9085;margin-left:auto}" +
    ".sug{display:flex;flex-wrap:wrap;gap:8px;padding-left:38px}" +
    ".sug button{border:1px solid #d8ccba;background:#fffdf9;color:#211c18;border-radius:999px;padding:6px 12px;font-size:12px;cursor:pointer;text-align:left}" +
    ".sug button:hover{border-color:rgba(194,85,47,.4);background:rgba(243,224,212,.4)}" +
    ".bounty{display:flex;gap:8px;align-items:flex-start;margin-top:6px;border:1px dashed rgba(168,99,74,.4);background:rgba(241,226,217,.5);border-radius:10px;padding:8px 12px;font-size:12px;color:#a8634a;cursor:pointer;width:100%;text-align:left}" +
    ".typing{display:flex;gap:4px;background:#f6f1e9;border:1px solid #e7ded1;border-radius:16px 16px 16px 4px;padding:13px 16px}" +
    ".typing i{width:6px;height:6px;border-radius:999px;background:#9c9085;animation:bd 1.2s infinite}" +
    ".typing i:nth-child(2){animation-delay:.16s}.typing i:nth-child(3){animation-delay:.32s}" +
    "@keyframes bd{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}" +
    ".ft{display:flex;gap:8px;padding:12px;border-top:1px solid #e7ded1;background:#fbf7f0}" +
    ".ft input{flex:1;height:40px;border:1px solid #d8ccba;border-radius:10px;padding:0 12px;font-size:14px;background:#fffdf9;color:#211c18;outline:none}" +
    ".ft input:focus{border-color:#c2552f}" +
    ".ft button{width:40px;height:40px;border:none;border-radius:10px;background:#c2552f;color:#fbf7f0;cursor:pointer;font-size:16px}" +
    ".pb{font-size:10px;color:#9c9085;text-align:center;padding:6px;border-top:1px solid #e7ded1;background:#fffdf9}";

  var bubbleSvg =
    "<svg viewBox='0 0 32 32' width='20' height='20'><path d='M6 4.5h20a3.5 3.5 0 0 1 3.5 3.5v12a3.5 3.5 0 0 1-3.5 3.5H13.2L7 27.2a.7.7 0 0 1-1.2-.5V23.5H6A3.5 3.5 0 0 1 2.5 20V8A3.5 3.5 0 0 1 6 4.5Z' fill='#c2552f'/><rect x='9' y='15.5' width='2.6' height='3.5' rx='1.3' fill='#fbf7f0'/><rect x='14.7' y='12' width='2.6' height='7' rx='1.3' fill='#fbf7f0'/><rect x='20.4' y='8.5' width='2.6' height='10.5' rx='1.3' fill='#fbf7f0'/></svg>";

  root.innerHTML =
    "<style>" + css + "</style>" +
    "<button class='launcher' id='vi-launch'>" + bubbleSvg + "<span>Ask " + brand + "</span></button>" +
    "<div class='panel hidden' id='vi-panel'>" +
      "<div class='hd'><span class='av'>" + bubbleSvg + "</span>" +
        "<div><div class='t'>Ask " + brand + "</div><div class='s'>Answers from The Weeknight Kitchen</div></div>" +
        "<button class='x' id='vi-close'>&times;</button></div>" +
      "<div class='body' id='vi-body'></div>" +
      "<form class='ft' id='vi-form'><input id='vi-input' placeholder='Ask about this recipe…' autocomplete='off'/>" +
        "<button type='submit'>&#8593;</button></form>" +
      "<div class='pb'>Powered by Visitor Intelligence</div>" +
    "</div>";

  var panel = root.getElementById("vi-panel");
  var body = root.getElementById("vi-body");
  var input = root.getElementById("vi-input");
  var started = false;

  function toggle(force) {
    var show = typeof force === "boolean" ? force : panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !show);
    if (show && !started) { started = true; greet(); }
    if (show) setTimeout(function () { input.focus(); }, 50);
  }
  root.getElementById("vi-launch").addEventListener("click", function () { toggle(); });
  root.getElementById("vi-close").addEventListener("click", function () { toggle(false); });

  function scroll() { body.scrollTop = body.scrollHeight; }

  function greet() {
    var wrap = document.createElement("div");
    var r = document.createElement("div");
    r.className = "row";
    r.innerHTML = "<span class='bot-av'>" + bubbleSvg + "</span><div class='bub bot'>Hi! I'm " + brand +
      "'s kitchen assistant. Ask me anything about this recipe — substitutions, equipment, make-ahead.</div>";
    wrap.appendChild(r);
    var sug = document.createElement("div");
    sug.className = "sug";
    SUGGESTIONS.forEach(function (q) {
      var b = document.createElement("button");
      b.textContent = q;
      b.addEventListener("click", function () { ask(q); });
      sug.appendChild(b);
    });
    wrap.appendChild(sug);
    body.appendChild(wrap);
    scroll();
  }

  function addMe(text) {
    var r = document.createElement("div");
    r.className = "row me";
    var b = document.createElement("div");
    b.className = "bub me";
    b.textContent = text;
    r.appendChild(b);
    body.appendChild(r);
    scroll();
  }

  function addTyping() {
    var r = document.createElement("div");
    r.className = "row";
    r.id = "vi-typing";
    r.innerHTML = "<span class='bot-av'>" + bubbleSvg + "</span><div class='typing'><i></i><i></i><i></i></div>";
    body.appendChild(r);
    scroll();
  }

  function addAnswer(a, q) {
    var r = document.createElement("div");
    r.className = "row";
    var conf = CONF[a.confidence];
    var paras = a.text.map(function (p) { return "<p>" + p + "</p>"; }).join("");
    var chip = a.affiliate
      ? "<a class='chip' href='#' onclick='return false'><span class='ic'>&#8599;</span><span><span class='pn'>" +
        a.affiliate.product + "</span><span class='pm'>" + a.affiliate.price + " at " + a.affiliate.retailer +
        (a.affiliate.since ? " · author's pick since " + a.affiliate.since : "") + "</span></span></a>"
      : "";
    var bars = "<span class='bars'><i" + (conf.bars >= 1 ? " style='background:" + conf.color + "'" : "") +
      "></i><i" + (conf.bars >= 2 ? " style='background:" + conf.color + "'" : "") +
      "></i><i" + (conf.bars >= 3 ? " style='background:" + conf.color + "'" : "") + "></i></span>";
    var cite = a.cites ? "<span class='cite'>from " + a.cites + " of " + brand + "'s posts</span>" : "";
    var bounty = a.confidence === "low"
      ? "<button class='bounty' id='vi-bounty'>&#128176; <span><b>Not fully sure on this one.</b> Ask " + brand + " directly — $3, usually within 24h.</span></button>"
      : "";
    r.innerHTML = "<span class='bot-av'>" + bubbleSvg + "</span><div style='flex:1;min-width:0'>" +
      "<div class='bub bot'>" + paras + chip + "</div>" +
      "<div class='meta'>" + bars + "<span class='cl' style='color:" + conf.color + "'>" + conf.label + "</span>" + cite + "</div>" +
      bounty + "</div>";
    body.appendChild(r);
    var bb = root.getElementById("vi-bounty");
    if (bb) bb.addEventListener("click", function () {
      bb.outerHTML = "<div class='bounty' style='color:#5c7c5a;border-color:rgba(92,124,90,.4);background:rgba(231,238,222,.6)'>&#10003; Sent to " + brand + "! You'll be emailed when she answers (and only charged then).</div>";
      scroll();
    });
    scroll();
  }

  function ask(q) {
    if (!q || !q.trim()) return;
    addMe(q);
    input.value = "";
    addTyping();
    setTimeout(function () {
      var t = root.getElementById("vi-typing");
      if (t) t.remove();
      addAnswer(findAnswer(q), q);
    }, 1000);
  }

  root.getElementById("vi-form").addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value);
  });
})();
