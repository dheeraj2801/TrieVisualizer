import React, { useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import { Trie } from "./trie/Trie";

export default function TrieVisualizer() {
  const [word, setWord] = useState("");
  const [query, setQuery] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showHelp, setShowHelp] = useState(true); // show on initial load
  const [trie] = useState(new Trie());

  const TrieHelpModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2>What is a Trie?</h2>
          <p>
            A <strong>Trie</strong> (pronounced "try") is a tree-like data
            structure used for storing strings. It’s great for prefix-based
            search like autocomplete or dictionaries.
          </p>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/be/Trie_example.svg"
            alt="Trie Diagram"
            style={{ width: "250px", borderRadius: "8px", margin: "10px 0" }}
          />
          <br />
          <button onClick={onClose} style={styles.button}>
            Close
          </button>
        </div>
      </div>
    );
  };

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      color: "black",
    },
    modal: {
      background: "#fff",
      padding: "2rem",
      borderRadius: "10px",
      width: "500px",
      maxWidth: "90%",
      textAlign: "center",
      color: "black",
    },
    button: {
      marginTop: "1rem",
      padding: "0.5rem 1rem",
      backgroundColor: "#3b82f6",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginBottom: "auto",
    },
  };

  const highlightNode = async (nodeId, delayMs = 1000) => {
    // Step 1: Highlight the node
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: { ...node.data, highlighted: true },
              style: {
                ...node.style,
                border: "3px solid yellow",
                background: "#fef08a",
              },
            }
          : node
      )
    );

    // ✅ Step 2: Wait to show highlight
    await new Promise((res) => setTimeout(res, delayMs));

    // Step 3: Reset highlight
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: { ...node.data, highlighted: false },
              style: {
                ...node.style,
                border: "1px solid #333",
                background: node.data.isEnd ? "#34d399" : "#93c5fd",
              },
            }
          : node
      )
    );
  };

  const findChildWithChar = (curNodeId, char) => {
    for (const edge of edges) {
      if (edge.source === curNodeId) {
        const childNodeId = edge.target;
        const childNode = nodes.find(
          (node) => node.id === childNodeId && node.data.label === char
        );
        if (childNode) {
          return childNode.id;
        }
      }
    }
    return false;
  };

  const searchWord = async (query) => {
    let curNodeId = nodes.find((node) => node.data.label === "root")?.id;
    console.log(curNodeId);
    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      const nextNodeId = findChildWithChar(curNodeId, char); // implement this
      console.log(nextNodeId);
      if (!nextNodeId) {
        // Highlight fail
        await highlightNode(curNodeId);
        await alert("Character not found");
        return;
      }

      await highlightNode(nextNodeId); // animate the step
      curNodeId = nextNodeId;
    }

    // ✅ Check if current node isEnd === true
    const lastNode = nodes.find((node) => node.id === curNodeId);
    if (lastNode?.data?.isEnd) {
      alert("✅ Word found!");
    } else {
      alert("❌ Only a prefix found, not a complete word");
    }
  };

  const insertAndBuild = () => {
    if (!word) return;
    trie.insert(word);

    const newNodes = [];
    const newEdges = [];

    let nodeId = 0;

    const traverse = (
      node,
      parentId = null,
      char = "root",
      depth = 0,
      xOffset = { x: 0 }
    ) => {
      const curNodeId = `node-${nodeId++}`;

      const positionOfNode = {
        x: xOffset.x * 50, // dynamically updated per subtree
        y: depth * 120,
      };

      newNodes.push({
        id: curNodeId,
        type: "default",
        position: positionOfNode,
        data: { label: char, highlighted: false, isEnd: node.isEnd },
        style: {
          background: node.isEnd ? "#34d399" : "#93c5fd",
          border: "1px solid #333",
          borderRadius: 50,
          padding: 10,
        },
      });

      if (parentId) {
        newEdges.push({
          id: `${parentId}-${curNodeId}`,
          type: "default",
          source: parentId,
          target: curNodeId,
          // animated: true,
        });
      }

      const childEntries = Object.entries(node.children);
      const startX = xOffset.x;

      for (const [childChar, childNode] of childEntries) {
        traverse(childNode, curNodeId, childChar, depth + 1, xOffset);
        xOffset.x++;
      }

      // const endX = xOffset.x;
      // const midX = (startX + endX - 1) / 2;
      // newNodes[newNodes.length - 1].position.x = midX * 50;;
    };

    traverse(trie.root);
    setNodes(newNodes);
    setEdges(newEdges);
    setWord("");
  };

  return (
    <div>
      <input
        placeholder="Enter a word to Insert"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            insertAndBuild();
          }
        }}
        style={{ padding: "8px", marginRight: "8px" }}
      />
      <button
        onClick={insertAndBuild}
        style={{ padding: "8px" }}
      >
        Insert
      </button>
      {/* <br />
      <input
        placeholder="Enter a word to Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "8px", marginRight: "8px" }}
      />
      <button onClick={searchWord} style={{ padding: "8px" }}>
        Search
      </button> */}
      <div
        style={{
          height: "100vh",
          width: "1000px",
          marginTop: "20px",
          border: "1px solid white",
        }}
      >
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <TrieHelpModal show={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
