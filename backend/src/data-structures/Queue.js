/**
 * Queue Implementation
 * 
 * WHY CHOSEN:
 * A standard Queue follows First-In-First-Out (FIFO) principle. It is used to buffer and 
 * process background events sequentially, such as incoming SOS notifications before 
 * they are dispatched to connected clients. Using a dedicated queue prevents event dropping
 * and handles traffic bursts.
 * 
 * TIME COMPLEXITIES:
 * - enqueue(item): O(1) amortized
 * - dequeue(): O(1) amortized (if implemented via Linked List or two stacks)
 * Note: To keep it simple, we use a basic JS array, though shift() is O(N). For a true O(1) 
 * dequeue, we implement a pointer-based array queue.
 */

class Queue {
  constructor() {
    this.items = [];
    this.headIndex = 0;
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items[this.headIndex];
    this.items[this.headIndex] = null; // Free memory
    this.headIndex++;
    
    // Reset if it gets too sparse to save memory
    if (this.headIndex > 100 && this.headIndex > this.items.length / 2) {
      this.items = this.items.slice(this.headIndex);
      this.headIndex = 0;
    }
    return item;
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.headIndex];
  }

  isEmpty() {
    return this.headIndex >= this.items.length;
  }
}

module.exports = Queue;
