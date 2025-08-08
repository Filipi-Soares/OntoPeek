async function loadOntology() {
  const url = document.getElementById('urlInput').value.trim();
  const status = document.getElementById('status');
  const container = document.getElementById('network');

  if (!url) return alert("Please enter a URL");

  // Show loading message
  status.textContent = "Fetching and parsing ontology... Please wait.";
  container.innerHTML = ''; // Clear previous graph

  try {
    const response = await fetch(url);
    const data = await response.text();

    const parser = new N3.Parser();
    const triples = [];
    parser.parse(data, (error, triple, prefixes) => {
      if (triple) triples.push(triple);
    });

    if (triples.length === 0) {
      status.textContent = "No triples found. Check file format.";
      return;
    }

    status.textContent = `Parsed ${triples.length} triples. Building visualization...`;

    const nodes = new Map();
    const edges = [];

    for (const { subject, predicate, object } of triples) {
      if (!nodes.has(subject)) nodes.set(subject, { id: subject, label: shorten(subject) });
      if (!nodes.has(object)) nodes.set(object, { id: object, label: shorten(object) });

      edges.push({
        from: subject,
        to: object,
        label: shorten(predicate)
      });
    }

    const network = new vis.Network(container, {
      nodes: Array.from(nodes.values()),
      edges
    }, {
      nodes: {
        shape: 'dot',
        size: 10,
        font: { size: 12 }
      },
      edges: {
        arrows: 'to',
        font: { align: 'top' }
      },
      physics: { stabilization: true }
    });

    status.textContent = `Visualization complete: ${nodes.size} nodes, ${edges.length} edges.`;

  } catch (e) {
    console.error(e);
    status.textContent = "❌ Failed to load or parse ontology. See console for details.";
  }
}

// Optional: Shorten long URIs for display
function shorten(uri) {
  return uri.includes('#') ? uri.split('#').pop() :
         uri.includes('/') ? uri.split('/').pop() : uri;
}
