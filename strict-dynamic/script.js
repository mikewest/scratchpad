const out = document.createElement('output');
document.body.appendChild(out);

function log(txt) {
  out.innerText += txt + "\n";
}

function script(src) {
  const s = document.createElement('script');
  s.src = src;
  document.body.appendChild(s);
}


log("`script.js` loaded!");
script("script2.js");
