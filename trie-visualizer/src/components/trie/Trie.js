export class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }

  contains(ch) {
    return this.children[ch] !== undefined;
  }

  getNextNode(ch) {
    return this.children[ch];
  }

  putNewNode(ch, newNode) {
    this.children[ch] = newNode;
  }

  setIsEnd() {
    this.isEnd = true;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.contains(ch)) {
        node.putNewNode(ch, new TrieNode());
      }
      node = node.getNextNode(ch);
    }
    node.setIsEnd();
  }
}
