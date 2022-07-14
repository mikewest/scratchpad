function hideThisFunction() {
  // Not hiding anything.
  generateStack('Default');

  // setTimeout
  setTimeout(_ => { generateStack('setTimeout'); }, 1);

  // event handler
  let i = document.createElement('img');
  i.onerror = _ => generateStack('onerror');
  i.src = "file:///a";

  // postMessage
  window.onmessage = _ => { generateStack('postmessage'); };
  window.postMessage("Hi.", "*");

  // <script>
  generateStackThroughScriptTag('<script>');

  // setTimeout + <script>
  setTimeout(_ => { generateStackThroughScriptTag('setTimeout + <script>'); }, 1);

  // onerror + <script>
  let i2 = document.createElement('img');
  i2.onerror = _ => { generateStackThroughScriptTag('onerror + <script>'); };
  i2.src = "file:///b";

  // <script> + blob
  generateStackThroughBlob('<script src="blob:">');

  // setTimeout + <script> + blob
  setTimeout(_ => { generateStackThroughBlob('setTimeout + <script src="blob:">'); }, 1);

  // onerror + <script> + blob
  let i3 = document.createElement('img');
  i3.onerror = _ => { generateStackThroughBlob('onerror + <script src="blob:">'); };
  i3.src = "file:///b";

  // <script> + data
  generateStackThroughData('<script src="data:">');

  // setTimeout + <script> + data
  setTimeout(_ => { generateStackThroughData('setTimeout + <script src="data:">'); }, 1);

  // onerror + <script> + data
  let i4 = document.createElement('img');
  i4.onerror = _ => { generateStackThroughData('onerror + <script src="data:">'); };
  i4.src = "file:///b";

  // <iframe srcdoc>
  generateStackThroughFrame('<iframe srcdoc>');

  // setTimeout + <iframe srcdoc>
  setTimeout(_ => { generateStackThroughFrame('setTimeout + <iframe srcdoc>'); }, 1);

  // onerror + <script> + data
  let i5 = document.createElement('img');
  i5.onerror = _ => { generateStackThroughFrame('onerror + <iframe srcdoc>'); };
  i5.src = "file:///b";
}

function generateStackThroughScriptTag(name) {
  const s = document.createElement('script');
  s.innerText = `generateStack('${name}');`;
  s.defer = true;
  document.body.appendChild(s);
}

function generateStackThroughBlob(name) {
  const b = new Blob([`generateStack('${name}');`], {type: 'text/javascript'});
  const s = document.createElement('script');
  s.src = URL.createObjectURL(b);
  s.onload = _ => { URL.revokeObjectURL(s.src); }
  document.body.appendChild(s);
}

function generateStackThroughData(name) {
  const s = document.createElement('script');
  s.src = `data:text/javascript,generateStack('${name}');`;
  document.body.appendChild(s);
}

function generateStackThroughFrame(name) {
  const i = document.createElement('iframe');
  i.srcdoc = `<script>top.generateStack('${name}');top.document.body.querySelector('iframe').remove();</script>`;
  document.body.appendChild(i);
}

function test() {
  hideThisFunction();
}
