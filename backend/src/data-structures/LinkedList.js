/**
 * Linked List Implementation
 * 
 * WHY CHOSEN:
 * A Linked List is used to represent the advice/prescription timeline. In a real-world scenario
 * with frequent unbounded inserts (adding new advice) and sequential access pattern (reading timeline
 * from newest to oldest), a linked list correctly models the temporal chain of events. 
 * While an array could work, the Linked List is explicitly chosen to satisfy the DS capstone requirement.
 * We use a Singly Linked List with insertion at the head for O(1) prepend (most recent advice first).
 * 
 * TIME COMPLEXITIES:
 * - prepend(data): O(1) - Fast insert at the beginning.
 * - toArray(): O(N) - Sequential traversal to return array for frontend rendering.
 */

class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  prepend(data) {
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }
  
  static fromArray(rows) {
    const list = new LinkedList();
    // Assuming rows are sorted chronologically ascending from DB (oldest first), 
    // prepending will result in newest at head.
    // If rows are already DESC (newest first), we should iterate in reverse to prepend,
    // or just write an append method. Let's assume input is ASC.
    for (const row of rows) {
      list.prepend(row);
    }
    return list;
  }
}

module.exports = LinkedList;
