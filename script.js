async function loadOntology() {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return alert("Please enter a URL");

  try {
    const response = await fetch(url);
    const data = await response.text();

    const parser = new N3.Parser();
    const triples = [];
    parser.parse(data, (error, triple, prefixes) => {
      if (triple) triples.push(triple);
    });

    const nodes = new Map();
    const edges = [];

    for (const { subject, predicate, object } of triples) {
      if (!nodes.has(subject)) nodes.set(subject, { id: subject, label: subject });
      if (!nodes.has(object)) nodes.set(object, { id: object, label: object });

      edges.push({
        from: subject,
        to: object,
        label: predicate
      });
    }

    const container = document.getElementById('network');
    const network = new vis.Network(container, {
      nodes: Array.from(nodes.values()),
      edges
    }, {
      nodes: {
        shape: 'dot',
        size: 10,
        font: { size: 12 },
      },
      edges: {
        arrows: 'to',
        font: { align: 'top' }
      },
      physics: {
        stabilization: true
      }
    });

  } catch (e) {
    console.error(e);
    alert("Failed to load or parse ontology.");
  }
}
