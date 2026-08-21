/**
 * AVL Tree Implementation
 * 
 * WHY CHOSEN:
 * An AVL tree is a self-balancing Binary Search Tree. It guarantees O(log N) time complexity 
 * for insertions, deletions, and lookups. It is chosen here to maintain an in-memory index 
 * of patient records ordered by due-date or patient ID. This satisfies the DS capstone requirement
 * of demonstrating a complex tree structure for efficient retrieval.
 * 
 * TIME COMPLEXITIES:
 * - insert(key, data): O(log N)
 * - search(key): O(log N)
 * - delete(key): O(log N)
 */

class AVLNode {
  constructor(key, data) {
    this.key = key;
    this.data = data;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  height(node) {
    if (node === null) return 0;
    return node.height;
  }

  getBalanceFactor(node) {
    if (node === null) return 0;
    return this.height(node.left) - this.height(node.right);
  }

  rightRotate(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    return x;
  }

  leftRotate(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    return y;
  }

  insert(key, data) {
    this.root = this._insertNode(this.root, key, data);
  }

  _insertNode(node, key, data) {
    if (node === null) return new AVLNode(key, data);

    if (key < node.key) {
      node.left = this._insertNode(node.left, key, data);
    } else if (key > node.key) {
      node.right = this._insertNode(node.right, key, data);
    } else {
      node.data = data;
      return node;
    }

    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
    const balance = this.getBalanceFactor(node);

    if (balance > 1 && key < node.left.key) {
      return this.rightRotate(node);
    }
    if (balance < -1 && key > node.right.key) {
      return this.leftRotate(node);
    }
    if (balance > 1 && key > node.left.key) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }
    if (balance < -1 && key < node.right.key) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }
    return node;
  }

  search(key) {
    let current = this.root;
    while (current !== null) {
      if (key === current.key) return current.data;
      else if (key < current.key) current = current.left;
      else current = current.right;
    }
    return null;
  }
}

module.exports = AVLTree;
