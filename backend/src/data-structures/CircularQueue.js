/**
 * Circular Queue Implementation
 * 
 * WHY CHOSEN:
 * A Circular Queue efficiently manages a fixed number of daily appointment slots.
 * It operates in a ring-like fashion, recycling spaces vacated by completed 
 * appointments without needing to shift elements in an array. This avoids the O(N) 
 * shifting overhead and perfectly models a recurring schedule limit.
 * 
 * TIME COMPLEXITIES:
 * - enqueue(item): O(1)
 * - dequeue(): O(1)
 * - isFull(): O(1)
 * - isEmpty(): O(1)
 */

class CircularQueue {
  constructor(capacity) {
    this.capacity = capacity;
    this.queue = new Array(capacity);
    this.head = -1;
    this.tail = -1;
    this.size = 0;
  }

  isFull() {
    return this.size === this.capacity;
  }

  isEmpty() {
    return this.size === 0;
  }

  enqueue(item) {
    if (this.isFull()) return false;
    
    if (this.isEmpty()) {
      this.head = 0;
      this.tail = 0;
    } else {
      this.tail = (this.tail + 1) % this.capacity;
    }
    
    this.queue[this.tail] = item;
    this.size++;
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    
    const item = this.queue[this.head];
    this.queue[this.head] = null;
    
    if (this.head === this.tail) {
      this.head = -1;
      this.tail = -1;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
    
    this.size--;
    return item;
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.queue[this.head];
  }
  
  getSlots() {
    const slots = [];
    if (this.isEmpty()) return slots;
    
    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      slots.push(this.queue[current]);
      current = (current + 1) % this.capacity;
    }
    return slots;
  }
}

module.exports = CircularQueue;
