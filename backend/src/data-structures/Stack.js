/**
 * Stack Implementation
 * 
 * WHY CHOSEN:
 * A Stack follows Last-In-First-Out (LIFO) principle. It is the textbook data structure 
 * for implementing "Undo" functionality. We use it to allow the doctor to undo their 
 * most recent advice entries.
 * 
 * TIME COMPLEXITIES:
 * - push(item): O(1)
 * - pop(): O(1)
 * - peek(): O(1)
 */

class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

module.exports = Stack;
