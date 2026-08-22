const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = __dirname;
const port = Number(process.env.PORT || 4173);
const annotationDataPath = path.join(projectRoot, 'assets/js/config/annotation-data.js');
const iterationDataPath = path.join(projectRoot, 'assets/js/data/project-iteration-records.js');
let iterationWriteQueue = Promise.resolve();

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function readAnnotationData() {
  try {
    const source = fs.readFileSync(annotationDataPath, 'utf8');
    const marker = 'window.PrototypeAnnotationData = ';
    const start = source.indexOf(marker);
    const generatedAssignmentEnd = source.indexOf(';\n})();', start + marker.length);
    const end = generatedAssignmentEnd >= 0
      ? generatedAssignmentEnd
      : source.lastIndexOf(';');
    if (start < 0 || end <= start) return { pages: {} };
    return JSON.parse(source.slice(start + marker.length, end).trim());
  } catch (error) {
    return { pages: {} };
  }
}

function writeAnnotationData(data) {
  const source = `(function () {\n  window.PrototypeAnnotationData = ${JSON.stringify(data, null, 2)};\n})();\n`;
  fs.writeFileSync(annotationDataPath, source, 'utf8');
}

function readIterationData() {
  try {
    const source = fs.readFileSync(iterationDataPath, 'utf8');
    const marker = 'window.ProjectIterationData = ';
    const start = source.indexOf(marker);
    const generatedAssignmentEnd = source.indexOf(';\n})();', start + marker.length);
    const end = generatedAssignmentEnd >= 0
      ? generatedAssignmentEnd
      : source.lastIndexOf(';');
    if (start < 0 || end <= start) return { schemaVersion: '20260822-4', records: [] };
    return JSON.parse(source.slice(start + marker.length, end).trim());
  } catch (error) {
    return { schemaVersion: '20260822-4', records: [] };
  }
}

function writeIterationData(data) {
  const output = {
    ...data,
    schemaVersion: data.schemaVersion || '20260822-4',
    records: Array.isArray(data.records) ? data.records : []
  };
  if (Array.isArray(data.platforms)) output.platforms = data.platforms;
  const source = `(function () {\n  window.ProjectIterationData = ${JSON.stringify(output, null, 2)};\n})();\n`;
  fs.writeFileSync(iterationDataPath, source, 'utf8');
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(body));
}

function serveStatic(request, response) {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const filePath = path.resolve(projectRoot, relativePath);
  if (!filePath.startsWith(`${projectRoot}${path.sep}`)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': filePath === annotationDataPath ? 'no-store' : 'no-cache',
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

function saveAnnotation(request, response) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1024 * 1024) request.destroy();
  });
  request.on('end', () => {
    try {
      const payload = JSON.parse(body || '{}');
      const pageKey = typeof payload.pageKey === 'string' ? payload.pageKey.trim() : '';
      const definition = payload.definition && typeof payload.definition === 'object'
        ? payload.definition
        : null;
      const isDeletion = definition?.deleted === true;
      if (!pageKey || !definition?.id || (!isDeletion && (!definition.title || !Array.isArray(definition.items)))) {
        sendJson(response, 400, { error: 'Invalid annotation payload' });
        return;
      }
      const data = readAnnotationData();
      data.pages = data.pages && typeof data.pages === 'object' ? data.pages : {};
      const pageDefinitions = Array.isArray(data.pages[pageKey]) ? data.pages[pageKey] : [];
      const index = pageDefinitions.findIndex((item) => item?.id === definition.id);
      if (index >= 0) pageDefinitions[index] = definition;
      else pageDefinitions.push(definition);
      data.pages[pageKey] = pageDefinitions;
      writeAnnotationData(data);
      sendJson(response, 200, { ok: true, definition });
    } catch (error) {
      sendJson(response, 400, { error: 'Unable to save annotation code' });
    }
  });
}

function saveIterationData(request, response) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1024 * 1024) request.destroy();
  });
  request.on('end', () => {
    try {
      const payload = JSON.parse(body || '{}');
      const kind = payload.kind === 'platforms' ? 'platforms' : payload.kind === 'records' ? 'records' : '';
      if (!kind || !Array.isArray(payload.value)) {
        sendJson(response, 400, { error: 'Invalid iteration payload' });
        return;
      }
      const value = JSON.parse(JSON.stringify(payload.value));
      const write = iterationWriteQueue.then(() => {
        const data = readIterationData();
        data[kind] = value;
        writeIterationData(data);
        return value;
      });
      iterationWriteQueue = write.catch(() => {});
      write
        .then((savedValue) => sendJson(response, 200, { ok: true, kind, value: savedValue }))
        .catch(() => sendJson(response, 500, { error: 'Unable to save iteration code' }));
    } catch (error) {
      sendJson(response, 400, { error: 'Unable to save iteration code' });
    }
  });
}

const server = http.createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    response.end();
    return;
  }
  if (request.method === 'POST' && request.url?.split('?')[0] === '/__annotation-code-save') {
    saveAnnotation(request, response);
    return;
  }
  if (request.method === 'POST' && request.url?.split('?')[0] === '/__iteration-code-save') {
    saveIterationData(request, response);
    return;
  }
  if (request.method === 'GET') {
    serveStatic(request, response);
    return;
  }
  sendJson(response, 405, { error: 'Method not allowed' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Procurement demo server: http://127.0.0.1:${port}`);
});
