let graph = {};

function updateTable() {
  let connections = getSegments();

  let tbody = document.getElementById('tbody');
  let rowCount = tbody.childElementCount;
  if (rowCount != Object.keys(connections).length) {
    tbody.replaceChildren();

    for (let key of Object.keys(connections)) {
      let row = document.createElement('tr');
      let segment = document.createElement('td');
      let segmentName = document.createTextNode(
        connections[key].firstNode + '-' + connections[key].secondNode
      );
      segment.append(segmentName);
      row.append(segment);

      let weight = document.createElement('td');
      let weightInput = document.createElement('input');
      weightInput.setAttribute('type', 'number');
      weightInput.setAttribute('id', key);
      weightInput.setAttribute('min', '1');
      weightInput.setAttribute('placeholder', 'Segment Weight');
      weightInput.setAttribute('onchange', "updateGraph('" + key + "')");
      weightInput.value = connections[key].weight;
      weight.append(weightInput);
      row.append(weight);
      tbody.append(row);
    }
  }
  connections = {};
}

function updateGraph(key) {
  let connections = getSegments();
  let weight = document.getElementById(key).value;
  if (weight > 0) {
    connections[key].weight = weight;
    ggbApplet.setCaption(connections[key].name, connections[key].weight);
    connections = {};
  } else {
    alert('Weight cannot be less than 1!');
  }
}

function resetGraph() {
  ggbApplet.reset();
}

function resetPath() {
  let connections = getSegments();

  for (let key of Object.keys(connections)) {
    ggbApplet.setColor(connections[key].name, 0, 0, 0);
  }
  connections = {};
}

function getPath() {
  let connections = getSegments();

  let nodes = ggbApplet.getAllObjectNames('point');
  for (let i = 0; i < nodes.length; i++) {
    graph[nodes[i]] = {};
  }

  let points = getPoints();
  setNodes(points);
  setGraph(connections);
}

function getSegments() {
  let temp = {};
  let segments = ggbApplet.getAllObjectNames('segment');
  for (let i = 0; i < segments.length; i++) {
    let caption = ggbApplet.getCaption(segments[i]);
    let definition_string = ggbApplet
      .getDefinitionString(segments[i])
      .substring(8, 13);
    temp[definition_string] = {
      weight: parseInt(caption),
      name: segments[i],
      firstNode: definition_string.substring(0, 1),
      secondNode: definition_string.substring(3, 4),
    };
    temp[definition_string];
  }

  return { ...temp };
}

function getPoints() {
  let points = ggbApplet.getAllObjectNames('point');
  return points;
}

function setNodes(points) {
  for (let point of points) {
    graph[point] = {};
  }
}

function setGraph(connections) {
  for (let key of Object.keys(connections)) {
    let firstNode = connections[key].firstNode;
    let secondNode = connections[key].secondNode;
    graph[firstNode][secondNode] = connections[key].weight;
    graph[secondNode][firstNode] = connections[key].weight;
  }
}

function dijkstra() {
  resetPath();
  getPath();
  let connections = getSegments();
  console.log(Object.keys(graph).length);
  if (Object.keys(graph).length === 0) {
    alert('Get the graph first!');
  } else {
    let shortest_distance = {};
    let predecessor = {};
    let unseenNodes = graph;
    let path = [];
    let isReachable = true;
    let start, goal;
    if (document.getElementById('startNode').value != '') {
      start = document.getElementById('startNode').value;
    } else {
      alert('Insert the start node!');
    }

    if (document.getElementById('endNode').value != '') {
      goal = document.getElementById('endNode').value;
    } else {
      alert('Insert the end node!');
    }

    if (!graph[start] || !graph[goal]) {
      alert("You don't have this node in your graph!");
    }

    for (let node in unseenNodes) {
      shortest_distance[node] = Infinity;
    }
    shortest_distance[start] = 0;

    while (Object.keys(graph).length !== 0) {
      let minNode = null;
      for (node in unseenNodes) {
        if (minNode == null) {
          minNode = node;
        } else if (shortest_distance[node] < shortest_distance[minNode]) {
          minNode = node;
        }
      }

      for (let childNode in graph[minNode]) {
        let weight = graph[minNode][childNode];
        if (
          weight + shortest_distance[minNode] <
          shortest_distance[childNode]
        ) {
          shortest_distance[childNode] = weight + shortest_distance[minNode];
          predecessor[childNode] = minNode;
        }
      }
      delete unseenNodes[minNode];
    }

    currentNode = goal;
    while (currentNode != start) {
      if (!path.includes(currentNode)) {
        path.push(currentNode);
        currentNode = predecessor[currentNode];
      } else {
        console.log('Path not reachable');
        isReachable = false;
        break;
      }
    }
    if (isReachable) {
      path.push(start);
      if (shortest_distance[goal] != Infinity) {
        console.log('Shortest distance is ' + shortest_distance[goal]);
        console.log('And the path is ' + path);
      }
      for (let i = 0; i < path.length - 1; i++) {
        for (let key of Object.keys(connections)) {
          if (
            (connections[key].firstNode == path[i] ||
              connections[key].secondNode == path[i]) &&
            (connections[key].firstNode == path[i + 1] ||
              connections[key].secondNode == path[i + 1])
          ) {
            connections[key].highlight = true;
            break;
          }
        }
      }
    }
  }

  for (let key of Object.keys(connections)) {
    if (connections[key].highlight) {
      ggbApplet.setColor(connections[key].name, 255, 0, 0);
    }
  }
  connections = {};
}
